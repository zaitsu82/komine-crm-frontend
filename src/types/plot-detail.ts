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

