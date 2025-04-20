import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import ContextModal from "@/components/context-modal";
import ProcessingSection from "@/components/processing-section";
import AudioPlayer from "@/components/audio-player";
import ReflectionSection from "@/components/reflection-section";
import SettingsModal from "@/components/settings-modal";
import ProgressTracker from "@/components/progress-tracker";
import { getApiKeys } from "@/lib/api";
import { ProcessingStep, ApiKeys, UploadedFile, UserContext, ProcessingStatus, Summary, UserReflection } from "@/lib/types";

export default function Home() {
  const { toast } = useToast();
  
  // Core state
  const [currentStep, setCurrentStep] = useState<ProcessingStep>(ProcessingStep.Upload);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingId, setProcessingId] = useState<string>("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [summary, setSummary] = useState<Summary | null>(null);
  
  // Modals state
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    gemini: '',
    elevenlabs: ''
  });
  
  // Check for API keys on mount and force settings modal as first step
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const keys = await getApiKeys();
        setApiKeys(keys);
        
        // Always show settings modal first as an explicit first step
        setIsSettingsModalOpen(true);
      } catch (error) {
        console.error("Failed to fetch API keys:", error);
        toast({
          title: "Error",
          description: "Failed to fetch API settings. Please try again.",
          variant: "destructive"
        });
        // Even on error, show settings modal
        setIsSettingsModalOpen(true);
      }
    };
    
    checkApiKeys();
  }, [toast]);
  
  // Handling file uploads
  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };
  
  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };
  
  // Proceed to context gathering
  const handleProcessFiles = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one PDF document.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if API keys are set
    if (!apiKeys.gemini || !apiKeys.elevenlabs) {
      toast({
        title: "API Keys Required",
        description: "Please set your API keys in the settings before processing documents.",
        variant: "destructive"
      });
      setIsSettingsModalOpen(true);
      return;
    }
    
    setIsContextModalOpen(true);
  };
  
  // Handle context submission
  const handleContextSubmit = (context: UserContext) => {
    setIsContextModalOpen(false);
    startProcessing(context);
  };
  
  // Skip context
  const handleContextSkip = () => {
    setIsContextModalOpen(false);
    startProcessing();
  };
  
  // Start processing files
  const startProcessing = (context?: UserContext) => {
    setCurrentStep(ProcessingStep.Analyze);
    
    // The actual processing will be implemented in the ProcessingSection component
    // which will call the backend API to process the files
  };
  
  // Handle API key updates
  const handleApiKeysUpdated = (keys: ApiKeys) => {
    setApiKeys(keys);
    setIsSettingsModalOpen(false);
    toast({
      title: "Settings Saved",
      description: "Your API keys have been updated successfully."
    });
  };
  
  // Handle reflection submission
  const handleReflectionSubmit = (reflection: UserReflection) => {
    toast({
      title: "Reflection Submitted",
      description: "Thank you for your reflections!"
    });
    resetApplication();
  };
  
  // Reset application to initial state
  const resetApplication = () => {
    setCurrentStep(ProcessingStep.Upload);
    setUploadedFiles([]);
    setProcessingId("");
    setProcessingStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
    setSummary(null);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M19.714 14.7a7.008 7.008 0 0 0 0-5.4"></path>
              <path d="M16.857 18.857a7.18 7.18 0 0 0 0-13.714"></path>
              <path d="M14 21c.667-.368 1-1.5 1-3.011V6.01c0-1.511-.318-2.627-1-3.01a1.01 1.01 0 0 0-1 0c-.667.383-1 1.499-1 3.01v11.98c0 1.51.333 2.643 1 3.01a.995.995 0 0 0 1 0z"></path>
              <path d="M6 6h0"></path>
              <path d="M8 18H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h4"></path>
            </svg>
            <h1 className="text-xl font-semibold">Audio Weaver</h1>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-accent hover:text-secondary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Progress Tracker */}
        <ProgressTracker currentStep={currentStep} />
        
        {/* Step 1: Upload Documents */}
        {currentStep === ProcessingStep.Upload && (
          <FileUpload
            uploadedFiles={uploadedFiles}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            onProcessFiles={handleProcessFiles}
          />
        )}
        
        {/* Step 2: Processing Documents */}
        {currentStep === ProcessingStep.Analyze && (
          <ProcessingSection
            uploadedFiles={uploadedFiles}
            onProcessingComplete={(summary) => {
              setSummary(summary);
              setCurrentStep(ProcessingStep.Listen);
            }}
            onError={(error) => {
              toast({
                title: "Processing Error",
                description: error,
                variant: "destructive"
              });
              setCurrentStep(ProcessingStep.Upload);
            }}
          />
        )}
        
        {/* Step 3: Audio Player */}
        {currentStep === ProcessingStep.Listen && summary && (
          <AudioPlayer
            summary={summary}
            onReflect={() => setCurrentStep(ProcessingStep.Reflect)}
          />
        )}
        
        {/* Step 4: Reflection */}
        {currentStep === ProcessingStep.Reflect && summary && (
          <ReflectionSection
            summaryId={summary.id}
            onSubmit={handleReflectionSubmit}
            onSkip={resetApplication}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-accent text-sm">
          <p>Audio Weaver &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>

      {/* Context Modal */}
      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        onSubmit={handleContextSubmit}
        onSkip={handleContextSkip}
      />
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKeys={apiKeys}
        onSave={handleApiKeysUpdated}
      />
    </div>
  );
}
