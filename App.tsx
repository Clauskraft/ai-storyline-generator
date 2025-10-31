import React from 'react';
import { AppProvider, useAppContext, useNavigation, useProject, useUI } from './contexts/AppContext';
import { StorylineSlide, generateStorylineFromTemplate, extractStorylineFromUpload } from './services/geminiService';
import { extractTextFromFile } from './services/importService';
import { WandSparklesIcon, SaveIcon, SettingsIcon } from './components/Icons';
import Step0Welcome from './components/Step0_Welcome';
import Step1Input from './components/Step1_Input';
import Step2Storyline from './components/Step2_Storyline';
import Step3Slides from './components/Step3_Slides';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';

// Main App Content (wrapped by provider)
function AppContent() {
  const { currentStep, brandKit } = useAppContext();
  const { restart, goToStep } = useNavigation();
  const { saveProject, isProjectSaved, hasSavedProject, loadProject } = useProject();
  const { loadingState, error, setError, setLoadingState, clearError } = useUI();
  const { setStoryline, setRawText, setContextInfo } = useAppContext();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

  const handleTemplateSelected = async (templateType: string) => {
    clearError();
    setLoadingState({ isLoading: true, message: `Generating storyline from "${templateType}" template...` });
    try {
      const generatedStoryline = await generateStorylineFromTemplate(templateType);
      setStoryline(generatedStoryline);
      goToStep(2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate from template: ${errorMessage}`);
      goToStep(0);
    } finally {
      setLoadingState({ isLoading: false, message: '' });
    }
  };

  const handleFileUploaded = async (file: File) => {
    clearError();
    setLoadingState({ isLoading: true, message: `Analyzing uploaded file "${file.name}"...` });
    try {
      const textContent = await extractTextFromFile(file);
      const extractedStoryline = await extractStorylineFromUpload(textContent);
      setRawText(textContent);
      setContextInfo({ text: null, source: `Uploaded File: ${file.name}`, audience: '', goal: '' });
      setStoryline(extractedStoryline);
      goToStep(2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process uploaded file: ${errorMessage}`);
      goToStep(0);
    } finally {
      setLoadingState({ isLoading: false, message: '' });
    }
  };

  const handleStartNew = () => {
    goToStep(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Input />; // Now uses context hooks
      case 2:
        return <Step2Storyline />; // Now uses context hooks
      case 3:
        return <Step3Slides />; // Now uses context hooks
      default:
        return <div>Invalid Step</div>;
    }
  };

  const getStepClass = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'bg-[var(--color-primary)] border-[var(--color-primary)]';
    if (stepNumber === currentStep) return 'bg-[color:var(--color-primary)]/20 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]';
    return 'bg-gray-700 border-gray-600';
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 border-4 border-t-[var(--color-primary)] border-gray-600 rounded-full animate-spin"></div>
              <p className="text-[var(--color-primary)] font-medium text-center">{loadingState.message}</p>
            </div>
          </div>
        )}

        {currentStep === 0 ? (
          <Step0Welcome
            onStartNew={handleStartNew}
            onTemplateSelect={handleTemplateSelected}
            onFileUpload={handleFileUploaded}
            onLoadProject={loadProject}
            hasSavedProject={hasSavedProject}
            setError={setError}
          />
        ) : (
          <>
            <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-30 shadow-lg">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={restart} title="Start Over">
                  <WandSparklesIcon className="h-8 w-8 text-[var(--color-primary)]" />
                  <h1 className="text-2xl font-bold tracking-tight text-white">AI Storyline Generator</h1>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={saveProject}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isProjectSaved
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <SaveIcon className="h-4 w-4" />
                    {isProjectSaved ? 'Saved!' : 'Save Project'}
                  </button>
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
              <div className="w-full max-w-2xl mx-auto mb-8">
                <ol className="flex items-center w-full">
                  {[1, 2, 3].map((step, index, arr) => (
                    <li key={step} className={`flex w-full items-center ${index === arr.length - 1 ? 'w-auto' : ''}`}>
                      {index !== 0 && <div className="flex-1 h-1 bg-gray-600"></div>}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 border-2 ${getStepClass(step)}`}>
                        <span className="font-bold">{step}</span>
                      </div>
                      {index !== arr.length - 1 && <div className="flex-1 h-1 bg-gray-600"></div>}
                    </li>
                  ))}
                </ol>
                <div className="grid grid-cols-3 mt-2 text-center text-sm font-medium text-gray-400">
                  <div className={currentStep === 1 ? 'text-[var(--color-primary)]' : ''}>1. Content & Brand</div>
                  <div className={currentStep === 2 ? 'text-[var(--color-primary)]' : ''}>2. Edit Storyline</div>
                  <div className={currentStep === 3 ? 'text-[var(--color-primary)]' : ''}>3. Generate Slides</div>
                </div>
              </div>

              {error && (
                <div className="my-4 text-center text-red-400 bg-red-900/50 p-4 rounded-lg max-w-2xl mx-auto">
                  <h3 className="font-bold text-lg">Error</h3>
                  <p>{error}</p>
                </div>
              )}

              <div className="flex-grow flex">{renderStepContent()}</div>
            </main>
          </>
        )}

        <footer className="text-center py-4 mt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">Powered by Gemini</p>
        </footer>

        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}

// Main App with Provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
