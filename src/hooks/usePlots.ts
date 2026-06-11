/**
 * usePlots - 区画データ管理フック
 *
 * useCustomers の区画ベース版
 * @komine/types の型を直接使用し、変換なしでAPIレスポンスを扱う
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { PlotDetailResponse } from '@komine/types';
import { getPlotById } from '@/lib/api/plots';

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
