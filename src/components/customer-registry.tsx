'use client';

import { useState, useMemo } from 'react';
import { Customer } from '@/types/customer';
import { mockCustomers, filterByAiueo, sortByKana } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, calculateOwnedPlotsInfo } from '@/lib/utils';

interface CustomerRegistryProps {
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomer?: Customer;
  onNewCustomer?: () => void;
  customerAttentionNotes?: Record<string, { content: string; priority: string }>;
}

// あいう順タブの定義（高齢者に優しいデザイン）
const AIUEO_TABS = [
  { key: 'あ', label: 'あ行', shortLabel: 'あ' },
  { key: 'か', label: 'か行', shortLabel: 'か' },
  { key: 'さ', label: 'さ行', shortLabel: 'さ' },
  { key: 'た', label: 'た行', shortLabel: 'た' },
  { key: 'な', label: 'な行', shortLabel: 'な' },
  { key: 'は', label: 'は行', shortLabel: 'は' },
  { key: 'ま', label: 'ま行', shortLabel: 'ま' },
  { key: 'や', label: 'や行', shortLabel: 'や' },
  { key: 'ら', label: 'ら行', shortLabel: 'ら' },
  { key: 'わ', label: 'わ行', shortLabel: 'わ' },
  { key: 'その他', label: 'その他', shortLabel: '他' },
  { key: '全', label: '全て表示', shortLabel: '全' }
];

type SortKey = 'status' | 'customerCode' | 'name' | 'nameKana' | 'address' | 'phoneNumber' | 'plotNumber' | 'applicant' | 'buried' | 'nextBilling' | 'notes' | 'ownedPlots' | 'contractDate';
type SortOrder = 'asc' | 'desc';

