"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoUrlInput } from "@/components/video-input/VideoUrlInput";
import { HeroSection } from "@/components/layout/HeroSection";
import { FeatureCards } from "@/components/layout/FeatureCards";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Brain as LangBrain, Lightbulb, NotebookPen, PenLine } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleVideoSubmit = (url: string) => {
    setVideoUrl(url);
    setIsProcessing(true);
    router.push(`/add-video?url=${encodeURIComponent(url)}`);
  };
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between py-4 mb-8">
          <div className="flex items-center gap-2">
            <LangBrain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">LinguaNote AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline">Sign In</Button>
            <Button>Get Started</Button>
          </div>
        </nav>

        <HeroSection />

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Transform YouTube Learning
          </h2>
          <FeatureCards />
        </div>

        <div className="mt-20 mb-12">
          <Card className="p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">
              Try it now
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Paste a YouTube URL to generate personalized learning materials
            </p>
            <VideoUrlInput onSubmit={handleVideoSubmit} />
          </Card>
        </div>
      </div>
    </main>
  );
}