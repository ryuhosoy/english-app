from yt_dlp import YoutubeDL
import requests
import os

def download_youtube_video(url):
    """YouTubeの動画をダウンロードする"""
    try:
        print(f"URL: {url} の動画情報を取得中...")
        ydl_opts = {
            'format': 'best[ext=mp4]',
            'outtmpl': '%(title)s.%(ext)s',
            'quiet': False,
            'no_warnings': False
        }
        
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info['title']
            print(f"タイトル: {video_title}")
            output_path = f"{video_title}.mp4"
            print(f"ダウンロード完了: {output_path}")
            return output_path
            
    except Exception as e:
        print(f"動画のダウンロード中にエラーが発生しました: {str(e)}")
        print(f"エラーの種類: {type(e).__name__}")
        return None

def transcribe_audio(file_path):
    """Whisper APIを使用して音声を文字起こしする"""
    headers = {
        "Authorization": "Bearer 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"
    }
    
    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {
            'model': 'whisper-1',
            'language': 'en'  # 英語を指定
        }
        
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers=headers,
            data=data,
            files=files
        )
        
        if response.status_code == 200:
            return response.json()['text']
        else:
            print(f"文字起こし中にエラーが発生しました: {response.text}")
            return None

def main():
    # YouTubeのURLを入力
    # youtube_url = input("YouTubeのURLを入力してください: ")
    youtube_url = "https://www.youtube.com/watch?v=RHkRk7ymUdY"
    
    # 動画をダウンロード
    print("動画をダウンロード中...")
    video_path = download_youtube_video(youtube_url)
    
    if video_path:
        print("文字起こしを開始します...")
        transcription = transcribe_audio(video_path)
        
        if transcription:
            # 文字起こし結果をファイルに保存
            output_file = "transcription.txt"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(transcription)
            print(f"文字起こしが完了しました。結果は {output_file} に保存されました。")
        
        # # ダウンロードした動画ファイルを削除
        # os.remove(video_path)
        # print("一時ファイルを削除しました。")

if __name__ == "__main__":
    main()