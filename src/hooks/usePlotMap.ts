'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPlotMap } from '@/lib/api/plot-map';
import type { PlotMapId, PlotMapOverlayPlot } from '@/lib/plot-maps/types';

export function usePlotMap(mapId: PlotMapId | null) {
  const [plots, setPlots] = useState<PlotMapOverlayPlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!mapId) {
      setPlots([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPlotMap(mapId);
      if (response.success) {
        setPlots(response.data.plots);
      } else {
        setError(response.error?.message || '区画図データの取得に失敗しました');
        setPlots([]);
      }
    } catch {
      setError('区画図データの取得に失敗しました');
      setPlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { plots, isLoading, error, refresh };
}
