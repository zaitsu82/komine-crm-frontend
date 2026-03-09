/**
 * E2Eテスト用アカウント設定
 * バックエンドに登録済みのテストアカウント情報
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
    email: 'admin@example.com',
    password: 'password123',
    name: '管理者',
    role: 'admin',
  },
  manager: {
    email: 'manager@example.com',
    password: 'password123',
    name: 'マネージャー',
    role: 'manager',
  },
  operator: {
    email: 'operator@example.com',
    password: 'password123',
    name: 'オペレーター',
    role: 'operator',
  },
  viewer: {
    email: 'viewer@example.com',
    password: 'password123',
    name: '閲覧者',
    role: 'viewer',
  },
};

/** storageState ファイルパス */
export function storageStatePath(role: TestRole): string {
  return `tests/.auth/${role}.json`;
}
