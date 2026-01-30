'use client';

/**
 * 区画在庫管理フック
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PlotPeriod } from '@/types/customer';
import {
  getInventorySummary,
  getInventoryPeriods,
  getInventorySections,
  getInventoryAreas,
  InventorySummary,
  PeriodSummary,
  SectionInventoryItem,
  AreaInventoryItem,
  InventorySectionsParams,
  InventoryAreasParams,
  PlotStatus,
  SectionSortKey,
  AreaSortKey,
  SortOrder,
} from '@/lib/api/plot-inventory';

// ==================== 型定義 ====================

export interface UsePlotInventoryOptions {
  autoFetch?: boolean;
}

export interface UsePlotInventorySummaryResult {
  summary: InventorySummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UsePlotInventoryPeriodsResult {
  periods: PeriodSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UsePlotInventorySectionsResult {
  items: SectionInventoryItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  params: InventorySectionsParams;
  setParams: (params: Partial<InventorySectionsParams>) => void;
  setPage: (page: number) => void;
  setSort: (sortBy: SectionSortKey, sortOrder?: SortOrder) => void;
  setSearch: (search: string) => void;
  setPeriod: (period: PlotPeriod | undefined) => void;
  setStatus: (status: PlotStatus | undefined) => void;
  refresh: () => void;
}

export interface UsePlotInventoryAreasResult {
  items: AreaInventoryItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  params: InventoryAreasParams;
  setParams: (params: Partial<InventoryAreasParams>) => void;
  setPage: (page: number) => void;
  setSort: (sortBy: AreaSortKey, sortOrder?: SortOrder) => void;
  setSearch: (search: string) => void;
  setPeriod: (period: PlotPeriod | undefined) => void;
  refresh: () => void;
}

// ==================== フック実装 ====================

/**
 * 在庫全体サマリーを取得するフック
 */
export function usePlotInventorySummary(
  options: UsePlotInventoryOptions = {}
): UsePlotInventorySummaryResult {
  const { autoFetch = true } = options;
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getInventorySummary();
      if (response.success) {
        setSummary(response.data);
      } else {
        setError(response.error?.message || 'サマリーの取得に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchSummary();
    }
  }, [autoFetch, fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refresh: fetchSummary,
  };
}

/**
 * 期別サマリーを取得するフック
 */
export function usePlotInventoryPeriods(
  period?: PlotPeriod,
  options: UsePlotInventoryOptions = {}
): UsePlotInventoryPeriodsResult {
  const { autoFetch = true } = options;
  const [periods, setPeriods] = useState<PeriodSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getInventoryPeriods(period);
      if (response.success) {
        setPeriods(response.data.periods);
      } else {
        setError(response.error?.message || '期別サマリーの取得に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (autoFetch) {
      fetchPeriods();
    }
  }, [autoFetch, fetchPeriods]);

  return {
    periods,
    isLoading,
    error,
    refresh: fetchPeriods,
  };
}

/**
 * セクション別集計を取得するフック
 */
