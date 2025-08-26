import { Download, Printer, Maximize, FileText } from "lucide-react";
import { Resume } from "@shared/schema";

interface DocumentViewerProps {
  selectedResume: Resume | null;
}

export default function DocumentViewer({ selectedResume }: DocumentViewerProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileTypeDisplay = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF Document';
    if (mimeType.includes('word')) return 'Word Document';
    return 'Document';
  };

  const handleDownload = () => {
    if (selectedResume) {
      const link = document.createElement('a');
      link.href = `/api/files/${selectedResume.fileName}`;
      link.download = selectedResume.originalName;
      link.click();
    }
  };

  const handlePrint = () => {
    if (selectedResume) {
      const printWindow = window.open(`/api/files/${selectedResume.fileName}`, '_blank');
      printWindow?.focus();
      printWindow?.print();
    }
  };

  const handleFullscreen = () => {
    if (selectedResume) {
      window.open(`/api/files/${selectedResume.fileName}`, '_blank');
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900" data-testid="document-viewer-title">
              Document Viewer
            </h2>
            <p className="text-sm text-secondary" data-testid="document-name">
              {selectedResume?.originalName || 'No document selected'}
            </p>
          </div>
          {selectedResume && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="text-secondary hover:text-slate-600 transition-colors"
                title="Download"
                data-testid="button-download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="text-secondary hover:text-slate-600 transition-colors"
                title="Printer"
                data-testid="button-print"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleFullscreen}
                className="text-secondary hover:text-slate-600 transition-colors"
                title="Fullscreen"
                data-testid="button-fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Document Display Area */}
        <div className="border border-gray-300 rounded-lg bg-gray-100 min-h-96 flex items-center justify-center">
          <div className="w-full h-full min-h-96" data-testid="document-container">
            {selectedResume ? (
              <div className="w-full h-full">
                <iframe
                  src={`/api/files/${selectedResume.fileName}`}
                  className="w-full h-96 rounded"
                  title={selectedResume.originalName}
                  data-testid="document-iframe"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="text-6xl mb-4" />
                <p className="text-lg font-medium">No document selected</p>
                <p className="text-sm">Select a resume from the list to view it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Info */}
        {selectedResume && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" data-testid="document-info">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-secondary">File Size</p>
              <p className="font-medium">{formatFileSize(selectedResume.fileSize)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-secondary">File Type</p>
              <p className="font-medium">{getFileTypeDisplay(selectedResume.fileType)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-secondary">Uploaded</p>
              <p className="font-medium">{formatDate(selectedResume.uploadedAt)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
