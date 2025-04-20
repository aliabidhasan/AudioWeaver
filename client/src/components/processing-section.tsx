import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { uploadFiles, processDocuments, getProcessingStatus } from "@/lib/api";
import { UploadedFile, Summary } from "@/lib/types";

interface ProcessingSectionProps {
  uploadedFiles: UploadedFile[];
  onProcessingComplete: (summary: Summary) => void;
  onError: (error: string) => void;
}

export default function ProcessingSection({
  uploadedFiles,
  onProcessingComplete,
  onError
}: ProcessingSectionProps) {
  const [status, setStatus] = useState("Uploading Documents...");
  const [description, setDescription] = useState("Preparing your files for processing.");
  const [progress, setProgress] = useState(0);
  // Use string for processingId to match API type
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollingInterval: NodeJS.Timeout;

    const startProcessing = async () => {
      try {
        // Only execute this if processingId is null (initial processing)
        if (processingId === null) {
          // Step 1: Upload files
          setStatus("Uploading Documents...");
          setDescription("Preparing your files for processing.");
          setProgress(10);

          const files = uploadedFiles.map(uf => uf.file);
          const uploadResult = await uploadFiles(files);

          if (!isMounted) return;
          setProgress(30);

          // Step 2: Process documents
          setStatus("Extracting Text...");
          setDescription("Reading and extracting content from your PDF documents.");
          
          const processResult = await processDocuments(uploadResult.uploadIds);
          
          if (!isMounted) return;
          console.log("Setting processingId:", processResult.processingId);
          setProcessingId(processResult.processingId.toString());
          setProgress(40);
        }
        
        // Step 3: Poll for status updates (only if processingId exists)
        if (processingId) {
          pollingInterval = setInterval(async () => {
            try {
              const statusResult = await getProcessingStatus(processingId);
              
              if (!isMounted) return;
              
              console.log("Processing status:", statusResult.status, statusResult.progress);
              
              switch (statusResult.status) {
                case 'extracting':
                case 'processing':
                  setStatus("Extracting Text...");
                  setDescription("Reading and extracting content from your PDF documents.");
                  setProgress(40);
                  break;
                case 'summarizing':
                  setStatus("Generating Summary...");
                  setDescription("Analyzing content to create an engaging podcast-style summary.");
                  setProgress(60);
                  break;
                case 'converting':
                  setStatus("Creating Audio...");
                  setDescription("Converting the summary into high-quality audio.");
                  setProgress(80);
                  break;
                case 'completed':
                  setProgress(100);
                  if (statusResult.summary) {
                    clearInterval(pollingInterval);
                    onProcessingComplete(statusResult.summary);
                  }
                  break;
                case 'error':
                  clearInterval(pollingInterval);
                  onError(statusResult.error || "An unknown error occurred during processing.");
                  break;
              }
            } catch (error) {
              if (!isMounted) return;
              clearInterval(pollingInterval);
              onError("Failed to get processing status. Please try again.");
            }
          }, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        if (!isMounted) return;
        onError("Failed to process documents. Please check your API keys and try again.");
      }
    };

    startProcessing();

    return () => {
      isMounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [uploadedFiles, onProcessingComplete, onError, processingId]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6 animate-spin"></div>
          <h2 className="text-xl font-semibold mb-2">{status}</h2>
          <p className="text-accent mb-8">{description}</p>
          
          <div className="w-full max-w-md mx-auto mt-8 mb-4">
            <Progress value={progress} className="h-2.5" />
          </div>
          
          <div className="flex justify-between text-xs text-accent max-w-md mx-auto">
            <span>Extracting Text</span>
            <span>Generating Summary</span>
            <span>Creating Audio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
