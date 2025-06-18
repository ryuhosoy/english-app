"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ListChecks,
  LibraryBig,
  FileDown,
  Share2,
  Edit,
  BarChart4,
} from "lucide-react";

import { NoteContent } from "./notes/NoteContent";
import { VocabularyView } from "./VocabularyView";
import { QuizView } from "./QuizView";
import { DiagramView } from "./DiagramView";

type Props = {
  videoId?: string;
};

export function ResultsView({ videoId = "dQw4w9WgXcQ" }: Props) {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Learning Materials</h1>
          <p className="text-muted-foreground">
            Automatically generated from the YouTube video
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-muted/20 border mb-6">
        <div className="aspect-video relative">
          {videoId && (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 w-full h-full"
            ></iframe>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="notes" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Smart Notes</span>
            <span className="sm:hidden">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-1.5">
            <LibraryBig className="h-4 w-4" />
            <span className="hidden sm:inline">Vocabulary</span>
            <span className="sm:hidden">Vocab</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Practice Quizzes</span>
            <span className="sm:hidden">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="diagrams" className="flex items-center gap-1.5">
            <BarChart4 className="h-4 w-4" />
            <span className="hidden sm:inline">Visual Diagrams</span>
            <span className="sm:hidden">Diagrams</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="m-0">
          <NoteContent />
        </TabsContent>

        <TabsContent value="vocabulary" className="m-0">
          <VocabularyView />
        </TabsContent>

        <TabsContent value="quizzes" className="m-0">
          <QuizView />
        </TabsContent>

        <TabsContent value="diagrams" className="m-0">
          <DiagramView />
        </TabsContent>
      </Tabs>
    </div>
  );
}