import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createWriteStream, unlink, readFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';

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
        // '--max-filesize', '25M',  // 25MB制限
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
    
    // if (stats.size > 25 * 1024 * 1024) {  // 25MB制限
    //   console.log('File too large, attempting to reduce quality...');
    //   // ファイルが大きすぎる場合は削除して再試行
    //   unlink(actualFilePath, () => {});
    //   throw new Error('File size exceeds 25MB limit');
    // }
  } catch (e: any) {
    console.log('File check error:', e.message);
    unlink(actualFilePath, () => {});
    return NextResponse.json({ error: 'ダウンロードしたファイルが無効です', detail: e.message }, { status: 500 });
  }

  // Whisper APIへ送信の前に音声ファイルを分割
  const chunkLength = 600; // 10分ごと（秒）
  let chunkPaths: string[] = [];
  let allText = '';
  try {
    // ffmpegで音声長取得
    const ffprobeOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${actualFilePath}"`).toString();
    console.log('FFprobe output:', ffprobeOut);
    const duration = Math.ceil(parseFloat(ffprobeOut));
    console.log('Duration:', duration);
    const numChunks = Math.ceil(duration / chunkLength);
    console.log('Number of chunks:', numChunks);
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkLength;
      const end = Math.min((i + 1) * chunkLength, duration);
      const length = end - start;
      const chunkPath = path.join(tempDir, `${Date.now()}_${i}_chunk.mp3`);
      try {
        execSync(`ffmpeg -y -i "${actualFilePath}" -ss ${start} -t ${length} -acodec libmp3lame "${chunkPath}"`);
        const stats = statSync(chunkPath);
        if (stats.size < 1024) {
          console.log(`チャンク${i}はサイズが小さすぎるためスキップ`);
          unlink(chunkPath, () => {});
          continue;
        }
        chunkPaths.push(chunkPath);
      } catch (e) {
        console.log(`チャンク${i}の作成に失敗:`, e);
        if (existsSync(chunkPath)) unlink(chunkPath, () => {});
      }
    }
  } catch (e: any) {
    console.log('ffmpeg分割エラー:', e.message);
    unlink(actualFilePath, () => {});
    return NextResponse.json({ error: '音声分割に失敗しました', detail: e.message }, { status: 500 });
  }

  // 各分割ファイルをWhisper APIで文字起こし
  try {
    let allSrt = '';
    let allText = '';
    let srtIndex = 1;
    for (let i = 0; i < chunkPaths.length; i++) {
      console.log('chunk', i, 'Whisper API start');
      const chunkPath = chunkPaths[i];
      const formData = new FormData();
      const fileBuffer = readFileSync(chunkPath);
      const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
      formData.append('file', blob, `audio_chunk${i}.mp3`);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'srt');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      }); 
      const srtText = await response.text(); // SRTはtextで受け取る
      if (srtText) {
        // チャンクの開始秒数を計算
        const offsetSec = i * chunkLength;
        // タイムスタンプをシフト
        const shiftedSrt = shiftSrtTimestampsAndRenumber(srtText, offsetSec, srtIndex);
        // 連番の次の開始番号を計算
        srtIndex += countSrtBlocks(srtText);
        allSrt += shiftedSrt + '\n';
        // SRTからテキスト部分のみを抽出してallTextに追加
        allText += extractTextFromSrt(srtText) + '\n';
        console.log('chunk', i, 'Whisper API response:', srtText);
      } else {
        console.log('Whisper API error response:', srtText);
      }
      // unlink(chunkPath, () => {});
    }
    // unlink(actualFilePath, () => {});
    return NextResponse.json({ srt: allSrt, text: allText });
  } catch (e: any) {
    chunkPaths.forEach(p => unlink(p, () => {}));
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

function shiftSrtTimestamps(srt: string, offsetSec: number): string {
  return srt.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, (_, h, m, s, ms) => {
    let totalMs = ((+h) * 3600 + (+m) * 60 + (+s) + offsetSec) * 1000 + (+ms);
    let nh = Math.floor(totalMs / 3600000);
    let nm = Math.floor((totalMs % 3600000) / 60000);
    let ns = Math.floor((totalMs % 60000) / 1000);
    let nms = totalMs % 1000;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')},${String(nms).padStart(3, '0')}`;
  });
} 

// SRTのタイムスタンプをシフトし、字幕番号も連番に振り直す
function shiftSrtTimestampsAndRenumber(srt: string, offsetSec: number, startIndex: number): string {
  const blocks = srt.trim().split(/\n\s*\n/);
  let result = '';
  let idx = startIndex;
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      // 1行目: 番号, 2行目: タイムスタンプ, 3行目以降: テキスト
      const timeLine = lines[1];
      const shiftedTimeLine = timeLine.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/, (_: any, h1: string, m1: string, s1: string, ms1: string, h2: string, m2: string, s2: string, ms2: string) => {
        const startMs = ((+h1) * 3600 + (+m1) * 60 + (+s1) + offsetSec) * 1000 + (+ms1);
        const endMs = ((+h2) * 3600 + (+m2) * 60 + (+s2) + offsetSec) * 1000 + (+ms2);
        const sh = String(Math.floor(startMs / 3600000)).padStart(2, '0');
        const sm = String(Math.floor((startMs % 3600000) / 60000)).padStart(2, '0');
        const ss = String(Math.floor((startMs % 60000) / 1000)).padStart(2, '0');
        const sms = String(startMs % 1000).padStart(3, '0');
        const eh = String(Math.floor(endMs / 3600000)).padStart(2, '0');
        const em = String(Math.floor((endMs % 3600000) / 60000)).padStart(2, '0');
        const es = String(Math.floor((endMs % 60000) / 1000)).padStart(2, '0');
        const ems = String(endMs % 1000).padStart(3, '0');
        return `${sh}:${sm}:${ss},${sms} --> ${eh}:${em}:${es},${ems}`;
      });
      // 新しいブロックを作成
      result += `${idx}\n${shiftedTimeLine}\n${lines.slice(2).join('\n')}\n\n`;
      idx++;
    }
  }
  return result.trim();
}

// SRTブロック数を数える
function countSrtBlocks(srt: string): number {
  return srt.trim().split(/\n\s*\n/).filter(b => b.trim()).length;
} 

// SRTからテキスト部分のみを抽出する関数
function extractTextFromSrt(srt: string): string {
  const blocks = srt.trim().split(/\n\s*\n/);
  const texts: string[] = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      // 3行目以降がテキスト部分
      texts.push(lines.slice(2).join(' '));
    }
  }
  return texts.join(' ');
} 