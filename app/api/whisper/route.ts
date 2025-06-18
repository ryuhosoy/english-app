import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { createWriteStream, unlink } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
  }

  // formDataからファイル取得
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: '音声ファイルが必要です。' }, { status: 400 });
  }

  // 一時ファイルに保存
  const tempPath = path.join(tmpdir(), `${Date.now()}_${file.name}`);
  const arrayBuffer = await file.arrayBuffer();
  await new Promise((resolve, reject) => {
    const stream = createWriteStream(tempPath);
    stream.on('finish', resolve);
    stream.on('error', reject);
    stream.end(Buffer.from(arrayBuffer));
  });

  // Whisper APIへ送信
  const form = new FormData();
  form.append('file', new Blob([Buffer.from(arrayBuffer)]), file.name);
  form.append('model', 'whisper-1');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: form,
    });
    const data = await response.json();
    // 一時ファイル削除
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