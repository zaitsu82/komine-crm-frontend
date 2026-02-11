'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { toast } from 'sonner';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  changePassword as apiChangePassword,
  isAuthenticated as checkIsAuthenticated,
  AuthUser,
  ChangePasswordRequest,
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
  /** パスワード変更 */
  changePassword: (request: ChangePasswordRequest) => Promise<{ success: boolean; error?: string }>;
  /** ユーザー情報の再取得 */
  refreshUser: () => Promise<void>;
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

// ===== ログインエラーメッセージマッピング =====

/**
 * エラーコードからユーザー向けメッセージを返す
 * client.ts のエラーコードとバックエンドのエラーコードの両方に対応
 */
function getLoginErrorMessage(code: string, fallbackMessage?: string): string {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'メールアドレスまたはパスワードが正しくありません';
    case 'USER_INACTIVE':
      return 'このアカウントは無効です。管理者にお問い合わせください';
    case 'NETWORK_ERROR':
      return 'サーバーに接続できません。ネットワーク接続を確認してください';
    case 'TIMEOUT':
      return 'サーバーからの応答がありません。しばらく待ってから再度お試しください';
    default:
      // HTTP_5xx系のエラー（503等）
      if (code.startsWith('HTTP_5')) {
        return 'サーバーが一時的に利用できません。しばらく待ってから再度お試しください';
      }
      return fallbackMessage || 'ログインに失敗しました。しばらく待ってから再度お試しください';
  }
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
    const notificationMessage = message || '認証の有効期限が切れました。再度ログインしてください。';
    console.log('[Auth] Force logout triggered', notificationMessage);

    // トースト通知を表示
    toast.warning('セッション期限切れ', {
      description: notificationMessage,
      duration: 6000,
    });

    clearAllTokens();
    setUser(null);
    setError(notificationMessage);
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

  // 複数タブでの認証状態同期（storageイベント監視）
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // auth_tokenの変更を検知
      if (event.key === 'auth_token') {
        // 他のタブでログアウトした場合（トークンが削除された）
        if (event.oldValue && !event.newValue && user) {
          console.log('[Auth] Token removed in another tab, syncing logout');
          toast.info('他のタブでログアウトしました', {
            description: '認証状態を同期しました',
            duration: 4000,
          });
          clearAllTokens();
          setUser(null);
          setError(null);
        }
        // 他のタブでログインした場合（トークンが追加された）
        else if (!event.oldValue && event.newValue && !user) {
          console.log('[Auth] Token added in another tab, reloading to sync');
          // ページをリロードして認証状態を同期
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

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
      toast.success('ログイン成功', {
        description: `${response.data.user.name}さん、おかえりなさい`,
        duration: 3000,
      });
      return { success: true };
    }

    const errorMessage = getLoginErrorMessage(response.error.code, response.error.message);
    setError(errorMessage);
    setIsLoading(false);
    toast.error('ログイン失敗', {
      description: errorMessage,
      duration: 5000,
    });
    return { success: false, error: errorMessage };
  }, []);

  // ログアウト処理
  const logout = useCallback(async () => {
    setIsLoading(true);
    await apiLogout();
    setUser(null);
    setError(null);
    setIsLoading(false);
    toast.info('ログアウトしました', {
      duration: 3000,
    });
  }, []);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // パスワード変更
  const changePassword = useCallback(async (request: ChangePasswordRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    const response = await apiChangePassword(request);

    if (response.success) {
      setIsLoading(false);
      toast.success('パスワードを変更しました', {
        duration: 3000,
      });
      return { success: true };
    }

    setError(response.error.message);
    setIsLoading(false);
    toast.error('パスワード変更に失敗しました', {
      description: response.error.message,
      duration: 5000,
    });
    return { success: false, error: response.error.message };
  }, []);

  // ユーザー情報の再取得
  const refreshUser = useCallback(async () => {
    if (!checkIsAuthenticated()) {
      setUser(null);
      return;
    }

    const response = await getCurrentUser();
    if (response.success) {
      setUser(authUserToUser(response.data));
    } else if (response.error?.code === 'AUTH_EXPIRED') {
      clearAllTokens();
      setUser(null);
    }
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
        changePassword,
        refreshUser,
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

/**
 * 認証必須フック
 * 認証されていない場合はエラーをスロー
 */
export function useRequireAuth(): AuthContextType & { user: User } {
  const auth = useAuth();

  if (!auth.isLoading && !auth.isAuthenticated) {
    throw new Error('Authentication required');
  }

  return auth as AuthContextType & { user: User };
}

/**
 * 権限チェックフック
 */
export function useHasPermission(
  requiredRoles: User['role'][]
): boolean {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  return requiredRoles.includes(user.role);
}

// 認証状態チェック用のヘルパー関数
export { getAuthToken as getStoredAuthToken } from '@/lib/api';

// Re-export AuthContextType for external use
export type { AuthContextType };
