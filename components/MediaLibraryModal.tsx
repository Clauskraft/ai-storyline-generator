import React, { useState, useEffect } from 'react';
import {
  MediaItem,
  getMediaLibrary,
  addToMediaLibrary,
  removeFromMediaLibrary,
  searchMediaLibrary,
  getCurrentLibrarySizeMB,
  exportMediaLibrary,
  importMediaLibrary
} from '../services/mediaLibraryService';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: MediaItem) => void; // For selecting media to use
  allowUpload?: boolean; // Whether to show upload functionality
}

const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowUpload = true
}) => {
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | MediaItem['type']>('all');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLibrary();
    }
  }, [isOpen]);

  const loadLibrary = () => {
    const items = searchQuery ? searchMediaLibrary(searchQuery) : getMediaLibrary();
    const filtered = selectedType === 'all' ? items : items.filter(item => item.type === selectedType);
    setLibrary(filtered);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const type: MediaItem['type'] = file.type.startsWith('image/') ? 'image' : 'text';
      await addToMediaLibrary(file.name, type, file.type, file, []);
      loadLibrary();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      removeFromMediaLibrary(id);
      loadLibrary();
    }
  };

  const handleExport = () => {
    const json = exportMediaLibrary();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `media-library-${Date.now()}.json`;
    a.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importMediaLibrary(e.target?.result as string);
        loadLibrary();
        alert('Library imported successfully!');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to import');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const storageMB = getCurrentLibrarySizeMB();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">Media Library</h2>
            <p className="text-gray-400 text-sm mt-1">
              Manage your saved illustrations, figures, and templates • {storageMB.toFixed(2)} MB / 50 MB used
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-gray-700 flex gap-4 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by name or tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              loadLibrary();
            }}
            className="flex-1 min-w-[200px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as any);
              loadLibrary();
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="text">Text</option>
            <option value="structure">Structures</option>
            <option value="template">Templates</option>
          </select>

          {allowUpload && (
            <>
              <label className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md cursor-pointer hover:bg-[var(--color-primary)]/90">
                Upload
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  accept="image/*,.txt,.md,.json"
                />
              </label>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Export
              </button>
              <label className="px-4 py-2 bg-gray-700 text-white rounded-md cursor-pointer hover:bg-gray-600">
                Import
                <input
                  type="file"
                  onChange={handleImport}
                  className="hidden"
                  accept=".json"
                />
              </label>
            </>
          )}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {library.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No media items found</p>
              {allowUpload && <p className="text-sm mt-2">Upload files to start building your library</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {library.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-[var(--color-primary)] transition-colors cursor-pointer group"
                  onClick={() => onSelect && onSelect(item)}
                >
                  {/* Thumbnail/Preview */}
                  <div className="aspect-video bg-gray-700 flex items-center justify-center overflow-hidden">
                    {item.type === 'image' && item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl text-gray-500">
                        {item.type === 'image' ? '🖼️' : item.type === 'template' ? '📋' : '📄'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.type} • Used {item.usageCount}x
                    </p>
                    <div className="mt-2 flex gap-2">
                      {onSelect && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(item);
                          }}
                          className="flex-1 px-2 py-1 bg-[var(--color-primary)] text-white text-xs rounded hover:bg-[var(--color-primary)]/90"
                        >
                          Use
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryModal;
