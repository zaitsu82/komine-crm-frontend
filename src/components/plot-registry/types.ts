import type { PlotListItem } from '@komine/types';

// ===== ソート =====

// サーバーソート対応キーのみ（SERVER_SORT_MAP と一致させる）。
// areaName/phoneNumber は backend に安定した orderBy 経路が無くソート不能の
// ため、見出しのソートアフォーダンスごと撤去した（#224）
export type SortKey =
  | 'plotNumber'
  | 'customerName'
  | 'contractDate'
  | 'paymentStatus'
  | 'managementFee';

export type SortOrder = 'asc' | 'desc';

// ===== あいう順タブ =====

export interface AiueoTab {
  key: string;
  label: string;
  shortLabel: string;
  kataKey?: string;
}

// ===== コンポーネント props =====

export interface PlotRegistryProps {
  onPlotSelect: (plot: PlotListItem) => void;
  selectedPlotId?: string;
  onNewPlot?: () => void;
  onPlotHover?: (plot: PlotListItem) => void;
}
