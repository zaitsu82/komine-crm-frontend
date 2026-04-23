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
import { WizardStepper, WizardNav, WizardStep } from './WizardStepper';

const STEPS: WizardStep[] = [
  { id: 'download', label: 'テンプレート取得', description: 'テンプレートまたは既存データから' },
  { id: 'prepare', label: 'データ編集', description: 'Excelで編集（空欄=変更なし）' },
  { id: 'upload', label: 'アップロード', description: '検証して一括編集' },
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReachedStep, setMaxReachedStep] = useState(0);
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

  const goToStep = useCallback((next: number) => {
    setCurrentStep(next);
    setMaxReachedStep((prev) => Math.max(prev, next));
  }, []);

  const handleDownload = useCallback(() => {
    downloadPlotTemplate('update');
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
    setCurrentStep(0);
    setMaxReachedStep(0);
  }, []);

  const rowCount = plots.length;
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-4 mt-4">
      {/* 背景ノート（常時表示） */}
      <div className="flex items-start gap-3 p-3 md:p-4 bg-kinari rounded-lg border border-gin">
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
        <div className="text-xs md:text-sm text-sumi space-y-1">
          <p className="font-semibold">一括編集の要点</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1 text-hai">
            <li>空欄セルは <span className="font-medium">変更しない</span>（既存値を保持）</li>
            <li>マッチングキーは <span className="font-medium">区画番号</span>。存在しない番号はエラー</li>
          </ul>
        </div>
      </div>

      <WizardStepper
        steps={STEPS}
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepChange={goToStep}
      />

      {/* Step 1: テンプレート取得 */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">テンプレートをダウンロード</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-hai mb-4">
                新規でテンプレートから作る場合はこちら。実データから編集したい場合は区画一覧画面からエクスポートしてください（準備中）。
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
                一括編集テンプレート (.xlsx)
              </Button>
            </CardContent>
          </Card>

          <PlotFormatSpec mode="update" />

          <WizardNav onNext={() => goToStep(1)} nextLabel="データ編集へ進む" />
        </div>
      )}

      {/* Step 2: データ編集案内 */}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <div className="text-sm text-sumi space-y-2">
                  <p className="font-semibold">ダウンロードしたファイルをExcelで編集してください</p>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-hai">
                    <li>マッチングキー: <span className="font-medium text-sumi">区画番号</span>（既存に存在しない番号はエラー）</li>
                    <li>空欄セル = <span className="font-medium text-sumi">変更しない</span>（既存値を保持）</li>
                    <li>1ファイルに最大 <span className="font-medium text-sumi">{MAX_PLOTS_PER_BATCH}件</span> まで編集可能</li>
                    <li>編集が終わったら保存して、次のステップでアップロードします</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <WizardNav
            onBack={() => goToStep(0)}
            onNext={() => goToStep(2)}
            nextLabel="編集完了、アップロードへ"
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

          {!submitResult && (
            <WizardNav onBack={() => goToStep(1)} />
          )}
        </div>
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
