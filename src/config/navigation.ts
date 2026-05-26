import { UserRole } from '@/types/plot-detail';

export interface NavItem {
  label: string;
  path: string;
  icon: 'search' | 'archive' | 'grid' | 'file-text' | 'users' | 'settings' | 'upload' | 'bank';
  requiredRoles: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '業務',
    items: [
      { label: '台帳問い合わせ', path: '/plots', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'search' },
      { label: '合祀管理', path: '/collective-burials', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'archive' },
      { label: '区画残数管理', path: '/plot-availability', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'grid' },
      { label: '書類管理', path: '/documents', requiredRoles: ['viewer', 'operator', 'manager', 'admin'], icon: 'file-text' },
      { label: 'ゆうちょ連携', path: '/yucho', requiredRoles: ['operator', 'manager', 'admin'], icon: 'bank' },
    ],
  },
  {
    label: '管理',
    items: [
      { label: 'スタッフ管理', path: '/staff', requiredRoles: ['manager', 'admin'], icon: 'users' },
      { label: 'マスタ管理', path: '/masters', requiredRoles: ['admin'], icon: 'settings' },
      { label: '一括登録・編集', path: '/bulk-import', requiredRoles: ['manager', 'admin'], icon: 'upload' },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);
