import { supabase } from './supabase';
import { getYouTubeThumbnailUrl } from './utils';

// YouTubeビデオIDからデータベースのvideo_idを取得または作成する関数
export async function getOrCreateVideoId(
  userId: string,
  youtubeVideoId: string,
  videoUrl: string,
  title?: string
): Promise<string> {
  try {
    console.log('getOrCreateVideoId開始:', { userId, youtubeVideoId, videoUrl, title });
    
    // タイムアウト付きで既存の動画を検索
    console.log('既存動画検索開始（タイムアウト: 5秒）');
    
    const searchPromise = supabase
      .from('videos')
      .select('id')
      .eq('user_id', userId)
      .eq('youtube_url', videoUrl)
      .maybeSingle();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('検索タイムアウト')), 5000); // 5秒でタイムアウト
    });
    
    let existingVideo, searchError;
    
    try {
      const result = await Promise.race([searchPromise, timeoutPromise]) as any;
      existingVideo = result.data;
      searchError = result.error;
      console.log('検索結果:', { existingVideo, searchError });
    } catch (timeoutError) {
      console.warn('検索がタイムアウトしました。新しい動画として処理します:', timeoutError);
      existingVideo = null;
      searchError = null;
    }

    if (searchError) {
      console.error('動画検索エラー:', searchError);
      throw searchError;
    }

    // 既存の動画が見つかった場合はそのIDを返す
    if (existingVideo) {
      console.log('既存の動画が見つかりました:', existingVideo.id);
      return existingVideo.id;
    }

    // 新しい動画を作成
    console.log('新しい動画作成開始');
    
    // YouTube URLからサムネイルURLを生成
    const thumbnailUrl = getYouTubeThumbnailUrl(videoUrl);
    console.log('生成されたサムネイルURL:', thumbnailUrl);
    
    const { data: newVideo, error: createError } = await supabase
      .from('videos')
      .insert({
        user_id: userId,
        youtube_url: videoUrl,
        title: title || `YouTube Video ${youtubeVideoId}`,
        thumbnail_url: thumbnailUrl,
        processed_at: new Date().toISOString()
      })
      .select('id')
      .single();

    console.log('動画作成結果:', { newVideo, createError });

    if (createError) {
      console.error('動画作成エラー:', createError);
      throw createError;
    }

    console.log('新しい動画を作成しました:', newVideo.id);
    return newVideo.id;
  } catch (error) {
    console.error('動画ID取得/作成エラー:', error);
    
    // データベースエラーの場合、ダミーのUUIDを返す（フォールバック）
    if (error instanceof Error && error.message.includes('relation "videos" does not exist')) {
      console.log('videosテーブルが存在しないため、ダミーUUIDを返します');
      return '00000000-0000-0000-0000-000000000000';
    }
    
    throw error;
  }
}

// ユーザー進捗データを初期化する関数
export async function initializeUserProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        total_study_time_hours: 0,
        total_videos_watched: 0,
        total_words_learned: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        level: 'beginner',
        experience_points: 0
      })
      .select()
      .single();

    if (error) {
      console.error('ユーザー進捗初期化エラー:', error);
      throw error;
    }

    console.log('ユーザー進捗初期化完了:', data);
    return data;
  } catch (error) {
    console.error('ユーザー進捗初期化エラー:', error);
    throw error;
  }
}

// 学習セッションを記録する関数
export async function recordStudySession(
  userId: string,
  videoId: string,
  sessionType: 'video_watch' | 'vocabulary_review' | 'quiz',
  durationMinutes: number,
  score?: number,
  wordsLearnedCount: number = 0
) {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        video_id: videoId,
        session_type: sessionType,
        duration_minutes: durationMinutes,
        score,
        words_learned_count: wordsLearnedCount,
        session_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      console.error('学習セッション記録エラー:', error);
      throw error;
    }

    console.log('学習セッション記録完了:', data);
    return data;
  } catch (error) {
    console.error('学習セッション記録エラー:', error);
    throw error;
  }
}

