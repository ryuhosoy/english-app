"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type ProcessingStep = {
  id: string;
  label: string;
  description: string;
};

export function ProcessingView({ videoId }: { videoId: string }) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const processingSteps: ProcessingStep[] = [
    {
      id: "transcribe",
      label: "Transcribing Audio",
      description: "Converting speech to text with high accuracy"
    },
    {
      id: "analyze",
      label: "Analyzing Content",
      description: "Identifying key concepts and vocabulary"
    },
    {
      id: "notes",
      label: "Generating Notes",
      description: "Creating structured notes from the content"
    },
    {
      id: "vocab",
      label: "Extracting Vocabulary",
      description: "Finding important terms and creating definitions"
    },
    {
      id: "quiz",
      label: "Building Quizzes",
      description: "Creating interactive exercises to test your understanding"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        const newProgress = prevProgress + 1;
        
        // Update current step based on progress
        const stepSize = 100 / processingSteps.length;
        const newStepIndex = Math.min(
          Math.floor(newProgress / stepSize),
          processingSteps.length - 1
        );
        
        if (newStepIndex !== currentStepIndex) {
          setCurrentStepIndex(newStepIndex);
        }
        
        return newProgress;
      });
    }, 120); // Faster for demo purposes

    return () => clearInterval(interval);
  }, [currentStepIndex, processingSteps.length]);

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative w-full max-w-xs aspect-video bg-muted rounded-lg overflow-hidden mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          {videoId && (
            <div className="absolute inset-0 opacity-20">
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Processing Your Video</h2>
        <p className="text-muted-foreground">
          We're turning this video into personalized learning materials
        </p>
      </div>
      
      <div className="space-y-6">
        <Progress value={progress} className="h-2" />
        
        <div className="space-y-4">
          {processingSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-start p-3 rounded-lg transition-colors",
                  isActive ? "bg-primary/5" : "bg-transparent",
                  isCompleted ? "text-muted-foreground" : ""
                )}
              >
                <div className="mr-3 mt-0.5">
                  {isCompleted ? (
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium",
                    isActive && "text-primary font-semibold"
                  )}>
                    {step.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}