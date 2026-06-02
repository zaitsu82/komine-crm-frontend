import type { MasterItem, TaxTypeMasterItem } from '@/lib/api/masters';

/**
 * 旧システムの int コード → 新マスタ code への対応表（#177）。
 *
 * バックエンドの移行スクリプト `scripts/legacy-migration/steps/05-contract-plot.ts`
 * の CALC_TYPE_MAP / TAX_TYPE_MAP / BILLING_TYPE_MAP と同一定義。
 * 料金フィールド（計算タイプ・税区分・請求タイプ）は新規入力では master code
 * （"AREA" 等）を保存する（plot-form/FeeInfoTab）。したがって数値文字列が残るのは
 * 未 remap の旧データのみなので、ここで正規化しても新規データを壊さない。
 *
 * 送付方法（旧 shiharai）は旧コードの意味が不明なため remap 対象外（マップ無し）。
 */
export const LEGACY_FEE_CODE_MAP: {
  calc: Record<string, string>;
  tax: Record<string, string>;
  billing: Record<string, string>;
} = {
  calc: { '0': 'AREA', '1': 'FIXED' },
  tax: { '0': 'INCLUSIVE', '1': 'EXCLUSIVE' },
  billing: { '0': 'NONE', '1': 'PRESENT', '2': 'PERPETUAL' },
};

/**
 * Master 名解決ヘルパー。
 *
 * legacy migration が int 文字列 ("1" "2" 等) を格納している区分系フィールドと、
 * 新規入力で master code ("AREA" 等) や id を格納する場合の両方に対応する。
 *
 * 解決順:
 *  1. legacyMap が与えられていれば旧int値を master code に正規化（id 一致による誤マッチを回避）
 *  2. id 一致 → code 一致 でマスタ名を返す
 *  3. 解決できなければ素の数値表示を残さず「旧コード: X」と明示する（#177）
 */
export function resolveMasterName(
  masters: ReadonlyArray<MasterItem | TaxTypeMasterItem>,
  value: string | null | undefined,
  legacyMap?: Record<string, string>,
): string | null {
  if (value == null || value === '') return null;

  // 旧int値はマスタ code へ正規化してから解決する。
  const normalized = legacyMap?.[value] ?? value;

  const byId = masters.find((m) => m.id.toString() === normalized);
  if (byId) return byId.name;
  const byCode = masters.find((m) => m.code === normalized);
  if (byCode) return byCode.name;

  // 解決不能（マスタ未登録 / 意味不明な旧コード）。
  // 数値の素表示を残さず、元の保存値を「旧コード」として明示する。
  // 移行時の "legacy-{prefix}-{value}" センチネルは末尾の元値のみ表示する。
  const sentinel = value.match(/^legacy-[^-]+-(.+)$/);
  return `旧コード: ${sentinel ? sentinel[1] : value}`;
}
