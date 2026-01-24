'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 認証ガードコンポーネント
 * 認証されていないユーザーをログインページにリダイレクト
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング中
  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return fallback || <AuthLoadingScreen />;
  }

  // 認証済みの場合は子コンポーネントを表示
  return <>{children}</>;
}

/**
 * 認証チェック中のローディング画面
 */
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-matsu flex items-center justify-center shadow-matsu animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-matsu rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-matsu rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-matsu rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="mt-4 text-hai text-sm">認証を確認中...</p>
      </div>
    </div>
  );
}

/**
 * ゲスト専用ガード（ログインページ用）
 * 認証済みユーザーをメインページにリダイレクト
 */
export function GuestGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング中
  if (isLoading) {
    return fallback || <AuthLoadingScreen />;
  }

  // 認証済みの場合は何も表示しない（リダイレクト中）
  if (isAuthenticated) {
    return fallback || <AuthLoadingScreen />;
  }

  // 未認証の場合は子コンポーネントを表示
  return <>{children}</>;
}
