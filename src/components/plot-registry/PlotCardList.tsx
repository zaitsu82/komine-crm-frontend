import type { ReactNode } from 'react';
import { PlotListItem, PaymentStatus } from '@komine/types';
import { cn, truncateAddressToCity } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_VARIANTS } from './constants';
import { formatContractDate, getRowBgColor, getStatusBadge } from './utils';

interface PlotCardListProps {
  plots: PlotListItem[];
  isLoading: boolean;
  startIndex: number;
  selectedPlotId?: string;
  onPlotSelect: (plot: PlotListItem) => void;
  emptyState: ReactNode;
}

/** 区画一覧カード（モバイル: md 未満）issue #120 */
export function PlotCardList({
  plots,
  isLoading,
  startIndex,
  selectedPlotId,
  onPlotSelect,
  emptyState,
}: PlotCardListProps) {
  return (
    <div className="md:hidden flex-1 min-w-0 overflow-auto -mx-1 px-1">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-elegant border border-gin bg-white p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
              <Skeleton className="mt-1.5 h-3 w-40" />
            </div>
          ))}
        </div>
      ) : plots.length > 0 ? (
        <ul className="space-y-2">
          {plots.map((plot, index) => {
            const absoluteIndex = startIndex + index;
            const paymentStatus = plot.paymentStatus as PaymentStatus;
            return (
              <li key={plot.id}>
                <button
                  type="button"
                  data-testid="plot-card"
                  onClick={() => onPlotSelect(plot)}
                  className={cn(
                    'w-full min-h-[44px] rounded-elegant border border-gin bg-white p-3 text-left shadow-sm transition-colors',
                    'active:bg-matsu-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-matsu',
                    selectedPlotId === plot.id && 'border-matsu bg-matsu-50 ring-1 ring-matsu',
                    getRowBgColor(plot, absoluteIndex)
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getStatusBadge(plot)}
                      <span className="font-mono text-matsu font-semibold text-sm truncate">
                        {plot.plotNumber}
                      </span>
                      {plot.areaName && (
                        <span className="text-xs text-hai truncate">{plot.areaName}</span>
                      )}
                    </div>
                    {paymentStatus && (
                      <StatusBadge
                        variant={PAYMENT_STATUS_VARIANTS[paymentStatus]}
                        size="sm"
                        withSymbol
                      >
                        {PAYMENT_STATUS_LABELS[paymentStatus]}
                      </StatusBadge>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sumi text-sm truncate">
                        {plot.customerName || '-'}
                      </div>
                      {plot.customerNameKana && (
                        <div className="text-xs text-hai truncate">{plot.customerNameKana}</div>
                      )}
                    </div>
                    <div className="text-xs text-hai whitespace-nowrap tabular-nums">
                      {formatContractDate(plot.contractDate)}
                    </div>
                  </div>
                  {plot.customerAddress && (
                    <div className="mt-1 text-xs text-hai truncate">
                      {truncateAddressToCity(plot.customerAddress)}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-elegant border border-gin bg-white px-4 py-6">{emptyState}</div>
      )}
    </div>
  );
}
