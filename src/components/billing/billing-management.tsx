'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Billing,
  BillingCategory,
  BillingRecordStatus,
  CreateBillingRequest,
  UpdateBillingRequest,
  ListBillingsQuery,
} from '@komine/types';
import {
  getBillings,
  createBilling as apiCreate,
  updateBilling as apiUpdate,
  deleteBilling as apiDelete,
  BILLING_CATEGORY_LABELS,
  BILLING_RECORD_STATUS_LABELS,
} from '@/lib/api/billings';
import { showSuccess, showApiError, showError } from '@/lib/toast';
import PageHeader from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BillingListTable } from './billing-list-table';
import { BillingFormDialog } from './billing-form-dialog';
import { BillingDetailDialog } from './billing-detail-dialog';

const PAGE_SIZE = 50;

const formatYen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

export interface BillingManagementProps {
  /** 区画コンテキストで埋め込む場合の絞り込み */
  contractPlotId?: string;
  /** 区画コンテキストでの請求作成時の顧客プリセット */
  customerId?: string;
  /** ページヘッダを表示するか（埋め込み時は false） */
  showHeader?: boolean;
  /** 一覧が空のときに表示する文脈付き空状態（#171）。未指定時は既定メッセージ */
  emptyState?: ReactNode;
}

export default function BillingManagement({
  contractPlotId,
  customerId,
  showHeader = true,
  emptyState,
}: BillingManagementProps) {
  const [items, setItems] = useState<Billing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<BillingCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BillingRecordStatus | 'all'>('all');

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editing, setEditing] = useState<Billing | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [detailId, setDetailId] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<Billing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const query: ListBillingsQuery = {
      page,
      limit: PAGE_SIZE,
      contractPlotId,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    };
    try {
      const res = await getBillings(query);
      if (res.success) {
        setItems(res.data.items);
        setTotal(res.data.pagination.totalCount);
      } else {
        setError(res.error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [page, contractPlotId, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const stats = useMemo(() => {
    const totalAmount = items.reduce((s, b) => s + b.amount, 0);
    const paidAmount = items.reduce((s, b) => s + b.paidAmount, 0);
    const unpaidAmount = totalAmount - paidAmount;
    const overdueCount = items.filter((b) => b.status === 'overdue').length;
    return { totalAmount, paidAmount, unpaidAmount, overdueCount };
  }, [items]);

  const handleSubmit = async (data: CreateBillingRequest | UpdateBillingRequest) => {
    setIsSaving(true);
    try {
      if (editing) {
        const res = await apiUpdate(editing.id, data as UpdateBillingRequest);
        if (res.success) {
          showSuccess('請求を更新しました');
          setShowFormDialog(false);
          await fetchList();
        } else {
          showApiError('請求の更新', res.error?.message, res.error?.details);
        }
      } else {
        const res = await apiCreate(data as CreateBillingRequest);
        if (res.success) {
          showSuccess('請求を登録しました');
          setShowFormDialog(false);
          await fetchList();
        } else {
          showApiError('請求の登録', res.error?.message, res.error?.details);
        }
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setIsDeleting(true);
    try {
      const res = await apiDelete(deletingTarget.id);
      if (res.success) {
        showSuccess('請求を削除しました');
        setShowDeleteConfirm(false);
        setDeletingTarget(null);
        await fetchList();
      } else {
        showApiError('請求の削除', res.error?.message, res.error?.details);
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-shiro">
      {showHeader && (
        <PageHeader
          title="請求管理"
          subtitle="請求情報の一覧・登録・編集・削除"
          theme="matsu"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      )}

      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-end gap-2 px-3 md:px-6 py-3 border-b border-gin bg-kinari">
          <button
            onClick={() => {
              setEditing(null);
              setShowFormDialog(true);
            }}
            className="inline-flex items-center bg-matsu text-white hover:bg-matsu-dark rounded-elegant px-3 py-1.5 shadow-elegant-sm text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </button>
        </div>

        {showHeader && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-3 md:px-6 py-4">
            <StatCard label="請求総額" value={formatYen(stats.totalAmount)} theme="sumi" />
            <StatCard label="入金済" value={formatYen(stats.paidAmount)} theme="matsu" />
            <StatCard label="未入金" value={formatYen(stats.unpaidAmount)} theme="kohaku" />
            <StatCard label="延滞件数" value={stats.overdueCount} theme="beni" />
          </div>
        )}

        <div className="mx-3 md:mx-6 mb-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-hai whitespace-nowrap">料金区分:</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as BillingCategory | 'all');
                  setPage(1);
                }}
                className="px-3 py-2 border border-gin rounded-elegant text-sm text-sumi bg-white focus:outline-none focus:ring-2 focus:ring-matsu"
              >
                <option value="all">すべて</option>
                {(Object.values(BillingCategory) as BillingCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {BILLING_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-hai whitespace-nowrap">ステータス:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as BillingRecordStatus | 'all');
                  setPage(1);
                }}
                className="px-3 py-2 border border-gin rounded-elegant text-sm text-sumi bg-white focus:outline-none focus:ring-2 focus:ring-matsu"
              >
                <option value="all">すべて</option>
                {(Object.values(BillingRecordStatus) as BillingRecordStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {BILLING_RECORD_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-hai sm:ml-auto">{total} 件</p>
          </div>
        </div>

        {error && (
          <div className="mx-3 md:mx-6 mb-4 p-4 bg-beni-50 border border-beni-200 text-beni rounded-elegant-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchList}
              className="border border-beni text-beni hover:bg-beni-100 rounded-elegant px-3 py-1.5 text-sm font-medium ml-4"
            >
              再試行
            </button>
          </div>
        )}

        <div className="mx-3 md:mx-6 mb-6 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
          <BillingListTable
            items={items}
            isLoading={isLoading}
            hidePlotColumns={Boolean(contractPlotId)}
            emptyState={emptyState}
            onView={(b) => setDetailId(b.id)}
            onEdit={(b) => {
              setEditing(b);
              setShowFormDialog(true);
            }}
            onDelete={(b) => {
              setDeletingTarget(b);
              setShowDeleteConfirm(true);
            }}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gin bg-kinari">
              <p className="text-sm text-hai">
                {page} / {totalPages} ページ
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="border border-gin text-sumi hover:bg-white rounded-elegant px-3 py-1 text-sm disabled:opacity-50"
                >
                  前へ
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="border border-gin text-sumi hover:bg-white rounded-elegant px-3 py-1 text-sm disabled:opacity-50"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BillingFormDialog
        open={showFormDialog}
        editing={editing}
        presetContractPlotId={contractPlotId}
        presetCustomerId={customerId}
        onClose={() => setShowFormDialog(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />

      <BillingDetailDialog
        open={detailId !== null}
        billingId={detailId}
        onClose={() => setDetailId(null)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(o) => {
          setShowDeleteConfirm(o);
          if (!o) setDeletingTarget(null);
        }}
        title="請求の削除"
        description={`この請求を削除しますか？紐付く入金は保持され、請求との紐付けは外れます。${
          isDeleting ? '\n削除中...' : ''
        }`}
        confirmLabel="削除"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
