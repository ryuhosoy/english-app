"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Target, RotateCw } from "lucide-react";

interface QuizViewProps {
  quizzes: Array<{
    question: string;
    choices: string[];
    answer: string;
    explanation: string;
  }>;
}

export function QuizView({ quizzes }: QuizViewProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuiz = quizzes[currentQuizIndex];
  const isCorrect = selectedAnswer === currentQuiz.answer;
  const progress = ((currentQuizIndex + 1) / quizzes.length) * 100;

  const handleAnswerSelect = (choice: string) => {
    if (selectedAnswer) return; // 既に回答済みの場合は無視
    
    setSelectedAnswer(choice);
    if (choice === currentQuiz.answer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / quizzes.length) * 100);
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              クイズ完了！
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-cente  r space-y-4">
              <div className="text-4xl font-bold text-primary">
                {score} / {quizzes.length}
              </div>
              <div className="text-lg text-muted-foreground">
                正答率: {percentage}%
              </div>
              <Progress value={percentage} className="w-full" />
              <div className="space-y-2">
                {percentage >= 80 && (
                  <p className="text-green-600 font-semibold">素晴らしい理解度です！</p>
                )}
                {percentage >= 60 && percentage < 80 && (
                  <p className="text-yellow-600 font-semibold">良い理解度です。さらに練習しましょう！</p>
                )}
                {percentage < 60 && (
                  <p className="text-red-600 font-semibold">もう一度復習しましょう。</p>
                )}
              </div>
              <Button onClick={handleRestartQuiz} className="mt-4">
                <RotateCw className="h-4 w-4 mr-2" />
                クイズを再開する
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              理解度クイズ
            </CardTitle>
            <Badge variant="outline">
              {currentQuizIndex + 1} / {quizzes.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 問題 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {currentQuiz.question}
              </h3>
            </div>

            {/* 選択肢 */}
            <div className="space-y-3">
              {currentQuiz.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(choice)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedAnswer === choice
                      ? choice === currentQuiz.answer
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  } ${selectedAnswer !== null ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {selectedAnswer === choice && (
                        <>
                          {choice === currentQuiz.answer ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </>
                      )}
                    </div>
                    <span className="flex-1">{choice}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* 解説 */}
            {showExplanation && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">解説</h4>
                <p className="text-sm">{currentQuiz.explanation}</p>
              </div>
            )}

            {/* 次の問題ボタン */}
            {showExplanation && (
              <div className="flex justify-end">
                <Button onClick={handleNextQuiz}>
                  {currentQuizIndex < quizzes.length - 1 ? "次の問題" : "結果を見る"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}