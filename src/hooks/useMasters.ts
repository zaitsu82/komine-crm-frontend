'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllMasters,
  getCemeteryTypes,
  getPaymentMethods,
  getTaxTypes,
  getCalcTypes,
  getBillingTypes,
  getAccountTypes,
  getRecipientTypes,
  getConstructionTypes,
  MasterItem,
  TaxTypeMasterItem,
  AllMastersData,
} from '@/lib/api';

// マスタデータの状態型
interface MastersState {
  data: AllMastersData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// キャッシュの有効期限（ミリ秒）- 30分
const CACHE_TTL = 30 * 60 * 1000;

// グローバルキャッシュ（コンポーネント間で共有）
let globalCache: {
  data: AllMastersData | null;
  lastFetched: Date | null;
} = {
  data: null,
  lastFetched: null,
};

/**
 * キャッシュが有効かどうかをチェック
 */
function isCacheValid(): boolean {
  if (!globalCache.data || !globalCache.lastFetched) {
    return false;
  }
  const now = new Date();
  const elapsed = now.getTime() - globalCache.lastFetched.getTime();
  return elapsed < CACHE_TTL;
}

/**
 * 全マスタデータ管理フック
 * キャッシュ機能付き - マスタデータは頻繁に変わらないため
 */
export function useMasters(options?: { skipCache?: boolean }) {
  const [state, setState] = useState<MastersState>({
    data: globalCache.data,
    isLoading: !isCacheValid(),
    error: null,
    lastFetched: globalCache.lastFetched,
  });

  const fetchingRef = useRef(false);

  // マスタデータを取得
  const fetchMasters = useCallback(async (forceRefresh = false) => {
    // キャッシュが有効で強制リフレッシュでない場合はスキップ
    if (!forceRefresh && isCacheValid()) {
      setState({
        data: globalCache.data,
        isLoading: false,
        error: null,
        lastFetched: globalCache.lastFetched,
      });
      return;
    }

    // 既にフェッチ中の場合はスキップ
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await getAllMasters();

    fetchingRef.current = false;

    if (response.success && response.data) {
      const now = new Date();
      globalCache = {
        data: response.data,
        lastFetched: now,
      };
      setState({
        data: response.data,
        isLoading: false,
        error: null,
        lastFetched: now,
      });
    } else if (!response.success) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error?.message || 'マスタデータの取得に失敗しました',
      }));
    }
  }, []);

  // 初回マウント時に取得
  useEffect(() => {
    if (options?.skipCache || !isCacheValid()) {
      fetchMasters(options?.skipCache);
    }
  }, [fetchMasters, options?.skipCache]);

  // リフレッシュ（強制再取得）
  const refresh = useCallback(() => {
    fetchMasters(true);
  }, [fetchMasters]);

  // キャッシュをクリア
  const clearCache = useCallback(() => {
    globalCache = { data: null, lastFetched: null };
    setState({
      data: null,
      isLoading: false,
      error: null,
      lastFetched: null,
    });
  }, []);

  // 便利なアクセサ
  const cemeteryTypes = state.data?.cemeteryType || [];
  const paymentMethods = state.data?.paymentMethod || [];
  const taxTypes = state.data?.taxType || [];
  const calcTypes = state.data?.calcType || [];
  const billingTypes = state.data?.billingType || [];
  const accountTypes = state.data?.accountType || [];
  const recipientTypes = state.data?.recipientType || [];
  const constructionTypes = state.data?.constructionType || [];

  return {
    // 状態
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    lastFetched: state.lastFetched,

    // 個別マスタデータ
    cemeteryTypes,
    paymentMethods,
    taxTypes,
    calcTypes,
    billingTypes,
    accountTypes,
    recipientTypes,
    constructionTypes,

    // アクション
    refresh,
    clearCache,
  };
}

/**
 * 個別マスタデータ取得フック
 * 特定のマスタのみが必要な場合に使用
 */
export function useMasterData<T extends MasterItem | TaxTypeMasterItem>(
  fetchFn: () => Promise<{ success: boolean; data?: T[]; error?: { message: string } }>
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetchFn();

    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.error?.message || 'データの取得に失敗しました');
    }

    setIsLoading(false);
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    isLoading,
    error,
    refresh: fetch,
  };
}

// 個別マスタ用のカスタムフック
export const useCemeteryTypes = () => useMasterData<MasterItem>(getCemeteryTypes);
export const usePaymentMethods = () => useMasterData<MasterItem>(getPaymentMethods);
export const useTaxTypes = () => useMasterData<TaxTypeMasterItem>(getTaxTypes);
export const useCalcTypes = () => useMasterData<MasterItem>(getCalcTypes);
export const useBillingTypes = () => useMasterData<MasterItem>(getBillingTypes);
export const useAccountTypes = () => useMasterData<MasterItem>(getAccountTypes);
export const useRecipientTypes = () => useMasterData<MasterItem>(getRecipientTypes);
export const useConstructionTypes = () => useMasterData<MasterItem>(getConstructionTypes);

/**
 * マスタデータからコードで値を検索するユーティリティ
 */
export function findMasterByCode<T extends MasterItem>(
  items: T[],
  code: string
): T | undefined {
  return items.find((item) => item.code === code);
}

/**
 * マスタデータからIDで値を検索するユーティリティ
 */
export function findMasterById<T extends MasterItem>(
  items: T[],
  id: number
): T | undefined {
  return items.find((item) => item.id === id);
}

/**
 * マスタデータを選択肢形式に変換するユーティリティ
 * フォームのドロップダウン等で使用
 */
export function masterToSelectOptions<T extends MasterItem>(
  items: T[]
): { value: string; label: string }[] {
  return items.map((item) => ({
    value: item.code,
    label: item.name,
  }));
}
