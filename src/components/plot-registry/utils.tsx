import type { PlotListItem } from '@komine/types';
import { getPlotDisplayStatus } from '@/lib/api/plots';
import { formatCurrency, formatYearMonth } from '@/lib/format';
import { SEARCH_HISTORY_KEY, SEARCH_HISTORY_MAX } from './constants';

// ===== 検索履歴 =====

export function loadSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string').slice(0, SEARCH_HISTORY_MAX)
      : [];
  } catch {
    return [];
  }
}

export function saveSearchHistory(history: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, SEARCH_HISTORY_MAX)));
  } catch {
    // ignore quota/disabled errors
  }
}

// ===== フォーマッタ =====

/** 一覧の契約日。2桁年を廃し共通の {@link formatYearMonth}（YYYY/MM）に統一（#167）。 */
export function formatContractDate(dateStr: string | null | undefined): string {
  return formatYearMonth(dateStr);
}

/**
 * 検索語が「表示中の契約者名」以外でヒットした理由を返す（#162）。
 * 氏名/フリガナ一致なら null（期待どおりなのでバッジ不要）。
 * 表示フィールド（区画番号/住所/電話/埋葬者）で一致すればその項目を示し、
 * いずれも一致しなければ別ロールの氏名等、一覧に出ていない情報での一致とみなす。
 */
export function getSearchHitReason(
  plot: PlotListItem,
  query: string | null | undefined,
): string | null {
  const q = query?.trim().toLowerCase();
  if (!q) return null;
  const has = (v: string | null | undefined): boolean => !!v && v.toLowerCase().includes(q);

  if (has(plot.customerName) || has(plot.customerNameKana)) return null;
  if (has(plot.displayNumber) || has(plot.plotNumber)) return '区画番号に一致';
  if (has(plot.customerAddress)) return '住所に一致';
  if (has(plot.customerPhoneNumber)) return '電話番号に一致';
  if (plot.buriedPersonNames?.some((n) => has(n))) return '埋葬者名に一致';
  return '関係者情報に一致';
}

/** @deprecated 共通の {@link formatCurrency} を使用。後方互換のため残置。 */
export function formatMoneyString(value: string | null | undefined): string {
  return formatCurrency(value);
}

// ===== 行表示ヘルパー（テーブル・モバイルカードで共用） =====

/** 入金状態に応じたステータスバッジ（丸印） */
export function getStatusBadge(plot: PlotListItem) {
  const status = getPlotDisplayStatus(plot);
  switch (status) {
    case 'overdue':
      return <span className="inline-block w-6 h-6 rounded-full bg-beni text-white text-xs leading-6 text-center" title="滞納">滞</span>;
    case 'attention':
      return <span className="inline-block w-6 h-6 rounded-full bg-kohaku text-white text-xs leading-6 text-center" title="未入金">未</span>;
    default:
      return <span className="inline-block w-6 h-6 rounded-full bg-matsu text-white text-xs leading-6 text-center" title="正常">正</span>;
  }
}

/** 行背景色。滞納/未入金を強調し、それ以外はゼブラ。 */
export function getRowBgColor(plot: PlotListItem, absoluteIndex: number) {
  const status = getPlotDisplayStatus(plot);
  if (status === 'overdue') return 'bg-beni-50';
  if (status === 'attention') return 'bg-kohaku-50';
  return absoluteIndex % 2 === 0 ? 'bg-white' : 'bg-kinari';
}
