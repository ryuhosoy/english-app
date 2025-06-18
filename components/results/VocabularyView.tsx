"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, RotateCw, Check, Bookmark } from "lucide-react";

// Mock vocabulary data
const vocabularyItems = [
  {
    id: 1,
    word: "comprehension",
    partOfSpeech: "noun",
    definition: "The ability to understand something.",
    example: "Reading comprehension is essential for academic success.",
    timestamp: "0:45",
    difficulty: "intermediate"
  },
  {
    id: 2,
    word: "authentic",
    partOfSpeech: "adjective",
    definition: "Of undisputed origin and not a copy; genuine.",
    example: "It's important to practice with authentic materials like real English videos and podcasts.",
    timestamp: "1:23",
    difficulty: "intermediate"
  },
  {
    id: 3,
    word: "gradually",
    partOfSpeech: "adverb",
    definition: "In a gradual way; slowly and steadily.",
    example: "You should gradually increase the difficulty of your listening materials.",
    timestamp: "2:17",
    difficulty: "beginner"
  },
  {
    id: 4,
    word: "implement",
    partOfSpeech: "verb",
    definition: "Put (a decision, plan, agreement, etc.) into effect.",
    example: "Let's implement the listen-pause-predict strategy in your daily practice.",
    timestamp: "3:05",
    difficulty: "intermediate"
  },
  {
    id: 5,
    word: "strategy",
    partOfSpeech: "noun",
    definition: "A plan of action designed to achieve a long-term or overall aim.",
    example: "Having a good listening strategy can improve your comprehension dramatically.",
    timestamp: "3:41",
    difficulty: "beginner"
  },
  {
    id: 6,
    word: "simultaneously",
    partOfSpeech: "adverb",
    definition: "At the same time.",
    example: "Practice speaking and listening simultaneously to improve both skills.",
    timestamp: "5:20",
    difficulty: "advanced"
  },
];

export function VocabularyView() {
  const [savedWords, setSavedWords] = useState<number[]>([]);
  
  const toggleSaveWord = (id: number) => {
    setSavedWords(prev => 
      prev.includes(id) 
        ? prev.filter(wordId => wordId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Vocabulary</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                6 Words
              </Badge>
              <Button variant="outline" size="sm">
                <RotateCw className="h-3.5 w-3.5 mr-1" />
                Flashcards
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Words</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
            
            <VocabularyTabContent
              value="all"
              items={vocabularyItems}
              savedWords={savedWords}
              toggleSaveWord={toggleSaveWord}
            />
            
            <VocabularyTabContent
              value="beginner"
              items={vocabularyItems.filter(item => item.difficulty === "beginner")}
              savedWords={savedWords}
              toggleSaveWord={toggleSaveWord}
            />
            
            <VocabularyTabContent
              value="intermediate"
              items={vocabularyItems.filter(item => item.difficulty === "intermediate")}
              savedWords={savedWords}
              toggleSaveWord={toggleSaveWord}
            />
            
            <VocabularyTabContent
              value="advanced"
              items={vocabularyItems.filter(item => item.difficulty === "advanced")}
              savedWords={savedWords}
              toggleSaveWord={toggleSaveWord}
            />
            
            <VocabularyTabContent
              value="saved"
              items={vocabularyItems.filter(item => savedWords.includes(item.id))}
              savedWords={savedWords}
              toggleSaveWord={toggleSaveWord}
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

type VocabularyTabContentProps = {
  value: string;
  items: typeof vocabularyItems;
  savedWords: number[];
  toggleSaveWord: (id: number) => void;
};

function VocabularyTabContent({
  value,
  items,
  savedWords,
  toggleSaveWord,
}: VocabularyTabContentProps) {
  return (
    <TabsContent value={value} className="m-0 pt-4">
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No words in this category
          </div>
        ) : (
          items.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              isSaved={savedWords.includes(item.id)}
              onToggleSave={() => toggleSaveWord(item.id)}
            />
          ))
        )}
      </div>
    </TabsContent>
  );
}

type VocabularyCardProps = {
  item: typeof vocabularyItems[0];
  isSaved: boolean;
  onToggleSave: () => void;
};

function VocabularyCard({ item, isSaved, onToggleSave }: VocabularyCardProps) {
  return (
    <div className="border rounded-lg p-4 group transition-all hover:border-primary/20 hover:bg-primary/5">
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">{item.word}</h3>
          <Badge variant="outline" className="text-xs">
            {item.partOfSpeech}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              // In a real app, this would play the pronunciation
            }}
          >
            <Volume2 className="h-4 w-4" />
            <span className="sr-only">Play pronunciation</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 rounded-full ${
              isSaved ? "text-yellow-500 hover:text-yellow-600" : ""
            }`}
            onClick={onToggleSave}
          >
            <Bookmark
              className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
            />
            <span className="sr-only">
              {isSaved ? "Unsave word" : "Save word"}
            </span>
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-2">
        {item.definition}
      </div>
      
      <div className="text-sm border-l-2 border-primary/30 pl-3 py-1 bg-primary/5 rounded-sm">
        "{item.example}"
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Appears at {item.timestamp}
      </div>
    </div>
  );
}