// 区画在庫データ（2025年6月末現在）
// 基本ルール: 1区画 = 3.6㎡、必要に応じて1.8㎡×2に分割販売

import { PlotPeriod } from '@/types/plot-constants';

// 区画在庫情報の型定義
export interface PlotInventoryItem {
  period: PlotPeriod;
  section: string;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  category?: string; // 樹林・天空などの特殊カテゴリ
}

// 期ごとの集計情報
export interface PeriodSummary {
  period: PlotPeriod;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  usageRate: number; // 使用率（%）
}

// 全体の集計情報
export interface InventorySummary {
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  usageRate: number;
  lastUpdated: string;
}

// 第1期の区画データ
export const PERIOD_1_INVENTORY: PlotInventoryItem[] = [
  { period: '1期', section: 'A', totalCount: 149, usedCount: 138, remainingCount: 11 },
  { period: '1期', section: 'B', totalCount: 6, usedCount: 6, remainingCount: 0 },
  { period: '1期', section: 'C', totalCount: 136, usedCount: 133, remainingCount: 3 },
  { period: '1期', section: '吉相', totalCount: 39, usedCount: 31, remainingCount: 8 },
  { period: '1期', section: 'D', totalCount: 99, usedCount: 94, remainingCount: 5 },
  { period: '1期', section: 'E', totalCount: 60, usedCount: 53, remainingCount: 7 },
  { period: '1期', section: 'F', totalCount: 122, usedCount: 112, remainingCount: 10 },
  { period: '1期', section: 'G', totalCount: 113, usedCount: 108, remainingCount: 5 },
  { period: '1期', section: 'H', totalCount: 119, usedCount: 116, remainingCount: 3 },
  { period: '1期', section: 'I', totalCount: 175, usedCount: 163, remainingCount: 12 },
  { period: '1期', section: 'J', totalCount: 142, usedCount: 118, remainingCount: 24 },
  { period: '1期', section: 'K', totalCount: 123, usedCount: 106, remainingCount: 17 },
  { period: '1期', section: 'L', totalCount: 71, usedCount: 68, remainingCount: 3 },
  { period: '1期', section: 'M', totalCount: 52, usedCount: 51, remainingCount: 1 },
  { period: '1期', section: 'N', totalCount: 131, usedCount: 122, remainingCount: 9 },
  { period: '1期', section: 'O', totalCount: 88, usedCount: 83, remainingCount: 5 },
  { period: '1期', section: 'P', totalCount: 86, usedCount: 78, remainingCount: 8 },
];

// 第2期の区画データ
export const PERIOD_2_INVENTORY: PlotInventoryItem[] = [
  { period: '2期', section: '1', totalCount: 95, usedCount: 93, remainingCount: 2 },
  { period: '2期', section: '2', totalCount: 125, usedCount: 125, remainingCount: 0 },
  { period: '2期', section: '3', totalCount: 94, usedCount: 57, remainingCount: 37 },
  { period: '2期', section: '5', totalCount: 29, usedCount: 29, remainingCount: 0 },
  { period: '2期', section: '6', totalCount: 111, usedCount: 107, remainingCount: 4 },
  { period: '2期', section: '7', totalCount: 86, usedCount: 78, remainingCount: 8 },
  { period: '2期', section: '8', totalCount: 64, usedCount: 63, remainingCount: 1 },
];

// 第3期の区画データ
export const PERIOD_3_INVENTORY: PlotInventoryItem[] = [
  { period: '3期', section: '10', totalCount: 133, usedCount: 102, remainingCount: 31 },
  { period: '3期', section: '11', totalCount: 123, usedCount: 122, remainingCount: 1 },
];

// 第3期 樹林・天空の区画データ
export const PERIOD_3_SPECIAL_INVENTORY: PlotInventoryItem[] = [
  { period: '3期', section: '樹林', totalCount: 260, usedCount: 246, remainingCount: 14, category: '樹林・天空' },
  { period: '3期', section: '天空K', totalCount: 58, usedCount: 56, remainingCount: 2, category: '樹林・天空' },
];

// 第4期の区画データ
export const PERIOD_4_INVENTORY: PlotInventoryItem[] = [
  { period: '4期', section: '1', totalCount: 104, usedCount: 95, remainingCount: 9 },
  { period: '4期', section: '1.5', totalCount: 185, usedCount: 140, remainingCount: 45 },
  { period: '4期', section: '2.4', totalCount: 130, usedCount: 79, remainingCount: 51 },
  { period: '4期', section: '3', totalCount: 98, usedCount: 38, remainingCount: 60 },
  { period: '4期', section: '4', totalCount: 29, usedCount: 25, remainingCount: 4 },
  { period: '4期', section: '5', totalCount: 8, usedCount: 8, remainingCount: 0 },
  { period: '4期', section: '8.4', totalCount: 66, usedCount: 6, remainingCount: 60 },
  { period: '4期', section: '憩', totalCount: 56, usedCount: 6, remainingCount: 50 },
  { period: '4期', section: '恵', totalCount: 34, usedCount: 3, remainingCount: 31 },
  { period: '4期', section: 'るり庵Ⅱ', totalCount: 64, usedCount: 1, remainingCount: 63 },
  { period: '4期', section: 'るり庵テラス', totalCount: 25, usedCount: 0, remainingCount: 25 },
];

