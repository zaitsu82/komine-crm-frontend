'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ROLE_LABELS: Record<string, string> = {
  viewer: '閲覧者',
  operator: 'オペレーター',
  manager: 'マネージャー',
  admin: '管理者',
};

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, changePassword, isLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!currentPassword) {
      setValidationError('現在のパスワードを入力してください');
      return;
    }

    if (!newPassword) {
      setValidationError('新しいパスワードを入力してください');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('新しいパスワードは8文字以上で入力してください');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('新しいパスワードが一致しません');
      return;
    }

    const result = await changePassword({ currentPassword, newPassword });

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 戻るボタン */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="mb-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </Button>

        <h1 className="text-2xl font-semibold text-sumi">アカウント設定</h1>

        {/* プロフィール情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">プロフィール情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-hai text-sm">名前</Label>
                <p className="mt-1 text-sumi font-medium">{user?.name || '-'}</p>
              </div>
              <div>
                <Label className="text-hai text-sm">メールアドレス</Label>
                <p className="mt-1 text-sumi font-medium">{user?.email || '-'}</p>
              </div>
              <div>
                <Label className="text-hai text-sm">権限</Label>
                <p className="mt-1">
                  <span className="inline-block px-2 py-0.5 text-sm rounded bg-matsu-50 text-matsu-dark border border-matsu-100">
                    {user?.role ? ROLE_LABELS[user.role] || user.role : '-'}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-hai text-sm">アカウント状態</Label>
                <p className="mt-1">
                  {user?.isActive !== undefined ? (
                    <span
                      className={`inline-block px-2 py-0.5 text-sm rounded border ${user.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                    >
                      {user.isActive ? '有効' : '無効'}
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* パスワード変更 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">パスワード変更</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                  autoComplete="new-password"
                />
                <p className="text-xs text-hai mt-1">8文字以上で入力してください</p>
              </div>
              <div>
                <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  autoComplete="new-password"
                />
              </div>

              {validationError && (
                <p className="text-sm text-red-600">{validationError}</p>
              )}

              <Button type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? 'パスワードを変更中...' : 'パスワードを変更'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
