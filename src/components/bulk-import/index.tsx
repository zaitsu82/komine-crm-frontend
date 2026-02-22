'use client';

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bulkCreatePlots } from '@/lib/api/plots';
import { bulkCreateStaff } from '@/lib/api/staff';
import { showSuccess, showError } from '@/lib/toast';

// ===== 型定義 =====

interface PlotRow {
  plotNumber: string;
  areaName: string;
  areaSqm?: number;
  notes?: string;
}

interface StaffRow {
  name: string;
  email: string;
  role: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface SubmitResult {
  totalRequested: number;
  created: number;
}

type ImportTab = 'plots' | 'staff';

// ===== ヘルパー関数 =====

function validatePlotRows(rows: PlotRow[]): ValidationError[] {
  const errors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Excel row (1-indexed + header)

    if (!row.plotNumber || row.plotNumber.trim() === '') {
      errors.push({ row: rowNum, field: '区画番号', message: '区画番号は必須です' });
    }

    if (!row.areaName || row.areaName.trim() === '') {
      errors.push({ row: rowNum, field: '区域名', message: '区域名は必須です' });
    }

    if (row.areaSqm !== undefined && row.areaSqm !== null) {
      if (typeof row.areaSqm !== 'number' || isNaN(row.areaSqm) || row.areaSqm <= 0) {
        errors.push({ row: rowNum, field: '面積', message: '面積は正の数値を入力してください' });
      }
    }
  });

  return errors;
}

function validateStaffRows(rows: StaffRow[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const validRoles = ['viewer', 'operator', 'manager', 'admin'];

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    if (!row.name || row.name.trim() === '') {
      errors.push({ row: rowNum, field: '名前', message: '名前は必須です' });
    }

    if (!row.email || row.email.trim() === '') {
      errors.push({ row: rowNum, field: 'メール', message: 'メールアドレスは必須です' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({ row: rowNum, field: 'メール', message: 'メールアドレスの形式が不正です' });
    }

    if (!row.role || row.role.trim() === '') {
      errors.push({ row: rowNum, field: 'ロール', message: 'ロールは必須です' });
    } else if (!validRoles.includes(row.role.toLowerCase())) {
      errors.push({
        row: rowNum,
        field: 'ロール',
        message: `ロールは ${validRoles.join(', ')} のいずれかを指定してください`,
      });
    }
  });

  return errors;
}

/**
 * CSVテキストを行列の二次元配列にパースする
 */
function parseCsvText(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  return lines.map((line) => line.split(',').map((cell) => cell.trim()));
}

/**
 * ExcelJS Workbook をロードする（CSV/XLSX対応）
 */
async function loadWorkbook(file: File): Promise<ExcelJS.Workbook> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  if (file.name.endsWith('.csv')) {
    // CSVはテキストとしてパースしてワークシートに変換
    const text = new TextDecoder('utf-8').decode(buffer);
    const csvRows = parseCsvText(text);
    const sheet = workbook.addWorksheet('データ');

    csvRows.forEach((row) => {
      sheet.addRow(row);
    });
  } else {
    await workbook.xlsx.load(buffer);
  }

  return workbook;
}

async function parsePlotFile(file: File): Promise<PlotRow[]> {
  const workbook = await loadWorkbook(file);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rows: PlotRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const plotNumber = String(row.getCell(1).value ?? '').trim();
    const areaName = String(row.getCell(2).value ?? '').trim();
    const areaSqmRaw = row.getCell(3).value;
    const notes = String(row.getCell(4).value ?? '').trim();

    // Skip completely empty rows
    if (!plotNumber && !areaName && !areaSqmRaw && !notes) return;

    const areaSqm = areaSqmRaw !== null && areaSqmRaw !== undefined && areaSqmRaw !== ''
      ? Number(areaSqmRaw)
      : undefined;

    rows.push({
      plotNumber,
      areaName,
      areaSqm: areaSqm !== undefined && !isNaN(areaSqm) ? areaSqm : undefined,
      notes: notes || undefined,
    });
  });

  return rows;
}

async function parseStaffFile(file: File): Promise<StaffRow[]> {
  const workbook = await loadWorkbook(file);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rows: StaffRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const name = String(row.getCell(1).value ?? '').trim();
    const email = String(row.getCell(2).value ?? '').trim();
    const role = String(row.getCell(3).value ?? '').trim().toLowerCase();

    // Skip completely empty rows
    if (!name && !email && !role) return;

    rows.push({ name, email, role });
  });

  return rows;
}

