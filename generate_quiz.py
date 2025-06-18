import json
import openai
from typing import List, Dict

def read_transcription_file(filename: str = "transcription.txt") -> str:
    """トランスクリプションファイルを読み込む"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"エラー: {filename}が見つかりません。")
        return ""
    except Exception as e:
        print(f"エラー: ファイルの読み込み中に問題が発生しました: {str(e)}")
        return ""

def generate_quiz_with_gpt(text: str) -> List[Dict]:
    """OpenAI APIを使用してクイズを生成"""
    client = openai.OpenAI(
        api_key="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"
    )

    prompt = f"""
    以下の英語の会話文から、理解度を測るためのクイズを生成してください。
    各クイズは以下の形式でJSONを返してください：
    {{
        "quizzes": [
            {{
                "question": "問題文（英語）",
                "choices": [
                    "選択肢1（英語）",
                    "選択肢2（英語）",
                    "選択肢3（英語）",
                    "選択肢4（英語）"
                ],
                "answer": "正解の選択肢（英語）",
                "explanation": "解説（英語）"
            }},
            ...
        ]
    }}

    クイズの種類：
    1. 会話の内容に関する質問
    2. 重要な単語やフレーズの意味を問う質問
    3. 文脈を理解しているかを問う質問
    4. 話者の意図を理解しているかを問う質問

    会話文：
    {text}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates English comprehension quizzes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        # レスポンスからJSONを抽出
        result = json.loads(response.choices[0].message.content)
        return result.get('quizzes', [])

    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        return []

def save_quiz_to_json(quizzes: List[Dict], filename: str = "quiz.json"):
    """クイズをJSONファイルに保存"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump({"quizzes": quizzes}, f, ensure_ascii=False, indent=2)

def main():
    # トランスクリプションファイルを読み込む
    print("トランスクリプションファイルを読み込み中...")
    text = read_transcription_file()
    
    if not text:
        print("トランスクリプションの読み込みに失敗しました。")
        return
    
    # クイズを生成
    print("クイズを生成中...")
    quizzes = generate_quiz_with_gpt(text)
    
    if quizzes:
        # JSONファイルに保存
        save_quiz_to_json(quizzes)
        print("クイズが生成され、quiz.jsonに保存されました。")
        
        # 生成されたクイズの数を表示
        print(f"生成されたクイズの数: {len(quizzes)}")
    else:
        print("クイズの生成に失敗しました。")

if __name__ == "__main__":
    main() 