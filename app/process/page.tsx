"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProcessingView } from "@/components/processing/ProcessingView";
import { ResultsView } from "@/components/results/NotesView";
import { extractVideoId } from "@/lib/utils";

export default function ProcessPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get("url") || "";
  const videoId = extractVideoId(videoUrl);
  
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  
  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsProcessingComplete(true);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="py-8">
          {isProcessingComplete ? (
            <ResultsView videoId={videoId} />
          ) : (
            <ProcessingView videoId={videoId} />
          )}
        </div>
      </div>
    </main>
  );
}