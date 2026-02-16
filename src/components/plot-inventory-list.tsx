'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClipboardList, CheckCircle, XCircle, BarChart3, Hash } from 'lucide-react';
import {
  getAllPlotInventory,
  getPlotInventoryByPeriod,
  calculateAllPeriodSummaries,
  calculateInventorySummary,
  getAvailablePlots,
  getSoldOutPlots,
  getInventorySortedByUsageRate,
  getInventorySortedByRemaining,
} from '@/lib/mock-data/plot-inventory';
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

  return (
    <div className="bg-white rounded-elegant-lg shadow-elegant p-6 max-h-[90vh] overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-sumi">区画在庫一覧</h2>
          <p className="text-sm text-hai">最終更新: {summary.lastUpdated}</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        )}
      </div>

      {/* 全体サマリー */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-matsu-50 border border-matsu-200 rounded-elegant-lg p-4 text-center">
          <div className="text-sm text-matsu font-medium">総区画数</div>
          <div className="text-3xl font-bold text-matsu-dark">{summary.totalCount.toLocaleString()}</div>
          <div className="text-xs text-hai">区画</div>
        </div>
        <div className="bg-ai-50 border border-ai-200 rounded-elegant-lg p-4 text-center">
          <div className="text-sm text-ai font-medium">使用済区画数</div>
          <div className="text-3xl font-bold text-ai-dark">{summary.usedCount.toLocaleString()}</div>
          <div className="text-xs text-hai">区画</div>
        </div>
        <div className="bg-kohaku-50 border border-kohaku-200 rounded-elegant-lg p-4 text-center">
          <div className="text-sm text-kohaku font-medium">残区画数</div>
          <div className="text-3xl font-bold text-kohaku-dark">{summary.remainingCount.toLocaleString()}</div>
          <div className="text-xs text-hai">区画</div>
        </div>
        <div className="bg-cha-50 border border-cha-200 rounded-elegant-lg p-4 text-center">
          <div className="text-sm text-cha font-medium">使用率</div>
          <div className="text-3xl font-bold text-cha-dark">{summary.usageRate}%</div>
          <div className="text-xs text-hai">
            <div className="w-full bg-cha-100 rounded-full h-2 mt-1">
              <div
                className="bg-cha h-2 rounded-full"
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
              "border rounded-elegant-lg p-3 text-left transition-all duration-200 hover:shadow-elegant",
              selectedPeriod === ps.period
                ? "border-ai bg-ai-50"
                : "border-gin hover:border-hai"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sumi">{ps.period}</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                getUsageRateColor(ps.usageRate)
              )}>
                {ps.usageRate}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div>
                <span className="text-hai">総数</span>
                <div className="font-semibold text-sumi">{ps.totalCount}</div>
              </div>
              <div>
                <span className="text-hai">使用</span>
                <div className="font-semibold text-matsu">{ps.usedCount}</div>
              </div>
              <div>
                <span className="text-hai">残り</span>
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
          <ClipboardList className="w-4 h-4 mr-1" /> 全区画表示
        </Button>
        <Button
          variant={viewMode === 'available' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('available')}
          className="bg-matsu hover:bg-matsu-dark text-white"
        >
          <CheckCircle className="w-4 h-4 mr-1" /> 空き区画のみ
        </Button>
        <Button
          variant={viewMode === 'soldout' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('soldout')}
          className="bg-beni hover:bg-beni-dark text-white"
        >
          <XCircle className="w-4 h-4 mr-1" /> 完売区画
        </Button>
        <Button
          variant={viewMode === 'usage-rate' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('usage-rate');
            setSortAscending(!sortAscending);
          }}
        >
          <BarChart3 className="w-4 h-4 mr-1" /> 使用率順 {viewMode === 'usage-rate' && (sortAscending ? '↑' : '↓')}
        </Button>
        <Button
          variant={viewMode === 'remaining' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setViewMode('remaining');
            setSortAscending(!sortAscending);
          }}
        >
          <Hash className="w-4 h-4 mr-1" /> 残数順 {viewMode === 'remaining' && (sortAscending ? '↑' : '↓')}
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedPeriod('all')}
          className={selectedPeriod === 'all' ? 'bg-kinari' : ''}
        >
          全期
        </Button>
        {(['1期', '2期', '3期', '4期'] as PlotPeriod[]).map((period) => (
          <Button
            key={period}
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period ? 'bg-ai-50 border-ai' : ''}
          >
            {period}
          </Button>
        ))}
      </div>

      {/* データテーブル */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-kinari sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-sumi border-b border-gin">期</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-sumi border-b border-gin">区画</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-sumi border-b border-gin">総数</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-sumi border-b border-gin">使用数</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-sumi border-b border-gin">残数</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-sumi border-b border-gin">使用率</th>
              <th className="px-4 py-3 text-center text-sm font-bold text-sumi border-b border-gin">状況</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => {
              const usageRate = item.totalCount > 0
                ? Math.round((item.usedCount / item.totalCount) * 100 * 10) / 10
                : 0;
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
                  <td className="px-4 py-2 text-sm font-medium text-sumi border-b border-gin">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      periodColors[item.period as keyof typeof periodColors]
                    )}>
                      {item.period}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-sumi border-b border-gin">
                    {item.section}
                    {item.category && (
                      <span className="ml-2 text-xs text-hai">({item.category})</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-hai border-b border-gin">
                    {item.totalCount}
                  </td>
                  <td className="px-4 py-2 text-sm text-right text-matsu font-medium border-b border-gin">
                    {item.usedCount}
                  </td>
                  <td className={cn(
                    "px-4 py-2 text-sm text-right border-b border-gin",
                    getRemainingColor(item.remainingCount, item.totalCount)
                  )}>
                    {item.remainingCount}
                  </td>
                  <td className="px-4 py-2 text-sm text-center border-b border-gin">
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
                  <td className="px-4 py-2 text-sm text-center border-b border-gin">
                    {item.remainingCount === 0 ? (
                      <span className="px-2 py-1 bg-beni-50 text-beni rounded-full text-xs font-medium">
                        完売
                      </span>
                    ) : item.remainingCount <= 5 ? (
                      <span className="px-2 py-1 bg-kohaku-50 text-kohaku rounded-full text-xs font-medium">
                        残少
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-matsu-50 text-matsu rounded-full text-xs font-medium">
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
          <div className="text-center py-12 text-hai">
            該当する区画がありません
          </div>
        )}
      </div>

      {/* フッター情報 */}
      <div className="mt-4 pt-4 border-t border-gin flex justify-between items-center text-sm text-hai">
        <div>
          表示件数: {displayData.length}件
          {selectedPeriod !== 'all' && ` (${selectedPeriod})`}
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-matsu rounded mr-1" /> 60%未満
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-cha rounded mr-1" /> 60-80%
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-kohaku rounded mr-1" /> 80-95%
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-beni rounded mr-1" /> 95%以上
          </span>
        </div>
      </div>
    </div>
  );
}

