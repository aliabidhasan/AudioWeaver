import { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserReflection } from "@/lib/types";
import { saveReflection } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ReflectionSectionProps {
  summaryId: string;
  onSubmit: (reflection: UserReflection) => void;
  onSkip: () => void;
}

export default function ReflectionSection({
  summaryId,
  onSubmit,
  onSkip
}: ReflectionSectionProps) {
  const { toast } = useToast();
  
  const [reflection, setReflection] = useState<UserReflection>({
    pride: "",
    surprise: "",
    question: "",
    role: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReflection(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await saveReflection(summaryId, reflection);
      onSubmit(reflection);
    } catch (error) {
      console.error("Failed to save reflection:", error);
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Reflection</CardTitle>
        <CardDescription>
          Take a moment to reflect on the insights you've gained from the audio summary. 
          Your reflections help deepen understanding and identify new opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pride">
              One thing you're proud of about the insights generated...
            </Label>
            <Textarea
              id="pride"
              name="pride"
              rows={3}
              value={reflection.pride}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="surprise">
              One insight that surprised you...
            </Label>
            <Textarea
              id="surprise"
              name="surprise"
              rows={3}
              value={reflection.surprise}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="question">
              One question you still want to explore...
            </Label>
            <Textarea
              id="question"
              name="question"
              rows={3}
              value={reflection.question}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">
              Reflect: What's your role in this story/topic now?
            </Label>
            <Textarea
              id="role"
              name="role"
              rows={3}
              value={reflection.role}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={onSkip}
            >
              Skip
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              Submit Reflection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
