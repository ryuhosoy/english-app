"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoUrlInput } from "@/components/video-input/VideoUrlInput";
import { ArrowLeft, Youtube, BookOpen, Brain } from "lucide-react";
import Link from "next/link";

export default function AddVideoPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoSubmit = (url: string) => {
    setIsProcessing(true);
    router.push(`/process?url=${encodeURIComponent(url)}`);
  };

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
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダーセクション */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Youtube className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              新しい動画を追加
            </h1>
            <p className="text-muted-foreground text-lg">
              YouTubeのURLを貼るだけで、自動的に学習教材を生成します
            </p>
          </div>

          {/* メインカード */}
          <Card className="p-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl">
                学習したい動画のURLを入力してください
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUrlInput onSubmit={handleVideoSubmit} />
            </CardContent>
          </Card>

          {/* 機能説明 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">自動文字起こし</h3>
              <p className="text-sm text-muted-foreground">
                Whisper AIで高精度な音声認識を行い、テキストに変換します
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">重要単語抽出</h3>
              <p className="text-sm text-muted-foreground">
                AIが動画内の重要な単語・フレーズを自動で抽出します
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">クイズ生成</h3>
              <p className="text-sm text-muted-foreground">
                理解度を確認するためのクイズを自動生成します
              </p>
            </Card>
          </div>

          {/* 注意事項 */}
          <Card className="mt-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 text-orange-800 dark:text-orange-200">
                📝 ご利用上の注意
              </h3>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• YouTubeの公開動画のみ対応しています</li>
                <li>• 処理時間は動画の長さにより5-15分程度かかります</li>
                <li>• 著作権にご注意ください</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 