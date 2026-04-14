'use client';

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

  return (
    <PlotRegistry
      onPlotSelect={handlePlotSelect}
      onNewPlot={handleNewPlot}
    />
  );
}
