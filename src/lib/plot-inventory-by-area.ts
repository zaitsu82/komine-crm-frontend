// 期別・㎡別 区画残数データ（2025年3月末現在）
// 各区画を面積別に分類したデータ

import { PlotPeriod } from '@/types/customer';

// 面積別区画情報の型定義
export interface PlotByAreaItem {
  period: PlotPeriod;
  areaSqm: number; // 面積（㎡）
  totalCount: number; // 区画数
  usedCount: number; // 使用数
  remainingCount: number; // 残数
  remainingAreaSqm: number; // 残㎡
  plotType: string; // タイプ（自由、吉相、樹林など）
}

// 期ごとの面積別集計
export interface PeriodAreaSummary {
  period: PlotPeriod;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  totalAreaSqm: number;
  remainingAreaSqm: number;
  items: PlotByAreaItem[];
}

// 第1期の面積別データ
export const PERIOD_1_BY_AREA: PlotByAreaItem[] = [
  { period: '1期', areaSqm: 0.5, totalCount: 35, usedCount: 35, remainingCount: 0, remainingAreaSqm: 0, plotType: '千羽鶴' },
  { period: '1期', areaSqm: 0.84, totalCount: 10, usedCount: 28, remainingCount: 2, remainingAreaSqm: 10, plotType: '墓林千羽鶴' },
  { period: '1期', areaSqm: 0.9, totalCount: 30, usedCount: 43, remainingCount: 0, remainingAreaSqm: 1, plotType: '自由' },
  { period: '1期', areaSqm: 1.3, totalCount: 44, usedCount: 1, remainingCount: 1, remainingAreaSqm: 0.2, plotType: '自由' },
  { period: '1期', areaSqm: 1.35, totalCount: 1, usedCount: 0, remainingCount: 0, remainingAreaSqm: 1.3, plotType: '自由' },
  { period: '1期', areaSqm: 1.49, totalCount: 2, usedCount: 2, remainingCount: 0, remainingAreaSqm: 0, plotType: '(社)-1' },
  { period: '1期', areaSqm: 1.5, totalCount: 15, usedCount: 15, remainingCount: 0, remainingAreaSqm: 0, plotType: '吉相' },
  { period: '1期', areaSqm: 1.6, totalCount: 2, usedCount: 2, remainingCount: 0, remainingAreaSqm: 0, plotType: '吉相' },
  { period: '1期', areaSqm: 1.7, totalCount: 2, usedCount: 1, remainingCount: 0, remainingAreaSqm: 0, plotType: '(社)-含む' },
  { period: '1期', areaSqm: 1.8, totalCount: 242, usedCount: 217, remainingCount: 25, remainingAreaSqm: 45, plotType: '自由' },
  { period: '1期', areaSqm: 2, totalCount: 14, usedCount: 13, remainingCount: 1, remainingAreaSqm: 6.48, plotType: '自由' },
  { period: '1期', areaSqm: 2.16, totalCount: 5, usedCount: 12, remainingCount: 3, remainingAreaSqm: 0, plotType: '自由' },
  { period: '1期', areaSqm: 2.25, totalCount: 12, usedCount: 2, remainingCount: 2, remainingAreaSqm: 4.95, plotType: '自由' },
  { period: '1期', areaSqm: 2.475, totalCount: 37, usedCount: 35, remainingCount: 0, remainingAreaSqm: 0, plotType: '(社)-含む' },
  { period: '1期', areaSqm: 2.48, totalCount: 2, usedCount: 24, remainingCount: 5, remainingAreaSqm: 13.5, plotType: '自由' },
  { period: '1期', areaSqm: 2.7, totalCount: 29, usedCount: 3, remainingCount: 0, remainingAreaSqm: 0, plotType: '(社)-含む' },
  { period: '1期', areaSqm: 3, totalCount: 3, usedCount: 7, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '1期', areaSqm: 3.15, totalCount: 29, usedCount: 24, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '1期', areaSqm: 3.36, totalCount: 7, usedCount: 7, remainingCount: 2, remainingAreaSqm: 49, plotType: '自由' },
  { period: '1期', areaSqm: 3.6, totalCount: 833, usedCount: 784, remainingCount: 5, remainingAreaSqm: 176.4, plotType: '自由' },
  { period: '1期', areaSqm: 3.69, totalCount: 15, usedCount: 15, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '1期', areaSqm: 3.87, totalCount: 36, usedCount: 31, remainingCount: 0, remainingAreaSqm: 19.35, plotType: '自由' },
  { period: '1期', areaSqm: 4, totalCount: 1, usedCount: 1, remainingCount: 18, remainingAreaSqm: 72.9, plotType: '自由' },
  { period: '1期', areaSqm: 4.05, totalCount: 293, usedCount: 275, remainingCount: 0, remainingAreaSqm: 0, plotType: '(社)-13含む' },
  { period: '1期', areaSqm: 4.275, totalCount: 9, usedCount: 7, remainingCount: 2, remainingAreaSqm: 8.55, plotType: '自由' },
  { period: '1期', areaSqm: 4.5, totalCount: 3, usedCount: 3, remainingCount: 1, remainingAreaSqm: 4.96, plotType: '自由' },
  { period: '1期', areaSqm: 4.96, totalCount: 8, usedCount: 7, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '1期', areaSqm: 5, totalCount: 1, usedCount: 4, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '1期', areaSqm: 5.12, totalCount: 4, usedCount: 1, remainingCount: 0, remainingAreaSqm: 0, plotType: '吉相' },
  { period: '1期', areaSqm: 5.2, totalCount: 1, usedCount: 0, remainingCount: 0, remainingAreaSqm: 13.95, plotType: '吉相' },
  { period: '1期', areaSqm: 6.975, totalCount: 2, usedCount: 3, remainingCount: 2, remainingAreaSqm: 0, plotType: '吉相' },
  { period: '1期', areaSqm: 7.2, totalCount: 3, usedCount: 3, remainingCount: 1, remainingAreaSqm: 9.92, plotType: '吉相' },
  { period: '1期', areaSqm: 9.92, totalCount: 2, usedCount: 1, remainingCount: 1, remainingAreaSqm: 10.24, plotType: '吉相' },
  { period: '1期', areaSqm: 10.24, totalCount: 4, usedCount: 3, remainingCount: 1, remainingAreaSqm: 12.8, plotType: '吉相' },
  { period: '1期', areaSqm: 12.8, totalCount: 3, usedCount: 2, remainingCount: 1, remainingAreaSqm: 12.8, plotType: '吉相' },
];

