'use client';

import { useState, useMemo } from 'react';
import { Customer } from '@/types/customer';
import { mockCustomers, filterByAiueo, sortByKana } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  { key: 'その他', label: 'その他', shortLabel: 'その他' },
  { key: '全', label: '全て表示', shortLabel: '全て' }
];

type SortKey = 'customerCode' | 'name' | 'nameKana' | 'address' | 'phoneNumber' | 'plotNumber' | 'applicant' | 'buried' | 'nextBilling' | 'notes';
type SortOrder = 'asc' | 'desc';

export default function CustomerRegistry({ onCustomerSelect, selectedCustomer, onNewCustomer, customerAttentionNotes }: CustomerRegistryProps) {
  const [activeTab, setActiveTab] = useState('全');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [focusedTabIndex, setFocusedTabIndex] = useState(11);
  const [sortKey, setSortKey] = useState<SortKey>('customerCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 検索実行
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 検索時は「全て」タブに切り替えて検索結果を表示
      setActiveTab('全');
    }
  };

  // Enterキーでも検索実行
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
      
      switch(sortKey) {
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
          aValue = a.plotInfo?.plotNumber || '';
          bValue = b.plotInfo?.plotNumber || '';
          break;
        case 'applicant':
          aValue = a.applicant || '';
          bValue = b.applicant || '';
          break;
        case 'buried':
          aValue = a.buriedPersons?.length || 0;
          bValue = b.buriedPersons?.length || 0;
          break;
        case 'nextBilling':
          // 次回請求日の計算（簡易版）
          aValue = a.managementFeeInfo?.lastBillingMonth || '';
          bValue = b.managementFeeInfo?.lastBillingMonth || '';
          break;
        case 'notes':
          aValue = (a.notes || '') + (a.attentionNotes || '');
          bValue = (b.notes || '') + (b.attentionNotes || '');
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [customers, searchQuery, activeTab, sortKey, sortOrder]);
  
  // タブ別の顧客数を計算
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    AIUEO_TABS.forEach(tab => {
      counts[tab.key] = filterByAiueo(customers, tab.key).length;
    });
    return counts;
  }, [customers]);

  // キーボードナビゲーション対応
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      let newIndex = focusedTabIndex;
      
      if (event.key === 'ArrowLeft') {
        newIndex = newIndex > 0 ? newIndex - 1 : AIUEO_TABS.length - 1;
      } else {
        newIndex = newIndex < AIUEO_TABS.length - 1 ? newIndex + 1 : 0;
      }
      
      setFocusedTabIndex(newIndex);
      setActiveTab(AIUEO_TABS[newIndex].key);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search Box */}
      <div className="bg-white p-3 rounded border">
        <div className="flex items-center space-x-2 mb-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="検索キーワードを入力..."
            className="flex-1 text-sm h-8 border border-gray-300"
          />
          <Button 
            onClick={() => setSearchQuery('')}
            variant="outline"
            size="sm"
            className="px-3 py-1 text-xs"
          >
            クリア
          </Button>
          <Button 
            onClick={handleSearch}
            size="sm"
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700"
          >
            検索
          </Button>
          {onNewCustomer && (
            <Button 
              onClick={onNewCustomer}
              size="sm"
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700"
            >
              新規登録
            </Button>
          )}
        </div>
      </div>

      {/* あいう順タブナビゲーション */}
      <div className="bg-white p-2 rounded border">
        <div 
          className="grid grid-cols-6 md:grid-cols-12 gap-1"
          onKeyDown={handleKeyDown}
        >
          {AIUEO_TABS.map((tab, index) => {
            const customerCount = tabCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setFocusedTabIndex(index);
                }}
                className={cn(
                  'px-2 py-1 text-sm border rounded relative',
                  activeTab === tab.key 
                    ? 'bg-blue-100 border-blue-300 text-blue-800' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
                  customerCount === 0 && 'opacity-50 cursor-not-allowed'
                )}
                disabled={customerCount === 0}
                title={`${tab.label}: ${customerCount}件`}
              >
                <span>{tab.shortLabel}</span>
                {customerCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {customerCount > 99 ? '99+' : customerCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 顧客一覧 - テーブル形式 */}
      <div className="bg-white rounded border shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* テーブルヘッダー */}
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'customerCode' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('customerCode')}
                >
                  <div className="flex items-center justify-between">
                    <span>墓石コード</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'customerCode' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'customerCode' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'name' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center justify-between">
                    <span>氏名</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'name' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'name' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'address' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center justify-between">
                    <span>住所</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'address' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'address' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'applicant' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('applicant')}
                >
                  <div className="flex items-center justify-between">
                    <span>申込者</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'applicant' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'applicant' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'buried' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('buried')}
                >
                  <div className="flex items-center justify-between">
                    <span>埋葬者</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'buried' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'buried' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'phoneNumber' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('phoneNumber')}
                >
                  <div className="flex items-center justify-between">
                    <span>電話番号</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'phoneNumber' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'phoneNumber' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'nextBilling' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('nextBilling')}
                >
                  <div className="flex items-center justify-between">
                    <span>次回請求</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'nextBilling' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'nextBilling' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-3 py-3 text-left text-sm font-bold text-white border-r border-blue-500 cursor-pointer transition-all duration-200",
                    "hover:bg-blue-500 hover:shadow-md",
                    sortKey === 'notes' && "bg-blue-800 shadow-inner"
                  )}
                  onClick={() => handleSort('notes')}
                >
                  <div className="flex items-center justify-between">
                    <span>備考/注意</span>
                    <div className="flex flex-col ml-1">
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'notes' && sortOrder === 'asc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▲</span>
                      <span className={cn(
                        "text-xs leading-none",
                        sortKey === 'notes' && sortOrder === 'desc' ? 'text-yellow-300' : 'text-blue-300'
                      )}>▼</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            
            {/* テーブルボディ */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => {
                  // 次回請求時期の計算（簡易版）
                  const getNextBillingDate = (customer: any) => {
                    if (customer.managementFeeInfo?.lastBillingMonth) {
                      const lastBilling = new Date(customer.managementFeeInfo.lastBillingMonth);
                      const nextBilling = new Date(lastBilling);
                      if (customer.managementFeeInfo.billingType === 'monthly') {
                        nextBilling.setMonth(nextBilling.getMonth() + 1);
                      } else if (customer.managementFeeInfo.billingType === 'yearly') {
                        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
                      }
                      return nextBilling.toLocaleDateString('ja-JP');
                    }
                    return '-';
                  };

                  // 利用状況による色分け
                  const getRowBgColor = (customer: any) => {
                    const buriedCount = customer.buriedPersons?.length || 0;
                    const maxCapacity = customer.plotInfo?.capacity || 4;
                    
                    if (customer.status === 'suspended') return 'bg-red-50';
                    if (buriedCount >= maxCapacity) return 'bg-orange-50';
                    if (buriedCount >= maxCapacity * 0.8) return 'bg-yellow-50';
                    return index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  };

                  return (
                    <tr 
                      key={customer.id}
                      className={cn(
                        'cursor-pointer hover:bg-blue-50 transition-colors',
                        selectedCustomer?.id === customer.id && 'bg-blue-100 border-l-4 border-blue-500',
                        getRowBgColor(customer)
                      )}
                      onClick={() => onCustomerSelect(customer)}
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-blue-600">
                        {customer.customerCode}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div>
                          <div>{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.nameKana}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 max-w-xs">
                        <div className="truncate" title={customer.address}>
                          {customer.address || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                        {customer.applicant || customer.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        <div>
                          {customer.buriedPersons?.length || 0}名
                          {customer.buriedPersons && customer.buriedPersons.length > 0 && (
                            <div className="text-xs text-gray-500 truncate">
                              {customer.buriedPersons[0].name}
                              {customer.buriedPersons.length > 1 && ` 他${customer.buriedPersons.length - 1}名`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                        <div className="text-sm font-medium">
                          {getNextBillingDate(customer)}
                        </div>
                        {customer.managementFeeInfo && customer.managementFeeInfo.managementFee && (
                          <div className="text-xs text-gray-500">
                            {parseInt(customer.managementFeeInfo.managementFee).toLocaleString()}円/
                            {customer.managementFeeInfo.billingType === 'monthly' ? '月' : '年'}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600 max-w-xs">
                        <div className="space-y-1">
                          {customer.notes && (
                            <div className="text-xs bg-yellow-100 px-2 py-1 rounded truncate" title={customer.notes}>
                              📝 {customer.notes}
                            </div>
                          )}
                          {/* 顧客管理から渡された注意事項を表示 */}
                          {customerAttentionNotes?.[customer.id] && (
                            <div 
                              className={cn(
                                "text-xs px-2 py-1 rounded truncate",
                                customerAttentionNotes[customer.id].priority === '要注意' ? 'bg-red-100 text-red-800' :
                                customerAttentionNotes[customer.id].priority === '注意' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              )}
                              title={customerAttentionNotes[customer.id].content}
                            >
                              {customerAttentionNotes[customer.id].priority === '要注意' ? '🚨' : 
                               customerAttentionNotes[customer.id].priority === '注意' ? '⚠️' : 'ℹ️'} {customerAttentionNotes[customer.id].content}
                            </div>
                          )}
                          {/* 従来のattentionNotes（後方互換性） */}
                          {customer.attentionNotes && !customerAttentionNotes?.[customer.id] && (
                            <div className="text-xs bg-red-100 px-2 py-1 rounded truncate" title={customer.attentionNotes}>
                              ⚠️ {customer.attentionNotes}
                            </div>
                          )}
                          {!customer.notes && !customer.attentionNotes && !customerAttentionNotes?.[customer.id] && '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-sm text-gray-500">
                    {searchQuery.trim() 
                      ? '検索条件に該当する顧客が見つかりませんでした' 
                      : `${AIUEO_TABS.find(tab => tab.key === activeTab)?.label}の顧客はいません`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}