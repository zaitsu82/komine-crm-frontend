import type { ReactNode } from 'react';
import { PlotListItem, PaymentStatus } from '@komine/types';
import { cn, truncateAddressToCity } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_VARIANTS } from './constants';
import { formatContractDate, getRowBgColor, getSearchHitReason } from './utils';

interface PlotCardListProps {
  plots: PlotListItem[];
  isLoading: boolean;
  startIndex: number;
  selectedPlotId?: string;
  onPlotSelect: (plot: PlotListItem) => void;
  emptyState: ReactNode;
  /** 検索語。氏名以外でヒットしたカードにヒット理由バッジを出すために使用（#162） */
  searchQuery?: string;
}

/** 区画一覧カード（モバイル: md 未満）issue #120 */
export function PlotCardList({
  plots,
  isLoading,
  startIndex,
  selectedPlotId,
  onPlotSelect,
  emptyState,
  searchQuery,
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
            const hitReason = getSearchHitReason(plot, searchQuery);
            return (
              <li key={plot.id}>
                <button
                  type="button"
                  data-testid="plot-card"
                  onClick={() => onPlotSelect(plot)}
                  className={cn(
                    'w-full min-h-[44px] rounded-elegant border border-gin bg-white p-3 text-left shadow-sm transition-colors',
                    'active:bg-matsu-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-matsu',
                    // 選択は藍(ai)アクセントでホバー(緑)と区別 (#190)
                    selectedPlotId === plot.id && 'border-ai bg-ai-50 ring-1 ring-ai',
                    getRowBgColor(plot, absoluteIndex)
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-matsu font-semibold text-sm truncate">
                        {plot.displayNumber || plot.plotNumber}
                      </span>
                      {plot.areaName && (
                        <span className="text-xs text-hai truncate">{plot.areaName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {paymentStatus && (
                        <StatusBadge
                          variant={PAYMENT_STATUS_VARIANTS[paymentStatus]}
                          size="sm"
                          withSymbol
                        >
                          {PAYMENT_STATUS_LABELS[paymentStatus]}
                        </StatusBadge>
                      )}
                      {/* 詳細を開くシェブロン (#163) */}
                      <svg className="w-4 h-4 text-hai" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sumi text-sm truncate">
                        {plot.customerName || '-'}
                      </div>
                      {plot.customerNameKana && (
                        <div className="text-xs text-hai truncate">{plot.customerNameKana}</div>
                      )}
                      {hitReason && (
                        <span className="mt-0.5 inline-block rounded bg-ai-50 text-ai-700 border border-ai-200 px-1 py-px text-[10px] font-medium leading-tight">
                          {hitReason}
                        </span>
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
