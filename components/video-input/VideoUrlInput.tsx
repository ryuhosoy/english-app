"use client";

import { useState } from "react";
import { Youtube, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type VideoUrlInputProps = {
  onSubmit?: (url: string) => void;
};

export function VideoUrlInput({ onSubmit }: VideoUrlInputProps) {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  // Function to validate YouTube URL
  const validateYoutubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValid(validateYoutubeUrl(inputUrl));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // If onSubmit is provided, call it with the URL
    if (onSubmit) {
      onSubmit(url);
      return;
    }

    // Simulate processing - in a real app, this would be an API call
    setTimeout(() => {
      toast({
        title: "Processing complete!",
        description: "Your learning materials are ready to view.",
      });
      setIsProcessing(false);
      
      // In a real application, you would navigate to the results page here
      // For demonstration purposes, we'll just reset the input
      setUrl("");
      setIsValid(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
        <Youtube className="h-5 w-5 text-red-500" />
        <Input
          type="url"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={handleInputChange}
          className={cn(
            "border-none shadow-none bg-transparent focus-visible:ring-0",
            isValid && "text-primary"
          )}
        />
      </div>
      
      <div className="flex justify-center">
        <Button 
          type="submit" 
          disabled={!isValid || isProcessing}
          className="w-full sm:w-auto px-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Video
            </>
          ) : (
            <>
              {isValid ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : null}
              Generate Learning Materials
            </>
          )}
        </Button>
      </div>
    </form>
  );
}