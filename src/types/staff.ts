/**
 * スタッフ管理 - 型定義
 * バックエンドのprisma/schema.prisma Staffモデルに準拠
 */

// スタッフ権限
export type StaffRole = 'viewer' | 'operator' | 'manager' | 'admin';

// 権限ラベル
export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  viewer: '閲覧者',
  operator: 'オペレーター',
  manager: 'マネージャー',
  admin: '管理者',
};

// 権限の説明
export const STAFF_ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  viewer: '台帳・スタッフ情報の閲覧のみ可能',
  operator: '台帳の登録・編集が可能',
  manager: '台帳の削除・レポート出力が可能',
  admin: 'スタッフ管理を含む全機能が利用可能',
};

// 権限レベル（数値が大きいほど上位）
export const STAFF_ROLE_LEVELS: Record<StaffRole, number> = {
  viewer: 1,
  operator: 2,
  manager: 3,
  admin: 4,
};

// スタッフインターフェース
export interface Staff {
  id: number;
  supabaseUid: string;       // Supabase User ID（認証連携用）
  name: string;              // 氏名
  email: string;             // メールアドレス
  role: StaffRole;           // 権限
  isActive: boolean;         // 有効/無効
  lastLoginAt: Date | null;  // 最終ログイン日時
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// スタッフ作成用（IDなど自動生成フィールドを除く）
export interface StaffCreateInput {
  name: string;
  email: string;
  role: StaffRole;
  isActive?: boolean;
}

// スタッフ更新用
export interface StaffUpdateInput {
  name?: string;
  email?: string;
  role?: StaffRole;
  isActive?: boolean;
}

// 権限チェック用ヘルパー
export function hasPermission(userRole: StaffRole, requiredRole: StaffRole): boolean {
  return STAFF_ROLE_LEVELS[userRole] >= STAFF_ROLE_LEVELS[requiredRole];
}

// 管理者権限チェック
export function isAdmin(role: StaffRole): boolean {
  return role === 'admin';
}

// スタッフ編集権限チェック
export function canManageStaff(role: StaffRole): boolean {
  return role === 'admin';
}
