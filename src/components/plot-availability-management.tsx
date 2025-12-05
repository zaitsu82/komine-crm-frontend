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
  { key: 'all', label: '全区画表示', icon: '📋', description: '全ての区画を一覧表示' },
  { key: 'available', label: '空き区画のみ', icon: '✓', description: '残数のある区画' },
  { key: 'soldout', label: '完売区画', icon: '×', description: '残数0の区画' },
  { key: 'usage-rate', label: '使用率順', icon: '📊', description: '使用率でソート' },
  { key: 'remaining', label: '残数順', icon: '🔢', description: '残数でソート' },
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
    if (usageRate >= 95) return 'bg-beni-50 text-beni-dark';
    if (usageRate >= 80) return 'bg-kohaku-50 text-kohaku-dark';
    if (usageRate >= 60) return 'bg-cha-50 text-cha-dark';
    return 'bg-matsu-50 text-matsu-dark';
  };

  // 残数に応じた色を取得
  const getRemainingColor = (remaining: number, total: number) => {
    const rate = (remaining / total) * 100;
    if (rate <= 5) return 'text-beni font-bold';
    if (rate <= 15) return 'text-kohaku font-semibold';
    if (rate <= 30) return 'text-cha';
    return 'text-matsu';
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
    <div className="flex h-screen bg-shiro">
      {/* サイドメニュー */}
      <div className="w-72 bg-white border-r border-gin shadow-elegant flex flex-col">
        <div className="p-5 bg-gradient-ai text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-mincho text-lg font-semibold tracking-wide">区画残数管理</h3>
                <p className="text-xs text-ai-100 mt-0.5">2025年6月末現在</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          {/* メインメニューに戻るボタン */}
          {onNavigateToMenu && (
            <Button
              onClick={onNavigateToMenu}
              className="w-full mb-5"
              variant="outline"
              size="lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              メインメニューに戻る
            </Button>
          )}

          {/* 表示形式切替（区画別/面積別） */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-hai uppercase mb-2 tracking-wider">表示形式</h4>
            <div className="flex gap-1 p-1 bg-kinari rounded-elegant border border-gin">
              <button
                onClick={() => setDisplayMode('section')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  displayMode === 'section'
                    ? 'bg-ai text-white shadow-elegant'
                    : 'text-hai hover:text-sumi hover:bg-white'
                )}
              >
                区画別
              </button>
              <button
                onClick={() => setDisplayMode('area')}
                className={cn(
                  'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  displayMode === 'area'
                    ? 'bg-ai text-white shadow-elegant'
                    : 'text-hai hover:text-sumi hover:bg-white'
                )}
              >
                面積別
              </button>
            </div>
          </div>

          {/* 表示モード切替 */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-hai uppercase mb-2 tracking-wider">フィルター</h4>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key as ViewMode)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-elegant transition-all duration-200 text-sm flex items-center',
                    viewMode === item.key
                      ? 'bg-ai-50 text-ai border border-ai-200 font-semibold'
                      : 'hover:bg-kinari text-hai hover:text-sumi border border-transparent'
                  )}
                >
                  <span className="w-6">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 期別フィルター */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-hai uppercase mb-2 tracking-wider">期別フィルター</h4>
            <button
              onClick={() => setSelectedPeriod('all')}
              className={cn(
                'w-full text-left px-4 py-2.5 rounded-elegant mb-1 transition-all duration-200 text-sm',
                selectedPeriod === 'all'
                  ? 'bg-matsu-50 text-matsu border border-matsu-200 font-semibold'
                  : 'hover:bg-kinari text-hai hover:text-sumi border border-transparent'
              )}
            >
              全期
            </button>
            {(['1期', '2期', '3期', '4期'] as PlotPeriod[]).map((period) => {
              const ps = periodSummaries.find(p => p.period === period);
              const periodColors = {
                '1期': { bg: 'bg-matsu-50', border: 'border-matsu-200', text: 'text-matsu' },
                '2期': { bg: 'bg-ai-50', border: 'border-ai-200', text: 'text-ai' },
                '3期': { bg: 'bg-cha-50', border: 'border-cha-200', text: 'text-cha' },
                '4期': { bg: 'bg-kohaku-50', border: 'border-kohaku-200', text: 'text-kohaku' },
              };
              const colors = periodColors[period];
              
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-elegant mb-1 transition-all duration-200 text-sm',
                    selectedPeriod === period
                      ? `${colors.bg} ${colors.text} border ${colors.border} font-semibold`
                      : 'hover:bg-kinari text-hai hover:text-sumi border border-transparent'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span>{period}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
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
      <div className="flex-1 overflow-auto p-6 bg-gradient-warm">
        {/* 全体サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-matsu-200 rounded-elegant-lg p-5 text-center shadow-elegant">
            <div className="text-3xl font-bold text-matsu">{summary.totalCount.toLocaleString()}</div>
            <div className="text-sm text-matsu font-medium mt-1">総区画数</div>
            <div className="text-xs text-hai mt-2">{areaStats.totalArea.toLocaleString()}㎡</div>
          </div>
          <div className="bg-white border border-ai-200 rounded-elegant-lg p-5 text-center shadow-elegant">
            <div className="text-3xl font-bold text-ai">{summary.usedCount.toLocaleString()}</div>
            <div className="text-sm text-ai font-medium mt-1">使用済区画数</div>
            <div className="text-xs text-hai mt-2">{areaStats.usedArea.toLocaleString()}㎡</div>
          </div>
          <div className="bg-white border border-kohaku-200 rounded-elegant-lg p-5 text-center shadow-elegant">
            <div className="text-3xl font-bold text-kohaku">{summary.remainingCount.toLocaleString()}</div>
            <div className="text-sm text-kohaku font-medium mt-1">残区画数</div>
            <div className="text-xs text-hai mt-2">{areaStats.remainingArea.toLocaleString()}㎡</div>
          </div>
          <div className="bg-white border border-cha-200 rounded-elegant-lg p-5 text-center shadow-elegant">
            <div className="text-3xl font-bold text-cha">{summary.usageRate}%</div>
            <div className="text-sm text-cha font-medium mt-1">使用率</div>
            <div className="w-full bg-cha-100 rounded-full h-2 mt-3">
              <div 
                className="bg-cha h-2 rounded-full transition-all duration-500" 
                style={{ width: `${summary.usageRate}%` }}
              />
            </div>
          </div>
          <div className="bg-white border border-gin rounded-elegant-lg p-5 text-center shadow-elegant">
            <div className="text-3xl font-bold text-sumi">{(summary.remainingCount * 2).toLocaleString()}</div>
            <div className="text-sm text-hai font-medium mt-1">半区画換算</div>
            <div className="text-xs text-hai mt-2">1.8㎡×{(summary.remainingCount * 2).toLocaleString()}</div>
          </div>
        </div>

        {/* 期別サマリーカード */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {periodSummaries.map((ps) => {
            const periodColors = {
              '1期': { gradient: 'from-matsu to-matsu-dark', light: 'matsu' },
              '2期': { gradient: 'from-ai to-ai-dark', light: 'ai' },
              '3期': { gradient: 'from-cha to-cha-dark', light: 'cha' },
              '4期': { gradient: 'from-kohaku to-kohaku-dark', light: 'kohaku' },
            };
            const colors = periodColors[ps.period as keyof typeof periodColors];
            
            return (
              <button
                key={ps.period}
                onClick={() => setSelectedPeriod(ps.period)}
                className={cn(
                  "bg-white border rounded-elegant-lg p-5 text-left transition-all duration-300 hover:shadow-elegant-lg",
                  selectedPeriod === ps.period 
                    ? `border-${colors.light} ring-2 ring-${colors.light}-100 shadow-elegant` 
                    : "border-gin hover:border-hai"
                )}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className={cn(
                    "text-lg font-bold font-mincho",
                    `text-${colors.light}`
                  )}>{ps.period}</span>
                  <span className={cn(
                    "text-xs px-3 py-1 rounded-full font-medium",
                    getUsageRateColor(ps.usageRate)
                  )}>
                    {ps.usageRate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-hai text-xs mb-1">総数</div>
                    <div className="font-bold text-sumi">{ps.totalCount}</div>
                  </div>
                  <div>
                    <div className="text-hai text-xs mb-1">使用</div>
                    <div className="font-bold text-matsu">{ps.usedCount}</div>
                  </div>
                  <div>
                    <div className="text-hai text-xs mb-1">残り</div>
                    <div className={cn("font-bold", getRemainingColor(ps.remainingCount, ps.totalCount))}>
                      {ps.remainingCount}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-elegant-lg shadow-elegant p-4 mb-4 border border-gin">
          <div className="flex items-center gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={displayMode === 'section' ? "区画名、期で検索..." : "面積、タイプ、期で検索..."}
              className="flex-1 max-w-md"
            />
            <Button 
              onClick={() => setSearchQuery('')}
              variant="outline"
              size="default"
            >
              クリア
            </Button>
            <div className="flex-1" />
            <span className="text-sm text-hai">
              表示件数: <span className="font-semibold text-sumi">{displayMode === 'section' ? displayData.length : displayAreaData.length}</span>件
              {selectedPeriod !== 'all' && <span className="ml-2 text-ai">({selectedPeriod})</span>}
              {displayMode === 'area' && <span className="ml-2 text-cha">[面積別]</span>}
            </span>
          </div>
        </div>

        {/* データテーブル */}
        <div className="bg-white rounded-elegant-lg shadow-elegant overflow-hidden border border-gin">
          <div className="overflow-x-auto">
            {displayMode === 'section' ? (
              /* 区画別テーブル */
              <table className="w-full">
                <thead className="bg-kinari border-b border-gin">
                  <tr>
                    <th 
                      className={cn(
                        "px-4 py-4 text-left text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        sortKey === 'period' && "bg-cha-50"
                      )}
                      onClick={() => handleSort('period')}
                    >
                      <div className="flex items-center">
                        期
                        {sortKey === 'period' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-left text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        sortKey === 'section' && "bg-cha-50"
                      )}
                      onClick={() => handleSort('section')}
                    >
                      <div className="flex items-center">
                        区画
                        {sortKey === 'section' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        sortKey === 'totalCount' && "bg-cha-50"
                      )}
                      onClick={() => handleSort('totalCount')}
                    >
                      <div className="flex items-center justify-end">
                        総数
                        {sortKey === 'totalCount' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        sortKey === 'usedCount' && "bg-cha-50"
                      )}
                      onClick={() => handleSort('usedCount')}
                    >
                      <div className="flex items-center justify-end">
                        使用数
                        {sortKey === 'usedCount' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        sortKey === 'remainingCount' && "bg-cha-50"
                      )}
                      onClick={() => handleSort('remainingCount')}
                    >
                      <div className="flex items-center justify-end">
                        残数
                        {sortKey === 'remainingCount' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-center text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        sortKey === 'usageRate' && "bg-cha-50"
                      )}
                      onClick={() => handleSort('usageRate')}
                    >
                      <div className="flex items-center justify-center">
                        使用率
                        {sortKey === 'usageRate' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-sumi">
                      状況
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-bold text-sumi">
                      面積（㎡）
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gin">
                  {displayData.map((item, index) => {
                    const usageRate = item.totalCount > 0 
                      ? Math.round((item.usedCount / item.totalCount) * 100 * 10) / 10 
                      : 0;
                    const remainingArea = item.remainingCount * PLOT_SIZE.FULL;
                    const periodColors = {
                      '1期': 'bg-matsu-50 text-matsu',
                      '2期': 'bg-ai-50 text-ai',
                      '3期': 'bg-cha-50 text-cha',
                      '4期': 'bg-kohaku-50 text-kohaku',
                    };
                    
                    return (
                      <tr 
                        key={`${item.period}-${item.section}`}
                        className={cn(
                          "hover:bg-kinari transition-colors",
                          index % 2 === 0 ? 'bg-white' : 'bg-shiro'
                        )}
                      >
                        <td className="px-4 py-3 text-sm">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            periodColors[item.period as keyof typeof periodColors]
                          )}>
                            {item.period}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-sumi">
                          {item.section}
                          {item.category && (
                            <span className="ml-2 text-xs text-hai font-normal">({item.category})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-hai">
                          {item.totalCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-matsu font-medium">
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
                            <div className="w-16 bg-kinari rounded-full h-2 border border-gin">
                              <div 
                                className={cn(
                                  "h-2 rounded-full transition-all duration-300",
                                  usageRate >= 95 ? 'bg-beni' :
                                  usageRate >= 80 ? 'bg-kohaku' :
                                  usageRate >= 60 ? 'bg-cha' :
                                  'bg-matsu'
                                )}
                                style={{ width: `${usageRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-hai w-12">{usageRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.remainingCount === 0 ? (
                            <span className="px-3 py-1 bg-beni-50 text-beni rounded-full text-xs font-medium">
                              完売
                            </span>
                          ) : item.remainingCount <= 5 ? (
                            <span className="px-3 py-1 bg-kohaku-50 text-kohaku rounded-full text-xs font-medium">
                              残少
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-matsu-50 text-matsu rounded-full text-xs font-medium">
                              空有
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-hai">
                          {remainingArea.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* 合計行 */}
                <tfoot className="bg-kinari font-bold border-t-2 border-gin">
                  <tr>
                    <td className="px-4 py-4 text-sm text-sumi" colSpan={2}>
                      合計 {selectedPeriod !== 'all' ? `(${selectedPeriod})` : ''}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-sumi">
                      {displayData.reduce((sum, item) => sum + item.totalCount, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-matsu">
                      {displayData.reduce((sum, item) => sum + item.usedCount, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-kohaku">
                      {displayData.reduce((sum, item) => sum + item.remainingCount, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center text-sumi">
                      {displayData.length > 0 ? (
                        Math.round(
                          (displayData.reduce((sum, item) => sum + item.usedCount, 0) /
                          displayData.reduce((sum, item) => sum + item.totalCount, 0)) * 100 * 10
                        ) / 10
                      ) : 0}%
                    </td>
                    <td className="px-4 py-4 text-sm text-center">-</td>
                    <td className="px-4 py-4 text-sm text-right text-hai">
                      {(displayData.reduce((sum, item) => sum + item.remainingCount, 0) * PLOT_SIZE.FULL).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              /* 面積別テーブル */
              <table className="w-full">
                <thead className="bg-kinari border-b border-gin">
                  <tr>
                    <th 
                      className={cn(
                        "px-4 py-4 text-left text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'period' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('period')}
                    >
                      <div className="flex items-center">
                        期
                        {areaSortKey === 'period' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'areaSqm' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('areaSqm')}
                    >
                      <div className="flex items-center justify-end">
                        面積（㎡）
                        {areaSortKey === 'areaSqm' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'totalCount' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('totalCount')}
                    >
                      <div className="flex items-center justify-end">
                        区画数
                        {areaSortKey === 'totalCount' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'usedCount' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('usedCount')}
                    >
                      <div className="flex items-center justify-end">
                        使用数
                        {areaSortKey === 'usedCount' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'remainingCount' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('remainingCount')}
                    >
                      <div className="flex items-center justify-end">
                        残数
                        {areaSortKey === 'remainingCount' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-right text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'remainingAreaSqm' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('remainingAreaSqm')}
                    >
                      <div className="flex items-center justify-end">
                        残㎡
                        {areaSortKey === 'remainingAreaSqm' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className={cn(
                        "px-4 py-4 text-left text-sm font-bold text-sumi cursor-pointer hover:bg-cha-50 transition-colors",
                        areaSortKey === 'plotType' && "bg-cha-50"
                      )}
                      onClick={() => handleAreaSort('plotType')}
                    >
                      <div className="flex items-center">
                        タイプ
                        {areaSortKey === 'plotType' && (
                          <span className="ml-1 text-cha">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-sumi">
                      状況
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gin">
                  {displayAreaData.map((item, index) => {
                    const periodColors = {
                      '1期': 'bg-matsu-50 text-matsu',
                      '2期': 'bg-ai-50 text-ai',
                      '3期': 'bg-cha-50 text-cha',
                      '4期': 'bg-kohaku-50 text-kohaku',
                    };
                    
                    return (
                      <tr 
                        key={`${item.period}-${item.areaSqm}-${item.plotType}-${index}`}
                        className={cn(
                          "hover:bg-kinari transition-colors",
                          index % 2 === 0 ? 'bg-white' : 'bg-shiro'
                        )}
                      >
                        <td className="px-4 py-3 text-sm">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            periodColors[item.period as keyof typeof periodColors]
                          )}>
                            {item.period}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-sumi">
                          {item.areaSqm}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-hai">
                          {item.totalCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-matsu font-medium">
                          {item.usedCount}
                        </td>
                        <td className={cn(
                          "px-4 py-3 text-sm text-right",
                          getRemainingColor(item.remainingCount, item.totalCount)
                        )}>
                          {item.remainingCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-ai font-medium">
                          {item.remainingAreaSqm}
                        </td>
                        <td className="px-4 py-3 text-sm text-hai">
                          {item.plotType}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.remainingCount === 0 ? (
                            <span className="px-3 py-1 bg-beni-50 text-beni rounded-full text-xs font-medium">
                              完売
                            </span>
                          ) : item.remainingCount <= 5 ? (
                            <span className="px-3 py-1 bg-kohaku-50 text-kohaku rounded-full text-xs font-medium">
                              残少
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-matsu-50 text-matsu rounded-full text-xs font-medium">
                              空有
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* 合計行 */}
                <tfoot className="bg-kinari font-bold border-t-2 border-gin">
                  <tr>
                    <td className="px-4 py-4 text-sm text-sumi" colSpan={2}>
                      合計 {selectedPeriod !== 'all' ? `(${selectedPeriod})` : ''}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-sumi">
                      {displayAreaData.reduce((sum, item) => sum + item.totalCount, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-matsu">
                      {displayAreaData.reduce((sum, item) => sum + item.usedCount, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-kohaku">
                      {displayAreaData.reduce((sum, item) => sum + item.remainingCount, 0)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-ai">
                      {displayAreaData.reduce((sum, item) => sum + item.remainingAreaSqm, 0).toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-sm">-</td>
                    <td className="px-4 py-4 text-sm text-center">-</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
          
          {(displayMode === 'section' ? displayData.length : displayAreaData.length) === 0 && (
            <div className="text-center py-16 text-hai">
              <svg className="w-16 h-16 mx-auto mb-4 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              該当する区画がありません
            </div>
          )}
        </div>

        {/* フッター情報 */}
        <div className="mt-5 flex justify-between items-center text-sm text-hai bg-white rounded-elegant-lg p-4 border border-gin">
          <div>
            ※ 1区画 = 3.6㎡、半区画 = 1.8㎡として計算
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-matsu rounded mr-2" /> 60%未満
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-cha rounded mr-2" /> 60-80%
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-kohaku rounded mr-2" /> 80-95%
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-beni rounded mr-2" /> 95%以上
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}