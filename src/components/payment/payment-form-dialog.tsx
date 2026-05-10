'use client';

import { useEffect, useState } from 'react';
import {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '@komine/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface PaymentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest | UpdatePaymentRequest) => Promise<void>;
  editing?: Payment | null;
  /** 請求詳細から開いた場合のプリセット */
  presetBillingId?: string;
  presetContractPlotId?: string;
  presetCustomerId?: string;
  isSubmitting?: boolean;
}

interface FormState {
  billingId: string;
  customerId: string;
  contractPlotId: string;
  scheduledDate: string;
  scheduledAmount: string;
  paymentDate: string;
  paymentAmount: string;
  feeType: string;
  applicationType: string;
  billingType: string;
  staffInCharge: string;
  notes: string;
}

const emptyState = (preset?: {
  billingId?: string;
  contractPlotId?: string;
  customerId?: string;
}): FormState => ({
  billingId: preset?.billingId ?? '',
  customerId: preset?.customerId ?? '',
  contractPlotId: preset?.contractPlotId ?? '',
  scheduledDate: '',
  scheduledAmount: '',
  paymentDate: '',
  paymentAmount: '0',
  feeType: '',
  applicationType: '',
  billingType: '',
  staffInCharge: '',
  notes: '',
});

const fromPayment = (p: Payment): FormState => ({
  billingId: p.billingId ?? '',
  customerId: p.customerId ?? '',
  contractPlotId: p.contractPlotId ?? '',
  scheduledDate: p.scheduledDate ?? '',
  scheduledAmount: p.scheduledAmount?.toString() ?? '',
  paymentDate: p.paymentDate ?? '',
  paymentAmount: String(p.paymentAmount),
  feeType: p.feeType ?? '',
  applicationType: p.applicationType?.toString() ?? '',
  billingType: p.billingType?.toString() ?? '',
  staffInCharge: p.staffInCharge ?? '',
  notes: p.notes ?? '',
});

const parseIntOrNull = (s: string): number | null => {
  const t = s.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
};

const trimOrNull = (s: string): string | null => (s.trim() ? s.trim() : null);

