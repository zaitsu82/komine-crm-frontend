import { cn } from '@/lib/utils';
import { AIUEO_TABS } from './constants';

interface PlotAiueoTabsProps {
  activeTab: string;
  focusedTabIndex: number;
  onTabChange: (tabKey: string) => void;
  onTabKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

/** あいう順タブ（折りたたみ、デスクトップのみ）。 */
export function PlotAiueoTabs({ activeTab, focusedTabIndex, onTabChange, onTabKeyDown }: PlotAiueoTabsProps) {
  return (
    <div className="mb-3 p-3 bg-white border border-gin rounded-elegant hidden md:block">
      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label="あいう順で絞り込み"
      >
        {AIUEO_TABS.map((tab, index) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              aria-controls="plot-list"
              tabIndex={focusedTabIndex === index ? 0 : -1}
              onClick={() => onTabChange(tab.key)}
              onKeyDown={(e) => onTabKeyDown(e, index)}
              className={cn(
                "aiueo-tab",
                "min-w-[44px] min-h-[44px] text-base",
                isActive && "active"
              )}
            >
              {tab.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
