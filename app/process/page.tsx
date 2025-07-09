"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProcessingView } from "@/components/processing/ProcessingView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { extractVideoId } from "@/lib/utils";

export default function ProcessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get("url") || "";
  const videoId = extractVideoId(videoUrl);
  
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsProcessingComplete(true);
      // 完了メッセージを少し遅れて表示
      setTimeout(() => {
        setShowCompletionMessage(true);
        // 3秒後に結果ページに自動遷移
        setTimeout(() => {
          router.push(`/results?url=${encodeURIComponent(videoUrl)}`);
        }, 3000);
      }, 1000);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [videoUrl, router]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleViewResults = () => {
    router.push(`/results?url=${encodeURIComponent(videoUrl)}`);
  };
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="py-8">
          {isProcessingComplete ? (
            <div className="space-y-6">
              {showCompletionMessage && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-green-800 dark:text-green-200">
                        学習材料の生成が完了しました！
                      </CardTitle>
                    </div>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      動画から抽出された単語、ノート、クイズが準備できました。
                      結果ページに移動して学習を開始できます。
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={handleViewResults} className="bg-green-600 hover:bg-green-700">
                        結果を確認する
                      </Button>
                      <Button variant="outline" onClick={handleBackToDashboard}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        ダッシュボードに戻る
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <ProcessingView videoId={videoId} />
          )}
        </div>
      </div>
    </main>
  );
}