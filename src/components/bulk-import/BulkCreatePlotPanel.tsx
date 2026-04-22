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
import { WizardStepper, WizardNav, WizardStep } from './WizardStepper';

const STEPS: WizardStep[] = [
  { id: 'download', label: 'テンプレート取得', description: 'Excelファイルをダウンロード' },
  { id: 'prepare', label: 'データ入力', description: 'Excelで区画情報を入力' },
  { id: 'upload', label: 'アップロード', description: '検証して一括登録' },
];

export function BulkCreatePlotPanel() {
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
    downloadPlotTemplate('create');
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
        const { totalRequested, succeeded, failed } = response.data;
        setSubmitResult({ totalRequested, succeeded, failed });
        if (failed.length === 0) {
          showSuccess(`${succeeded}件の区画情報を登録しました`);
        } else if (succeeded === 0) {
          showError(`${failed.length}件すべての登録に失敗しました`);
        } else {
          showError(`${succeeded}件成功 / ${failed.length}件失敗`);
        }
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
    setCurrentStep(0);
    setMaxReachedStep(0);
  }, []);

  const rowCount = plots.length;
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-4 mt-4">
      <WizardStepper
        steps={STEPS}
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepChange={goToStep}
      />

      {/* Step 1: テンプレートダウンロード */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">テンプレートをダウンロード</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-hai mb-4">
                一括登録用のテンプレートファイルをダウンロードしてください。
                メインの「区画情報」シートに加え、家族連絡先・埋葬者・工事情報の各シートが含まれます。
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
                一括登録テンプレート (.xlsx)
              </Button>
            </CardContent>
          </Card>

          <PlotFormatSpec mode="create" />

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
                  <p className="font-semibold">ダウンロードしたテンプレートに、Excelでデータを入力してください</p>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-hai">
                    <li>1ファイルに最大 <span className="font-medium text-sumi">{MAX_PLOTS_PER_BATCH}件</span> まで入力できます</li>
                    <li>必須項目は「区画番号」「エリア名」「面積」の3項目</li>
                    <li>関連データ（家族連絡先・埋葬者・工事情報）は別シートに記入</li>
                    <li>入力が終わったら保存して、次のステップでアップロードします</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-kinari rounded-lg text-xs text-hai">
                💡 フォーマットの詳細はステップ1の「フォーマット仕様」で確認できます（ステップ1に戻って確認可能）
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
              helperText={`最大${MAX_PLOTS_PER_BATCH}件まで一括登録可能`}
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

          {submitResult && (
            <SubmitResultCard
              mode="create"
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
