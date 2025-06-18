import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
  }
  if (!text) {
    return NextResponse.json({ error: 'textが必要です。' }, { status: 400 });
  }

  const prompt = `
以下の英語のテキストから、重要な単語とフレーズを抽出してください。
以下の形式でJSONを返してください：
{
  "important_words": [
    {"word": "単語", "meaning": "日本語の意味", "example": "例文"},
    ...
  ],
  "important_phrases": [
    {"phrase": "フレーズ", "meaning": "日本語の意味", "example": "例文"},
    ...
  ]
}

テキスト:
${text}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that extracts important words and phrases from English text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    // OpenAIの返答からJSON部分を抽出
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      return NextResponse.json({ error: 'OpenAIの返答をパースできませんでした', raw: data }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 