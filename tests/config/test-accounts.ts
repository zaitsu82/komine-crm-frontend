/**
 * E2Eテスト用アカウント設定
 * モックモード（NEXT_PUBLIC_USE_MOCK_DATA=true）で使用するテストアカウント
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
    email: 'admin@komine-cemetery.jp',
    password: 'admin123',
    name: '管理者 太郎',
    role: 'admin',
  },
  manager: {
    email: 'manager@komine-cemetery.jp',
    password: 'manager123',
    name: 'マネージャー 花子',
    role: 'manager',
  },
  operator: {
    email: 'operator@komine-cemetery.jp',
    password: 'operator123',
    name: 'オペレーター 次郎',
    role: 'operator',
  },
  viewer: {
    email: 'viewer@komine-cemetery.jp',
    password: 'viewer123',
    name: '閲覧者 三郎',
    role: 'viewer',
  },
};

/** storageState ファイルパス */
export function storageStatePath(role: TestRole): string {
  return `tests/.auth/${role}.json`;
}