async function downloadTemplate(type: ImportTab) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('データ');

  if (type === 'plots') {
    sheet.columns = [
      { header: '区画番号', key: 'plotNumber', width: 15 },
      { header: '区域名', key: 'areaName', width: 15 },
      { header: '面積(㎡)', key: 'areaSqm', width: 12 },
      { header: '備考', key: 'notes', width: 30 },
    ];
  } else {
    sheet.columns = [
      { header: '名前', key: 'name', width: 20 },
      { header: 'メールアドレス', key: 'email', width: 30 },
      { header: 'ロール', key: 'role', width: 15 },
    ];
  }

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `${type === 'plots' ? '区画情報' : 'スタッフ情報'}_テンプレート.xlsx`
  );
}

// ===== メインコンポーネント =====

export default function BulkImportPage() {
  const [activeTab, setActiveTab] = useState<ImportTab>('plots');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="font-mincho text-2xl font-semibold text-sumi mb-6 tracking-wide">
        一括登録
      </h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ImportTab)}>
        <TabsList>
          <TabsTrigger value="plots">区画情報</TabsTrigger>
          <TabsTrigger value="staff">スタッフ情報</TabsTrigger>
        </TabsList>

        <TabsContent value="plots">
          <BulkImportPanel type="plots" />
        </TabsContent>

        <TabsContent value="staff">
          <BulkImportPanel type="staff" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== タブごとのパネル =====

