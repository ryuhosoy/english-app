import openai
import json

def extract_keywords_with_gpt(text):
    """OpenAI APIを使用して重要単語・フレーズを抽出"""
    client = openai.OpenAI(
        api_key="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"
    )

    prompt = f"""
    以下の英語のテキストから、重要な単語とフレーズを抽出してください。
    以下の形式でJSONを返してください：
    {{
        "important_words": [
            {{"word": "単語", "meaning": "日本語の意味", "example": "例文"}},
            ...
        ],
        "important_phrases": [
            {{"phrase": "フレーズ", "meaning": "日本語の意味", "example": "例文"}},
            ...
        ]
    }}

    テキスト:
    {text}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts important words and phrases from English text."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # レスポンスからJSONを抽出
        result = json.loads(response.choices[0].message.content)
        return result

    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        return None

def save_to_file(data, filename):
    """結果をファイルに保存"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    # テキストファイルを読み込む
    try:
        with open('transcription.txt', 'r', encoding='utf-8') as f:
            text = f.read()
    except FileNotFoundError:
        print("transcription.txtが見つかりません。")
        return

    # 重要単語・フレーズを抽出
    print("重要単語・フレーズを抽出中...")
    result = extract_keywords_with_gpt(text)

    if result:
        # 結果を表示
        print("\n=== 重要単語 ===")
        for word in result['important_words']:
            print(f"\n単語: {word['word']}")
            print(f"意味: {word['meaning']}")
            print(f"例文: {word['example']}")

        print("\n=== 重要フレーズ ===")
        for phrase in result['important_phrases']:
            print(f"\nフレーズ: {phrase['phrase']}")
            print(f"意味: {phrase['meaning']}")
            print(f"例文: {phrase['example']}")

        # 結果をJSONファイルに保存
        save_to_file(result, 'keywords.json')
        print("\n結果をkeywords.jsonに保存しました。")

if __name__ == "__main__":
    main() 