export default function CustomerRegistry({ onCustomerSelect, selectedCustomer, onNewCustomer, customerAttentionNotes }: CustomerRegistryProps) {
  const [activeTab, setActiveTab] = useState('全');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [focusedTabIndex, setFocusedTabIndex] = useState(11);
  const [sortKey, setSortKey] = useState<SortKey>('customerCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // ページネーション用state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Enterキーでも検索実行
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchWithReset();
    }
  };

  // ソート処理の追加
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // フィルタされた顧客リスト
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // 検索クエリでフィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.nameKana.toLowerCase().includes(query) ||
        customer.customerCode.toLowerCase().includes(query) ||
        customer.phoneNumber.includes(query) ||
        (customer.plotInfo?.plotNumber?.toLowerCase().includes(query))
      );
    }

    // あいう順タブでフィルタ
    filtered = filterByAiueo(filtered, activeTab);

    // ソート処理
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortKey) {
        case 'status':
          // ステータス順（有効→解約済み）
          const statusOrder: Record<string, number> = { 'active': 0, 'inactive': 1 };
          aValue = statusOrder[a.status || 'active'] ?? 0;
          bValue = statusOrder[b.status || 'active'] ?? 0;
          break;
        case 'customerCode':
          aValue = a.customerCode;
          bValue = b.customerCode;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'nameKana':
          aValue = a.nameKana;
          bValue = b.nameKana;
          break;
        case 'address':
          aValue = a.address || '';
          bValue = b.address || '';
          break;
        case 'phoneNumber':
          aValue = a.phoneNumber;
          bValue = b.phoneNumber;
          break;
        case 'plotNumber':
          aValue = a.plotInfo?.plotNumber || a.plotNumber || '';
          bValue = b.plotInfo?.plotNumber || b.plotNumber || '';
          break;
        case 'applicant':
          aValue = a.applicant || a.name;
          bValue = b.applicant || b.name;
          break;
        case 'buried':
          aValue = a.buriedPersons?.length || 0;
          bValue = b.buriedPersons?.length || 0;
          break;
        case 'ownedPlots':
          aValue = a.ownedPlots ? calculateOwnedPlotsInfo(a.ownedPlots).totalAreaSqm : 0;
          bValue = b.ownedPlots ? calculateOwnedPlotsInfo(b.ownedPlots).totalAreaSqm : 0;
          break;
        case 'contractDate':
          // 契約日でソート
          const getContractTimestamp = (customer: any) => {
            if (customer.applicantInfo?.applicationDate) {
              return new Date(customer.applicantInfo.applicationDate).getTime();
            }
            return 0;
          };
          aValue = getContractTimestamp(a);
          bValue = getContractTimestamp(b);
          break;
        case 'nextBilling':
          // 次回請求日でソート
          const getNextBillingTimestamp = (customer: any) => {
            if (customer.managementFeeInfo?.lastBillingMonth) {
              const lastBilling = new Date(customer.managementFeeInfo.lastBillingMonth);
              const nextBilling = new Date(lastBilling);
              if (customer.managementFeeInfo.billingType === 'monthly') {
                nextBilling.setMonth(nextBilling.getMonth() + 1);
              } else if (customer.managementFeeInfo.billingType === 'yearly') {
                nextBilling.setFullYear(nextBilling.getFullYear() + 1);
              }
              return nextBilling.getTime();
            }
            return 0;
          };
          aValue = getNextBillingTimestamp(a);
          bValue = getNextBillingTimestamp(b);
          break;
        case 'notes':
          aValue = a.notes || a.attentionNotes || '';
          bValue = b.notes || b.attentionNotes || '';
          break;
        default:
          aValue = a.customerCode;
          bValue = b.customerCode;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchQuery, activeTab, sortKey, sortOrder]);

  // ページネーション計算
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // ページ分割された顧客リスト
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, startIndex, endIndex]);

  // フィルタ条件が変わったらページを1に戻す
  const resetPage = () => setCurrentPage(1);

  // 検索やタブ変更時にページをリセット
  const handleSearchWithReset = () => {
    resetPage();
    if (searchQuery.trim()) {
      setActiveTab('全');
    }
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    resetPage();
  };

  // ページ移動
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // 表示件数変更
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // タブのキーボードナビゲーション
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % AIUEO_TABS.length;
      setFocusedTabIndex(nextIndex);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + AIUEO_TABS.length) % AIUEO_TABS.length;
      setFocusedTabIndex(prevIndex);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(AIUEO_TABS[index].key);
    }
  };

  // 各タブの顧客数を計算
  const getCustomerCountForTab = (tabKey: string) => {
    return filterByAiueo(customers, tabKey).length;
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
            placeholder="氏名・フリガナ・墓石コード・電話番号で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-10 text-sm"
          />
        </div>
        <Button
          onClick={handleSearchWithReset}
          variant="matsu"
          size="default"
          className="h-10"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          検索
        </Button>
        {onNewCustomer && (
          <Button
            onClick={onNewCustomer}
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
            const customerCount = getCustomerCountForTab(tab.key);
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls="customer-list"
                tabIndex={focusedTabIndex === index ? 0 : -1}
                onClick={() => handleTabChange(tab.key)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={cn(
                  "aiueo-tab",
                  "min-w-[44px] min-h-[44px] text-base",
                  isActive && "active"
                )}
                disabled={customerCount === 0 && tab.key !== '全'}
              >
                {tab.shortLabel}
                {customerCount > 0 && tab.key !== '全' && (
                  <span className={cn(
                    "ml-1 text-xs",
                    isActive ? "text-white/80" : "text-hai"
                  )}>
                    {customerCount > 99 ? '99+' : customerCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 顧客一覧 - テーブル形式 */}
      <div className="bg-white rounded-elegant-lg border border-gin shadow-elegant overflow-hidden flex-1">
        <div className="overflow-auto h-full">
          <table className="w-full divide-y divide-gin text-sm table-fixed">
            {/* 列幅定義: ステータス, コード, 氏名, 電話番号, 区画番号, 申込者, 埋葬, 面積, 契約日, 次回請求, 備考 */}
            <colgroup>
              <col className="w-[44px]" /><col className="w-[68px]" /><col className="w-[100px]" /><col className="w-[100px]" /><col className="w-[65px]" /><col className="w-[80px]" /><col className="w-[44px]" /><col className="w-[52px]" /><col className="w-[68px]" /><col className="w-[62px]" /><col />
            </colgroup>
            {/* テーブルヘッダー */}
            <thead className="bg-gradient-matsu sticky top-0 z-10">
              <tr>
                <th
                  className={cn(
                    "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'status' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('status')}
                  title="契約状況"
                >
                  <div className="flex items-center justify-center">
                    <span>状態</span>
                  </div>
                </th>
                <th
                  className={cn(
                    "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'customerCode' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('customerCode')}
                >
                  <div className="flex items-center">
                    <span>コード</span>
                    <SortIndicator columnKey="customerCode" />
                  </div>
                </th>
                <th
                  className={cn(
                    "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'name' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>氏名</span>
                    <SortIndicator columnKey="name" />
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
                    sortKey === 'applicant' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('applicant')}
                >
                  <div className="flex items-center">
                    <span>申込者</span>
                    <SortIndicator columnKey="applicant" />
                  </div>
                </th>
                <th
                  className={cn(
                    "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'buried' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('buried')}
                >
                  <div className="flex items-center justify-center">
                    <span>埋葬</span>
                  </div>
                </th>
                <th
                  className={cn(
                    "px-2 py-2 text-center text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'ownedPlots' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('ownedPlots')}
                >
                  <div className="flex items-center justify-center">
                    <span>面積</span>
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
                    sortKey === 'nextBilling' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('nextBilling')}
                >
                  <div className="flex items-center justify-center">
                    <span>次請求</span>
                  </div>
                </th>
                <th
                  className={cn(
                    "px-2 py-2 text-left text-xs font-bold text-white cursor-pointer transition-all duration-200",
                    "hover:bg-matsu-light",
                    sortKey === 'notes' && "bg-matsu-dark"
                  )}
                  onClick={() => handleSort('notes')}
                >
                  <div className="flex items-center">
                    <span>備考</span>
                    <SortIndicator columnKey="notes" />
                  </div>
                </th>
              </tr>
            </thead>

            {/* テーブルボディ */}
            <tbody className="bg-white divide-y divide-gin">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer, index) => {
                  const absoluteIndex = startIndex + index;
                  // 利用状況による色分け
                  const getRowBgColor = (customer: Customer) => {
                    const buriedCount = customer.buriedPersons?.length || 0;
                    const maxCapacity = customer.plotInfo?.capacity || 4;

                    if (customer.status === 'inactive') return 'bg-beni-50'; // 解約済み
                    if (buriedCount >= maxCapacity) return 'bg-kohaku-50';
                    if (buriedCount >= maxCapacity * 0.8) return 'bg-cha-50';
                    return absoluteIndex % 2 === 0 ? 'bg-white' : 'bg-kinari';
                  };

                  // 次回請求日の計算
                  const getNextBillingDate = (customer: any) => {
                    if (customer.managementFeeInfo?.lastBillingMonth) {
                      const lastBilling = new Date(customer.managementFeeInfo.lastBillingMonth);
                      const nextBilling = new Date(lastBilling);
                      if (customer.managementFeeInfo.billingType === 'monthly') {
                        nextBilling.setMonth(nextBilling.getMonth() + 1);
                      } else if (customer.managementFeeInfo.billingType === 'yearly') {
                        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
                      }
                      return `${nextBilling.getMonth() + 1}/${nextBilling.getDate()}`;
                    }
                    return '-';
                  };

                  // 契約日のフォーマット
                  const getContractDate = (customer: any) => {
                    if (customer.applicantInfo?.applicationDate) {
                      const date = new Date(customer.applicantInfo.applicationDate);
                      return `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}`;
                    }
                    return '-';
                  };

                  // ステータス表示
                  const getStatusBadge = (status: string | undefined) => {
                    switch (status) {
                      case 'active':
                        return <span className="inline-block w-5 h-5 rounded-full bg-matsu text-white text-[10px] leading-5 text-center" title="有効">有</span>;
                      case 'inactive':
                        return <span className="inline-block w-5 h-5 rounded-full bg-beni text-white text-[10px] leading-5 text-center" title="解約">解</span>;
                      default:
                        return <span className="inline-block w-5 h-5 rounded-full bg-matsu text-white text-[10px] leading-5 text-center" title="有効">有</span>;
                    }
                  };

                  return (
                    <tr
                      key={customer.id}
                      className={cn(
                        'cursor-pointer hover:bg-matsu-50 transition-all duration-200',
                        selectedCustomer?.id === customer.id && 'bg-matsu-100 border-l-4 border-matsu',
                        getRowBgColor(customer)
                      )}
                      onClick={() => onCustomerSelect(customer)}
                    >
                      <td className="px-2 py-2 text-center">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-2 py-2 font-mono text-matsu font-medium text-xs truncate">
                        {customer.customerCode}
                      </td>
                      <td className="px-2 py-2">
                        <div className="truncate">
                          <div className="font-medium text-sumi text-sm truncate">{customer.name}</div>
                          <div className="text-xs text-hai truncate">{customer.nameKana}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs text-hai truncate">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-2 py-2 text-xs text-matsu font-medium truncate">
                        {customer.plotInfo?.plotNumber || customer.plotNumber || '-'}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai truncate">
                        {customer.applicant || '-'}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai text-center">
                        <span className="font-medium text-sumi">{customer.buriedPersons?.length || 0}</span>
                      </td>
                      <td className="px-2 py-2 text-xs text-hai text-center">
                        {customer.ownedPlots && customer.ownedPlots.length > 0 ? (
                          <span className="font-medium text-matsu">
                            {calculateOwnedPlotsInfo(customer.ownedPlots).totalAreaSqm}㎡
                          </span>
                        ) : (
                          <span className="text-gin">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai text-center">
                        {getContractDate(customer)}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai text-center">
                        {getNextBillingDate(customer)}
                      </td>
                      <td className="px-2 py-2 text-xs text-hai">
                        <div className="space-y-1">
                          {customer.notes && (
                            <div className="text-xs bg-kohaku-50 text-kohaku-dark px-1.5 py-0.5 rounded border border-kohaku-200 truncate" title={customer.notes}>
                              📝 {customer.notes}
                            </div>
                          )}
                          {customerAttentionNotes?.[customer.id] && (
                            <div
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded border truncate",
                                customerAttentionNotes[customer.id].priority === '要注意' ? 'bg-beni-50 text-beni-dark border-beni-200' :
                                  customerAttentionNotes[customer.id].priority === '注意' ? 'bg-kohaku-50 text-kohaku-dark border-kohaku-200' :
                                    'bg-ai-50 text-ai-dark border-ai-200'
                              )}
                              title={customerAttentionNotes[customer.id].content}
                            >
                              {customerAttentionNotes[customer.id].priority === '要注意' ? '🚨 ' :
                                customerAttentionNotes[customer.id].priority === '注意' ? '⚠️ ' : 'ℹ️ '}
                              {customerAttentionNotes[customer.id].content}
                            </div>
                          )}
                          {customer.attentionNotes && !customerAttentionNotes?.[customer.id] && (
                            <div className="text-xs bg-beni-50 text-beni-dark px-1.5 py-0.5 rounded border border-beni-200 truncate" title={customer.attentionNotes}>
                              ⚠️ {customer.attentionNotes}
                            </div>
                          )}
                          {!customer.notes && !customer.attentionNotes && !customerAttentionNotes?.[customer.id] && (
                            <span className="text-gin">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-hai">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gin mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-base font-medium">該当する顧客が見つかりません</p>
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
        {/* 左側: 件数情報 */}
        <div className="flex items-center gap-4 text-hai">
          <div>
            <span className="font-semibold text-sumi">{startIndex + 1}</span>
            〜
            <span className="font-semibold text-sumi">{endIndex}</span>
            {' / '}
            <span className="font-semibold text-sumi">{totalItems}</span> 件
            {activeTab !== '全' && (
              <span className="ml-2">（{AIUEO_TABS.find(t => t.key === activeTab)?.label}）</span>
            )}
          </div>
          <div className="text-gin">|</div>
          <div>
            全 <span className="font-semibold text-sumi">{customers.length}</span> 件
          </div>
        </div>

        {/* 中央: ページ移動 */}
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
            {/* ページ番号ボタン */}
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

        {/* 右側: 表示件数選択 */}
        <div className="flex items-center gap-2 text-hai">
          <span>表示件数:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="h-8 px-2 border border-gin rounded text-sm bg-white text-sumi focus:outline-none focus:ring-2 focus:ring-matsu"
          >
            <option value={50}>50件</option>
            <option value={100}>100件</option>
          </select>
        </div>
      </div>
    </div>
  );
}