/**
 * useMasters の2系統アクセサ（#238）
 *
 * 無効化済みマスタを参照する既存データの名称解決を維持するため、
 * include_inactive 付きで全件取得し、
 * - 既存の個別アクセサ（フォーム選択肢用）は active のみ
 * - allMasters（名称解決用）は無効を含む全件
 * を返すことを保証する。
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useMasters, clearMastersCache } from '@/hooks/useMasters';
import type { AllMastersData } from '@/lib/api';

const getAllMastersMock = jest.fn();
jest.mock('@/lib/api', () => ({
  getAllMasters: (...args: unknown[]) => getAllMastersMock(...args),
  // useMasters.ts が import する個別取得関数（本テストでは未使用）
  getCemeteryTypes: jest.fn(),
  getPaymentMethods: jest.fn(),
  getTaxTypes: jest.fn(),
  getCalcTypes: jest.fn(),
  getBillingTypes: jest.fn(),
  getRecipientTypes: jest.fn(),
  getConstructionTypes: jest.fn(),
  getSectionNames: jest.fn(),
  getContractors: jest.fn(),
}));

const mastersData: AllMastersData = {
  cemeteryType: [],
  paymentMethod: [],
  taxType: [],
  calcType: [
    { id: 1, code: 'AREA', name: '面積×単価', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'FIXED', name: '任意設定', description: null, sortOrder: 2, isActive: false },
  ],
  billingType: [],
  recipientType: [],
  constructionType: [],
  sectionName: [],
  relationship: [],
  contractor: [],
  direction: [],
  position: [],
};

describe('useMasters 2系統アクセサ (#238)', () => {
  beforeEach(() => {
    clearMastersCache();
    getAllMastersMock.mockReset();
    getAllMastersMock.mockResolvedValue({ success: true, data: mastersData });
  });

  it('include_inactive 付きで全件取得する', async () => {
    const { result } = renderHook(() => useMasters());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getAllMastersMock).toHaveBeenCalledWith({ includeInactive: true });
  });

  it('個別アクセサは active のみ、allMasters は無効を含む全件を返す', async () => {
    const { result } = renderHook(() => useMasters());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // フォーム選択肢用: 無効マスタは含まない
    expect(result.current.calcTypes.map((m) => m.code)).toEqual(['AREA']);
    // 名称解決用: 無効マスタも含む
    expect(result.current.allMasters.calcTypes.map((m) => m.code)).toEqual(['AREA', 'FIXED']);
  });
});
