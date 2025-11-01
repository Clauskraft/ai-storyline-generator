import React, { useState } from 'react';
import { sharingService } from '../services/sharingService';
import { ClipboardIcon as clipboardIcon, LinkIcon as linkIcon } from './Icons';

interface ShareButtonProps {
  presentationId: string;
  onShareCreated?: (url: string) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ presentationId, onShareCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShare = async () => {
    try {
      // Create share link with default settings
      const share = sharingService.createShareLink(presentationId, {
        public: true,
        requiresPassword: false,
        allowEdit: false,
        trackViews: true,
      });

      const url = sharingService.getShareUrl(share.id);
      setShareUrl(url);
      
      if (onShareCreated) {
        onShareCreated(url);
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        <linkIcon className="h-4 w-4" />
        Share
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Share Presentation</h3>

            {!shareUrl ? (
              <div className="space-y-4">
                <p className="text-gray-300">Create a shareable link for this presentation.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Create Link
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    {linkCopied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;

