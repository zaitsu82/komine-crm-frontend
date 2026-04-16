/**
 * 一括登録/編集のクライアントサイドバリデーション
 *
 * FieldDef に基づく型・長さ・必須チェック。
 * 重複チェックやDB存在チェックはサーバー側で実施。
 */

import {
  FieldDef,
  MAIN_SHEET_FIELDS,
  FAMILY_CONTACT_FIELDS,
  BURIED_PERSON_FIELDS,
  CONSTRUCTION_INFO_FIELDS,
  SHEET_NAMES,
  MAX_PLOTS_PER_BATCH,
} from './plotFields';
import { ParsedPlot, ParsedRow, RawValue } from './plotParser';

export interface ValidationError {
  sheet: string;
  row: number;
  field: string;
  message: string;
}

export type ValidationMode = 'create' | 'update';

/**
 * 単一値のバリデーション（型・長さ・列挙）
 */
function validateValue(
  value: RawValue,
  field: FieldDef,
  required: boolean
): string | null {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

  if (isEmpty) {
    return required ? `${field.label}は必須です` : null;
  }

  if (field.type === 'number' || field.type === 'integer') {
    if (typeof value !== 'number' || isNaN(value)) {
      return `${field.label}は数値を入力してください`;
    }
    if (field.positive && value <= 0) {
      return `${field.label}は正の数値を入力してください`;
    }
    if (field.min !== undefined && value < field.min) {
      return `${field.label}は${field.min}以上の値を入力してください`;
    }
    if (field.type === 'integer' && !Number.isInteger(value)) {
      return `${field.label}は整数を入力してください`;
    }
    return null;
  }

  if (field.type === 'boolean') {
    if (typeof value !== 'boolean') {
      return `${field.label}は true / false を入力してください`;
    }
    return null;
  }

  if (field.type === 'date') {
    const s = String(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return `${field.label}は YYYY-MM-DD 形式で入力してください`;
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) {
      return `${field.label}は有効な日付を入力してください`;
    }
    return null;
  }

  if (field.type === 'yearMonth') {
    const s = String(value);
    if (!/^\d{4}-\d{2}$/.test(s)) {
      return `${field.label}は YYYY-MM 形式で入力してください`;
    }
    return null;
  }

  if (field.type === 'enum') {
    if (!field.enumValues?.includes(String(value))) {
      return `${field.label}は ${field.enumValues?.join(' / ')} のいずれかを指定してください`;
    }
    return null;
  }

  // string
  const s = String(value);
  if (field.maxLength && s.length > field.maxLength) {
    return `${field.label}は${field.maxLength}文字以内で入力してください`;
  }
  return null;
}

/**
 * 1行のパース済みデータをバリデーション
 */
function validateRow(
  row: ParsedRow,
  fields: FieldDef[],
  sheet: string,
  rowNumber: number,
  mode: ValidationMode
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    // 一括編集モードでは plotNumber 以外は全て任意（空欄=変更しない）
    const required =
      mode === 'create'
        ? field.required === true
        : field.path === 'physicalPlot.plotNumber' || field.path === 'plotNumber';

    const message = validateValue(row[field.path], field, required);
    if (message) {
      errors.push({ sheet, row: rowNumber, field: field.label, message });
    }
  }

  return errors;
}

/**
 * 全体のバリデーション
 */
export function validatePlots(
  plots: ParsedPlot[],
  mode: ValidationMode
): ValidationError[] {
  const errors: ValidationError[] = [];

  // 件数上限
  if (plots.length > MAX_PLOTS_PER_BATCH) {
    errors.push({
      sheet: SHEET_NAMES.MAIN,
      row: 0,
      field: '件数',
      message: `1回の処理は最大${MAX_PLOTS_PER_BATCH}件までです（現在${plots.length}件）`,
    });
  }

  // メインシートのバッチ内重複（plotNumber）
  const plotNumberCount = new Map<string, number[]>();
  plots.forEach((p) => {
    const num = p.main['physicalPlot.plotNumber'];
    if (typeof num === 'string' && num) {
      if (!plotNumberCount.has(num)) plotNumberCount.set(num, []);
      plotNumberCount.get(num)!.push(p.rowNumber);
    }
  });
  for (const [num, rows] of plotNumberCount.entries()) {
    if (rows.length > 1) {
      errors.push({
        sheet: SHEET_NAMES.MAIN,
        row: rows[1]!,
        field: '区画番号',
        message: `区画番号「${num}」がバッチ内で重複しています（行 ${rows.join(', ')}）`,
      });
    }
  }

  // 各行のバリデーション
  plots.forEach((plot) => {
    // メインシート
    errors.push(
      ...validateRow(plot.main, MAIN_SHEET_FIELDS, SHEET_NAMES.MAIN, plot.rowNumber, mode)
    );

    // 家族連絡先（複数行）
    plot.familyContacts.forEach((fc, idx) => {
      errors.push(
        ...validateRow(
          fc,
          FAMILY_CONTACT_FIELDS,
          SHEET_NAMES.FAMILY_CONTACTS,
          idx + 2,
          mode === 'update' ? 'update' : 'create'
        )
      );
    });

    // 埋葬者（複数行）
    plot.buriedPersons.forEach((bp, idx) => {
      errors.push(
        ...validateRow(
          bp,
          BURIED_PERSON_FIELDS,
          SHEET_NAMES.BURIED_PERSONS,
          idx + 2,
          mode === 'update' ? 'update' : 'create'
        )
      );
    });

    // 工事情報（複数行）
    plot.constructionInfos.forEach((ci, idx) => {
      errors.push(
        ...validateRow(
          ci,
          CONSTRUCTION_INFO_FIELDS,
          SHEET_NAMES.CONSTRUCTION_INFOS,
          idx + 2,
          mode === 'update' ? 'update' : 'create'
        )
      );
    });
  });

  return errors;
}
