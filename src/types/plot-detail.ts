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
  icon: 'search' | 'archive' | 'grid' | 'file-text' | 'users' | 'settings' | 'upload';
}

// メニューグループ定義
export interface MenuGroupConfig {
  label: string;
  items: MenuItemConfig[];
}

export const MENU_GROUPS: MenuGroupConfig[] = [
  {
    label: '業務',
    items: [
      { label: '台帳問い合わせ', view: 'registry', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'search' },
      { label: '合祀管理', view: 'collective-burial', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'archive' },
      { label: '区画残数管理', view: 'plot-availability', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'grid' },
      { label: '書類管理', view: 'documents', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'file-text' },
    ],
  },
  {
    label: '管理',
    items: [
      { label: 'スタッフ管理', view: 'staff-management', requiredRoles: ['manager', 'admin'], icon: 'users' },
      { label: 'マスタ管理', view: 'masters', requiredRoles: ['admin'], icon: 'settings' },
      { label: '一括登録', view: 'bulk-import', requiredRoles: ['manager', 'admin'], icon: 'upload' },
    ],
  },
];

// フラットなMENU_ITEMS（後方互換性のため維持）
export const MENU_ITEMS: MenuItemConfig[] = MENU_GROUPS.flatMap(g => g.items);

export type MenuItem = string;
