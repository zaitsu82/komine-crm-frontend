'use client';

import { useEffect, useState } from 'react';
import { BillingDetailResponse } from '@komine/types';
import { getBillingById, BILLING_CATEGORY_LABELS, BILLING_RECORD_STATUS_LABELS } from '@/lib/api/billings';
import { LegacyAwareValue } from '@/components/legacy-aware-value';
import { formatFeeType } from '@/lib/legacy-sentinels';

const formatYen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

export interface BillingDetailDialogProps {
  open: boolean;
  billingId: string | null;
  onClose: () => void;
}

export function BillingDetailDialog({ open, billingId, onClose }: BillingDetailDialogProps) {
  const [data, setData] = useState<BillingDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !billingId) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getBillingById(billingId)
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.error?.message ?? '取得に失敗しました');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'エラーが発生しました'))
      .finally(() => setLoading(false));
  }, [open, billingId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-ai-50 to-kinari px-6 py-4 border-b border-gin flex items-center justify-between">
          <div>
            <h3 className="font-mincho text-lg font-semibold text-sumi">請求詳細</h3>
            <p className="text-sm text-hai mt-0.5">関連する入金履歴を含む</p>
          </div>
          <button
            onClick={onClose}
            className="text-hai hover:text-sumi"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-hai">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-matsu mx-auto mb-3" />
              読み込み中...
            </div>
          )}
          {error && (
            <div className="p-3 bg-beni-50 border border-beni-200 text-beni text-sm rounded-elegant">
              {error}
            </div>
          )}
          {data && <BillingDetailBody billing={data} />}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gin bg-kinari">
          <button
            onClick={onClose}
            className="border border-gin text-sumi hover:bg-white rounded-elegant px-4 py-2 text-sm font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingDetailBody({ billing }: { billing: BillingDetailResponse }) {
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 border-b border-gin last:border-b-0">
      <div className="text-xs text-hai sm:w-32 flex-shrink-0">{label}</div>
      <div className="text-sm text-sumi flex-1">{value || '-'}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-sm font-semibold text-sumi mb-2 font-mincho">基本情報</h4>
        <div className="bg-kinari rounded-elegant-lg p-4">
          <Row label="料金区分" value={BILLING_CATEGORY_LABELS[billing.category]} />
          <Row
            label="ステータス"
            value={
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gin">
                {BILLING_RECORD_STATUS_LABELS[billing.status]}
              </span>
            }
          />
          {/* Row.value は React.ReactNode のため LegacyAwareValue を使用。displayNumber 優先・legacy-* 等は「整備中」ミュート表示 #283 */}
          <Row
            label="区画"
            value={
              billing.displayNumber || billing.plotNumber ? (
                <>
                  <LegacyAwareValue value={billing.displayNumber || billing.plotNumber} kind="plotNumber" /> ({billing.areaName ?? ''})
                </>
              ) : (
                '-'
              )
            }
          />
          <Row label="顧客" value={billing.customer?.name ?? '-'} />
          <Row label="金額" value={<span className="tabular-nums">¥{billing.amount.toLocaleString('ja-JP')}</span>} />
          <Row label="入金済" value={<span className="tabular-nums">¥{billing.paidAmount.toLocaleString('ja-JP')}</span>} />
          <Row label="残額" value={<span className="tabular-nums">¥{(billing.amount - billing.paidAmount).toLocaleString('ja-JP')}</span>} />
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-sumi mb-2 font-mincho">日付・期間</h4>
        <div className="bg-kinari rounded-elegant-lg p-4">
          <Row label="契約日" value={billing.contractDate} />
          <Row label="請求日" value={billing.billingDate} />
          <Row label="最終入金日" value={billing.lastPaymentDate} />
          <Row label="使用開始年" value={billing.useStartYear} />
          <Row label="使用終了年" value={billing.useEndYear} />
          <Row label="対象月" value={billing.targetMonth} />
          <Row label="請求年数" value={billing.billingYears} />
          {billing.terminated && (
            <Row label="解約日" value={billing.terminatedDate} />
          )}
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-sumi mb-2 font-mincho">入金履歴 ({billing.payments.length}件)</h4>
        {billing.payments.length === 0 ? (
          <div className="bg-kinari rounded-elegant-lg p-4 text-sm text-hai text-center">
            入金履歴はありません
          </div>
        ) : (
          <div className="bg-kinari rounded-elegant-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-shiro border-b border-gin">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-sumi">入金日</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-sumi">入金額</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-sumi hidden sm:table-cell">担当者</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-sumi hidden md:table-cell">料金種別</th>
                </tr>
              </thead>
              <tbody>
                {billing.payments.map((p) => (
                  <tr key={p.id} className="border-b border-gin last:border-b-0">
                    <td className="px-3 py-2 text-sm text-sumi tabular-nums">{p.paymentDate ?? p.scheduledDate ?? '-'}</td>
                    <td className="px-3 py-2 text-sm text-right text-sumi tabular-nums">{formatYen(p.paymentAmount)}</td>
                    <td className="px-3 py-2 text-sm text-hai hidden sm:table-cell">{p.staffInCharge ?? '-'}</td>
                    <td className="px-3 py-2 text-sm text-hai hidden md:table-cell">{formatFeeType(p.feeType)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {billing.notes && (
        <section>
          <h4 className="text-sm font-semibold text-sumi mb-2 font-mincho">備考</h4>
          <div className="bg-kinari rounded-elegant-lg p-4 text-sm text-sumi whitespace-pre-wrap">
            {billing.notes}
          </div>
        </section>
      )}

      <div className="text-xs text-hai pt-2 border-t border-gin">
        作成: {new Date(billing.createdAt).toLocaleString('ja-JP')} / 更新: {new Date(billing.updatedAt).toLocaleString('ja-JP')}
        {billing.legacySeikyuCd != null && (
          <span className="ml-2">/ legacy seikyu_cd: {billing.legacySeikyuCd}</span>
        )}
      </div>
    </div>
  );
}