export function PaymentFormDialog({
  open,
  onClose,
  onSubmit,
  editing,
  presetBillingId,
  presetContractPlotId,
  presetCustomerId,
  isSubmitting = false,
}: PaymentFormDialogProps) {
  const [state, setState] = useState<FormState>(() =>
    editing
      ? fromPayment(editing)
      : emptyState({
          billingId: presetBillingId,
          contractPlotId: presetContractPlotId,
          customerId: presetCustomerId,
        })
  );
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setState(
        editing
          ? fromPayment(editing)
          : emptyState({
              billingId: presetBillingId,
              contractPlotId: presetContractPlotId,
              customerId: presetCustomerId,
            })
      );
      setFormError('');
    }
  }, [open, editing, presetBillingId, presetContractPlotId, presetCustomerId]);

  if (!open) return null;

  const isEdit = Boolean(editing);

  const handleSubmit = async () => {
    if (!state.billingId.trim() && !state.customerId.trim() && !state.contractPlotId.trim()) {
      setFormError('請求 ID・顧客 ID・契約区画 ID のいずれかは必須です');
      return;
    }
    const amountNum = parseIntOrNull(state.paymentAmount);
    if (amountNum === null || amountNum < 0) {
      setFormError('入金額は 0 円以上の整数で入力してください');
      return;
    }
    setFormError('');

    const common = {
      billingId: trimOrNull(state.billingId),
      customerId: trimOrNull(state.customerId),
      contractPlotId: trimOrNull(state.contractPlotId),
      scheduledDate: trimOrNull(state.scheduledDate),
      scheduledAmount: parseIntOrNull(state.scheduledAmount),
      paymentDate: trimOrNull(state.paymentDate),
      feeType: trimOrNull(state.feeType),
      applicationType: parseIntOrNull(state.applicationType),
      billingType: parseIntOrNull(state.billingType),
      staffInCharge: trimOrNull(state.staffInCharge),
      notes: trimOrNull(state.notes),
    };

    const data: CreatePaymentRequest | UpdatePaymentRequest = {
      ...common,
      paymentAmount: amountNum,
    };

    try {
      await onSubmit(data);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '保存に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-ai-50 to-kinari px-6 py-4 border-b border-gin">
          <h3 className="font-mincho text-lg font-semibold text-sumi">
            {isEdit ? '入金編集' : '入金登録'}
          </h3>
          <p className="text-sm text-hai mt-0.5">
            {isEdit ? '入金情報を編集します' : '新しい入金を登録します'}
          </p>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {formError && (
            <div className="mb-4 p-3 bg-beni-50 border border-beni-200 text-beni text-sm rounded-elegant">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-kinari rounded-elegant p-3 text-xs text-hai">
              請求紐付け <strong>または</strong> 顧客/区画紐付けのいずれかが必須です（両方可）。
            </div>

            <div>
              <Label className="block mb-1.5 text-sm font-medium text-sumi">請求 ID</Label>
              <Input
                value={state.billingId}
                onChange={(e) => setState({ ...state, billingId: e.target.value })}
                placeholder="UUID（任意）"
                disabled={Boolean(presetBillingId)}
                className="border-gin focus:ring-matsu focus:border-matsu font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">顧客 ID</Label>
                <Input
                  value={state.customerId}
                  onChange={(e) => setState({ ...state, customerId: e.target.value })}
                  placeholder="UUID（任意）"
                  disabled={Boolean(presetCustomerId)}
                  className="border-gin focus:ring-matsu focus:border-matsu font-mono text-xs"
                />
              </div>
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">契約区画 ID</Label>
                <Input
                  value={state.contractPlotId}
                  onChange={(e) => setState({ ...state, contractPlotId: e.target.value })}
                  placeholder="UUID（任意）"
                  disabled={Boolean(presetContractPlotId)}
                  className="border-gin focus:ring-matsu focus:border-matsu font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">入金日</Label>
                <Input
                  type="date"
                  value={state.paymentDate}
                  onChange={(e) => setState({ ...state, paymentDate: e.target.value })}
                  className="border-gin focus:ring-matsu focus:border-matsu"
                />
              </div>
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">
                  入金額（円） <span className="text-beni">*</span>
                </Label>
                <Input
                  type="number"
                  value={state.paymentAmount}
                  onChange={(e) => setState({ ...state, paymentAmount: e.target.value })}
                  className="border-gin focus:ring-matsu focus:border-matsu tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">入金予定日</Label>
                <Input
                  type="date"
                  value={state.scheduledDate}
                  onChange={(e) => setState({ ...state, scheduledDate: e.target.value })}
                  className="border-gin focus:ring-matsu focus:border-matsu"
                />
              </div>
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">入金予定額</Label>
                <Input
                  type="number"
                  value={state.scheduledAmount}
                  onChange={(e) => setState({ ...state, scheduledAmount: e.target.value })}
                  className="border-gin focus:ring-matsu focus:border-matsu tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">料金種別</Label>
                <Input
                  value={state.feeType}
                  onChange={(e) => setState({ ...state, feeType: e.target.value })}
                  placeholder="自由記述"
                  className="border-gin focus:ring-matsu focus:border-matsu"
                />
              </div>
              <div>
                <Label className="block mb-1.5 text-sm font-medium text-sumi">担当者</Label>
                <Input
                  value={state.staffInCharge}
                  onChange={(e) => setState({ ...state, staffInCharge: e.target.value })}
                  placeholder="氏名等"
                  className="border-gin focus:ring-matsu focus:border-matsu"
                />
              </div>
            </div>

            <div>
              <Label className="block mb-1.5 text-sm font-medium text-sumi">備考</Label>
              <textarea
                value={state.notes}
                onChange={(e) => setState({ ...state, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gin rounded-elegant bg-white text-sumi focus:outline-none focus:ring-2 focus:ring-matsu"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gin bg-kinari">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="border border-gin text-sumi hover:bg-white rounded-elegant px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-matsu text-white hover:bg-matsu-dark rounded-elegant px-4 py-2 shadow-elegant-sm text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? '保存中...' : isEdit ? '更新' : '登録'}
          </button>
        </div>
      </div>
    </div>
  );
}
