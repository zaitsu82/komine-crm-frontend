/**
 * 月次報告（区画残数）帳票の Excel 出力。
 *
 * 業務が毎月末に税理士へ提出している Excel シート「N月末区画残数」の配置を再現する
 * （議事録 2026-07-21 §6）。画面表示と同じ API レスポンスから組むので数字はズレない。
 *
 * 出典レイアウト: komine-docs/区画exleファイル/令和8年度6月.xlsx シート「6月末区画残数」
 *
 * 原本の列構成（全24列）を踏襲する。ブロックは4列 + 区切り1列で横に並ぶ。
 *   A:区 B:区画数 C:使用数 D:残数 / E:空 / F〜I 第2期 / J:空 / K〜N 第3期 / …
 */
import type { MonthlyReportBlock, MonthlyReportResponse } from '@/lib/api/plot-inventory';

/** ブロック1つが使う列数（区・区画数・使用数・残数）。 */
const BLOCK_WIDTH = 4;
/** ブロック間の区切り列数。 */
const BLOCK_GAP = 1;
/** 見出し行（第N期）の行番号。原本に合わせる。 */
const BLOCK_TITLE_ROW = 4;
/** 列見出し（区・区画数…）の行番号。 */
const HEADER_ROW = 6;
/** データ開始行。 */
const DATA_START_ROW = 7;

/** 原本の塗り分け。合計行の使用数＝オレンジ、残数＝ブルーグレー。 */
const FILL_USED = 'FFD9B382';
const FILL_REMAINING = 'FF9DB2BF';
const FILL_HEADER = 'FFF2F2F2';

const COLUMN_HEADERS = ['区', '区画数', '使用数', '残数'] as const;

/** ブロック i の左端の列番号（1始まり）。 */
const blockStartColumn = (index: number) => 1 + index * (BLOCK_WIDTH + BLOCK_GAP);

type Worksheet = import('exceljs').Worksheet;
type Borders = Partial<import('exceljs').Borders>;

const THIN_BORDER: Borders = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' },
};

/**
 * 「2026年8月末現在」の表記を作る。
 *
 * 帳票の体裁を保つため月末表記にする。実際の集計時点は別行に明記するので、
 * 月中に出しても取り違えない。
 */
export function formatAsOfLabel(asOfDate: string): string {
  const d = new Date(asOfDate);
  return `${d.getFullYear()}年${d.getMonth() + 1}月末現在`;
}

/** 集計時点の実時刻。月末表記との差を隠さないために併記する。 */
export function formatAsOfExact(asOfDate: string): string {
  const d = new Date(asOfDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 年度表記（2026 → 「2026年度（2026年6月〜2027年5月）」）。 */
export function formatFiscalYear(fiscalYear: number): string {
  return `${fiscalYear}年度（${fiscalYear}年6月〜${fiscalYear + 1}年5月）`;
}

/** 1ブロックを指定の開始行・開始列に書き込む。 */
function writeBlock(
  sheet: Worksheet,
  block: MonthlyReportBlock,
  startRow: number,
  startColumn: number,
  totalRowNumber: number
): void {
  // 見出し（4列を結合）
  const titleCell = sheet.getCell(startRow, startColumn);
  titleCell.value = block.title;
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.font = { bold: true, size: 11 };
  sheet.mergeCells(startRow, startColumn, startRow, startColumn + BLOCK_WIDTH - 1);
  titleCell.border = THIN_BORDER;

  // 列見出し
  COLUMN_HEADERS.forEach((header, i) => {
    const cell = sheet.getCell(startRow + (HEADER_ROW - BLOCK_TITLE_ROW), startColumn + i);
    cell.value = header;
    cell.alignment = { horizontal: 'center' };
    cell.font = { bold: true, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_HEADER } };
    cell.border = THIN_BORDER;
  });

  const dataStart = startRow + (DATA_START_ROW - BLOCK_TITLE_ROW);

  block.rows.forEach((row, i) => {
    const r = dataStart + i;
    const values = [row.label, row.totalCount, row.usedCount, row.remainingCount];
    values.forEach((value, c) => {
      const cell = sheet.getCell(r, startColumn + c);
      cell.value = value;
      cell.alignment = { horizontal: c === 0 ? 'center' : 'right' };
      cell.font = { size: 10 };
      cell.border = THIN_BORDER;
    });
  });

  // 空行にも枠線を引く（原本が固定の枠で印刷されているため）
  for (let r = dataStart + block.rows.length; r < totalRowNumber; r++) {
    for (let c = 0; c < BLOCK_WIDTH; c++) {
      sheet.getCell(r, startColumn + c).border = THIN_BORDER;
    }
  }

  // 合計行。全ブロックで同じ行に揃える（原本と同じく横並びの下端で一致する）
  const totalValues = [
    block.total.label,
    block.total.totalCount,
    block.total.usedCount,
    block.total.remainingCount,
  ];
  totalValues.forEach((value, c) => {
    const cell = sheet.getCell(totalRowNumber, startColumn + c);
    cell.value = value;
    cell.alignment = { horizontal: c === 0 ? 'center' : 'right' };
    cell.font = { size: 10, bold: true };
    cell.border = THIN_BORDER;
    if (c === 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_USED } };
    if (c === 3) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_REMAINING } };
    }
  });
}

