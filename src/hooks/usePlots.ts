/**
 * usePlots - 区画データ管理フック
 *
 * useCustomers の区画ベース版
 * @komine/types の型を直接使用し、変換なしでAPIレスポンスを扱う
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  PlotListItem,
  PlotDetailResponse,
  CreatePlotRequest,
  UpdatePlotRequest,
  CreatePlotResponse,
} from '@komine/types';
import {
  getPlots,
  getPlotById,
  createPlot,
  updatePlot,
  deletePlot,
  PlotSearchParams,
} from '@/lib/api/plots';

// ===== リスト状態キャッシュ =====

const CACHE_KEY = 'plots-list-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5分

interface CachedListState {
  plots: PlotListItem[];
  total: number;
  page: number;
  totalPages: number;
  searchQuery: string;
  aiueoTab: string;
  timestamp: number;
}

function getCachedState(): CachedListState | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const state = JSON.parse(cached) as CachedListState;
    if (Date.now() - state.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

function saveCachedState(state: Omit<CachedListState, 'timestamp'>): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch {
    // sessionStorage unavailable
  }
}

// ===== usePlots: 区画一覧フック =====

interface UsePlotsState {
  plots: PlotListItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

interface UsePlotsActions {
  setPage: (page: number) => void;
  setSearch: (query: string) => void;
  setAreaName: (areaName: string | undefined) => void;
  setAiueoTab: (tab: string) => void;
  refresh: () => Promise<void>;
}

interface UsePlotsReturn extends UsePlotsState, UsePlotsActions {
  // フィルタ状態
  searchQuery: string;
  areaName: string | undefined;
  aiueoTab: string;
}

// ひらがな → カタカナ変換マッピング（サーバーサイドフィルタ用）
const HIRAGANA_TO_KATAKANA_MAP: Record<string, string> = {
  'あ': 'ア', 'か': 'カ', 'さ': 'サ', 'た': 'タ', 'な': 'ナ',
  'は': 'ハ', 'ま': 'マ', 'や': 'ヤ', 'ら': 'ラ', 'わ': 'ワ',
};

interface UsePlotsOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function usePlots(options: UsePlotsOptions = {}): UsePlotsReturn {
  const { initialPage = 1, limit = 50, autoFetch = true } = options;

  // キャッシュから初期状態を復元
  const cached = useRef(getCachedState());
  const initialState = cached.current;

  // 状態（キャッシュがあればそこから復元）
  const [plots, setPlots] = useState<PlotListItem[]>(initialState?.plots ?? []);
  const [total, setTotal] = useState(initialState?.total ?? 0);
  const [page, setPage] = useState(initialState?.page ?? initialPage);
  const [totalPages, setTotalPages] = useState(initialState?.totalPages ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィルタ状態（キャッシュがあればそこから復元）
  const [searchQuery, setSearchQuery] = useState(initialState?.searchQuery ?? '');
  const [areaName, setAreaName] = useState<string | undefined>(undefined);
  const [aiueoTab, setAiueoTab] = useState(initialState?.aiueoTab ?? 'all');

  // キャッシュ復元済みフラグ（初回フェッチ時のローディング制御に使用）
  const restoredFromCache = useRef(initialState !== null);

  // 世代カウンタ: 検索・タブ・ページングの連続操作時に先発の遅いレスポンスが
  // 後発の結果を上書きするのを防ぐ（リクエスト順序逆転対策 #231）
  const genRef = useRef(0);

  // サーバーサイドデータ取得
  const fetchPlots = useCallback(async () => {
    // TTL内の有効なキャッシュがあればフェッチをスキップ
    if (restoredFromCache.current) {
      restoredFromCache.current = false;
      return;
    }
    const myGen = ++genRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const params: PlotSearchParams = {
        page,
        limit,
        search: searchQuery || undefined,
        areaName,
      };

      // あいう順タブ → カタカナキーに変換してサーバーへ送信
      if (aiueoTab !== 'all') {
        const kataKey = HIRAGANA_TO_KATAKANA_MAP[aiueoTab];
        if (kataKey) {
          params.nameKanaPrefix = kataKey;
        }
      }

      const response = await getPlots(params);

      // 最新リクエスト以外の結果は破棄
      if (myGen !== genRef.current) return;

      if (response.success) {
        setPlots(response.data.items);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);

        // キャッシュに保存
        saveCachedState({
          plots: response.data.items,
          total: response.data.total,
          page,
          totalPages: response.data.totalPages,
          searchQuery,
          aiueoTab,
        });
      } else {
        setError(response.error.message);
        setPlots([]);
      }
    } catch {
      if (myGen !== genRef.current) return;
      setError('データの取得に失敗しました');
      setPlots([]);
    } finally {
      // 古いリクエストの finally で isLoading を落とさない
      if (myGen === genRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, limit, searchQuery, areaName, aiueoTab]);

  // 初回・依存変更時に自動取得
  useEffect(() => {
    if (autoFetch) {
      fetchPlots();
    }
  }, [fetchPlots, autoFetch]);

  // 検索クエリ変更時はページを1にリセット
  const handleSetSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // エリア変更時もページをリセット
  const handleSetAreaName = useCallback((area: string | undefined) => {
    setAreaName(area);
    setPage(1);
  }, []);

  // あいうえおタブ変更時もページをリセット
  const handleSetAiueoTab = useCallback((tab: string) => {
    setAiueoTab(tab);
    setPage(1);
  }, []);

  return {
    // 状態
    plots,
    total,
    page,
    totalPages,
    isLoading,
    error,
    // フィルタ状態
    searchQuery,
    areaName,
    aiueoTab,
    // アクション
    setPage,
    setSearch: handleSetSearch,
    setAreaName: handleSetAreaName,
    setAiueoTab: handleSetAiueoTab,
    refresh: fetchPlots,
  };
}

// ===== 詳細キャッシュ =====

const DETAIL_CACHE_TTL = 2 * 60 * 1000; // 2分
const detailCache = new Map<string, { data: PlotDetailResponse; timestamp: number }>();

function getCachedDetail(id: string): PlotDetailResponse | null {
  const cached = detailCache.get(id);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > DETAIL_CACHE_TTL) {
    detailCache.delete(id);
    return null;
  }
  return cached.data;
}

function saveCachedDetail(id: string, data: PlotDetailResponse): void {
  detailCache.set(id, { data, timestamp: Date.now() });
}

export function clearDetailCache(id?: string): void {
  if (id) {
    detailCache.delete(id);
  } else {
    detailCache.clear();
  }
}

// ===== usePlotDetail: 区画詳細フック =====

interface UsePlotDetailReturn {
  plot: PlotDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePlotDetail(id: string | null): UsePlotDetailReturn {
  // キャッシュから初期値を取得（stale-while-revalidate）
  const cachedData = id ? getCachedDetail(id) : null;
  const [plot, setPlot] = useState<PlotDetailResponse | null>(cachedData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restoredFromDetailCache = useRef(cachedData !== null);

  // 内部用フェッチャー: force=true でキャッシュ短絡を無視して必ずネットワーク取得
  const fetchPlotInternal = useCallback(async (force: boolean) => {
    if (!id) {
      setPlot(null);
      return;
    }

    // 初回マウント時は TTL 内キャッシュがあればフェッチをスキップ。
    // refresh() からの呼び出し（force=true）は常に再取得する。
    if (!force && restoredFromDetailCache.current) {
      restoredFromDetailCache.current = false;
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPlotById(id, { includeHistory: true });

      if (response.success) {
        setPlot(response.data);
        saveCachedDetail(id, response.data);
        restoredFromDetailCache.current = false;
      } else {
        setError(response.error.message);
        setPlot(null);
      }
    } catch {
      setError('データの取得に失敗しました');
      setPlot(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 初回マウント / id 変更時の取得
  const fetchPlot = useCallback(async () => {
    await fetchPlotInternal(false);
  }, [fetchPlotInternal]);

  // 明示的な再取得（refresh）: キャッシュを無視して必ず最新を取得
  const refresh = useCallback(async () => {
    await fetchPlotInternal(true);
  }, [fetchPlotInternal]);

  // IDが変わったらキャッシュから即座に表示
  useEffect(() => {
    if (id) {
      const cached = getCachedDetail(id);
      if (cached) {
        setPlot(cached);
        restoredFromDetailCache.current = true;
      } else {
        restoredFromDetailCache.current = false;
      }
    } else {
      setPlot(null);
    }
  }, [id]);

  useEffect(() => {
    fetchPlot();
  }, [fetchPlot]);

  return {
    plot,
    isLoading,
    error,
    refresh,
  };
}

// ===== usePlotMutations: 区画変更フック =====

interface UsePlotMutationsReturn {
  // 作成/更新 API は PlotDetailResponse ではなく CreatePlotResponse 形状を返す（#217）。
  // フル詳細が必要な場合は getPlotById で再取得する（update は内部で再取得済み）。
  create: (request: CreatePlotRequest) => Promise<CreatePlotResponse | null>;
  update: (id: string, request: UpdatePlotRequest) => Promise<CreatePlotResponse | null>;
  remove: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function usePlotMutations(): UsePlotMutationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (request: CreatePlotRequest): Promise<CreatePlotResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createPlot(request);

      if (response.success) {
        // リストキャッシュをクリア（新規追加で一覧が変わるため）
        sessionStorage.removeItem(CACHE_KEY);
        return response.data;
      } else {
        setError(response.error.message);
        return null;
      }
    } catch {
      setError('作成に失敗しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, request: UpdatePlotRequest): Promise<CreatePlotResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updatePlot(id, request);

      if (response.success) {
        // 更新APIのレスポンスは histories を含まないため、ここで上書きすると
        // 履歴タブが空になってしまう（issue #51）。
        // 履歴込みで再取得してキャッシュを更新する。
        try {
          const refetched = await getPlotById(id, { includeHistory: true });
          if (refetched.success) {
            saveCachedDetail(id, refetched.data);
          } else {
            // 再取得に失敗したらキャッシュをクリア（次回マウント時に再フェッチ）
            clearDetailCache(id);
          }
        } catch {
          clearDetailCache(id);
        }
        // リストキャッシュはクリア（一覧の表示名等が変わる可能性あり）
        sessionStorage.removeItem(CACHE_KEY);
        return response.data;
      } else {
        setError(response.error.message);
        return null;
      }
    } catch {
      setError('更新に失敗しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deletePlot(id);

      if (response.success) {
        // 詳細キャッシュとリストキャッシュをクリア
        clearDetailCache(id);
        sessionStorage.removeItem(CACHE_KEY);
        return true;
      } else {
        setError(response.error.message);
        return false;
      }
    } catch {
      setError('削除に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    update,
    remove,
    isLoading,
    error,
  };
}

// ===== 型エクスポート =====

export type { PlotSearchParams, PlotListResult } from '@/lib/api/plots';
