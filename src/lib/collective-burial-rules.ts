/**
 * 合祀の業務ルール計算
 *
 * 旧 Excel 帳票 (`komine-docs/参考画面キャプチャ/09_合祀管理エクセル.JPG`) のヘッダー記載:
 *   「〜7期樹林墓部について13年(15年)経過後の合祀(2023年4月以降適用) 〜時33年経過」
 *
 * 注意: CollectiveBurial レコードは `validityPeriodYears` を持っているため、
 *       UI 上は基本的にそれを優先する。本モジュールは
 *       - 未設定時のフォールバック推定
 *       - 業務ルールの根拠表示
 *       - 経過年数表示
 *       のために使う。
 *       推定値と異なる手動指定（例外指定）は正当な運用として許容する（#259, Q17）。
 *
 * ## タイプ×年数の対応表（#259）
 *
 * 業務確認（2026-06-07）で「24年も有る」「樹木葬や納骨堂など種類により年数違う」との
 * 指摘を受け、判定を `VALIDITY_RULE_TABLE`（タイプ×年数の対応表）ベースに再構築した。
 * 確定対応表は業務確認シート第3版 Q34 で回収中のため、現時点のエントリは
 * 旧帳票から判明している 樹林墓部 13/15・通常 33 のみ（fallback）。
 *
 * ### Q34 回答後の反映手順（データ更新のみで済む想定）
 * 1. `GraveType` にタイプを追加（例: 'nokotsudo'）
 * 2. `VALIDITY_RULE_TABLE` に行を追加（例: { label: '納骨堂', years: 24, yearsBeforeTransition: 24 }）
 *    - 2023年4月切替が無いタイプは years と yearsBeforeTransition を同値にする
 * 3. `classifyGraveType` の判定を拡張（区域名→タイプの対応は Q33 回答で確定）
 */

/** 業務ルール変更日（樹林墓部 15→13年。他タイプへの適用有無は Q34 で確認中） */
export const JURIN_RULE_TRANSITION_DATE = new Date(2023, 3, 1); // 2023-04-01

/**
 * お墓のタイプ（合祀年数の判定単位）。
 * Q33/Q34 回答後に 樹木葬/バラ咲く樹木葬/納骨堂/花鳥風月 等を追加予定（#259）。
 */
export type GraveType = 'jurin' | 'general';

/** タイプごとの合祀年数ルール */
export interface ValidityRule {
  /** 画面表示用のタイプ名 */
  label: string;
  /** 2023-04-01 以降の契約に適用する年数 */
  years: number;
  /** 2023-04-01 より前の契約に適用する年数（切替が無いタイプは years と同値） */
  yearsBeforeTransition: number;
}

/**
 * タイプ×年数の対応表（#259）。
 * Q34 回答が確定したらここへ行を追加する（上記モジュールコメントの反映手順を参照）。
 */
export const VALIDITY_RULE_TABLE: Record<GraveType, ValidityRule> = {
  jurin: { label: '樹林墓部', years: 13, yearsBeforeTransition: 15 },
  general: { label: '通常区画', years: 33, yearsBeforeTransition: 33 },
};

/** 樹林墓部かどうかを区域名から判定 */
export function isJurinArea(areaName: string | null | undefined): boolean {
  if (!areaName) return false;
  return areaName.includes('樹林');
}

/**
 * 区域名からお墓のタイプを判定する。
 * 現状は区域名に「樹林」を含むか否かの2値のみ。
 * 区域名→タイプの確定対応（タイプごとの所在期）は Q33 回答後に拡張する（#259）。
 */
export function classifyGraveType(areaName: string | null | undefined): GraveType {
  return isJurinArea(areaName) ? 'jurin' : 'general';
}

/**
 * 区域名と契約日から、業務ルール上の有効年数を対応表で推定する。
 *
 * @param areaName 区域名 (例: "第3期樹林部", "第1期A")
 * @param contractDate 契約日 (省略時は 2023-04-01 以降扱い = 新ルール適用)
 * @returns 対応表の年数（現状 13 | 15 | 33）
 */
export function inferValidityPeriodYears(
  areaName: string | null | undefined,
  contractDate?: Date | string | null,
): number {
  const rule = VALIDITY_RULE_TABLE[classifyGraveType(areaName)];
  // 契約日が業務ルール変更日 (2023-04-01) 以降か
  const refDate = contractDate ? toDate(contractDate) : JURIN_RULE_TRANSITION_DATE;
  if (!refDate || refDate >= JURIN_RULE_TRANSITION_DATE) {
    return rule.years;
  }
  return rule.yearsBeforeTransition;
}

/**
 * 自動判定の根拠を短文で返す（フォーム・詳細画面の hint 表示用）。
 *
 * @param areaName 区域名
 * @param contractDate 契約日
 * @returns 例: "樹林墓部・契約日 2023-04-01 以降 → 13年" / "通常区画 → 33年"
 */
export function summarizeValidityRule(
  areaName: string | null | undefined,
  contractDate?: Date | string | null,
): string {
  const rule = VALIDITY_RULE_TABLE[classifyGraveType(areaName)];
  const years = inferValidityPeriodYears(areaName, contractDate);
  // 切替の無いタイプは日付条件を出さない
  if (rule.years === rule.yearsBeforeTransition) {
    return `${rule.label} → ${years}年`;
  }
  return years === rule.years
    ? `${rule.label}・契約日 2023-04-01 以降 → ${years}年`
    : `${rule.label}・契約日 2023-04-01 より前 → ${years}年`;
}

/**
 * 基準日から今日までの経過年数を整数で返す。
 * 「今日が誕生日 (相当日) を過ぎているか」で 1 年単位を切り下げる。
 *
 * @param fromDate 基準日 (命日 / 埋葬日 等)
 * @param refDate  比較対象日 (省略時は new Date())
 * @returns 経過年数 (基準日が未来 or null の場合は null)
 */
export function calculateElapsedYears(
  fromDate: Date | string | null | undefined,
  refDate?: Date,
): number | null {
  const from = toDate(fromDate);
  if (!from) return null;
  const ref = refDate ?? new Date();
  if (from > ref) return null;

  let years = ref.getFullYear() - from.getFullYear();
  // まだ「相当日」を迎えていなければ 1 年引く
  const monthDiff = ref.getMonth() - from.getMonth();
  const dayDiff = ref.getDate() - from.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }
  return Math.max(0, years);
}

/**
 * 基準日 + N 年 で合祀予定日を計算する。
 *
 * @param baseDate 基準日 (上限到達日 or 最新埋葬日)
 * @param validityPeriodYears 有効年数 (通常 13 / 15 / 33)
 * @returns 合祀予定日 (基準日が無ければ null)
 */
export function calculateScheduledCollectiveBurialDate(
  baseDate: Date | string | null | undefined,
  validityPeriodYears: number,
): Date | null {
  const base = toDate(baseDate);
  if (!base) return null;
  const result = new Date(base);
  result.setFullYear(result.getFullYear() + validityPeriodYears);
  return result;
}

/** 内部用: Date | string | null → Date | null 変換 */
function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
