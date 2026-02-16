'use client';

/**
 * PlotRegistry - 区画台帳一覧コンポーネント
 *
 * サーバーサイド検索・ソート・ページネーション対応
 * @komine/types の PlotListItem を直接使用し、Customer型への変換なし。
 */

import { useState, useEffect, useCallback } from 'react';
import { PlotListItem, PaymentStatus } from '@komine/types';
import {
  getPlots,
  getPlotDisplayStatus,
} from '@/lib/api/plots';
import type { PlotSearchParams } from '@/lib/api/plots';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ===== 型定義 =====

interface PlotRegistryProps {
  onPlotSelect: (plot: PlotListItem) => void;
  selectedPlotId?: string;
  onNewPlot?: () => void;
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
  }, [currentPage, itemsPerPage, searchQuery, activeTab, sortKey, sortOrder]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  // 検索実行（Enterキーまたは検索ボタンクリック）
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    if (searchInput.trim()) {
      setActiveTab('全');
    }
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
    <div className="h-full flex flex-col">
      {/* 検索バー */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="氏名・フリガナ・区画番号・電話番号で検索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-10 text-sm"
          />
        </div>
        <Button
          onClick={handleSearch}
          variant="matsu"
          size="default"
          className="h-10"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          検索
        </Button>
        {onNewPlot && (
          <Button
            onClick={onNewPlot}
            variant="outline"
            size="default"
            className="h-10"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </Button>
        )}
      </div>

      {/* あいう順タブ */}
      <div className="mb-4">
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

      {/* 区画一覧テーブル */}
      <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant overflow-hidden flex-1">
        <div className="overflow-auto h-full">
          <table className="w-full divide-y divide-gin text-sm table-fixed">
{/* 状態 / 区画No / エリア / 契約者(残り幅) / 電話 / 契約日 / 入金 / 管理料 / 次請求 */}
            <colgroup><col className="w-[44px]" /><col className="w-[72px]" /><col className="w-[60px]" /><col /><col className="w-[110px]" /><col className="w-[68px]" /><col className="w-[68px]" /><col className="w-[80px]" /><col className="w-[68px]" /></colgroup>
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
                <th
                  className={cn(
                    "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
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
                <th
                  className={cn(
                    "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
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
                    "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'managementFee' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('managementFee')}
                >
                  <div className="flex items-center justify-center">
                    <span>管理料</span>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-bold text-white">
                  <span>次請求</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gin">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-hai">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin w-8 h-8 text-matsu mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-base font-medium">データを読み込み中...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-beni">
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
                      <td className="px-2 py-2 text-xs text-hai truncate" title={plot.customerPhoneNumber || undefined}>
                        {plot.customerPhoneNumber || '-'}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai text-center">
                        {formatContractDate(plot.contractDate)}
                      </td>
                      <td className="px-2 py-2 text-xs text-center">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          paymentStatus === PaymentStatus.Paid && 'bg-matsu-50 text-matsu',
                          paymentStatus === PaymentStatus.Unpaid && 'bg-kohaku-50 text-kohaku-dark',
                          paymentStatus === PaymentStatus.PartialPaid && 'bg-kohaku-50 text-kohaku-dark',
                          paymentStatus === PaymentStatus.Overdue && 'bg-beni-50 text-beni',
                          paymentStatus === PaymentStatus.Refunded && 'bg-ai-50 text-ai-dark',
                          paymentStatus === PaymentStatus.Cancelled && 'bg-gin text-hai',
                        )}>
                          {PAYMENT_STATUS_LABELS[paymentStatus] || '-'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-hai text-center">
                        {formatMoneyString(plot.managementFee)}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai truncate" title={plot.nextBillingDate ? new Date(plot.nextBillingDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' }) : undefined}>
                        {plot.nextBillingDate ? new Date(plot.nextBillingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-hai">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gin mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-base font-medium">該当する区画が見つかりません</p>
                      <p className="text-sm mt-1">検索条件を変更してください</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーションコントロール */}
      <div className="mt-3 flex items-center justify-between text-sm">
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

        <div className="flex items-center gap-2 text-hai">
          <span>表示件数:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="h-10 px-3 border border-gin rounded-elegant text-sm bg-white text-sumi focus:outline-none focus:ring-2 focus:ring-matsu transition-all duration-250 cursor-pointer"
          >
            <option value={50}>50件</option>
            <option value={100}>100件</option>
          </select>
        </div>
      </div>
    </div>
  );
}