export function usePlotInventorySections(
  initialParams: InventorySectionsParams = {},
  options: UsePlotInventoryOptions = {}
): UsePlotInventorySectionsResult {
  const { autoFetch = true } = options;
  const [items, setItems] = useState<SectionInventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParamsState] = useState<InventorySectionsParams>({
    page: 1,
    limit: 100,
    sortBy: 'period',
    sortOrder: 'asc',
    ...initialParams,
  });

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getInventorySections(params);
      if (response.success) {
        setItems(response.data.items);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error?.message || 'セクション別集計の取得に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (autoFetch) {
      fetchSections();
    }
  }, [autoFetch, fetchSections]);

  const setParams = useCallback((newParams: Partial<InventorySectionsParams>) => {
    setParamsState(prev => ({ ...prev, ...newParams }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams({ page });
  }, [setParams]);

  const setSort = useCallback((sortBy: SectionSortKey, sortOrder?: SortOrder) => {
    setParams({
      sortBy,
      sortOrder: sortOrder || (params.sortBy === sortBy && params.sortOrder === 'asc' ? 'desc' : 'asc'),
      page: 1,
    });
  }, [params.sortBy, params.sortOrder, setParams]);

  const setSearch = useCallback((search: string) => {
    setParams({ search: search || undefined, page: 1 });
  }, [setParams]);

  const setPeriod = useCallback((period: PlotPeriod | undefined) => {
    setParams({ period, page: 1 });
  }, [setParams]);

  const setStatus = useCallback((status: PlotStatus | undefined) => {
    setParams({ status, page: 1 });
  }, [setParams]);

  return {
    items,
    total,
    page: params.page || 1,
    totalPages,
    isLoading,
    error,
    params,
    setParams,
    setPage,
    setSort,
    setSearch,
    setPeriod,
    setStatus,
    refresh: fetchSections,
  };
}

/**
 * 面積別集計を取得するフック
 */
export function usePlotInventoryAreas(
  initialParams: InventoryAreasParams = {},
  options: UsePlotInventoryOptions = {}
): UsePlotInventoryAreasResult {
  const { autoFetch = true } = options;
  const [items, setItems] = useState<AreaInventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParamsState] = useState<InventoryAreasParams>({
    page: 1,
    limit: 100,
    sortBy: 'period',
    sortOrder: 'asc',
    ...initialParams,
  });

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getInventoryAreas(params);
      if (response.success) {
        setItems(response.data.items);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error?.message || '面積別集計の取得に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (autoFetch) {
      fetchAreas();
    }
  }, [autoFetch, fetchAreas]);

  const setParams = useCallback((newParams: Partial<InventoryAreasParams>) => {
    setParamsState(prev => ({ ...prev, ...newParams }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams({ page });
  }, [setParams]);

  const setSort = useCallback((sortBy: AreaSortKey, sortOrder?: SortOrder) => {
    setParams({
      sortBy,
      sortOrder: sortOrder || (params.sortBy === sortBy && params.sortOrder === 'asc' ? 'desc' : 'asc'),
      page: 1,
    });
  }, [params.sortBy, params.sortOrder, setParams]);

  const setSearch = useCallback((search: string) => {
    setParams({ search: search || undefined, page: 1 });
  }, [setParams]);

  const setPeriod = useCallback((period: PlotPeriod | undefined) => {
    setParams({ period, page: 1 });
  }, [setParams]);

  return {
    items,
    total,
    page: params.page || 1,
    totalPages,
    isLoading,
    error,
    params,
    setParams,
    setPage,
    setSort,
    setSearch,
    setPeriod,
    refresh: fetchAreas,
  };
}

/**
 * 在庫管理に必要なすべてのデータを取得する統合フック
 */
export function usePlotInventory(options: UsePlotInventoryOptions = {}) {
  const summary = usePlotInventorySummary(options);
  const periods = usePlotInventoryPeriods(undefined, options);
  const sections = usePlotInventorySections({}, options);
  const areas = usePlotInventoryAreas({}, options);

  const isLoading = useMemo(
    () => summary.isLoading || periods.isLoading || sections.isLoading || areas.isLoading,
    [summary.isLoading, periods.isLoading, sections.isLoading, areas.isLoading]
  );

  const error = useMemo(
    () => summary.error || periods.error || sections.error || areas.error,
    [summary.error, periods.error, sections.error, areas.error]
  );

  const refreshAll = useCallback(() => {
    summary.refresh();
    periods.refresh();
    sections.refresh();
    areas.refresh();
  }, [summary, periods, sections, areas]);

  return {
    summary: summary.summary,
    periods: periods.periods,
    sections: sections.items,
    areas: areas.items,
    isLoading,
    error,
    refreshAll,
    // 詳細操作用
    summaryHook: summary,
    periodsHook: periods,
    sectionsHook: sections,
    areasHook: areas,
  };
}
