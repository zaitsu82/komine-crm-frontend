/**
 * 区画・契約関連の定数・型定義
 *
 * customer.ts から分離した独立した定数・型。
 * Customer 型に依存しない共通定数として使用。
 */

// ===== 工事情報型定義 =====

export type ConstructionType = 'gravestone' | 'enclosure' | 'additional' | 'repair' | 'other';

export const CONSTRUCTION_TYPE_LABELS: Record<ConstructionType, string> = {
  gravestone: '墓石工事',
  enclosure: '外柵工事',
  additional: '付帯工事',
  repair: '修繕工事',
  other: 'その他',
};

// ===== 履歴情報型定義 =====

export type HistoryReasonType = 'new_registration' | 'info_change' | 'name_change' | 'address_change' | 'burial_update' | 'contract_change' | 'termination' | 'other';

export const HISTORY_REASON_LABELS: Record<HistoryReasonType, string> = {
  new_registration: '新規登録',
  info_change: '記載事項変更',
  name_change: '名義変更',
  address_change: '住所変更',
  burial_update: '埋葬情報更新',
  contract_change: '契約変更',
  termination: '解約',
  other: 'その他',
};

// ===== 区画期・区画管理定義 =====

export type PlotPeriod = '第1期' | '第2期' | '第3期' | '第3期樹林部' | '第4期';

export const PLOT_SECTIONS_BY_PERIOD: Record<PlotPeriod, string[]> = {
  '第1期': ['A', 'B', 'C', '吉相', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
  '第2期': ['1', '2', '3', '4', '5', '6', '7', '8'],
  '第3期': ['10', '11'],
  '第3期樹林部': ['樹林', '天空K'],
  '第4期': ['るり庵テラス', '1.5', '2.4', '3', '4', '5', '8.4', '憩', '恵', '想', 'るり庵テラスⅡ'],
};

export const PLOT_PERIOD_LABELS: Record<PlotPeriod, string> = {
  '第1期': '第1期',
  '第2期': '第2期',
  '第3期': '第3期',
  '第3期樹林部': '第3期樹林部',
  '第4期': '第4期',
};

// ===== 区画サイズ定数 =====

export const PLOT_SIZE = {
  FULL: 3.6,
  HALF: 1.8,
} as const;

export type PlotSizeType = 'full' | 'half';

export const PLOT_SIZE_LABELS: Record<PlotSizeType, string> = {
  full: '1区画（3.6㎡）',
  half: '半区画（1.8㎡）',
};

/**
 * 面積(㎡)から区画サイズの短いラベルを返す（'1区画' / '半区画'）。
 * 既知サイズ以外（0.9㎡ 等）は null。台帳詳細の面積注記（#178）で使用。
 */
export function getPlotSizeLabel(areaSqm: number | null | undefined): string | null {
  if (areaSqm == null) return null;
  if (areaSqm === PLOT_SIZE.FULL) return '1区画';
  if (areaSqm === PLOT_SIZE.HALF) return '半区画';
  return null;
}

// ===== 在庫状況ステータス（区画残数管理の「状況」バッジ）=====

/**
 * 在庫状況ステータス。残数（絶対値）で判定する。
 * 区画残数管理テーブルの「状況」列で使用。
 */
export type AvailabilityStatus = 'sold_out' | 'low_stock' | 'available';

/**
 * 「残少」とみなす残数の上限（この数「以下」かつ 1 以上が残少）。
 * 状況バッジの判定ロジックと画面凡例で同じ値を参照し、表示と判定の乖離を防ぐ（#183）。
 */
export const LOW_STOCK_THRESHOLD = 5;

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  sold_out: '完売',
  low_stock: '残少',
  available: '空有',
};

/**
 * 残数から在庫状況ステータスを判定する（#183）。
 *
 * 判定軸は「残数の絶対値」であり、テーブルに表示される使用率%（バーの色帯）とは別軸。
 * 使用率が中程度でも残数が少なければ「残少」になり得るため、画面では両者を別の凡例で示す。
 * - 残 0        → 完売
 * - 残 1〜上限   → 残少（上限 = LOW_STOCK_THRESHOLD）
 * - 残 上限超    → 空有
 */
export function getAvailabilityStatus(remainingCount: number): AvailabilityStatus {
  if (remainingCount <= 0) return 'sold_out';
  if (remainingCount <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'available';
}

// ===== 所有区画情報 =====

export interface OwnedPlot {
  id: string;
  plotNumber: string;
  plotPeriod?: PlotPeriod;
  section?: string;
  sizeType: PlotSizeType;
  areaSqm: number;
  purchaseDate?: Date | null;
  price?: number;
  status: 'in_use' | 'available' | 'reserved';
  notes?: string;
}

export interface OwnedPlotsInfo {
  totalAreaSqm: number;
  plotCount: number;
  plotNumbers: string[];
  displayText: string;
}

// ===== 区画・ユニット管理型定義 =====

export type PlotUnitType = 'grave_site' | 'columbarium' | 'ossuary' | 'other';

export const PLOT_UNIT_TYPE_LABELS: Record<PlotUnitType, string> = {
  grave_site: '墓地区画',
  columbarium: '納骨堂',
  ossuary: '合葬墓',
  other: 'その他',
};

export type PlotStatusLocal = 'in_use' | 'available' | 'reserved';

export const PLOT_STATUS_LABELS: Record<PlotStatusLocal, string> = {
  in_use: '使用中',
  available: '空き',
  reserved: '予約済み',
};

export type OwnershipType = 'exclusive' | 'shared';

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  exclusive: '独占',
  shared: '共同',
};

export interface PlotUnit {
  id: string;
  plotNumber: string;
  section: string;
  type: PlotUnitType;
  areaSqm?: number;
  baseCapacity: number;
  allowGoushi: boolean;
  basePrice?: number;
  currentStatus: PlotStatusLocal;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerPlotAssignment {
  id: string;
  customerId?: string;
  plotNumber?: string;
  draftUnit?: {
    section: string;
    type: PlotUnitType;
    areaSqm?: number;
    baseCapacity: number;
    allowGoushi: boolean;
    basePrice?: number;
    notes?: string;
  };
  capacityOverride?: number;
  effectiveCapacity: number;
  allowGoushi: boolean;
  ownership: OwnershipType;
  purchaseDate: Date | null;
  price?: number;
  desiredStatus: PlotStatusLocal;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlotAssignmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PlotAvailabilityCheck {
  plotNumber: string;
  isAvailable: boolean;
  currentStatus: PlotStatusLocal;
  conflictingCustomers?: string[];
  message?: string;
}

// ===== 工事記録 =====

export interface ConstructionRecord {
  id: string;
  contractorName: string;
  constructionType: ConstructionType;
  startDate: Date | null;
  scheduledEndDate: Date | null;
  endDate: Date | null;
  description: string;
  constructionAmount: number | null;
  paidAmount: number | null;
  notes?: string;
}

// ===== 履歴情報 =====

export interface ContractorSnapshot {
  name: string;
  nameKana: string;
  birthDate: Date | null;
  gender: 'male' | 'female' | undefined;
  postalCode?: string;
  address: string;
  phoneNumber: string;
  faxNumber?: string;
  email?: string;
  companyName?: string;
  companyNameKana?: string;
  companyAddress?: string;
  companyPhone?: string;
}

export interface HistoryRecord {
  id: string;
  updatedAt: Date;
  updatedBy: string;
  reasonType: HistoryReasonType;
  reasonDetail?: string;
  contractorSnapshot: ContractorSnapshot;
}
