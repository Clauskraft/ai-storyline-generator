import React, { useState } from 'react';
import { Slide } from '../types';
import { enhancedExportService } from '../services/exportEnhancementService';
import { ExportFormat } from '../services/exportEnhancementService';
import { PresentationIcon, FileTextIcon } from './Icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  brandKit: any;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, slides, brandKit }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pptx');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await enhancedExportService.downloadExport(
        selectedFormat,
        'presentation',
        slides,
        brandKit,
        {
          includeSpeakerNotes: includeNotes,
          watermark: 'Made with AI Storyline Generator',
        }
      );
      
      // Track export
      const { analyticsService } = await import('../services/analyticsService');
      analyticsService.trackPresentationExported(selectedFormat, slides.length);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-2xl font-bold mb-4">Export Presentation</h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedFormat('pptx')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'pptx'
                    ? 'border-blue-600 bg-blue-600/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <PresentationIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">PowerPoint</div>
                <div className="text-xs text-gray-400">.pptx</div>
              </button>

              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'pdf'
                    ? 'border-blue-600 bg-blue-600/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <FileTextIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">PDF</div>
                <div className="text-xs text-gray-400">.pdf</div>
              </button>

              <button
                onClick={() => setSelectedFormat('html')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'html'
                    ? 'border-blue-600 bg-blue-600/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <GlobeIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">HTML</div>
                <div className="text-xs text-gray-400">Interactive</div>
              </button>

              <button
                onClick={() => setSelectedFormat('json')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedFormat === 'json'
                    ? 'border-blue-600 bg-blue-600/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <FileTextIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">JSON</div>
                <div className="text-xs text-gray-400">Data</div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeNotes"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
            />
            <label htmlFor="includeNotes" className="text-sm">
              Include speaker notes
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default ExportModal;

