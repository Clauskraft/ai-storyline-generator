import React, { useState } from 'react';
import { StorylineSlide } from '../services/geminiService';
import { PlusCircleIcon, Trash2Icon, RefreshCwIcon, GripVerticalIcon } from './Icons';

interface FishboneDiagramProps {
  storyline: StorylineSlide[];
  onStorylineChange: (newStoryline: StorylineSlide[]) => void;
  onRegenerateContent: (slideId: string) => void;
  regeneratingSlideId: string | null;
}

const EditableField: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    className: string;
    placeholder: string;
    isTextarea?: boolean;
}> = ({ value, onChange, className, placeholder, isTextarea = false }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value);
    const commonProps = { value, onChange: handleChange, className: `bg-transparent p-1 rounded-md w-full focus:bg-gray-700 focus:ring-1 focus:ring-[var(--color-primary)] outline-none ${className}`, placeholder };
    return isTextarea ? <textarea {...commonProps} rows={4} /> : <input type="text" {...commonProps} />;
}

const FishboneDiagram: React.FC<FishboneDiagramProps> = ({ storyline, onStorylineChange, onRegenerateContent, regeneratingSlideId }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFieldChange = (index: number, field: keyof StorylineSlide, value: string) => {
        const newStoryline = [...storyline];
        newStoryline[index] = { ...newStoryline[index], [field]: value };
        onStorylineChange(newStoryline);
    };

    const addSlide = (index: number) => {
        const newSlide: StorylineSlide = { id: crypto.randomUUID(), title: 'New Slide', content: 'Content goes here.', imagePrompt: 'A professional image representing a new idea.' };
        const newStoryline = [...storyline];
        newStoryline.splice(index, 0, newSlide);
        onStorylineChange(newStoryline);
    };

    const removeSlide = (id: string) => {
        onStorylineChange(storyline.filter(s => s.id !== id));
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        // Immediate visual feedback by reordering on drag over
        const newStoryline = [...storyline];
        const [draggedItem] = newStoryline.splice(draggedIndex, 1);
        newStoryline.splice(index, 0, draggedItem);
        
        setDraggedIndex(index);
        onStorylineChange(newStoryline);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

  return (
    <div className="flex items-center w-full min-w-max px-12">
        <button onClick={() => addSlide(0)} className="text-gray-500 hover:text-[var(--color-primary)]"><PlusCircleIcon className="h-8 w-8" /></button>
        <div className="flex-grow flex items-center justify-between mx-4 h-40 relative">
            {/* The main horizontal line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--color-primary)] -translate-y-1/2"></div>
            
            {storyline.map((slide, index) => (
                <div key={slide.id} className="relative flex flex-col items-center h-full z-10" onDragOver={(e) => handleDragOver(e, index)}>
                     {/* Vertical connector line */}
                    <div className="w-0.5 h-1/2 bg-[var(--color-primary)]"></div>

                    {/* Draggable Slide Card Container */}
                    <div 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`w-56 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-lg cursor-grab active:cursor-grabbing transition-opacity 
                            ${index % 2 === 0 ? 'order-first -mt-2' : 'order-last -mb-2'}
                            ${draggedIndex === index ? 'opacity-30' : 'opacity-100'}
                        `}
                    >
                         <div className="flex items-start justify-between">
                            <EditableField value={slide.title} onChange={(v) => handleFieldChange(index, 'title', v)} className="text-base font-bold text-[var(--color-primary)] flex-grow" placeholder="Slide Title"/>
                            <GripVerticalIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        </div>
                        <hr className="border-gray-600 my-2"/>
                        <EditableField value={slide.content} onChange={(v) => handleFieldChange(index, 'content', v)} className="text-xs text-gray-300" placeholder="Slide Content" isTextarea/>
                        <div className="flex items-center justify-between mt-2">
                            <button onClick={() => onRegenerateContent(slide.id)} className="text-gray-500 hover:text-[var(--color-primary)] disabled:opacity-50" disabled={regeneratingSlideId === slide.id} title="Regenerate Content">
                                {regeneratingSlideId === slide.id ? <div className="h-4 w-4 border-2 border-t-[var(--color-primary)] border-gray-600 rounded-full animate-spin"></div> : <RefreshCwIcon className="h-4 w-4"/>}
                            </button>
                            <button onClick={() => removeSlide(slide.id)} className="text-gray-500 hover:text-red-500" title="Remove Slide"><Trash2Icon className="h-4 w-4"/></button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <button onClick={() => addSlide(storyline.length)} className="text-gray-500 hover:text-[var(--color-primary)]"><PlusCircleIcon className="h-8 w-8" /></button>
    </div>
  );
};

export default FishboneDiagram;
