'use client';

/**
 * 合祀一覧コンポーネント（API連携版）
 * Prisma CollectiveBurialモデルに準拠
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useCollectiveBurialList,
  useCollectiveBurialStats,
} from '@/hooks/useCollectiveBurials';
import {
  CollectiveBurialListItem,
  BillingStatus,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
} from '@/lib/api';

interface CollectiveBurialListViewProps {
  onBack?: () => void;
  onSelectRecord?: (record: CollectiveBurialListItem) => void;
  onCreateNew?: () => void;
}

export default function CollectiveBurialListView({
  onBack,
  onSelectRecord,
  onCreateNew,
}: CollectiveBurialListViewProps) {
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [billingStatus, setBillingStatus] = useState<BillingStatus | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // API呼び出し
  const { items, pagination, isLoading, error, search, refresh } = useCollectiveBurialList();
  const { data: yearlyStats } = useCollectiveBurialStats();

  // 年の選択肢を生成
  const availableYears = useMemo(() => {
    if (!yearlyStats) return [];
    return yearlyStats.map(s => s.year).sort((a, b) => a - b);
  }, [yearlyStats]);

  // 検索実行
  const handleSearch = () => {
    search({
      search: searchQuery || undefined,
      billingStatus: billingStatus === 'all' ? undefined : billingStatus,
      year: selectedYear === 'all' ? undefined : selectedYear,
    });
  };

  // フィルターリセット
  const resetFilters = () => {
    setSearchQuery('');
    setBillingStatus('all');
    setSelectedYear('all');
    search({});
  };

  // 年別グループ化
  const groupedByYear = useMemo(() => {
    if (selectedYear !== 'all') {
      return [{
        year: selectedYear,
        items: items,
        totalCount: items.length,
      }];
    }

    const groups = new Map<number, CollectiveBurialListItem[]>();
    items.forEach(item => {
      if (!item.billingScheduledDate) return;
      const year = new Date(item.billingScheduledDate).getFullYear();
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(item);
    });

    // 請求予定日がないものは別グループに
    const noDateItems = items.filter(item => !item.billingScheduledDate);
    if (noDateItems.length > 0) {
      groups.set(0, noDateItems);
    }

    return Array.from(groups.entries())
      .map(([year, groupItems]) => ({
        year,
        items: groupItems,
        totalCount: groupItems.length,
      }))
      .sort((a, b) => a.year - b.year);
  }, [items, selectedYear]);

  // 日付フォーマット
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cha-50 to-kinari border-b border-cha-200 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cha-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-cha flex items-center justify-center shadow-cha">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-mincho text-2xl font-semibold text-sumi tracking-wide">合祀管理</h2>
              <span className="text-sm text-cha bg-cha-100 px-3 py-0.5 rounded-full mt-1 inline-block">
                API連携版
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onCreateNew && (
              <Button onClick={onCreateNew} variant="cha" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                新規登録
              </Button>
            )}
            <Button onClick={resetFilters} variant="outline" size="default">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              リセット
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                戻る
              </Button>
            )}
          </div>
        </div>

        {/* 凡例 */}
        <div className="relative mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">請求前</span>
            <span className="text-sumi">上限未到達 / 到達後請求待ち</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">請求済</span>
            <span className="text-sumi">請求書送付済み</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">支払済</span>
            <span className="text-sumi">支払い完了</span>
          </div>
        </div>
      </div>

      {/* フィルターエリア */}
      <div className="bg-white border-b border-gin px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 検索キーワード */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">検索</Label>
            <Input
              type="text"
              placeholder="区画番号・氏名で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* 請求ステータス */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">請求ステータス</Label>
            <Select
              value={billingStatus}
              onValueChange={(v) => setBillingStatus(v as BillingStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">請求前</SelectItem>
                <SelectItem value="billed">請求済</SelectItem>
                <SelectItem value="paid">支払済</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 請求予定年 */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">請求予定年</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(v === 'all' ? 'all' : parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての年</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 検索ボタン */}
          <div className="flex items-end">
            <Button onClick={handleSearch} variant="cha" className="w-full">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              検索
            </Button>
          </div>
        </div>

        {/* 検索結果サマリー */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gin">
          <p className="text-sm text-hai">
            検索結果: <span className="font-bold text-cha text-lg">{pagination?.totalCount || 0}</span> 件
          </p>
          <Button onClick={refresh} variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            再読み込み
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-warm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cha"></div>
            <span className="ml-3 text-hai">読み込み中...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-elegant-lg border border-red-200">
            <p className="text-red-600">{error}</p>
            <Button onClick={refresh} variant="outline" className="mt-4">
              再試行
            </Button>
          </div>
        ) : groupedByYear.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-elegant-lg border border-gin">
            <svg className="w-16 h-16 mx-auto mb-4 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-hai text-lg">該当するデータがありません</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByYear.map(group => (
              <div key={group.year} className="bg-white rounded-elegant-lg shadow-elegant overflow-hidden border border-gin">
                {/* 年ヘッダー */}
                <div className="bg-gradient-cha px-6 py-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative flex items-center justify-between">
                    <h3 className="font-mincho text-xl font-semibold text-white tracking-wide">
                      {group.year === 0 ? '請求予定日未設定' : `${group.year}年 請求予定`}
                    </h3>
                    <span className="bg-white text-cha px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                      {group.totalCount} 件
                    </span>
                  </div>
                </div>

                {/* テーブル */}
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-kinari border-b border-gin">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '100px' }}>区画番号</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '80px' }}>区域</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '140px' }}>契約者</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '100px' }}>埋葬状況</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '100px' }}>請求予定日</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '90px' }}>ステータス</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '100px' }}>請求金額</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gin">
                      {group.items.map((record) => {
                        const isCapacityReached = record.currentBurialCount >= record.burialCapacity;
                        return (
                          <tr
                            key={record.id}
                            className={`cursor-pointer transition-all duration-200 hover:bg-cha-50 ${
                              isCapacityReached ? 'bg-beni-50/30' : ''
                            }`}
                            onClick={() => onSelectRecord?.(record)}
                          >
                            <td className="px-4 py-3">
                              <span className="font-semibold text-sumi">{record.plotNumber}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-hai">
                              {record.areaName}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-sumi truncate">{record.applicantName || '-'}</div>
                              {record.applicantNameKana && (
                                <div className="text-xs text-hai truncate">{record.applicantNameKana}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-sm font-medium ${isCapacityReached ? 'text-beni' : 'text-sumi'}`}>
                                {record.currentBurialCount}/{record.burialCapacity}
                              </span>
                              {isCapacityReached && (
                                <span className="ml-1 text-xs text-beni">上限</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-hai">
                              {formatDate(record.billingScheduledDate)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${BILLING_STATUS_COLORS[record.billingStatus as BillingStatus]}`}>
                                {BILLING_STATUS_LABELS[record.billingStatus as BillingStatus]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-sumi">
                              {record.billingAmount != null
                                ? `¥${record.billingAmount.toLocaleString()}`
                                : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター統計 */}
      {yearlyStats && yearlyStats.length > 0 && (
        <div className="bg-white border-t border-gin px-6 py-4">
          <div className="flex flex-wrap gap-4">
            <span className="text-sm text-hai font-medium">年別統計:</span>
            {yearlyStats.slice(0, 5).map(stat => (
              <span key={stat.year} className="text-sm bg-kinari px-3 py-1 rounded-full border border-gin">
                <span className="font-semibold text-sumi">{stat.year}年</span>
                <span className="text-hai ml-1">
                  {stat.count}件
                  <span className="text-xs ml-1">
                    (前{stat.pendingCount}/済{stat.billedCount}/払{stat.paidCount})
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
