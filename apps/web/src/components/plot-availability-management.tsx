'use client';

import { useState, useMemo } from 'react';
import { Customer } from '@/types/customer';
import { mockCustomers } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlotAvailabilityManagementProps {
  onCustomerSelect?: (customer: Customer) => void;
  selectedCustomer?: Customer;
}

interface PlotData {
  section: string;
  plotNumber: string;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  currentOccupancy: number;
  contractYear?: string;
  customerName?: string;
  buriedPersons?: any[];
}

type SortKey = 'section' | 'plotNumber' | 'status' | 'occupancyRate' | 'contractYear';
type SortOrder = 'asc' | 'desc';

const menuItems = [
  '区画一覧',
  '空き区画検索',
  '使用状況確認',
  '区画予約管理',
  'セクション別統計',
  '容量分析',
  '区画図印刷',
  '利用状況レポート'
];

export default function PlotAvailabilityManagement({ onCustomerSelect, selectedCustomer }: PlotAvailabilityManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('section');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [selectedMenu, setSelectedMenu] = useState('区画一覧');

  const handleSearch = () => {
    // 検索処理（フィルタリングはuseMemoで実行）
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
  };

  // 区画データの生成
  const plotData = useMemo(() => {
    const plots: PlotData[] = [];
    const sections = ['A', 'B', 'C', 'D', 'E'];
    
    // 既存の顧客データから区画情報を取得
    const occupiedPlots = new Map<string, Customer>();
    customers.forEach(customer => {
      if (customer.plotInfo?.plotNumber && customer.plotInfo?.section) {
        const key = `${customer.plotInfo.section}-${customer.plotInfo.plotNumber}`;
        occupiedPlots.set(key, customer);
      }
    });

    // 各セクションの区画を生成
    sections.forEach(section => {
      for (let i = 1; i <= 50; i++) {
        const plotNumber = i.toString().padStart(3, '0');
        const key = `${section}-${plotNumber}`;
        const customer = occupiedPlots.get(key);
        
        const capacity = 4; // 基本容量
        const currentOccupancy = customer?.buriedPersons?.length || 0;
        
        let status: 'available' | 'occupied' | 'reserved' = 'available';
        if (customer) {
          status = currentOccupancy > 0 ? 'occupied' : 'reserved';
        }

        const contractYear = customer?.contractorInfo?.startDate ? 
          new Date(customer.contractorInfo.startDate).getFullYear().toString() :
          customer?.plotInfo?.contractDate ?
          new Date(customer.plotInfo.contractDate).getFullYear().toString() :
          undefined;

        plots.push({
          section,
          plotNumber,
          status,
          capacity,
          currentOccupancy,
          contractYear,
          customerName: customer?.name,
          buriedPersons: customer?.buriedPersons
        });
      }
    });

    return plots;
  }, [customers]);

  // フィルタと並び替え
  const filteredAndSortedPlots = useMemo(() => {
    let filtered = plotData;
    
    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plot => 
        plot.section.toLowerCase().includes(query) ||
        plot.plotNumber.includes(query) ||
        plot.customerName?.toLowerCase().includes(query) ||
        `${plot.section}-${plot.plotNumber}`.toLowerCase().includes(query)
      );
    }
    
    // ステータスフィルタ
    if (filterStatus !== 'all') {
      filtered = filtered.filter(plot => plot.status === filterStatus);
    }
    
    // ソート処理
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';
      
      switch(sortKey) {
        case 'section':
          aValue = a.section;
          bValue = b.section;
          break;
        case 'plotNumber':
          aValue = a.plotNumber;
          bValue = b.plotNumber;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'occupancyRate':
          aValue = a.currentOccupancy / a.capacity;
          bValue = b.currentOccupancy / b.capacity;
          break;
        case 'contractYear':
          aValue = a.contractYear || '';
          bValue = b.contractYear || '';
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [plotData, searchQuery, filterStatus, sortKey, sortOrder]);

  // 統計情報の計算
  const statistics = useMemo(() => {
    const total = plotData.length;
    const available = plotData.filter(p => p.status === 'available').length;
    const occupied = plotData.filter(p => p.status === 'occupied').length;
    const reserved = plotData.filter(p => p.status === 'reserved').length;
    const availabilityRate = ((available / total) * 100).toFixed(1);
    
    return { total, available, occupied, reserved, availabilityRate };
  }, [plotData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">空き</span>;
      case 'occupied':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">使用中</span>;
      case 'reserved':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">予約済</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">不明</span>;
    }
  };

  const getOccupancyColor = (current: number, capacity: number) => {
    const rate = current / capacity;
    if (rate === 0) return 'text-gray-500';
    if (rate < 0.5) return 'text-green-600';
    if (rate < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex h-screen">
      {/* サイドメニュー */}
      <div className="w-56 bg-white border-r border-gray-200 shadow-md">
        <div className="p-4 bg-orange-600 text-white">
          <h3 className="text-lg font-semibold">区画管理メニュー</h3>
        </div>
        <div className="p-2">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedMenu(item)}
              className={cn(
                'w-full text-left px-4 py-2 rounded-md mb-1 transition-colors',
                selectedMenu === item
                  ? 'bg-orange-100 text-orange-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
      {/* ヘッダー部分 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">区画残数管理</h2>
        
        {/* 統計情報 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">{statistics.total}</div>
            <div className="text-sm text-gray-600">総区画数</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-800">{statistics.available}</div>
            <div className="text-sm text-green-600">空き区画</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-800">{statistics.occupied}</div>
            <div className="text-sm text-blue-600">使用中</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-800">{statistics.reserved}</div>
            <div className="text-sm text-yellow-600">予約済</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-800">{statistics.availabilityRate}%</div>
            <div className="text-sm text-purple-600">空き率</div>
          </div>
        </div>
        
        {/* 検索・フィルタ */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="区画番号、セクション、顧客名で検索..."
            className="flex-1 min-w-64"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">全て</option>
            <option value="available">空き</option>
            <option value="occupied">使用中</option>
            <option value="reserved">予約済</option>
          </select>
          <Button 
            onClick={() => setSearchQuery('')}
            variant="outline"
            size="sm"
          >
            クリア
          </Button>
          <Button 
            onClick={handleSearch}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            検索
          </Button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
                    sortKey === 'section' && "bg-gray-100"
                  )}
                  onClick={() => handleSort('section')}
                >
                  <div className="flex items-center">
                    <span>セクション</span>
                    <div className="ml-1 flex flex-col">
                      <span className={cn("text-xs", sortKey === 'section' && sortOrder === 'asc' && "text-blue-600")}>▲</span>
                      <span className={cn("text-xs -mt-1", sortKey === 'section' && sortOrder === 'desc' && "text-blue-600")}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
                    sortKey === 'plotNumber' && "bg-gray-100"
                  )}
                  onClick={() => handleSort('plotNumber')}
                >
                  <div className="flex items-center">
                    <span>区画番号</span>
                    <div className="ml-1 flex flex-col">
                      <span className={cn("text-xs", sortKey === 'plotNumber' && sortOrder === 'asc' && "text-blue-600")}>▲</span>
                      <span className={cn("text-xs -mt-1", sortKey === 'plotNumber' && sortOrder === 'desc' && "text-blue-600")}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
                    sortKey === 'status' && "bg-gray-100"
                  )}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>状態</span>
                    <div className="ml-1 flex flex-col">
                      <span className={cn("text-xs", sortKey === 'status' && sortOrder === 'asc' && "text-blue-600")}>▲</span>
                      <span className={cn("text-xs -mt-1", sortKey === 'status' && sortOrder === 'desc' && "text-blue-600")}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
                    sortKey === 'occupancyRate' && "bg-gray-100"
                  )}
                  onClick={() => handleSort('occupancyRate')}
                >
                  <div className="flex items-center">
                    <span>使用状況</span>
                    <div className="ml-1 flex flex-col">
                      <span className={cn("text-xs", sortKey === 'occupancyRate' && sortOrder === 'asc' && "text-blue-600")}>▲</span>
                      <span className={cn("text-xs -mt-1", sortKey === 'occupancyRate' && sortOrder === 'desc' && "text-blue-600")}>▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100",
                    sortKey === 'contractYear' && "bg-gray-100"
                  )}
                  onClick={() => handleSort('contractYear')}
                >
                  <div className="flex items-center">
                    <span>契約年</span>
                    <div className="ml-1 flex flex-col">
                      <span className={cn("text-xs", sortKey === 'contractYear' && sortOrder === 'asc' && "text-blue-600")}>▲</span>
                      <span className={cn("text-xs -mt-1", sortKey === 'contractYear' && sortOrder === 'desc' && "text-blue-600")}>▼</span>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  契約者名
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPlots.length > 0 ? (
                filteredAndSortedPlots.map((plot, index) => (
                  <tr 
                    key={`${plot.section}-${plot.plotNumber}`}
                    className={cn(
                      'hover:bg-gray-50',
                      index % 2 === 1 && 'bg-gray-50'
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {plot.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plot.section}-{plot.plotNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(plot.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={cn("font-medium", getOccupancyColor(plot.currentOccupancy, plot.capacity))}>
                        {plot.currentOccupancy}/{plot.capacity}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({((plot.currentOccupancy / plot.capacity) * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plot.contractYear || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plot.customerName || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery.trim() || filterStatus !== 'all' ? 
                      '検索条件に該当するデータが見つかりませんでした' : 
                      'データがありません'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 件数表示 */}
      <div className="text-right text-sm text-gray-600">
        全 {filteredAndSortedPlots.length} 件（表示中） / {plotData.length} 件（全体）
      </div>
      </div>
    </div>
  );
}