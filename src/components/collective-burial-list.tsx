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
    <div className="h-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-300 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-amber-900">合祀一覧</h2>
            <span className="text-sm text-amber-700 bg-amber-200 px-3 py-1 rounded-full">
              納骨堂契約者
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="border-amber-400 text-amber-700 hover:bg-amber-50"
            >
              フィルターリセット
            </Button>
            {onBack && (
              <Button
                onClick={onBack}
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                戻る
              </Button>
            )}
          </div>
        </div>
        
        {/* 凡例 */}
        <div className="mt-3 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-green-100 border-l-4 border-l-green-500 border border-green-300 rounded"></span>
            <span className="text-amber-800 font-medium">7年後合祀（2015年1月以前契約）</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-blue-100 border-l-4 border-l-blue-500 border border-blue-300 rounded"></span>
            <span className="text-amber-800 font-medium">13年後合祀（2021年4月以降契約）</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-gray-100 border-l-4 border-l-gray-500 border border-gray-300 rounded"></span>
            <span className="text-amber-800 font-medium">33年後合祀（その他）</span>
          </div>
        </div>
      </div>
      
      {/* フィルターエリア */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 年選択 */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">合祀予定年</Label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            <Label className="text-sm font-medium text-gray-700 mb-1 block">区画</Label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value as CollectiveBurialSection | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            <Label className="text-sm font-medium text-gray-700 mb-1 block">名前検索</Label>
            <Input
              type="text"
              placeholder="氏名・区画番号で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
          
          {/* 契約年範囲 */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">契約年（から）</Label>
            <Input
              type="number"
              placeholder="例: 2020"
              value={contractYearFrom}
              onChange={(e) => setContractYearFrom(e.target.value)}
              className="text-sm"
              min={2000}
              max={currentYear}
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">契約年（まで）</Label>
            <Input
              type="number"
              placeholder="例: 2024"
              value={contractYearTo}
              onChange={(e) => setContractYearTo(e.target.value)}
              className="text-sm"
              min={2000}
              max={currentYear}
            />
          </div>
        </div>
        
        {/* 検索結果サマリー */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            検索結果: <span className="font-bold text-amber-700">{filteredData.length}</span> 件
            （合計: <span className="font-bold">{filteredData.reduce((sum, r) => sum + r.count, 0)}</span> 件）
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={() => setSelectedYear(currentYear)}
              variant="outline"
              size="sm"
              className={selectedYear === currentYear ? 'bg-amber-100 border-amber-400' : ''}
            >
              今年（{currentYear}年）
            </Button>
            <Button
              onClick={() => setSelectedYear(currentYear + 1)}
              variant="outline"
              size="sm"
              className={selectedYear === currentYear + 1 ? 'bg-amber-100 border-amber-400' : ''}
            >
              来年（{currentYear + 1}年）
            </Button>
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto p-6">
        {yearGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">該当するデータがありません</p>
          </div>
        ) : (
          <div className="space-y-8">
            {yearGroups.map(group => (
              <div key={group.year} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* 年ヘッダー */}
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      {group.year}年 合祀予定
                    </h3>
                    <span className="bg-white text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {group.totalCount} 件
                    </span>
                  </div>
                </div>
                
                {/* テーブル */}
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '160px'}}>氏名</th>
                        <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '80px'}}>区画</th>
                        <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '100px'}}>区画番号</th>
                        <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '80px'}}>契約年</th>
                        <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '110px'}}>納骨日</th>
                        <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '80px'}}>合祀年</th>
                        <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700" style={{width: '50px'}}>件数</th>
                        <th className="text-left px-3 py-3 text-sm font-semibold text-gray-700">備考</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.records.map((record) => (
                        <tr
                          key={record.id}
                          className={`cursor-pointer transition-colors ${
                            record.periodType === '7year' 
                              ? 'bg-green-100 hover:bg-green-200 border-l-4 border-l-green-500' 
                              : record.periodType === '13year' 
                                ? 'bg-blue-100 hover:bg-blue-200 border-l-4 border-l-blue-500' 
                                : 'bg-gray-100 hover:bg-gray-200 border-l-4 border-l-gray-500'
                          }`}
                          onClick={() => onSelectRecord?.(record)}
                        >
                          <td className="px-3 py-2">
                            <div className="font-medium text-gray-900 truncate">{record.name}</div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="text-sm font-medium">
                              {record.section}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-sm text-gray-700">
                            {record.plotNumber}
                          </td>
                          <td className="px-3 py-2 text-center text-sm text-gray-700">
                            {record.contractYear}
                          </td>
                          <td className="px-3 py-2 text-center text-sm text-gray-700">
                            {formatDate(record.burialDate)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="font-bold text-amber-700">{record.collectiveBurialYear}</span>
                          </td>
                          <td className="px-3 py-2 text-center text-sm text-gray-700">
                            {record.count}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500 truncate">
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
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">区画別:</span>
            {(Object.keys(sectionStats) as CollectiveBurialSection[]).map(section => (
              <span key={section} className="text-sm">
                <span className="font-medium">{section}</span>: {sectionStats[section]}件
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