function BulkImportPanel({ type }: { type: ImportTab }) {
  const [file, setFile] = useState<File | null>(null);
  const [plotRows, setPlotRows] = useState<PlotRow[]>([]);
  const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rowCount = type === 'plots' ? plotRows.length : staffRows.length;
  const hasRows = rowCount > 0;
  const hasErrors = validationErrors.length > 0;
  const errorRows = new Set(validationErrors.map((e) => e.row));

  // ファイル選択処理
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'csv'].includes(ext)) {
        showError('対応していないファイル形式です。.xlsx または .csv ファイルを選択してください。');
        return;
      }

      setFile(selectedFile);
      setValidationErrors([]);
      setIsValidated(false);
      setSubmitResult(null);

      try {
        if (type === 'plots') {
          const rows = await parsePlotFile(selectedFile);
          setPlotRows(rows);
          setStaffRows([]);
        } else {
          const rows = await parseStaffFile(selectedFile);
          setStaffRows(rows);
          setPlotRows([]);
        }
      } catch {
        showError('ファイルの読み込みに失敗しました。ファイル形式を確認してください。');
        setFile(null);
      }
    },
    [type]
  );

  // ドラッグ&ドロップハンドラー
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect]
  );

  // バリデーション
  const handleValidate = useCallback(() => {
    const errors =
      type === 'plots' ? validatePlotRows(plotRows) : validateStaffRows(staffRows);
    setValidationErrors(errors);
    setIsValidated(true);

    if (errors.length === 0) {
      showSuccess('バリデーション成功: エラーはありません');
    } else {
      showError(`${errors.length}件のエラーが見つかりました`);
    }
  }, [type, plotRows, staffRows]);

  // 送信
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (type === 'plots') {
        const response = await bulkCreatePlots(plotRows);
        if (response.success) {
          setSubmitResult({
            totalRequested: response.data.totalRequested,
            created: response.data.created,
          });
          showSuccess(`${response.data.created}件の区画情報を登録しました`);
        } else {
          showError('一括登録に失敗しました', response.error?.message);
        }
      } else {
        const response = await bulkCreateStaff(staffRows);
        if (response.success) {
          setSubmitResult({
            totalRequested: response.data.totalRequested,
            created: response.data.created,
          });
          showSuccess(`${response.data.created}件のスタッフ情報を登録しました`);
        } else {
          showError('一括登録に失敗しました', response.error?.message);
        }
      }
    } catch {
      showError('送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  }, [type, plotRows, staffRows]);

  // リセット
  const handleReset = useCallback(() => {
    setFile(null);
    setPlotRows([]);
    setStaffRows([]);
    setValidationErrors([]);
    setIsValidated(false);
    setSubmitResult(null);
  }, []);

  const typeLabel = type === 'plots' ? '区画情報' : 'スタッフ情報';

  return (
    <div className="space-y-6">
      {/* テンプレートダウンロード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テンプレートダウンロード</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-hai mb-4">
            一括登録用のテンプレートファイルをダウンロードして、データを入力してください。
          </p>
          <Button
            variant="outline"
            onClick={() => downloadTemplate(type)}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {typeLabel}テンプレート (.xlsx)
          </Button>
        </CardContent>
      </Card>

      {/* ファイルアップロード */}
      {!submitResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ファイルアップロード</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragOver
                  ? 'border-matsu bg-matsu-50'
                  : 'border-gin hover:border-matsu hover:bg-kinari'
                }
              `}
            >
              <svg
                className="w-12 h-12 mx-auto mb-4 text-hai"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {file ? (
                <div>
                  <p className="text-sumi font-medium">{file.name}</p>
                  <p className="text-sm text-hai mt-1">
                    クリックまたはドラッグ&ドロップで別のファイルに変更
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sumi font-medium">
                    ファイルをドラッグ&ドロップ
                  </p>
                  <p className="text-sm text-hai mt-1">
                    またはクリックしてファイルを選択 (.xlsx, .csv)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* プレビューテーブル */}
      {hasRows && !submitResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              データプレビュー ({rowCount}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-gin rounded-lg">
              {type === 'plots' ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-kinari border-b border-gin">
                      <th className="px-4 py-3 text-left font-semibold text-sumi">行</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">区画番号</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">区域名</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">面積(㎡)</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">備考</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plotRows.map((row, idx) => {
                      const rowNum = idx + 2;
                      const hasError = errorRows.has(rowNum);
                      return (
                        <tr
                          key={idx}
                          className={`border-b border-gin last:border-0 ${hasError ? 'bg-beni-50' : 'hover:bg-kinari'
                            }`}
                        >
                          <td className="px-4 py-2 text-hai">{rowNum}</td>
                          <td className="px-4 py-2">{row.plotNumber || '-'}</td>
                          <td className="px-4 py-2">{row.areaName || '-'}</td>
                          <td className="px-4 py-2">{row.areaSqm ?? '-'}</td>
                          <td className="px-4 py-2">{row.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-kinari border-b border-gin">
                      <th className="px-4 py-3 text-left font-semibold text-sumi">行</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">名前</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">メールアドレス</th>
                      <th className="px-4 py-3 text-left font-semibold text-sumi">ロール</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffRows.map((row, idx) => {
                      const rowNum = idx + 2;
                      const hasError = errorRows.has(rowNum);
                      return (
                        <tr
                          key={idx}
                          className={`border-b border-gin last:border-0 ${hasError ? 'bg-beni-50' : 'hover:bg-kinari'
                            }`}
                        >
                          <td className="px-4 py-2 text-hai">{rowNum}</td>
                          <td className="px-4 py-2">{row.name || '-'}</td>
                          <td className="px-4 py-2">{row.email || '-'}</td>
                          <td className="px-4 py-2">{row.role || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* バリデーションエラー表示 */}
            {isValidated && hasErrors && (
              <div className="mt-4 p-4 bg-beni-50 border border-beni-200 rounded-lg">
                <h4 className="font-semibold text-beni mb-2">
                  バリデーションエラー ({validationErrors.length}件)
                </h4>
                <ul className="space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="text-sm text-beni">
                      行{err.row} [{err.field}]: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isValidated && !hasErrors && (
              <div className="mt-4 p-4 bg-matsu-50 border border-matsu-200 rounded-lg">
                <p className="text-sm text-matsu font-medium">
                  バリデーション成功: 全{rowCount}件のデータに問題はありません。
                </p>
              </div>
            )}

            {/* アクションボタン */}
            <div className="mt-6 flex items-center gap-3">
              {!isValidated ? (
                <Button onClick={handleValidate}>
                  データを検証する
                </Button>
              ) : !hasErrors ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '送信中...' : `${rowCount}件を一括登録する`}
                </Button>
              ) : (
                <Button onClick={handleValidate}>
                  再検証する
                </Button>
              )}

              <Button variant="outline" onClick={handleReset}>
                リセット
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 送信結果 */}
      {submitResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">登録結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-matsu-50 border border-matsu-200 rounded-lg text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-matsu"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-matsu mb-2">
                一括登録が完了しました
              </h3>
              <p className="text-sumi">
                リクエスト数: {submitResult.totalRequested}件 / 登録成功: {submitResult.created}件
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={handleReset}>
                新しいファイルをアップロード
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
