"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, RefreshCw, Mic } from "lucide-react";

// Quiz types
type QuizQuestion = {
  id: number;
  type: "multiple-choice" | "fill-blank" | "speaking";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
};

// Mock quiz data
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: "multiple-choice",
    question: "What is the key to improving listening comprehension according to the video?",
    options: [
      "Watching movies with subtitles",
      "Regular practice with authentic materials",
      "Memorizing vocabulary lists",
      "Taking formal language classes"
    ],
    correctAnswer: "Regular practice with authentic materials",
    explanation: "The video emphasizes that consistent practice with real-world materials is essential for developing listening skills."
  },
  {
    id: 2,
    type: "multiple-choice",
    question: "Which of these is NOT mentioned as a listening improvement strategy?",
    options: [
      "Active listening with a purpose",
      "Using varied content types",
      "The listen-pause-predict method",
      "Reading transcripts without audio"
    ],
    correctAnswer: "Reading transcripts without audio",
    explanation: "The video discusses active listening, content variety, and the listen-pause-predict method, but not reading transcripts without audio."
  },
  {
    id: 3,
    type: "fill-blank",
    question: "When using the listen-pause-predict method, you should listen to a segment, pause to _______ what you heard, and then predict what might come next.",
    correctAnswer: "summarize",
    explanation: "The technique involves summarizing what you've heard during the pause before making predictions about upcoming content.",
    hint: "This word means 'to give a brief statement of the main points'"
  },
  {
    id: 4,
    type: "speaking",
    question: "Practice pronouncing this sentence from the video: 'Regular practice with authentic materials is key to developing strong listening skills.'",
    correctAnswer: "",  // Not applicable for speaking exercises
    explanation: "Focus on clear pronunciation, natural rhythm, and appropriate intonation."
  }
];

export function QuizView() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = (completedQuestions.length / quizQuestions.length) * 100;
  
  const handleOptionSelect = (option: string) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAnswerSubmitted) {
      setTextAnswer(e.target.value);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setTextAnswer("");
      setIsAnswerSubmitted(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(null);
      setTextAnswer("");
      setIsAnswerSubmitted(false);
    }
  };

  const checkAnswer = () => {
    let isCorrect = false;
    
    if (currentQuestion.type === "multiple-choice") {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "fill-blank") {
      isCorrect = textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    } else if (currentQuestion.type === "speaking") {
      // For speaking questions, we'd need speech recognition
      // This is a simplified version
      isCorrect = true;
    }
    
    setIsAnswerCorrect(isCorrect);
    setIsAnswerSubmitted(true);
    
    if (!completedQuestions.includes(currentQuestion.id)) {
      setCompletedQuestions([...completedQuestions, currentQuestion.id]);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTextAnswer("");
    setIsAnswerSubmitted(false);
    setCompletedQuestions([]);
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={selectedOption || ""}
            className="space-y-3"
            onValueChange={handleOptionSelect}
          >
            {currentQuestion.options?.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 rounded-lg border p-3 transition-colors ${
                  isAnswerSubmitted
                    ? option === currentQuestion.correctAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : option === selectedOption
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : ""
                    : "hover:bg-muted"
                }`}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  disabled={isAnswerSubmitted}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-grow cursor-pointer py-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case "fill-blank":
        return (
          <div className="space-y-4">
            <div className="py-2 px-4 bg-muted/50 rounded-lg">
              {currentQuestion.question}
            </div>
            
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={textAnswer}
                onChange={handleTextChange}
                disabled={isAnswerSubmitted}
                className={
                  isAnswerSubmitted
                    ? isAnswerCorrect
                      ? "border-green-500"
                      : "border-red-500"
                    : ""
                }
              />
              
              {!isAnswerSubmitted && currentQuestion.hint && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Hint:</span> {currentQuestion.hint}
                </p>
              )}
            </div>
          </div>
        );
        
      case "speaking":
        return (
          <div className="space-y-4">
            <div className="py-2 px-4 bg-muted/50 rounded-lg">
              {currentQuestion.question}
            </div>
            
            <Button 
              className="w-full py-8 flex flex-col gap-2" 
              variant={isAnswerSubmitted ? "secondary" : "default"}
            >
              <Mic className={`h-10 w-10 ${isAnswerSubmitted ? "" : "animate-pulse"}`} />
              <span>{isAnswerSubmitted ? "Recording Complete" : "Click to Start Recording"}</span>
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-24 h-3" />
          <span className="text-sm text-muted-foreground">
            {completedQuestions.length}/{quizQuestions.length} completed
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={resetQuiz}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Quiz
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent>{renderQuestionContent()}</CardContent>
        <CardFooter className="flex flex-col">
          {isAnswerSubmitted && (
            <div className={`mb-4 p-3 rounded-lg w-full ${
              isAnswerCorrect 
                ? "bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-300" 
                : "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300"
            }`}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <CheckCircle className={`h-5 w-5 ${
                    isAnswerCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`} />
                </div>
                <div>
                  <p className="font-medium">
                    {isAnswerCorrect ? "Correct!" : "Not quite right"}
                  </p>
                  <p className="text-sm mt-1">
                    {currentQuestion.explanation}
                  </p>
                  {!isAnswerCorrect && currentQuestion.type === "fill-blank" && (
                    <p className="text-sm mt-1 font-medium">
                      Correct answer: {currentQuestion.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {isAnswerSubmitted ? (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex === quizQuestions.length - 1
                  ? "Finish"
                  : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={checkAnswer}
                disabled={
                  (currentQuestion.type === "multiple-choice" && !selectedOption) ||
                  (currentQuestion.type === "fill-blank" && !textAnswer)
                }
              >
                Check Answer
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}