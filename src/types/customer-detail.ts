import { TerminationProcessType } from './customer';

// 顧客詳細画面のビュータイプ
export type ViewType =
  | 'registry'
  | 'search'
  | 'details'
  | 'plot-details'
  | 'register'
  | 'edit'
  | 'collective-burial'
  | 'plot-availability'
  | 'staff-management'
  | 'documents'
  | 'invoice'
  | 'document-select'
  | 'document-history';

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

// 解約フォームの型定義
export interface TerminationFormData {
  terminationDate: string;
  reason: string;
  processType: TerminationProcessType;
  processDetail: string;
  refundAmount: string;
  handledBy: string;
  notes: string;
}

// サイドバーメニュー項目
export const MENU_ITEMS = [
  '台帳問い合わせ',
  '合祀管理',
  '区画残数管理',
  '書類管理',
  'スタッフ管理',
] as const;

export type MenuItem = typeof MENU_ITEMS[number];
