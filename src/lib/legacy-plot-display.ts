/**
 * レガシー移行値の判定（#164 / #166 / #182 の暫定対応）
 *
 * レガシーDB移行で、物理区画に内部値がそのまま格納されている:
 * - plot_number = `legacy-{grave_cd}`（例 legacy-101）。区画残数の集計では
 *   セクション抽出により bare `legacy` になることもある
 * - area_name  = `{chiku_cd}-{area_cd}`（例 1-29）、または `unknown-{grave_cd}`
 *
 * 正式な区画番号・区画名（SectionNameMaster の期＋区画名）への正規化は
 * 業務マッピング確定待ち（#151 / #14）。それまでの暫定として、未正規化値を
 * 「整備中（要確認）」と明示し、信頼できる業務番号と誤認させないようにする。
 *
 * バックエンドで area_name / plot_number が正規化されれば判定は自然に false になり、
 * 画面上の「整備中」表示も消える（自己無効化）。
 */

export const LEGACY_VALUE_NOTE =
  '正式な区画番号・区画名は整備中です（レガシー移行値・要確認）';

// legacy-101 / unknown-xxx / 集計上の bare 'legacy'・'unknown'
const LEGACY_NUMBER_RE = /^(legacy|unknown)(-|$)/i;
// chiku_cd-area_cd（数字-数字, 例 1-29）/ unknown-...
const LEGACY_AREA_RE = /^(\d+-\d+|unknown(-|$))/i;

/** plot_number（区画番号・セクション）がレガシー内部値か */
export function isLegacyPlotNumber(value?: string | null): boolean {
  if (!value) return false;
  return LEGACY_NUMBER_RE.test(value.trim());
}

/** area_name（エリア・期）がレガシー内部コードか */
export function isLegacyAreaName(value?: string | null): boolean {
  if (!value) return false;
  return LEGACY_AREA_RE.test(value.trim());
}
