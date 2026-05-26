import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlotSearchBarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  searchHistory: string[];
  onUseHistoryItem: (query: string) => void;
  onClearHistory: () => void;
  onNewPlot?: () => void;
}

export function PlotSearchBar({
  searchInput,
  onSearchInputChange,
  onSearch,
  isLoading,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  searchHistory,
  onUseHistoryItem,
  onClearHistory,
  onNewPlot,
}: PlotSearchBarProps) {
  return (
    <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      <div className="relative flex-1 sm:max-w-md">
        <Input
          type="text"
          placeholder="氏名・フリガナ・区画番号・電話番号・住所・埋葬者名で検索..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          className="h-10 text-sm"
          autoComplete="off"
        />
        {/* 検索履歴ドロップダウン */}
        {isSearchFocused && searchHistory.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gin rounded-elegant shadow-elegant-lg z-20 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-gin bg-kinari/50">
              <span className="text-[11px] font-semibold text-hai">最近の検索</span>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onClearHistory();
                }}
                className="text-[11px] text-hai hover:text-beni transition-colors"
              >
                履歴をクリア
              </button>
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {searchHistory.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onUseHistoryItem(q);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sumi hover:bg-kinari transition-colors text-left"
                  >
                    <svg className="w-3.5 h-3.5 text-hai shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{q}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Button
        onClick={onSearch}
        variant="matsu"
        size="default"
        className="h-10"
        disabled={isLoading}
      >
        {isLoading ? (
          <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        {isLoading ? '検索中...' : '検索'}
      </Button>
      {onNewPlot && (
        <div className="sm:ml-auto">
          <Button
            onClick={onNewPlot}
            variant="outline"
            size="default"
            className="h-10 cursor-pointer w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </Button>
        </div>
      )}
    </div>
  );
}
