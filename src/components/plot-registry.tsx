'use client';

/**
 * PlotRegistry - 区画台帳一覧コンポーネント
 *
 * サーバーサイド検索・ソート・ページネーション対応
 * @komine/types の PlotListItem を直接使用し、Customer型への変換なし。
 */

import { useState, useEffect, useCallback } from 'react';
import { PlotListItem, PaymentStatus, PhysicalPlotStatus } from '@komine/types';
import {
  getPlots,
  getPlotDisplayStatus,
} from '@/lib/api/plots';
import type { PlotSearchParams } from '@/lib/api/plots';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, truncateAddressToCity } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, type StatusBadgeProps } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import PageHeader from '@/components/page-header';
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';

// ===== 検索履歴 =====

const SEARCH_HISTORY_KEY = 'komine:plots:search-history';
const SEARCH_HISTORY_MAX = 5;

function loadSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, SEARCH_HISTORY_MAX) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, SEARCH_HISTORY_MAX)));
  } catch {
    // ignore quota/disabled errors
  }
}

// ===== 型定義 =====

interface PlotRegistryProps {
  onPlotSelect: (plot: PlotListItem) => void;
  selectedPlotId?: string;
  onNewPlot?: () => void;
  onPlotHover?: (plot: PlotListItem) => void;
}

// ===== あいう順タブ =====

interface AiueoTab {
  key: string;
  label: string;
  shortLabel: string;
  kataKey?: string;
}

const AIUEO_TABS: AiueoTab[] = [
  { key: 'あ', label: 'あ行', shortLabel: 'あ', kataKey: 'ア' },
  { key: 'か', label: 'か行', shortLabel: 'か', kataKey: 'カ' },
  { key: 'さ', label: 'さ行', shortLabel: 'さ', kataKey: 'サ' },
  { key: 'た', label: 'た行', shortLabel: 'た', kataKey: 'タ' },
  { key: 'な', label: 'な行', shortLabel: 'な', kataKey: 'ナ' },
  { key: 'は', label: 'は行', shortLabel: 'は', kataKey: 'ハ' },
  { key: 'ま', label: 'ま行', shortLabel: 'ま', kataKey: 'マ' },
  { key: 'や', label: 'や行', shortLabel: 'や', kataKey: 'ヤ' },
  { key: 'ら', label: 'ら行', shortLabel: 'ら', kataKey: 'ラ' },
  { key: 'わ', label: 'わ行', shortLabel: 'わ', kataKey: 'ワ' },
  { key: 'その他', label: 'その他', shortLabel: '他' },
  { key: '全', label: '全て表示', shortLabel: '全' },
];

type SortKey = 'status' | 'plotNumber' | 'customerName' | 'phoneNumber' | 'areaName' | 'contractDate' | 'paymentStatus' | 'managementFee';
type SortOrder = 'asc' | 'desc';

// サーバーサイドソート対応マッピング
const SERVER_SORT_MAP: Partial<Record<SortKey, string>> = {
  plotNumber: 'plotNumber',
  customerName: 'customerName',
  contractDate: 'contractDate',
  paymentStatus: 'paymentStatus',
  managementFee: 'managementFee',
};

// ===== 支払ステータス表示 =====

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: '未入金',
  [PaymentStatus.Paid]: '入金済',
  [PaymentStatus.PartialPaid]: '一部入金',
  [PaymentStatus.Overdue]: '滞納',
  [PaymentStatus.Refunded]: '返金済',
  [PaymentStatus.Cancelled]: 'キャンセル',
};

const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, StatusBadgeProps['variant']> = {
  [PaymentStatus.Unpaid]: 'unpaid',
  [PaymentStatus.Paid]: 'paid',
  [PaymentStatus.PartialPaid]: 'partial',
  [PaymentStatus.Overdue]: 'overdue',
  [PaymentStatus.Refunded]: 'refunded',
  [PaymentStatus.Cancelled]: 'cancelled',
};

const PLOT_STATUS_LABELS: Record<PhysicalPlotStatus, string> = {
  [PhysicalPlotStatus.Available]: '利用可能',
  [PhysicalPlotStatus.PartiallySold]: '一部販売済',
  [PhysicalPlotStatus.SoldOut]: '完売',
};

// ===== ヘルパー =====

function formatContractDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}`;
  } catch {
    return '-';
  }
}

function formatMoneyString(value: string | null | undefined): string {
  if (!value) return '-';
  const num = Number(value.replace(/,/g, ''));
  if (isNaN(num)) return '-';
  return `${num.toLocaleString()}円`;
}

// ===== コンポーネント =====

export default function PlotRegistry({
  onPlotSelect,
  selectedPlotId,
  onNewPlot,
  onPlotHover,
}: PlotRegistryProps) {
  const [activeTab, setActiveTab] = useState('全');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [plots, setPlots] = useState<PlotListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedTabIndex, setFocusedTabIndex] = useState(11);
  const [sortKey, setSortKey] = useState<SortKey>('plotNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // フィルタ
  const [filterStatus, setFilterStatus] = useState<PhysicalPlotStatus | undefined>(undefined);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | undefined>(undefined);
  const [filterAreaName, setFilterAreaName] = useState('');
  const [showBuriedPersons, setShowBuriedPersons] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isAiueoExpanded, setIsAiueoExpanded] = useState(false);

  // 検索履歴
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setSearchHistory(loadSearchHistory());
  }, []);

  // サーバーサイドページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // サーバーサイドデータ取得
  const fetchPlots = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PlotSearchParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // あいう順タブ → カタカナキーに変換してサーバーへ送信
      const tabDef = AIUEO_TABS.find(t => t.key === activeTab);
      if (tabDef?.kataKey) {
        params.nameKanaPrefix = tabDef.kataKey;
      }

      // フィルタ
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (filterPaymentStatus) {
        params.paymentStatus = filterPaymentStatus;
      }
      if (filterAreaName.trim()) {
        params.areaName = filterAreaName.trim();
      }

      // サーバー対応ソートキーのみ送信
      const serverSortKey = SERVER_SORT_MAP[sortKey];
      if (serverSortKey) {
        params.sortBy = serverSortKey;
        params.sortOrder = sortOrder;
      }

      const response = await getPlots(params);
      if (response.success) {
        setPlots(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error?.message || 'データの取得に失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, activeTab, sortKey, sortOrder, filterStatus, filterPaymentStatus, filterAreaName]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  // 検索実行（Enterキーまたは検索ボタンクリック）
  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setSearchQuery(searchInput);
    setCurrentPage(1);
    setIsSearchFocused(false);
    if (trimmed) {
      setActiveTab('全');
      // 履歴に追加（重複排除、最新が先頭）
      setSearchHistory((prev) => {
        const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, SEARCH_HISTORY_MAX);
        saveSearchHistory(next);
        return next;
      });
    }
  };

  const handleUseHistoryItem = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
    setCurrentPage(1);
    setActiveTab('全');
    setIsSearchFocused(false);
    setSearchHistory((prev) => {
      const next = [query, ...prev.filter((q) => q !== query)].slice(0, SEARCH_HISTORY_MAX);
      saveSearchHistory(next);
      return next;
    });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
  };

  // フィルタ変更ハンドラ
  const hasActiveFilters = filterStatus !== undefined || filterPaymentStatus !== undefined || filterAreaName.trim() !== '';

  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value === 'all' ? undefined : value as PhysicalPlotStatus);
    setCurrentPage(1);
  };

  const handleFilterPaymentStatusChange = (value: string) => {
    setFilterPaymentStatus(value === 'all' ? undefined : value as PaymentStatus);
    setCurrentPage(1);
  };

  const handleFilterAreaNameChange = (value: string) => {
    setFilterAreaName(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterStatus(undefined);
    setFilterPaymentStatus(undefined);
    setFilterAreaName('');
    setCurrentPage(1);
  };

  // ページネーション表示用
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + plots.length;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // タブのキーボードナビゲーション
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedTabIndex((index + 1) % AIUEO_TABS.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedTabIndex((index - 1 + AIUEO_TABS.length) % AIUEO_TABS.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(AIUEO_TABS[index].key);
    }
  };

  // ステータスバッジ
  const getStatusBadge = (plot: PlotListItem) => {
    const status = getPlotDisplayStatus(plot);
    switch (status) {
      case 'overdue':
        return <span className="inline-block w-6 h-6 rounded-full bg-beni text-white text-xs leading-6 text-center" title="滞納">滞</span>;
      case 'attention':
        return <span className="inline-block w-6 h-6 rounded-full bg-kohaku text-white text-xs leading-6 text-center" title="未入金">未</span>;
      default:
        return <span className="inline-block w-6 h-6 rounded-full bg-matsu text-white text-xs leading-6 text-center" title="正常">正</span>;
    }
  };

  // 行背景色
  const getRowBgColor = (plot: PlotListItem, absoluteIndex: number) => {
    const status = getPlotDisplayStatus(plot);
    if (status === 'overdue') return 'bg-beni-50';
    if (status === 'attention') return 'bg-kohaku-50';
    return absoluteIndex % 2 === 0 ? 'bg-white' : 'bg-kinari';
  };

  // ソートインジケーター
  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => (
    <div className="flex flex-col ml-1">
      <span className={cn(
        "text-[10px] leading-none",
        sortKey === columnKey && sortOrder === 'asc' ? 'text-kohaku' : 'text-matsu-200'
      )}>▲</span>
      <span className={cn(
        "text-[10px] leading-none",
        sortKey === columnKey && sortOrder === 'desc' ? 'text-kohaku' : 'text-matsu-200'
      )}>▼</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        title="台帳問い合わせ"
        subtitle="区画情報の検索・閲覧"
        theme="matsu"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      <div className="flex-1 overflow-auto p-3 md:p-6">
        {/* 検索バー + アクション */}
        <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Input
              type="text"
              placeholder="氏名・フリガナ・区画番号・電話番号・住所・埋葬者名で検索..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
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
                      handleClearHistory();
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
                          handleUseHistoryItem(q);
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
            onClick={handleSearch}
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

        {/* フィルタ・あいう順の切替ボタン + アクティブ条件バッジ */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFilterExpanded((v) => !v)}
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
                {[filterStatus, filterPaymentStatus, filterAreaName.trim() || undefined].filter(Boolean).length}
              </span>
            )}
            {isFilterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsAiueoExpanded((v) => !v)}
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
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2 h-9 rounded-elegant text-xs text-beni hover:bg-beni-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              フィルタ解除
            </button>
          )}

          <label className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm text-hai cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={showBuriedPersons}
              onChange={(e) => setShowBuriedPersons(e.target.checked)}
              className="rounded border-gin accent-matsu"
            />
            埋葬者を表示
          </label>
        </div>

        {/* フィルタ行（折りたたみ） */}
        {isFilterExpanded && (
          <div className="mb-3 p-3 bg-white border border-gin rounded-elegant grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 sm:flex-wrap">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-hai whitespace-nowrap">区画:</span>
              <Select value={filterStatus || 'all'} onValueChange={handleFilterStatusChange}>
                <SelectTrigger className="w-full sm:w-32 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全て</SelectItem>
                  {Object.entries(PLOT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-hai whitespace-nowrap">入金:</span>
              <Select value={filterPaymentStatus || 'all'} onValueChange={handleFilterPaymentStatusChange}>
                <SelectTrigger className="w-full sm:w-32 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全て</SelectItem>
                  {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-hai whitespace-nowrap">エリア:</span>
              <Input
                type="text"
                placeholder="エリア名"
                value={filterAreaName}
                onChange={(e) => handleFilterAreaNameChange(e.target.value)}
                className="w-full sm:w-28 h-9 text-sm"
              />
            </div>
            <label className="md:hidden items-center gap-1.5 text-xs sm:text-sm text-hai cursor-pointer col-span-2 select-none flex">
              <input
                type="checkbox"
                checked={showBuriedPersons}
                onChange={(e) => setShowBuriedPersons(e.target.checked)}
                className="rounded border-gin accent-matsu"
              />
              埋葬者を表示
            </label>
          </div>
        )}

        {/* あいう順タブ（折りたたみ、デスクトップのみ） */}
        {isAiueoExpanded && (
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
                    onClick={() => handleTabChange(tab.key)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
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
        )}

        {/* 区画一覧テーブル */}
        <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant overflow-hidden flex-1">
          <div className="overflow-auto h-full">
            <table className="w-full divide-y divide-gin text-sm table-fixed">
              {/* 状態 / 区画No / エリア / 契約者 / 住所 / 電話 / 取扱 / 許可番号 / 備考(flex) / [埋葬者] / 契約日 / 入金 / 管理料 / 次請求 */}
              <colgroup>
                <col className="w-[40px]" />
                <col className="w-[68px]" />
                <col className="w-[52px]" />
                <col className="w-[110px]" />
                <col className="hidden md:table-column w-[90px]" />
                <col className="hidden lg:table-column w-[100px]" />
                <col className="hidden lg:table-column w-[72px]" />
                <col className="hidden lg:table-column w-[96px]" />
                <col className="hidden md:table-column" />
                {showBuriedPersons && <col className="hidden lg:table-column w-[90px]" />}
                <col className="hidden sm:table-column w-[60px]" />
                <col className="w-[60px]" />
                <col className="hidden sm:table-column w-[72px]" />
                <col className="hidden md:table-column w-[60px]" />
              </colgroup>
              <thead className="bg-gradient-matsu sticky top-0 z-10">
                <tr>
                  <th
                    className={cn(
                      "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
                      "hover:bg-matsu-light",
                      sortKey === 'status' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('status')}
                    title="入金状況"
                  >
                    <div className="flex items-center justify-center">
                      <span>状態</span>
                    </div>
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
                      "hover:bg-matsu-light",
                      sortKey === 'plotNumber' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('plotNumber')}
                  >
                    <div className="flex items-center">
                      <span>区画No</span>
                      <SortIndicator columnKey="plotNumber" />
                    </div>
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
                      "hover:bg-matsu-light",
                      sortKey === 'areaName' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('areaName')}
                  >
                    <div className="flex items-center">
                      <span>エリア</span>
                      <SortIndicator columnKey="areaName" />
                    </div>
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
                      "hover:bg-matsu-light",
                      sortKey === 'customerName' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      <span>契約者</span>
                      <SortIndicator columnKey="customerName" />
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white hidden md:table-cell">
                    <span>住所</span>
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200 hidden lg:table-cell",
                      "hover:bg-matsu-light",
                      sortKey === 'phoneNumber' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('phoneNumber')}
                  >
                    <div className="flex items-center">
                      <span>電話</span>
                      <SortIndicator columnKey="phoneNumber" />
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white hidden lg:table-cell">
                    <span>取扱</span>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white hidden lg:table-cell">
                    <span>許可番号</span>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white hidden md:table-cell">
                    <span>備考</span>
                  </th>
                  {showBuriedPersons && (
                    <th className="px-2 py-2 text-left text-xs font-bold text-white hidden lg:table-cell">
                      <span>埋葬者</span>
                    </th>
                  )}
                  <th
                    className={cn(
                      "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200 hidden sm:table-cell",
                      "hover:bg-matsu-light",
                      sortKey === 'contractDate' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('contractDate')}
                  >
                    <div className="flex items-center justify-center">
                      <span>契約日</span>
                    </div>
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
                      "hover:bg-matsu-light",
                      sortKey === 'paymentStatus' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center justify-center">
                      <span>入金</span>
                    </div>
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200 hidden sm:table-cell",
                      "hover:bg-matsu-light",
                      sortKey === 'managementFee' && "bg-matsu-dark"
                    )}
                    onClick={() => handleSort('managementFee')}
                  >
                    <div className="flex items-center justify-center">
                      <span>管理料</span>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-bold text-white hidden md:table-cell">
                    <span>次請求</span>
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gin">
                {isLoading ? (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-2 py-2.5 text-center"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-14" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-10" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-14" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-full" /></td>
                        {showBuriedPersons && <td className="px-2 py-2.5"><Skeleton className="h-4 w-16" /></td>}
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-14" /></td>
                        <td className="px-2 py-2.5"><Skeleton className="h-4 w-12" /></td>
                      </tr>
                    ))}
                  </>
                ) : error ? (
                  <tr>
                    <td colSpan={showBuriedPersons ? 14 : 13} className="px-4 py-12 text-center text-beni">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-beni mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-base font-medium">{error}</p>
                        <button
                          onClick={fetchPlots}
                          className="mt-2 text-sm text-matsu underline hover:no-underline"
                        >
                          再読み込み
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : plots.length > 0 ? (
                  plots.map((plot, index) => {
                    const absoluteIndex = startIndex + index;
                    const paymentStatus = plot.paymentStatus as PaymentStatus;

                    return (
                      <tr
                        key={plot.id}
                        className={cn(
                          'cursor-pointer hover:bg-matsu-50 transition-all duration-200',
                          selectedPlotId === plot.id && 'bg-matsu-100 border-l-4 border-matsu',
                          getRowBgColor(plot, absoluteIndex)
                        )}
                        onClick={() => onPlotSelect(plot)}
                        onMouseEnter={() => onPlotHover?.(plot)}
                      >
                        <td className="px-2 py-2 text-center">
                          {getStatusBadge(plot)}
                        </td>
                        <td className="px-2 py-2 font-mono text-matsu font-medium text-xs truncate" title={plot.plotNumber}>
                          {plot.plotNumber}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai truncate" title={plot.areaName || undefined}>
                          {plot.areaName || '-'}
                        </td>
                        <td className="px-2 py-2">
                          <div className="truncate">
                            <div className="font-medium text-sumi text-sm truncate" title={plot.customerName || undefined}>
                              {plot.customerName || '-'}
                            </div>
                            <div className="text-xs text-hai truncate" title={plot.customerNameKana || undefined}>
                              {plot.customerNameKana || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs text-hai truncate hidden md:table-cell" title={plot.customerAddress || undefined}>
                          {truncateAddressToCity(plot.customerAddress)}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai truncate hidden lg:table-cell" title={plot.customerPhoneNumber || undefined}>
                          {plot.customerPhoneNumber || '-'}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai truncate hidden lg:table-cell" title={plot.agentName || undefined}>
                          {plot.agentName || '-'}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai tabular-nums truncate hidden lg:table-cell" title={plot.permitNumber || undefined}>
                          {plot.permitNumber || '-'}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai hidden md:table-cell">
                          <div
                            className="line-clamp-2 break-all"
                            title={[plot.contractNotes, plot.customerNotes].filter(Boolean).join(' / ')}
                          >
                            {[plot.contractNotes, plot.customerNotes].filter(Boolean).join(' / ') || '-'}
                          </div>
                        </td>
                        {showBuriedPersons && (
                          <td className="px-2 py-2 text-xs text-hai truncate hidden lg:table-cell" title={plot.buriedPersonNames?.join(', ') || undefined}>
                            {plot.buriedPersonNames && plot.buriedPersonNames.length > 0 ? plot.buriedPersonNames.join(', ') : '-'}
                          </td>
                        )}
                        <td className="px-2 py-2 text-xs text-hai text-center hidden sm:table-cell">
                          {formatContractDate(plot.contractDate)}
                        </td>
                        <td className="px-2 py-2 text-xs text-center">
                          {paymentStatus ? (
                            <StatusBadge
                              variant={PAYMENT_STATUS_VARIANTS[paymentStatus]}
                              size="sm"
                              withSymbol
                            >
                              {PAYMENT_STATUS_LABELS[paymentStatus]}
                            </StatusBadge>
                          ) : (
                            <span className="text-hai">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai text-center hidden sm:table-cell">
                          {formatMoneyString(plot.managementFee)}
                        </td>
                        <td className="px-2 py-2 text-xs text-hai truncate hidden md:table-cell" title={plot.nextBillingDate ? new Date(plot.nextBillingDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' }) : undefined}>
                          {plot.nextBillingDate ? new Date(plot.nextBillingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={showBuriedPersons ? 14 : 13} className="px-4 md:px-6 py-6">
                      <EmptyState
                        container="plain"
                        icon={
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                          </svg>
                        }
                        title={hasActiveFilters || searchQuery.trim() || activeTab !== '全'
                          ? '該当する区画が見つかりませんでした'
                          : '区画データがまだありません'}
                        description={hasActiveFilters || searchQuery.trim() || activeTab !== '全'
                          ? '検索語やフィルターを緩めて再検索してください。'
                          : '新規区画を登録するとここに表示されます。'}
                        action={(hasActiveFilters || searchQuery.trim() || activeTab !== '全') ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchInput('');
                              setSearchQuery('');
                              handleClearFilters();
                              setActiveTab('全');
                            }}
                          >
                            条件をクリア
                          </Button>
                        ) : undefined}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ページネーションコントロール */}
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-4 text-hai">
            <div>
              <span className="font-semibold text-sumi">{totalItems > 0 ? startIndex + 1 : 0}</span>
              〜
              <span className="font-semibold text-sumi">{endIndex}</span>
              {' / '}
              <span className="font-semibold text-sumi">{totalItems}</span> 件
              {activeTab !== '全' && (
                <span className="ml-2">（{AIUEO_TABS.find(t => t.key === activeTab)?.label}）</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="h-8 px-3"
            >
              ← 前へ
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const pageNumbers: (number | string)[] = [];
                const maxVisiblePages = 5;

                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) pageNumbers.push(i);
                    pageNumbers.push('...');
                    pageNumbers.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pageNumbers.push(1);
                    pageNumbers.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
                  } else {
                    pageNumbers.push(1);
                    pageNumbers.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
                    pageNumbers.push('...');
                    pageNumbers.push(totalPages);
                  }
                }

                return pageNumbers.map((page, idx) => (
                  typeof page === 'number' ? (
                    <Button
                      key={idx}
                      variant={page === currentPage ? 'matsu' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={idx} className="px-1 text-hai">...</span>
                  )
                ));
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 px-3"
            >
              次へ →
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-hai">
            <span>表示件数:</span>
            <Select value={String(itemsPerPage)} onValueChange={(v) => handleItemsPerPageChange(Number(v))}>
              <SelectTrigger className="w-24 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50件</SelectItem>
                <SelectItem value="100">100件</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
