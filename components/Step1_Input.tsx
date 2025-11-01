import React, { useState, useRef, useCallback, useEffect } from 'react';
import { generateTextFromHeadlines, getAvailableProviders } from '../services/geminiService';
import { FileTextIcon, UploadIcon, WandSparklesIcon, GlobeIcon, FolderIcon, BrainCircuitIcon, ChevronRightIcon, NewspaperIcon } from './Icons';
import { sanitizeUserInput, sanitizeUrl } from '../utils/sanitize';
import { useContent, useBrandKit, useUI, useNavigation } from '../contexts/AppContext';
import { getAvailableModels } from '../services/presentationModels';
import type { PresentationModel } from '../types';

// No more props needed - everything comes from context!
const Step1Input: React.FC = () => {
    // Access context via specialized hooks
    const { rawText, setRawText, contextInfo, setContextInfo, generationOptions, setGenerationOptions } = useContent();
    const { brandKit, setBrandKit } = useBrandKit();
    const { setLoadingState, setError } = useUI();
    const { nextStep } = useNavigation();
    const [inputMode, setInputMode] = useState<InputMode>('paste');
    const [headlines, setHeadlines] = useState('');
    const [audience, setAudience] = useState('');
    const [goal, setGoal] = useState('');

    const [contextType, setContextType] = useState<ContextType>('file');
    const [contextFile, setContextFile] = useState<File | null>(null);
    const [contextUrl, setContextUrl] = useState<string>('');
    const [contextFolderFiles, setContextFolderFiles] = useState<File[] | null>(null);

    // NEW: AI Provider state
    const [aiProviders, setAiProviders] = useState<{ id: string; name: string; available: boolean }[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>('gemini');

    const folderInputRef = useRef<HTMLInputElement>(null);

    type InputMode = 'paste' | 'generate';
    type ContextType = 'file' | 'url' | 'folder';

    // NEW: Fetch available AI providers on mount
    useEffect(() => {
        getAvailableProviders().then(providers => {
            setAiProviders(providers);
            // Set default to first available provider
            const firstAvailable = providers.find(p => p.available);
            if (firstAvailable) {
                setSelectedProvider(firstAvailable.id);
            }
        });
    }, []);

    const handleGenerateText = async () => {
        if (!headlines.trim()) {
            setError('Please enter some headlines to generate text.');
            return;
        }
        setError(null);

        // SECURITY: Sanitize headlines input
        const sanitizedHeadlines = sanitizeUserInput(headlines, 5000); // Max 5KB
        setHeadlines(sanitizedHeadlines);

        setLoadingState({ isLoading: true, message: 'Generating text from headlines...'});
        try {
            const generatedText = await generateTextFromHeadlines(sanitizedHeadlines, brandKit);
            // SECURITY: Sanitize AI-generated text as well (defense in depth)
            const sanitizedGenerated = sanitizeUserInput(generatedText, 50000);
            setRawText(sanitizedGenerated);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate text: ${errorMessage}`);
        } finally {
            setLoadingState({ isLoading: false, message: '' });
        }
    };
    
    const readFileAsText = (file: File): Promise<{ name: string, content: string }> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, content: reader.result as string });
          reader.onerror = reject;
          reader.readAsText(file);
        });
    };
    
    const processAndProceed = async () => {
        if (!rawText.trim()) {
            setError('Please provide or generate some text first.');
            return;
        }

        // SECURITY: Sanitize user input before processing
        const sanitizedRawText = sanitizeUserInput(rawText, 50000); // Max 50KB
        setRawText(sanitizedRawText);

        setLoadingState({ isLoading: true, message: 'Processing context...'});
        try {
            let contextText: string | null = null;
            let contextSource: string = 'None';

            switch (contextType) {
                case 'file':
                    if (contextFile) {
                        const fileText = await contextFile.text();
                        // SECURITY: Sanitize file content
                        contextText = sanitizeUserInput(fileText, 100000); // Max 100KB
                        contextSource = `Uploaded file: ${contextFile.name}`;
                    }
                    break;
                case 'url':
                     if (contextUrl.trim()) {
                        // SECURITY: Validate and sanitize URL
                        const sanitized = sanitizeUrl(contextUrl.trim());
                        if (!sanitized) {
                            setError('Invalid URL provided. Please use http:// or https:// URLs only.');
                            setLoadingState({ isLoading: false, message: ''});
                            return;
                        }
                        contextText = `Content from URL: ${sanitized}`;
                        contextSource = `Web URL: ${sanitized}`;
                    }
                    break;
                case 'folder':
                    if (contextFolderFiles && contextFolderFiles.length > 0) {
                        const fileContents = await Promise.all(contextFolderFiles.map(readFileAsText));
                        // SECURITY: Sanitize all file contents
                        contextText = fileContents
                            .map(file => `// FILE: ${file.name}\n---\n${sanitizeUserInput(file.content, 50000)}\n---\n`)
                            .join('\n\n');
                        contextSource = `Folder with ${contextFolderFiles.length} files.`;
                    }
                    break;
            }

            // SECURITY: Sanitize audience and goal inputs
            const sanitizedAudience = sanitizeUserInput(audience, 500);
            const sanitizedGoal = sanitizeUserInput(goal, 500);

            // NEW: Save AI provider selection in generation options
            setGenerationOptions({...generationOptions, aiProvider: selectedProvider});

            setContextInfo({ text: contextText, source: contextSource, audience: sanitizedAudience, goal: sanitizedGoal });
            setLoadingState({ isLoading: false, message: ''});
            nextStep();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to process context: ${errorMessage}`);
            setLoadingState({ isLoading: false, message: ''});
        }
    };


    // Render functions and class name helpers from previous implementation
    // ...
    const renderContextInput = () => {
        switch (contextType) {
            case 'file':
                return (
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-400">
                            <label
                            htmlFor="context-file-input"
                            className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-[var(--color-primary)]"
                            >
                            <span>Upload a file</span>
                            <input id="context-file-input" name="context-file" type="file" className="sr-only" onChange={e => setContextFile(e.target.files?.[0] || null)} accept=".txt,.css,.md,.json" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">TXT, CSS, MD, JSON up to 1MB</p>
                        {contextFile && <p className="text-sm text-[var(--color-primary)] mt-2">Selected: {contextFile.name}</p>}
                        </div>
                    </div>
                );
            case 'url': return ( <div className="mt-2"><input type="url" value={contextUrl} onChange={(e) => setContextUrl(e.target.value)} placeholder="https://example.com/article" className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" /><p className="text-xs text-gray-500 mt-2">Note: This provides the URL as context to the model, it does not fetch the content directly.</p></div> );
            {/* Fix: Add @ts-ignore to allow non-standard directory selection attributes */}
            case 'folder': return ( <div className="mt-2 text-center"><button onClick={() => folderInputRef.current?.click()} className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-[var(--color-primary)] flex items-center justify-center gap-2"><FolderIcon className="h-5 w-5" />Select Folder</button>{/* @ts-ignore */}
<input type="file" webkitdirectory="true" directory="true" multiple className="sr-only" ref={folderInputRef} onChange={e => setContextFolderFiles(e.target.files ? Array.from(e.target.files) : null)} />{contextFolderFiles && <p className="text-sm text-[var(--color-primary)] mt-2">Selected {contextFolderFiles.length} files.</p>}</div>)
            default: return null;
        }
    }
    const getTabClassName = (isActive: boolean) => `flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${isActive ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`;

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-6 bg-gray-800 rounded-xl shadow-md">
             {/* 1. Content Input */}
             <div>
                <label className="text-lg font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-2">1. Provide Your Content</label>
                <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg mb-4">
                    <button onClick={() => setInputMode('paste')} className={getTabClassName(inputMode === 'paste')}><FileTextIcon className="h-4 w-4" /> Paste Text</button>
                    <button onClick={() => setInputMode('generate')} className={getTabClassName(inputMode === 'generate')}><NewspaperIcon className="h-4 w-4" /> Generate from Headlines</button>
                </div>
                {inputMode === 'paste' ? <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Enter an article, report, notes, or any text..." className="w-full h-48 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-y" />
                : <div className="flex flex-col gap-2"><textarea value={headlines} onChange={(e) => setHeadlines(e.target.value)} placeholder="Enter a few headlines, one per line..." className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-y" /><button onClick={handleGenerateText} disabled={!headlines.trim()} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:bg-gray-600"><WandSparklesIcon className="h-4 w-4"/>Generate Text</button><textarea value={rawText} readOnly placeholder="Generated text will appear here..." className="w-full h-36 p-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg" /></div>}
             </div>
             
             {/* 2. Brand & Tone */}
             <div>
                <label className="text-lg font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-2">2. Define Brand &amp; Tone</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300">Primary Color</label>
                        <input type="color" value={brandKit.primaryColor} onChange={e => setBrandKit({...brandKit, primaryColor: e.target.value})} className="mt-1 w-full h-10 p-1 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-300">Secondary Color</label>
                        <input type="color" value={brandKit.secondaryColor} onChange={e => setBrandKit({...brandKit, secondaryColor: e.target.value})} className="mt-1 w-full h-10 p-1 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Font</label>
                        <select value={brandKit.font} onChange={e => setBrandKit({...brandKit, font: e.target.value as BrandKit['font']})} className="mt-1 block w-full py-2 px-3 bg-gray-900 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]">
                            <option>Arial</option><option>Calibri</option><option>Georgia</option><option>Verdana</option>
                        </select>
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="text-sm font-medium text-gray-300">Tone of Voice</label>
                    <input type="text" value={brandKit.toneOfVoice} onChange={e => setBrandKit({...brandKit, toneOfVoice: e.target.value})} placeholder="e.g., Professional and engaging" className="mt-1 w-full p-2 bg-gray-900 border border-gray-700 rounded-lg" />
                 </div>
             </div>

             {/* 3. Audience & Goal */}
             <div>
                 <label className="text-lg font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-2">3. Specify Audience &amp; Goal</label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="Who is the audience?" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg" />
                     <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="What is the presentation's goal?" className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg" />
                 </div>
             </div>
             
             {/* 4. Context & Options */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-lg font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-2">4. Add Context (Optional)</label>
                    <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg mb-4">
                        <button onClick={() => setContextType('file')} className={getTabClassName(contextType === 'file')}><UploadIcon className="h-4 w-4" /> File</button>
                        <button onClick={() => setContextType('url')} className={getTabClassName(contextType === 'url')}><GlobeIcon className="h-4 w-4" /> URL</button>
                        <button onClick={() => setContextType('folder')} className={getTabClassName(contextType === 'folder')}><FolderIcon className="h-4 w-4" /> Folder</button>
                    </div>
                    {renderContextInput()}
                 </div>
                 <div>
                    <label className="text-lg font-semibold text-[var(--color-primary)] mb-2 flex items-center gap-2">5. Advanced Options</label>
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="presentation-model" className="block text-sm font-medium text-gray-300">Presentation Model</label>
                            <select
                                id="presentation-model"
                                value={generationOptions.presentationModel}
                                onChange={e => setGenerationOptions({...generationOptions, presentationModel: e.target.value as PresentationModel})}
                                className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-900 border-gray-700 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            >
                                {getAvailableModels().map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {getAvailableModels().find(m => m.id === generationOptions.presentationModel)?.description}
                            </p>
                        </div>
                         {/* NEW: AI Provider Selection */}
                         <div>
                            <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-300">AI Provider</label>
                            <select
                                id="ai-provider"
                                value={selectedProvider}
                                onChange={e => setSelectedProvider(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-900 border-gray-700 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                            >
                                {aiProviders.filter(p => p.available).map(provider => (
                                    <option key={provider.id} value={provider.id}>
                                        {provider.name}
                                    </option>
                                ))}
                                {aiProviders.filter(p => !p.available).length > 0 && (
                                    <optgroup label="Unavailable (API key missing)">
                                        {aiProviders.filter(p => !p.available).map(provider => (
                                            <option key={provider.id} value={provider.id} disabled>
                                                {provider.name} (unavailable)
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Select which AI model to use for generating presentations
                            </p>
                        </div>
                         <div>
                            <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Image Aspect Ratio</label>
                            <select id="aspect-ratio" value={generationOptions.aspectRatio} onChange={e => setGenerationOptions({...generationOptions, aspectRatio: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-900 border-gray-700 rounded-md">
                                <option>16:9</option><option>1:1</option><option>9:16</option><option>4:3</option><option>3:4</option>
                            </select>
                        </div>
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5"><input id="thinking-mode" type="checkbox" checked={generationOptions.useThinkingMode} onChange={e => setGenerationOptions({...generationOptions, useThinkingMode: e.target.checked})} className="focus:ring-[var(--color-primary)] h-4 w-4 text-[var(--color-primary)] bg-gray-700 border-gray-600 rounded" /></div>
                            <div className="ml-3 text-sm"><label htmlFor="thinking-mode" className="font-medium text-gray-300 flex items-center gap-2"><BrainCircuitIcon className="h-5 w-5"/> Deep Thinking Mode</label><p className="text-gray-500">For complex topics. Slower, but more thorough.</p></div>
                        </div>
                    </div>
                 </div>
             </div>

            <div className="mt-auto pt-4">
                <button onClick={processAndProceed} disabled={!rawText.trim()} className="w-full flex items-center justify-center gap-3 px-6 py-3 text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100">
                    Generate Storyline
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default Step1Input;