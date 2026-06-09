'use client';

import { Payment } from '@komine/types';
import { BILLING_CATEGORY_LABELS } from '@/lib/api/billings';
import { LegacyAwareValue } from '@/components/legacy-aware-value';
import { formatFeeType } from '@/lib/legacy-sentinels';

const formatYen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

export interface PaymentListTableProps {
  items: Payment[];
  isLoading?: boolean;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  /** 区画コンテキストでは plot 情報を非表示 */
  hidePlotColumns?: boolean;
}

export function PaymentListTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  hidePlotColumns = false,
}: PaymentListTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-hai">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matsu mx-auto mb-4" />
        <p className="text-sm">読み込み中...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-hai">
        <p className="text-sm">入金データがありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-kinari border-b border-gin">
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi">入金日</th>
            <th className="px-2 md:px-4 py-3 text-right text-sm font-semibold text-sumi">入金額</th>
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden md:table-cell">
              紐付け
            </th>
            {!hidePlotColumns && (
              <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden lg:table-cell">
                区画
              </th>
            )}
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden sm:table-cell">
              顧客
            </th>
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden lg:table-cell">
              料金種別
            </th>
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden lg:table-cell">
              担当
            </th>
            {(onEdit || onDelete) && (
              <th className="px-2 md:px-4 py-3 text-center text-sm font-semibold text-sumi">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-gin hover:bg-kinari transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-shiro'
              }`}
            >
              <td className="px-2 md:px-4 py-3 text-sm text-sumi tabular-nums">
                {p.paymentDate ?? p.scheduledDate ?? '-'}
                {p.scheduledDate && !p.paymentDate && (
                  <span className="text-xs text-kohaku ml-1">予定</span>
                )}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm text-right text-sumi tabular-nums">
                {formatYen(p.paymentAmount)}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm hidden md:table-cell">
                {p.billing ? (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-matsu-50 text-matsu-dark">
                    請求紐付 ({BILLING_CATEGORY_LABELS[p.billing.category]})
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-hai-50 text-hai">
                    孤児入金
                  </span>
                )}
              </td>
              {!hidePlotColumns && (
                <td className="px-2 md:px-4 py-3 text-sm text-sumi hidden lg:table-cell">
                  {/* displayNumber 優先・legacy-* 等は「整備中」ミュート表示 #283 */}
                  <LegacyAwareValue value={p.displayNumber || p.plotNumber} kind="plotNumber" emptyText="-" />
                </td>
              )}
              <td className="px-2 md:px-4 py-3 text-sm text-sumi hidden sm:table-cell">
                {p.customer?.name ?? '-'}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm text-hai hidden lg:table-cell">
                {formatFeeType(p.feeType)}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm text-hai hidden lg:table-cell">
                {p.staffInCharge ?? '-'}
              </td>
              {(onEdit || onDelete) && (
                <td className="px-2 md:px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(p)}
                        className="border border-gin text-sumi hover:bg-kinari rounded-elegant px-3 py-1 text-xs font-medium"
                      >
                        編集
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(p)}
                        className="border border-beni text-beni hover:bg-beni-50 rounded-elegant px-3 py-1 text-xs font-medium"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
