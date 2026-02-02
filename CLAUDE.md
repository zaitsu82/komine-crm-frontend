# CLAUDE.md

小峰霊園CRM フロントエンドプロジェクトのガイド

## プロジェクト概要

Next.js 15 + React 19 + TypeScript で構築されたCRMフロントエンド。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Radix UI
- **状態管理**: React Context + カスタムフック
- **フォーム**: React Hook Form + Zod
- **テスト**: Jest, Playwright

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# テスト
npm test
npm run test:watch
npm run test:ci

# E2Eテスト
npm run test:e2e
npm run test:e2e:ui

# Lint
npm run lint
```

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホーム（ログイン）
│   ├── dashboard/         # ダッシュボード
│   ├── plots/             # 区画管理
│   ├── collective-burials/# 合祀管理
│   └── staff/             # スタッフ管理
├── components/
│   ├── ui/                # 共通UIコンポーネント
│   ├── layout/            # レイアウトコンポーネント
│   └── [feature]/         # 機能別コンポーネント
├── contexts/              # React Context
│   └── auth-context.tsx   # 認証コンテキスト
├── hooks/                 # カスタムフック
│   ├── useAsyncData.ts   # 非同期データ取得
│   └── useAsyncList.ts   # ページネーション付きリスト
├── lib/                   # ユーティリティ
│   ├── api.ts            # APIクライアント
│   ├── validations.ts    # Zodスキーマ
│   └── utils.ts          # 共通ユーティリティ
├── config/               # 設定
│   └── api.ts            # API設定
└── types/                # 型定義
    └── index.ts          # 共通型
```

## 主要画面

| パス | 画面 | 説明 |
|------|------|------|
| `/` | ログイン | Supabase認証 |
| `/dashboard` | ダッシュボード | 概要表示 |
| `/plots` | 台帳問い合わせ | 区画一覧・検索 |
| `/plots/[id]` | 区画詳細 | 顧客・契約情報 |
| `/collective-burials` | 合祀管理 | 合祀一覧・登録 |
| `/staff` | スタッフ管理 | スタッフ一覧 |

## API連携

### 設定

```typescript
// src/config/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
```

### APIクライアント

```typescript
// src/lib/api.ts
import { API_BASE_URL } from '@/config/api';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  return response.json();
}
```

## 認証

Supabase Auth を使用。`auth-context.tsx`で認証状態を管理。

```typescript
// 使用例
const { user, login, logout, isAuthenticated } = useAuth();
```

## コンポーネント設計

### 共通UIコンポーネント（src/components/ui/）

- `Button` - ボタン
- `Input` - 入力フィールド
- `Select` - セレクトボックス
- `Dialog` - モーダルダイアログ
- `Table` - テーブル
- `Tabs` - タブ

### カスタムフック

```typescript
// useAsyncData - 単一データ取得
const { data, isLoading, error, refetch } = useAsyncData(() => fetchPlot(id));

// useAsyncList - ページネーション付きリスト
const { items, total, page, setPage, isLoading } = useAsyncList(fetchPlots);
```

## 環境変数

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## コーディング規約

- **命名**: camelCase（変数・関数）、PascalCase（コンポーネント・型）
- **インポート順**: React → 外部ライブラリ → 内部モジュール
- **コンポーネント**: 関数コンポーネント + TypeScript

## テスト

### ユニットテスト（Jest）

```bash
npm test
npm run test:watch
```

### E2Eテスト（Playwright）

```bash
npm run test:e2e
npm run test:e2e:ui
```

## トラブルシューティング

### CORS エラー

バックエンドの`ALLOWED_ORIGINS`にフロントエンドURLを追加。

### 認証エラー

1. Supabase環境変数を確認
2. トークンの有効期限を確認
3. バックエンドのSupabase設定を確認

### ビルドエラー

```bash
rm -rf .next node_modules
npm install
npm run build
```
