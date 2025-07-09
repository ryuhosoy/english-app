import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
以下の英語の会話文から、理解度を測るためのクイズを生成してください。
各クイズは以下の形式でJSONを返してください：
{
  "quizzes": [
    {
      "question": "問題文（英語）",
      "choices": [
        "選択肢1（英語）",
        "選択肢2（英語）",
        "選択肢3（英語）",
        "選択肢4（英語）"
      ],
      "answer": "正解の選択肢（英語）",
      "explanation": "解説（英語）"
    },
    ...
  ]
}

クイズの種類：
1. 会話の内容に関する質問
2. 重要な単語やフレーズの意味を問う質問
3. 文脈を理解しているかを問う質問
4. 話者の意図を理解しているかを問う質問

会話文：
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
          { role: 'system', content: 'You are a helpful assistant that creates English comprehension quizzes.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log('response:', response);

    const data = await response.json();
    let quizzes;
    try {
      const parsed = JSON.parse(data.choices[0].message.content);
      quizzes = parsed.quizzes;
    } catch (e) {
      return NextResponse.json({ error: 'OpenAIの返答をパースできませんでした', raw: data }, { status: 500 });
    }
    return NextResponse.json({ quizzes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 