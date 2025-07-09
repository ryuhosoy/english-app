import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createWriteStream, unlink, readFileSync, mkdirSync, existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('=== YouTube to Text API Called ===');
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('ERROR: No OpenAI API key');
    return NextResponse.json({ error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
  }
  
  const { url } = await req.json();
  if (!url) {
    console.log('ERROR: No URL provided');
    return NextResponse.json({ error: 'YouTubeのURLが必要です。' }, { status: 400 });
  }

  console.log('Processing URL:', url);

  // YouTube URLからビデオIDを抽出
  const videoId = extractVideoId(url);
  if (!videoId) {
    console.log('ERROR: Invalid YouTube URL');
    return NextResponse.json({ error: '無効なYouTube URLです。' }, { status: 400 });
  }

  console.log('Video ID:', videoId);

  // プロジェクト内のtempディレクトリを使用
  const tempDir = path.join(process.cwd(), 'temp');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  
  // 一時ファイルパス生成（音声ファイル用）
  const tempPath = path.join(tempDir, `${Date.now()}.mp3`);
  console.log('Temp file path:', tempPath);

  // YouTube動画を音声としてダウンロード（yt-dlpを使用）
  try {
    console.log('Starting yt-dlp audio download...');
    const { spawn } = await import('child_process');
    
    await new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '-f', 'bestaudio[ext=m4a]/best[ext=mp4]/best',  // 音声優先、フォールバック
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',  // 最高品質
        '--max-filesize', '25M',  // 25MB制限
        '--no-part',  // .partファイルを作成しない
        '--retries', '3',  // リトライ回数
        '--fragment-retries', '3',  // フラグメントリトライ回数
        '-o', tempPath.replace('.mp3', '.%(ext)s'),  // 拡張子を自動設定
        `https://www.youtube.com/watch?v=${videoId}`
      ]);
      
      ytdlp.on('close', (code) => {
        if (code === 0) {
          console.log('yt-dlp audio download completed successfully');
          resolve(true);
        } else {
          console.log('yt-dlp failed with code:', code);
          reject(new Error(`yt-dlp failed with code ${code}`));
        }
      });
      
      ytdlp.on('error', (err) => {
        console.log('yt-dlp error:', err);
        reject(err);
      });
    });
  } catch (e: any) {
    console.log('Download error:', e.message);
    return NextResponse.json({ 
      error: 'YouTube動画のダウンロードに失敗しました', 
      detail: e.message,
      suggestion: 'yt-dlpがインストールされているか確認してください'
    }, { status: 500 });
  }

  // 実際のファイルパスを確認（拡張子が変わっている可能性）
  let actualFilePath = tempPath;
  try {
    const fs = await import('fs');
    const pathModule = await import('path');
    
    // プロジェクト内のtempディレクトリ内のファイルを検索
    const files = fs.readdirSync(tempDir);
    const downloadedFile = files.find(file => 
      file.includes(path.basename(tempPath, '.mp3')) && 
      (file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.mp4')) &&
      !file.endsWith('.part')  // .partファイルを除外
    );
    
    if (downloadedFile) {
      actualFilePath = path.join(tempDir, downloadedFile);
      console.log('Found downloaded file:', actualFilePath);
    } else {
      throw new Error('Downloaded file not found');
    }
    
    const stats = fs.statSync(actualFilePath);
    console.log('Downloaded file size:', stats.size, 'bytes');
    
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }
    
    if (stats.size > 25 * 1024 * 1024) {  // 25MB制限
      console.log('File too large, attempting to reduce quality...');
      // ファイルが大きすぎる場合は削除して再試行
      unlink(actualFilePath, () => {});
      throw new Error('File size exceeds 25MB limit');
    }
  } catch (e: any) {
    console.log('File check error:', e.message);
    unlink(actualFilePath, () => {});
    return NextResponse.json({ error: 'ダウンロードしたファイルが無効です', detail: e.message }, { status: 500 });
  }

  // Whisper APIへ送信
  console.log('Sending to Whisper API...');
  try {
    const formData = new FormData();
    const fileBuffer = readFileSync(actualFilePath);
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    console.log('FormData created, sending request...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    console.log('Whisper API response status:', response.status);
    
    const data = await response.json();
    console.log('Whisper API response:', data);
    
    unlink(actualFilePath, () => {});
    
    if (data.text) {
      console.log('Transcription successful, text length:', data.text.length);
      return NextResponse.json({ text: data.text });
    } else {
      console.log('Whisper API error response:', data);
      return NextResponse.json({ error: 'Whisper APIの返答が不正です', raw: data }, { status: 500 });
    }
  } catch (e: any) {
    console.log('Whisper API error:', e.message);
    unlink(actualFilePath, () => {});
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// YouTube URLからビデオIDを抽出する関数
function extractVideoId(url: string): string {
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