// 第2期の面積別データ
export const PERIOD_2_BY_AREA: PlotByAreaItem[] = [
  { period: '2期', areaSqm: 1, totalCount: 183, usedCount: 179, remainingCount: 4, remainingAreaSqm: 4, plotType: '墳墓' },
  { period: '2期', areaSqm: 1.8, totalCount: 72, usedCount: 63, remainingCount: 9, remainingAreaSqm: 16, plotType: '自由' },
  { period: '2期', areaSqm: 2, totalCount: 4, usedCount: 4, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '2期', areaSqm: 2.08, totalCount: 125, usedCount: 125, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '2期', areaSqm: 3, totalCount: 158, usedCount: 120, remainingCount: 38, remainingAreaSqm: 114, plotType: '自由' },
  { period: '2期', areaSqm: 4, totalCount: 54, usedCount: 54, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '2期', areaSqm: 5, totalCount: 1, usedCount: 1, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '2期', areaSqm: 6.73, totalCount: 4, usedCount: 4, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '2期', areaSqm: 8.4, totalCount: 1, usedCount: 1, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '2期', areaSqm: 12, totalCount: 1, usedCount: 1, remainingCount: 0, remainingAreaSqm: 0, plotType: '合計' },
];

// 第3期の面積別データ
export const PERIOD_3_BY_AREA: PlotByAreaItem[] = [
  { period: '3期', areaSqm: 1, totalCount: 123, usedCount: 122, remainingCount: 1, remainingAreaSqm: 1, plotType: '墳墓' },
  { period: '3期', areaSqm: 1.2, totalCount: 15, usedCount: 15, remainingCount: 0, remainingAreaSqm: 0, plotType: '墳墓' },
  { period: '3期', areaSqm: 1.35, totalCount: 8, usedCount: 8, remainingCount: 0, remainingAreaSqm: 0, plotType: '墳墓' },
  { period: '3期', areaSqm: 1.44, totalCount: 20, usedCount: 11, remainingCount: 9, remainingAreaSqm: 13, plotType: '墳墓' },
  { period: '3期', areaSqm: 1.5, totalCount: 12, usedCount: 6, remainingCount: 6, remainingAreaSqm: 9, plotType: '墳墓' },
  { period: '3期', areaSqm: 1.8, totalCount: 78, usedCount: 62, remainingCount: 16, remainingAreaSqm: 29, plotType: '墳墓' },
];

