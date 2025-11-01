import React, { useState, useEffect } from 'react';
import { generateStoryline, StorylineSlide, chatWithBot, regenerateStorylineSlideContent } from '../services/geminiService';
import { ChatMessage } from '../types';
import Loader from './Loader';
import ChatBot from './ChatBot';
import FishboneDiagram from './FishboneDiagram';
import { ChevronLeftIcon, ChevronRightIcon, MessageSquareIcon } from './Icons';
import { useContent, useBrandKit, useNavigation } from '../contexts/AppContext';

// No more props - using context!
const Step2Storyline: React.FC = () => {
    // Access context
    const { rawText, contextInfo, generationOptions, storyline, setStoryline } = useContent();
    const { brandKit } = useBrandKit();
    const { nextStep, previousStep } = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [regeneratingSlideId, setRegeneratingSlideId] = useState<string | null>(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isBotResponding, setIsBotResponding] = useState(false);

    useEffect(() => {
        if (!storyline && rawText) {
            const generate = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const result = await generateStoryline(
                        rawText, contextInfo.text, contextInfo.source,
                        generationOptions.useThinkingMode,
                        contextInfo.audience, contextInfo.goal, brandKit,
                        generationOptions.presentationModel,
                        generationOptions.aiProvider || 'gemini'  // NEW: Pass AI provider
                    );
                    setStoryline(result);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                    setError(`Failed to generate storyline: ${errorMessage}`);
                } finally { setIsLoading(false); }
            };
            generate();
        }
    }, [rawText, contextInfo, generationOptions, brandKit, storyline, setStoryline]);

    const updateStoryline = (newStoryline: StorylineSlide[]) => {
        setStoryline(newStoryline);
    };

    const handleRegenerateContent = async (slideId: string) => {
        if (!storyline) return;
        const slideIndex = storyline.findIndex(s => s.id === slideId);
        if (slideIndex === -1) return;
        
        setRegeneratingSlideId(slideId);
        try {
            const slideToRegen = storyline[slideIndex];
            const { content, imagePrompt } = await regenerateStorylineSlideContent(slideToRegen.title);
            const newStoryline = [...storyline];
            newStoryline[slideIndex] = { ...slideToRegen, content, imagePrompt };
            setStoryline(newStoryline);
        } catch (err) {
            console.error("Failed to regenerate slide content:", err);
            setError("Could not regenerate content. Please try again.");
        } finally {
            setRegeneratingSlideId(null);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || isBotResponding) return;
      
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setChatMessages(prev => [...prev, newUserMessage]);
        setIsBotResponding(true);
      
        try {
            const storylineContext = storyline?.map(s => `Slide ${s.id}:\nTitle: ${s.title}\nContent: ${s.content}`).join('\n\n');
            const { text, sources } = await chatWithBot(message, chatMessages, storylineContext);
            const newBotMessage: ChatMessage = { role: 'model', content: text, sources };
            
            // Experimental: Check for action commands
            if (text.toLowerCase().includes("change title")) {
                // This is where you'd parse the response and update the storyline
                // For now, it's just a placeholder
            }

            setChatMessages(prev => [...prev, newBotMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            const errorBotMessage: ChatMessage = { role: 'model', content: `Sorry, I ran into an error: ${errorMessage}` };
            setChatMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsBotResponding(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {isLoading && <Loader message={generationOptions.useThinkingMode ? "Engaging Deep Thinking..." : "Crafting storyline..."} />}
            {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg"><h3 className="font-bold">Error</h3><p>{error}</p></div>}
            
            {storyline && !isLoading && (
                 <div className="w-full flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4 text-center">Review & Edit Your Storyline</h2>
                    <p className="text-center text-gray-400 mb-6">Drag to reorder, use buttons to add/remove, and click any text to edit.</p>
                    <div className="flex-grow w-full overflow-auto p-4 bg-gray-900/50 rounded-lg">
                        <FishboneDiagram 
                            storyline={storyline}
                            onStorylineChange={updateStoryline}
                            onRegenerateContent={handleRegenerateContent}
                            regeneratingSlideId={regeneratingSlideId}
                        />
                    </div>
                 </div>
            )}

            <div className="mt-8 w-full max-w-3xl flex justify-between items-center">
                <button onClick={previousStep} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"><ChevronLeftIcon className="h-5 w-5" />Back</button>
                <button onClick={nextStep} disabled={!storyline || isLoading} className="flex items-center justify-center gap-2 px-6 py-3 border-transparent text-base font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:bg-gray-600"><ChevronRightIcon className="h-5 w-5" />Generate Slides</button>
            </div>
             
            {!isChatOpen && storyline && (<button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white rounded-full p-4 shadow-lg z-40"><MessageSquareIcon className="h-6 w-6" /></button>)}
            <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} messages={chatMessages} onSendMessage={handleSendMessage} isResponding={isBotResponding}/>
        </div>
    );
};

export default Step2Storyline;