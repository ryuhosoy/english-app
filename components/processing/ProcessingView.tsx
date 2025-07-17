"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSearchParams, useRouter } from "next/navigation";

type ProcessingStep = {
  id: string;
  label: string;
  description: string;
  apiEndpoint?: string;
};

type ProcessingResult = {
  transcription?: string;
  keywords?: any;
  quiz?: any;
};

export function ProcessingView({ videoId }: { videoId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get("url") || "";
  
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult>({});
  const [error, setError] = useState<string | null>(null);
  
  const processingSteps: ProcessingStep[] = [
    {
      id: "transcribe",
      label: "音声をテキストに変換中",
      description: "YouTube動画の音声を高精度でテキストに変換しています",
      apiEndpoint: "/api/youtube_to_text"
    },
    {
      id: "analyze",
      label: "内容を分析中",
      description: "テキストから重要な概念と語彙を特定しています"
    },
    {
      id: "keywords",
      label: "重要語彙を抽出中",
      description: "重要な単語とフレーズを抽出して定義を作成しています",
      apiEndpoint: "/api/extract_keywords"
    },
    {
      id: "notes",
      label: "ノートを生成中",
      description: "内容から構造化されたノートを作成しています"
    },
    {
      id: "quiz",
      label: "クイズを作成中",
      description: "理解度を測るためのインタラクティブな練習問題を作成しています",
      apiEndpoint: "/api/generate_quiz"
    }
  ];

  // 実際のAPI処理を実行
  const processVideo = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Step 1: YouTube動画をテキストに変換
      setCurrentStepIndex(0);
      setProgress(20);
      
      const transcriptionResponse = await fetch('/api/youtube_to_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      });

      console.log("transcriptionResponse", transcriptionResponse);
      
      if (!transcriptionResponse.ok) {
        console.log("transcriptionResponse", transcriptionResponse);
        throw new Error('音声の変換に失敗しました');
      }
      
      const transcriptionData = await transcriptionResponse.json();
      const transcription = transcriptionData.text;
      setResults(prev => ({ ...prev, transcription }));
      
      // Step 2: キーワード抽出
      setCurrentStepIndex(2);
      setProgress(60);
      
      const keywordsResponse = await fetch('/api/extract_keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription })
      });
      
      if (!keywordsResponse.ok) {
        throw new Error('キーワードの抽出に失敗しました');
      }
      
      const keywordsData = await keywordsResponse.json();
      setResults(prev => ({ ...prev, keywords: keywordsData }));

      console.log('keywordsData:', keywordsData);
      
      // Step 3: クイズ生成
      setCurrentStepIndex(4);
      setProgress(80);
      
      const quizResponse = await fetch('/api/generate_quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcription })
      });
      
      if (!quizResponse.ok) {
        throw new Error('クイズの生成に失敗しました');
      }
      
      const quizData = await quizResponse.json();
      setResults(prev => ({ ...prev, quiz: quizData }));
      
      // 完了
      setProgress(100);
      
      // 結果をlocalStorageに保存（結果ページで使用）
      localStorage.setItem('processingResults', JSON.stringify({
        transcription,
        keywords: keywordsData,
        quiz: quizData,
        videoUrl
      }));
      
      // 処理完了後、結果ページに移動
      setTimeout(() => {
        router.push('/results?url=' + videoUrl);
      }, 1000); // 1秒後に移動（完了の表示を見せるため）
      
    } catch (err: any) {
      setError(err.message);
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (videoUrl && !isProcessing) {
      processVideo();
    }
  }, [videoUrl]);

  // エラーが発生した場合の表示
  if (error) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-semibold">処理中にエラーが発生しました</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={processVideo}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative w-full max-w-xs aspect-video bg-muted rounded-lg overflow-hidden mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          {videoId && (
            <div className="absolute inset-0 opacity-20">
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">動画を処理中</h2>
        <p className="text-muted-foreground">
          この動画をパーソナライズされた学習教材に変換しています
        </p>
      </div>
      
      <div className="space-y-6">
        <Progress value={progress} className="h-2" />
        
        <div className="space-y-4">
          {processingSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "flex items-start p-3 rounded-lg transition-colors",
                  isActive ? "bg-primary/5" : "bg-transparent",
                  isCompleted ? "text-muted-foreground" : ""
                )}
              >
                <div className="mr-3 mt-0.5">
                  {isCompleted ? (
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <div>
                  <h3 className={cn(
                    "font-medium",
                    isActive && "text-primary font-semibold"
                  )}>
                    {step.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}