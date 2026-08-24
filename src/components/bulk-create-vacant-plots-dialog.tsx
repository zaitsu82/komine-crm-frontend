'use client';

/**
 * 空き区画の範囲一括登録ダイアログ（議事録 2026-07-21 §6）
 *
 * 業務要望: 「将来的に区画を増設した場合に備え、『何番から何番まで』と範囲を指定して
 * 空き区画を一括で登録できる機能」。
 *
 * 面積の既定値を 3.6 に決め打ちしない。区画名により実面積が大きく異なり
 * （凛=0.013㎡ / 納骨堂=0.09㎡）、決め打ちだと毎回間違えるため、選んだ区画名に
 * 既にある区画の面積を初期値として埋める。
 */

import { useEffect, useState } from 'react';
import type { CreatePhysicalPlotsBulkResponse } from '@komine/types';

import { FormDialog } from '@/components/shared/dialogs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPhysicalPlotsBulk, getVacantPlots } from '@/lib/api/plots';
import { showApiError, showError, showSuccess, showWarning } from '@/lib/toast';

/** backend の BULK_REGISTER_MAX_COUNT と揃える。超過は backend でも弾かれる */
export const BULK_MAX_COUNT = 500;

interface BulkCreateVacantPlotsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const initialForm = {
  areaName: '',
  prefix: '',
  startNumber: '',
  endNumber: '',
  areaSqm: '',
  notes: '',
};

export function BulkCreateVacantPlotsDialog({
  isOpen,
  onClose,
  onCreated,
}: BulkCreateVacantPlotsDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set =
    (key: keyof typeof initialForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // 区画名が決まったら、その区画名の既存区画の面積を初期値に入れる。
  // 3.6 決め打ちだと凛（0.013）や納骨堂（0.09）で毎回間違える
  const areaName = form.areaName.trim();
  useEffect(() => {
    if (!isOpen || !areaName) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await getVacantPlots({ areaName, limit: 1 });
        if (cancelled) return;
        const sample = response.success ? response.data?.items[0] : undefined;
        if (sample) {
          setForm((prev) => (prev.areaSqm ? prev : { ...prev, areaSqm: String(sample.areaSqm) }));
        }
      } catch {
        // 面積の初期値埋めは補助機能。失敗しても手入力で続行できるため通知しない
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, areaName]);

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  const start = Number(form.startNumber);
  const end = Number(form.endNumber);
  const hasValidRange =
    form.startNumber !== '' &&
    form.endNumber !== '' &&
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    start <= end;
  const plannedCount = hasValidRange ? end - start + 1 : 0;

  const handleSubmit = async (): Promise<void> => {
    if (!areaName) {
      showError('区画名（エリア）は必須です');
      return;
    }
    if (!hasValidRange) {
      showError('開始番号・終了番号は0以上の整数で、開始 ≦ 終了 で入力してください');
      return;
    }
    if (plannedCount > BULK_MAX_COUNT) {
      showError(`一度に登録できるのは${BULK_MAX_COUNT}件までです（現在 ${plannedCount}件）`);
      return;
    }
    const areaSqm = Number(form.areaSqm);
    if (!Number.isFinite(areaSqm) || areaSqm <= 0) {
      showError('面積は0より大きい数値で入力してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPhysicalPlotsBulk({
        areaName,
        ...(form.prefix.trim() ? { prefix: form.prefix.trim() } : {}),
        startNumber: start,
        endNumber: end,
        areaSqm,
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });

      // ApiResponse は success で判別するユニオン。失敗側でのみ error を参照できる
      if (!response.success) {
        showApiError('空き区画の一括登録', response.error?.message);
        return;
      }

      reportResult(response.data);
      onCreated();
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  /** 登録件数とスキップ件数を分けて伝える。何も登録されなかった場合を成功と誤認させない */
  const reportResult = (data: CreatePhysicalPlotsBulkResponse) => {
    if (data.createdCount === 0) {
      showWarning(
        `登録できる区画がありませんでした（${data.skippedCount}件はすべて既に登録済みです）`
      );
      return;
    }
    if (data.skippedCount > 0) {
      showSuccess(
        `${data.createdCount}件を登録しました（${data.skippedCount}件は既に登録済みのためスキップ）`
      );
      return;
    }
    showSuccess(`${data.createdCount}件の空き区画を登録しました`);
  };

  const previewFirst = `${form.prefix.trim()}${form.startNumber || '?'}`;
  const previewLast = `${form.prefix.trim()}${form.endNumber || '?'}`;

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="空き区画の一括登録"
      description="「何番から何番まで」で空き区画をまとめて登録します。既に登録済みの番号は自動でスキップされます。"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      isLoading={isSubmitting}
      submitText="一括登録"
      isSubmitDisabled={!hasValidRange || plannedCount > BULK_MAX_COUNT}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="bulk-area-name">
            区画名（エリア）<span className="text-beni"> *</span>
          </Label>
          <Input
            id="bulk-area-name"
            value={form.areaName}
            onChange={set('areaName')}
            placeholder="例: C / 凛B / 納骨堂-天空"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="bulk-prefix">接頭辞（任意）</Label>
            <Input
              id="bulk-prefix"
              value={form.prefix}
              onChange={set('prefix')}
              placeholder="例: A-"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="bulk-start">
              開始番号<span className="text-beni"> *</span>
            </Label>
            <Input
              id="bulk-start"
              type="number"
              min={0}
              value={form.startNumber}
              onChange={set('startNumber')}
              placeholder="1"
            />
          </div>
          <div>
            <Label htmlFor="bulk-end">
              終了番号<span className="text-beni"> *</span>
            </Label>
            <Input
              id="bulk-end"
              type="number"
              min={0}
              value={form.endNumber}
              onChange={set('endNumber')}
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bulk-area-sqm">
            面積(㎡)<span className="text-beni"> *</span>
          </Label>
          <Input
            id="bulk-area-sqm"
            type="number"
            step="0.001"
            min={0}
            value={form.areaSqm}
            onChange={set('areaSqm')}
            placeholder="区画名を入れると既存区画の面積が入ります"
          />
          <p className="mt-1 text-xs text-hai">
            区画名によって実面積は大きく異なります（凛=0.013 / 納骨堂=0.09 / 通常=3.6）
          </p>
        </div>

        <div>
          <Label htmlFor="bulk-notes">備考（任意）</Label>
          <Input id="bulk-notes" value={form.notes} onChange={set('notes')} autoComplete="off" />
        </div>

        {/* 実行前に「何が何件できるか」を見せる。範囲の打ち間違いに気づけるように */}
        <div className="rounded-elegant border border-gin bg-kinari p-3">
          {hasValidRange ? (
            <>
              <p className="text-sm text-sumi">
                <span className="font-mono">{previewFirst}</span> 〜{' '}
                <span className="font-mono">{previewLast}</span> の{' '}
                <span className="font-semibold tabular-nums">{plannedCount}</span> 件を登録します
              </p>
              {plannedCount > BULK_MAX_COUNT && (
                <p className="mt-1 text-xs text-beni">
                  一度に登録できるのは{BULK_MAX_COUNT}件までです。範囲を分けてください
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-hai">開始番号と終了番号を入れると登録件数が出ます</p>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
