# LinguaNote AI - English Learning App

YouTube動画をAIで分析し、英語学習用のノート、クイズ、語彙リストを生成するアプリケーションです。

## 機能

- YouTube動画の音声認識とテキスト化
- AIによるキーワード抽出とノート生成
- 理解度を測るクイズの自動生成
- 語彙リストの作成と管理
- Supabaseによる認証システム
- 学習進捗の追跡

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でアカウントを作成し、新しいプロジェクトを作成
2. プロジェクトの設定から以下を取得：
   - Project URL
   - Anon public key

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**重要**: これらの環境変数は必須です。設定されていない場合、アプリケーションは起動時にエラーを表示します。

#### Vercelでのデプロイ時

Vercelでデプロイする場合は、プロジェクト設定の「Environment Variables」セクションで以下の変数を設定してください：

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseプロジェクトの匿名キー

#### 環境変数の確認方法

1. Supabaseダッシュボードで「Settings」→「API」に移動
2. 「Project URL」と「anon public」キーをコピー
3. これらを`.env.local`ファイルに設定

### 4. データベースのセットアップ

1. Supabaseダッシュボードで「SQL Editor」に移動
2. `database-schema.sql`ファイルの内容をコピーして実行
3. これにより以下のテーブルが作成されます：
   - `videos`: 動画情報
   - `vocabulary_words`: 単語帳
   - `study_sessions`: 学習セッション
   - `user_progress`: ユーザー進捗

### 5. Supabase認証の設定

1. Supabaseダッシュボードで「Authentication」→「Settings」に移動
2. 「Site URL」に`http://localhost:3000`を設定
3. 「Redirect URLs」に以下を追加：
   - `http://localhost:3000/login`
   - `http://localhost:3000/register`
   - `http://localhost:3000/dashboard`

### 5. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### 新規ユーザー

1. `/register`ページでアカウントを作成
2. 確認メールを確認してログイン
3. `/dashboard`で学習を開始

### 既存ユーザー

1. `/login`ページでログイン
2. `/dashboard`で学習を継続

### 動画の追加

1. `/add-video`ページでYouTube URLを入力
2. AIが動画を分析し、学習素材を生成
3. `/results`ページで生成されたノート、クイズ、語彙を確認

## 技術スタック

- **フロントエンド**: Next.js 13, React, TypeScript
- **UI**: Tailwind CSS, Radix UI
- **認証**: Supabase Auth
- **データベース**: Supabase PostgreSQL
- **AI**: OpenAI API (音声認識、テキスト分析)

## プロジェクト構造

```
english-listening-app/
├── app/                    # Next.js App Router
│   ├── login/             # ログインページ
│   ├── register/          # 新規登録ページ
│   ├── dashboard/         # ダッシュボード
│   ├── add-video/         # 動画追加ページ
│   ├── process/           # 処理ページ
│   └── results/           # 結果表示ページ
├── components/            # Reactコンポーネント
│   ├── providers/         # プロバイダー（認証、テーマ）
│   ├── ui/               # UIコンポーネント
│   └── ...
├── lib/                  # ユーティリティ
│   └── supabase.ts       # Supabaseクライアント設定
└── middleware.ts         # 認証ミドルウェア
```

## 認証機能

- **ログイン**: メールアドレスとパスワード
- **新規登録**: メール確認付き
- **ログアウト**: セッション終了
- **保護されたページ**: 認証が必要なページの自動リダイレクト

## トラブルシューティング

### よくあるエラー

#### 1. "supabaseUrl is required" エラー

このエラーは環境変数が正しく設定されていないことを示します。

**解決方法:**
- `.env.local`ファイルが存在することを確認
- 環境変数の値が正しく設定されていることを確認
- アプリケーションを再起動

#### 2. WebSocket関連のエラー

```
Module not found: Can't resolve 'bufferutil' in '/vercel/path0/node_modules/ws/lib'
Module not found: Can't resolve 'utf-8-validate' in '/vercel/path0/node_modules/ws/lib'
```

**解決方法:**
- `next.config.js`でWebSocket関連の依存関係を適切に設定済み
- このエラーは無視して問題ありません

#### 3. ビルドエラー

**解決方法:**
```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm run build -- --no-cache
```

### デバッグ

開発時のデバッグ情報を確認するには：

1. ブラウザの開発者ツールを開く
2. コンソールタブでログを確認
3. ネットワークタブでAPIリクエストを確認

## ライセンス

MIT License 