/**
 * 一括登録/編集ファイルのパーサー
 *
 * xlsx（複数シート）および csv（メインシートのみ）に対応。
 * データ駆動（FieldDef）で各セルを型変換する。
 */

import ExcelJS from 'exceljs';
import {
  FieldDef,
  SHEETS,
  SHEET_NAMES,
  MAIN_SHEET_FIELDS,
} from './plotFields';

export type RawValue = string | number | boolean | null | undefined;

/**
 * パース後の1行（各フィールドのpath -> 値）
 */
export type ParsedRow = Record<string, RawValue>;

/**
 * メインシート1行 + 紐付く子エンティティ
 */
export interface ParsedPlot {
  /** 1-indexed excel行番号（ヘッダー=1） */
  rowNumber: number;
  /** メインシートのフィールド値（path→value） */
  main: ParsedRow;
  /** 紐付く家族連絡先 */
  familyContacts: ParsedRow[];
  /** 紐付く埋葬者 */
  buriedPersons: ParsedRow[];
  /** 紐付く工事情報 */
  constructionInfos: ParsedRow[];
}

/**
 * CSVテキストを行列の2次元配列にパース
 * 最低限の実装: ダブルクォート対応あり、改行含みセル未対応
 */
function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (line.trim() === '') continue;

    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === ',') {
          cells.push(current.trim());
          current = '';
        } else if (ch === '"') {
          inQuotes = true;
        } else {
          current += ch;
        }
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

/**
 * セル値を型変換
 * Excelセルは文字列・数値・日付・真偽値など様々
 */
function convertCell(raw: unknown, field: FieldDef): RawValue {
  if (raw === null || raw === undefined) return undefined;

  // ExcelJSの日付は Date オブジェクトになる
  if (raw instanceof Date) {
    if (field.type === 'date') {
      return raw.toISOString().split('T')[0]!;
    }
    if (field.type === 'yearMonth') {
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
    return raw.toISOString();
  }

  // ExcelJSの数式セル等: { result, formula }
  if (typeof raw === 'object' && raw !== null && 'result' in raw) {
    return convertCell((raw as { result: unknown }).result, field);
  }

  // 数値
  if (typeof raw === 'number') {
    if (field.type === 'number' || field.type === 'integer') {
      return raw;
    }
    // 数値として来たが文字列フィールドの場合（例: 区画番号）
    return String(raw);
  }

  // 真偽値
  if (typeof raw === 'boolean') {
    if (field.type === 'boolean') return raw;
    return String(raw);
  }

  // 文字列
  const str = String(raw).trim();
  if (str === '') return undefined;

  if (field.type === 'number') {
    const n = Number(str);
    return isNaN(n) ? str : n;
  }
  if (field.type === 'integer') {
    const n = Number(str);
    return isNaN(n) ? str : Math.trunc(n);
  }
  if (field.type === 'boolean') {
    if (str.toLowerCase() === 'true') return true;
    if (str.toLowerCase() === 'false') return false;
    return str;
  }
  if (field.type === 'date') {
    // YYYY-MM-DD / YYYY/MM/DD 対応
    return str.replace(/\//g, '-');
  }
  if (field.type === 'yearMonth') {
    return str.replace(/\//g, '-');
  }
  if (field.type === 'enum') {
    return str.toLowerCase();
  }
  return str;
}

/**
 * 1行分のセルをパース
 */
function parseRow(row: ExcelJS.Row, fields: FieldDef[]): ParsedRow {
  const result: ParsedRow = {};
  fields.forEach((f, i) => {
    const cell = row.getCell(i + 1);
    result[f.path] = convertCell(cell.value, f);
  });
  return result;
}

/**
 * 行が完全に空か判定
 */
function isRowEmpty(parsed: ParsedRow): boolean {
  return Object.values(parsed).every(
    (v) => v === undefined || v === null || v === ''
  );
}

/**
 * ExcelJS Workbook をロード（xlsx / csv）
 */
async function loadWorkbook(file: File): Promise<ExcelJS.Workbook> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer);
    const csvRows = parseCsvText(text);
    const sheet = workbook.addWorksheet(SHEET_NAMES.MAIN);
    csvRows.forEach((row) => {
      sheet.addRow(row);
    });
  } else {
    await workbook.xlsx.load(buffer);
  }

  return workbook;
}

/**
 * シート名からワークシートを取得（大文字小文字/前後空白無視）
 * 使い方シートなど複数候補がある場合に適切なものを返す
 */
function findSheet(
  workbook: ExcelJS.Workbook,
  targetName: string
): ExcelJS.Worksheet | undefined {
  return workbook.worksheets.find(
    (s) => s.name.trim() === targetName.trim()
  );
}

/**
 * ファイルをパースして構造化データを返す
 */
export async function parsePlotFile(file: File): Promise<ParsedPlot[]> {
  const workbook = await loadWorkbook(file);

  // メインシート：「区画情報」があればそれを、無ければ先頭の非「使い方」シート
  let mainSheet = findSheet(workbook, SHEET_NAMES.MAIN);
  if (!mainSheet) {
    mainSheet = workbook.worksheets.find((s) => s.name !== '使い方');
  }
  if (!mainSheet) return [];

  // メイン行をパース
  const plots: ParsedPlot[] = [];
  mainSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const parsed = parseRow(row, MAIN_SHEET_FIELDS);
    if (isRowEmpty(parsed)) return;
    plots.push({
      rowNumber,
      main: parsed,
      familyContacts: [],
      buriedPersons: [],
      constructionInfos: [],
    });
  });

  // 子エンティティシートをパース
  const childSheets = [
    {
      sheetName: SHEET_NAMES.FAMILY_CONTACTS,
      fields: SHEETS.find((s) => s.name === SHEET_NAMES.FAMILY_CONTACTS)!.fields,
      target: 'familyContacts' as const,
    },
    {
      sheetName: SHEET_NAMES.BURIED_PERSONS,
      fields: SHEETS.find((s) => s.name === SHEET_NAMES.BURIED_PERSONS)!.fields,
      target: 'buriedPersons' as const,
    },
    {
      sheetName: SHEET_NAMES.CONSTRUCTION_INFOS,
      fields: SHEETS.find((s) => s.name === SHEET_NAMES.CONSTRUCTION_INFOS)!.fields,
      target: 'constructionInfos' as const,
    },
  ];

  // plotNumber → index のマップ
  const plotIndex = new Map<string, number>();
  plots.forEach((p, i) => {
    const num = p.main['physicalPlot.plotNumber'];
    if (typeof num === 'string' && num) plotIndex.set(num, i);
  });

  for (const { sheetName, fields, target } of childSheets) {
    const sheet = findSheet(workbook, sheetName);
    if (!sheet) continue;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const parsed = parseRow(row, [...fields]);
      if (isRowEmpty(parsed)) return;

      const num = parsed['plotNumber'];
      if (typeof num === 'string' && num) {
        const idx = plotIndex.get(num);
        if (idx !== undefined) {
          plots[idx]![target].push(parsed);
        } else {
          // 対応する区画が見つからない子行：仮想区画として扱う
          // エラーはバリデーション段階で検出
          plots.push({
            rowNumber: -1,
            main: { 'physicalPlot.plotNumber': num, __orphan: true },
            familyContacts: target === 'familyContacts' ? [parsed] : [],
            buriedPersons: target === 'buriedPersons' ? [parsed] : [],
            constructionInfos: target === 'constructionInfos' ? [parsed] : [],
          });
        }
      }
    });
  }

  return plots.filter((p) => !p.main.__orphan);
}
