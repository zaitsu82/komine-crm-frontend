/**
 * usePlots - 区画データ管理フック
 *
 * useCustomers の区画ベース版
 * @komine/types の型を直接使用し、変換なしでAPIレスポンスを扱う
 */

import { useState, useCallback, useEffect } from 'react';
import {
  PlotListItem,
  PlotDetailResponse,
  CreatePlotRequest,
  UpdatePlotRequest,
} from '@komine/types';
import {
  getPlots,
  getPlotById,
  createPlot,
  updatePlot,
  deletePlot,
  PlotSearchParams,
} from '@/lib/api/plots';

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

  // 状態
  const [plots, setPlots] = useState<PlotListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フィルタ状態
  const [searchQuery, setSearchQuery] = useState('');
  const [areaName, setAreaName] = useState<string | undefined>(undefined);
  const [aiueoTab, setAiueoTab] = useState('all');

  // サーバーサイドデータ取得
  const fetchPlots = useCallback(async () => {
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

      if (response.success) {
        setPlots(response.data.items);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error.message);
        setPlots([]);
      }
    } catch {
      setError('データの取得に失敗しました');
      setPlots([]);
    } finally {
      setIsLoading(false);
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

// ===== usePlotDetail: 区画詳細フック =====

interface UsePlotDetailReturn {
  plot: PlotDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePlotDetail(id: string | null): UsePlotDetailReturn {
  const [plot, setPlot] = useState<PlotDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlot = useCallback(async () => {
    if (!id) {
      setPlot(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getPlotById(id, { includeHistory: true });

      if (response.success) {
        setPlot(response.data);
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

  useEffect(() => {
    fetchPlot();
  }, [fetchPlot]);

  return {
    plot,
    isLoading,
    error,
    refresh: fetchPlot,
  };
}

// ===== usePlotMutations: 区画変更フック =====

interface UsePlotMutationsReturn {
  create: (request: CreatePlotRequest) => Promise<PlotDetailResponse | null>;
  update: (id: string, request: UpdatePlotRequest) => Promise<PlotDetailResponse | null>;
  remove: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function usePlotMutations(): UsePlotMutationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (request: CreatePlotRequest): Promise<PlotDetailResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createPlot(request);

      if (response.success) {
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

  const update = useCallback(async (id: string, request: UpdatePlotRequest): Promise<PlotDetailResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updatePlot(id, request);

      if (response.success) {
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
