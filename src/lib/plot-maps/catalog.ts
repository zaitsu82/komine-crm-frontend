import { GENERATED_LAYOUTS } from './generated-layouts';
import type { PlotMapDefinition, PlotMapId } from './types';

export const PLOT_MAPS: Record<PlotMapId, PlotMapDefinition> = Object.fromEntries(
  GENERATED_LAYOUTS.map((layout) => [layout.id, layout])
);

export const PLOT_MAP_IDS = GENERATED_LAYOUTS.map((layout) => layout.id);
