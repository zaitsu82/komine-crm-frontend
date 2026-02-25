/**
 * マスタAPI
 * バックエンドのマスタデータ取得APIとの連携
 */

import { apiGet, apiPost, apiPut, apiDelete, shouldUseMockData } from './client';
import { ApiResponse } from './types';

// マスタデータの基本型
export interface MasterItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
}

// 税タイプマスタ（追加フィールドあり）
export interface TaxTypeMasterItem extends MasterItem {
  taxRate: string | null;
}

// 全マスタデータの型
export interface AllMastersData {
  cemeteryType: MasterItem[];
  paymentMethod: MasterItem[];
  taxType: TaxTypeMasterItem[];
  calcType: MasterItem[];
  billingType: MasterItem[];
  accountType: MasterItem[];
  recipientType: MasterItem[];
  constructionType: MasterItem[];
}

// モックデータ
const mockMasterData: AllMastersData = {
  cemeteryType: [
    { id: 1, code: 'GENERAL', name: '一般墓地', description: '一般的な墓地', sortOrder: 1, isActive: true },
    { id: 2, code: 'MEMORIAL', name: '永代供養墓', description: '永代供養用の墓地', sortOrder: 2, isActive: true },
    { id: 3, code: 'TREE', name: '樹木葬', description: '樹木葬用の区画', sortOrder: 3, isActive: true },
  ],
  paymentMethod: [
    { id: 1, code: 'CASH', name: '現金払い', description: '現金での支払い', sortOrder: 1, isActive: true },
    { id: 2, code: 'BANK_TRANSFER', name: '銀行振込', description: '銀行口座への振込', sortOrder: 2, isActive: true },
    { id: 3, code: 'ACCOUNT_TRANSFER', name: '口座振替', description: '自動口座振替', sortOrder: 3, isActive: true },
  ],
  taxType: [
    { id: 1, code: 'TAX_10', name: '消費税10%', description: '標準税率', sortOrder: 1, isActive: true, taxRate: '0.10' },
    { id: 2, code: 'TAX_8', name: '消費税8%', description: '軽減税率', sortOrder: 2, isActive: true, taxRate: '0.08' },
    { id: 3, code: 'TAX_FREE', name: '非課税', description: '非課税取引', sortOrder: 3, isActive: true, taxRate: '0' },
  ],
  calcType: [
    { id: 1, code: 'AREA', name: '面積単価', description: '面積に基づく計算', sortOrder: 1, isActive: true },
    { id: 2, code: 'FIXED', name: '一律料金', description: '固定料金', sortOrder: 2, isActive: true },
  ],
  billingType: [
    { id: 1, code: 'YEARLY', name: '年次請求', description: '年1回の請求', sortOrder: 1, isActive: true },
    { id: 2, code: 'MONTHLY', name: '月次請求', description: '月1回の請求', sortOrder: 2, isActive: true },
    { id: 3, code: 'ONETIME', name: '一括請求', description: '契約時のみ', sortOrder: 3, isActive: true },
  ],
  accountType: [
    { id: 1, code: 'ORDINARY', name: '普通預金', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'SAVINGS', name: '当座預金', description: null, sortOrder: 2, isActive: true },
  ],
  recipientType: [
    { id: 1, code: 'CONTRACTOR', name: '契約者', description: '契約者本人', sortOrder: 1, isActive: true },
    { id: 2, code: 'SUCCESSOR', name: '承継者', description: '承継者', sortOrder: 2, isActive: true },
    { id: 3, code: 'OTHER', name: 'その他', description: 'その他の受取人', sortOrder: 3, isActive: true },
  ],
  constructionType: [
    { id: 1, code: 'FOUNDATION', name: '基礎工事', description: '墓石の基礎工事', sortOrder: 1, isActive: true },
    { id: 2, code: 'TOMBSTONE', name: '墓石設置', description: '墓石の設置工事', sortOrder: 2, isActive: true },
    { id: 3, code: 'REMOVAL', name: '墓石撤去', description: '墓石の撤去工事', sortOrder: 3, isActive: true },
    { id: 4, code: 'REPAIR', name: '修繕工事', description: '墓石の修繕', sortOrder: 4, isActive: true },
  ],
};

/**
 * 全マスタデータを一括取得
 */
export async function getAllMasters(): Promise<ApiResponse<AllMastersData>> {
  if (shouldUseMockData()) {
    if (process.env.NODE_ENV === 'development') console.log('[API] Using mock data for getAllMasters');
    return {
      success: true,
      data: mockMasterData,
    };
  }

  const response = await apiGet<AllMastersData>('/masters/all');
  return response;
}

/**
 * 墓地タイプマスタ取得
 */
export async function getCemeteryTypes(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.cemeteryType };
  }
  return apiGet<MasterItem[]>('/masters/cemetery-type');
}

/**
 * 支払方法マスタ取得
 */
export async function getPaymentMethods(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.paymentMethod };
  }
  return apiGet<MasterItem[]>('/masters/payment-method');
}

/**
 * 税タイプマスタ取得
 */
export async function getTaxTypes(): Promise<ApiResponse<TaxTypeMasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.taxType };
  }
  return apiGet<TaxTypeMasterItem[]>('/masters/tax-type');
}

/**
 * 計算タイプマスタ取得
 */
export async function getCalcTypes(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.calcType };
  }
  return apiGet<MasterItem[]>('/masters/calc-type');
}

/**
 * 請求タイプマスタ取得
 */
export async function getBillingTypes(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.billingType };
  }
  return apiGet<MasterItem[]>('/masters/billing-type');
}

/**
 * 口座タイプマスタ取得
 */
export async function getAccountTypes(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.accountType };
  }
  return apiGet<MasterItem[]>('/masters/account-type');
}

/**
 * 受取人タイプマスタ取得
 */
export async function getRecipientTypes(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.recipientType };
  }
  return apiGet<MasterItem[]>('/masters/recipient-type');
}

/**
 * 工事タイプマスタ取得
 */
export async function getConstructionTypes(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.constructionType };
  }
  return apiGet<MasterItem[]>('/masters/construction-type');
}

// CRUD用の型定義
export type MasterType =
  | 'cemetery-type'
  | 'payment-method'
  | 'tax-type'
  | 'calc-type'
  | 'billing-type'
  | 'account-type'
  | 'recipient-type'
  | 'construction-type';

export interface CreateMasterRequest {
  code: string;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
  taxRate?: number | null;
}

export interface UpdateMasterRequest {
  code?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
  taxRate?: number | null;
}

export async function createMasterItem(
  masterType: MasterType,
  data: CreateMasterRequest,
): Promise<ApiResponse<MasterItem>> {
  return apiPost<MasterItem>(`/masters/${masterType}`, data);
}

export async function updateMasterItem(
  masterType: MasterType,
  id: number,
  data: UpdateMasterRequest,
): Promise<ApiResponse<MasterItem>> {
  return apiPut<MasterItem>(`/masters/${masterType}/${id}`, data);
}

export async function deleteMasterItem(
  masterType: MasterType,
  id: number,
): Promise<ApiResponse<{ message: string }>> {
  return apiDelete<{ message: string }>(`/masters/${masterType}/${id}`);
}
