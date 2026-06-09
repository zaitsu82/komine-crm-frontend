/**
 * レガシー移行で付与されたセンチネル値の表示変換（#334）
 *
 * 旧システムからの移行時、意味の確定していないコードを `legacy-*` 形式の
 * センチネル値で保存している。UI にそのまま出すと利用者に意味不明な文字列が
 * 見えるため、業務確認で意味が確定したものをここで表示用ラベルへ変換する。
 */

/**
 * 入金の料金種別センチネル → 表示ラベル。
 * 業務確認（2026-06-09）で確定:
 *   legacy-fee-20230001 = 使用料 / legacy-fee-20230002 = 管理料
 * （請求側 billing_type 20280001=使用料 / 20280002=管理料 と同系列）
 */
const LEGACY_FEE_TYPE_LABELS: Record<string, string> = {
  'legacy-fee-20230001': '使用料',
  'legacy-fee-20230002': '管理料',
};

/**
 * 入金の料金種別を表示用ラベルへ変換する。
 * legacy センチネルは日本語ラベルへ、未設定は '-'、それ以外（手入力値等）は素通し。
 */
export function formatFeeType(feeType: string | null | undefined): string {
  if (!feeType) return '-';
  return LEGACY_FEE_TYPE_LABELS[feeType] ?? feeType;
}

/**
 * 工事業者「未設定」を表すレガシーセンチネル（ContractorMaster の code）。
 * 移行スクリプトが業者ID未設定の工事記録に `legacy-gyousha-0` を付与し、
 * マスタ名が「業者ID:0」になってしまっている。これは実在の業者ではないため
 * UI では「未登録」扱い（値なし）として表示する。
 */
export const UNSET_CONTRACTOR_CODE = 'legacy-gyousha-0';

/** 工事業者コードが「未設定」センチネルかどうか。 */
export function isUnsetContractor(code: string | null | undefined): boolean {
  return code === UNSET_CONTRACTOR_CODE;
}
