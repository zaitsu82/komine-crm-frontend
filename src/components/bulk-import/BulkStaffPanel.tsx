'use client';

import { useCallback, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bulkCreateStaff } from '@/lib/api/staff';
import { showSuccess, showError, showApiError } from '@/lib/toast';
import { ConfirmDialog } from '@/components/shared/dialogs';
import { FileUploadZone, SubmitResultCard } from './shared';
import { MAX_STAFF_PER_BATCH } from './plotFields';
import { WizardStepper, WizardNav, WizardStep } from './WizardStepper';

const STEPS: WizardStep[] = [
  { id: 'download', label: 'テンプレート取得', description: 'Excelファイルをダウンロード' },
  { id: 'prepare', label: 'データ入力', description: 'Excelでスタッフ情報を入力' },
  { id: 'upload', label: 'アップロード', description: '検証して一括登録' },
];

interface StaffRow {
  name: string;
  email: string;
  role: string;
}

interface StaffValidationError {
  row: number;
  field: string;
  message: string;
}

function validateStaffRows(rows: StaffRow[]): StaffValidationError[] {
  const errors: StaffValidationError[] = [];
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

async function parseStaffFile(file: File): Promise<StaffRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  if (file.name.toLowerCase().endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(buffer);
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    const sheet = workbook.addWorksheet('データ');
    lines.forEach((l) => sheet.addRow(l.split(',').map((c) => c.trim())));
  } else {
    await workbook.xlsx.load(buffer);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rows: StaffRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = String(row.getCell(1).value ?? '').trim();
    const email = String(row.getCell(2).value ?? '').trim();
    const role = String(row.getCell(3).value ?? '').trim().toLowerCase();
    if (!name && !email && !role) return;
    rows.push({ name, email, role });
  });
  return rows;
}

async function downloadStaffTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('データ');
  sheet.columns = [
    { header: '名前', key: 'name', width: 20 },
    { header: 'メールアドレス', key: 'email', width: 30 },
    { header: 'ロール', key: 'role', width: 15 },
  ];
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  sheet.addRow(['山田太郎', 'taro@example.com', 'operator']);
  const row2 = sheet.getRow(2);
  row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
  row2.font = { color: { argb: 'FF999999' } };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'スタッフ情報_テンプレート.xlsx');
}

