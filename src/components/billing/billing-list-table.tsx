'use client';

import type { ReactNode } from 'react';
import { Billing } from '@komine/types';
import { BILLING_CATEGORY_LABELS, BILLING_RECORD_STATUS_LABELS } from '@/lib/api/billings';
import { LegacyAwareValue } from '@/components/legacy-aware-value';

const formatYen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

const statusBadgeClass = (status: Billing['status']): string => {
  switch (status) {
    case 'paid':
      return 'bg-matsu-50 text-matsu-dark';
    case 'partial_paid':
    case 'billed':
      return 'bg-ai-50 text-ai-dark';
    case 'pending':
      return 'bg-kohaku-50 text-kohaku-dark';
    case 'overdue':
      return 'bg-beni-50 text-beni-dark';
    case 'terminated':
    case 'written_off':
      return 'bg-hai-50 text-hai';
    default:
      return 'bg-hai-50 text-hai';
  }
};

export interface BillingListTableProps {
  items: Billing[];
  isLoading?: boolean;
  onEdit?: (billing: Billing) => void;
  onDelete?: (billing: Billing) => void;
  onView?: (billing: Billing) => void;
  /** 区画コンテキストで表示するときは true → 区画情報カラムを非表示 */
  hidePlotColumns?: boolean;
  /** 一覧が空のときに表示するノード（未指定時は既定メッセージ）。#171 で文脈付き説明を差し込む用 */
  emptyState?: ReactNode;
}

export function BillingListTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  onView,
  hidePlotColumns = false,
  emptyState,
}: BillingListTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-hai">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matsu mx-auto mb-4" />
        <p className="text-sm">読み込み中...</p>
      </div>
    );
  }

  if (items.length === 0) {
    if (emptyState) {
      return <div className="p-4 md:p-6">{emptyState}</div>;
    }
    return (
      <div className="p-12 text-center text-hai">
        <p className="text-sm">請求データがありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-kinari border-b border-gin">
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi">
              料金区分
            </th>
            {!hidePlotColumns && (
              <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden md:table-cell">
                区画
              </th>
            )}
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden sm:table-cell">
              顧客
            </th>
            <th className="px-2 md:px-4 py-3 text-right text-sm font-semibold text-sumi">
              金額
            </th>
            <th className="px-2 md:px-4 py-3 text-right text-sm font-semibold text-sumi hidden lg:table-cell">
              入金済
            </th>
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi hidden md:table-cell">
              請求日
            </th>
            <th className="px-2 md:px-4 py-3 text-left text-sm font-semibold text-sumi">
              ステータス
            </th>
            {(onEdit || onDelete || onView) && (
              <th className="px-2 md:px-4 py-3 text-center text-sm font-semibold text-sumi">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((b, i) => (
            <tr
              key={b.id}
              className={`border-b border-gin hover:bg-kinari transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-shiro'
              } ${b.terminated ? 'opacity-60' : ''}`}
            >
              <td className="px-2 md:px-4 py-3 text-sm text-sumi">
                {BILLING_CATEGORY_LABELS[b.category]}
              </td>
              {!hidePlotColumns && (
                <td className="px-2 md:px-4 py-3 text-sm text-sumi hidden md:table-cell">
                  {/* displayNumber 優先・legacy-* 等は「整備中」ミュート表示 #283 */}
                  <LegacyAwareValue value={b.displayNumber || b.plotNumber} kind="plotNumber" emptyText="-" />
                  {b.areaName && (
                    <span className="text-xs text-hai ml-1">({b.areaName})</span>
                  )}
                </td>
              )}
              <td className="px-2 md:px-4 py-3 text-sm text-sumi hidden sm:table-cell">
                {b.customer?.name ?? '-'}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm text-right text-sumi tabular-nums">
                {formatYen(b.amount)}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm text-right text-sumi hidden lg:table-cell tabular-nums">
                {formatYen(b.paidAmount)}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm text-hai hidden md:table-cell tabular-nums">
                {b.billingDate ?? '-'}
              </td>
              <td className="px-2 md:px-4 py-3 text-sm">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(
                    b.status
                  )}`}
                >
                  {BILLING_RECORD_STATUS_LABELS[b.status]}
                </span>
              </td>
              {(onEdit || onDelete || onView) && (
                <td className="px-2 md:px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {onView && (
                      <button
                        onClick={() => onView(b)}
                        className="border border-ai text-ai hover:bg-ai-50 rounded-elegant px-3 py-1 text-xs font-medium"
                      >
                        詳細
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(b)}
                        className="border border-gin text-sumi hover:bg-kinari rounded-elegant px-3 py-1 text-xs font-medium"
                      >
                        編集
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(b)}
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
