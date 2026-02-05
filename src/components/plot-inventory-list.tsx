'use client';

import { useState, useMemo } from 'react';
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
} from '@/lib/plot-inventory';
import { PlotPeriod } from '@/types/plot-constants';

type ViewMode = 'all' | 'period' | 'available' | 'soldout' | 'usage-rate' | 'remaining';
type SelectedPeriod = PlotPeriod | 'all';

interface PlotInventoryListProps {
  onClose?: () => void;
}

export default function PlotInventoryList({ onClose }: PlotInventoryListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod>('all');
  const [sortAscending, setSortAscending] = useState(false);

  // 全体集計
  const summary = useMemo(() => calculateInventorySummary(), []);

  // 期別集計
  const periodSummaries = useMemo(() => calculateAllPeriodSummaries(), []);

  // 表示するデータ
  const displayData = useMemo(() => {
    switch (viewMode) {
      case 'all':
        if (selectedPeriod === 'all') {
          return getAllPlotInventory();
        }
        return getPlotInventoryByPeriod(selectedPeriod);
      case 'period':
        if (selectedPeriod === 'all') {
          return getAllPlotInventory();
        }
        return getPlotInventoryByPeriod(selectedPeriod);
      case 'available':
        return getAvailablePlots().filter(item =>
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
      case 'soldout':
        return getSoldOutPlots().filter(item =>
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
      case 'usage-rate':
        return getInventorySortedByUsageRate(sortAscending).filter(item =>
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
      case 'remaining':
        return getInventorySortedByRemaining(sortAscending).filter(item =>
          selectedPeriod === 'all' || item.period === selectedPeriod
        );
      default:
        return getAllPlotInventory();
    }
  }, [viewMode, selectedPeriod, sortAscending]);

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">区画在庫一覧</h2>
          <p className="text-sm text-gray-500">最終更新: {summary.lastUpdated}</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        )}
      </div>

      {/* 全体サマリー */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm text-blue-600 font-medium">総区画数</div>
          <div className="text-3xl font-bold text-blue-800">{summary.totalCount.toLocaleString()}</div>
          <div className="text-xs text-blue-500">区画</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-sm text-green-600 font-medium">使用済区画数</div>
          <div className="text-3xl font-bold text-green-800">{summary.usedCount.toLocaleString()}</div>
          <div className="text-xs text-green-500">区画</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div className="text-sm text-orange-600 font-medium">残区画数</div>
          <div className="text-3xl font-bold text-orange-800">{summary.remainingCount.toLocaleString()}</div>
          <div className="text-xs text-orange-500">区画</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-sm text-purple-600 font-medium">使用率</div>
          <div className="text-3xl font-bold text-purple-800">{summary.usageRate}%</div>
          <div className="text-xs text-purple-500">
            <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${summary.usageRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 期別サマリー */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {periodSummaries.map((ps) => (
          <button
            key={ps.period}
            onClick={() => {
              setSelectedPeriod(ps.period);
              setViewMode('period');
            }}
            className={cn(
              "border rounded-lg p-3 text-left transition-all hover:shadow-md",
              selectedPeriod === ps.period
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800">{ps.period}</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded",
                getUsageRateColor(ps.usageRate)
              )}>
                {ps.usageRate}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div>
                <span className="text-gray-500">総数</span>
                <div className="font-semibold">{ps.totalCount}</div>
              </div>
              <div>
                <span className="text-gray-500">使用</span>
                <div className="font-semibold text-green-600">{ps.usedCount}</div>
              </div>
              <div>
                <span className="text-gray-500">残り</span>
                <div className={cn("font-semibold", getRemainingColor(ps.remainingCount, ps.totalCount))}>
                  {ps.remainingCount}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
        <Button
          variant={viewMode === 'all' && selectedPeriod === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setViewMode('all'); setSelectedPeriod('all'); }}
        >
          📋 全区画表示
        </Button>
        <Button
          variant={viewMode === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('available')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ✅ 空き区画のみ
        </Button>
        <Button
          variant={viewMode === 'soldout' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('soldout')}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          ❌ 完売区画
        </Button>
        <Button
          variant={viewMode === 'usage-rate' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('usage-rate');
            setSortAscending(!sortAscending);
          }}
        >
          📊 使用率順 {viewMode === 'usage-rate' && (sortAscending ? '↑' : '↓')}
        </Button>
        <Button
          variant={viewMode === 'remaining' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('remaining');
            setSortAscending(!sortAscending);
          }}
        >
          🔢 残数順 {viewMode === 'remaining' && (sortAscending ? '↑' : '↓')}
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPeriod('all')}
          className={selectedPeriod === 'all' ? 'bg-gray-100' : ''}
        >
          全期
        </Button>
        {(['1期', '2期', '3期', '4期'] as PlotPeriod[]).map((period) => (
          <Button
            key={period}
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period ? 'bg-blue-100 border-blue-500' : ''}
          >
            {period}
          </Button>
        ))}
      </div>

      {/* データテーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b">期</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b">区画</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b">総数</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b">使用数</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b">残数</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-b">使用率</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-b">状況</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => {
              const usageRate = item.totalCount > 0
                ? Math.round((item.usedCount / item.totalCount) * 100 * 10) / 10
                : 0;
              return (
                <tr
                  key={`${item.period}-${item.section}`}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  )}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-800 border-b">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      item.period === '1期' ? 'bg-blue-100 text-blue-800' :
                        item.period === '2期' ? 'bg-green-100 text-green-800' :
                          item.period === '3期' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                    )}>
                      {item.period}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-900 border-b">
                    {item.section}
                    {item.category && (
                      <span className="ml-2 text-xs text-gray-500">({item.category})</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-gray-700 border-b">
                    {item.totalCount}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-green-600 font-medium border-b">
                    {item.usedCount}
                  </td>
                  <td className={cn(
                    "px-4 py-2 text-sm text-right border-b",
                    getRemainingColor(item.remainingCount, item.totalCount)
                  )}>
                    {item.remainingCount}
                  </td>
                  <td className="px-4 py-2 text-sm text-center border-b">
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
                  <td className="px-4 py-2 text-sm text-center border-b">
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
        </table>

        {displayData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            該当する区画がありません
          </div>
        )}
      </div>

      {/* フッター情報 */}
      <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-gray-500">
        <div>
          表示件数: {displayData.length}件
          {selectedPeriod !== 'all' && ` (${selectedPeriod})`}
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
  );
}