// 第3期 樹林・天空の面積別データ
export const PERIOD_3_SPECIAL_BY_AREA: PlotByAreaItem[] = [
  { period: '3期', areaSqm: 0.6, totalCount: 260, usedCount: 246, remainingCount: 14, remainingAreaSqm: 8.4, plotType: '樹林' },
  { period: '3期', areaSqm: 1, totalCount: 58, usedCount: 56, remainingCount: 2, remainingAreaSqm: 2.0, plotType: '天空K' },
];

// 第4期の面積別データ
export const PERIOD_4_BY_AREA: PlotByAreaItem[] = [
  { period: '4期', areaSqm: 1, totalCount: 104, usedCount: 95, remainingCount: 9, remainingAreaSqm: 9, plotType: 'るり庵テラス' },
  { period: '4期', areaSqm: 1.5, totalCount: 185, usedCount: 140, remainingCount: 45, remainingAreaSqm: 68, plotType: '墳墓' },
  { period: '4期', areaSqm: 2.4, totalCount: 130, usedCount: 79, remainingCount: 51, remainingAreaSqm: 122, plotType: '墳墓' },
  { period: '4期', areaSqm: 3, totalCount: 98, usedCount: 38, remainingCount: 60, remainingAreaSqm: 180, plotType: '墳墓' },
  { period: '4期', areaSqm: 4, totalCount: 29, usedCount: 25, remainingCount: 4, remainingAreaSqm: 16, plotType: '墳墓' },
  { period: '4期', areaSqm: 5, totalCount: 8, usedCount: 8, remainingCount: 0, remainingAreaSqm: 0, plotType: '自由' },
  { period: '4期', areaSqm: 8.4, totalCount: 66, usedCount: 6, remainingCount: 60, remainingAreaSqm: 0, plotType: '憩' },
  { period: '4期', areaSqm: 0.2, totalCount: 56, usedCount: 6, remainingCount: 50, remainingAreaSqm: 12, plotType: '恵' },
  { period: '4期', areaSqm: 0.3, totalCount: 34, usedCount: 3, remainingCount: 31, remainingAreaSqm: 15, plotType: '恵' },
  { period: '4期', areaSqm: 0.45, totalCount: 64, usedCount: 1, remainingCount: 63, remainingAreaSqm: 14, plotType: 'るり庵Ⅱ' },
];

// 第4期 つながり区の面積別データ
export const PERIOD_4_TSUNAGARI_BY_AREA: PlotByAreaItem[] = [
  { period: '4期', areaSqm: 1, totalCount: 104, usedCount: 95, remainingCount: 9, remainingAreaSqm: 9, plotType: 'つながり区' },
];

// 全面積別データを取得
export function getAllPlotsByArea(): PlotByAreaItem[] {
  return [
    ...PERIOD_1_BY_AREA,
    ...PERIOD_2_BY_AREA,
    ...PERIOD_3_BY_AREA,
    ...PERIOD_3_SPECIAL_BY_AREA,
    ...PERIOD_4_BY_AREA,
  ];
}

// 期別の面積別データを取得
export function getPlotsByAreaForPeriod(period: PlotPeriod): PlotByAreaItem[] {
  switch (period) {
    case '1期':
      return PERIOD_1_BY_AREA;
    case '2期':
      return PERIOD_2_BY_AREA;
    case '3期':
      return [...PERIOD_3_BY_AREA, ...PERIOD_3_SPECIAL_BY_AREA];
    case '4期':
      return PERIOD_4_BY_AREA;
    default:
      return [];
  }
}

