'use client';

import { PlotSectionMap } from './PlotSectionMap';
import { usePlotMap } from '@/hooks/usePlotMap';
import type { PlotMapId } from '@/lib/plot-maps/types';

export function PlotMapSection({ mapId, onClose }: { mapId: PlotMapId; onClose: () => void }) {
  const { plots, isLoading, error } = usePlotMap(mapId);
  return (
    <PlotSectionMap
      mapId={mapId}
      plots={plots}
      isLoading={isLoading}
      error={error}
      onClose={onClose}
    />
  );
}
