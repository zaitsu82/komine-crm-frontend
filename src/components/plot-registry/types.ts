import type { PlotListItem } from '@komine/types';

// ===== ソート =====

export type SortKey =
  | 'status'
  | 'plotNumber'
  | 'customerName'
  | 'phoneNumber'
  | 'areaName'
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
