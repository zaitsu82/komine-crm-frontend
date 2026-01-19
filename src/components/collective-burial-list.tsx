'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CollectiveBurialListRecord,
  CollectiveBurialSection,
  COLLECTIVE_BURIAL_SECTION_LABELS,
} from '@/types/collective-burial-list';
import {
  getCollectiveBurialListByYear,
  searchCollectiveBurialList,
  getAvailableCollectiveBurialYears,
  getCollectiveBurialStatsBySection,
  getCollectiveBurialStatsByYear,
} from '@/lib/collective-burial-list-data';
import { formatDateWithEra } from '@/lib/utils';

interface CollectiveBurialListProps {
  onBack?: () => void;
  onSelectRecord?: (record: CollectiveBurialListRecord) => void;
}

export default function CollectiveBurialList({
  onBack,
  onSelectRecord,
}: CollectiveBurialListProps) {
  const currentYear = new Date().getFullYear();

  // フィルター状態
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedSection, setSelectedSection] = useState<CollectiveBurialSection | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contractYearFrom, setContractYearFrom] = useState<string>('');
  const [contractYearTo, setContractYearTo] = useState<string>('');

  // 利用可能な年のリスト
  const availableYears = useMemo(() => getAvailableCollectiveBurialYears(), []);

  // 統計データ
  const sectionStats = useMemo(() => getCollectiveBurialStatsBySection(), []);
  const yearStats = useMemo(() => getCollectiveBurialStatsByYear(), []);

  // フィルタリングされたデータ
  const filteredData = useMemo(() => {
    return searchCollectiveBurialList({
      year: selectedYear === 'all' ? undefined : selectedYear,
      section: selectedSection === 'all' ? undefined : selectedSection,
      searchQuery: searchQuery || undefined,
      contractYearFrom: contractYearFrom ? parseInt(contractYearFrom) : undefined,
      contractYearTo: contractYearTo ? parseInt(contractYearTo) : undefined,
    });
  }, [selectedYear, selectedSection, searchQuery, contractYearFrom, contractYearTo]);

  // 年別グループ化データ
  const yearGroups = useMemo(() => {
    if (selectedYear !== 'all') {
      return [{
        year: selectedYear,
        records: filteredData,
        totalCount: filteredData.reduce((sum, r) => sum + r.count, 0),
      }];
    }

    // 年別にグループ化
    const groups = new Map<number, CollectiveBurialListRecord[]>();
    filteredData.forEach(record => {
      const year = record.collectiveBurialYear;
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(record);
    });

    return Array.from(groups.entries())
      .map(([year, records]) => ({
        year,
        records,
        totalCount: records.reduce((sum, r) => sum + r.count, 0),
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData, selectedYear]);

  // フィルターをリセット
  const resetFilters = () => {
    setSelectedYear('all');
    setSelectedSection('all');
    setSearchQuery('');
    setContractYearFrom('');
    setContractYearTo('');
  };

  // 日付フォーマット
  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cha-50 to-kinari border-b border-cha-200 px-6 py-5 relative overflow-hidden">
        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cha-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-cha flex items-center justify-center shadow-cha">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-mincho text-2xl font-semibold text-sumi tracking-wide">合祀一覧</h2>
              <span className="text-sm text-cha bg-cha-100 px-3 py-0.5 rounded-full mt-1 inline-block">
                納骨堂契約者
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={resetFilters}
              variant="outline"
              size="default"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              フィルターリセット
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="cha" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                戻る
              </Button>
            )}
          </div>
        </div>

        {/* 凡例 */}
        <div className="relative mt-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-matsu-50 border-l-4 border-l-matsu border border-matsu-200 rounded-md"></span>
            <span className="text-sumi font-medium">7年後合祀（2015年1月以前契約）</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-ai-50 border-l-4 border-l-ai border border-ai-200 rounded-md"></span>
            <span className="text-sumi font-medium">13年後合祀（2021年4月以降契約）</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-kinari border-l-4 border-l-hai border border-gin rounded-md"></span>
            <span className="text-sumi font-medium">33年後合祀（その他）</span>
          </div>
        </div>
      </div>

      {/* フィルターエリア */}
      <div className="bg-white border-b border-gin px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 年選択 */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">合祀予定年</Label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-gin rounded-elegant text-sm bg-white text-sumi focus:ring-2 focus:ring-cha focus:border-cha transition-all"
            >
              <option value="all">すべての年</option>
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}年 ({yearStats[year] || 0}件)
                </option>
              ))}
            </select>
          </div>

          {/* 区画選択 */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">区画</Label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value as CollectiveBurialSection | 'all')}
              className="w-full px-4 py-2.5 border border-gin rounded-elegant text-sm bg-white text-sumi focus:ring-2 focus:ring-cha focus:border-cha transition-all"
            >
              <option value="all">すべての区画</option>
              {(Object.keys(COLLECTIVE_BURIAL_SECTION_LABELS) as CollectiveBurialSection[]).map(section => (
                <option key={section} value={section}>
                  {section} ({sectionStats[section]}件)
                </option>
              ))}
            </select>
          </div>

          {/* 名前検索 */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">名前検索</Label>
            <Input
              type="text"
              placeholder="氏名・区画番号で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 契約年範囲 */}
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">契約年（から）</Label>
            <Input
              type="number"
              placeholder="例: 2020"
              value={contractYearFrom}
              onChange={(e) => setContractYearFrom(e.target.value)}
              min={2000}
              max={currentYear}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-sumi mb-2 block">契約年（まで）</Label>
            <Input
              type="number"
              placeholder="例: 2024"
              value={contractYearTo}
              onChange={(e) => setContractYearTo(e.target.value)}
              min={2000}
              max={currentYear}
            />
          </div>
        </div>

        {/* 検索結果サマリー */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-gin">
          <p className="text-sm text-hai">
            検索結果: <span className="font-bold text-cha text-lg">{filteredData.length}</span> 件
            <span className="mx-2 text-gin">|</span>
            合計: <span className="font-bold text-sumi">{filteredData.reduce((sum, r) => sum + r.count, 0)}</span> 件
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={() => setSelectedYear(currentYear)}
              variant={selectedYear === currentYear ? 'cha' : 'outline'}
              size="sm"
            >
              今年（{currentYear}年）
            </Button>
            <Button
              onClick={() => setSelectedYear(currentYear + 1)}
              variant={selectedYear === currentYear + 1 ? 'cha' : 'outline'}
              size="sm"
            >
              来年（{currentYear + 1}年）
            </Button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-warm">
        {yearGroups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-elegant-lg border border-gin">
            <svg className="w-16 h-16 mx-auto mb-4 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-hai text-lg">該当するデータがありません</p>
          </div>
        ) : (
          <div className="space-y-8">
            {yearGroups.map(group => (
              <div key={group.year} className="bg-white rounded-elegant-lg shadow-elegant overflow-hidden border border-gin">
                {/* 年ヘッダー */}
                <div className="bg-gradient-cha px-6 py-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative flex items-center justify-between">
                    <h3 className="font-mincho text-xl font-semibold text-white tracking-wide">
                      {group.year}年 合祀予定
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
                        <th className="text-left px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '160px' }}>氏名</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '80px' }}>区画</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '100px' }}>区画番号</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '80px' }}>契約年</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '110px' }}>納骨日</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '80px' }}>合祀年</th>
                        <th className="text-center px-4 py-3 text-sm font-semibold text-sumi" style={{ width: '50px' }}>件数</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-sumi">備考</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gin">
                      {group.records.map((record) => (
                        <tr
                          key={record.id}
                          className={`cursor-pointer transition-all duration-200 ${record.periodType === '7year'
                            ? 'bg-matsu-50 hover:bg-matsu-100 border-l-4 border-l-matsu'
                            : record.periodType === '13year'
                              ? 'bg-ai-50 hover:bg-ai-100 border-l-4 border-l-ai'
                              : 'bg-kinari hover:bg-cha-50 border-l-4 border-l-hai'
                            }`}
                          onClick={() => onSelectRecord?.(record)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-sumi truncate">{record.name}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-sumi">
                              {record.section}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-hai">
                            {record.plotNumber}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-hai">
                            {record.contractYear}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-hai">
                            {formatDate(record.burialDate)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-cha">{record.collectiveBurialYear}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-hai">
                            {record.count}
                          </td>
                          <td className="px-4 py-3 text-sm text-hai truncate">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター統計 */}
      <div className="bg-white border-t border-gin px-6 py-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-hai font-medium">区画別:</span>
            {(Object.keys(sectionStats) as CollectiveBurialSection[]).map(section => (
              <span key={section} className="text-sm bg-kinari px-3 py-1 rounded-full border border-gin">
                <span className="font-semibold text-sumi">{section}</span>
                <span className="text-hai ml-1">{sectionStats[section]}件</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
