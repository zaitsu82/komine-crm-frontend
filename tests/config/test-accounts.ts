/**
 * E2Eテスト用アカウント設定
 * 実APIモード: Supabase Auth + バックエンドで認証
 *
 * テストアカウントは環境変数で上書き可能。
 * デフォルト値はSupabase上に事前登録されたテストユーザー。
 *
 * 環境変数:
 *   E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD
 *   E2E_MANAGER_EMAIL, E2E_MANAGER_PASSWORD
 *   E2E_OPERATOR_EMAIL, E2E_OPERATOR_PASSWORD
 *   E2E_VIEWER_EMAIL, E2E_VIEWER_PASSWORD
 */

export type TestRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface TestAccount {
  email: string;
  password: string;
  name: string;
  role: TestRole;
}

export const TEST_ACCOUNTS: Record<TestRole, TestAccount> = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'password123',
    name: '管理者',
    role: 'admin',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL || 'manager@example.com',
    password: process.env.E2E_MANAGER_PASSWORD || 'password123',
    name: 'マネージャー',
    role: 'manager',
  },
  operator: {
    email: process.env.E2E_OPERATOR_EMAIL || 'operator@example.com',
    password: process.env.E2E_OPERATOR_PASSWORD || 'password123',
    name: 'オペレーター',
    role: 'operator',
  },
  viewer: {
    email: process.env.E2E_VIEWER_EMAIL || 'viewer@example.com',
    password: process.env.E2E_VIEWER_PASSWORD || 'password123',
    name: 'ビューワー',
    role: 'viewer',
  },
};

/** storageState ファイルパス */
export function storageStatePath(role: TestRole): string {
  return `tests/.auth/${role}.json`;
}
