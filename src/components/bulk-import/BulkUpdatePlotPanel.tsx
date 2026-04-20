'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bulkUpdatePlots } from '@/lib/api/plots';
import { showSuccess, showError, showApiError } from '@/lib/toast';
import { ConfirmDialog } from '@/components/shared/dialogs';
import { downloadPlotTemplate } from './plotTemplate';
import { parsePlotFile, ParsedPlot } from './plotParser';
import { validatePlots, ValidationError } from './plotValidator';
import { buildBulkUpdatePayload } from './plotPayload';
import { MAX_PLOTS_PER_BATCH } from './plotFields';
import { PlotFormatSpec } from './PlotFormatSpec';
import { PlotPreview } from './PlotPreview';
import {
  FileUploadZone,
  ValidationErrorList,
  SubmitResultCard,
} from './shared';

/**
 * 区画 一括編集パネル
 *
 * フロー: テンプレートDL（または区画一覧からエクスポート） → 編集 → アップロード → 検証 → 送信
 * マッチングキー: 区画番号（plotNumber）
 * 空欄セル: 変更しない（既存値維持）
 *
 * バックエンドエンドポイント PUT /api/v1/plots/bulk は
 * zaitsu82/komine-crm-backend#74 で実装予定。
 */
export function BulkUpdatePlotPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [plots, setPlots] = useState<ParsedPlot[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    totalRequested: number;
    succeeded: number;
    failed: Array<{
      row: number;
      plotNumber?: string | null;
      error: { message: string; details?: Array<{ field?: string; message: string }> };
    }>;
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
    const errs = validatePlots(plots, 'update');
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
      const payload = buildBulkUpdatePayload(plots);
      const response = await bulkUpdatePlots(payload);
      if (response.success) {
        const { totalRequested, succeeded, failed } = response.data;
        setSubmitResult({ totalRequested, succeeded, failed });
        if (failed.length === 0) {
          showSuccess(`${succeeded}件の区画情報を更新しました`);
        } else if (succeeded === 0) {
          showError(`${failed.length}件すべての更新に失敗しました`);
        } else {
          showError(`${succeeded}件成功 / ${failed.length}件失敗`);
        }
      } else {
        showApiError('一括編集', response.error?.message, response.error?.details);
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
      {/* 背景ノート */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 p-4 bg-kinari rounded-lg border border-gin">
            <svg
              className="w-5 h-5 text-matsu flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-sumi space-y-1">
              <p className="font-semibold">一括編集の使い方</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1 text-hai">
                <li>
                  テンプレートをダウンロード、または区画一覧画面から対象区画を選択してエクスポート
                </li>
                <li>Excelで値を編集（<span className="font-medium">空欄=変更しない</span>、既存値を保持）</li>
                <li>アップロード → データを検証 → 一括編集を実行</li>
                <li>マッチングキーは <span className="font-medium">区画番号</span>。既存データに存在しない区画番号はエラーになります</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* テンプレートダウンロード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テンプレートダウンロード</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-hai mb-4">
            新規でテンプレートから作る場合はこちら。実データから編集したい場合は区画一覧画面からエクスポートしてください（準備中）。
          </p>
          <Button variant="outline" onClick={() => downloadPlotTemplate('update')}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            一括編集テンプレート (.xlsx)
          </Button>
        </CardContent>
      </Card>

      {/* フォーマット仕様 */}
      <PlotFormatSpec mode="update" />

      {/* ファイルアップロード */}
      {!submitResult && (
        <FileUploadZone
          file={file}
          onFileSelect={handleFileSelect}
          helperText={`最大${MAX_PLOTS_PER_BATCH}件まで一括編集可能`}
        />
      )}

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
                    {isSubmitting ? '送信中...' : `${rowCount}件を一括編集する`}
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

      {submitResult && (
        <SubmitResultCard
          mode="update"
          totalRequested={submitResult.totalRequested}
          succeeded={submitResult.succeeded}
          failed={submitResult.failed}
          onReset={handleReset}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmSubmit}
        title="一括編集の確認"
        message={`区画情報 ${rowCount}件を一括編集します。空欄セルは既存値を維持します。この操作は取り消せません。続行しますか？`}
        confirmText="更新する"
        cancelText="戻る"
        variant="warning"
        isLoading={isSubmitting}
      />
    </div>
  );
}
