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

export default function CustomerRegistry({ onCustomerSelect, selectedCustomer, onNewCustomer }: CustomerRegistryProps) {
  const [activeTab, setActiveTab] = useState('あ');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [focusedTabIndex, setFocusedTabIndex] = useState(0);

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
    
    // あいう順ソート
    return sortByKana(filtered);
  }, [customers, searchQuery, activeTab]);
  
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

      {/* 顧客一覧 */}
      <div className="bg-white rounded border">
        <div className="max-h-[500px] overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredCustomers.map((customer, index) => {
                return (
                  <div
                    key={customer.id}
                    className={cn(
                      'p-2 cursor-pointer transition-colors',
                      selectedCustomer?.id === customer.id && 'bg-blue-50',
                      'hover:bg-gray-50'
                    )}
                    onClick={() => onCustomerSelect(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* 顧客コード */}
                        <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {customer.customerCode}
                        </div>
                        
                        {/* 顧客情報 */}
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {customer.nameKana}
                          </div>
                        </div>
                      </div>
                      
                      {/* 右側情報 */}
                      <div className="text-right text-xs text-gray-600 space-y-1">
                        <div>{customer.phoneNumber}</div>
                        <div>区画: {customer.plotInfo?.plotNumber || '未設定'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">
                {searchQuery.trim() 
                  ? '検索条件に該当する顧客が見つかりませんでした' 
                  : `${AIUEO_TABS.find(tab => tab.key === activeTab)?.label}の顧客はいません`
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}