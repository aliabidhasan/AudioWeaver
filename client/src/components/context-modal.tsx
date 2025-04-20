import { useState, FormEvent } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserContext } from "@/lib/types";

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (context: UserContext) => void;
  onSkip: () => void;
}

export default function ContextModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onSkip 
}: ContextModalProps) {
  const [formData, setFormData] = useState<UserContext>({
    question: "",
    knowledge: "",
    interest: "",
    conversation: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provide Additional Context</DialogTitle>
          <DialogDescription>
            Answering these questions is optional, but will help create a more immersive and relevant audio summary.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">
              What question are you exploring? Is there something about it you're still puzzling over — or something you want others to think more deeply about?
            </Label>
            <Textarea
              id="question"
              name="question"
              rows={3}
              value={formData.question}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="knowledge">
              What would you want others to know about it?
            </Label>
            <Textarea
              id="knowledge"
              name="knowledge"
              rows={3}
              value={formData.knowledge}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interest">
              What caught your eye (or ear) in the documents?
            </Label>
            <Textarea
              id="interest"
              name="interest"
              rows={3}
              value={formData.interest}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="conversation">
              What conversation are you hoping to start with this summary?
            </Label>
            <Textarea
              id="conversation"
              name="conversation"
              rows={3}
              value={formData.conversation}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip
            </Button>
            <Button type="submit">
              Submit Context
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
