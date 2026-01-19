'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ユーザー型定義
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// モックユーザーデータ
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 1,
    email: 'admin@komine-cemetery.jp',
    name: '管理者',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: 2,
    email: 'manager@komine-cemetery.jp',
    name: '佐藤 一郎',
    role: 'manager',
    password: 'manager123',
  },
  {
    id: 3,
    email: 'operator@komine-cemetery.jp',
    name: '田中 花子',
    role: 'operator',
    password: 'operator123',
  },
];

// コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // クライアントサイドでのみlocalStorageを確認
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // ログイン処理
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // 模擬的な遅延（ネットワーク遅延をシミュレート）
    await new Promise(resolve => setTimeout(resolve, 800));

    // モックユーザーで認証
    const foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);

      // localStorageに保存（モック用）
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('auth_token', `mock_token_${foundUser.id}_${Date.now()}`);
      }

      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
  }, []);

  // ログアウト処理
  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}
