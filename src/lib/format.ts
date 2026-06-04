/**
 * 表示用フォーマットユーティリティ
 *
 * 保存値（ハイフンなし電話番号・カンマなし金額など）と表示形式を分離する。
 * 一覧・詳細・書類で共通利用し、画面ごとの表記揺れ（#168 / #169 / #179）を解消する。
 */

const DASH = '-';

/**
 * 金額を「270,000円」形式に統一する。
 * - null / undefined / 空文字 → fallback（既定 "-"）
 * - 数値 0 → "0円"（無料を意味する有効値として表示）
 * - カンマ・通貨記号・"円"・空白を含む文字列も数値として解釈する
 * - 数値化できない文字列はトリムした元の値を返す（レガシーデータの欠落防止）
 */
export function formatCurrency(
  value: number | string | null | undefined,
  fallback: string = DASH,
): string {
  if (value === null || value === undefined) return fallback;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return fallback;
    const num = Number(trimmed.replace(/[,¥￥円\s]/g, ''));
    if (!Number.isFinite(num)) return trimmed;
    return `${num.toLocaleString('ja-JP')}円`;
  }

  if (!Number.isFinite(value)) return fallback;
  return `${value.toLocaleString('ja-JP')}円`;
}

/**
 * 数値をカンマ区切り文字列にする（単位は呼び出し側で付与）。
 * 未収金サマリーのように "円" を別要素で装飾する箇所向け。
 */
export function formatNumber(value: number | null | undefined, fallback: string = '0'): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  return value.toLocaleString('ja-JP');
}

/**
 * 電話番号を表示用にハイフン区切りする。保存値はハイフンなしの数字を想定。
 * 区切り位置は代表的なパターンのヒューリスティック。判定できない桁数はそのまま返す。
 */
export function formatPhoneNumber(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length === 0) return value;

  // 携帯・IP電話（070/080/090/050）11桁: 3-4-4
  if (digits.length === 11 && /^(070|080|090|050)/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  // フリーダイヤル 0120（10桁）: 4-3-3
  if (digits.length === 10 && digits.startsWith('0120')) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // 固定電話 10桁
  if (digits.length === 10) {
    // 東京03 / 大阪06 は市外局番2桁: 2-4-4
    if (/^0[36]/.test(digits)) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    // その他は市外局番3桁とみなす近似: 3-3-4
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // 想定外の桁数はそのまま返す
  return value;
}

/**
 * 郵便番号を「807-0842」形式にする。7桁数字を想定。判定できなければそのまま返す。
 */
export function formatPostalCode(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length === 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return value;
}

/**
 * 終納請求年月などの年月文字列を「YYYY年M月」に正規化する。
 * - null / undefined / 空 / "0" / 全ゼロ → fallback（既定 "未設定"）
 * - "YYYY年M月" / "YYYY年MM月" → 前ゼロを除いて返す
 * - "YYYYMM"（6桁）/ "YYYY/MM" / "YYYY-MM" → "YYYY年M月"
 * - 上記に当てはまらなければトリムした元の値を返す
 */
export function formatBillingMonth(
  value: string | null | undefined,
  fallback: string = '未設定',
): string {
  if (value === null || value === undefined) return fallback;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '0') return fallback;

  // "YYYY年M月" 形式
  const jp = trimmed.match(/^(\d{4})年(\d{1,2})月$/);
  if (jp) {
    const y = Number(jp[1]);
    const m = Number(jp[2]);
    if (y === 0 || m === 0 || m > 12) return fallback;
    return `${y}年${m}月`;
  }

  // 区切り文字を除いた連続数字（YYYYMM）
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length === 6) {
    const y = Number(digits.slice(0, 4));
    const m = Number(digits.slice(4));
    if (y === 0 || m === 0 || m > 12) return fallback;
    return `${y}年${m}月`;
  }

  return trimmed;
}

/** date-only 文字列（YYYY-MM-DD）の形式判定 */
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * date-only 文字列（YYYY-MM-DD）から年月日を TZ 非依存で抽出する。
 * `new Date('YYYY-MM-DD')` は UTC 00:00 としてパースされるため、
 * ローカル getter で組み立てると負オフセット TZ では前日になる（#218）。
 * 実在しない日付（2024-02-31 等）は null。
 */
function parseDateOnly(value: string): { y: number; m: number; d: number } | null {
  const match = value.match(DATE_ONLY_RE);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  // UTC で往復させて実在日付か検証（TZ の影響を受けない）
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/**
 * 日付を「YYYY/MM/DD」（西暦4桁・ゼロ埋め）に統一する。
 * 2桁年や非ゼロ埋めの表記揺れ（#167）を解消する共通フォーマッタ。
 * date-only 文字列は Date を経由せず整形し、TZ による前日ズレを防ぐ（#218）。
 * null / 空 / 不正日付は fallback（既定 "-"）。
 */
export function formatDate(value: string | Date | null | undefined, fallback: string = DASH): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' && DATE_ONLY_RE.test(value)) {
    const dateOnly = parseDateOnly(value);
    // date-only 形式で実在しない日付（2024-02-31 等）は legacy パーサの
    // 繰り上がり（→ 2024/03/02）に流さず fallback
    if (dateOnly === null) return fallback;
    return `${dateOnly.y}/${String(dateOnly.m).padStart(2, '0')}/${String(dateOnly.d).padStart(2, '0')}`;
  }
  // datetime 文字列・Date インスタンスは時刻成分が意味を持つため従来どおりローカルTZで整形
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

/**
 * 年月を「YYYY/MM」（西暦4桁・ゼロ埋め）に統一する。
 * 一覧の契約日など、日を省きたい狭い列向け（2桁年 "06/2" を廃止）。
 * date-only 文字列は Date を経由せず整形し、TZ による前日ズレを防ぐ（#218）。
 */
export function formatYearMonth(value: string | Date | null | undefined, fallback: string = DASH): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' && DATE_ONLY_RE.test(value)) {
    const dateOnly = parseDateOnly(value);
    if (dateOnly === null) return fallback;
    return `${dateOnly.y}/${String(dateOnly.m).padStart(2, '0')}`;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}/${m}`;
}
