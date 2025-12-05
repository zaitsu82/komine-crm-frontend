'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { Customer } from '@/types/customer';
import { mockCustomers } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatDateWithEra } from '@/lib/utils';
import { CollectiveBurialApplication } from '@/types/collective-burial';
import { getCollectiveBurialApplications } from '@/lib/collective-burial';
import CollectiveBurialApplicationForm from '@/components/collective-burial-application-form';
import CollectiveBurialDetail from '@/components/collective-burial-detail';
import CollectiveBurialPrintTemplate from '@/components/collective-burial-print-template';
import { COLLECTIVE_BURIAL_LIMITS, getCapacityStatus, getRemainingCapacity, getCapacityPercentage } from '@/config/collective-burial-limits';

interface CemeteryManagementListProps {
  onCustomerSelect?: (customer: Customer) => void;
  selectedCustomer?: Customer;
  onNavigateToMenu?: () => void;
}

type SortKey = 'name' | 'plotSection' | 'plotNumber' | 'contractYear' | 'burialDate' | 'collectiveBurialInfo';
type SortOrder = 'asc' | 'desc';

const menuItems = [
  '台帳問い合わせ',
  '台帳編集',
  '新規登録',
  '区画管理',
  '合祀一覧',
  '合祀申込',
  '合祀実施記録',
  '納骨予定',
  '区画状況確認',
  '年度別統計',
  '合祀証明書印刷',
  '報告書作成',
];

