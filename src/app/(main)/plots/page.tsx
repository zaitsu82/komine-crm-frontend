'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlotListItem } from '@komine/types';
import PlotRegistry from '@/components/plot-registry';

export default function PlotsPage() {
  const router = useRouter();

  const handlePlotSelect = (plot: PlotListItem) => {
    router.push(`/plots/${plot.id}`);
  };

  const handleNewPlot = () => {
    router.push('/plots/new');
  };

  // ホバー時にルートを事前読み込みして遷移を高速化
  const handlePlotHover = useCallback((plot: PlotListItem) => {
    router.prefetch(`/plots/${plot.id}`);
  }, [router]);

  return (
    <PlotRegistry
      onPlotSelect={handlePlotSelect}
      onNewPlot={handleNewPlot}
      onPlotHover={handlePlotHover}
    />
  );
}
