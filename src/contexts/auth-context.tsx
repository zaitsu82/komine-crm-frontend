'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  AuthUser,
} from '@/lib/api';

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

// プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化時に認証状態を確認
  useEffect(() => {
    const initAuth = async () => {
      if (!checkIsAuthenticated()) {
        setIsLoading(false);
        return;
      }

      const response = await getCurrentUser();
      if (response.success) {
        setUser(authUserToUser(response.data));
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
