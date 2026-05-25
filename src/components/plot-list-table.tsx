'use client';

/**
 * PlotListTable - 区画一覧テーブルコンポーネント
 *
 * @komine/types の PlotListItem を直接使用し、Customer型への変換なしで表示
 * Phase 2: Plot-centric migration
 */

import { useMemo, useState, type KeyboardEvent } from 'react';
import { PlotListItem, PaymentStatus, BillingRecordStatus } from '@komine/types';
import { usePlots } from '@/hooks/usePlots';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, type StatusBadgeProps } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

// ===== 型定義 =====

interface PlotListTableProps {
  onPlotSelect?: (plot: PlotListItem) => void;
  selectedPlotId?: string;
  title?: string;
  showSearch?: boolean;
  showSortControls?: boolean;
  showAiueoTabs?: boolean;
}

type SortKey = 'customerName' | 'areaName' | 'plotNumber' | 'contractDate' | 'physicalPlotAreaSqm' | 'uncollectedAmount' | 'paymentStatus';
type SortOrder = 'asc' | 'desc';

// ===== あいうえおタブ =====

const AIUEO_TABS = [
  { key: 'all', label: '全て' },
  { key: 'あ', label: 'あ' },
  { key: 'か', label: 'か' },
  { key: 'さ', label: 'さ' },
  { key: 'た', label: 'た' },
  { key: 'な', label: 'な' },
  { key: 'は', label: 'は' },
  { key: 'ま', label: 'ま' },
  { key: 'や', label: 'や' },
  { key: 'ら', label: 'ら' },
  { key: 'わ', label: 'わ' },
];

// ===== 支払いステータスラベル =====

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: '未入金',
  [PaymentStatus.Paid]: '入金済',
  [PaymentStatus.PartialPaid]: '一部入金',
  [PaymentStatus.Overdue]: '滞納',
  [PaymentStatus.Refunded]: '返金済',
};

const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, StatusBadgeProps['variant']> = {
  [PaymentStatus.Unpaid]: 'unpaid',
  [PaymentStatus.Paid]: 'paid',
  [PaymentStatus.PartialPaid]: 'partial',
  [PaymentStatus.Overdue]: 'overdue',
  [PaymentStatus.Refunded]: 'refunded',
};

// ===== 請求状況サマリ（B10: 年度別請求 status の集約列）=====

const BILLING_STATUS_LABELS: Record<BillingRecordStatus, string> = {
  [BillingRecordStatus.Pending]: '請求前',
  [BillingRecordStatus.Billed]: '請求済',
  [BillingRecordStatus.PartialPaid]: '一部入金',
  [BillingRecordStatus.Paid]: '完納',
  [BillingRecordStatus.Overdue]: '延滞',
  [BillingRecordStatus.Terminated]: '解約',
  [BillingRecordStatus.WrittenOff]: '貸倒',
};

const BILLING_STATUS_VARIANTS: Record<BillingRecordStatus, StatusBadgeProps['variant']> = {
  [BillingRecordStatus.Pending]: 'neutral',
  [BillingRecordStatus.Billed]: 'unpaid',
  [BillingRecordStatus.PartialPaid]: 'partial',
  [BillingRecordStatus.Paid]: 'paid',
  [BillingRecordStatus.Overdue]: 'overdue',
  [BillingRecordStatus.Terminated]: 'cancelled',
  [BillingRecordStatus.WrittenOff]: 'cancelled',
};

/**
 * 請求状況サマリのバッジ群。
 * 最新年度の status バッジ ＋ 未納年数バッジを表示する。Billing が無ければ「—」。
 */
export function BillingSummaryBadges({ summary }: { summary: PlotListItem['billingSummary'] }) {
  if (!summary?.hasBilling) {
    return <span className="text-sm text-hai">—</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {summary.latestYear !== null && summary.latestYearStatus && (
        <StatusBadge
          variant={BILLING_STATUS_VARIANTS[summary.latestYearStatus]}
          size="sm"
          withSymbol
        >
          {summary.latestYear}年 {BILLING_STATUS_LABELS[summary.latestYearStatus]}
        </StatusBadge>
      )}
      {summary.unpaidYearCount > 0 && (
        <StatusBadge variant="overdue" size="sm" withSymbol>
          未納{summary.unpaidYearCount}年
        </StatusBadge>
      )}
    </div>
  );
}

