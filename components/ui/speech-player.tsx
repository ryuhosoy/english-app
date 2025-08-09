"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2, Play, Pause, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeechPlayerProps {
  text: string;
  language?: string;
  rate?: number;
  pitch?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
  autoPlay?: boolean;
}

export function SpeechPlayer({
  text,
  language = 'en-US',
  rate = 0.8,
  pitch = 1,
  className = '',
  size = 'md',
  showControls = true,
  autoPlay = false
}: SpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRate, setCurrentRate] = useState(rate);
  const [currentPitch, setCurrentPitch] = useState(pitch);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 音声合成の初期化
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          console.log('音声合成の準備完了');
        });
      }
    }
  }, []);

  // 英語の女性音声を取得する関数
  const getEnglishVoice = () => {
    const voices = speechSynthesis.getVoices();
    
    // アメリカ英語の女性音声を優先
    const usVoices = voices.filter(voice => voice.lang === 'en-US');
    if (usVoices.length > 0) {
      const femaleVoice = usVoices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('alex')
      );
      if (femaleVoice) return femaleVoice;
      return usVoices[0];
    }
    
    // 英語音声が見つからない場合はnull
    return null;
  };

  // 音声再生の開始
  const startSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('音声合成がサポートされていません');
      return;
    }

    // 既存の音声を停止
    speechSynthesis.cancel();

    setIsLoading(true);
    
    // 新しい音声合成を作成
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = currentRate;
    utterance.pitch = currentPitch;
    utterance.volume = isMuted ? 0 : 1;

    // 英語の女性音声を設定
    const englishVoice = getEnglishVoice();
    if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = englishVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    // イベントハンドラーを設定
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    utterance.onerror = (event) => {
      console.error('音声再生エラー:', event.error);
      setIsPlaying(false);
      setIsLoading(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  // 音声再生の停止
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  // 音声再生の一時停止/再開
  const toggleSpeech = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      startSpeech();
    }
  };

  // 音声再生の再開
  const restartSpeech = () => {
    stopSpeech();
    setTimeout(() => {
      startSpeech();
    }, 100);
  };

  // 音量の切り替え
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : 1;
    }
  };

  // 速度の変更
  const changeRate = (newRate: number) => {
    setCurrentRate(newRate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = newRate;
    }
  };

  // ピッチの変更
  const changePitch = (newPitch: number) => {
    setCurrentPitch(newPitch);
    if (utteranceRef.current) {
      utteranceRef.current.pitch = newPitch;
    }
  };

  // 自動再生
  useEffect(() => {
    if (autoPlay && text) {
      startSpeech();
    }
  }, [autoPlay, text]);

  // コンポーネントのアンマウント時に音声を停止
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // 音声合成がサポートされていない場合
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        音声再生はお使いのブラウザではサポートされていません
      </div>
    );
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* メイン再生ボタン */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSpeech}
        disabled={isLoading || !text}
        className={cn(sizeClasses[size], "hover:bg-primary/10")}
        title={`${text}の発音を聞く`}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        ) : isPlaying ? (
          <Pause className={iconSizes[size]} />
        ) : (
          <Play className={iconSizes[size]} />
        )}
      </Button>

      {showControls && (
        <>
          {/* 音量ボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            disabled={!text}
            className={cn(sizeClasses[size], "h-8 w-8")}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          {/* 再開ボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={restartSpeech}
            disabled={!text}
            className="h-8 w-8"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          {/* 速度調整 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">速度:</span>
            <select
              value={currentRate}
              onChange={(e) => changeRate(parseFloat(e.target.value))}
              className="text-xs border rounded px-1 py-0.5"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* ピッチ調整 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">ピッチ:</span>
            <select
              value={currentPitch}
              onChange={(e) => changePitch(parseFloat(e.target.value))}
              className="text-xs border rounded px-1 py-0.5"
            >
              <option value={0.5}>低</option>
              <option value={0.75}>やや低</option>
              <option value={1}>標準</option>
              <option value={1.25}>やや高</option>
              <option value={1.5}>高</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
} 