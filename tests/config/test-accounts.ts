/**
 * E2Eテスト用アカウント設定
 *
 * CI: モックモードのデフォルト値で認証
 * ローカル（実API）: 環境変数で上書き可能（Supabase Auth + バックエンド）
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
    email: process.env.E2E_ADMIN_EMAIL || 'admin@komine-cemetery.jp',
    password: process.env.E2E_ADMIN_PASSWORD || 'admin123',
    name: '管理者 太郎',
    role: 'admin',
  },
  manager: {
    email: process.env.E2E_MANAGER_EMAIL || 'manager@komine-cemetery.jp',
    password: process.env.E2E_MANAGER_PASSWORD || 'manager123',
    name: 'マネージャー 花子',
    role: 'manager',
  },
  operator: {
    email: process.env.E2E_OPERATOR_EMAIL || 'operator@komine-cemetery.jp',
    password: process.env.E2E_OPERATOR_PASSWORD || 'operator123',
    name: 'オペレーター 次郎',
    role: 'operator',
  },
  viewer: {
    email: process.env.E2E_VIEWER_EMAIL || 'viewer@komine-cemetery.jp',
    password: process.env.E2E_VIEWER_PASSWORD || 'viewer123',
    name: '閲覧者 三郎',
    role: 'viewer',
  },
};

/** storageState ファイルパス */
export function storageStatePath(role: TestRole): string {
  return `tests/.auth/${role}.json`;
}
