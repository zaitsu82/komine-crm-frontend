/**
 * 合祀管理用カスタムフック
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getCollectiveBurialList,
  getCollectiveBurialById,
  createCollectiveBurial as apiCreateCollectiveBurial,
  updateCollectiveBurial as apiUpdateCollectiveBurial,
  updateBillingStatus as apiUpdateBillingStatus,
  syncBurialCount as apiSyncBurialCount,
  deleteCollectiveBurial as apiDeleteCollectiveBurial,
  getCollectiveBurialStatsByYear,
  CollectiveBurialListItem,
  CollectiveBurialDetail,
  CollectiveBurialListResponse,
  CreateCollectiveBurialRequest,
  UpdateCollectiveBurialRequest,
  UpdateBillingStatusRequest,
  SyncBurialCountResponse,
  YearlyStats,
  CollectiveBurialSearchParams,
  BillingStatus,
} from '@/lib/api';

/**
 * 合祀一覧フック
 */
export function useCollectiveBurialList(initialParams?: CollectiveBurialSearchParams) {
  const [data, setData] = useState<CollectiveBurialListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<CollectiveBurialSearchParams>(initialParams || {});

  const fetchList = useCallback(async (searchParams?: CollectiveBurialSearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCollectiveBurialList(searchParams || params);

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || '合祀一覧の取得に失敗しました');
      }
    } catch {
      setError('合祀一覧の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // 初回読み込み
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 検索パラメータを更新して再取得
  const search = useCallback((newParams: CollectiveBurialSearchParams) => {
    setParams(newParams);
    fetchList(newParams);
  }, [fetchList]);

  // 再取得
  const refresh = useCallback(() => {
    fetchList(params);
  }, [fetchList, params]);

  return {
    data,
    items: data?.items || [],
    pagination: data?.pagination,
    isLoading,
    error,
    search,
    refresh,
    setParams,
  };
}

/**
 * 合祀詳細フック
 */
export function useCollectiveBurialDetail(id: string | null) {
  const [data, setData] = useState<CollectiveBurialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCollectiveBurialById(id);

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || '合祀詳細の取得に失敗しました');
      }
    } catch {
      setError('合祀詳細の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDetail,
  };
}

/**
 * 合祀操作フック（CRUD）
 */
export function useCollectiveBurialMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 合祀作成
  const createCollectiveBurial = useCallback(async (
    data: CreateCollectiveBurialRequest
  ): Promise<CollectiveBurialListItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCreateCollectiveBurial(data);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '合祀情報の作成に失敗しました');
        return null;
      }
    } catch {
      setError('合祀情報の作成中にエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 合祀更新
  const updateCollectiveBurial = useCallback(async (
    id: string,
    data: UpdateCollectiveBurialRequest
  ): Promise<CollectiveBurialListItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiUpdateCollectiveBurial(id, data);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '合祀情報の更新に失敗しました');
        return null;
      }
    } catch {
      setError('合祀情報の更新中にエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 請求ステータス更新
  const updateBillingStatus = useCallback(async (
    id: string,
    data: UpdateBillingStatusRequest
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiUpdateBillingStatus(id, data);

      if (response.success) {
        return true;
      } else {
        setError(response.error?.message || '請求ステータスの更新に失敗しました');
        return false;
      }
    } catch {
      setError('請求ステータスの更新中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 埋葬人数同期
  const syncBurialCount = useCallback(async (
    id: string
  ): Promise<SyncBurialCountResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiSyncBurialCount(id);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '埋葬人数の同期に失敗しました');
        return null;
      }
    } catch {
      setError('埋葬人数の同期中にエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 合祀削除
  const deleteCollectiveBurial = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiDeleteCollectiveBurial(id);

      if (response.success) {
        return true;
      } else {
        setError(response.error?.message || '合祀情報の削除に失敗しました');
        return false;
      }
    } catch {
      setError('合祀情報の削除中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createCollectiveBurial,
    updateCollectiveBurial,
    updateBillingStatus,
    syncBurialCount,
    deleteCollectiveBurial,
    isLoading,
    error,
    clearError,
  };
}

/**
 * 年別統計フック
 */
export function useCollectiveBurialStats() {
  const [data, setData] = useState<YearlyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCollectiveBurialStatsByYear();

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || '統計の取得に失敗しました');
      }
    } catch {
      setError('統計の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchStats,
  };
}

/**
 * 請求ステータスフィルタ用ヘルパー
 */
export function filterByBillingStatus(
  items: CollectiveBurialListItem[],
  status: BillingStatus | null
): CollectiveBurialListItem[] {
  if (!status) return items;
  return items.filter((item) => item.billingStatus === status);
}

/**
 * 年フィルタ用ヘルパー
 */
export function filterByYear(
  items: CollectiveBurialListItem[],
  year: number | null
): CollectiveBurialListItem[] {
  if (!year) return items;
  return items.filter((item) => {
    if (!item.billingScheduledDate) return false;
    return new Date(item.billingScheduledDate).getFullYear() === year;
  });
}

/**
 * 上限到達済みフィルタ用ヘルパー
 */
export function filterCapacityReached(
  items: CollectiveBurialListItem[],
  reachedOnly: boolean
): CollectiveBurialListItem[] {
  if (!reachedOnly) return items;
  return items.filter((item) => item.currentBurialCount >= item.burialCapacity);
}
