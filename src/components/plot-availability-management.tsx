'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getAllPlotInventory,
  getPlotInventoryByPeriod,
  calculateAllPeriodSummaries,
  calculateInventorySummary,
  getAvailablePlots,
  getSoldOutPlots,
  getInventorySortedByUsageRate,
  getInventorySortedByRemaining,
  PlotInventoryItem,
  PeriodSummary,
  PERIOD_3_SPECIAL_INVENTORY,
} from '@/lib/plot-inventory';
import {
  getAllPlotsByArea,
  getPlotsByAreaForPeriod,
  calculateAllPeriodAreaSummaries,
  calculateTotalAreaSummary,
  getAvailablePlotsByArea,
  getSoldOutPlotsByArea,
  getInventoryGroupedByArea,
  getInventoryGroupedByType,
  PlotByAreaItem,
} from '@/lib/plot-inventory-by-area';
import { PlotPeriod, PLOT_SIZE } from '@/types/customer';

interface PlotAvailabilityManagementProps {
  onNavigateToMenu?: () => void;
}

type ViewMode = 'all' | 'available' | 'soldout' | 'usage-rate' | 'remaining';
type DisplayMode = 'section' | 'area'; // 区画別 or 面積別
type SelectedPeriod = PlotPeriod | 'all';
type SortKey = 'period' | 'section' | 'totalCount' | 'usedCount' | 'remainingCount' | 'usageRate';
type AreaSortKey = 'period' | 'areaSqm' | 'totalCount' | 'usedCount' | 'remainingCount' | 'remainingAreaSqm' | 'plotType';
type SortOrder = 'asc' | 'desc';

const menuItems = [
  { key: 'all', label: '📋 全区画表示', description: '全ての区画を一覧表示' },
  { key: 'available', label: '✅ 空き区画のみ', description: '残数のある区画' },
  { key: 'soldout', label: '❌ 完売区画', description: '残数0の区画' },
  { key: 'usage-rate', label: '📊 使用率順', description: '使用率でソート' },
  { key: 'remaining', label: '🔢 残数順', description: '残数でソート' },
];

