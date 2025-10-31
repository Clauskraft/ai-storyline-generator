import React, { useRef } from 'react';
import { WandSparklesIcon, FileTextIcon, LayoutTemplateIcon, FileUpIcon, SaveIcon } from './Icons';

interface Step0Props {
  onStartNew: () => void;
  onTemplateSelect: (templateType: string) => void;
  onFileUpload: (file: File) => void;
  onLoadProject: () => void;
  hasSavedProject: boolean;
  setError: (error: string | null) => void;
}

const Step0Welcome: React.FC<Step0Props> = ({ onStartNew, onTemplateSelect, onFileUpload, onLoadProject, hasSavedProject, setError }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const templates = [
        { id: 'business-pitch', name: 'Business Pitch' },
        { id: 'project-update', name: 'Project Update' },
        { id: 'educational-lecture', name: 'Educational Lecture' },
    ];

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <WandSparklesIcon className="h-16 w-16 text-[var(--color-primary)] mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Welcome to the AI Storyline Generator</h1>
            <p className="max-w-2xl text-lg text-gray-400 mb-10">Transform your ideas into compelling presentations in minutes. How would you like to start?</p>

            {hasSavedProject && (
                <div className="mb-8">
                    <button onClick={onLoadProject} className="flex items-center gap-3 px-6 py-3 bg-[var(--color-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--color-secondary)]/90 transition-transform hover:scale-105 shadow-lg">
                        <SaveIcon className="h-5 w-5" />
                        Load Last Project
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {/* Option 1: Start from Scratch */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[var(--color-primary)] hover:shadow-xl transition-all flex flex-col">
                    <FileTextIcon className="h-10 w-10 text-[var(--color-primary)] mb-3 mx-auto" />
                    <h2 className="text-xl font-bold text-white mb-2 text-center">Start from Scratch</h2>
                    <p className="text-gray-400 flex-grow mb-4 text-center">Paste your text or generate content from headlines.</p>
                    <button onClick={onStartNew} className="w-full mt-auto px-6 py-2 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors">
                        Create New
                    </button>
                </div>

                {/* Option 2: Use a Template */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[var(--color-primary)] hover:shadow-xl transition-all flex flex-col">
                    <LayoutTemplateIcon className="h-10 w-10 text-[var(--color-primary)] mb-3 mx-auto" />
                    <h2 className="text-xl font-bold text-white mb-2 text-center">Use a Template</h2>
                    <p className="text-gray-400 flex-grow mb-4 text-center">Begin with a professionally structured presentation template.</p>
                    <div className="w-full mt-auto space-y-2">
                        {templates.map(template => (
                             <button key={template.id} onClick={() => onTemplateSelect(template.id)} className="w-full px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors text-sm">
                                {template.name}
                             </button>
                        ))}
                    </div>
                </div>
                
                {/* Option 3: Upload File */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-[var(--color-primary)] hover:shadow-xl transition-all flex flex-col">
                     <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md,.pdf,.pptx" onChange={handleFileChange} />
                    <FileUpIcon className="h-10 w-10 text-[var(--color-primary)] mb-3 mx-auto" />
                    <h2 className="text-xl font-bold text-white mb-2 text-center">Upload Content</h2>
                    <p className="text-gray-400 flex-grow mb-4 text-center">Upload .txt, .md, .pdf, or .pptx file to be converted automatically.</p>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full mt-auto px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors">
                        Upload File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step0Welcome;