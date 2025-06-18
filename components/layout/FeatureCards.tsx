import { BookText, BrainCircuit, FileText, FileDown, PenSquare, BarChart4, MessageSquareQuote, Speaker as SpeakerWave } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FeatureCard
        icon={<BookText className="h-8 w-8 text-blue-500" />}
        title="Smart Notes Generation"
        description="AI-powered notes that automatically capture and organize key points from any English learning video."
      />
      
      <FeatureCard
        icon={<PenSquare className="h-8 w-8 text-indigo-500" />}
        title="Vocabulary Extraction"
        description="Automatically identify important words and phrases with definitions and example sentences."
      />
      
      <FeatureCard
        icon={<BrainCircuit className="h-8 w-8 text-purple-500" />}
        title="Interactive Quizzes"
        description="Test your understanding with auto-generated multiple choice, fill-in-the-blank, and speaking exercises."
      />
      
      <FeatureCard
        icon={<BarChart4 className="h-8 w-8 text-green-500" />}
        title="Visual Diagrams"
        description="Transform complex concepts into clear visual representations for better understanding and retention."
      />
      
      <FeatureCard
        icon={<SpeakerWave className="h-8 w-8 text-orange-500" />}
        title="Pronunciation Practice"
        description="Improve your speaking with exercises that focus on rhythm, intonation, and pronunciation."
      />
      
      <FeatureCard
        icon={<FileDown className="h-8 w-8 text-rose-500" />}
        title="PDF Export"
        description="Download your personalized learning materials as PDFs for offline study and review."
      />
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="overflow-hidden border-border/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 group">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}