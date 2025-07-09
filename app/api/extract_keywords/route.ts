import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('=== API Route Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  const { text } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  console.log('=== Request Data ===');
  console.log('Text length:', text?.length || 0);
  console.log('API Key exists:', !!apiKey);
  console.log('API Key prefix:', apiKey?.substring(0, 10) + '...');

  if (!apiKey) {
    console.log('ERROR: No API key found');
    return NextResponse.json({ error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
  }
  if (!text) {
    console.log('ERROR: No text provided');
    return NextResponse.json({ error: 'textが必要です。' }, { status: 400 });
  }

  console.log('=== Processing Request ===');

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
    console.log('=== Calling OpenAI API ===');
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

    console.log('OpenAI response status:', response.status);
    const data = await response.json();
    console.log('data.choices[0].message:', data.choices[0].message);
    console.log('OpenAI response received');
    
    // OpenAIの返答からJSON部分を抽出
    let result;
    try {
      result = data.choices[0].message.content;
      console.log('result:', result);
      console.log('=== Success ===');
      // console.log('Extracted words count:', result.important_words?.length || 0);
    } catch (e) {
      console.log('ERROR: Failed to parse OpenAI response');
      console.log('Raw response:', data);
      return NextResponse.json({ error: 'OpenAIの返答をパースできませんでした', raw: data }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e: any) {
    console.log('ERROR: API call failed');
    console.log('Error message:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 