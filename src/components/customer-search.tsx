'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';
import { searchCustomers } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatDateWithEra } from '@/lib/utils';

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomer?: Customer;
  onNewCustomer?: () => void;
}

export default function CustomerSearch({ onCustomerSelect, selectedCustomer, onNewCustomer }: CustomerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const results = searchCustomers(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchCustomers(searchQuery);
      setSearchResults(results);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 顧客ステータスの表示関数
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCustomerStatusDisplay = (_customer: Customer) => {
    // TODO: 実際のビジネスロジックに応じて_customerのプロパティを参照して調整
    const hasOverdue = false; // 滞納があるか
    const needsAttention = false; // 要対応事項があるか

    if (needsAttention) {
      return {
        className: 'status-attention text-status-attention bg-red-50 border-red-200',
        label: '要対応',
        icon: '■'
      };
    }
    if (hasOverdue) {
      return {
        className: 'status-warning text-status-warning bg-yellow-50 border-yellow-200',
        label: '滞納注意',
        icon: '▲'
      };
    }
    return {
      className: 'status-active text-status-active bg-green-50 border-green-200',
      label: '契約中',
      icon: '●'
    };
  };

  return (
    <div className="space-y-senior-gap">
      {/* Search Header */}
      <div className="bg-accessible-bg-light p-senior-gap rounded-lg border-2 border-accessible-border">
        <h3 className="text-senior-xl font-bold text-accessible-text mb-4">顧客検索</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search" className="text-senior-sm font-semibold text-accessible-text block mb-2">
              検索条件（氏名・カナ・墓石コード・電話番号・住所）
            </Label>
            <Input
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="検索キーワードを入力..."
              className="text-senior-sm h-12 border-2 border-accessible-border focus:border-accessible-primary"
              aria-describedby="search-instructions"
            />
            <p id="search-instructions" className="text-senior-xs text-gray-600 mt-1">
              部分一致で検索できます。Enterキーでも検索実行可能です。
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-senior bg-accessible-primary hover:bg-blue-700"
              aria-label="検索を実行"
            >
              {isSearching ? '検索中...' : '検索'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="btn-senior"
              aria-label="検索条件をクリア"
            >
              クリア
            </Button>
            {onNewCustomer && (
              <Button
                onClick={onNewCustomer}
                className="btn-senior bg-accessible-secondary hover:bg-green-700"
                aria-label="新しい顧客を登録"
              >
                新規登録
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white border-2 border-accessible-border rounded-lg">
          <div className="bg-accessible-bg-light px-senior-gap py-4 border-b border-accessible-border">
            <h4 className="text-senior-lg font-bold text-accessible-text">
              検索結果 ({searchResults.length}件)
            </h4>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searchResults.map((customer) => {
              const status = getCustomerStatusDisplay(customer);
              return (
                <div
                  key={customer.id}
                  className={`customer-row p-4 border-b border-accessible-border cursor-pointer transition-all ${selectedCustomer?.id === customer.id ? 'selected bg-blue-50 border-blue-300' : 'hover:bg-accessible-bg-light'
                    }`}
                  onClick={() => onCustomerSelect(customer)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCustomerSelect(customer);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`顧客 ${customer.name} を選択`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      {/* ステータス表示 */}
                      <div className={`flex items-center px-3 py-1 rounded-full text-senior-xs font-semibold border ${status.className}`}>
                        <span className="mr-1">{status.icon}</span>
                        {status.label}
                      </div>

                      {/* 墓石コード */}
                      <div className="text-senior-sm font-mono font-semibold text-accessible-primary bg-blue-50 px-2 py-1 rounded border">
                        {customer.customerCode}
                      </div>

                      {/* 顧客名 */}
                      <div>
                        <div className="text-senior-base font-bold text-accessible-text">
                          {customer.name}
                        </div>
                        <div className="text-senior-sm text-gray-600">
                          {customer.nameKana}
                        </div>
                      </div>
                    </div>

                    {/* 連絡先情報 */}
                    <div className="text-right text-senior-sm text-gray-700 space-y-1">
                      <div className="font-semibold">{customer.phoneNumber}</div>
                      <div>{customer.prefecture}{customer.city}</div>
                    </div>
                  </div>

                  {/* 詳細情報 */}
                  <div className="text-senior-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border">
                    <div className="flex justify-between items-center">
                      <span>
                        生年月日: {formatDateWithEra(customer.birthDate)}
                      </span>
                      <span>
                        区画: {customer.plotInfo?.plotNumber || '未設定'}
                      </span>
                      <span>
                        利用状況: {customer.plotInfo?.usage === 'in_use' ? '利用中' :
                          customer.plotInfo?.usage === 'reserved' ? '予約済み' : '利用可能'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-senior-gap text-center">
          <div className="text-senior-base font-semibold text-yellow-800 mb-2">
            検索条件に該当する顧客が見つかりませんでした
          </div>
          <div className="text-senior-sm text-yellow-700 mb-4">
            検索キーワード: 「{searchQuery}」
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="btn-senior"
          >
            検索をクリア
          </Button>
        </div>
      )}

      {/* Help Text */}
      {!searchQuery.trim() && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-senior-gap text-center">
          <div className="text-senior-base text-blue-800 font-semibold mb-2">
            顧客検索の使い方
          </div>
          <div className="text-senior-sm text-blue-700 space-y-2">
            <div>• 氏名、カナ、墓石コード、電話番号、住所で検索できます</div>
            <div>• 部分一致で検索されます</div>
            <div>• Enterキーを押すか「検索」ボタンで実行できます</div>
          </div>
        </div>
      )}

      {/* Screen Reader Support */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {searchResults.length > 0 && `${searchResults.length}件の検索結果が表示されています。`}
        {selectedCustomer && `${selectedCustomer.name}が選択されています。`}
      </div>
    </div>
  );
}