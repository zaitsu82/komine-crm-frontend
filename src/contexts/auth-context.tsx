'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  AuthUser,
} from '@/lib/api';
import { clearAllTokens, isTokenExpired, isTokenExpiringSoon } from '@/lib/api/client';

// ユーザー型定義（後方互換性のため維持）
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  isActive?: boolean;
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** 認証期限切れ時の強制ログアウト（APIエラーハンドリング用） */
  forceLogout: (message?: string) => void;
  /** APIレスポンスのエラーコードをチェックして認証期限切れなら自動ログアウト */
  handleAuthError: (errorCode: string) => boolean;
}

// コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthUserをUserに変換
function authUserToUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    role: authUser.role,
    isActive: authUser.isActive,
  };
}

// トークン有効期限チェック間隔（1分）
const TOKEN_CHECK_INTERVAL = 60 * 1000;

// プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 強制ログアウト（認証期限切れ時に呼ばれる）
  const forceLogout = useCallback((message?: string) => {
    console.log('[Auth] Force logout triggered', message);
    clearAllTokens();
    setUser(null);
    setError(message || '認証の有効期限が切れました。再度ログインしてください。');
    setIsLoading(false);
  }, []);

  // APIエラーコードをチェックして認証期限切れなら自動ログアウト
  const handleAuthError = useCallback((errorCode: string): boolean => {
    if (errorCode === 'AUTH_EXPIRED' || errorCode === 'UNAUTHORIZED') {
      forceLogout();
      return true;
    }
    return false;
  }, [forceLogout]);

  // 定期的にトークン有効期限をチェック
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiration = () => {
      if (isTokenExpired()) {
        console.log('[Auth] Token has expired, forcing logout');
        forceLogout('セッションの有効期限が切れました。再度ログインしてください。');
      } else if (isTokenExpiringSoon(10)) {
        // 10分以内に期限切れの場合は警告ログ（実際のリフレッシュはAPIリクエスト時に行われる）
        console.log('[Auth] Token is expiring soon');
      }
    };

    // 初回チェック
    checkTokenExpiration();

    // 定期チェック開始
    checkIntervalRef.current = setInterval(checkTokenExpiration, TOKEN_CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [user, forceLogout]);

  // 初期化時に認証状態を確認
  useEffect(() => {
    const initAuth = async () => {
      if (!checkIsAuthenticated()) {
        setIsLoading(false);
        return;
      }

      // トークンが既に期限切れの場合はログアウト
      if (isTokenExpired()) {
        console.log('[Auth] Token already expired on init');
        clearAllTokens();
        setIsLoading(false);
        return;
      }

      const response = await getCurrentUser();
      if (response.success) {
        setUser(authUserToUser(response.data));
      } else if (response.error?.code === 'AUTH_EXPIRED') {
        // 認証期限切れエラーの場合
        clearAllTokens();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ログイン処理
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    const response = await apiLogin({ email, password });

    if (response.success) {
      setUser(authUserToUser(response.data.user));
      setIsLoading(false);
      return { success: true };
    }

    setError(response.error.message);
    setIsLoading(false);
    return { success: false, error: response.error.message };
  }, []);

  // ログアウト処理
  const logout = useCallback(async () => {
    setIsLoading(true);
    await apiLogout();
    setUser(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
        forceLogout,
        handleAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 認証状態チェック用のヘルパー関数
export { getAuthToken as getStoredAuthToken } from '@/lib/api';
