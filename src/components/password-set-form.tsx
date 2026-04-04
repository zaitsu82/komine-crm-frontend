'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { resetPassword } from '@/lib/api/auth'

interface PasswordSetFormProps {
  mode: 'set' | 'reset'
}

const MODE_CONFIG = {
  set: {
    title: 'パスワード設定',
    subtitle: '招待メールからのパスワード設定',
    submitLabel: 'パスワードを設定',
    submittingLabel: '設定中...',
    successMessage: 'パスワードを設定しました。ログインしてください。',
    noCodeMessage: '招待リンクが無効です。管理者に招待メールの再送をご依頼ください。',
  },
  reset: {
    title: 'パスワード再設定',
    subtitle: '新しいパスワードを設定してください',
    submitLabel: 'パスワードを再設定',
    submittingLabel: '再設定中...',
    successMessage: 'パスワードを再設定しました。ログインしてください。',
    noCodeMessage: 'リセットリンクが無効です。再度パスワードリセットをお試しください。',
  },
} as const

export function PasswordSetForm({ mode }: PasswordSetFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const config = MODE_CONFIG[mode]

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    const codeParam = searchParams.get('code')
    setCode(codeParam)
  }, [searchParams])

  const validatePassword = (): string | null => {
    if (newPassword.length < 8) {
      return 'パスワードは8文字以上である必要があります'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return 'パスワードは大文字、小文字、数字を含む必要があります'
    }
    if (newPassword !== confirmPassword) {
      return 'パスワードが一致しません'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!code) {
      setError(config.noCodeMessage)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await resetPassword(code, newPassword, confirmPassword)

      if (result.success) {
        setIsSuccess(true)
      } else {
        setError(
          result.error?.message || 'パスワードの設定に失敗しました'
        )
      }
    } catch {
      setError('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 成功画面
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-matsu-50/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cha-50/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <Card className="relative w-full max-w-md border-0 shadow-elegant-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-matsu via-cha to-ai" />
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-matsu flex items-center justify-center shadow-matsu">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-mincho text-2xl font-semibold text-sumi mb-3">
              設定完了
            </h1>
            <p className="text-hai text-sm mb-8">
              {config.successMessage}
            </p>
            <Button
              variant="matsu"
              size="xl"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              ログイン画面へ
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // コードなしの場合
  if (code === null && typeof window !== 'undefined') {
    // searchParams の読み込みが完了するまで待つ
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
          {/* タイトル */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-matsu flex items-center justify-center shadow-matsu">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-mincho text-3xl font-semibold text-sumi mb-2 tracking-wide">
              {config.title}
            </h1>
            <p className="text-hai text-sm tracking-wider">
              {config.subtitle}
            </p>
            <div className="w-12 h-px bg-gin mx-auto mt-4" />
          </div>

          {!code ? (
            <div className="text-center">
              <div className="bg-beni-50 border border-beni-200 rounded-elegant px-4 py-3 mb-6">
                <p className="text-beni text-sm">{config.noCodeMessage}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
              >
                ログイン画面へ戻る
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-base font-medium">
                  新しいパスワード
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8文字以上（大文字・小文字・数字を含む）"
                  required
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium">
                  パスワード確認
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  required
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
              </div>

              {/* パスワード要件 */}
              <div className="text-xs text-hai space-y-1">
                <p className={newPassword.length >= 8 ? 'text-matsu' : ''}>
                  {newPassword.length >= 8 ? '\u2713' : '\u2022'} 8文字以上
                </p>
                <p className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'text-matsu' : ''}>
                  {/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? '\u2713' : '\u2022'} 大文字と小文字を含む
                </p>
                <p className={/\d/.test(newPassword) ? 'text-matsu' : ''}>
                  {/\d/.test(newPassword) ? '\u2713' : '\u2022'} 数字を含む
                </p>
              </div>

              {/* エラーメッセージ */}
              {error && (
                <div className="bg-beni-50 border border-beni-200 rounded-elegant px-4 py-3">
                  <p className="text-beni text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="matsu"
                size="xl"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {config.submittingLabel}
                  </span>
                ) : (
                  config.submitLabel
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-sm text-matsu hover:text-matsu-light hover:underline transition-colors duration-normal"
                >
                  ログイン画面へ戻る
                </button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