export default function PlotAvailabilityManagement({ onNavigateToMenu }: PlotAvailabilityManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('section'); // 区画別 or 面積別
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>('all');
  const [sortKey, setSortKey] = useState<SortKey>('period');
  const [areaSortKey, setAreaSortKey] = useState<AreaSortKey>('period');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // 全体集計
  const summary = useMemo(() => calculateInventorySummary(), []);
  
  // 期別集計
  const periodSummaries = useMemo(() => calculateAllPeriodSummaries(), []);

  // 面積別全体集計
  const areaSummary = useMemo(() => calculateTotalAreaSummary(), []);

  // 面積別期別集計
  const periodAreaSummaries = useMemo(() => calculateAllPeriodAreaSummaries(), []);

  // 表示するデータ
  const displayData = useMemo(() => {
    let data: PlotInventoryItem[] = [];
    
    switch (viewMode) {
      case 'all':
        if (selectedPeriod === 'all') {
          data = getAllPlotInventory();
        } else {
          data = getPlotInventoryByPeriod(selectedPeriod);
        }
        break;
      case 'available':
        data = getAvailablePlots().filter(item => 
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
        break;
      case 'soldout':
        data = getSoldOutPlots().filter(item => 
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
        break;
      case 'usage-rate':
        data = getInventorySortedByUsageRate(sortOrder === 'asc').filter(item => 
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
        break;
      case 'remaining':
        data = getInventorySortedByRemaining(sortOrder === 'asc').filter(item => 
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
        break;
      default:
        data = getAllPlotInventory();
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.section.toLowerCase().includes(query) ||
        item.period.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query))
      );
    }

    // ソート（使用率順・残数順以外の場合）
    if (viewMode !== 'usage-rate' && viewMode !== 'remaining') {
      data = [...data].sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';
        
        switch(sortKey) {
          case 'period':
            aValue = a.period;
            bValue = b.period;
            break;
          case 'section':
            aValue = a.section;
            bValue = b.section;
            break;
          case 'totalCount':
            aValue = a.totalCount;
            bValue = b.totalCount;
            break;
          case 'usedCount':
            aValue = a.usedCount;
            bValue = b.usedCount;
            break;
          case 'remainingCount':
            aValue = a.remainingCount;
            bValue = b.remainingCount;
            break;
          case 'usageRate':
            aValue = a.totalCount > 0 ? a.usedCount / a.totalCount : 0;
            bValue = b.totalCount > 0 ? b.usedCount / b.totalCount : 0;
            break;
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [viewMode, selectedPeriod, sortKey, sortOrder, searchQuery]);

  // 使用率に応じた色を取得
  const getUsageRateColor = (usageRate: number) => {
    if (usageRate >= 95) return 'bg-red-100 text-red-800';
    if (usageRate >= 80) return 'bg-orange-100 text-orange-800';
    if (usageRate >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // 残数に応じた色を取得
  const getRemainingColor = (remaining: number, total: number) => {
    const rate = (remaining / total) * 100;
    if (rate <= 5) return 'text-red-600 font-bold';
    if (rate <= 15) return 'text-orange-600 font-semibold';
    if (rate <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleAreaSort = (key: AreaSortKey) => {
    if (areaSortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAreaSortKey(key);
      setSortOrder('asc');
    }
  };

  // 面積別表示データ
  const displayAreaData = useMemo(() => {
    let data: PlotByAreaItem[] = [];
    
    switch (viewMode) {
      case 'all':
        if (selectedPeriod === 'all') {
          data = getAllPlotsByArea();
        } else {
          data = getPlotsByAreaForPeriod(selectedPeriod);
        }
        break;
      case 'available':
        data = getAvailablePlotsByArea().filter(item => 
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
        break;
      case 'soldout':
        data = getSoldOutPlotsByArea().filter(item => 
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
        break;
      default:
        if (selectedPeriod === 'all') {
          data = getAllPlotsByArea();
        } else {
          data = getPlotsByAreaForPeriod(selectedPeriod);
        }
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.plotType.toLowerCase().includes(query) ||
        item.period.toLowerCase().includes(query) ||
        item.areaSqm.toString().includes(query)
      );
    }

    // ソート
    data = [...data].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';
      
      switch(areaSortKey) {
        case 'period':
          aValue = a.period;
          bValue = b.period;
          break;
        case 'areaSqm':
          aValue = a.areaSqm;
          bValue = b.areaSqm;
          break;
        case 'totalCount':
          aValue = a.totalCount;
          bValue = b.totalCount;
          break;
        case 'usedCount':
          aValue = a.usedCount;
          bValue = b.usedCount;
          break;
        case 'remainingCount':
          aValue = a.remainingCount;
          bValue = b.remainingCount;
          break;
        case 'remainingAreaSqm':
          aValue = a.remainingAreaSqm;
          bValue = b.remainingAreaSqm;
          break;
        case 'plotType':
          aValue = a.plotType;
          bValue = b.plotType;
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [viewMode, selectedPeriod, areaSortKey, sortOrder, searchQuery]);

  // 平米数計算
  const calculateAreaStats = () => {
    const allPlots = getAllPlotInventory();
    const totalArea = allPlots.reduce((sum, item) => sum + (item.totalCount * PLOT_SIZE.FULL), 0);
    const usedArea = allPlots.reduce((sum, item) => sum + (item.usedCount * PLOT_SIZE.FULL), 0);
    const remainingArea = allPlots.reduce((sum, item) => sum + (item.remainingCount * PLOT_SIZE.FULL), 0);
    return { totalArea, usedArea, remainingArea };
  };

  const areaStats = calculateAreaStats();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドメニュー */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-md flex flex-col">
        <div className="p-4 bg-orange-600 text-white">
          <h3 className="text-lg font-semibold">区画残数管理</h3>
          <p className="text-xs text-orange-100 mt-1">2025年6月末現在</p>
        </div>
        
        <div className="p-3 flex-1 overflow-auto">
          {/* メインメニューに戻るボタン */}
          {onNavigateToMenu && (
            <Button
              onClick={onNavigateToMenu}
              className="w-full mb-4 btn-senior"
              variant="outline"
              size="lg"
            >
              ← メインメニューに戻る
            </Button>
          )}

          {/* 表示形式切替（区画別/面積別） */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">表示形式</h4>
            <div className="flex gap-1">
              <button
                onClick={() => setDisplayMode('section')}
                className={cn(
                  'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  displayMode === 'section'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                区画別
              </button>
              <button
                onClick={() => setDisplayMode('area')}
                className={cn(
                  'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  displayMode === 'area'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                面積別
              </button>
            </div>
          </div>

          {/* 表示モード切替 */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">フィルター</h4>
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setViewMode(item.key as ViewMode)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md mb-1 transition-colors text-sm',
                  viewMode === item.key
                    ? 'bg-orange-100 text-orange-700 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 期別フィルター */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">期別フィルター</h4>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md mb-1 transition-colors text-sm',
                selectedPeriod === 'all'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              全期
            </button>
            {(['1期', '2期', '3期', '4期'] as PlotPeriod[]).map((period) => {
              const ps = periodSummaries.find(p => p.period === period);
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md mb-1 transition-colors text-sm',
                    selectedPeriod === period
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span>{period}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      getUsageRateColor(ps?.usageRate || 0)
                    )}>
                      残{ps?.remainingCount || 0}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto p-6">
        {/* 全体サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-blue-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-800">{summary.totalCount.toLocaleString()}</div>
            <div className="text-sm text-blue-600 font-medium">総区画数</div>
            <div className="text-xs text-gray-500 mt-1">{areaStats.totalArea.toLocaleString()}㎡</div>
          </div>
          <div className="bg-white border border-green-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-800">{summary.usedCount.toLocaleString()}</div>
            <div className="text-sm text-green-600 font-medium">使用済区画数</div>
            <div className="text-xs text-gray-500 mt-1">{areaStats.usedArea.toLocaleString()}㎡</div>
          </div>
          <div className="bg-white border border-orange-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-800">{summary.remainingCount.toLocaleString()}</div>
            <div className="text-sm text-orange-600 font-medium">残区画数</div>
            <div className="text-xs text-gray-500 mt-1">{areaStats.remainingArea.toLocaleString()}㎡</div>
          </div>
          <div className="bg-white border border-purple-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-800">{summary.usageRate}%</div>
            <div className="text-sm text-purple-600 font-medium">使用率</div>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${summary.usageRate}%` }}
              />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-gray-800">{(summary.remainingCount * 2).toLocaleString()}</div>
            <div className="text-sm text-gray-600 font-medium">半区画換算</div>
            <div className="text-xs text-gray-500 mt-1">1.8㎡×{(summary.remainingCount * 2).toLocaleString()}</div>
          </div>
        </div>

        {/* 期別サマリーカード */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {periodSummaries.map((ps) => (
            <button
              key={ps.period}
              onClick={() => setSelectedPeriod(ps.period)}
              className={cn(
                "bg-white border rounded-lg p-4 text-left transition-all hover:shadow-md",
                selectedPeriod === ps.period 
                  ? "border-blue-500 ring-2 ring-blue-200" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={cn(
                  "text-lg font-bold",
                  ps.period === '1期' ? 'text-blue-700' :
                  ps.period === '2期' ? 'text-green-700' :
                  ps.period === '3期' ? 'text-purple-700' :
                  'text-orange-700'
                )}>{ps.period}</span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded font-medium",
                  getUsageRateColor(ps.usageRate)
                )}>
                  {ps.usageRate}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">総数</div>
                  <div className="font-bold text-gray-800">{ps.totalCount}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">使用</div>
                  <div className="font-bold text-green-600">{ps.usedCount}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">残り</div>
                  <div className={cn("font-bold", getRemainingColor(ps.remainingCount, ps.totalCount))}>
                    {ps.remainingCount}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={displayMode === 'section' ? "区画名、期で検索..." : "面積、タイプ、期で検索..."}
              className="flex-1 max-w-md"
            />
            <Button 
              onClick={() => setSearchQuery('')}
              variant="outline"
              size="sm"
            >
              クリア
            </Button>
            <div className="flex-1" />
            <span className="text-sm text-gray-500">
              表示件数: {displayMode === 'section' ? displayData.length : displayAreaData.length}件
              {selectedPeriod !== 'all' && ` (${selectedPeriod})`}
              {displayMode === 'area' && ' [面積別]'}
            </span>
          </div>
        </div>

        {/* データテーブル */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {displayMode === 'section' ? (
              /* 区画別テーブル */
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th 
                      className={cn(
                        "px-4 py-3 text-left text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        sortKey === 'period' && "bg-gray-200"
                      )}
                      onClick={() => handleSort('period')}
                    >
                      <div className="flex items-center">
                        期
                        {sortKey === 'period' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-left text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        sortKey === 'section' && "bg-gray-200"
                      )}
                      onClick={() => handleSort('section')}
                    >
                      <div className="flex items-center">
                        区画
                        {sortKey === 'section' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        sortKey === 'totalCount' && "bg-gray-200"
                      )}
                      onClick={() => handleSort('totalCount')}
                    >
                      <div className="flex items-center justify-end">
                        総数
                        {sortKey === 'totalCount' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        sortKey === 'usedCount' && "bg-gray-200"
                      )}
                      onClick={() => handleSort('usedCount')}
                    >
                      <div className="flex items-center justify-end">
                        使用数
                        {sortKey === 'usedCount' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        sortKey === 'remainingCount' && "bg-gray-200"
                      )}
                      onClick={() => handleSort('remainingCount')}
                    >
                      <div className="flex items-center justify-end">
                        残数
                        {sortKey === 'remainingCount' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-center text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        sortKey === 'usageRate' && "bg-gray-200"
                      )}
                      onClick={() => handleSort('usageRate')}
                    >
                      <div className="flex items-center justify-center">
                        使用率
                        {sortKey === 'usageRate' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                      状況
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                      面積（㎡）
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayData.map((item, index) => {
                    const usageRate = item.totalCount > 0 
                      ? Math.round((item.usedCount / item.totalCount) * 100 * 10) / 10 
                      : 0;
                    const remainingArea = item.remainingCount * PLOT_SIZE.FULL;
                    
                    return (
                      <tr 
                        key={`${item.period}-${item.section}`}
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        )}
                      >
                        <td className="px-4 py-3 text-sm">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            item.period === '1期' ? 'bg-blue-100 text-blue-800' :
                            item.period === '2期' ? 'bg-green-100 text-green-800' :
                            item.period === '3期' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          )}>
                            {item.period}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {item.section}
                          {item.category && (
                            <span className="ml-2 text-xs text-gray-500 font-normal">({item.category})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {item.totalCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                          {item.usedCount}
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-sm text-right",
                          getRemainingColor(item.remainingCount, item.totalCount)
                        )}>
                          {item.remainingCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={cn(
                                  "h-2 rounded-full",
                                  usageRate >= 95 ? 'bg-red-500' :
                                  usageRate >= 80 ? 'bg-orange-500' :
                                  usageRate >= 60 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                )}
                                style={{ width: `${usageRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-12">{usageRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.remainingCount === 0 ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              完売
                            </span>
                          ) : item.remainingCount <= 5 ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              残少
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              空有
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {remainingArea.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* 合計行 */}
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-sm" colSpan={2}>
                      合計 {selectedPeriod !== 'all' ? `(${selectedPeriod})` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {displayData.reduce((sum, item) => sum + item.totalCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {displayData.reduce((sum, item) => sum + item.usedCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">
                      {displayData.reduce((sum, item) => sum + item.remainingCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {displayData.length > 0 ? (
                        Math.round(
                          (displayData.reduce((sum, item) => sum + item.usedCount, 0) /
                          displayData.reduce((sum, item) => sum + item.totalCount, 0)) * 100 * 10
                        ) / 10
                      ) : 0}%
                    </td>
                    <td className="px-4 py-3 text-sm text-center">-</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {(displayData.reduce((sum, item) => sum + item.remainingCount, 0) * PLOT_SIZE.FULL).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              /* 面積別テーブル */
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th 
                      className={cn(
                        "px-4 py-3 text-left text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'period' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('period')}
                    >
                      <div className="flex items-center">
                        期
                        {areaSortKey === 'period' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'areaSqm' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('areaSqm')}
                    >
                      <div className="flex items-center justify-end">
                        面積（㎡）
                        {areaSortKey === 'areaSqm' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'totalCount' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('totalCount')}
                    >
                      <div className="flex items-center justify-end">
                        区画数
                        {areaSortKey === 'totalCount' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'usedCount' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('usedCount')}
                    >
                      <div className="flex items-center justify-end">
                        使用数
                        {areaSortKey === 'usedCount' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'remainingCount' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('remainingCount')}
                    >
                      <div className="flex items-center justify-end">
                        残数
                        {areaSortKey === 'remainingCount' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'remainingAreaSqm' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('remainingAreaSqm')}
                    >
                      <div className="flex items-center justify-end">
                        残㎡
                        {areaSortKey === 'remainingAreaSqm' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-3 text-left text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-200",
                        areaSortKey === 'plotType' && "bg-gray-200"
                      )}
                      onClick={() => handleAreaSort('plotType')}
                    >
                      <div className="flex items-center">
                        タイプ
                        {areaSortKey === 'plotType' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                      状況
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayAreaData.map((item, index) => {
                    const usageRate = item.totalCount > 0 
                      ? Math.round((item.usedCount / item.totalCount) * 100 * 10) / 10 
                      : 0;
                    
                    return (
                      <tr 
                        key={`${item.period}-${item.areaSqm}-${item.plotType}-${index}`}
                        className={cn(
                          "hover:bg-gray-50 transition-colors",
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        )}
                      >
                        <td className="px-4 py-3 text-sm">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            item.period === '1期' ? 'bg-blue-100 text-blue-800' :
                            item.period === '2期' ? 'bg-green-100 text-green-800' :
                            item.period === '3期' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          )}>
                            {item.period}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {item.areaSqm}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {item.totalCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                          {item.usedCount}
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-sm text-right",
                          getRemainingColor(item.remainingCount, item.totalCount)
                        )}>
                          {item.remainingCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">
                          {item.remainingAreaSqm}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.plotType}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.remainingCount === 0 ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              完売
                            </span>
                          ) : item.remainingCount <= 5 ? (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              残少
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              空有
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* 合計行 */}
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-sm" colSpan={2}>
                      合計 {selectedPeriod !== 'all' ? `(${selectedPeriod})` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {displayAreaData.reduce((sum, item) => sum + item.totalCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {displayAreaData.reduce((sum, item) => sum + item.usedCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">
                      {displayAreaData.reduce((sum, item) => sum + item.remainingCount, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600">
                      {displayAreaData.reduce((sum, item) => sum + item.remainingAreaSqm, 0).toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm">-</td>
                    <td className="px-4 py-3 text-sm text-center">-</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
          
          {(displayMode === 'section' ? displayData.length : displayAreaData.length) === 0 && (
            <div className="text-center py-12 text-gray-500">
              該当する区画がありません
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            ※ 1区画 = 3.6㎡、半区画 = 1.8㎡として計算
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded mr-1" /> 60%未満
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded mr-1" /> 60-80%
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded mr-1" /> 80-95%
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded mr-1" /> 95%以上
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
