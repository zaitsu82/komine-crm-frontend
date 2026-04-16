/**
 * パース済みデータをAPIペイロードに変換
 *
 * - create: CreatePlotRequest 形式の配列
 * - update: plotNumber + 部分更新フィールドの配列
 */

import { ParsedPlot, ParsedRow, RawValue } from './plotParser';

type PayloadObject = Record<string, unknown>;

/**
 * ドット区切りpathで値をセット
 * 'customer.name' → { customer: { name: value } }
 * 空文字・undefined は無視
 */
function setByPath(
  target: PayloadObject,
  path: string,
  value: RawValue,
  skipEmpty: boolean
) {
  if (skipEmpty && (value === undefined || value === null || value === '')) {
    return;
  }

  const parts = path.split('.');
  let obj = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]!;
    if (!(k in obj) || typeof obj[k] !== 'object' || obj[k] === null) {
      obj[k] = {};
    }
    obj = obj[k] as PayloadObject;
  }
  obj[parts[parts.length - 1]!] = value;
}

/**
 * メインシート1行をネスト化されたオブジェクトに変換
 */
function mainToPayload(row: ParsedRow, skipEmpty: boolean): PayloadObject {
  const result: PayloadObject = {};
  for (const [path, value] of Object.entries(row)) {
    if (path === '__orphan') continue;
    setByPath(result, path, value, skipEmpty);
  }
  return result;
}

/**
 * 子エンティティ1行をフラットなオブジェクトに変換（ドットなしのpath）
 */
function childToPayload(row: ParsedRow, skipEmpty: boolean): PayloadObject {
  const result: PayloadObject = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'plotNumber') continue; // 外部キーは含めない
    if (skipEmpty && (value === undefined || value === null || value === '')) continue;
    result[key] = value;
  }
  return result;
}

/**
 * 一括登録用ペイロード生成
 * 空文字・undefined は省略（必須項目は事前にバリデーション済み前提）
 */
export type BulkCreateItem = Record<string, unknown>;

export function buildBulkCreatePayload(plots: ParsedPlot[]): BulkCreateItem[] {
  return plots.map((plot) => {
    const base = mainToPayload(plot.main, true);
    const fc = plot.familyContacts.map((r) => childToPayload(r, true));
    const bp = plot.buriedPersons.map((r) => childToPayload(r, true));
    const ci = plot.constructionInfos.map((r) => childToPayload(r, true));
    if (fc.length) base.familyContacts = fc;
    if (bp.length) base.buriedPersons = bp;
    if (ci.length) base.constructionInfos = ci;
    return base;
  });
}

/**
 * 一括編集用ペイロード
 * plotNumber をマッチングキーとし、指定されたフィールドのみを更新
 */
export type BulkUpdateItem = { plotNumber: string } & Record<string, unknown>;

export function buildBulkUpdatePayload(plots: ParsedPlot[]): BulkUpdateItem[] {
  return plots.map((plot) => {
    const plotNumber = String(plot.main['physicalPlot.plotNumber'] ?? '');
    const body: BulkUpdateItem = {
      ...mainToPayload(plot.main, true),
      plotNumber,
    };

    const fc = plot.familyContacts.map((r) => childToPayload(r, true));
    const bp = plot.buriedPersons.map((r) => childToPayload(r, true));
    const ci = plot.constructionInfos.map((r) => childToPayload(r, true));

    if (fc.length) body.familyContacts = fc;
    if (bp.length) body.buriedPersons = bp;
    if (ci.length) body.constructionInfos = ci;

    return body;
  });
}
