import requests

headers = {
    "Authorization": "Bearer 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"
}
files = {
    'file': open("【ひろゆき】航空会社総合職に転職したい。英語力を転職までにどうにか.mp4", 'rb')
}
data = {
    'model': 'whisper-1'
}

response = requests.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, data=data, files=files)
# print(response.json()['text'])
print(response.json())