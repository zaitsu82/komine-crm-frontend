/**
 * 一括登録・一括編集用のExcelテンプレート生成
 *
 * - メインシート（区画情報）: 単数エンティティ（PhysicalPlot, Customer等）を1行に
 * - 家族連絡先/埋葬者/工事情報シート: 複数行をplotNumberで紐付け
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FieldDef, SHEETS, SHEET_NAMES } from './plotFields';

export type TemplateMode = 'create' | 'update';

/**
 * 単一シートに列ヘッダーとサンプル行を追加
 */
function buildSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  fields: FieldDef[],
  includeExample: boolean
) {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = fields.map((f) => ({
    header: f.required ? `${f.label}*` : f.label,
    key: f.path,
    width: f.columnWidth ?? 15,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  headerRow.alignment = { vertical: 'middle', wrapText: true };
  headerRow.height = 22;

  if (includeExample) {
    const exampleRow = fields.map((f) => f.example ?? '');
    sheet.addRow(exampleRow);

    const row2 = sheet.getRow(2);
    row2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF9C4' },
    };
    row2.font = { color: { argb: 'FF999999' } };
  }
}

/**
 * 区画情報テンプレート（複数シート構成）をダウンロード
 */
export async function downloadPlotTemplate(mode: TemplateMode) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Komine Cemetery CRM';
  workbook.created = new Date();

  for (const sheet of SHEETS) {
    buildSheet(workbook, sheet.name, [...sheet.fields], mode === 'create');
  }

  // 使い方シートを先頭に追加
  const readmeSheet = workbook.addWorksheet('使い方');
  readmeSheet.columns = [{ header: '項目', key: 'key', width: 20 }, { header: '説明', key: 'val', width: 80 }];
  const readmeHeader = readmeSheet.getRow(1);
  readmeHeader.font = { bold: true };
  readmeHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  const readmeRows: Array<[string, string]> =
    mode === 'create'
      ? [
          ['モード', '一括登録（新規区画作成）'],
          ['必須項目', '列ヘッダーに * が付いている項目は必須です'],
          ['シート構成', `${SHEET_NAMES.MAIN} / ${SHEET_NAMES.FAMILY_CONTACTS} / ${SHEET_NAMES.BURIED_PERSONS} / ${SHEET_NAMES.CONSTRUCTION_INFOS}`],
          ['紐付けキー', '複数行シート（家族連絡先・埋葬者・工事情報）は「区画番号」でメインシートと紐付けます'],
          ['日付形式', 'YYYY-MM-DD（例: 2026-04-01）'],
          ['年月形式', 'YYYY-MM（例: 2026-04）'],
          ['真偽値', 'true / false（緊急連絡先等）'],
          ['サンプル行', '黄色背景の行はサンプルです。実データ登録前に削除してください'],
          ['最大件数', '1回の登録で最大500件まで'],
          ['重複チェック', '区画番号はバッチ内・既存データと重複不可'],
          ['ロールバック', '1件でもエラーがあると全件登録されません'],
        ]
      : [
          ['モード', '一括編集（既存区画更新）'],
          ['紐付けキー', '「区画番号」で既存データを特定します。区画番号は必須項目です'],
          ['空欄の扱い', '空欄セルは「変更しない」として扱われます（既存値が維持されます）'],
          ['シート構成', `${SHEET_NAMES.MAIN} / ${SHEET_NAMES.FAMILY_CONTACTS} / ${SHEET_NAMES.BURIED_PERSONS} / ${SHEET_NAMES.CONSTRUCTION_INFOS}`],
          ['日付形式', 'YYYY-MM-DD（例: 2026-04-01）'],
          ['年月形式', 'YYYY-MM（例: 2026-04）'],
          ['真偽値', 'true / false'],
          ['最大件数', '1回の更新で最大500件まで'],
          ['ロールバック', '1件でもエラーがあると全件更新されません'],
          ['推奨フロー', '区画一覧でエクスポート → 編集 → ここからアップロード'],
        ];

  readmeRows.forEach((r) => readmeSheet.addRow({ key: r[0], val: r[1] }));

  // 使い方シートを先頭に持っていく（ExcelJSは追加順なので並べ替え）
  workbook.worksheets.unshift(workbook.worksheets.pop()!);

  const buffer = await workbook.xlsx.writeBuffer();
  const filename =
    mode === 'create'
      ? '区画情報_一括登録テンプレート.xlsx'
      : '区画情報_一括編集テンプレート.xlsx';
  saveAs(new Blob([buffer]), filename);
}
