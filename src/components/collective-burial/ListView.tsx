'use client';

/**
 * 合祀一覧コンポーネント
 * Prisma CollectiveBurialモデルに準拠
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
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
import {
  calculateElapsedYears,
  calculateScheduledCollectiveBurialDate,
} from '@/lib/collective-burial-rules';
import PageHeader from '@/components/page-header';

interface CollectiveBurialListViewProps {
  onBack?: () => void;
  onSelectRecord?: (record: CollectiveBurialListItem) => void;
}

export default function CollectiveBurialListView({
  onBack,
  onSelectRecord,
}: CollectiveBurialListViewProps) {
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [billingStatus, setBillingStatus] = useState<BillingStatus | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');

  // API呼び出し
  const { items, pagination, isLoading, error, search, refresh } = useCollectiveBurialList();
  const { data: yearlyStats } = useCollectiveBurialStats();

  // 現在年（毎レンダー取得。日付ハードコードしない）
  const currentYear = new Date().getFullYear();

  // 検索ヒット件数（全件）と、フィルタ適用中かどうか（#174 / #175 / #187）
  const totalHits = pagination?.totalCount ?? 0;
  const hasActiveFilter =
    searchQuery !== '' || billingStatus !== 'all' || selectedYear !== 'all';

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

  // 今年のみに絞り込み
  const filterByCurrentYear = () => {
    setSelectedYear(currentYear);
    search({
      search: searchQuery || undefined,
      billingStatus: billingStatus === 'all' ? undefined : billingStatus,
      year: currentYear,
    });
  };

  // フィルターリセット
  const resetFilters = () => {
    setSearchQuery('');
    setBillingStatus('all');
    setSelectedYear('all');
    search({});
  };

  // 今年の請求対象者サマリ（件数・内訳は yearlyStats を優先、金額は items から集計）
  const currentYearSummary = useMemo(() => {
    const statsRow = yearlyStats?.find(s => s.year === currentYear);
    const itemsThisYear = items.filter(item => {
      if (!item.billingScheduledDate) return false;
      return new Date(item.billingScheduledDate).getFullYear() === currentYear;
    });

    const totalCount = statsRow?.count ?? itemsThisYear.length;
    const pendingCount = statsRow?.pendingCount ?? itemsThisYear.filter(i => i.billingStatus === 'pending').length;
    const billedCount = statsRow?.billedCount ?? itemsThisYear.filter(i => i.billingStatus === 'billed').length;
    const paidCount = statsRow?.paidCount ?? itemsThisYear.filter(i => i.billingStatus === 'paid').length;

    const totalAmount = itemsThisYear.reduce((sum, i) => sum + (i.billingAmount ?? 0), 0);
    const paidAmount = itemsThisYear
      .filter(i => i.billingStatus === 'paid')
      .reduce((sum, i) => sum + (i.billingAmount ?? 0), 0);
    const outstandingAmount = totalAmount - paidAmount;

    const paidRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

    return {
      totalCount,
      pendingCount,
      billedCount,
      paidCount,
      totalAmount,
      paidAmount,
      outstandingAmount,
      paidRate,
    };
  }, [items, yearlyStats, currentYear]);

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
      .sort((a, b) => {
        // 今年のグループを最上部に固定
        if (a.year === currentYear) return -1;
        if (b.year === currentYear) return 1;
        return a.year - b.year;
      });
  }, [items, selectedYear, currentYear]);

  // 日付フォーマット
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        title="合祀管理"
        subtitle="合祀区画の請求・埋葬管理"
        theme="cha"
        icon={
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />

      {/* スクロール領域（凡例・フィルター・メインコンテンツ全てスクロール） */}
      <div className="flex-1 overflow-auto bg-gradient-warm">
        {/* 凡例 + アクションボタン */}
        <div className="flex items-center px-3 md:px-6 py-2 md:py-3 border-b border-gin bg-kinari">
          <div className="flex-1 flex flex-wrap items-center gap-2 md:gap-3 text-sm">
            {/* 凡例（クリック不可・色の意味の説明）。請求状況の絞り込みは下の「請求ステータス」で行う */}
            <span className="text-xs text-hai font-medium shrink-0">凡例:</span>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">請求前</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">請求済</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">支払済</span>
            <span className="text-xs text-hai">合祀年「*」= 埋葬日 + 有効年数の自動計算</span>
            <span className="text-xs text-hai">／ 区画番号クリックで台帳詳細へ</span>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Button onClick={resetFilters} variant="outline" size="sm" className="h-8 text-xs">
              リセット
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline" size="sm" className="h-8 text-xs">
                戻る
              </Button>
            )}
          </div>
        </div>

        {/* フィルターエリア */}
        <div className="bg-white border-b border-gin px-3 md:px-6 py-3 md:py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {/* 検索キーワード */}
            <div>
              <Label className="text-xs md:text-sm font-medium text-sumi mb-1 block">検索</Label>
              <Input
                type="text"
                placeholder="区画番号・氏名で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-9"
              />
            </div>

            {/* 請求ステータス */}
            <div>
              <Label className="text-xs md:text-sm font-medium text-sumi mb-1 block">請求ステータス</Label>
              <Select
                value={billingStatus}
                onValueChange={(v) => setBillingStatus(v as BillingStatus | 'all')}
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-xs md:text-sm font-medium text-sumi mb-1 block">請求予定年</Label>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(v === 'all' ? 'all' : parseInt(v))}
              >
                <SelectTrigger className="h-9">
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
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} variant="cha" className="flex-1 h-9">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                検索
              </Button>
              <Button onClick={refresh} variant="outline" size="sm" className="h-9 hidden sm:flex">
                再読み込み
              </Button>
            </div>
          </div>

          {/* 検索結果サマリー */}
          <div className="mt-2 md:mt-4 flex items-center justify-between pt-2 md:pt-4 border-t border-gin">
            <p className="text-sm text-hai">
              検索結果: <span className="font-bold text-cha text-lg">{totalHits}</span> 件
            </p>
            <Button onClick={refresh} variant="outline" size="sm" className="sm:hidden h-8 text-xs">
              再読み込み
            </Button>
          </div>

          {/* 適用中の条件（検索語・請求状況・請求年は AND で絞り込まれる。#187） */}
          {hasActiveFilter && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-hai">適用中:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cha-50 text-cha-800 border border-cha-200 rounded-full font-medium">
                  検索「{searchQuery}」
                </span>
              )}
              {billingStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cha-50 text-cha-800 border border-cha-200 rounded-full font-medium">
                  請求状況: {BILLING_STATUS_LABELS[billingStatus as BillingStatus]}
                </span>
              )}
              {selectedYear !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cha-50 text-cha-800 border border-cha-200 rounded-full font-medium">
                  請求年: {selectedYear}年
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-cha underline underline-offset-2 hover:text-cha-700"
              >
                条件をクリア
              </button>
            </div>
          )}
        </div>

        {/* 今年の請求対象者サマリカード */}
        <div className="px-3 md:px-6 pt-3 md:pt-6">
          <div className="bg-white rounded-elegant-lg shadow-elegant overflow-hidden border-2 border-matsu-300">
            <div className="bg-gradient-matsu px-4 md:px-6 py-3 md:py-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                    今年
                  </span>
                  <h3 className="font-mincho text-base md:text-xl font-semibold text-white tracking-wide truncate">
                    {currentYear}年 請求対象者
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={filterByCurrentYear}
                  className="flex-shrink-0 bg-white text-matsu-700 hover:bg-matsu-50 transition-colors px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                >
                  今年のみ表示
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="px-4 md:px-6 py-6 md:py-8 bg-white flex items-center justify-center text-hai text-sm">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-matsu mr-2" aria-hidden="true" />
                集計中...
              </div>
            ) : currentYearSummary.totalCount === 0 ? (
              <div className="px-4 md:px-6 py-4 md:py-6 bg-white">
                <EmptyState
                  container="plain"
                  size="sm"
                  icon={
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  title={`${currentYear}年の請求対象者はいません`}
                  description={
                    hasActiveFilter && totalHits > 0
                      ? `検索条件に一致する ${totalHits} 件は ${currentYear}年 以外の請求予定です。特定の年を見るには「請求予定年」で絞り込んでください。`
                      : '合祀者の登録時に「初回請求年」を設定すると、該当年度にこの一覧へ表示されます。'
                  }
                />
              </div>
            ) : (
              <div className="px-4 md:px-6 py-4 md:py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* 件数サマリ */}
                  <div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl md:text-4xl font-bold text-matsu">
                        {currentYearSummary.totalCount}
                      </span>
                      <span className="text-sm text-hai">件</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                        請求前 {currentYearSummary.pendingCount}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                        請求済 {currentYearSummary.billedCount}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                        支払済 {currentYearSummary.paidCount}
                      </span>
                    </div>
                  </div>

                  {/* 進捗バー */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs md:text-sm text-hai font-medium">入金完了率</span>
                      <span className="text-xl md:text-2xl font-bold text-matsu">
                        {currentYearSummary.paidRate}
                        <span className="text-sm text-hai ml-0.5">%</span>
                      </span>
                    </div>
                    <div className="w-full bg-kinari rounded-full h-3 overflow-hidden border border-gin">
                      <div
                        className="h-full bg-gradient-to-r from-matsu-400 to-matsu transition-all duration-500"
                        style={{ width: `${currentYearSummary.paidRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-hai mt-1">
                      {currentYearSummary.paidCount} / {currentYearSummary.totalCount} 件入金済
                    </p>
                  </div>

                  {/* 金額サマリ */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs md:text-sm text-hai">請求総額</span>
                      <span className="text-sm md:text-base font-semibold text-sumi">
                        ¥{currentYearSummary.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs md:text-sm text-hai">入金済額</span>
                      <span className="text-sm md:text-base font-semibold text-green-700">
                        ¥{currentYearSummary.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-gin">
                      <span className="text-xs md:text-sm text-hai">未収額</span>
                      <span className="text-sm md:text-base font-semibold text-red-700">
                        ¥{currentYearSummary.outstandingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-3 md:p-6">
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
            <EmptyState
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                </svg>
              }
              title="該当する合祀データが見つかりませんでした"
              description={
                (searchQuery || billingStatus !== 'all' || selectedYear !== 'all')
                  ? '検索語・請求状況・請求年の条件を緩めて再検索してください。'
                  : 'まだ合祀者が登録されていません。新規登録ボタンから追加できます。'
              }
              action={
                (searchQuery || billingStatus !== 'all' || selectedYear !== 'all') ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setBillingStatus('all');
                      setSelectedYear('all');
                      search({});
                    }}
                  >
                    条件をクリア
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-8">
              {groupedByYear.map(group => {
                const isCurrentYear = group.year === currentYear;
                return (
                  <div
                    key={group.year}
                    className={`bg-white rounded-elegant-lg shadow-elegant overflow-hidden ${isCurrentYear ? 'border-2 border-matsu-300 ring-2 ring-matsu-100' : 'border border-gin'
                      }`}
                  >
                    {/* 年ヘッダー */}
                    <div
                      className={`px-3 md:px-6 py-3 md:py-4 relative overflow-hidden ${isCurrentYear ? 'bg-gradient-matsu' : 'bg-gradient-cha'
                        }`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isCurrentYear && (
                            <span className="bg-white/25 text-white px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                              今年
                            </span>
                          )}
                          <h3 className="font-mincho text-xl font-semibold text-white tracking-wide truncate">
                            {group.year === 0 ? '請求予定日未設定' : `${group.year}年 請求予定`}
                          </h3>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm whitespace-nowrap ${isCurrentYear ? 'bg-white text-matsu-700' : 'bg-white text-cha'
                          }`}>
                          {group.totalCount} 件
                        </span>
                      </div>
                    </div>

                    {/* テーブル */}
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed">
                        <thead className="bg-kinari border-b border-gin">
                          <tr>
                            <th className="text-left px-2 md:px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '140px' }}>契約者名</th>
                            <th className="text-left px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden sm:table-cell" style={{ width: '80px' }}>区画</th>
                            <th className="text-left px-2 md:px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '100px' }}>区画番号</th>
                            <th className="text-center px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden md:table-cell" style={{ width: '80px' }}>契約年</th>
                            <th className="text-center px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden md:table-cell" style={{ width: '100px' }}>納骨日</th>
                            <th className="text-center px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden md:table-cell" style={{ width: '80px' }}>経過年数</th>
                            <th className="text-center px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden lg:table-cell" style={{ width: '80px' }}>合祀年</th>
                            <th className="text-center px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden lg:table-cell" style={{ width: '80px' }}>埋葬上限</th>
                            <th className="text-right px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden sm:table-cell" style={{ width: '100px' }}>請求金額</th>
                            <th className="text-left px-2 md:px-4 py-3 text-sm font-semibold text-sumi hidden lg:table-cell" style={{ width: '120px' }}>備考</th>
                            <th className="text-center px-2 md:px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '90px' }}>ステータス</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gin">
                          {group.items.map((record) => {
                            // 最新の納骨日を取得
                            const latestBurialDate = record.buriedPersons
                              .map(bp => bp.burialDate)
                              .filter((d): d is string => d !== null)
                              .sort()
                              .at(-1) || null;

                            // 経過年数（最新埋葬日から今日まで）
                            const elapsedYears = calculateElapsedYears(latestBurialDate);

                            // 合祀年: billingScheduledDate 優先、無ければ
                            // 上限到達日 or 最新埋葬日 + validityPeriodYears で client-side fallback 計算
                            const fallbackScheduled = calculateScheduledCollectiveBurialDate(
                              record.capacityReachedDate ?? latestBurialDate,
                              record.validityPeriodYears,
                            );
                            const scheduledDate = record.billingScheduledDate
                              ? new Date(record.billingScheduledDate)
                              : fallbackScheduled;
                            const collectiveBurialYear = scheduledDate
                              ? scheduledDate.getFullYear()
                              : null;
                            const isFallbackScheduled = !record.billingScheduledDate && scheduledDate !== null;

                            // 契約年
                            const contractYear = record.contractDate
                              ? new Date(record.contractDate).getFullYear()
                              : null;

                            return (
                              <tr
                                key={record.id}
                                className="cursor-pointer transition-all duration-200 hover:bg-cha-50"
                                onClick={() => onSelectRecord?.(record)}
                              >
                                <td className="px-2 md:px-4 py-3">
                                  <div className="font-medium text-sumi truncate">{record.applicantName || '-'}</div>
                                  {record.applicantNameKana && (
                                    <div className="text-xs text-hai truncate">{record.applicantNameKana}</div>
                                  )}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-sm text-hai hidden sm:table-cell">
                                  {record.areaName}
                                </td>
                                <td className="px-2 md:px-4 py-3">
                                  {/* 区画番号クリックで台帳詳細へ（行クリックの合祀詳細とは分離）#188 */}
                                  <Link
                                    href={`/plots/${record.contractPlotId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-semibold text-matsu hover:text-matsu-700 hover:underline underline-offset-2"
                                    title="台帳詳細を開く"
                                  >
                                    {record.plotNumber}
                                  </Link>
                                </td>
                                <td className="px-2 md:px-4 py-3 text-center text-sm text-sumi hidden md:table-cell">
                                  {contractYear ? `${contractYear}年` : '-'}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-center text-sm text-hai hidden md:table-cell">
                                  {formatDate(latestBurialDate)}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-center text-sm text-sumi hidden md:table-cell">
                                  {elapsedYears !== null ? `${elapsedYears}年` : '-'}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-center text-sm text-sumi hidden lg:table-cell">
                                  {collectiveBurialYear ? (
                                    <span className={isFallbackScheduled ? 'text-hai italic' : ''} title={isFallbackScheduled ? '埋葬日 + 有効年数の自動計算（請求予定日未設定）' : undefined}>
                                      {collectiveBurialYear}年
                                      {isFallbackScheduled && (
                                        <span className="ml-0.5 text-xs">*</span>
                                      )}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-center text-sm text-sumi hidden lg:table-cell">
                                  {record.burialCapacity}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-right text-sm text-sumi hidden sm:table-cell">
                                  {record.billingAmount != null
                                    ? `¥${record.billingAmount.toLocaleString()}`
                                    : '-'}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-sm text-hai truncate hidden lg:table-cell">
                                  {record.notes || '-'}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${BILLING_STATUS_COLORS[record.billingStatus as BillingStatus]}`}>
                                    {BILLING_STATUS_LABELS[record.billingStatus as BillingStatus]}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* フッター統計 */}
        {yearlyStats && yearlyStats.length > 0 && (
          <div className="bg-white border-t border-gin px-3 md:px-6 py-3 md:py-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-sm text-hai font-medium">年別統計（全件）:</span>
              {hasActiveFilter && (
                <span className="text-xs text-hai">※ 検索条件は未適用・全期間の合計です</span>
              )}
              {yearlyStats.slice(0, 5).map(stat => (
                <span key={stat.year} className="text-xs md:text-sm bg-kinari px-2 md:px-3 py-1 rounded-full border border-gin">
                  <span className="font-semibold text-sumi">{stat.year}年</span>
                  <span className="text-hai ml-1">
                    {stat.count}件
                    <span className="text-xs ml-1 hidden sm:inline">
                      (前{stat.pendingCount}/済{stat.billedCount}/払{stat.paidCount})
                    </span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
