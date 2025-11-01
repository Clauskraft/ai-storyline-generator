import React, { useState, useEffect, useCallback } from 'react';
import { Slide } from '../types';
import { findStockImages, generateImageForSlide, editImage, generateSpeakerNotes } from '../services/geminiService';
import { exportToPptx } from '../services/exportService';
import { enhancedExportService } from '../services/exportEnhancementService';
import { versionHistoryService } from '../services/versionHistoryService';
import { analyticsService } from '../services/analyticsService';
import SlideCard from './SlideCard';
import Loader from './Loader';
import Modal from './Modal';
import ExportModal from './ExportModal';
import ShareButton from './ShareButton';
import VersionHistoryPanel from './VersionHistoryPanel';
import OfflineIndicator from './OfflineIndicator';
import { ChevronLeftIcon, WandSparklesIcon, PresentationIcon, GoogleSlidesIcon } from './Icons';
import { useContent, useBrandKit, useNavigation } from '../contexts/AppContext';

// No more props - using context!
const Step3Slides: React.FC = () => {
    // Access context
    const { storyline, finalSlides, setFinalSlides, generationOptions } = useContent();
    const { brandKit } = useBrandKit();
    const { previousStep, restart } = useNavigation();

    // Get aspect ratio from generation options
    const aspectRatio = generationOptions.aspectRatio;
    const [loadingState, setLoadingState] = useState({ isLoading: false, message: '' });
    const [error, setError] = useState<string | null>(null);
    const [generatingAiImageIndex, setGeneratingAiImageIndex] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isGoogleSlidesModalOpen, setIsGoogleSlidesModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [unsplashApiKey, setUnsplashApiKey] = useState<string | null>(null);
    const [presentationId, setPresentationId] = useState<string>(() => `pres_${Date.now()}`);

    useEffect(() => {
        setUnsplashApiKey(localStorage.getItem('unsplash_api_key'));
    }, []);

    useEffect(() => {
        if (!finalSlides && storyline) {
            const fetchSuggestions = async () => {
                setLoadingState({ isLoading: true, message: 'Finding image suggestions...' });
                setError(null);

                const initialSlides: Slide[] = storyline.map(s => ({ ...s, layout: 'TITLE_CONTENT', imageSuggestions: [] }));
                setFinalSlides(initialSlides);

                // Track presentation creation
                analyticsService.trackPresentationCreated(generationOptions.model, initialSlides.length, false);

                const suggestionPromises = storyline.map(slide => 
                    findStockImages(slide.imagePrompt, unsplashApiKey).catch(err => {
                        console.error(`Failed to get suggestions for slide "${slide.title}":`, err);
                        return { error: err.message };
                    })
                );
                const results = await Promise.all(suggestionPromises);

                setFinalSlides(prevSlides => {
                    if (!prevSlides) return null;
                    const updated = prevSlides.map((slide, index) => {
                        const result = results[index];
                        if ('error' in result) {
                            return { ...slide, imageUrlError: result.error || 'Failed to fetch suggestions.' };
                        }
                        return { ...slide, imageSuggestions: result as any };
                    });
                    
                    // Save initial version after slides are set
                    setTimeout(() => {
                        try {
                            versionHistoryService.saveVersion(
                                presentationId,
                                updated,
                                brandKit,
                                'Initial version'
                            );
                        } catch (error) {
                            console.error('Failed to save initial version:', error);
                        }
                    }, 100);
                    
                    return updated;
                });
                setLoadingState({ isLoading: false, message: '' });
            };
            fetchSuggestions();
        }
    }, [storyline, finalSlides, setFinalSlides, unsplashApiKey, presentationId, brandKit, generationOptions.model]);

    // Auto-save versions periodically
    useEffect(() => {
        if (!finalSlides) return;
        const saveTimer = setTimeout(() => {
            saveVersion();
        }, 30000); // Save every 30 seconds
        return () => clearTimeout(saveTimer);
    }, [finalSlides]);
    
    const saveVersion = useCallback(() => {
        if (!finalSlides || !presentationId) return;
        try {
            versionHistoryService.saveVersion(
                presentationId,
                finalSlides,
                brandKit,
                'Auto-saved'
            );
        } catch (error) {
            console.error('Failed to save version:', error);
        }
    }, [finalSlides, presentationId, brandKit]);

    const handleUpdateSlide = useCallback((index: number, newSlideData: Partial<Slide>) => {
        setFinalSlides(currentSlides => {
            if (!currentSlides) return null;
            const updatedSlides = [...currentSlides];
            updatedSlides[index] = { ...updatedSlides[index], ...newSlideData };
            
            // Save version on update
            setTimeout(() => {
                if (updatedSlides) {
                    try {
                        versionHistoryService.saveVersion(
                            presentationId,
                            updatedSlides,
                            brandKit,
                            `Updated slide ${index + 1}`
                        );
                    } catch (error) {
                        console.error('Failed to save version:', error);
                    }
                }
            }, 1000);
            
            return updatedSlides;
        });
    }, [setFinalSlides, presentationId, brandKit]);

    const handleSelectImage = (index: number, imageUrl: string) => handleUpdateSlide(index, { imageUrl, imageSuggestions: [], imageUrlError: undefined });
    const handleGenerateAiImage = async (index: number) => {
        if (!finalSlides) return;
        setGeneratingAiImageIndex(index);
        handleUpdateSlide(index, { imageUrlError: undefined });
        try {
            const slide = finalSlides[index];
            const newImageUrl = await generateImageForSlide(slide.imagePrompt, aspectRatio);
            handleUpdateSlide(index, { imageUrl: newImageUrl, imageSuggestions: [] });
        } catch (err) {
            handleUpdateSlide(index, { imageUrlError: err instanceof Error ? err.message : 'Unknown error.' });
        } finally {
            setGeneratingAiImageIndex(null);
        }
    };
    const handleRetryImage = (index: number) => { /* Logic to re-fetch suggestions or re-generate */ };
    const handleEditImage = async (index: number, annotation: string) => {
        if (!finalSlides?.[index]?.imageUrl) return;
        const originalSlide = finalSlides[index];
        setGeneratingAiImageIndex(index);
        try {
            const [header, base64Data] = originalSlide.imageUrl!.split(',');
            const mimeType = header.split(':')[1].split(';')[0];
            const newImageUrl = await editImage(base64Data, mimeType, annotation);
            handleUpdateSlide(index, { imageUrl: newImageUrl, originalImageUrl: originalSlide.originalImageUrl || originalSlide.imageUrl });
        } catch(err) {
            setError(`Failed to edit image: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setGeneratingAiImageIndex(null);
        }
    };
    const handleUploadImage = (index: number, base64Data: string) => {
        if (!finalSlides) return;
        const originalImageUrlToKeep = finalSlides[index].imageUrl || finalSlides[index].originalImageUrl;
        handleUpdateSlide(index, { imageUrl: base64Data, originalImageUrl: originalImageUrlToKeep, imageSuggestions: [] });
    };

    // ... D&D handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragEnd = () => setDraggedIndex(null);
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index || !finalSlides) return;
        const newSlides = [...finalSlides];
        const [draggedItem] = newSlides.splice(draggedIndex, 1);
        newSlides.splice(index, 0, draggedItem);
        setDraggedIndex(index);
        setFinalSlides(newSlides);
    };

    // ... Export Handlers
    const isPresentationReady = finalSlides && finalSlides.every(slide => slide.imageUrl);
    const handlePptxExport = async () => {
        if (!finalSlides || !isPresentationReady) return;
        setIsExporting(true); setError(null);
        try { await exportToPptx(finalSlides, brandKit); } 
        catch (err) { setError(err instanceof Error ? err.message : 'Unknown export error.'); } 
        finally { setIsExporting(false); }
    };
    const handleGoogleSlidesExport = () => setIsGoogleSlidesModalOpen(true);

    const handleGenerateAllSpeakerNotes = async () => {
        if (!finalSlides) return;
        setLoadingState({ isLoading: true, message: 'Generating speaker notes for all slides...'});
        const notePromises = finalSlides.map(slide => generateSpeakerNotes(slide));
        const results = await Promise.allSettled(notePromises);
        
        const newSlides = finalSlides.map((slide, index) => {
            const result = results[index];
            if (result.status === 'fulfilled') {
                return { ...slide, speakerNotes: result.value };
            }
            return slide;
        });
        setFinalSlides(newSlides);
        setLoadingState({ isLoading: false, message: '' });
    };

    return (
        <div className="w-full flex flex-col items-center">
            {loadingState.isLoading && <Loader message={loadingState.message} />}
            {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg"><h3 className="font-bold">Error</h3><p>{error}</p></div>}
            
            {finalSlides && !loadingState.isLoading && (
                <div className="w-full max-w-3xl flex flex-col flex-grow min-h-0">
                    <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2 text-center">Your Final Presentation</h2>
                    <p className="text-center text-gray-400 mb-6">Choose an image, select a layout, and generate speaker notes. Drag to reorder.</p>
                    <div className="text-center mb-6">
                        <button onClick={handleGenerateAllSpeakerNotes} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90">
                            <WandSparklesIcon className="inline h-4 w-4 mr-2"/>Generate All Speaker Notes
                        </button>
                    </div>
                    <div className="space-y-6 flex-grow w-full overflow-y-auto pr-2">
                        {finalSlides.map((slide, index) => (
                           <SlideCard key={slide.id} slide={slide} index={index}
                                isRegeneratingText={false} isGeneratingAiImage={generatingAiImageIndex === index}
                                isDragging={draggedIndex === index}
                                onUpdateSlide={handleUpdateSlide} onEditImage={handleEditImage}
                                onUploadImage={handleUploadImage} onSelectImage={handleSelectImage}
                                onGenerateAiImage={handleGenerateAiImage} onRetryImage={handleRetryImage}
                                draggableProps={{ draggable: true, onDragStart: (e) => handleDragStart(e, index), onDragEnd: handleDragEnd, onDragEnter: (e) => handleDragEnter(e, index) }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isPresentationReady && (
                <div className="my-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700 w-full max-w-3xl">
                    <h3 className="text-xl font-bold text-center text-[var(--color-primary)] mb-4">Export Your Presentation</h3>
                    {isExporting ? <Loader message="Generating file..." /> : (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onClick={() => setIsExportModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"><PresentationIcon className="h-5 w-5" />Export Options</button>
                            <button onClick={handlePptxExport} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"><PresentationIcon className="h-5 w-5" />PowerPoint (.pptx)</button>
                        </div>
                    )}
                    <div className="mt-4 flex gap-3 justify-center">
                        <ShareButton presentationId={presentationId} />
                        <button onClick={() => setIsVersionHistoryOpen(true)} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600">
                            History
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-auto pt-4 w-full max-w-3xl flex justify-between items-center">
                 <button onClick={previousStep} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"><ChevronLeftIcon className="h-5 w-5" />Back</button>
                 <button onClick={restart} className="flex items-center justify-center gap-2 px-6 py-3 border-transparent text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"><WandSparklesIcon className="h-5 w-5" />Start Over</button>
            </div>
            
            <Modal isOpen={isGoogleSlidesModalOpen} onClose={() => setIsGoogleSlidesModalOpen(false)} title="Export to Google Slides">
                <div className="text-gray-300 space-y-4">
                    <p>To import your presentation into Google Slides, please follow these simple steps:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>First, download the presentation as a PowerPoint (.pptx) file.
                            <button onClick={() => { handlePptxExport(); setIsGoogleSlidesModalOpen(false); }} className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"><PresentationIcon className="h-4 w-4" /> Click here to Download .pptx</button>
                        </li>
                        <li>Go to your <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">Google Drive</a>.</li>
                        <li>Click on <strong>+ New</strong>, then <strong>File upload</strong>.</li>
                        <li>Select the <strong>presentation.pptx</strong> file you just downloaded.</li>
                        <li>Once uploaded, right-click the file in Google Drive and select <strong>Open with &gt; Google Slides</strong>. It will be automatically converted!</li>
                    </ol>
                </div>
            </Modal>

            <OfflineIndicator />
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                slides={finalSlides || []}
                brandKit={brandKit}
            />
            <VersionHistoryPanel
                isOpen={isVersionHistoryOpen}
                onClose={() => setIsVersionHistoryOpen(false)}
                presentationId={presentationId}
                onRestore={(version) => {
                    setFinalSlides(version.slides);
                    setIsVersionHistoryOpen(false);
                }}
            />
        </div>
    );
};

export default Step3Slides;