// 期ごとの面積別集計を計算
export function calculatePeriodAreaSummary(period: PlotPeriod): PeriodAreaSummary {
  const items = getPlotsByAreaForPeriod(period);
  const totalCount = items.reduce((sum, item) => sum + item.totalCount, 0);
  const usedCount = items.reduce((sum, item) => sum + item.usedCount, 0);
  const remainingCount = items.reduce((sum, item) => sum + item.remainingCount, 0);
  const totalAreaSqm = items.reduce((sum, item) => sum + (item.totalCount * item.areaSqm), 0);
  const remainingAreaSqm = items.reduce((sum, item) => sum + item.remainingAreaSqm, 0);

  return {
    period,
    totalCount,
    usedCount,
    remainingCount,
    totalAreaSqm,
    remainingAreaSqm,
    items,
  };
}

// 全期の面積別集計を計算
export function calculateAllPeriodAreaSummaries(): PeriodAreaSummary[] {
  const periods: PlotPeriod[] = ['1期', '2期', '3期', '4期'];
  return periods.map(period => calculatePeriodAreaSummary(period));
}

// 全体の面積別集計を計算
export function calculateTotalAreaSummary(): {
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  totalAreaSqm: number;
  remainingAreaSqm: number;
} {
  const allItems = getAllPlotsByArea();
  return {
    totalCount: allItems.reduce((sum, item) => sum + item.totalCount, 0),
    usedCount: allItems.reduce((sum, item) => sum + item.usedCount, 0),
    remainingCount: allItems.reduce((sum, item) => sum + item.remainingCount, 0),
    totalAreaSqm: allItems.reduce((sum, item) => sum + (item.totalCount * item.areaSqm), 0),
    remainingAreaSqm: allItems.reduce((sum, item) => sum + item.remainingAreaSqm, 0),
  };
}

// 面積でグループ化して集計
export function getInventoryGroupedByArea(): {
  areaSqm: number;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  remainingAreaSqm: number;
}[] {
  const allItems = getAllPlotsByArea();
  const grouped = new Map<number, {
    totalCount: number;
    usedCount: number;
    remainingCount: number;
    remainingAreaSqm: number;
  }>();

  allItems.forEach(item => {
    const existing = grouped.get(item.areaSqm) || {
      totalCount: 0,
      usedCount: 0,
      remainingCount: 0,
      remainingAreaSqm: 0,
    };
    grouped.set(item.areaSqm, {
      totalCount: existing.totalCount + item.totalCount,
      usedCount: existing.usedCount + item.usedCount,
      remainingCount: existing.remainingCount + item.remainingCount,
      remainingAreaSqm: existing.remainingAreaSqm + item.remainingAreaSqm,
    });
  });

  return Array.from(grouped.entries())
    .map(([areaSqm, data]) => ({ areaSqm, ...data }))
    .sort((a, b) => a.areaSqm - b.areaSqm);
}

// タイプでグループ化して集計
export function getInventoryGroupedByType(): {
  plotType: string;
  totalCount: number;
  usedCount: number;
  remainingCount: number;
  remainingAreaSqm: number;
}[] {
  const allItems = getAllPlotsByArea();
  const grouped = new Map<string, {
    totalCount: number;
    usedCount: number;
    remainingCount: number;
    remainingAreaSqm: number;
  }>();

  allItems.forEach(item => {
    const existing = grouped.get(item.plotType) || {
      totalCount: 0,
      usedCount: 0,
      remainingCount: 0,
      remainingAreaSqm: 0,
    };
    grouped.set(item.plotType, {
      totalCount: existing.totalCount + item.totalCount,
      usedCount: existing.usedCount + item.usedCount,
      remainingCount: existing.remainingCount + item.remainingCount,
      remainingAreaSqm: existing.remainingAreaSqm + item.remainingAreaSqm,
    });
  });

  return Array.from(grouped.entries())
    .map(([plotType, data]) => ({ plotType, ...data }))
    .sort((a, b) => b.remainingCount - a.remainingCount);
}

// 残数のある面積別区画のみを取得
export function getAvailablePlotsByArea(): PlotByAreaItem[] {
  return getAllPlotsByArea().filter(item => item.remainingCount > 0);
}

// 残数0の面積別区画（完売）を取得
export function getSoldOutPlotsByArea(): PlotByAreaItem[] {
  return getAllPlotsByArea().filter(item => item.remainingCount === 0);
}

