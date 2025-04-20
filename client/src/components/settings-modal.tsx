import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiKeys } from "@/lib/types";
import { validateApiKey } from "@/lib/utils";
import { saveApiKeys } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKeys,
  onSave
}: SettingsModalProps) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeys>(apiKeys);
  const [errors, setErrors] = useState<{gemini?: string; elevenlabs?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: {gemini?: string; elevenlabs?: string} = {};
    
    if (!validateApiKey(keys.gemini)) {
      newErrors.gemini = "Please enter a valid Gemini API key";
    }
    
    if (!validateApiKey(keys.elevenlabs)) {
      newErrors.elevenlabs = "Please enter a valid ElevenLabs API key";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await saveApiKeys(keys);
      onSave(keys);
    } catch (error) {
      console.error("Failed to save API keys:", error);
      toast({
        title: "Error",
        description: "Failed to save API keys. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Step 1: Set Up Your API Keys</DialogTitle>
          <DialogDescription>
            Before proceeding, you need to enter your API keys. These keys are required for document processing and audio generation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="gemini">Google Gemini API Key</Label>
              <a 
                href="https://ai.google.dev/tutorials/setup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:text-primary/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </a>
            </div>
            <Input
              id="gemini"
              name="gemini"
              type="password"
              placeholder="Enter your Gemini API key"
              value={keys.gemini}
              onChange={handleChange}
              className={errors.gemini ? "border-red-500" : ""}
            />
            {errors.gemini && (
              <p className="text-xs text-red-500 mt-1">{errors.gemini}</p>
            )}
            <p className="text-xs text-accent mt-1">
              Used for AI-powered document analysis and summary generation.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
              <a 
                href="https://elevenlabs.io/docs/api-reference/authentication" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:text-primary/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </a>
            </div>
            <Input
              id="elevenlabs"
              name="elevenlabs"
              type="password"
              placeholder="Enter your ElevenLabs API key"
              value={keys.elevenlabs}
              onChange={handleChange}
              className={errors.elevenlabs ? "border-red-500" : ""}
            />
            {errors.elevenlabs && (
              <p className="text-xs text-red-500 mt-1">{errors.elevenlabs}</p>
            )}
            <p className="text-xs text-accent mt-1">
              Used for text-to-speech conversion of generated summaries.
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : "Continue to Step 2: Upload Documents"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
