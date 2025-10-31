import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { SaveIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [unsplashApiKey, setUnsplashApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('unsplash_api_key') || '';
      setUnsplashApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('unsplash_api_key', unsplashApiKey);
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div>
          <label htmlFor="unsplash-key" className="block text-sm font-medium text-gray-300">
            Unsplash API Key
          </label>
          <input
            type="text"
            id="unsplash-key"
            value={unsplashApiKey}
            onChange={(e) => setUnsplashApiKey(e.target.value)}
            placeholder="Enter your Unsplash Access Key"
            className="mt-1 w-full p-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          />
          <p className="mt-2 text-xs text-gray-500">
            This is required to search for stock photos in Step 3. You can get a free key from the{' '}
            <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">
              Unsplash Developers
            </a>{' '}
            website. The key is saved securely in your browser's local storage.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
              isSaved ? 'bg-green-600' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'
            }`}
          >
            <SaveIcon className="h-4 w-4" />
            {isSaved ? 'Saved!' : 'Save & Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;