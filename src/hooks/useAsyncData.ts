'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '@/lib/api/types';

// シンプルなインメモリキャッシュ
const cache = new Map<string, { data: unknown; timestamp: number }>();

// デフォルトのキャッシュTTL（5分）
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

interface UseAsyncDataOptions {
  /** キャッシュキー（指定するとキャッシュが有効化される） */
  cacheKey?: string;
  /** キャッシュのTTL（ミリ秒）デフォルト: 5分 */
  cacheTTL?: number;
  /** 初期ローディング状態をスキップ */
  skipInitialFetch?: boolean;
  /** 依存配列が変わった時に自動でリフェッチ */
  deps?: unknown[];
}

interface UseAsyncDataReturn<T> {
  /** 取得したデータ */
  data: T | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** データを再取得 */
  refetch: () => Promise<void>;
  /** キャッシュをクリア */
  clearCache: () => void;
}

/**
 * 非同期データ取得用の汎用フック
 * キャッシュ機能付き
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const {
    cacheKey,
    cacheTTL = DEFAULT_CACHE_TTL,
    skipInitialFetch = false,
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState<string | null>(null);
  const fetchFnRef = useRef(fetchFn);
  const isMountedRef = useRef(true);

  // fetchFnの参照を更新
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  // キャッシュから取得を試みる
  const getFromCache = useCallback((): T | null => {
    if (!cacheKey) return null;

    const cached = cache.get(cacheKey);
    if (!cached) return null;

    // TTLチェック
    if (Date.now() - cached.timestamp > cacheTTL) {
      cache.delete(cacheKey);
      return null;
    }

    return cached.data as T;
  }, [cacheKey, cacheTTL]);

  // キャッシュに保存
  const saveToCache = useCallback((value: T) => {
    if (!cacheKey) return;
    cache.set(cacheKey, { data: value, timestamp: Date.now() });
  }, [cacheKey]);

  // キャッシュをクリア
  const clearCache = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  // データ取得関数
  const fetchData = useCallback(async () => {
    // キャッシュから取得を試みる
    const cachedData = getFromCache();
    if (cachedData !== null) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFnRef.current();

      if (!isMountedRef.current) return;

      if (response.success) {
        setData(response.data);
        saveToCache(response.data);
        setError(null);
      } else {
        setError(response.error.message);
        setData(null);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [getFromCache, saveToCache]);

  // refetch（キャッシュをスキップして強制的に取得）
  const refetch = useCallback(async () => {
    clearCache();
    await fetchData();
  }, [clearCache, fetchData]);

  // 初期ロード
  useEffect(() => {
    isMountedRef.current = true;

    if (!skipInitialFetch) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipInitialFetch, ...deps]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache,
  };
}

/**
 * グローバルキャッシュをクリア
 */
export function clearAllAsyncDataCache() {
  cache.clear();
}

/**
 * 特定のキーパターンに一致するキャッシュをクリア
 */
export function clearAsyncDataCacheByPattern(pattern: RegExp) {
  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key);
    }
  }
}
