'use client';

/**
 * PlotListTable - 区画一覧テーブルコンポーネント
 *
 * @komine/types の PlotListItem を直接使用し、Customer型への変換なしで表示
 * Phase 2: Plot-centric migration
 */

import { useMemo, useState, type KeyboardEvent } from 'react';
import { PlotListItem, PaymentStatus } from '@komine/types';
import { usePlots } from '@/hooks/usePlots';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type SortKey = 'customerName' | 'areaName' | 'plotNumber' | 'contractDate' | 'paymentStatus';
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
  [PaymentStatus.Cancelled]: 'キャンセル',
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: 'text-kohaku-dark bg-kohaku-50',
  [PaymentStatus.Paid]: 'text-matsu-dark bg-matsu-50',
  [PaymentStatus.PartialPaid]: 'text-kohaku-dark bg-kohaku-50',
  [PaymentStatus.Overdue]: 'text-beni bg-beni-50',
  [PaymentStatus.Refunded]: 'text-ai bg-ai-50',
  [PaymentStatus.Cancelled]: 'text-hai bg-kinari',
};

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
      <div className="bg-gradient-to-r from-matsu-50 to-kinari border-b border-matsu-100 px-6 py-5">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-matsu to-matsu-dark flex items-center justify-center shadow-elegant-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-mincho text-xl font-semibold text-sumi tracking-wide">{title}</h2>
            <p className="text-sm text-hai mt-0.5">区画・契約情報の検索と管理</p>
          </div>
        </div>
      </div>

      {/* あいうえおタブ */}
      {showAiueoTabs && (
        <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm mx-6 mt-4 p-3">
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
        <div className="mx-6 mt-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-sumi">並び替え:</span>
            <div className="flex items-center gap-2">
              <Select value={sortKey} onValueChange={(value: SortKey) => setSortKey(value)}>
                <SelectTrigger className="w-[160px] bg-white border-gin">
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
                <SelectTrigger className="w-[120px] bg-white border-gin">
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
        <div className="mx-6 mt-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="氏名、区画番号、電話番号で検索..."
              className="flex-1 border-gin"
            />
            <Button onClick={() => { setSearchInput(''); setSearch(''); }} variant="outline" size="sm">
              クリア
            </Button>
            <Button onClick={handleSearch} variant="default" size="sm">
              検索
            </Button>
            <Button onClick={refresh} variant="outline" size="sm">
              更新
            </Button>
          </div>
        </div>
      )}

      {/* 件数表示 */}
      <div className="mx-6 mt-4 flex items-center justify-between">
        <p className="text-sm text-hai">
          検索結果: <span className="font-bold text-sumi text-lg">{total}</span> 件
        </p>
      </div>

      {/* テーブル */}
      <div className="mx-6 mt-4 bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden flex-1">
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
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50',
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
                    'px-4 py-3 text-left text-sm font-semibold text-sumi cursor-pointer transition-colors duration-200 hover:bg-cha-50',
                    sortKey === 'contractDate' && 'bg-cha-50'
                  )}
                  onClick={() => handleSort('contractDate')}
                >
                  <div className="flex items-center">
                    <span>契約年</span>
                    {renderSortIndicator('contractDate')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sumi">
                  電話番号
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gin">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-hai">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-matsu mr-2"></div>
                      データを読み込み中...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-beni">
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-sumi">
                            {plot.customerName || '-'}
                          </div>
                          <div className="text-sm text-hai">
                            {plot.customerNameKana || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi">
                        {plot.areaName || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-sumi">
                        {plot.plotNumber || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi">
                        {contractYear}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-sumi">
                        {plot.customerPhoneNumber || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {paymentStatus && (
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              PAYMENT_STATUS_COLORS[paymentStatus]
                            )}
                          >
                            {PAYMENT_STATUS_LABELS[paymentStatus]}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-hai">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gin mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-base font-medium">
                        {searchQuery.trim()
                          ? '検索条件に該当するデータが見つかりませんでした'
                          : 'データがありません'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      <div className="mx-6 mt-4 mb-6 flex items-center justify-between text-sm text-hai">
        <span>全 {total} 件</span>
      </div>
    </div>
  );
}
