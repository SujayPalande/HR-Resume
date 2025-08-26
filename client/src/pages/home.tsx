import { Bus } from "lucide-react";
import UploadSection from "@/components/upload-section";
import ResumeList from "@/components/resume-list";
import DocumentViewer from "@/components/document-viewer";
import { useState } from "react";
import { Resume } from "@shared/schema";

export default function Home() {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleResumeSelect = (resume: Resume | null) => {
    setSelectedResume(resume);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bus className="text-primary text-2xl mr-3" data-testid="header-logo" />
              <h1 className="text-xl font-semibold text-gray-900" data-testid="header-title">
                HR Resume Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary" data-testid="user-name">Sarah Johnson</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center" data-testid="user-avatar">
                <span className="text-white text-sm font-medium">SJ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <UploadSection onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Resume List */}
          <div className="lg:col-span-1">
            <ResumeList 
              onResumeSelect={handleResumeSelect} 
              selectedResume={selectedResume}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        {/* Document Viewer */}
        <DocumentViewer selectedResume={selectedResume} />
      </div>
    </div>
  );
}
