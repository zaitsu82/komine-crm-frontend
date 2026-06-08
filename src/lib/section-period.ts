/**
 * 区画名（area_name）から期（第N期）を導出する。
 *
 * 期はDBに独立カラムを持たず、区画名マスタ（SectionNameMaster.period）から導出する設計（#166）。
 * バックエンドの inventoryService.resolvePeriod と同じ規則をフロントでも再利用し、
 * 区画詳細・一覧で「期」を表示できるようにする（#285 / #166）。
 *
 * 解決規則（backend resolvePeriod と一致）:
 *   1. area_name 自体が期名（"第1期" 等。手動作成区画など）ならそのまま採用。
 *   2. 区画名マスタに登録があればその period。
 *   3. いずれにも該当しなければ未分類（このフロント関数では null を返す）。
 *
 * バックエンドが area_name を正規化（実区画名へ backfill）済みなら、
 * 区画名マスタ経由で正しい期が解決される。未正規化のレガシー値（"1-29" 等）は
 * マスタに無いため null となり、呼び出し側で「整備中／未分類」表示にできる。
 */

import type { SectionNameMasterItem } from '@/lib/api/masters';

/** 期の正式名称（backend inventoryService.PERIODS と一致）。表示順の正本も兼ねる。 */
export const PERIOD_NAMES = ['第1期', '第2期', '第3期', '第3期樹林部', '第4期'] as const;

/** 未分類バケットのラベル（backend UNCLASSIFIED_PERIOD と一致）。 */
export const UNCLASSIFIED_PERIOD = 'その他';

const PERIOD_NAME_SET: ReadonlySet<string> = new Set(PERIOD_NAMES);

/**
 * 区画名マスタ（name → period）の解決用マップを作る。
 * is_active のフィルタは呼び出し側（useMasters の active 系）で済んでいる前提だが、
 * allMasters を渡しても害は無い（同名の最新 period で上書き）。
 */
export function buildSectionPeriodMap(
  sectionNames: SectionNameMasterItem[] | null | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of sectionNames ?? []) {
    if (s.name && s.period) map.set(s.name, s.period);
  }
  return map;
}

/**
 * 区画名から期を解決する。導出できない場合（レガシー未正規化値・マスタ未登録）は null。
 *
 * @param areaName  PhysicalPlot.areaName（実区画名 例 "凛A"、またはレガシー "1-29"）
 * @param sectionNames 区画名マスタ（useMasters().sectionNames など）
 * @returns 期名（"第4期" 等）、解決不能なら null
 */
export function resolvePeriodFromAreaName(
  areaName: string | null | undefined,
  sectionNames: SectionNameMasterItem[] | null | undefined,
): string | null {
  if (!areaName) return null;
  const name = areaName.trim();
  if (PERIOD_NAME_SET.has(name)) return name;
  return buildSectionPeriodMap(sectionNames).get(name) ?? null;
}