export function BulkStaffPanel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [errors, setErrors] = useState<StaffValidationError[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    totalRequested: number;
    created: number;
  } | null>(null);

  const errorRows = new Set(errors.map((e) => e.row));

  const goToStep = useCallback((next: number) => {
    setCurrentStep(next);
    setMaxReachedStep((prev) => Math.max(prev, next));
  }, []);

  const handleDownload = useCallback(async () => {
    await downloadStaffTemplate();
    setMaxReachedStep((prev) => Math.max(prev, 1));
  }, []);

  const handleFileSelect = useCallback(async (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'csv'].includes(ext)) {
      showError('対応していないファイル形式です。.xlsx または .csv を選択してください');
      return;
    }
    setFile(f);
    setErrors([]);
    setIsValidated(false);
    setSubmitResult(null);

    try {
      const parsed = await parseStaffFile(f);
      setRows(parsed);
    } catch {
      showError('ファイルの読み込みに失敗しました');
      setFile(null);
      setRows([]);
    }
  }, []);

  const handleValidate = useCallback(() => {
    const errs = validateStaffRows(rows);
    setErrors(errs);
    setIsValidated(true);
    if (errs.length === 0) {
      showSuccess('バリデーション成功: エラーはありません');
    } else {
      showError(`${errs.length}件のエラーが見つかりました`);
    }
  }, [rows]);

  const handleConfirmSubmit = useCallback(async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const response = await bulkCreateStaff(rows);
      if (response.success) {
        setSubmitResult({
          totalRequested: response.data.totalRequested,
          created: response.data.created,
        });
        showSuccess(`${response.data.created}件のスタッフ情報を登録しました`);
      } else {
        showApiError('一括登録', response.error?.message, response.error?.details);
      }
    } catch {
      showError('送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  }, [rows]);

  const handleReset = useCallback(() => {
    setFile(null);
    setRows([]);
    setErrors([]);
    setIsValidated(false);
    setSubmitResult(null);
    setCurrentStep(0);
    setMaxReachedStep(0);
  }, []);

  const rowCount = rows.length;
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-4 mt-4">
      <WizardStepper
        steps={STEPS}
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepChange={goToStep}
      />

      {/* Step 1: テンプレート取得 + フォーマット仕様 */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">テンプレートをダウンロード</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-hai mb-4">
                一括登録用のテンプレートファイルをダウンロードしてください。
              </p>
              <Button variant="outline" onClick={handleDownload}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                スタッフ情報テンプレート (.xlsx)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium text-sumi mb-3">フォーマット仕様</h3>
              <div className="overflow-x-auto border border-gin rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-kinari border-b border-gin">
                      <th className="px-4 py-2 text-left font-semibold text-sumi">フィールド</th>
                      <th className="px-4 py-2 text-center font-semibold text-sumi">必須</th>
                      <th className="px-4 py-2 text-left font-semibold text-sumi">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gin">
                      <td className="px-4 py-2 font-medium">名前</td>
                      <td className="px-4 py-2 text-center text-beni">○</td>
                      <td className="px-4 py-2 text-hai">スタッフ名</td>
                    </tr>
                    <tr className="border-b border-gin">
                      <td className="px-4 py-2 font-medium">メールアドレス</td>
                      <td className="px-4 py-2 text-center text-beni">○</td>
                      <td className="px-4 py-2 text-hai">有効なメールアドレス形式</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">ロール</td>
                      <td className="px-4 py-2 text-center text-beni">○</td>
                      <td className="px-4 py-2 text-hai">viewer / operator / manager / admin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-hai space-y-1">
                <p className="font-medium text-sumi">注意事項:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>1回の登録で最大{MAX_STAFF_PER_BATCH}件まで対応</li>
                  <li>対応ファイル形式: .xlsx / .csv</li>
                  <li>1行目はヘッダー行として自動スキップ</li>
                  <li>1件でもエラーがあると全件登録されません（全件ロールバック）</li>
                  <li>空行は自動的にスキップされます</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <WizardNav onNext={() => goToStep(1)} nextLabel="データ入力へ進む" />
        </div>
      )}

      {/* Step 2: データ入力案内 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 p-4 bg-ai-50 rounded-lg border border-ai-200">
                <svg
                  className="w-5 h-5 text-ai flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <div className="text-sm text-sumi space-y-2">
                  <p className="font-semibold">ダウンロードしたテンプレートに、Excelでスタッフ情報を入力してください</p>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-hai">
                    <li>1ファイルに最大 <span className="font-medium text-sumi">{MAX_STAFF_PER_BATCH}件</span> まで入力できます</li>
                    <li>必須項目: 名前、メールアドレス、ロール（すべて）</li>
                    <li>ロールは <span className="font-medium text-sumi">viewer / operator / manager / admin</span> のいずれか</li>
                    <li>入力が終わったら保存して、次のステップでアップロードします</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <WizardNav
            onBack={() => goToStep(0)}
            onNext={() => goToStep(2)}
            nextLabel="入力完了、アップロードへ"
          />
        </div>
      )}

      {/* Step 3: アップロード */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {!submitResult && (
            <FileUploadZone
              file={file}
              onFileSelect={handleFileSelect}
              helperText={`最大${MAX_STAFF_PER_BATCH}件まで一括登録可能`}
            />
          )}

          {rowCount > 0 && !submitResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">データプレビュー ({rowCount}件)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border border-gin rounded-lg">
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
                      {rows.map((row, idx) => {
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
                </div>

                {isValidated && hasErrors && (
                  <div className="mt-4 p-4 bg-beni-50 border border-beni-200 rounded-lg">
                    <h4 className="font-semibold text-beni mb-2">バリデーションエラー ({errors.length}件)</h4>
                    <ul className="space-y-1">
                      {errors.map((err, idx) => (
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

                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  {!isValidated ? (
                    <Button onClick={handleValidate}>データを検証する</Button>
                  ) : !hasErrors ? (
                    <Button onClick={() => setShowConfirm(true)} disabled={isSubmitting}>
                      {isSubmitting ? '送信中...' : `${rowCount}件を一括登録する`}
                    </Button>
                  ) : (
                    <Button onClick={handleValidate}>再検証する</Button>
                  )}
                  <Button variant="outline" onClick={handleReset}>
                    リセット
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {submitResult && (
            <SubmitResultCard
              mode="create"
              totalRequested={submitResult.totalRequested}
              succeeded={submitResult.created}
              onReset={handleReset}
            />
          )}

          {!submitResult && (
            <WizardNav onBack={() => goToStep(1)} />
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="一括登録の確認"
        message={`スタッフ情報 ${rowCount}件を一括登録します。この操作は取り消せません。続行しますか？`}
        confirmText="登録する"
        cancelText="戻る"
        variant="warning"
        isLoading={isSubmitting}
      />
    </div>
  );
}
