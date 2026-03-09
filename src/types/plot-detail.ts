// 顧客詳細画面のビュータイプ
export type ViewType =
  | 'registry'
  | 'plot-details'
  | 'register'
  | 'edit'
  | 'collective-burial'
  | 'plot-availability'
  | 'staff-management'
  | 'masters'
  | 'documents'
  | 'document-select'
  | 'document-history'
  | 'bulk-import'
  | 'profile';

// 対応履歴の型定義
export interface HistoryEntry {
  id: string;
  date: string;
  staff: string;
  type: string;
  priority: '通常' | '重要' | '緊急';
  content: string;
}

// 重要な連絡事項の型定義
export interface ImportantNote {
  id: string;
  date: string;
  priority: '要注意' | '注意' | '参考';
  content: string;
}

// ユーザーロール型
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

// サイドバーメニュー項目（ロール要件付き）
export interface MenuItemConfig {
  label: string;
  view: ViewType;
  requiredRoles: UserRole[];
}

export const MENU_ITEMS: MenuItemConfig[] = [
  { label: '台帳問い合わせ', view: 'registry', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
  { label: '合祀管理', view: 'collective-burial', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
  { label: '区画残数管理', view: 'plot-availability', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
  { label: '書類管理', view: 'documents', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
  { label: 'スタッフ管理', view: 'staff-management', requiredRoles: ['manager', 'admin'] },
  { label: 'マスタ管理', view: 'masters', requiredRoles: ['admin'] },
  { label: '一括登録', view: 'bulk-import', requiredRoles: ['manager', 'admin'] },
  { label: 'アカウント設定', view: 'profile', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
];

export type MenuItem = string;