/** 左下の集計表を書き込み、次に使える行番号を返す。 */
function writeSummary(sheet: Worksheet, report: MonthlyReportResponse, startRow: number): number {
  const { summary } = report;
  const rows: Array<[string, number]> = [
    ['総区画数', summary.totalCount],
    ['累計販売区画数', summary.cumulativeSoldCount],
    ['今年度販売区画数', summary.soldThisFiscalYear],
    ['使用区画数', summary.usedCount],
    ['残区画数', summary.remainingCount],
  ];

  // 日付見出し（原本は「2025/10」のように年月）
  const d = new Date(report.asOfDate);
  const headerCell = sheet.getCell(startRow, 4);
  headerCell.value = `${d.getFullYear()}/${d.getMonth() + 1}`;
  headerCell.alignment = { horizontal: 'center' };
  headerCell.font = { size: 10, bold: true };
  headerCell.border = THIN_BORDER;

  rows.forEach(([label, value], i) => {
    const r = startRow + 1 + i;
    const labelCell = sheet.getCell(r, 1);
    labelCell.value = label;
    labelCell.font = { size: 10 };
    labelCell.border = THIN_BORDER;
    sheet.mergeCells(r, 1, r, 3);

    const valueCell = sheet.getCell(r, 4);
    valueCell.value = value;
    valueCell.alignment = { horizontal: 'right' };
    valueCell.numFmt = '#,##0';
    valueCell.font = { size: 10 };
    valueCell.border = THIN_BORDER;
    if (label === '使用区画数') {
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_USED } };
    }
    if (label === '残区画数') {
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: FILL_REMAINING } };
    }
  });

  return startRow + rows.length + 1;
}

/**
 * CJS モジュールを動的 import したときの相互運用差を吸収する。
 *
 * exceljs / file-saver はどちらも CJS のみ（package.json に module フィールドがない）。
 * `await import()` で読むと、実行環境によって名前付きエクスポートがそのまま見える場合と
 * `default` の下にまとまる場合があるため、両方の形を受ける。
 */
function interop<T>(mod: T | { default: T }): T {
  const candidate = (mod as { default?: T }).default;
  return candidate ?? (mod as T);
}

/**
 * 月次報告帳票のワークブックを組む。
 *
 * exceljs は重いので呼び出し時に動的 import する（初期バンドルに載せない）。
 */
export async function buildMonthlyReportWorkbook(
  report: MonthlyReportResponse
): Promise<import('exceljs').Workbook> {
  const ExcelJS = interop(await import('exceljs'));
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('区画残数');

  // 列幅。区は広め、数値列は狭め、区切り列はごく狭く
  const blockCount = report.blocks.length;
  for (let i = 0; i < blockCount; i++) {
    const start = blockStartColumn(i);
    sheet.getColumn(start).width = 11;
    sheet.getColumn(start + 1).width = 8;
    sheet.getColumn(start + 2).width = 8;
    sheet.getColumn(start + 3).width = 8;
    if (i < blockCount - 1) sheet.getColumn(start + BLOCK_WIDTH).width = 2;
  }

  // タイトル
  const title = sheet.getCell(1, 1);
  title.value = '区画残数';
  title.font = { bold: true, size: 14 };
  const asOf = sheet.getCell(1, 3);
  asOf.value = formatAsOfLabel(report.asOfDate);
  asOf.font = { size: 12 };

  // 月末表記と実際の集計時点がずれても取り違えないように併記する
  const note = sheet.getCell(2, 1);
  note.value = `集計時点: ${formatAsOfExact(report.asOfDate)}（区画の増減履歴を持たないため、過去月時点の再現ではありません）`;
  note.font = { size: 9, italic: true, color: { argb: 'FF808080' } };

  // 合計行は全ブロックで揃える。原本と同じく最も行数の多いブロックの下端に置く
  const maxRows = Math.max(...report.blocks.map((b) => b.rows.length));
  const totalRowNumber = DATA_START_ROW + maxRows;

  report.blocks.forEach((block, i) => {
    writeBlock(sheet, block, BLOCK_TITLE_ROW, blockStartColumn(i), totalRowNumber);
  });

  // 左下の集計表
  let nextRow = writeSummary(sheet, report, totalRowNumber + 2);

  // その他ブロック（帳票のレイアウトに載らない区画）は集計表の下に別枠で置く
  if (report.otherBlock) {
    nextRow += 2;
    const caption = sheet.getCell(nextRow, 1);
    caption.value = `この帳票のレイアウトに含まれない区画（${report.otherBlock.total.totalCount.toLocaleString()}件）`;
    caption.font = { size: 10, bold: true };
    nextRow += 1;
    writeBlock(
      sheet,
      report.otherBlock,
      nextRow,
      1,
      nextRow + (DATA_START_ROW - BLOCK_TITLE_ROW) + report.otherBlock.rows.length
    );
  }

  return workbook;
}

/** 出力ファイル名（区画残数_2026-08.xlsx）。 */
export function monthlyReportFileName(asOfDate: string): string {
  const d = new Date(asOfDate);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `区画残数_${d.getFullYear()}-${month}.xlsx`;
}

/**
 * 月次報告帳票を Excel としてダウンロードさせる。
 */
export async function downloadMonthlyReportExcel(report: MonthlyReportResponse): Promise<void> {
  const [workbook, fileSaver] = await Promise.all([
    buildMonthlyReportWorkbook(report),
    import('file-saver'),
  ]);
  const { saveAs } = interop(fileSaver);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, monthlyReportFileName(report.asOfDate));
}