// 全区画データを取得
export function getAllPlotInventory(): PlotInventoryItem[] {
  return [
    ...PERIOD_1_INVENTORY,
    ...PERIOD_2_INVENTORY,
    ...PERIOD_3_INVENTORY,
    ...PERIOD_3_SPECIAL_INVENTORY,
    ...PERIOD_4_INVENTORY,
  ];
}

// 期別の区画データを取得
export function getPlotInventoryByPeriod(period: PlotPeriod): PlotInventoryItem[] {
  switch (period) {
    case '1期':
      return PERIOD_1_INVENTORY;
    case '2期':
      return PERIOD_2_INVENTORY;
    case '3期':
      return [...PERIOD_3_INVENTORY, ...PERIOD_3_SPECIAL_INVENTORY];
    case '4期':
      return PERIOD_4_INVENTORY;
    default:
      return [];
  }
}

// 期ごとの集計を計算
export function calculatePeriodSummary(period: PlotPeriod): PeriodSummary {
  const items = getPlotInventoryByPeriod(period);
  const totalCount = items.reduce((sum, item) => sum + item.totalCount, 0);
  const usedCount = items.reduce((sum, item) => sum + item.usedCount, 0);
  const remainingCount = items.reduce((sum, item) => sum + item.remainingCount, 0);
  const usageRate = totalCount > 0 ? Math.round((usedCount / totalCount) * 100 * 10) / 10 : 0;

  return {
    period,
    totalCount,
    usedCount,
    remainingCount,
    usageRate,
  };
}

// 全期の集計を計算
export function calculateAllPeriodSummaries(): PeriodSummary[] {
  const periods: PlotPeriod[] = ['1期', '2期', '3期', '4期'];
  return periods.map(period => calculatePeriodSummary(period));
}

// 全体の集計を計算
export function calculateInventorySummary(): InventorySummary {
  const allItems = getAllPlotInventory();
  const totalCount = allItems.reduce((sum, item) => sum + item.totalCount, 0);
  const usedCount = allItems.reduce((sum, item) => sum + item.usedCount, 0);
  const remainingCount = allItems.reduce((sum, item) => sum + item.remainingCount, 0);
  const usageRate = totalCount > 0 ? Math.round((usedCount / totalCount) * 100 * 10) / 10 : 0;

  return {
    totalCount,
    usedCount,
    remainingCount,
    usageRate,
    lastUpdated: '2025年6月末',
  };
}

// 残数のある区画のみを取得
export function getAvailablePlots(): PlotInventoryItem[] {
  return getAllPlotInventory().filter(item => item.remainingCount > 0);
}

// 残数0の区画（完売）を取得
export function getSoldOutPlots(): PlotInventoryItem[] {
  return getAllPlotInventory().filter(item => item.remainingCount === 0);
}

// エリア別（区画別）の集計を取得
export function getInventoryBySections(): { section: string; period: PlotPeriod; totalCount: number; usedCount: number; remainingCount: number; usageRate: number }[] {
  return getAllPlotInventory().map(item => ({
    section: item.section,
    period: item.period,
    totalCount: item.totalCount,
    usedCount: item.usedCount,
    remainingCount: item.remainingCount,
    usageRate: item.totalCount > 0 ? Math.round((item.usedCount / item.totalCount) * 100 * 10) / 10 : 0,
  }));
}

// 平米数ごとの残り区画数を計算（概算）
// 1区画 = 3.6㎡、半区画 = 1.8㎡
export function getInventoryBySize(): { sizeType: 'full' | 'half'; areaSqm: number; totalCount: number; usedCount: number; remainingCount: number }[] {
  const summary = calculateInventorySummary();

  // 全体の区画を3.6㎡として計算（実際の運用では個別管理が必要）
  return [
    {
      sizeType: 'full',
      areaSqm: 3.6,
      totalCount: summary.totalCount,
      usedCount: summary.usedCount,
      remainingCount: summary.remainingCount,
    },
    {
      sizeType: 'half',
      areaSqm: 1.8,
      totalCount: summary.totalCount * 2, // 半区画に分割した場合
      usedCount: summary.usedCount * 2,
      remainingCount: summary.remainingCount * 2,
    },
  ];
}

// 使用率でソート（高い順）
export function getInventorySortedByUsageRate(ascending: boolean = false): PlotInventoryItem[] {
  const items = getAllPlotInventory().map(item => ({
    ...item,
    usageRate: item.totalCount > 0 ? (item.usedCount / item.totalCount) * 100 : 0,
  }));

  return items.sort((a, b) => ascending ? a.usageRate - b.usageRate : b.usageRate - a.usageRate);
}

// 残数でソート（多い順）
export function getInventorySortedByRemaining(ascending: boolean = false): PlotInventoryItem[] {
  return getAllPlotInventory().sort((a, b) =>
    ascending ? a.remainingCount - b.remainingCount : b.remainingCount - a.remainingCount
  );
}

