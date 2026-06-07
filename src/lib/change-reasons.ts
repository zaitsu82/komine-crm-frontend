/**
 * 変更理由プリセット（#261、業務確認シート回答 2026-06-07 Q16）
 *
 * 区画情報の更新時に選択できる定型の変更理由。datalist で提示し、
 * 自由入力（その他の理由）も許容する。値はそのまま History.change_reason
 * （VarChar(200)）に記録されるフリーテキスト互換。
 *
 * 将来マスタ化（backend #46 系）する場合は、この配列を masters API からの
 * 取得に置き換えるだけで済む構成にしておく。
 */
export const CHANGE_REASON_PRESETS: readonly string[] = [
  '名義変更',
  '住所変更',
  '電話番号変更',
  '解約',
  '合祀',
  '修理',
  '字彫',
  '備品購入',
];

/** History.change_reason の DB 上限（VarChar(200)） */
export const CHANGE_REASON_MAX_LENGTH = 200;
