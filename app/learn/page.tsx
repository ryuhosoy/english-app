"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  BookOpen,
  Target,
  CheckCircle2,
  X,
  Plus,
  Maximize
} from "lucide-react";
import { extractVideoId } from "@/lib/utils";

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
  srt?: string; // 追加
};

type SubtitleSegment = {
  start: number;
  end: number;
  text: string;
};

type RegisteredWord = {
  word: string;
  timestamp: number;
  context: string;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = searchParams.get("videoId") || "";
  const [results, setResults] = useState<ProcessingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleSegment | null>(null);
  const [registeredWords, setRegisteredWords] = useState<RegisteredWord[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subtitles, setSubtitles] = useState<SubtitleSegment[]>([]);

  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  useEffect(() => {
    // localStorageから処理結果を取得
    const storedResults = localStorage.getItem('processingResults');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        // srtがあれば字幕をパース
        if (parsedResults.srt) {
          setSubtitles(parseSrt(parsedResults.srt));
        }
      } catch (error) {
        console.error('Failed to parse stored results:', error);
      }
    }
    
    // localStorageから登録した単語を取得
    const storedWords = localStorage.getItem('registeredWords');
    if (storedWords) {
      try {
        const parsedWords = JSON.parse(storedWords);
        setRegisteredWords(parsedWords);
      } catch (error) {
        console.error('Failed to parse stored words:', error);
      }
    }
    
    setLoading(false);
  }, []);

  // YouTube API の読み込み
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }
  }, [videoId]);

  const initializePlayer = () => {
    if (!playerRef.current || !videoId) return;

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 0,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handlePlayerStateChange,
      },
    });
  };

  const handlePlayerReady = (event: any) => {
    setIsLoading(false);
    setDuration(event.target.getDuration());
  };

  const handlePlayerStateChange = (event: any) => {
    const state = event.data;
    setIsPlaying(state === window.YT.PlayerState.PLAYING);
  };

  // 時間更新の監視
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    const interval = setInterval(() => {
      if (isPlaying && playerInstanceRef.current) {
        const time = playerInstanceRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // SRTをAPIから取得してパース（localStorageにない場合のフォールバック）
  useEffect(() => {
    const fetchSrt = async () => {
      // localStorageにsrtがない場合のみAPIを呼び出す
      if (subtitles.length > 0) return;
      
      const videoUrl = searchParams.get('url') || '';
      if (!videoUrl) return;
      const response = await fetch('/api/youtube_to_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.srt) {
        setSubtitles(parseSrt(data.srt));
      }
    };
    fetchSrt();
  }, [searchParams, subtitles.length]);

  // SRTパース関数
  function parseSrt(srt: string): SubtitleSegment[] {
    const blocks = srt.trim().split(/\n\s*\n/);
    const segments: SubtitleSegment[] = [];
    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const match = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (match) {
          const start = (+match[1]) * 3600 + (+match[2]) * 60 + (+match[3]) + (+match[4]) / 1000;
          const end = (+match[5]) * 3600 + (+match[6]) * 60 + (+match[7]) + (+match[8]) / 1000;
          const text = lines.slice(2).join(' ');
          segments.push({ start, end, text });
        }
      }
    }
    return segments;
  }

  // 現在の字幕を更新
  useEffect(() => {
    const currentSegment = subtitles.find(
      segment => currentTime >= segment.start && currentTime < segment.end
    );
    setCurrentSubtitle(currentSegment || null);
  }, [currentTime, subtitles]);

  // プレイヤー制御関数
  const play = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.playVideo();
    }
  };

  const pause = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.pauseVideo();
    }
  };

  const seekTo = (time: number) => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.seekTo(time, true);
    }
  };

  const setVolumeLevel = (level: number) => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.setVolume(level);
      setVolume(level);
    }
  };

  const toggleMute = () => {
    if (playerInstanceRef.current) {
      if (isMuted) {
        playerInstanceRef.current.unMute();
        setIsMuted(false);
      } else {
        playerInstanceRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const skipBackward = () => {
    seekTo(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    seekTo(Math.min(duration, currentTime + 10));
  };

  const toggleFullscreen = () => {
    if (playerInstanceRef.current) {
      if (isFullscreen) {
        playerInstanceRef.current.exitFullscreen();
        setIsFullscreen(false);
      } else {
        playerInstanceRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWordClick = (word: string) => {
    const newWord: RegisteredWord = {
      word: word.toLowerCase().replace(/[^\w\s]/g, ''),
      timestamp: currentTime,
      context: currentSubtitle?.text || ''
    };
    
    // 重複チェック
    const isDuplicate = registeredWords.some(rw => rw.word === newWord.word);
    if (!isDuplicate) {
      const updatedWords = [...registeredWords, newWord];
      setRegisteredWords(updatedWords);
      // localStorageに保存
      localStorage.setItem('registeredWords', JSON.stringify(updatedWords));
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    const updatedWords = registeredWords.filter(w => w.word !== wordToRemove);
    setRegisteredWords(updatedWords);
    // localStorageに保存
    localStorage.setItem('registeredWords', JSON.stringify(updatedWords));
  };

  const handleQuizAnswer = (answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: answer }));
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < (results?.quiz.quizzes.length || 0) - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setShowQuiz(false);
    }
  };

  const getQuizScore = () => {
    if (!results) return 0;
    let correct = 0;
    results.quiz.quizzes.forEach((quiz, index) => {
      if (quizAnswers[index] === quiz.answer) {
        correct++;
      }
    });
    return Math.round((correct / results.quiz.quizzes.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>学習データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">学習データが見つかりません</h2>
          <p className="text-muted-foreground mb-4">
            動画の処理が完了していないか、データが保存されていません。
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">LinguaNote AI - 学習モード</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 動画プレイヤー */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                動画プレイヤー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative aspect-video bg-black rounded-lg overflow-hidden"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                {/* プレイヤーコンテナ */}
                <div ref={playerRef} className="w-full h-full" />
                
                {/* ローディング表示 */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>動画を読み込み中...</p>
                    </div>
                  </div>
                )}

                {/* カスタムコントロール */}
                {showControls && !isLoading && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* プログレスバー */}
                    <div className="mb-4">
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        onValueChange={(value) => seekTo(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-white text-sm mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* コントロールボタン */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={isPlaying ? pause : play}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={skipBackward}
                          className="text-white hover:bg-white/20"
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={skipForward}
                          className="text-white hover:bg-white/20"
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 音量コントロール */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            onValueChange={(value) => setVolumeLevel(value[0])}
                            className="w-20"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleFullscreen}
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 字幕エリア */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                字幕・スクリプト
                <Badge variant="secondary">
                  {Math.floor(currentTime)}秒
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[100px] p-4 bg-muted rounded-lg">
                {currentSubtitle ? (
                  <div className="text-lg leading-relaxed">
                    {currentSubtitle.text.split(' ').map((word, index) => (
                      <span
                        key={index}
                        onClick={() => handleWordClick(word)}
                        className="inline-block cursor-pointer hover:bg-blue-100 hover:text-blue-800 px-1 rounded transition-colors"
                        title="クリックして単語を登録"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    動画を再生すると字幕が表示されます
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 登録した単語 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  登録した単語 ({registeredWords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {registeredWords.length > 0 ? (
                  <div className="space-y-2">
                    {registeredWords.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div>
                          <span className="font-medium">{word.word}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {Math.floor(word.timestamp)}秒
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveWord(word.word)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    字幕の単語をクリックして登録してください
                  </p>
                )}
              </CardContent>
            </Card>

            {/* クイズエリア */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  理解度チェック
                  {showQuiz && (
                    <Badge variant="secondary">
                      {currentQuizIndex + 1} / {results.quiz.quizzes.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showQuiz ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      動画の内容を理解できたら、クイズに挑戦しましょう
                    </p>
                    <Button onClick={() => setShowQuiz(true)}>
                      クイズを開始
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded">
                      <h4 className="font-medium mb-2">
                        {results.quiz.quizzes[currentQuizIndex].question}
                      </h4>
                      <div className="space-y-2">
                        {results.quiz.quizzes[currentQuizIndex].choices.map((choice, index) => (
                          <Button
                            key={index}
                            variant={quizAnswers[currentQuizIndex] === choice ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => handleQuizAnswer(choice)}
                          >
                            {choice}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {quizAnswers[currentQuizIndex] && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium">回答完了</span>
                        </div>
                        <p className="text-sm text-green-700">
                          {results.quiz.quizzes[currentQuizIndex].explanation}
                        </p>
                        <Button onClick={handleNextQuiz} className="mt-2">
                          {currentQuizIndex < results.quiz.quizzes.length - 1 ? "次の問題" : "結果を見る"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 学習結果 */}
          {!showQuiz && Object.keys(quizAnswers).length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    学習完了！
                  </h3>
                  <p className="text-green-700 mb-4">
                    正答率: {getQuizScore()}% | 登録単語数: {registeredWords.length}
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setShowQuiz(true)}>
                      クイズを再挑戦
                    </Button>
                    <Button onClick={() => router.push('/dashboard')}>
                      学習を終了
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 