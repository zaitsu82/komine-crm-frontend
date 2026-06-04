/**
 * 請求 (Billing) API
 *
 * バックエンド `/api/v1/billings` への CRUD クライアント。
 * 型は @komine/types から直接利用する。
 */

import {
  Billing,
  BillingDetailResponse,
  BillingsListResponse,
  CreateBillingRequest,
  UpdateBillingRequest,
  ListBillingsQuery,
  DeleteBillingResponse,
  BillingSummaryQuery,
  BillingSummaryResponse,
  BillingCategory,
  BillingRecordStatus,
} from '@komine/types';
import { apiDelete, apiGet, apiPost, apiPut } from './client';
import { ApiResponse } from './types';

const BASE = '/billings';

const queryToParams = (
  q?: ListBillingsQuery
): Record<string, string | number | undefined> | undefined => {
  if (!q) return undefined;
  return {
    page: q.page,
    limit: q.limit,
    contractPlotId: q.contractPlotId,
    customerId: q.customerId,
    category: q.category,
    status: q.status,
    billingDateFrom: q.billingDateFrom,
    billingDateTo: q.billingDateTo,
    sortBy: q.sortBy,
    sortOrder: q.sortOrder,
  };
};

export function getBillings(
  query?: ListBillingsQuery
): Promise<ApiResponse<BillingsListResponse>> {
  return apiGet<BillingsListResponse>(BASE, queryToParams(query));
}

/**
 * 請求サマリー集計取得（フィルタ一致の全件集計）
 *
 * 一覧はページネーションされるため、StatCard の合計をページ分の reduce で
 * 出すと誤読される（#225）。サーバ集計の本 API を使うこと。
 */
export function getBillingSummary(
  query?: BillingSummaryQuery
): Promise<ApiResponse<BillingSummaryResponse>> {
  return apiGet<BillingSummaryResponse>(`${BASE}/summary`, {
    contractPlotId: query?.contractPlotId,
    customerId: query?.customerId,
    category: query?.category,
    status: query?.status,
    billingDateFrom: query?.billingDateFrom,
    billingDateTo: query?.billingDateTo,
  });
}

export function getBillingById(id: string): Promise<ApiResponse<BillingDetailResponse>> {
  return apiGet<BillingDetailResponse>(`${BASE}/${id}`);
}

export function createBilling(data: CreateBillingRequest): Promise<ApiResponse<Billing>> {
  return apiPost<Billing>(BASE, data);
}

export function updateBilling(
  id: string,
  data: UpdateBillingRequest
): Promise<ApiResponse<Billing>> {
  return apiPut<Billing>(`${BASE}/${id}`, data);
}

export function deleteBilling(id: string): Promise<ApiResponse<DeleteBillingResponse>> {
  return apiDelete<DeleteBillingResponse>(`${BASE}/${id}`);
}

// ===== ラベル定義（UI 表示用） =====

export const BILLING_CATEGORY_LABELS: Record<BillingCategory, string> = {
  usage_fee: '使用料',
  management_fee: '管理料',
  collective_fee: '合祀料金',
  construction_fee: '工事料金',
  gravestone_fee: '墓石代',
  other: 'その他',
};

export const BILLING_RECORD_STATUS_LABELS: Record<BillingRecordStatus, string> = {
  pending: '請求前',
  billed: '請求済',
  partial_paid: '一部入金',
  paid: '全額入金',
  overdue: '延滞',
  terminated: '解約済',
  written_off: '貸倒',
};
