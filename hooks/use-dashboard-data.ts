import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { getYouTubeThumbnailUrl } from '@/lib/utils';
import { calculateStreakDays } from '@/lib/dashboard-utils';

export interface Video {
  id: string;
  user_id: string;
  youtube_url: string;
  title: string;
  thumbnail_url?: string;
  duration?: string;
  processed_at: string;
  completed_at?: string;
  score?: number;
  words_learned_count: number;
  created_at: string;
  updated_at: string;
}

export interface VocabularyWord {
  id: string;
  user_id: string;
  video_id: string;
  word: string;
  meaning: string;
  part_of_speech?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  review_count: number;
  last_reviewed_at?: string;
  mastered: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  video_id: string;
  session_type: 'video_watch' | 'vocabulary_review' | 'quiz';
  duration_minutes: number;
  score?: number;
  words_learned_count: number;
  session_date: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  total_study_time_hours: number;
  total_videos_watched: number;
  total_words_learned: number;
  current_streak_days: number;
  longest_streak_days: number;
  level: string;
  experience_points: number;
  last_study_date?: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyProgress {
  day: string;
  videos: number;
  words: number;
}

export interface TodayGoal {
  name: string;
  completed: number;
  goal: number;
  progress: number;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('ダッシュボードデータ取得開始:', { userId: user.id });

        // 並行してデータを取得
        const [
          videosResult,
          vocabularyResult,
          sessionsResult,
          progressResult
        ] = await Promise.all([
          // 最近の動画を取得
          supabase
            .from('videos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),

          // 単語帳を取得（習得済みでないものを優先）
          supabase
            .from('vocabulary_words')
            .select('*')
            .eq('user_id', user.id)
            .order('mastered', { ascending: true })
            .order('last_reviewed_at', { ascending: true })
            .limit(20),

          // 最近の学習セッションを取得
          supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),

          // ユーザー進捗を取得
          supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single()
        ]);

        // エラーチェック
        if (videosResult.error) {
          console.error('動画データ取得エラー:', videosResult.error);
          throw new Error(`動画データの取得に失敗しました: ${videosResult.error.message}`);
        }
        
        if (vocabularyResult.error) {
          console.error('単語データ取得エラー:', vocabularyResult.error);
          throw new Error(`単語データの取得に失敗しました: ${vocabularyResult.error.message}`);
        }
        
        if (sessionsResult.error) {
          console.error('セッションデータ取得エラー:', sessionsResult.error);
          throw new Error(`セッションデータの取得に失敗しました: ${sessionsResult.error.message}`);
        }
        
        if (progressResult.error && progressResult.error.code !== 'PGRST116') {
          console.error('進捗データ取得エラー:', progressResult.error);
          throw new Error(`進捗データの取得に失敗しました: ${progressResult.error.message}`);
        }

        // データを設定
        setVideos(videosResult.data || []);
        setVocabularyWords(vocabularyResult.data || []);
        setStudySessions(sessionsResult.data || []);
        setUserProgress(progressResult.data);

        // 連続学習日数を再計算（必要に応じて）
        if (sessionsResult.data && sessionsResult.data.length > 0) {
          try {
            const { current: currentStreak, longest: longestStreak } = await calculateStreakDays(user.id);
            if (progressResult.data) {
              // 進捗データが存在する場合は連続日数を更新
              if (currentStreak !== progressResult.data.current_streak_days || 
                  longestStreak !== progressResult.data.longest_streak_days) {
                await supabase
                  .from('user_progress')
                  .update({
                    current_streak_days: currentStreak,
                    longest_streak_days: longestStreak
                  })
                  .eq('user_id', user.id);
                
                // ローカル状態も更新
                setUserProgress(prev => prev ? {
                  ...prev,
                  current_streak_days: currentStreak,
                  longest_streak_days: longestStreak
                } : null);
              }
            }
          } catch (streakError) {
            console.warn('連続学習日数計算エラー（無視）:', streakError);
          }
        }

        console.log('ダッシュボードデータ取得完了:', {
          videosCount: videosResult.data?.length || 0,
          vocabularyCount: vocabularyResult.data?.length || 0,
          sessionsCount: sessionsResult.data?.length || 0,
          hasProgress: !!progressResult.data
        });

      } catch (err) {
        console.error('ダッシュボードデータ取得エラー:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // 週間の学習進捗を計算
  const weeklyProgress = (): WeeklyProgress[] => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklySessions = studySessions.filter(session => {
      const sessionDate = new Date(session.session_date);
      return sessionDate >= weekAgo && sessionDate <= today;
    });

    // 過去7日間の日付と曜日を正しく計算
    const progress = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      const daySessions = weeklySessions.filter(session => {
        const sessionDate = new Date(session.session_date);
        return sessionDate.toDateString() === targetDate.toDateString();
      });

      // 曜日を日本語で取得
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const dayName = dayNames[targetDate.getDay()];

      progress.push({
        day: dayName,
        videos: daySessions.filter(s => s.session_type === 'video_watch').length,
        words: daySessions.reduce((sum, s) => sum + s.words_learned_count, 0)
      });
    }

    return progress;
  };

  // 今日の目標進捗を計算
  const todayGoals = (): TodayGoal[] => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = studySessions.filter(session => 
      session.session_date === today
    );

    const videoGoal = 2;
    const vocabularyGoal = 10;
    const quizGoal = 1;

    const completedVideos = todaySessions.filter(s => s.session_type === 'video_watch').length;
    const completedVocabulary = todaySessions.filter(s => s.session_type === 'vocabulary_review').length;
    const completedQuizzes = todaySessions.filter(s => s.session_type === 'quiz').length;

    return [
      {
        name: '動画学習',
        completed: completedVideos,
        goal: videoGoal,
        progress: Math.min((completedVideos / videoGoal) * 100, 100)
      },
      {
        name: '単語復習',
        completed: completedVocabulary,
        goal: vocabularyGoal,
        progress: Math.min((completedVocabulary / vocabularyGoal) * 100, 100)
      },
      {
        name: 'クイズ挑戦',
        completed: completedQuizzes,
        goal: quizGoal,
        progress: Math.min((completedQuizzes / quizGoal) * 100, 100)
      }
    ];
  };

  // 最近の動画を取得（サムネイル付き）
  const recentVideos = videos.map(video => ({
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail_url || getYouTubeThumbnailUrl(video.youtube_url),
    duration: video.duration || '00:00',
    completedAt: video.completed_at ? new Date(video.completed_at).toLocaleDateString('ja-JP') : '未完了',
    score: video.score || 0,
    wordsLearned: video.words_learned_count
  }));

  // 保存された単語を取得
  const savedWords = vocabularyWords.map(word => ({
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    partOfSpeech: word.part_of_speech || '不明',
    difficulty: word.difficulty_level,
    reviewCount: word.review_count,
    lastReviewed: word.last_reviewed_at ? new Date(word.last_reviewed_at).toLocaleDateString('ja-JP') : '未復習',
    mastered: word.mastered
  }));

  return {
    videos,
    vocabularyWords,
    studySessions,
    userProgress,
    recentVideos,
    savedWords,
    weeklyProgress: weeklyProgress(),
    todayGoals: todayGoals(),
    loading,
    error
  };
} 