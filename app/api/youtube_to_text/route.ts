import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';
import { tmpdir } from 'os';
import path from 'path';
import { createWriteStream, unlink, readFileSync } from 'fs';
import FormData from 'form-data';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
  }
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: 'YouTubeのURLが必要です。' }, { status: 400 });
  }

  // 一時ファイルパス生成
  const tempPath = path.join(tmpdir(), `${Date.now()}.mp4`);

  // YouTube動画をダウンロード
  try {
    await new Promise((resolve, reject) => {
      const stream = ytdl(url, { quality: 'highestaudio', filter: 'audioandvideo' })
        .pipe(createWriteStream(tempPath));
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'YouTube動画のダウンロードに失敗しました', detail: e.message }, { status: 500 });
  }

  // Whisper APIへ送信
  const form = new FormData();
  form.append('file', readFileSync(tempPath), { filename: 'audio.mp4', contentType: 'video/mp4' });
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...form.getHeaders(),
      },
      body: form as any,
    } as any);
    const data = await response.json();
    unlink(tempPath, () => {});
    if (data.text) {
      return NextResponse.json({ text: data.text });
    } else {
      return NextResponse.json({ error: 'Whisper APIの返答が不正です', raw: data }, { status: 500 });
    }
  } catch (e: any) {
    unlink(tempPath, () => {});
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 