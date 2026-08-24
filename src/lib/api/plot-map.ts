import { apiGet, shouldUseMockData } from './client';
import { ApiResponse } from './types';
import type { PlotMapId, PlotMapOverlayPlot } from '@/lib/plot-maps/types';

export interface PlotMapResponse {
  mapId: PlotMapId;
  plots: PlotMapOverlayPlot[];
}

function mockPlots(mapId: PlotMapId): PlotMapOverlayPlot[] {
  if (mapId === '2-1') {
    return [
      {
        id: 'mock-1-90',
        plotNumber: '1-90',
        displayNumber: '1-90',
        areaName: '1',
        areaSqm: 1,
        overlayStatus: 'contracted',
        contractorName: '柴田',
        reservationDate: null,
        contractPlotId: 'mock-cp-90',
      },
      {
        id: 'mock-1-96',
        plotNumber: '1-96',
        displayNumber: '1-96',
        areaName: '1',
        areaSqm: 1,
        overlayStatus: 'reserved',
        contractorName: '疋田',
        reservationDate: '2026-04-01',
        contractPlotId: 'mock-cp-96',
      },
      {
        id: 'mock-1-97',
        plotNumber: '1-97',
        displayNumber: '1-97',
        areaName: '1',
        areaSqm: 1,
        overlayStatus: 'vacant',
        contractorName: null,
        reservationDate: null,
        contractPlotId: null,
      },
    ];
  }
  return [];
}

export async function getPlotMap(mapId: PlotMapId): Promise<ApiResponse<PlotMapResponse>> {
  if (shouldUseMockData()) {
    return { success: true, data: { mapId, plots: mockPlots(mapId) } };
  }
  return apiGet<PlotMapResponse>('/plots/inventory/map', { mapId });
}
