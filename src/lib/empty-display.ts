/**
 * 空値表示の統一ルール（#181）
 *
 * 台帳詳細では「-」表示が多く、未登録・対象外・取得失敗の区別がつかなかった。
 * 表示上の空値を一意のラベルに正規化し、意味を利用者に伝える。
 *
 * - 未登録 (unregistered): 項目は該当するが値が未入力
 * - 対象外 (na): この区画では該当しない項目
 * - 取得失敗: ページ単位のエラー画面で表示（フィールド単位の空値ではない）
 */

export type EmptyKind = 'unregistered' | 'na';

export const EMPTY_LABELS: Record<EmptyKind, string> = {
  unregistered: '未登録',
  na: '対象外',
};

/**
 * 「空」を意味する表示値。フォーマッタ（formatDate/formatCurrency 等）の
 * フォールバック値や各種ダッシュ・「未設定」を空として扱い、表記を統一する。
 */
const EMPTY_SENTINELS = new Set(['', '-', '—', '―', '未設定']);

/**
 * 表示値が「空（未入力）」を意味するか判定する。
 * null / undefined / 空文字 / 各種ダッシュ / 「未設定」 を空とみなす。
 */
export function isEmptyDisplayValue(value: string | null | undefined): boolean {
  if (value == null) return true;
  return EMPTY_SENTINELS.has(value.trim());
}
