import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// データベーススキーマの型定義
export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          user_id: string
          youtube_url: string
          title: string
          thumbnail_url?: string
          duration?: string
          processed_at: string
          completed_at?: string
          score?: number
          words_learned_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          youtube_url: string
          title: string
          thumbnail_url?: string
          duration?: string
          processed_at: string
          completed_at?: string
          score?: number
          words_learned_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          youtube_url?: string
          title?: string
          thumbnail_url?: string
          duration?: string
          processed_at?: string
          completed_at?: string
          score?: number
          words_learned_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      vocabulary_words: {
        Row: {
          id: string
          user_id: string
          video_id: string
          word: string
          meaning: string
          part_of_speech?: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          review_count: number
          last_reviewed_at?: string
          mastered: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          word: string
          meaning: string
          part_of_speech?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          review_count?: number
          last_reviewed_at?: string
          mastered?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          word?: string
          meaning?: string
          part_of_speech?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          review_count?: number
          last_reviewed_at?: string
          mastered?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          video_id: string
          session_type: 'video_watch' | 'vocabulary_review' | 'quiz'
          duration_minutes: number
          score?: number
          words_learned_count: number
          session_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          session_type: 'video_watch' | 'vocabulary_review' | 'quiz'
          duration_minutes: number
          score?: number
          words_learned_count?: number
          session_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          session_type?: 'video_watch' | 'vocabulary_review' | 'quiz'
          duration_minutes?: number
          score?: number
          words_learned_count?: number
          session_date?: string
          created_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          total_study_time_hours: number
          total_videos_watched: number
          total_words_learned: number
          current_streak_days: number
          longest_streak_days: number
          level: string
          experience_points: number
          last_study_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_study_time_hours?: number
          total_videos_watched?: number
          total_words_learned?: number
          current_streak_days?: number
          longest_streak_days?: number
          level?: string
          experience_points?: number
          last_study_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_study_time_hours?: number
          total_videos_watched?: number
          total_words_learned?: number
          current_streak_days?: number
          longest_streak_days?: number
          level?: string
          experience_points?: number
          last_study_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 