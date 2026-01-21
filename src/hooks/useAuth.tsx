'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  changePassword as apiChangePassword,
  isAuthenticated as checkIsAuthenticated,
  AuthUser,
  LoginRequest,
  ChangePasswordRequest,
} from '@/lib/api';

// 認証状態の型
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// 認証コンテキストの型
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<boolean>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// デフォルト値
const defaultAuthState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// プロバイダーのProps
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 認証プロバイダー
 * アプリケーション全体で認証状態を共有する
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  // 現在のユーザー情報を取得
  const refreshUser = useCallback(async () => {
    if (!checkIsAuthenticated()) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    const response = await getCurrentUser();

    if (response.success) {
      setState({
        user: response.data,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } else {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: response.error.message,
      });
    }
  }, []);

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // ログイン
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await apiLogin(credentials);

    if (response.success) {
      setState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      return true;
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error.message,
      }));
      return false;
    }
  }, []);

  // ログアウト
  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await apiLogout();

    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  // パスワード変更
  const changePassword = useCallback(
    async (request: ChangePasswordRequest): Promise<boolean> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await apiChangePassword(request);

      if (response.success) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error.message,
        }));
        return false;
      }
    },
    []
  );

  // エラークリア
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    changePassword,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 認証フック
 * AuthProviderの子コンポーネントで使用する
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * 認証必須フック
 * 認証されていない場合はエラーをスロー
 */
export function useRequireAuth(): AuthContextType & { user: AuthUser } {
  const auth = useAuth();

  if (!auth.isLoading && !auth.isAuthenticated) {
    throw new Error('Authentication required');
  }

  return auth as AuthContextType & { user: AuthUser };
}

/**
 * 権限チェックフック
 */
export function useHasPermission(
  requiredRoles: AuthUser['role'][]
): boolean {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  return requiredRoles.includes(user.role);
}
