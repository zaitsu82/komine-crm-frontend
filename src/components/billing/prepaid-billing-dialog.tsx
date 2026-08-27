'use client';

import { useEffect, useState } from 'react';
import type { PrepaidBillingPreviewResponse } from '@komine/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPrepaidBilling, previewPrepaidBilling } from '@/lib/api/billings';
import { showApiError, showSuccess } from '@/lib/toast';

export interface PrepaidBillingDialogProps {
  open: boolean;
  contractPlotId: string;
  onClose: () => void;
  /** 登録が成功したときに呼ばれる（一覧の再取得用） */
  onCreated: () => void;
}

/**
 * 入金日の既定値。
 *
 * `toISOString()` は UTC なので、JST の午前 0〜9 時に開くと前日になる。
 * 窓口の始業時刻に直撃し、30 件の入金レコードが黙って前日付で作られるため、
 * ローカル日付から組み立てる。
 */
const today = (): string => {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const parseIntOrNull = (s: string): number | null => {
  const t = s.trim();
  if (!t) return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
};

const formatYen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

/**
 * 前受金の一括登録ダイアログ（#6）
 *
 * 受領額と年数を入力 → 確認で年ごとの内訳を出す → 登録、の2段階にしている。
 * 30年分の請求と入金が一度に作られるため、何年分がいくらで起票されるかを
 * 窓口で目視してから確定させる。
 */
export function PrepaidBillingDialog({
  open,
  contractPlotId,
  onClose,
  onCreated,
}: PrepaidBillingDialogProps) {
  const [receivedAmount, setReceivedAmount] = useState('');
  const [years, setYears] = useState('');
  const [startYear, setStartYear] = useState('');
  const [paymentDate, setPaymentDate] = useState(today);
  const [preview, setPreview] = useState<PrepaidBillingPreviewResponse | null>(null);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setReceivedAmount('');
      setYears('');
      setStartYear('');
      setPaymentDate(today());
      setPreview(null);
      setFormError('');
    }
  }, [open]);

  if (!open) return null;

  // 入力を変えたら確認をやり直させる。古いプレビューのまま登録させない
  const invalidatePreview = () => {
    setPreview(null);
    setFormError('');
  };

  const handlePreview = async () => {
    const amount = parseIntOrNull(receivedAmount);
    const yearCount = parseIntOrNull(years);
    if (amount === null || amount <= 0) {
      setFormError('受領額は1円以上の整数で入力してください');
      return;
    }
    if (yearCount === null || yearCount < 1 || yearCount > 100) {
      setFormError('年数は1〜100の整数で入力してください');
      return;
    }
    setFormError('');
    setIsLoading(true);
    try {
      const res = await previewPrepaidBilling({
        contractPlotId,
        receivedAmount: amount,
        years: yearCount,
        startYear: parseIntOrNull(startYear),
      });
      if (!res.success) {
        showApiError('内訳の取得', res.error.message, res.error.details);
        return;
      }
      setPreview(res.data);
      // 推定結果を入力欄へ反映し、登録時に同じ年が使われることを見せる
      if (!startYear.trim()) setStartYear(String(res.data.startYear));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;
    const amount = parseIntOrNull(receivedAmount);
    const yearCount = parseIntOrNull(years);
    if (amount === null || yearCount === null) return;

    setIsSaving(true);
    try {
      const res = await createPrepaidBilling({
        contractPlotId,
        receivedAmount: amount,
        years: yearCount,
        startYear: preview.startYear,
        paymentDate,
      });
      if (!res.success) {
        showApiError('前受金の登録', res.error.message, res.error.details);
        return;
      }
      showSuccess(`前受金を登録しました（請求${res.data.billingCount}件）`);
      onCreated();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const hasDuplicates = (preview?.duplicatedYears.length ?? 0) > 0;
  const canSubmit = Boolean(preview) && !hasDuplicates && !isSaving;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-matsu-50 to-kinari px-6 py-4 border-b border-gin">
          <h3 className="font-mincho text-lg font-semibold text-sumi">前受金の一括登録</h3>
          <p className="text-sm text-hai mt-0.5">
            受領額と年数から、年ごとの請求と入金をまとめて起票します
          </p>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {formError && (
            <div className="mb-4 p-3 bg-beni-50 border border-beni-200 text-beni text-sm rounded-elegant">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prepaid-amount" className="block mb-1.5 text-sm font-medium text-sumi">
                受領額 <span className="text-beni">*</span>
              </Label>
              <Input
                id="prepaid-amount"
                inputMode="numeric"
                value={receivedAmount}
                onChange={(e) => {
                  setReceivedAmount(e.target.value);
                  invalidatePreview();
                }}
                placeholder="300000"
                className="border-gin focus:ring-matsu focus:border-matsu"
              />
            </div>
            <div>
              <Label htmlFor="prepaid-years" className="block mb-1.5 text-sm font-medium text-sumi">
                年数 <span className="text-beni">*</span>
              </Label>
              <Input
                id="prepaid-years"
                inputMode="numeric"
                value={years}
                onChange={(e) => {
                  setYears(e.target.value);
                  invalidatePreview();
                }}
                placeholder="30"
                className="border-gin focus:ring-matsu focus:border-matsu"
              />
            </div>
            <div>
              <Label htmlFor="prepaid-start-year" className="block mb-1.5 text-sm font-medium text-sumi">
                開始年
              </Label>
              <Input
                id="prepaid-start-year"
                inputMode="numeric"
                value={startYear}
                onChange={(e) => {
                  setStartYear(e.target.value);
                  invalidatePreview();
                }}
                placeholder="未入力なら既存請求から推定"
                className="border-gin focus:ring-matsu focus:border-matsu"
              />
            </div>
            <div>
              <Label htmlFor="prepaid-payment-date" className="block mb-1.5 text-sm font-medium text-sumi">
                入金日 <span className="text-beni">*</span>
              </Label>
              <Input
                id="prepaid-payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="border-gin focus:ring-matsu focus:border-matsu"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handlePreview}
              disabled={isLoading || isSaving}
              className="inline-flex items-center border border-matsu text-matsu hover:bg-matsu-50 disabled:opacity-50 rounded-elegant px-3 py-1.5 text-sm font-medium"
            >
              確認
            </button>
          </div>

          {preview && (
            <div className="mt-4 space-y-3">
              {preview.startYearEstimated === false && (
                <div role="alert" className="p-3 bg-kohaku-50 border border-kohaku-200 text-sm text-sumi rounded-elegant">
                  既存請求から開始年を推定できません。開始年を入力してください。
                </div>
              )}

              {hasDuplicates && (
                <div role="alert" className="p-3 bg-beni-50 border border-beni-200 text-sm text-beni rounded-elegant">
                  既に請求がある年が含まれています（{preview.duplicatedYears.join('、')}年）。
                  開始年か年数を調整してください。
                </div>
              )}

              {preview.needsReviewYears.length > 0 && (
                <div role="alert" className="p-3 bg-kohaku-50 border border-kohaku-200 text-sm text-sumi rounded-elegant">
                  年が入っていない既存請求があるため、請求済みか判定できない年があります（
                  {preview.needsReviewYears.join('、')}年）。
                  既存の請求を確認してから登録してください。
                </div>
              )}

              {preview.difference !== null && preview.difference !== 0 && (
                <div className="p-3 bg-cha-50 border border-cha-200 text-sm text-sumi rounded-elegant">
                  年額との差額 {formatYen(preview.difference)}
                  （年額 {preview.annualFee === null ? '不明' : formatYen(preview.annualFee)}）
                </div>
              )}

              <div className="border border-gin rounded-elegant overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr
                        key={row.year}
                        className={`border-b border-gin last:border-0 ${row.duplicated ? 'bg-beni-50' : ''}`}
                      >
                        <td className="px-3 py-1.5 text-sumi">{row.year}年</td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-sumi">
                          {formatYen(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gin flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-hai hover:text-sumi rounded-elegant"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-matsu text-white hover:bg-matsu-dark disabled:opacity-50 rounded-elegant px-4 py-2 text-sm font-medium"
          >
            登録
          </button>
        </div>
      </div>
    </div>
  );
}
