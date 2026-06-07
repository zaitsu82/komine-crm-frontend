import { UserRole } from '@/types/plot-detail';

export interface NavItem {
  label: string;
  path: string;
  icon: 'search' | 'archive' | 'grid' | 'file-text' | 'users' | 'settings' | 'bank';
  requiredRoles: UserRole[];
  /** 各機能の役割・業務フロー上の位置づけ（ツールチップ／補足表示に使用 #191） */
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  /** グループの概要（サイドバーのグループ見出し下に表示 #191） */
  description?: string;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '業務',
    description: '日常の台帳・請求・合祀業務',
    items: [
      { label: '台帳問い合わせ', path: '/plots', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'search', description: '区画ごとの契約・顧客・請求・入金を管理する基点の画面' },
      { label: '合祀管理', path: '/collective-burials', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'archive', description: '契約期間の満了後に行う合祀の予定・請求を管理' },
      { label: '区画残数管理', path: '/plot-availability', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'grid', description: '区画の空き状況・使用率を期別に集計' },
      { label: '書類管理', path: '/documents', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'file-text', description: '契約書・許可証などの書類を発行・管理' },
      { label: 'ゆうちょ連携', path: '/yucho', requiredRoles: ['operator', 'manager', 'admin'], icon: 'bank', description: '管理料の口座振替データ（CSV）を出力' },
    ],
  },
  {
    label: '管理',
    description: 'システム設定・権限管理',
    items: [
      { label: 'スタッフ管理', path: '/staff', requiredRoles: ['manager', 'admin'], icon: 'users', description: '職員アカウントと権限（ロール）を管理' },
      { label: 'マスタ管理', path: '/masters', requiredRoles: ['admin'], icon: 'settings', description: '宗派・区分などの選択肢マスタを管理' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);

// 「業務の流れ」ステッパー定義（WORKFLOW_STEP_PATHS / WORKFLOW_STEPS、#191）は
// 業務フロー誤記載のため暫定削除（#265）。正フロー確定後に再実装を検討する。
