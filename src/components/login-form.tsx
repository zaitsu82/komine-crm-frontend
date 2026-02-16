'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = await login(email, password)

    if (result.success) {
      // ログイン成功時はメイン画面へリダイレクト
      router.push('/')
    } else {
      setError(result.error || 'ログインに失敗しました')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm px-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-matsu-50/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cha-50/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-ai-50/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Card className="relative w-full max-w-md border-0 shadow-elegant-xl overflow-hidden">
        {/* 上部アクセント */}
        <div className="h-1.5 bg-gradient-to-r from-matsu via-cha to-ai" />

        <div className="p-10">
          {/* ロゴ・タイトル */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-matsu flex items-center justify-center shadow-matsu">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="font-mincho text-3xl font-semibold text-sumi mb-2 tracking-wide">
              小峰霊園CRM
            </h1>
            <p className="text-hai text-sm tracking-wider">
              管理者ログイン
            </p>
            <div className="w-12 h-px bg-gin mx-auto mt-4" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@komine-cemetery.jp"
                required
                className="h-12 text-base"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                className="h-12 text-base"
                disabled={isLoading}
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="matsu"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ログイン中...
                </span>
              ) : (
                'ログイン'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="#"
              className="text-sm text-matsu hover:text-matsu-light transition-colors duration-normal"
            >
              パスワードをお忘れの方
            </a>
          </div>

          {/* セキュリティノート */}
          <div className="mt-8 pt-6 border-t border-gin">
            <div className="flex items-start space-x-3 text-xs text-hai">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>
                このシステムは認証されたユーザーのみアクセス可能です。
                不正アクセスは法律により禁止されています。
              </p>
            </div>
          </div>

          {/* 開発用: テストアカウント情報 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-4 border-t border-dashed border-gin">
              <p className="text-xs text-hai mb-3 font-medium">テストアカウント:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-gofun/50 rounded px-3 py-2">
                  <span className="text-sumi-600">管理者</span>
                  <code className="text-matsu font-mono text-[11px]">admin@example.com / password123</code>
                </div>
                <div className="flex justify-between items-center bg-gofun/50 rounded px-3 py-2">
                  <span className="text-sumi-600">マネージャー</span>
                  <code className="text-matsu font-mono text-[11px]">manager@example.com / password123</code>
                </div>
                <div className="flex justify-between items-center bg-gofun/50 rounded px-3 py-2">
                  <span className="text-sumi-600">オペレーター</span>
                  <code className="text-matsu font-mono text-[11px]">operator@example.com / password123</code>
                </div>
                <div className="flex justify-between items-center bg-gofun/50 rounded px-3 py-2">
                  <span className="text-sumi-600">閲覧者</span>
                  <code className="text-matsu font-mono text-[11px]">viewer@example.com / password123</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
