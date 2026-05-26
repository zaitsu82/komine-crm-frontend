import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { AIUEO_TABS } from './constants';

interface PlotToolbarProps {
  isFilterExpanded: boolean;
  onToggleFilter: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isAiueoExpanded: boolean;
  onToggleAiueo: () => void;
  activeTab: string;
  onClearFilters: () => void;
  hasCustomColumnWidths: boolean;
  onResetColumnWidths: () => void;
  showBuriedPersons: boolean;
  onToggleBuriedPersons: (checked: boolean) => void;
}

/** フィルタ・あいう順の切替ボタン + アクティブ条件バッジ + 列幅リセット + 埋葬者表示。 */
export function PlotToolbar({
  isFilterExpanded,
  onToggleFilter,
  hasActiveFilters,
  activeFilterCount,
  isAiueoExpanded,
  onToggleAiueo,
  activeTab,
  onClearFilters,
  hasCustomColumnWidths,
  onResetColumnWidths,
  showBuriedPersons,
  onToggleBuriedPersons,
}: PlotToolbarProps) {
  return (
    <div className="mb-3 flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onToggleFilter}
        aria-expanded={isFilterExpanded}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 h-9 rounded-elegant border text-xs sm:text-sm transition-colors',
          isFilterExpanded || hasActiveFilters
            ? 'bg-ai-50 text-ai border-ai-200'
            : 'bg-white text-hai border-gin hover:bg-kinari'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        フィルター
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center w-4 h-4 bg-ai text-white text-[10px] font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
        {isFilterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <button
        type="button"
        onClick={onToggleAiueo}
        aria-expanded={isAiueoExpanded}
        className={cn(
          'hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-elegant border text-xs sm:text-sm transition-colors',
          isAiueoExpanded || activeTab !== '全'
            ? 'bg-matsu-50 text-matsu border-matsu-200'
            : 'bg-white text-hai border-gin hover:bg-kinari'
        )}
      >
        あいう順
        {activeTab !== '全' && (
          <span className="inline-flex items-center justify-center px-1.5 h-4 bg-matsu text-white text-[10px] font-bold rounded-full">
            {AIUEO_TABS.find((t) => t.key === activeTab)?.shortLabel}
          </span>
        )}
        {isAiueoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1 px-2 h-9 rounded-elegant text-xs text-beni hover:bg-beni-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          フィルタ解除
        </button>
      )}

      {hasCustomColumnWidths && (
        <button
          type="button"
          onClick={onResetColumnWidths}
          className="hidden md:inline-flex items-center gap-1 px-2 h-9 rounded-elegant text-xs text-hai hover:bg-kinari transition-colors ml-auto"
          title="列幅を初期状態に戻す"
        >
          <X className="w-3.5 h-3.5" />
          列幅をリセット
        </button>
      )}

      <label
        className={cn(
          'hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm text-hai cursor-pointer select-none',
          !hasCustomColumnWidths && 'ml-auto'
        )}
      >
        <input
          type="checkbox"
          checked={showBuriedPersons}
          onChange={(e) => onToggleBuriedPersons(e.target.checked)}
          className="rounded border-gin accent-matsu"
        />
        埋葬者を表示
      </label>
    </div>
  );
}
