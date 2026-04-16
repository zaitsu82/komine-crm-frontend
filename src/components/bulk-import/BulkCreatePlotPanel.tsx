'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bulkCreatePlots } from '@/lib/api/plots';
import { showSuccess, showError, showApiError } from '@/lib/toast';
import { ConfirmDialog } from '@/components/shared/dialogs';
import { downloadPlotTemplate } from './plotTemplate';
import { parsePlotFile, ParsedPlot } from './plotParser';
import { validatePlots, ValidationError } from './plotValidator';
import { buildBulkCreatePayload } from './plotPayload';
import { MAX_PLOTS_PER_BATCH } from './plotFields';
import { PlotFormatSpec } from './PlotFormatSpec';
import { PlotPreview } from './PlotPreview';
import {
  FileUploadZone,
  ValidationErrorList,
  SubmitResultCard,
} from './shared';

export function BulkCreatePlotPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [plots, setPlots] = useState<ParsedPlot[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    totalRequested: number;
    created: number;
  } | null>(null);

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
      const parsed = await parsePlotFile(f);
      setPlots(parsed);
    } catch {
      showError('ファイルの読み込みに失敗しました');
      setFile(null);
      setPlots([]);
    }
  }, []);

  const handleValidate = useCallback(() => {
    const errs = validatePlots(plots, 'create');
    setErrors(errs);
    setIsValidated(true);
    if (errs.length === 0) {
      showSuccess('バリデーション成功: エラーはありません');
    } else {
      showError(`${errs.length}件のエラーが見つかりました`);
    }
  }, [plots]);

  const handleSubmit = useCallback(() => setShowConfirm(true), []);

  const handleConfirmSubmit = useCallback(async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const payload = buildBulkCreatePayload(plots);
      const response = await bulkCreatePlots(payload);
      if (response.success) {
        setSubmitResult({
          totalRequested: response.data.totalRequested,
          created: response.data.created,
        });
        showSuccess(`${response.data.created}件の区画情報を登録しました`);
      } else {
        showApiError('一括登録', response.error?.message, response.error?.details);
      }
    } catch {
      showError('送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  }, [plots]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPlots([]);
    setErrors([]);
    setIsValidated(false);
    setSubmitResult(null);
  }, []);

  const rowCount = plots.length;
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-6 mt-4">
      {/* テンプレートダウンロード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テンプレートダウンロード</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-hai mb-4">
            一括登録用のテンプレートファイルをダウンロードし、データを入力してください。
            メインの「区画情報」シートに加え、家族連絡先・埋葬者・工事情報の各シートが含まれます。
          </p>
          <Button variant="outline" onClick={() => downloadPlotTemplate('create')}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            一括登録テンプレート (.xlsx)
          </Button>
        </CardContent>
      </Card>

      {/* フォーマット仕様 */}
      <PlotFormatSpec mode="create" />

      {/* ファイルアップロード */}
      {!submitResult && (
        <FileUploadZone
          file={file}
          onFileSelect={handleFileSelect}
          helperText={`最大${MAX_PLOTS_PER_BATCH}件まで一括登録可能`}
        />
      )}

      {/* プレビュー */}
      {rowCount > 0 && !submitResult && (
        <>
          <PlotPreview plots={plots} errors={errors} totalRowCount={rowCount} />

          <Card>
            <CardContent className="pt-6">
              {isValidated && <ValidationErrorList errors={errors} />}

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
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
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
        </>
      )}

      {/* 結果 */}
      {submitResult && (
        <SubmitResultCard
          mode="create"
          totalRequested={submitResult.totalRequested}
          succeeded={submitResult.created}
          onReset={handleReset}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="一括登録の確認"
        message={`区画情報 ${rowCount}件を一括登録します。この操作は取り消せません。続行しますか？`}
        confirmText="登録する"
        cancelText="戻る"
        variant="warning"
        isLoading={isSubmitting}
      />
    </div>
  );
}
