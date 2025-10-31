import React, { useState, useRef } from 'react';
import { Slide, SlideLayout } from '../types';
import { FileTextIcon, PencilIcon, WandSparklesIcon, UploadIcon, UndoIcon, GripVerticalIcon, RefreshCwIcon, LayoutIcon } from './Icons';

type EditMode = 'text' | 'image' | null;

interface SlideCardProps {
  slide: Slide;
  index: number;
  isRegeneratingText: boolean;
  isGeneratingAiImage: boolean;
  isDragging: boolean;
  onUpdateSlide: (index: number, newSlideData: Partial<Slide>) => void;
  onEditImage: (index: number, annotation: string) => void;
  onUploadImage: (index: number, base64Data: string) => void;
  onSelectImage: (index: number, imageUrl: string) => void;
  onGenerateAiImage: (index: number) => void;
  onRetryImage: (index: number) => void;
  draggableProps: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  };
}

const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  index,
  isRegeneratingText,
  isGeneratingAiImage,
  isDragging,
  onUpdateSlide,
  onEditImage,
  onUploadImage,
  onSelectImage,
  onGenerateAiImage,
  onRetryImage,
  draggableProps,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [annotation, setAnnotation] = useState('');
  const [showLayouts, setShowLayouts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditMode(null);
    setAnnotation('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditMode(null);
    setAnnotation('');
  };

  const handleRegenerate = () => {
    if (!annotation.trim()) return;

    if (editMode === 'text') {
      // This is now handled by the chatbot / regenerate in Step 2
    } else if (editMode === 'image') {
      onEditImage(index, annotation);
    }
    handleCancelEdit();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onUploadImage(index, reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const handleRevertImage = () => {
      if (!slide.originalImageUrl) return;
      onUpdateSlide(index, { imageUrl: slide.originalImageUrl, originalImageUrl: undefined });
  };
  
  const layoutOptions: { id: SlideLayout, name: string }[] = [
      { id: 'TITLE_CONTENT', name: 'Text Left, Image Right' },
      { id: 'CONTENT_RIGHT', name: 'Image Left, Text Right' },
      { id: 'TWO_COLUMNS', name: 'Two Column Text' },
      { id: 'TITLE_ONLY', name: 'Title Only' },
      { id: 'FULL_IMAGE', name: 'Full Image Title' },
  ];

  const handleLayoutChange = (layout: SlideLayout) => {
      onUpdateSlide(index, { layout });
      setShowLayouts(false);
  };
  
  const isBusy = isRegeneratingText || isGeneratingAiImage;

  const renderImageContent = () => {
    if (slide.imageUrl) {
      return <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />;
    }
    // ... rest of the image rendering logic remains the same
    if (isGeneratingAiImage) {
        return ( <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-700"><div className="w-8 h-8 border-4 border-t-[var(--color-primary)] border-gray-600 rounded-full animate-spin"></div><p className="text-[var(--color-primary)] text-sm">Generating AI Image...</p></div>)
    }
    if (slide.imageUrlError) {
        return (<div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-red-900/20"><p className="text-sm font-semibold text-red-300">Image Error</p><p className="text-xs text-red-400">{slide.imageUrlError}</p><button onClick={() => onRetryImage(index)} className="mt-2 flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"><RefreshCwIcon className="h-3 w-3" /> Retry</button></div>)
    }
    if (slide.imageSuggestions) {
        return (<div className="w-full h-full flex flex-col p-4 bg-gray-700"><p className="text-sm text-center font-medium text-gray-300 mb-2">Select an image or generate with AI</p><div className="grid grid-cols-3 gap-2 flex-grow">{slide.imageSuggestions.slice(0, 5).map(suggestion => (<button key={suggestion.url} onClick={() => onSelectImage(index, suggestion.url)} className="relative w-full h-full rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"><img src={suggestion.url} alt={`Suggested by ${suggestion.author}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1"><p className="text-white text-[10px] leading-tight">Photo by <a href={suggestion.profileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-primary)]">{suggestion.author}</a></p></div></button>))}{Array.from({ length: Math.max(0, 5 - slide.imageSuggestions.length) }).map((_, i) => (<div key={`placeholder-${i}`} className="bg-gray-600 rounded-md"></div>)) }</div><button onClick={() => onGenerateAiImage(index)} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"><WandSparklesIcon className="h-4 w-4" /> Generate with AI</button></div>)
    }
    return (<div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-700"><div className="w-8 h-8 border-4 border-t-[var(--color-primary)] border-gray-600 rounded-full animate-spin"></div><p className="text-[var(--color-primary)] text-sm">Finding suggestions...</p></div>)
  }

  return (
    <div
      className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 relative border border-gray-700 ${isDragging ? 'opacity-50 ring-2 ring-[var(--color-primary)] scale-105 shadow-2xl z-20' : 'hover:shadow-[var(--color-primary)]/20 hover:ring-2 hover:ring-[var(--color-primary)]'}`}
      {...draggableProps}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
      {isBusy && (<div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-20"><div className="flex flex-col items-center gap-2"><div className="w-8 h-8 border-4 border-t-[var(--color-primary)] border-gray-600 rounded-full animate-spin"></div><p className="text-[var(--color-primary)] text-sm">{isRegeneratingText ? 'Revising text...' : 'Editing image...'}</p></div></div>)}
      
      <div className="relative aspect-video bg-gray-700">
        {renderImageContent()}
        <div className="absolute top-2 left-2 bg-gray-900/50 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm z-10">{index + 1}</div>
        
        {slide.imageUrl && (
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                <div className="relative">
                    <button onClick={() => setShowLayouts(!showLayouts)} className="bg-gray-900/50 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-[var(--color-secondary)]/80 transition-colors" title="Change Layout"><LayoutIcon className="h-4 w-4" /></button>
                    {showLayouts && (
                        <div className="absolute top-10 right-0 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-20">
                            {layoutOptions.map(opt => (
                                <button key={opt.id} onClick={() => handleLayoutChange(opt.id)} className={`block w-full text-left px-3 py-2 text-sm ${slide.layout === opt.id ? 'bg-[var(--color-primary)] text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{opt.name}</button>
                            ))}
                        </div>
                    )}
                </div>
                {slide.originalImageUrl && !isEditing && !isBusy && (<button onClick={handleRevertImage} className="bg-gray-900/50 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-blue-600/80 transition-colors" title="Revert image changes"><UndoIcon className="h-4 w-4" /></button>)}
                {!isEditing && !isBusy && (<button onClick={() => fileInputRef.current?.click()} className="bg-gray-900/50 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-green-600/80 transition-colors" title="Upload custom image"><UploadIcon className="h-4 w-4" /></button>)}
                {!isEditing && !isBusy && (<button onClick={handleStartEdit} className="bg-gray-900/50 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-[var(--color-primary)]/80 transition-colors" title="Annotate slide"><PencilIcon className="h-4 w-4" /></button>)}
            </div>
        )}
        <div className="absolute inset-y-0 right-0 w-8 flex items-center justify-center cursor-move" title="Drag to reorder"><GripVerticalIcon className="h-6 w-6 text-gray-400/50" /></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{slide.title}</h3>
        <p className="text-gray-300 whitespace-pre-wrap">{slide.content}</p>
      </div>

      {slide.speakerNotes && (
          <div className="p-6 border-t border-gray-700 bg-gray-900/30">
              <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">Speaker Notes</h4>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{slide.speakerNotes}</p>
          </div>
      )}

      {isEditing && (
        <div className="p-6 border-t border-gray-700 bg-gray-800">
            <div>
              <label htmlFor={`annotation-${index}`} className="text-sm font-medium text-[var(--color-primary)]">Describe how to edit the image:</label>
              <textarea
                id={`annotation-${index}`}
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                placeholder="e.g., 'Add a retro filter' or 'Remove the person in the background'"
                className="w-full h-24 mt-2 p-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700">Cancel</button>
                <button onClick={() => onEditImage(index, annotation)} disabled={!annotation.trim()} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 disabled:bg-gray-600">
                  <WandSparklesIcon className="h-4 w-4" /> Regenerate Image
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SlideCard;