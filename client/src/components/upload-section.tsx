import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { CloudUpload, FileText, Trash2, Eye, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Resume } from "@shared/schema";

interface UploadSectionProps {
  onUploadSuccess: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  name: string;
  size: string;
  type: string;
}

export default function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await apiRequest('POST', '/api/resumes/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      onUploadSuccess();
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, DOC, and DOCX files are supported",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = [];
    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        const uploadFile: UploadFile = {
          file,
          id: Date.now() + Math.random().toString(),
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        };
        newFiles.push(uploadFile);
      }
    });

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const submitResumes = async () => {
    if (uploadFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(uploadFiles.map(uploadFile => uploadMutation.mutateAsync(uploadFile.file)));
      setUploadFiles([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'fas fa-file-pdf text-error';
    if (type.includes('word')) return 'fas fa-file-word text-primary';
    return 'fas fa-file text-secondary';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2" data-testid="upload-title">
          Upload Resume
        </h2>
        <p className="text-sm text-secondary" data-testid="upload-description">
          Upload candidate resumes in PDF, DOC, or DOCX format
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          dragOver
            ? 'border-primary bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="drop-zone"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <CloudUpload className="text-4xl text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Drag and drop your resume here</p>
            <p className="text-sm text-secondary">
              or <span className="text-primary font-medium">click to browse</span>
            </p>
          </div>
          <p className="text-xs text-secondary">Supports PDF, DOC, DOCX (Max 10MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          multiple
          onChange={handleFileSelect}
          data-testid="file-input"
        />
      </div>

      {/* Uploaded Files */}
      {uploadFiles.length > 0 && (
        <div className="mt-6 space-y-3" data-testid="uploaded-files">
          {uploadFiles.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              data-testid={`uploaded-file-${uploadFile.id}`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="text-primary text-xl" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{uploadFile.name}</p>
                  <p className="text-xs text-secondary">{uploadFile.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => removeFile(uploadFile.id)}
                  className="text-error hover:text-red-700 transition-colors"
                  title="Delete"
                  data-testid={`button-delete-${uploadFile.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={submitResumes}
          disabled={uploadFiles.length === 0 || uploadMutation.isPending}
          className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          data-testid="button-submit-resumes"
        >
          {uploadMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>Submit Resumes</span>
        </button>
      </div>
    </div>
  );
}
