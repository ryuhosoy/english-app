import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractVideoId(url: string): string {
  if (!url) return "";
  
  // Handle youtube.com/watch?v= format
  let match = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (match) return match[1];
  
  // Handle youtu.be/ format
  match = url.match(/youtu\.be\/([^?]+)/);
  if (match) return match[1];
  
  // Handle youtube.com/embed/ format
  match = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (match) return match[1];
  
  return "";
}

// YouTubeのサムネイルURLを取得する関数
export function getYouTubeThumbnailUrl(youtubeUrl: string): string {
  try {
    // YouTube URLからビデオIDを抽出
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return '/placeholder-video.jpg';
    }
    
    // 高品質のサムネイルURLを返す
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  } catch (error) {
    console.error('YouTubeサムネイルURL取得エラー:', error);
    return '/placeholder-video.jpg';
  }
}

// YouTube URLからビデオIDを抽出する関数
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('YouTubeビデオID抽出エラー:', error);
    return null;
  }
}

// 動画の長さをフォーマットする関数
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}