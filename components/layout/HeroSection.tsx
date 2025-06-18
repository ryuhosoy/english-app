import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Brain, Puzzle as PuzzlePiece } from "lucide-react";

export function HeroSection() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 py-12">
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Transform YouTube into{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interactive Learning
          </span>
        </h1>
        <p className="text-xl text-muted-foreground">
          LinguaNote AI automatically converts English learning videos into personalized notes,
          vocabulary lists, and interactive quizzes to boost your language skills.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Button size="lg">Try For Free</Button>
          <Button size="lg" variant="outline">
            How It Works
          </Button>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg border">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 p-6">
              <HeroFeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Smart Notes"
              />
              <HeroFeatureCard
                icon={<Brain className="h-8 w-8" />}
                title="AI Summaries"
              />
              <HeroFeatureCard
                icon={<PuzzlePiece className="h-8 w-8" />}
                title="Vocab Quizzes"
              />
              <HeroFeatureCard
                icon={<GraduationCap className="h-8 w-8" />}
                title="Learn Faster"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroFeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border shadow-sm flex flex-col items-center text-center gap-2">
      {icon}
      <h3 className="font-medium text-sm">{title}</h3>
    </div>
  );
}