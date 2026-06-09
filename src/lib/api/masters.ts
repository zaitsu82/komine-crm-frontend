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

// 区画名マスタ（追加フィールドあり）
export interface SectionNameMasterItem extends MasterItem {
  period: string;
}

// 全マスタデータの型
export interface AllMastersData {
  cemeteryType: MasterItem[];
  paymentMethod: MasterItem[];
  taxType: TaxTypeMasterItem[];
  calcType: MasterItem[];
  billingType: MasterItem[];
  recipientType: MasterItem[];
  constructionType: MasterItem[];
  sectionName: SectionNameMasterItem[];
  relationship: MasterItem[];
  contractor: MasterItem[];
  direction: MasterItem[];
  position: MasterItem[];
  // 合祀年数マスタ（#289）。code/name に年数（13/15/24/33 等）を持つフラットな一覧。
  // タイプ×年数の対応（どの区域が何年か）は持たないため、自動判定ルールは
  // collective-burial-rules.ts の VALIDITY_RULE_TABLE が引き続き担う（Q34/#281）。
  validityPeriod: MasterItem[];
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
  // 税区分: 旧システム(sykbnn KBNNO=2027)準拠の内税/外税。backend seedMasters.ts と一致。
  taxType: [
    { id: 1, code: 'INCLUSIVE', name: '内税', description: '税込み', sortOrder: 1, isActive: true, taxRate: null },
    { id: 2, code: 'EXCLUSIVE', name: '外税', description: '税抜き', sortOrder: 2, isActive: true, taxRate: null },
  ],
  // 計算区分: 旧 sykbnn KBNNO=2026 準拠。
  calcType: [
    { id: 1, code: 'AREA', name: '面積×単価', description: '面積×単価で計算', sortOrder: 1, isActive: true },
    { id: 2, code: 'FIXED', name: '任意設定', description: '金額を任意設定', sortOrder: 2, isActive: true },
  ],
  // 請求区分: 旧 sykbnn KBNNO=2028 準拠。
  billingType: [
    { id: 1, code: 'NONE', name: 'なし', description: '請求なし', sortOrder: 1, isActive: true },
    { id: 2, code: 'PRESENT', name: 'あり', description: '請求あり', sortOrder: 2, isActive: true },
    { id: 3, code: 'PERPETUAL', name: '永代', description: '永代', sortOrder: 3, isActive: true },
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
  sectionName: [
    { id: 1, code: '1-A', name: 'A', period: '第1期', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: '1-B', name: 'B', period: '第1期', description: null, sortOrder: 2, isActive: true },
    { id: 3, code: '1-C', name: 'C', period: '第1期', description: null, sortOrder: 3, isActive: true },
    { id: 4, code: '1-KISSOU', name: '吉相', period: '第1期', description: null, sortOrder: 4, isActive: true },
    { id: 5, code: '2-1', name: '1', period: '第2期', description: null, sortOrder: 18, isActive: true },
    { id: 6, code: '2-2', name: '2', period: '第2期', description: null, sortOrder: 19, isActive: true },
    { id: 7, code: '3-10', name: '10', period: '第3期', description: null, sortOrder: 26, isActive: true },
    { id: 8, code: '3T-JURIN', name: '樹林', period: '第3期樹林部', description: null, sortOrder: 28, isActive: true },
    { id: 9, code: '4-RURIAN_TERRACE', name: 'るり庵テラス', period: '第4期', description: null, sortOrder: 30, isActive: true },
    { id: 10, code: '4-IKOI', name: '憩', period: '第4期', description: null, sortOrder: 37, isActive: true },
  ],
  relationship: [
    { id: 1, code: 'SELF', name: '本人', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'SPOUSE', name: '配偶者', description: null, sortOrder: 2, isActive: true },
    { id: 3, code: 'FATHER', name: '父', description: null, sortOrder: 3, isActive: true },
    { id: 4, code: 'MOTHER', name: '母', description: null, sortOrder: 4, isActive: true },
    { id: 5, code: 'SON', name: '長男', description: null, sortOrder: 5, isActive: true },
    { id: 6, code: 'DAUGHTER', name: '長女', description: null, sortOrder: 6, isActive: true },
    { id: 7, code: 'BROTHER', name: '兄弟', description: null, sortOrder: 7, isActive: true },
    { id: 8, code: 'SISTER', name: '姉妹', description: null, sortOrder: 8, isActive: true },
    { id: 9, code: 'GRANDFATHER', name: '祖父', description: null, sortOrder: 9, isActive: true },
    { id: 10, code: 'GRANDMOTHER', name: '祖母', description: null, sortOrder: 10, isActive: true },
    { id: 11, code: 'GRANDCHILD', name: '孫', description: null, sortOrder: 11, isActive: true },
    { id: 12, code: 'OTHER', name: 'その他', description: null, sortOrder: 99, isActive: true },
  ],
  contractor: [
    { id: 1, code: 'placeholder-1', name: '小嶺石材', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'placeholder-2', name: '小嶺霊園工事部', description: null, sortOrder: 2, isActive: true },
    { id: 3, code: 'placeholder-3', name: '提携業者A', description: null, sortOrder: 3, isActive: true },
    { id: 4, code: 'placeholder-4', name: '提携業者B', description: null, sortOrder: 4, isActive: true },
    { id: 5, code: 'placeholder-99', name: 'その他', description: null, sortOrder: 99, isActive: true },
  ],
  // 方角: 旧 sykbnn KBNNO=2024。code は GravestoneInfo.directionId(int) の文字列。backend と一致。
  direction: [
    { id: 1, code: '1', name: '東', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: '2', name: '西', description: null, sortOrder: 2, isActive: true },
    { id: 3, code: '3', name: '南', description: null, sortOrder: 3, isActive: true },
    { id: 4, code: '4', name: '北', description: null, sortOrder: 4, isActive: true },
    { id: 5, code: '5', name: '北東', description: null, sortOrder: 5, isActive: true },
    { id: 6, code: '6', name: '南東', description: null, sortOrder: 6, isActive: true },
    { id: 7, code: '7', name: '北西', description: null, sortOrder: 7, isActive: true },
    { id: 8, code: '8', name: '南西', description: null, sortOrder: 8, isActive: true },
  ],
  // 位置: 旧 sykbnn KBNNO=2025。code は GravestoneInfo.positionId(int) の文字列。backend と一致。
  position: [
    { id: 1, code: '1', name: '角', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: '2', name: '端', description: null, sortOrder: 2, isActive: true },
    { id: 3, code: '3', name: '中', description: null, sortOrder: 3, isActive: true },
  ],
  // 合祀年数: backend seedMasters.ts の validity-period（13/15/24/33）と一致。code=年数。
  validityPeriod: [
    { id: 1, code: '13', name: '13年', description: null, sortOrder: 13, isActive: true },
    { id: 2, code: '15', name: '15年', description: null, sortOrder: 15, isActive: true },
    { id: 3, code: '24', name: '24年', description: null, sortOrder: 24, isActive: true },
    { id: 4, code: '33', name: '33年', description: null, sortOrder: 33, isActive: true },
  ],
};

// マスタ取得オプション
export interface GetMastersOptions {
  /**
   * 無効（is_active=false）マスタも含めて取得する（#238）。
   * 名称解決（無効化済みマスタを参照する既存データの表示維持）と
   * マスタ管理画面（無効マスタの再有効化）で使用。既定は active のみ。
   */
  includeInactive?: boolean;
}

/**
 * 全マスタデータを一括取得
 */
export async function getAllMasters(
  options?: GetMastersOptions,
): Promise<ApiResponse<AllMastersData>> {
  if (shouldUseMockData()) {
    if (process.env.NODE_ENV === 'development') console.log('[API] Using mock data for getAllMasters');
    return {
      success: true,
      data: mockMasterData,
    };
  }

  const response = await apiGet<AllMastersData>(
    '/masters/all',
    options?.includeInactive ? { include_inactive: 'true' } : undefined,
  );
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

/**
 * 区画名マスタ取得
 */
export async function getSectionNames(): Promise<ApiResponse<SectionNameMasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.sectionName };
  }
  return apiGet<SectionNameMasterItem[]>('/masters/section-name');
}

