'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ApiResponse } from '@/lib/api/types';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

interface OperationResult {
  success: boolean;
  error?: string;
}

interface UseAsyncListOptions<P extends ListParams> {
  /** 初期パラメータ */
  initialParams?: Partial<P>;
  /** 初期ローディング状態をスキップ */
  skipInitialFetch?: boolean;
  /** ページサイズのデフォルト値 */
  defaultPageSize?: number;
}

interface UseAsyncListReturn<T, P extends ListParams> {
  /** アイテム一覧 */
  items: T[];
  /** 総件数 */
  total: number;
  /** 現在のページ */
  page: number;
  /** 総ページ数 */
  totalPages: number;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 現在のパラメータ */
  params: P;
  /** ページを設定 */
  setPage: (page: number) => void;
  /** 検索キーワードを設定 */
  setSearch: (search: string) => void;
  /** パラメータを更新 */
  updateParams: (newParams: Partial<P>) => void;
  /** パラメータをリセット */
  resetParams: () => void;
  /** データを再取得 */
  refetch: () => Promise<void>;
  /** アイテムを作成 */
  create: (data: unknown) => Promise<OperationResult>;
  /** アイテムを更新 */
  update: (id: string | number, data: unknown) => Promise<OperationResult>;
  /** アイテムを削除 */
  remove: (id: string | number) => Promise<OperationResult>;
}

/**
 * ページネーション付きリスト管理用の汎用フック
 */
export function useAsyncList<T, P extends ListParams = ListParams>(
  fetchFn: (params: P) => Promise<ApiResponse<PaginatedResponse<T>>>,
  options: UseAsyncListOptions<P> & {
    createFn?: (data: unknown) => Promise<ApiResponse<unknown>>;
    updateFn?: (id: string | number, data: unknown) => Promise<ApiResponse<unknown>>;
    deleteFn?: (id: string | number) => Promise<ApiResponse<unknown>>;
  } = {}
): UseAsyncListReturn<T, P> {
  const {
    initialParams = {},
    skipInitialFetch = false,
    defaultPageSize = 20,
    createFn,
    updateFn,
    deleteFn,
  } = options;

  const defaultParams: P = {
    page: 1,
    limit: defaultPageSize,
    search: '',
    ...initialParams,
  } as P;

  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<P>(defaultParams);

  const fetchFnRef = useRef(fetchFn);
  const isMountedRef = useRef(true);
  const initialParamsRef = useRef(initialParams);

  // fetchFnの参照を更新
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  // データ取得関数
  const fetchData = useCallback(async (currentParams: P) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFnRef.current(currentParams);

      if (!isMountedRef.current) return;

      if (response.success) {
        setItems(response.data.items);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
        setError(null);
      } else {
        setError(response.error.message);
        setItems([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // パラメータ変更時にデータ取得
  useEffect(() => {
    isMountedRef.current = true;

    if (!skipInitialFetch) {
      fetchData(params);
    }

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, skipInitialFetch]);

  // ページ設定
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  // 検索キーワード設定（ページを1にリセット）
  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // パラメータ更新
  const updateParams = useCallback((newParams: Partial<P>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // パラメータリセット
  const resetParams = useCallback(() => {
    setParams({
      page: 1,
      limit: defaultPageSize,
      search: '',
      ...initialParamsRef.current,
    } as P);
  }, [defaultPageSize]);

  // データ再取得
  const refetch = useCallback(async () => {
    await fetchData(params);
  }, [fetchData, params]);

  // 作成
  const create = useCallback(async (data: unknown): Promise<OperationResult> => {
    if (!createFn) {
      return { success: false, error: 'Create function not provided' };
    }

    try {
      const response = await createFn(data);
      if (response.success) {
        await fetchData(params);
        return { success: true };
      }
      return { success: false, error: response.error.message };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [createFn, fetchData, params]);

  // 更新
  const update = useCallback(async (id: string | number, data: unknown): Promise<OperationResult> => {
    if (!updateFn) {
      return { success: false, error: 'Update function not provided' };
    }

    try {
      const response = await updateFn(id, data);
      if (response.success) {
        await fetchData(params);
        return { success: true };
      }
      return { success: false, error: response.error.message };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [updateFn, fetchData, params]);

  // 削除
  const remove = useCallback(async (id: string | number): Promise<OperationResult> => {
    if (!deleteFn) {
      return { success: false, error: 'Delete function not provided' };
    }

    try {
      const response = await deleteFn(id);
      if (response.success) {
        await fetchData(params);
        return { success: true };
      }
      return { success: false, error: response.error.message };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [deleteFn, fetchData, params]);

  return {
    items,
    total,
    page: params.page || 1,
    totalPages,
    isLoading,
    error,
    params,
    setPage,
    setSearch,
    updateParams,
    resetParams,
    refetch,
    create,
    update,
    remove,
  };
}
