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

