'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getAllMasters,
  getCemeteryTypes,
  getPaymentMethods,
  getTaxTypes,
  getCalcTypes,
  getBillingTypes,
  getRecipientTypes,
  getConstructionTypes,
  getSectionNames,
  getContractors,
  getValidityPeriods,
  MasterItem,
  TaxTypeMasterItem,
  SectionNameMasterItem,
  AllMastersData,
} from '@/lib/api';

// マスタ一覧のグループ型（useMasters の返却単位）
export interface MasterLists {
  cemeteryTypes: MasterItem[];
  paymentMethods: MasterItem[];
  taxTypes: TaxTypeMasterItem[];
  calcTypes: MasterItem[];
  billingTypes: MasterItem[];
  recipientTypes: MasterItem[];
  constructionTypes: MasterItem[];
  sectionNames: SectionNameMasterItem[];
  relationships: MasterItem[];
  contractors: MasterItem[];
  directions: MasterItem[];
  positions: MasterItem[];
  validityPeriods: MasterItem[];
}

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
 * useMastersのグローバルキャッシュをクリア（フック外からも呼び出し可能）
 * マスタ更新後に呼ぶことで、次回useMasters呼び出し時に最新データを取得させる
 */
export function clearMastersCache(): void {
  globalCache = { data: null, lastFetched: null };
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

    // #238: 無効化済みマスタを参照する既存データの名称解決を維持するため全件取得する。
    // フォーム選択肢用の active 絞り込みはクライアント側（下記アクセサ）で行う。
    const response = await getAllMasters({ includeInactive: true });

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

  // 便利なアクセサ（#238: 2系統）
  // - allMasters: 無効を含む全件。名称解決（resolveMasterName 等）用
  // - 既存の個別アクセサ: active のみ。フォーム選択肢用（無効マスタは新規選択不可）
  const { allMasters, activeMasters } = useMemo(() => {
    const all: MasterLists = {
      cemeteryTypes: state.data?.cemeteryType || [],
      paymentMethods: state.data?.paymentMethod || [],
      taxTypes: state.data?.taxType || [],
      calcTypes: state.data?.calcType || [],
      billingTypes: state.data?.billingType || [],
      recipientTypes: state.data?.recipientType || [],
      constructionTypes: state.data?.constructionType || [],
      sectionNames: state.data?.sectionName || [],
      relationships: state.data?.relationship || [],
      contractors: state.data?.contractor || [],
      directions: state.data?.direction || [],
      positions: state.data?.position || [],
      validityPeriods: state.data?.validityPeriod || [],
    };
    const active: MasterLists = {
      cemeteryTypes: all.cemeteryTypes.filter((m) => m.isActive),
      paymentMethods: all.paymentMethods.filter((m) => m.isActive),
      taxTypes: all.taxTypes.filter((m) => m.isActive),
      calcTypes: all.calcTypes.filter((m) => m.isActive),
      billingTypes: all.billingTypes.filter((m) => m.isActive),
      recipientTypes: all.recipientTypes.filter((m) => m.isActive),
      constructionTypes: all.constructionTypes.filter((m) => m.isActive),
      sectionNames: all.sectionNames.filter((m) => m.isActive),
      relationships: all.relationships.filter((m) => m.isActive),
      contractors: all.contractors.filter((m) => m.isActive),
      directions: all.directions.filter((m) => m.isActive),
      positions: all.positions.filter((m) => m.isActive),
      validityPeriods: all.validityPeriods.filter((m) => m.isActive),
    };
    return { allMasters: all, activeMasters: active };
  }, [state.data]);

  return {
    // 状態
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    lastFetched: state.lastFetched,

    // 個別マスタデータ（フォーム選択肢用: active のみ）
    cemeteryTypes: activeMasters.cemeteryTypes,
    paymentMethods: activeMasters.paymentMethods,
    taxTypes: activeMasters.taxTypes,
    calcTypes: activeMasters.calcTypes,
    billingTypes: activeMasters.billingTypes,
    recipientTypes: activeMasters.recipientTypes,
    constructionTypes: activeMasters.constructionTypes,
    sectionNames: activeMasters.sectionNames,
    relationships: activeMasters.relationships,
    contractors: activeMasters.contractors,
    directions: activeMasters.directions,
    positions: activeMasters.positions,
    validityPeriods: activeMasters.validityPeriods,

    // 名称解決用: 無効化済みを含む全件（#238）
    allMasters,

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
export const useRecipientTypes = () => useMasterData<MasterItem>(getRecipientTypes);
export const useConstructionTypes = () => useMasterData<MasterItem>(getConstructionTypes);
export const useSectionNames = () => useMasterData<SectionNameMasterItem>(getSectionNames);
export const useContractors = () => useMasterData<MasterItem>(getContractors);
export const useValidityPeriods = () => useMasterData<MasterItem>(getValidityPeriods);

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
