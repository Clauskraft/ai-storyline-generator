import React, { useState, useEffect } from 'react';
import { versionHistoryService, PresentationVersion } from '../services/versionHistoryService';
import { UndoIcon, CheckIcon } from './Icons';

interface VersionHistoryPanelProps {
  presentationId: string;
  onRestore?: (version: PresentationVersion) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  presentationId,
  onRestore,
  isOpen,
  onClose,
}) => {
  const [versions, setVersions] = useState<PresentationVersion[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isOpen && presentationId) {
      loadVersions();
    }
  }, [isOpen, presentationId]);

  const loadVersions = () => {
    const loadedVersions = versionHistoryService.getVersions(presentationId);
    setVersions(loadedVersions);
    
    const loadedStats = versionHistoryService.getVersionStats(presentationId);
    setStats(loadedStats);
  };

  const handleRestore = (version: PresentationVersion) => {
    try {
      const restored = versionHistoryService.restoreVersion(presentationId, version.version);
      if (onRestore) {
        onRestore(restored);
      }
      loadVersions();
      onClose();
    } catch (error) {
      console.error('Failed to restore version:', error);
      alert('Failed to restore version');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800 border-l border-gray-700 shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Version History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {stats && (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-2">Total Versions</div>
            <div className="text-2xl font-bold">{stats.totalVersions}</div>
            {stats.storageSize && (
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(stats.storageSize / 1024)} KB
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No version history yet</p>
              <p className="text-sm mt-2">Versions are saved automatically</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">Version {version.version}</div>
                    <div className="text-xs text-gray-400">
                      {formatDate(version.metadata.createdAt)}
                    </div>
                  </div>
                  {version.version === versions[versions.length - 1].version && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {version.metadata.slideCount} slides
                </div>
                {version.metadata.changeDescription && (
                  <div className="text-sm text-gray-500 italic mb-3">
                    {version.metadata.changeDescription}
                  </div>
                )}
                {version.version !== versions[versions.length - 1].version && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version);
                    }}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <UndoIcon className="h-4 w-4" />
                    Restore this version
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryPanel;

