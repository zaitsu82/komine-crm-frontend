# Apps Directory

このディレクトリには霊園CRMプロジェクトのすべてのWebアプリケーションコードが格納されます。

## 構造

```
apps/
├── web/                 # メインのWebアプリケーション (Next.js)
│   ├── src/            # アプリケーションのソースコード
│   ├── public/         # 静的ファイル
│   ├── package.json    # 依存関係とスクリプト
│   ├── next.config.js  # Next.js設定
│   ├── tailwind.config.js # Tailwind CSS設定
│   └── tsconfig.json   # TypeScript設定
└── README.md           # このファイル
```

## 技術スタック

### メインWebアプリケーション (`apps/web/`)
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5.x
- **スタイリング**: Tailwind CSS 3.x
- **コンポーネント**: shadcn/ui
- **状態管理**: Zustand + TanStack Query
- **フォーム**: React Hook Form + Zod
- **認証**: NextAuth.js v4
- **データベース**: Supabase (PostgreSQL)

## 開発原則

1. **モノリポ構造**: 将来的な拡張（モバイルアプリ、管理者用ダッシュボード等）を考慮
2. **型安全性**: TypeScript strict mode、Zod による実行時型チェック
3. **アクセシビリティ**: WCAG 2.1 AA準拠、高齢者配慮設計
4. **セキュリティ**: Row Level Security、エンドツーエンド暗号化
5. **長期運用**: 50年超の継続利用を想定した堅牢な設計

## 命名規則

- **ディレクトリ**: kebab-case (`customer-management/`)
- **コンポーネント**: PascalCase (`CustomerForm.tsx`)
- **ファイル**: kebab-case (`api-client.ts`)
- **変数・関数**: camelCase (`getUserData()`)
- **定数**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

## 今後の拡張予定

- `apps/mobile/` - モバイルアプリ（React Native）
- `apps/admin/` - 管理者用ダッシュボード
- `apps/api/` - 独立したAPIサーバー（必要に応じて）