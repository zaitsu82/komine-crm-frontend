'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { PLOT_MAPS } from '@/lib/plot-maps/catalog';
import { overlayLayoutWithPlots } from '@/lib/plot-maps/overlay';
import type { PlotMapCellView, PlotMapId, PlotMapOverlayPlot, PlotMapStatus } from '@/lib/plot-maps/types';
import { PlotMapLegend } from './PlotMapLegend';
import { PlotMapPanel } from './PlotMapPanel';

const CELL_STYLE: Record<PlotMapStatus, string> = {
  vacant: 'bg-matsu-50 border-matsu text-matsu-dark font-semibold',
  reserved: 'bg-kohaku-50 border-kohaku text-kohaku-dark',
  contracted: 'bg-white border-gin text-sumi',
  unsellable: 'bg-yellow-100 border-yellow-400 text-hai',
};

interface PlotSectionMapProps {
  mapId: PlotMapId;
  plots: PlotMapOverlayPlot[];
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
}

export function PlotSectionMap({ mapId, plots, isLoading, error, onClose }: PlotSectionMapProps) {
  const definition = PLOT_MAPS[mapId];
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const cells = useMemo(
    () =>
      definition ? overlayLayoutWithPlots(definition.cells, definition.sectionKeys, plots) : [],
    [definition, plots]
  );
  const cellByPos = useMemo(() => {
    const map = new Map<string, PlotMapCellView>();
    for (const cell of cells) {
      map.set(`${cell.row}-${cell.col}`, cell);
    }
    return map;
  }, [cells]);

  const selected = (selectedKey && cellByPos.get(selectedKey)) || null;
  const cellRem = definition && (definition.rows > 40 || definition.columns > 28) ? 2.15 : 3.25;

  if (!definition) {
    return null;
  }

  return (
    <section
      id="plot-section-map"
      className="mt-4 rounded-elegant-lg border border-matsu-200 bg-white p-3 md:p-4 shadow-elegant"
      aria-label={`${definition.title} 区画図`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mincho text-lg font-semibold text-sumi">{definition.title} 区画図</h3>
          <p className="mt-1 text-xs text-hai">Excelの区画図と同じ並びです。緑が空き、黄が売却不可です。</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-elegant border border-gin px-3 py-1.5 text-xs text-hai hover:bg-kinari"
        >
          地図を閉じる
        </button>
      </div>

      <PlotMapLegend className="mt-3" />

      {error && <p className="mt-3 text-sm text-beni">{error}</p>}
      {isLoading && <p className="mt-3 text-sm text-hai">契約データを読み込み中…</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-h-[70vh] overflow-auto pb-2">
          <div
            className="grid w-max gap-1"
            style={{ gridTemplateColumns: `repeat(${definition.columns}, minmax(${cellRem}rem, ${cellRem}rem))` }}
          >
            {Array.from({ length: definition.rows * definition.columns }, (_, index) => {
              const row = Math.floor(index / definition.columns);
              const col = index % definition.columns;
              const cell = cellByPos.get(`${row}-${col}`);
              if (!cell) {
                return (
                  <div
                    key={`empty-${row}-${col}`}
                    style={{ height: `${cellRem}rem`, width: `${cellRem}rem` }}
                  />
                );
              }
              const isSelected = selectedKey === `${cell.row}-${cell.col}`;
              return (
                <MapCellButton
                  key={`${cell.row}-${cell.col}`}
                  cell={cell}
                  selected={isSelected}
                  sizeRem={cellRem}
                  onSelect={() => setSelectedKey(`${cell.row}-${cell.col}`)}
                />
              );
            })}
          </div>
        </div>
        <PlotMapPanel cell={selected} />
      </div>
    </section>
  );
}

function MapCellButton({
  cell,
  selected,
  sizeRem,
  onSelect,
}: {
  cell: PlotMapCellView;
  selected: boolean;
  sizeRem: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${cell.plotLabel}番 ${cell.displayLabel}`}
      style={{ height: `${sizeRem}rem`, width: `${sizeRem}rem` }}
      className={cn(
        'flex flex-col items-center justify-center rounded-sm border px-0.5 text-center transition-shadow',
        CELL_STYLE[cell.status],
        selected && 'ring-2 ring-ai ring-offset-1'
      )}
    >
      <span className="font-mono text-[10px] leading-none">{cell.plotLabel}</span>
      <span className="mt-0.5 max-w-full truncate text-[10px] leading-tight">{cell.displayLabel}</span>
    </button>
  );
}