// ユーザー進捗を更新する関数
export async function updateUserProgress(
  userId: string,
  updates: {
    total_study_time_hours?: number;
    total_videos_watched?: number;
    total_words_learned?: number;
    current_streak_days?: number;
    longest_streak_days?: number;
    level?: string;
    experience_points?: number;
    last_study_date?: string;
  }
) {
  try {
    // まず現在の進捗データを取得
    let { data: currentProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // single()からmaybeSingle()に変更

    if (fetchError) {
      console.error('現在の進捗データ取得エラー:', fetchError);
      throw fetchError;
    }

    // データが存在しない場合は初期化
    if (!currentProgress) {
      console.log('ユーザー進捗データが存在しないため、初期化します');
      await initializeUserProgress(userId);
      // 初期化後に再度取得
      const { data: initializedProgress, error: retryError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (retryError) {
        console.error('初期化後のデータ取得エラー:', retryError);
        throw retryError;
      }
      
      if (!initializedProgress) {
        throw new Error('ユーザー進捗データの初期化に失敗しました');
      }
      
      currentProgress = initializedProgress;
    }

    // 新しい値を計算（既存の値に加算）
    const newValues: any = {
      total_study_time_hours: (currentProgress?.total_study_time_hours || 0) + (updates.total_study_time_hours || 0),
      total_videos_watched: (currentProgress?.total_videos_watched || 0) + (updates.total_videos_watched || 0),
      total_words_learned: (currentProgress?.total_words_learned || 0) + (updates.total_words_learned || 0),
      experience_points: (currentProgress?.experience_points || 0) + (updates.experience_points || 0),
      updated_at: new Date().toISOString()
    };

    // 直接指定された値は上書き
    if (updates.current_streak_days !== undefined) {
      newValues.current_streak_days = updates.current_streak_days;
    }
    if (updates.longest_streak_days !== undefined) {
      newValues.longest_streak_days = updates.longest_streak_days;
    }
    if (updates.level !== undefined) {
      newValues.level = updates.level;
    }
    if (updates.last_study_date !== undefined) {
      newValues.last_study_date = updates.last_study_date;
    }

    const { data, error } = await supabase
      .from('user_progress')
      .update(newValues)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('ユーザー進捗更新エラー:', error);
      throw error;
    }

    console.log('ユーザー進捗更新完了:', data);
    return data;
  } catch (error) {
    console.error('ユーザー進捗更新エラー:', error);
    throw error;
  }
}

// 単語を保存する関数
export async function saveVocabularyWord(
  userId: string,
  videoId: string,
  word: string,
  meaning: string,
  partOfSpeech?: string,
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
) {
  try {
    const { data, error } = await supabase
      .from('vocabulary_words')
      .insert({
        user_id: userId,
        video_id: videoId,
        word,
        meaning,
        part_of_speech: partOfSpeech,
        difficulty_level: difficultyLevel,
        review_count: 0,
        mastered: false
      })
      .select()
      .single();

    if (error) {
      console.error('単語保存エラー:', error);
      throw error;
    }

    console.log('単語保存完了:', data);
    return data;
  } catch (error) {
    console.error('単語保存エラー:', error);
    throw error;
  }
}

// 単語の習得状態を更新する関数
export async function updateVocabularyWordMastery(
  wordId: string,
  mastered: boolean,
  reviewCount?: number
) {
  try {
    const updateData: any = {
      mastered,
      last_reviewed_at: new Date().toISOString()
    };

    if (reviewCount !== undefined) {
      updateData.review_count = reviewCount;
    }

    const { data, error } = await supabase
      .from('vocabulary_words')
      .update(updateData)
      .eq('id', wordId)
      .select()
      .single();

    if (error) {
      console.error('単語習得状態更新エラー:', error);
      throw error;
    }

    console.log('単語習得状態更新完了:', data);
    return data;
  } catch (error) {
    console.error('単語習得状態更新エラー:', error);
    throw error;
  }
}

// 動画の完了状態を更新する関数
export async function updateVideoCompletion(
  videoId: string,
  completed: boolean,
  score?: number,
  wordsLearnedCount?: number
) {
  try {
    const updateData: any = {
      completed_at: completed ? new Date().toISOString() : null
    };

    if (score !== undefined) {
      updateData.score = score;
    }

    if (wordsLearnedCount !== undefined) {
      updateData.words_learned_count = wordsLearnedCount;
    }

    const { data, error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', videoId)
      .select()
      .single();

    if (error) {
      console.error('動画完了状態更新エラー:', error);
      throw error;
    }

    console.log('動画完了状態更新完了:', data);
    return data;
  } catch (error) {
    console.error('動画完了状態更新エラー:', error);
    throw error;
  }
} 