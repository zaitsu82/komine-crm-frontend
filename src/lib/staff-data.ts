/**
 * スタッフ管理 - データ操作・デモデータ
 */

import { Staff, StaffCreateInput, StaffUpdateInput } from '@/types/staff';

// デモデータ
export const mockStaff: Staff[] = [
  {
    id: 1,
    supabaseUid: 'supabase-uid-001',
    name: '管理者 太郎',
    email: 'admin@komine-cemetery.jp',
    role: 'admin',
    isActive: true,
    lastLoginAt: new Date('2024-01-20T09:30:00'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-20'),
    deletedAt: null,
  },
  {
    id: 2,
    supabaseUid: 'supabase-uid-002',
    name: '山田 花子',
    email: 'yamada@komine-cemetery.jp',
    role: 'manager',
    isActive: true,
    lastLoginAt: new Date('2024-01-19T14:20:00'),
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-01-19'),
    deletedAt: null,
  },
  {
    id: 3,
    supabaseUid: 'supabase-uid-003',
    name: '佐藤 一郎',
    email: 'sato@komine-cemetery.jp',
    role: 'operator',
    isActive: true,
    lastLoginAt: new Date('2024-01-18T11:45:00'),
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-18'),
    deletedAt: null,
  },
  {
    id: 4,
    supabaseUid: 'supabase-uid-004',
    name: '田中 美咲',
    email: 'tanaka@komine-cemetery.jp',
    role: 'operator',
    isActive: true,
    lastLoginAt: new Date('2024-01-17T16:00:00'),
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2024-01-17'),
    deletedAt: null,
  },
  {
    id: 5,
    supabaseUid: 'supabase-uid-005',
    name: '鈴木 健太',
    email: 'suzuki@komine-cemetery.jp',
    role: 'viewer',
    isActive: true,
    lastLoginAt: new Date('2024-01-15T10:30:00'),
    createdAt: new Date('2023-10-10'),
    updatedAt: new Date('2024-01-15'),
    deletedAt: null,
  },
  {
    id: 6,
    supabaseUid: 'supabase-uid-006',
    name: '高橋 裕子',
    email: 'takahashi@komine-cemetery.jp',
    role: 'viewer',
    isActive: false,
    lastLoginAt: new Date('2023-12-01T09:00:00'),
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-12-15'),
    deletedAt: null,
  },
];

// 次のID（自動採番用）
let nextId = mockStaff.length + 1;

/**
 * 全スタッフを取得（削除済みを除く）
 */
export function getAllStaff(): Staff[] {
  return mockStaff.filter(staff => staff.deletedAt === null);
}

/**
 * 有効なスタッフのみ取得
 */
export function getActiveStaff(): Staff[] {
  return mockStaff.filter(staff => staff.deletedAt === null && staff.isActive);
}

/**
 * IDでスタッフを取得
 */
export function getStaffById(id: number): Staff | undefined {
  return mockStaff.find(staff => staff.id === id && staff.deletedAt === null);
}

/**
 * メールアドレスでスタッフを取得
 */
export function getStaffByEmail(email: string): Staff | undefined {
  return mockStaff.find(
    staff => staff.email.toLowerCase() === email.toLowerCase() && staff.deletedAt === null
  );
}

/**
 * スタッフを検索
 */
export function searchStaff(query: string): Staff[] {
  if (!query.trim()) {
    return getAllStaff();
  }

  const lowerQuery = query.toLowerCase();
  return getAllStaff().filter(
    staff =>
      staff.name.toLowerCase().includes(lowerQuery) ||
      staff.email.toLowerCase().includes(lowerQuery)
  );
}

/**
 * スタッフを作成
 */
export function createStaff(input: StaffCreateInput): Staff {
  // メールアドレスの重複チェック
  const existing = getStaffByEmail(input.email);
  if (existing) {
    throw new Error('このメールアドレスは既に使用されています');
  }

  const now = new Date();
  const newStaff: Staff = {
    id: nextId++,
    supabaseUid: `supabase-uid-${String(nextId).padStart(3, '0')}`,
    name: input.name,
    email: input.email,
    role: input.role,
    isActive: input.isActive ?? true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  mockStaff.push(newStaff);
  return newStaff;
}

/**
 * スタッフを更新
 */
export function updateStaff(id: number, input: StaffUpdateInput): Staff | null {
  const staffIndex = mockStaff.findIndex(s => s.id === id && s.deletedAt === null);
  if (staffIndex === -1) {
    return null;
  }

  // メールアドレス変更時の重複チェック
  if (input.email) {
    const existing = getStaffByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new Error('このメールアドレスは既に使用されています');
    }
  }

  const updatedStaff: Staff = {
    ...mockStaff[staffIndex],
    ...input,
    updatedAt: new Date(),
  };

  mockStaff[staffIndex] = updatedStaff;
  return updatedStaff;
}

/**
 * スタッフを削除（論理削除）
 */
export function deleteStaff(id: number): boolean {
  const staffIndex = mockStaff.findIndex(s => s.id === id && s.deletedAt === null);
  if (staffIndex === -1) {
    return false;
  }

  mockStaff[staffIndex] = {
    ...mockStaff[staffIndex],
    deletedAt: new Date(),
    updatedAt: new Date(),
  };

  return true;
}

/**
 * スタッフの有効/無効を切り替え
 */
export function toggleStaffActive(id: number): Staff | null {
  const staff = getStaffById(id);
  if (!staff) {
    return null;
  }

  return updateStaff(id, { isActive: !staff.isActive });
}

/**
 * ログイン日時を更新
 */
export function updateLastLogin(id: number): Staff | null {
  const staffIndex = mockStaff.findIndex(s => s.id === id && s.deletedAt === null);
  if (staffIndex === -1) {
    return null;
  }

  mockStaff[staffIndex] = {
    ...mockStaff[staffIndex],
    lastLoginAt: new Date(),
    updatedAt: new Date(),
  };

  return mockStaff[staffIndex];
}
