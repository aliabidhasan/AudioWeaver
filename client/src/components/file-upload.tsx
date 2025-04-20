import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadedFile } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  onFilesAdded: (files: UploadedFile[]) => void;
  onFileRemoved: (fileId: string) => void;
  onProcessFiles: () => void;
}

export default function FileUpload({
  uploadedFiles,
  onFilesAdded,
  onFileRemoved,
  onProcessFiles
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) return;
      
      const newFiles: UploadedFile[] = pdfFiles.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        file
      }));
      
      onFilesAdded(newFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) return;
      
      const newFiles: UploadedFile[] = pdfFiles.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        file
      }));
      
      onFilesAdded(newFiles);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Upload PDF Documents</CardTitle>
        <CardDescription>Upload multiple PDF files to generate an engaging audio summary.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer mb-6 ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-gray-300"
          >
            <path d="M8 22h8a2 2 0 0 0 2-2v-7"></path>
            <path d="M10 17h4"></path>
            <path d="M6 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"></path>
            <path d="M12 7v5"></path>
            <path d="m9 9 3-3 3 3"></path>
          </svg>
          <h3 className="font-medium mb-2">Drag and drop PDF files here</h3>
          <p className="text-sm text-accent mb-4">or</p>
          <Button variant="default" className="rounded-full">
            <span>Select Files</span>
          </Button>
          <input
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Selected Files</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary mr-3"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M9 13h6"></path>
                      <path d="M9 17h6"></path>
                      <path d="M9 9h1"></path>
                    </svg>
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs text-accent ml-2">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemoved(file.id);
                    }}
                    className="text-accent hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            variant="default"
            className="rounded-full"
            onClick={onProcessFiles}
            disabled={uploadedFiles.length === 0}
          >
            <span>Process Documents</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
