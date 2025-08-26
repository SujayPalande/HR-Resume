import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Resume } from "@shared/schema";

interface ResumeListProps {
  onResumeSelect: (resume: Resume | null) => void;
  selectedResume: Resume | null;
  refreshTrigger: number;
}

export default function ResumeList({ onResumeSelect, selectedResume, refreshTrigger }: ResumeListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ['/api/resumes', refreshTrigger],
    refetchInterval: false,
  });

    const filteredResumes = resumes.filter(resume => {
      const query = searchQuery.toLowerCase();
      // Always show all resumes if searchQuery is empty
      if (!query) return true;
      return (
    resume.originalName?.toLowerCase().includes(query) ||
    (resume.candidateName ? resume.candidateName.toLowerCase().includes(query) : false) ||
    (resume.position ? resume.position.toLowerCase().includes(query) : false)
      );
    });

  const handleResumeChange = (resumeId: string) => {
  // Only set if resumeId matches a valid resume UUID
  const resume = resumes.find(r => r.id === resumeId) || null;
  setSelectedResumeId(resumeId);
  onResumeSelect(resume);
  };

  const handleDisplayResume = () => {
    if (selectedResumeId) {
      const resume = resumes.find(r => r.id === selectedResumeId);
      if (resume) {
        onResumeSelect(resume);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf text-error';
    if (fileType.includes('word')) return 'fas fa-file-word text-primary';
    return 'fas fa-file text-secondary';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2" data-testid="resume-list-title">
          Resume Library
        </h2>
        <p className="text-sm text-secondary" data-testid="resume-list-description">
          View and manage submitted resumes
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Resume Dropdown Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2" data-testid="label-select">
          Select Resume to View
        </label>
        <select
          value={selectedResumeId}
          onChange={(e) => handleResumeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          data-testid="select-resume"
        >
          <option value="">Choose a resume...</option>
          {filteredResumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.candidateName || 'Unknown'} - {resume.originalName}
            </option>
          ))}
        </select>
      </div>

      {/* Resume List */}
      <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="resume-list">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p data-testid="empty-state">No resumes found</p>
          </div>
        ) : (
          filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedResume?.id === resume.id
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleResumeChange(resume.id)}
              data-testid={`resume-item-${resume.id}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {resume.candidateName || 'Unknown Candidate'}
                  </p>
                  <p className="text-xs text-secondary">
                    {resume.position || 'No position specified'}
                  </p>
                  <p className="text-xs text-secondary">
                    Submitted: {formatDate(resume.uploadedAt)}
                  </p>
                </div>
                <div className="text-right">
                  {resume.fileType.includes('pdf') && (
                    <i className="fas fa-file-pdf text-error text-lg" />
                  )}
                  {resume.fileType.includes('word') && (
                    <i className="fas fa-file-word text-primary text-lg" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Display Button */}
      <div className="mt-4">
        <button
          onClick={handleDisplayResume}
          disabled={!selectedResumeId}
          className="w-full bg-secondary hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          data-testid="button-display-resume"
        >
          <Eye className="w-4 h-4" />
          <span>Display Selected Resume</span>
        </button>
      </div>
    </div>
  );
}