export default function CemeteryManagementList({ onCustomerSelect, selectedCustomer, onNavigateToMenu }: CemeteryManagementListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [selectedMenu, setSelectedMenu] = useState('台帳問い合わせ');
  const [applications, setApplications] = useState<CollectiveBurialApplication[]>(() => getCollectiveBurialApplications());
  const [lastSuccessMessage, setLastSuccessMessage] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CollectiveBurialApplication | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printingApplication, setPrintingApplication] = useState<CollectiveBurialApplication | null>(null);

  const handleSearch = () => {
    // 検索処理（フィルタリングはuseMemoで実行）
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
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

  const getFirstBurialDate = (customer: Customer): Date | null => {
    if (!customer.buriedPersons || customer.buriedPersons.length === 0) {
      return null;
    }

    const dates = customer.buriedPersons
      .map(person => person.burialDate)
      .filter((date): date is Date => Boolean(date));

    if (dates.length === 0) {
      return null;
    }

    return dates.reduce((earliest, date) => (date < earliest ? date : earliest));
  };

  const getContractYear = (customer: Customer): string => {
    if (customer.contractorInfo?.startDate) {
      return new Date(customer.contractorInfo.startDate).getFullYear().toString();
    }
    if (customer.plotInfo?.contractDate) {
      return new Date(customer.plotInfo.contractDate).getFullYear().toString();
    }
    return '-';
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.nameKana.toLowerCase().includes(query) ||
        customer.customerCode.toLowerCase().includes(query) ||
        (customer.plotInfo?.plotNumber?.toLowerCase().includes(query) ?? false) ||
        (customer.plotInfo?.section?.toLowerCase().includes(query) ?? false)
      );
    }

    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortKey) {
        case 'name':
          aValue = a.nameKana || a.name;
          bValue = b.nameKana || b.name;
          break;
        case 'plotSection':
          aValue = a.plotInfo?.section || '';
          bValue = b.plotInfo?.section || '';
          break;
        case 'plotNumber':
          aValue = a.plotInfo?.plotNumber || '';
          bValue = b.plotInfo?.plotNumber || '';
          break;
        case 'contractYear':
          aValue = getContractYear(a);
          bValue = getContractYear(b);
          break;
        case 'burialDate':
          aValue = getFirstBurialDate(a)?.getTime() || 0;
          bValue = getFirstBurialDate(b)?.getTime() || 0;
          break;
        case 'collectiveBurialInfo':
          aValue = a.buriedPersons?.length || 0;
          bValue = b.buriedPersons?.length || 0;
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, searchQuery, sortKey, sortOrder]);

  const handleApplicationRegistered = (application: CollectiveBurialApplication) => {
    setApplications(prev => {
      const filtered = prev.filter(item => item.id !== application.id);
      return [application, ...filtered];
    });
    setLastSuccessMessage(`申込ID「${application.id}」で登録しました。`);
    alert('合祀申込を登録しました');
  };

  const handleViewDetail = (application: CollectiveBurialApplication) => {
    setSelectedApplication(application);
  };

  const handleCloseDetail = () => {
    setSelectedApplication(null);
  };

  const handlePrintApplication = (application: CollectiveBurialApplication) => {
    setPrintingApplication(application);
    setShowPrintModal(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setPrintingApplication(null);
  };

  const renderCollectiveBurialCards = () => {
    const typeLabel: Record<CollectiveBurialApplication['burialType'], string> = {
      family: '家族合祀',
      relative: '親族合祀',
      other: 'その他',
    };

    const statusLabel: Record<CollectiveBurialApplication['status'], string> = {
      pending: '申込受付',
      scheduled: '実施予定',
      completed: '完了',
      cancelled: '中止',
    };

    // 現在の合祀人数を計算
    const totalPersons = applications.reduce((total, app) => {
      if (app.status !== 'cancelled') {
        return total + app.persons.length;
      }
      return total;
    }, 0);

    const maxCapacity = COLLECTIVE_BURIAL_LIMITS.MAX_TOTAL_CAPACITY;
    const remaining = getRemainingCapacity(totalPersons, maxCapacity);
    const percentage = getCapacityPercentage(totalPersons, maxCapacity);
    const capacityStatus = getCapacityStatus(totalPersons, maxCapacity);

    if (applications.length === 0) {
      return <p className="text-gray-500 text-center py-12">合祀申込がまだ登録されていません</p>;
    }

    return (
      <div className="space-y-4">
        {/* 合祀人数の状況バナー */}
        <div className={`p-4 rounded-lg border-2 ${
          capacityStatus === 'full' ? 'bg-red-50 border-red-400' :
          capacityStatus === 'critical' ? 'bg-orange-50 border-orange-400' :
          capacityStatus === 'warning' ? 'bg-yellow-50 border-yellow-400' :
          'bg-green-50 border-green-400'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {capacityStatus === 'full' ? '🚫' :
                 capacityStatus === 'critical' ? '🚨' :
                 capacityStatus === 'warning' ? '⚠️' :
                 '✅'}
              </span>
              <h3 className={`text-lg font-bold ${
                capacityStatus === 'full' ? 'text-red-900' :
                capacityStatus === 'critical' ? 'text-orange-900' :
                capacityStatus === 'warning' ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                合祀堂収容状況
              </h3>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                capacityStatus === 'full' ? 'text-red-600' :
                capacityStatus === 'critical' ? 'text-orange-600' :
                capacityStatus === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {percentage}%
              </p>
              <p className="text-xs text-gray-600">使用率</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">現在の合祀人数</p>
              <p className="text-xl font-bold text-gray-900">{totalPersons}名</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">上限人数</p>
              <p className="text-lg font-semibold text-gray-700">{maxCapacity}名</p>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">残り人数</p>
              <p className={`text-xl font-bold ${
                capacityStatus === 'full' ? 'text-red-600' :
                capacityStatus === 'critical' ? 'text-orange-600' :
                capacityStatus === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {remaining}名
              </p>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                capacityStatus === 'full' ? 'bg-red-600' :
                capacityStatus === 'critical' ? 'bg-orange-500' :
                capacityStatus === 'warning' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* 警告メッセージ */}
          {capacityStatus !== 'safe' && (
            <div className="mt-3 text-sm">
              {capacityStatus === 'full' && (
                <p className="text-red-800 font-semibold">
                  ⚠️ 合祀堂の収容人数が上限に達しました。これ以上の申込は受け付けできません。
                </p>
              )}
              {capacityStatus === 'critical' && (
                <p className="text-orange-800 font-semibold">
                  ⚠️ 合祀堂の収容人数が95%を超えています。残りわずかです。
                </p>
              )}
              {capacityStatus === 'warning' && (
                <p className="text-yellow-800 font-semibold">
                  ⚠️ 合祀堂の収容人数が80%を超えています。計画的な受付をお願いします。
                </p>
              )}
            </div>
          )}
        </div>

        {/* 申込一覧 */}
        {applications.map((application) => (
          <div key={application.id} className="rounded-lg border border-gray-200 bg-gray-50 p-5 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">申込者: {application.applicant.name}</p>
                <p className="text-sm text-gray-600">{application.applicant.address}</p>
              </div>
              <div className="mt-2 md:mt-0 text-sm text-gray-600 space-y-1">
                <p>申込日: {formatDateWithEra(application.applicationDate)}</p>
                <p>合祀予定日: {formatDateWithEra(application.desiredDate)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">合祀種別</p>
                <p className="text-gray-900">{typeLabel[application.burialType]}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">主たる代表者</p>
                <p className="text-gray-900">{application.mainRepresentative}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">対象者数</p>
                <p className="text-gray-900">{application.persons.length}名</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">区画</p>
                <p className="text-gray-900">{application.plot.section} {application.plot.number}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">ステータス</p>
                <p className="text-gray-900">{statusLabel[application.status]}</p>
              </div>
            </div>

            {application.specialRequests && (
              <div className="text-sm text-gray-700">
                <p className="font-medium">特記事項</p>
                <p>{application.specialRequests}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {application.payment.totalFee && (
                <div>
                  <p className="font-medium text-gray-700">合祀料金</p>
                  <p className="text-gray-900">{application.payment.totalFee.toLocaleString()} 円</p>
                </div>
              )}
              {application.payment.depositAmount && (
                <div>
                  <p className="font-medium text-gray-700">内金</p>
                  <p className="text-gray-900">{application.payment.depositAmount.toLocaleString()} 円</p>
                </div>
              )}
              {application.payment.paymentMethod && (
                <div>
                  <p className="font-medium text-gray-700">支払方法</p>
                  <p className="text-gray-900">{application.payment.paymentMethod}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                <span>ID: {application.id}</span>
                <span>最終更新: {formatDateWithEra(application.updatedAt)}</span>
                {application.documents.length > 0 && <span>関連書類: {application.documents.length}件</span>}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetail(application)}
                >
                  詳細表示
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePrintApplication(application)}
                >
                  印刷
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (selectedMenu) {
      case '台帳問い合わせ':
        return (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">台帳問い合わせ</h2>
              {/* ソート選択エリア */}
              <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">並び替え:</span>
                <div className="flex items-center gap-2">
                  <Select value={sortKey} onValueChange={(value: SortKey) => setSortKey(value)}>
                    <SelectTrigger className="w-[160px] bg-white">
                      <SelectValue placeholder="項目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">氏名</SelectItem>
                      <SelectItem value="plotSection">区画</SelectItem>
                      <SelectItem value="plotNumber">許可番号</SelectItem>
                      <SelectItem value="contractYear">契約年</SelectItem>
                      <SelectItem value="burialDate">納骨日</SelectItem>
                      <SelectItem value="collectiveBurialInfo">合祀人数</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                    <SelectTrigger className="w-[120px] bg-white">
                      <SelectValue placeholder="順序" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">昇順 ↑</SelectItem>
                      <SelectItem value="desc">降順 ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => { setSortKey('plotSection'); setSortOrder('asc'); }}
                    variant={sortKey === 'plotSection' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'plotSection' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    区画順
                  </Button>
                  <Button
                    onClick={() => { setSortKey('name'); setSortOrder('asc'); }}
                    variant={sortKey === 'name' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'name' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    氏名順
                  </Button>
                  <Button
                    onClick={() => { setSortKey('contractYear'); setSortOrder('desc'); }}
                    variant={sortKey === 'contractYear' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'contractYear' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    契約年順
                  </Button>
                  <Button
                    onClick={() => { setSortKey('burialDate'); setSortOrder('desc'); }}
                    variant={sortKey === 'burialDate' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'burialDate' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    納骨日順
                  </Button>
                </div>
              </div>
              {/* 検索エリア */}
              <div className="flex items-center space-x-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="氏名、区画、許可番号で検索..."
                  className="flex-1"
                />
                <Button onClick={() => setSearchQuery('')} variant="outline" size="sm">
                  クリア
                </Button>
                <Button onClick={handleSearch} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  検索
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'name' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>氏名</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'name' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'name' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'plotSection' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('plotSection')}
                      >
                        <div className="flex items-center">
                          <span>区画</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'plotSection' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'plotSection' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'plotNumber' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('plotNumber')}
                      >
                        <div className="flex items-center">
                          <span>許可番号</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'plotNumber' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'plotNumber' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'contractYear' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('contractYear')}
                      >
                        <div className="flex items-center">
                          <span>契約年</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'contractYear' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'contractYear' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'burialDate' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('burialDate')}
                      >
                        <div className="flex items-center">
                          <span>納骨日</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'burialDate' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'burialDate' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'collectiveBurialInfo' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('collectiveBurialInfo')}
                      >
                        <div className="flex items-center">
                          <span>合祀</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'collectiveBurialInfo' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'collectiveBurialInfo' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedCustomers.length > 0 ? (
                      filteredAndSortedCustomers.map((customer, index) => {
                        const firstBurialDate = getFirstBurialDate(customer);
                        const contractYear = getContractYear(customer);
                        const buriedCount = customer.buriedPersons?.length || 0;
                        const maxCapacity = customer.plotInfo?.capacity || 4;

                        return (
                          <tr
                            key={customer.id}
                            className={cn(
                              'cursor-pointer hover:bg-gray-50',
                              selectedCustomer?.id === customer.id && 'bg-blue-50',
                              index % 2 === 1 && 'bg-gray-50'
                            )}
                            onClick={() => onCustomerSelect?.(customer)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.nameKana}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.plotInfo?.section || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.plotInfo?.plotNumber || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contractYear}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {firstBurialDate ?
                                new Date(firstBurialDate).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'numeric',
                                  day: 'numeric',
                                }) :
                                '-'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <span className={cn(
                                  'font-medium',
                                  buriedCount >= maxCapacity && 'text-red-600',
                                  buriedCount > 0 && buriedCount < maxCapacity && 'text-blue-600',
                                  buriedCount === 0 && 'text-gray-400'
                                )}>
                                  {buriedCount}/{maxCapacity}
                                </span>
                                {buriedCount > 0 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({customer.buriedPersons?.[0]?.name}
                                    {buriedCount > 1 && ` 他${buriedCount - 1}名`})
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchQuery.trim()
                            ? '検索条件に該当するデータが見つかりませんでした'
                            : 'データがありません'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case '台帳編集':
        return (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            このメニューは現在準備中です。
          </div>
        );
      case '新規登録':
        return (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            このメニューは現在準備中です。
          </div>
        );
      case '区画管理':
        return (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            このメニューは現在準備中です。
          </div>
        );
      case '合祀申込':
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-2">合祀申込</h2>
              <p className="text-sm text-gray-600">
                合祀の新規申込を登録します。故人情報・法要予定・関連書類を入力後、「登録」ボタンを押してください。
              </p>
            </div>
            {lastSuccessMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {lastSuccessMessage}
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-6">
              <CollectiveBurialApplicationForm onSubmitSuccess={handleApplicationRegistered} />
            </div>
          </div>
        );
      case '合祀実施記録':
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold">合祀実施記録</h2>
              <p className="text-sm text-gray-600">登録済みの合祀申込・実施状況を確認できます。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {renderCollectiveBurialCards()}
            </div>
          </div>
        );
      case '合祀一覧':
        return (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">合祀管理</h2>
              {/* ソート選択エリア */}
              <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">並び替え:</span>
                <div className="flex items-center gap-2">
                  <Select value={sortKey} onValueChange={(value: SortKey) => setSortKey(value)}>
                    <SelectTrigger className="w-[160px] bg-white">
                      <SelectValue placeholder="項目を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">氏名</SelectItem>
                      <SelectItem value="plotSection">区画</SelectItem>
                      <SelectItem value="plotNumber">許可番号</SelectItem>
                      <SelectItem value="contractYear">契約年</SelectItem>
                      <SelectItem value="burialDate">納骨日</SelectItem>
                      <SelectItem value="collectiveBurialInfo">合祀人数</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                    <SelectTrigger className="w-[120px] bg-white">
                      <SelectValue placeholder="順序" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">昇順 ↑</SelectItem>
                      <SelectItem value="desc">降順 ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => { setSortKey('plotSection'); setSortOrder('asc'); }}
                    variant={sortKey === 'plotSection' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'plotSection' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    区画順
                  </Button>
                  <Button
                    onClick={() => { setSortKey('name'); setSortOrder('asc'); }}
                    variant={sortKey === 'name' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'name' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    氏名順
                  </Button>
                  <Button
                    onClick={() => { setSortKey('collectiveBurialInfo'); setSortOrder('desc'); }}
                    variant={sortKey === 'collectiveBurialInfo' ? 'default' : 'outline'}
                    size="sm"
                    className={sortKey === 'collectiveBurialInfo' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    合祀人数順
                  </Button>
                </div>
              </div>
              {/* 検索エリア */}
              <div className="flex items-center space-x-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="氏名、区画、許可番号で検索..."
                  className="flex-1"
                />
                <Button onClick={() => setSearchQuery('')} variant="outline" size="sm">
                  クリア
                </Button>
                <Button onClick={handleSearch} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  検索
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'name' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>氏名</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'name' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'name' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'plotSection' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('plotSection')}
                      >
                        <div className="flex items-center">
                          <span>区画</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'plotSection' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'plotSection' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'plotNumber' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('plotNumber')}
                      >
                        <div className="flex items-center">
                          <span>許可番号</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'plotNumber' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'plotNumber' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'contractYear' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('contractYear')}
                      >
                        <div className="flex items-center">
                          <span>契約年</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'contractYear' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'contractYear' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'burialDate' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('burialDate')}
                      >
                        <div className="flex items-center">
                          <span>納骨日</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'burialDate' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'burialDate' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                      <th
                        className={cn(
                          'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100',
                          sortKey === 'collectiveBurialInfo' && 'bg-gray-100'
                        )}
                        onClick={() => handleSort('collectiveBurialInfo')}
                      >
                        <div className="flex items-center">
                          <span>合祀</span>
                          <div className="ml-1 flex flex-col">
                            <span className={cn('text-xs', sortKey === 'collectiveBurialInfo' && sortOrder === 'asc' && 'text-blue-600')}>▲</span>
                            <span className={cn('text-xs -mt-1', sortKey === 'collectiveBurialInfo' && sortOrder === 'desc' && 'text-blue-600')}>▼</span>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedCustomers.length > 0 ? (
                      filteredAndSortedCustomers.map((customer, index) => {
                        const firstBurialDate = getFirstBurialDate(customer);
                        const contractYear = getContractYear(customer);
                        const buriedCount = customer.buriedPersons?.length || 0;
                        const maxCapacity = customer.plotInfo?.capacity || 4;

                        return (
                          <tr
                            key={customer.id}
                            className={cn(
                              'cursor-pointer hover:bg-gray-50',
                              selectedCustomer?.id === customer.id && 'bg-blue-50',
                              index % 2 === 1 && 'bg-gray-50'
                            )}
                            onClick={() => onCustomerSelect?.(customer)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                <div className="text-sm text-gray-500">{customer.nameKana}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.plotInfo?.section || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.plotInfo?.plotNumber || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contractYear}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {firstBurialDate ?
                                new Date(firstBurialDate).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'numeric',
                                  day: 'numeric',
                                }) :
                                '-'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                <span className={cn(
                                  'font-medium',
                                  buriedCount >= maxCapacity && 'text-red-600',
                                  buriedCount > 0 && buriedCount < maxCapacity && 'text-blue-600',
                                  buriedCount === 0 && 'text-gray-400'
                                )}>
                                  {buriedCount}/{maxCapacity}
                                </span>
                                {buriedCount > 0 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({customer.buriedPersons?.[0]?.name}
                                    {buriedCount > 1 && ` 他${buriedCount - 1}名`})
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchQuery.trim()
                            ? '検索条件に該当するデータが見つかりませんでした'
                            : 'データがありません'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
            このメニューは現在準備中です。
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-56 bg-white border-r border-gray-200 shadow-md">
        <div className="p-4 bg-blue-600 text-white">
          <h3 className="text-lg font-semibold">顧客管理台帳</h3>
        </div>
        <div className="p-2">
          {/* メインメニューに戻るボタン */}
          {onNavigateToMenu && (
            <Button
              onClick={onNavigateToMenu}
              className="w-full mb-3 btn-senior"
              variant="outline"
              size="lg"
            >
              ← メインメニューに戻る
            </Button>
          )}
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSelectedMenu(item);
                if (item !== '合祀申込') {
                  setLastSuccessMessage(null);
                }
              }}
              className={cn(
                'w-full text-left px-4 py-2 rounded-md mb-1 transition-colors',
                selectedMenu === item
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {renderMainContent()}
        {(selectedMenu === '台帳問い合わせ' || selectedMenu === '合祀一覧') && (
          <div className="text-right text-sm text-gray-600">
            全 {filteredAndSortedCustomers.length} 件
          </div>
        )}
      </div>

      {/* 合祀申込詳細モーダル */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
            <CollectiveBurialDetail
              application={selectedApplication}
              onClose={handleCloseDetail}
              onPrint={() => handlePrintApplication(selectedApplication)}
            />
          </div>
        </div>
      )}

      {/* 合祀申込書印刷モーダル */}
      {showPrintModal && printingApplication && (
        <div id="collective-burial-print-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-transparent print:relative print:inset-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto print:max-w-full print:shadow-none print:rounded-none">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center print:hidden">
              <h2 className="text-xl font-bold">合祀申込書プレビュー</h2>
              <div className="flex gap-2">
                <Button onClick={() => window.print()} variant="default">
                  印刷
                </Button>
                <Button onClick={handleClosePrintModal} variant="outline">
                  閉じる
                </Button>
              </div>
            </div>
            <CollectiveBurialPrintTemplate application={printingApplication} />
          </div>
        </div>
      )}
    </div>
  );
}