// ===== ヘルパー関数 =====

function getContractYear(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return '-';
  }
}

// ===== コンポーネント =====

export default function PlotListTable({
  onPlotSelect,
  selectedPlotId,
  title = '台帳問い合わせ',
  showSearch = true,
  showSortControls = true,
  showAiueoTabs = true,
}: PlotListTableProps) {
  // ローカルソート状態（クライアントサイド）
  const [sortKey, setSortKey] = useState<SortKey>('customerName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  // 埋葬者名を一覧に併記表示するかのトグル（旧画面「埋葬者を含む」相当）
  const [showBuriedPersons, setShowBuriedPersons] = useState(false);

  // usePlotsフックを使用（サーバーサイド検索）
  const {
    plots,
    total,
    isLoading,
    error,
    searchQuery,
    aiueoTab,
    setSearch,
    setAiueoTab,
    refresh,
  } = usePlots();

  // 検索入力（キャッシュされたsearchQueryから復元）
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
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
  };

  // クライアントサイドソート
  const sortedPlots = useMemo(() => {
    const sorted = [...plots];

    sorted.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortKey) {
        case 'customerName':
          aValue = a.customerNameKana || a.customerName || '';
          bValue = b.customerNameKana || b.customerName || '';
          break;
        case 'areaName':
          aValue = a.areaName || '';
          bValue = b.areaName || '';
          break;
        case 'plotNumber':
          aValue = a.plotNumber || '';
          bValue = b.plotNumber || '';
          break;
        case 'contractDate':
          aValue = a.contractDate || '';
          bValue = b.contractDate || '';
          break;
        case 'physicalPlotAreaSqm':
          aValue = a.physicalPlotAreaSqm || 0;
          bValue = b.physicalPlotAreaSqm || 0;
          break;
        case 'uncollectedAmount':
          aValue = a.uncollectedAmount || 0;
          bValue = b.uncollectedAmount || 0;
          break;
        case 'paymentStatus':
          aValue = a.paymentStatus || '';
          bValue = b.paymentStatus || '';
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [plots, sortKey, sortOrder]);

  // ソートインジケーター
  const renderSortIndicator = (key: SortKey) => (
    <div className="ml-1 flex flex-col">
      <span className={cn('text-xs', sortKey === key && sortOrder === 'asc' && 'text-cha')}>▲</span>
      <span className={cn('text-xs -mt-1', sortKey === key && sortOrder === 'desc' && 'text-cha')}>▼</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-matsu-50 to-kinari border-b border-matsu-100 px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-matsu to-matsu-dark flex items-center justify-center shadow-elegant-sm flex-shrink-0">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="font-mincho text-lg md:text-xl font-semibold text-sumi tracking-wide truncate">{title}</h2>
            <p className="text-xs md:text-sm text-hai mt-0.5 hidden sm:block">区画・契約情報の検索と管理</p>
          </div>
        </div>
      </div>

      {/* あいうえおタブ */}
      {showAiueoTabs && (
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm mx-3 md:mx-6 mt-3 md:mt-4 p-2 md:p-3">
          <div className="flex flex-wrap gap-1">
            {AIUEO_TABS.map((tab) => {
              const isActive = aiueoTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setAiueoTab(tab.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 min-w-[40px]',
                    isActive
                      ? 'bg-matsu text-white shadow-elegant-sm'
                      : 'text-hai hover:text-sumi hover:bg-kinari'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ソートコントロール */}
      {showSortControls && (
        <div className="mx-3 md:mx-6 mt-3 md:mt-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <span className="text-sm font-medium text-sumi">並び替え:</span>
            <div className="flex items-center gap-2">
              <Select value={sortKey} onValueChange={(value: SortKey) => setSortKey(value)}>
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-white border-gin">
                  <SelectValue placeholder="項目を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customerName">氏名</SelectItem>
                  <SelectItem value="areaName">エリア</SelectItem>
                  <SelectItem value="plotNumber">区画番号</SelectItem>
                  <SelectItem value="contractDate">契約日</SelectItem>
                  <SelectItem value="paymentStatus">入金状況</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger className="w-[100px] sm:w-[120px] bg-white border-gin">
                  <SelectValue placeholder="順序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">昇順 ↑</SelectItem>
                  <SelectItem value="desc">降順 ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => { setSortKey('areaName'); setSortOrder('asc'); }}
                variant={sortKey === 'areaName' ? 'default' : 'outline'}
                size="sm"
              >
                エリア順
              </Button>
              <Button
                onClick={() => { setSortKey('customerName'); setSortOrder('asc'); }}
                variant={sortKey === 'customerName' ? 'default' : 'outline'}
                size="sm"
              >
                氏名順
              </Button>
              <Button
                onClick={() => { setSortKey('contractDate'); setSortOrder('desc'); }}
                variant={sortKey === 'contractDate' ? 'default' : 'outline'}
                size="sm"
              >
                契約日順
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 検索エリア */}
      {showSearch && (
        <div className="mx-3 md:mx-6 mt-3 md:mt-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="氏名、区画番号、電話番号で検索..."
              className="flex-1 border-gin"
            />
            <div className="flex items-center gap-2">
              <Button onClick={() => { setSearchInput(''); setSearch(''); }} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                クリア
              </Button>
              <Button onClick={handleSearch} variant="default" size="sm" className="flex-1 sm:flex-initial">
                検索
              </Button>
              <Button onClick={refresh} variant="outline" size="sm" className="flex-1 sm:flex-initial">
                更新
              </Button>
            </div>
          </div>
          {/* 表示オプション */}
          <div className="mt-3 pt-3 border-t border-gin flex items-center gap-2">
            <Switch
              id="toggle-include-buried-persons"
              checked={showBuriedPersons}
              onCheckedChange={setShowBuriedPersons}
            />
            <label
              htmlFor="toggle-include-buried-persons"
              className="text-sm text-sumi cursor-pointer select-none"
            >
              埋葬者を含む
            </label>
          </div>
        </div>
      )}

      {/* 件数表示 */}
      <div className="mx-3 md:mx-6 mt-3 md:mt-4 flex items-center justify-between">
        <p className="text-sm text-hai">
          検索結果: <span className="font-bold text-sumi text-lg">{total}</span> 件
        </p>
      </div>

      {/* テーブル */}
      <div className="mx-3 md:mx-6 mt-3 md:mt-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden flex-1">
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead>
              <tr className="bg-kinari border-b border-gin">
                <th
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50',
                    sortKey === 'customerName' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center">
                    <span>氏名</span>
                    {renderSortIndicator('customerName')}
                  </div>
                </th>
                <th
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50 hidden sm:table-cell',
                    sortKey === 'areaName' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('areaName')}
                >
                  <div className="flex items-center">
                    <span>エリア</span>
                    {renderSortIndicator('areaName')}
                  </div>
                </th>
                <th
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50',
                    sortKey === 'plotNumber' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('plotNumber')}
                >
                  <div className="flex items-center">
                    <span>区画番号</span>
                    {renderSortIndicator('plotNumber')}
                  </div>
                </th>
                <th
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50 hidden sm:table-cell',
                    sortKey === 'contractDate' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('contractDate')}
                >
                  <div className="flex items-center">
                    <span>契約年</span>
                    {renderSortIndicator('contractDate')}
                  </div>
                </th>
                <th
                  className={cn(
                    'px-4 py-3 text-right text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50 hidden sm:table-cell',
                    sortKey === 'physicalPlotAreaSqm' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('physicalPlotAreaSqm')}
                >
                  <div className="flex items-center justify-end">
                    <span>面積</span>
                    {renderSortIndicator('physicalPlotAreaSqm')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi hidden lg:table-cell">
                  許可番号
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi hidden md:table-cell">
                  電話番号
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi hidden lg:table-cell">
                  住所
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-sumi hidden md:table-cell">
                  管理料
                </th>
                <th
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50',
                    sortKey === 'paymentStatus' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('paymentStatus')}
                >
                  <div className="flex items-center">
                    <span>入金状況</span>
                    {renderSortIndicator('paymentStatus')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi hidden md:table-cell">
                  請求状況
                </th>
                <th
                  className={cn(
                    'px-4 py-3 text-right text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50 hidden sm:table-cell',
                    sortKey === 'uncollectedAmount' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('uncollectedAmount')}
                >
                  <div className="flex items-center justify-end">
                    <span>未集金額</span>
                    {renderSortIndicator('uncollectedAmount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gin">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-sm text-hai">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-matsu mr-2"></div>
                      データを読み込み中...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-sm text-beni">
                    エラーが発生しました: {error}
                  </td>
                </tr>
              ) : sortedPlots.length > 0 ? (
                sortedPlots.map((plot, index) => {
                  const contractYear = getContractYear(plot.contractDate);
                  const paymentStatus = plot.paymentStatus as PaymentStatus;

                  return (
                    <tr
                      key={plot.id}
                      className={cn(
                        'cursor-pointer transition-all duration-200 hover:bg-cha-50',
                        selectedPlotId === plot.id && 'bg-matsu-50',
                        index % 2 === 0 ? 'bg-white' : 'bg-shiro'
                      )}
                      onClick={() => onPlotSelect?.(plot)}
                    >
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-sumi">
                            {plot.customerName || '-'}
                          </div>
                          <div className="text-xs md:text-sm text-hai">
                            {plot.customerNameKana || ''}
                          </div>
                          {showBuriedPersons && plot.buriedPersonNames.length > 0 && (
                            <div className="mt-1 text-xs text-hai whitespace-normal max-w-[260px]">
                              <span className="text-cha font-medium">埋葬者:</span>{' '}
                              {plot.buriedPersonNames.join('、')}
                            </div>
                          )}
                          {/* モバイル専用: エリアと未集金額を補足表示 */}
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-hai sm:hidden">
                            {plot.areaName && <span>{plot.areaName}</span>}
                            {(plot.uncollectedAmount ?? 0) > 0 && (
                              <span className="text-beni font-medium tabular-nums">
                                未収 {(plot.uncollectedAmount ?? 0).toLocaleString()}円
                              </span>
                            )}
                            {plot.billingSummary?.unpaidYearCount > 0 && (
                              <span className="text-beni font-medium">
                                未納{plot.billingSummary.unpaidYearCount}年
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-sm text-sumi hidden sm:table-cell">
                        {plot.areaName || '-'}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-sm font-semibold text-sumi tabular-nums">
                        {plot.plotNumber || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi hidden sm:table-cell">
                        {contractYear}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi text-right hidden sm:table-cell">
                        {plot.physicalPlotAreaSqm}㎡
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi hidden lg:table-cell">
                        {plot.permitNumber || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi hidden md:table-cell">
                        {plot.customerPhoneNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-sumi max-w-[200px] truncate hidden lg:table-cell">
                        {plot.customerAddress || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi text-right hidden md:table-cell">
                        {plot.managementFee ? `${Number(plot.managementFee).toLocaleString()}円` : '-'}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-sm">
                        {paymentStatus && (
                          <StatusBadge
                            variant={PAYMENT_STATUS_VARIANTS[paymentStatus]}
                            withSymbol
                          >
                            {PAYMENT_STATUS_LABELS[paymentStatus]}
                          </StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell">
                        <BillingSummaryBadges summary={plot.billingSummary} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right hidden sm:table-cell">
                        <span className={cn(
                          'font-medium tabular-nums',
                          (plot.uncollectedAmount ?? 0) > 0 ? 'text-beni' : 'text-sumi'
                        )}>
                          {(plot.uncollectedAmount ?? 0).toLocaleString()}円
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 md:px-6 py-6">
                    <EmptyState
                      container="plain"
                      icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                        </svg>
                      }
                      title={
                        searchQuery.trim()
                          ? '検索条件に該当する区画が見つかりませんでした'
                          : '区画データがまだありません'
                      }
                      description={
                        searchQuery.trim()
                          ? '氏名・区画番号・電話番号の綴りを見直すか、あいうえおタブを切り替えて再検索してください。'
                          : '条件を変えるか、一括登録から区画を追加してください。'
                      }
                      action={
                        searchQuery.trim() ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSearchInput(''); setSearch(''); setAiueoTab('all'); }}
                          >
                            検索条件をクリア
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      <div className="mx-3 md:mx-6 mt-3 md:mt-4 mb-4 md:mb-6 flex items-center justify-between text-sm text-hai">
        <span>全 {total} 件</span>
      </div>
    </div>
  );
}
