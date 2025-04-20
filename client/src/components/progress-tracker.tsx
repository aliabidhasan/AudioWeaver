import { ProcessingStep } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  currentStep: ProcessingStep;
}

export default function ProgressTracker({ currentStep }: ProgressTrackerProps) {
  const steps = [
    { id: ProcessingStep.Upload, name: "Upload", icon: "file-upload" },
    { id: ProcessingStep.Analyze, name: "Analyze", icon: "brain" },
    { id: ProcessingStep.Listen, name: "Listen", icon: "headphones" },
    { id: ProcessingStep.Reflect, name: "Reflect", icon: "lightbulb" }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2",
              currentStep === step.id 
                ? "bg-primary text-white" 
                : currentStep > step.id 
                  ? "bg-primary text-white"
                  : "bg-accent text-white opacity-60"
            )}>
              {getStepIcon(step.icon)}
            </div>
            <span className={cn(
              "text-sm font-medium",
              currentStep < step.id ? "opacity-60" : ""
            )}>
              {step.name}
            </span>
            
            {/* Connector line, except after the last element */}
            {index < steps.length - 1 && (
              <div className={cn(
                "h-1 w-16 mx-2",
                currentStep > index + 1 ? "bg-primary" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getStepIcon(icon: string) {
  switch (icon) {
    case "file-upload":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      );
    case "brain":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
        </svg>
      );
    case "headphones":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path>
        </svg>
      );
    case "lightbulb":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
        </svg>
      );
    default:
      return null;
  }
}
