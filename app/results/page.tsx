"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Play, 
  CheckCircle2,
  Clock,
  Target,
  Star,
  X
} from "lucide-react";
import Link from "next/link";
import { extractVideoId } from "@/lib/utils";
import { NotesView } from "@/components/results/NotesView";
import { VocabularyView } from "@/components/results/VocabularyView";
import { QuizView } from "@/components/results/QuizView";

type ProcessingResults = {
  transcription: string;
  keywords: {
    important_words: Array<{
      word: string;
      meaning: string;
      example: string;
    }>;
    important_phrases: Array<{
      phrase: string;
      meaning: string;
      example: string;
    }>;
  };
  quiz: {
    quizzes: Array<{
      question: string;
      choices: string[];
      answer: string;
      explanation: string;
    }>;
  };
  videoUrl: string;
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get("url") || "";
  const videoId = extractVideoId(videoUrl);
  const [activeTab, setActiveTab] = useState("overview");
  const [results, setResults] = useState<ProcessingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    // localStorageから処理結果を取得
    const storedResults = localStorage.getItem('processingResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } catch (error) {
        console.error('Failed to parse stored results:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleStartLearning = () => {
    router.push(`/learn?videoId=${videoId}`);
  };

  const handleWatchVideo = () => {
    setShowVideoPlayer(true);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleVideoClick = () => {
    setShowVideoPlayer(true);
  };

  const handleCloseVideo = () => {
    setShowVideoPlayer(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">結果が見つかりません</h2>
          <p className="text-muted-foreground mb-4">
            動画の処理が完了していないか、結果が保存されていません。
          </p>
          <Button onClick={handleBackToDashboard}>
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = results.keywords.important_words.length;
  const phraseCount = results.keywords.important_phrases.length;
  const quizCount = results.quiz.quizzes.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">LinguaNote AI</h1>
            </div>
            <Button variant="outline" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 成功メッセージ */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
                  学習教材の生成が完了しました！
                </h2>
              </div>
              <p className="text-green-700 dark:text-green-300">
                動画から抽出された単語、ノート、クイズが準備できました。
                学習を開始して英語力を向上させましょう。
              </p>
            </CardContent>
          </Card>

          {/* 動画情報 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div 
                  className="relative w-full max-w-xs aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleVideoClick}
                >
                  {videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 高解像度サムネイルが失敗した場合、標準解像度を試す
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {videoUrl ? `YouTube動画 - ${videoId}` : '動画情報'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {videoUrl ? 'YouTube動画から生成された学習教材です。サムネイルをクリックして動画を再生できます。' : '動画の詳細情報が利用できません。'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      15分30秒
                    </Badge>
                    <Badge variant="secondary">
                      <Target className="h-3 w-3 mr-1" />
                      中級レベル
                    </Badge>
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      4.8/5.0
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleStartLearning} className="w-full sm:w-auto">
                      <BookOpen className="h-4 w-4 mr-2" />
                      学習を開始する
                    </Button>
                    <Button variant="outline" onClick={handleWatchVideo} className="w-full sm:w-auto">
                      <Play className="h-4 w-4 mr-2" />
                      動画を再生
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTube動画プレイヤーモーダル */}
          {showVideoPlayer && videoId && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                <button
                  onClick={handleCloseVideo}
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title="YouTube video player"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* 生成された教材の概要 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概要</TabsTrigger>
              <TabsTrigger value="notes">ノート</TabsTrigger>
              <TabsTrigger value="vocabulary">語彙</TabsTrigger>
              <TabsTrigger value="quiz">クイズ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      生成されたノート
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.ceil(results.transcription.length / 100)}
                    </div>
                    <p className="text-sm text-muted-foreground">セクション</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-green-600" />
                      抽出された単語
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {wordCount + phraseCount}
                    </div>
                    <p className="text-sm text-muted-foreground">重要単語・フレーズ</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      クイズ問題
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {quizCount}
                    </div>
                    <p className="text-sm text-muted-foreground">理解度チェック</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>学習の流れ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">ノートで内容を理解</h4>
                        <p className="text-sm text-muted-foreground">
                          構造化されたノートで動画の内容を整理して理解します
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">語彙を学習</h4>
                        <p className="text-sm text-muted-foreground">
                          重要な単語・フレーズを音声付きで学習します
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">クイズで理解度を確認</h4>
                        <p className="text-sm text-muted-foreground">
                          インタラクティブなクイズで学習内容を確認します
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <NotesView transcription={results.transcription} />
            </TabsContent>

            <TabsContent value="vocabulary">
              <VocabularyView keywords={results.keywords} />
            </TabsContent>

            <TabsContent value="quiz">
              <QuizView quizzes={results.quiz.quizzes} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 