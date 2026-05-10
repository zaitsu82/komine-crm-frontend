'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  ListPaymentsQuery,
} from '@komine/types';
import {
  getPayments,
  createPayment as apiCreate,
  updatePayment as apiUpdate,
  deletePayment as apiDelete,
} from '@/lib/api/payments';
import { showSuccess, showApiError, showError } from '@/lib/toast';
import PageHeader from '@/components/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PaymentListTable } from './payment-list-table';
import { PaymentFormDialog } from './payment-form-dialog';

const PAGE_SIZE = 50;

const formatYen = (n: number): string => `¥${n.toLocaleString('ja-JP')}`;

export interface PaymentManagementProps {
  contractPlotId?: string;
  customerId?: string;
  /** 特定請求の入金一覧表示時 */
  billingId?: string;
  showHeader?: boolean;
}

type OrphanFilter = 'all' | 'orphan' | 'linked';

export default function PaymentManagement({
  contractPlotId,
  customerId,
  billingId,
  showHeader = true,
}: PaymentManagementProps) {
  const [items, setItems] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orphanFilter, setOrphanFilter] = useState<OrphanFilter>('all');

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const query: ListPaymentsQuery = {
      page,
      limit: PAGE_SIZE,
      contractPlotId,
      customerId,
      billingId,
      orphan: orphanFilter === 'orphan' ? true : orphanFilter === 'linked' ? false : undefined,
    };
    try {
      const res = await getPayments(query);
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
  }, [page, contractPlotId, customerId, billingId, orphanFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const stats = useMemo(() => {
    const totalAmount = items.reduce((s, p) => s + p.paymentAmount, 0);
    const orphanCount = items.filter((p) => !p.billingId).length;
    return { totalAmount, orphanCount };
  }, [items]);

  const handleSubmit = async (data: CreatePaymentRequest | UpdatePaymentRequest) => {
    setIsSaving(true);
    try {
      if (editing) {
        const res = await apiUpdate(editing.id, data as UpdatePaymentRequest);
        if (res.success) {
          showSuccess('入金を更新しました');
          setShowFormDialog(false);
          await fetchList();
        } else {
          showApiError('入金の更新', res.error?.message, res.error?.details);
        }
      } else {
        const res = await apiCreate(data as CreatePaymentRequest);
        if (res.success) {
          showSuccess('入金を登録しました');
          setShowFormDialog(false);
          await fetchList();
        } else {
          showApiError('入金の登録', res.error?.message, res.error?.details);
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
        showSuccess('入金を削除しました');
        setShowDeleteConfirm(false);
        setDeletingTarget(null);
        await fetchList();
      } else {
        showApiError('入金の削除', res.error?.message, res.error?.details);
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
          title="入金管理"
          subtitle="入金情報の一覧・登録・編集・削除"
          theme="ai"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-3 md:px-6 py-4">
            <StatCard label="表示中の入金合計" value={formatYen(stats.totalAmount)} theme="matsu" />
            <StatCard label="孤児入金" value={stats.orphanCount} theme="kohaku" />
            <StatCard label="表示件数" value={total} theme="ai" />
          </div>
        )}

        <div className="mx-3 md:mx-6 mb-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-hai whitespace-nowrap">紐付け:</label>
              <select
                value={orphanFilter}
                onChange={(e) => {
                  setOrphanFilter(e.target.value as OrphanFilter);
                  setPage(1);
                }}
                className="px-3 py-2 border border-gin rounded-elegant text-sm text-sumi bg-white focus:outline-none focus:ring-2 focus:ring-matsu"
              >
                <option value="all">すべて</option>
                <option value="linked">請求紐付け</option>
                <option value="orphan">孤児入金</option>
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
          <PaymentListTable
            items={items}
            isLoading={isLoading}
            hidePlotColumns={Boolean(contractPlotId)}
            onEdit={(p) => {
              setEditing(p);
              setShowFormDialog(true);
            }}
            onDelete={(p) => {
              setDeletingTarget(p);
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

      <PaymentFormDialog
        open={showFormDialog}
        editing={editing}
        presetBillingId={billingId}
        presetContractPlotId={contractPlotId}
        presetCustomerId={customerId}
        onClose={() => setShowFormDialog(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(o) => {
          setShowDeleteConfirm(o);
          if (!o) setDeletingTarget(null);
        }}
        title="入金の削除"
        description={`この入金を削除しますか？${
          deletingTarget?.billingId ? '紐付く請求の入金集計が再計算されます。' : ''
        }${isDeleting ? '\n削除中...' : ''}`}
        confirmLabel="削除"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
