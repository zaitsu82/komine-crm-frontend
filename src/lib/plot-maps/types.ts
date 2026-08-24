export type PlotMapId = string;

export type PlotMapStatus = 'vacant' | 'reserved' | 'contracted' | 'unsellable';

export type PlotMapOverlayStatus = 'vacant' | 'reserved' | 'contracted';

export interface PlotMapLayoutCell {
  row: number;
  col: number;
  plotLabel: string;
  unsellable?: boolean;
}

export interface PlotMapOverlayPlot {
  id: string;
  plotNumber: string;
  displayNumber: string | null;
  areaName: string;
  areaSqm: number;
  overlayStatus: PlotMapOverlayStatus;
  contractorName: string | null;
  reservationDate: string | null;
  contractPlotId: string | null;
}

export interface PlotMapCellView {
  row: number;
  col: number;
  plotLabel: string;
  status: PlotMapStatus;
  displayLabel: string;
  areaSqm: number | null;
  contractorName: string | null;
  reservationDate: string | null;
  physicalPlotId: string | null;
  contractPlotId: string | null;
}

export interface PlotMapDefinition {
  id: PlotMapId;
  period: string;
  title: string;
  /** 在庫テーブルの区画名（area_name）候補 */
  sectionKeys: string[];
  columns: number;
  rows: number;
  cells: PlotMapLayoutCell[];
}