/**
 * 続柄マスタ取得
 */
export async function getRelationships(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.relationship };
  }
  return apiGet<MasterItem[]>('/masters/relationship');
}

/**
 * 工事業者マスタ取得
 */
export async function getContractors(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.contractor };
  }
  return apiGet<MasterItem[]>('/masters/contractor');
}

/**
 * 方角マスタ取得
 */
export async function getDirections(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.direction };
  }
  return apiGet<MasterItem[]>('/masters/direction');
}

/**
 * 位置マスタ取得
 */
export async function getPositions(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.position };
  }
  return apiGet<MasterItem[]>('/masters/position');
}

/**
 * 合祀年数マスタ取得（#289）
 */
export async function getValidityPeriods(): Promise<ApiResponse<MasterItem[]>> {
  if (shouldUseMockData()) {
    return { success: true, data: mockMasterData.validityPeriod };
  }
  return apiGet<MasterItem[]>('/masters/validity-period');
}

// CRUD用の型定義
export type MasterType =
  | 'cemetery-type'
  | 'payment-method'
  | 'tax-type'
  | 'calc-type'
  | 'billing-type'
  | 'recipient-type'
  | 'construction-type'
  | 'section-name'
  | 'relationship'
  | 'contractor'
  | 'direction'
  | 'position'
  | 'validity-period';

export interface CreateMasterRequest {
  code?: string;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
  taxRate?: number | null;
  period?: string;
}

export interface UpdateMasterRequest {
  code?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
  taxRate?: number | null;
  period?: string;
}

// モックモードでは書き込みを行わず明示的に失敗を返す。
// 取得系（getAllMasters 等）が静的モックを返すため、実 backend に書いても
// 一覧へ反映されず「成功表示なのに変わらない」整合崩れになる（#228）。
// staff.ts のような可変モックストアが無い以上、擬似成功より失敗が安全。
function mockReadonlyError<T>(): ApiResponse<T> {
  return {
    success: false,
    error: {
      code: 'MOCK_READONLY',
      message: 'デモ（試験）環境ではマスタの変更はできません',
    },
  };
}

export async function createMasterItem(
  masterType: MasterType,
  data: CreateMasterRequest,
): Promise<ApiResponse<MasterItem>> {
  if (shouldUseMockData()) {
    return mockReadonlyError<MasterItem>();
  }
  return apiPost<MasterItem>(`/masters/${masterType}`, data);
}

export async function updateMasterItem(
  masterType: MasterType,
  id: number,
  data: UpdateMasterRequest,
): Promise<ApiResponse<MasterItem>> {
  if (shouldUseMockData()) {
    return mockReadonlyError<MasterItem>();
  }
  return apiPut<MasterItem>(`/masters/${masterType}/${id}`, data);
}

export async function deleteMasterItem(
  masterType: MasterType,
  id: number,
): Promise<ApiResponse<{ message: string }>> {
  if (shouldUseMockData()) {
    return mockReadonlyError<{ message: string }>();
  }
  return apiDelete<{ message: string }>(`/masters/${masterType}/${id}`);
}
