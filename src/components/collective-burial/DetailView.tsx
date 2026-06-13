'use client';

/**
 * 合祀詳細表示コンポーネント（参照特化版）
 * 請求ステータス変更 + 備考表示のみ
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LegacyAwareValue } from '@/components/legacy-aware-value';
import {
  CollectiveBurialDetail,
  BillingStatus,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
} from '@/lib/api';
import { useCollectiveBurialMutations } from '@/hooks/useCollectiveBurials';
import { formatDateWithEra } from '@/lib/format';
import {
  calculateElapsedYears,
  calculateScheduledCollectiveBurialDate,
  inferValidityPeriodYears,
  summarizeValidityRule,
} from '@/lib/collective-burial-rules';

interface CollectiveBurialDetailViewProps {
  data: CollectiveBurialDetail;
  onClose?: () => void;
  onRefresh?: () => void;
}

export default function CollectiveBurialDetailView({
  data,
  onClose,
  onRefresh,
}: CollectiveBurialDetailViewProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { updateBillingStatus } = useCollectiveBurialMutations();

  // 請求ステータス更新
  const handleStatusChange = async (newStatus: BillingStatus) => {
    if (data.billingStatus === newStatus) return;

    setIsUpdatingStatus(true);
    try {
      const success = await updateBillingStatus(data.id, { billingStatus: newStatus });
      if (success) {
        onRefresh?.();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 上限到達率の計算
  const capacityPercentage = Math.round((data.currentBurialCount / data.burialCapacity) * 100);
  const isCapacityReached = data.currentBurialCount >= data.burialCapacity;

  // 合祀予定日: DB 値優先、無ければ「上限到達日 or 最新埋葬日 + 有効年数」で自動計算
  const latestBurialDate = data.buriedPersons
    .map(bp => bp.burialDate)
    .filter((d): d is string => d !== null)
    .sort()
    .at(-1) || null;
  const scheduledBase = data.capacityReachedDate ?? latestBurialDate;
  const scheduledDateFallback = calculateScheduledCollectiveBurialDate(
    scheduledBase,
    data.validityPeriodYears,
  );
  const scheduledDate = data.billingScheduledDate
    ? new Date(data.billingScheduledDate)
    : scheduledDateFallback;
  const isFallbackScheduled = !data.billingScheduledDate && scheduledDateFallback !== null;

  // 業務ルール基準 (区域名 + 契約日 から対応表で推定)。
  // 根拠文言は対応表（VALIDITY_RULE_TABLE）から一元生成し、年数のハードコードを排除（#259）
  const inferredRule = inferValidityPeriodYears(data.areaName, data.contractDate);
  const ruleBasis = `${data.areaName}: ${summarizeValidityRule(data.areaName, data.contractDate)}`;
  // 推定値と異なる登録値は手動の例外指定（#259, Q17「決まった年数より短くて良い人も出る」）。
  // エラーではなく「手動指定」として情報表示する。
  const isManualOverride = data.validityPeriodYears !== inferredRule;

  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cha-50 to-kinari border-b border-cha-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-cha flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-mincho text-xl font-semibold text-sumi tracking-wide">合祀詳細</h2>
              <p className="text-sm text-hai mt-0.5">
                {/* displayNumber 優先・legacy-* 等は「整備中」ミュート表示 #283 */}
                区画: <LegacyAwareValue value={data.displayNumber || data.plotNumber} kind="plotNumber" /> / <LegacyAwareValue value={data.areaName} kind="areaName" />
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${BILLING_STATUS_COLORS[data.billingStatus as BillingStatus]}`}>
              {BILLING_STATUS_LABELS[data.billingStatus as BillingStatus]}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {/* 台帳詳細への遷移導線（#188）。Button は asChild 未対応のため buttonVariants を適用 */}
            <Link href={`/plots/${data.contractPlotId}`} className={buttonVariants({ variant: 'outline' })}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              台帳を見る
            </Link>
            {onClose && (
              <Button onClick={onClose} variant="default" size="default">
                閉じる
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="capacity">埋葬状況</TabsTrigger>
            <TabsTrigger value="billing">請求管理</TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-6">
            {/* 区画情報 */}
            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
                  区画情報
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div>
                    <Label className="text-sm text-hai">区画番号</Label>
                    {/* displayNumber 優先・legacy-* 等は「整備中」ミュート表示 #283 */}
                    <p className="font-semibold text-sumi mt-1">
                      <LegacyAwareValue value={data.displayNumber || data.plotNumber} kind="plotNumber" />
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">区域</Label>
                    {/* legacy-* エリア値は「整備中」ミュート表示 #307 */}
                    <p className="text-sumi mt-1">
                      <LegacyAwareValue value={data.areaName} kind="areaName" />
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">契約日</Label>
                    <p className="text-sumi mt-1">{data.contractDate ? formatDateWithEra(new Date(data.contractDate)) : '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 契約者情報 */}
            {data.applicant && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-cha rounded-full mr-3" />
                    契約者情報
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-hai">氏名</Label>
                      <p className="font-semibold text-sumi mt-1">{data.applicant.name}</p>
                      {data.applicant.nameKana && (
                        <p className="text-sm text-hai">（{data.applicant.nameKana}）</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-hai">電話番号</Label>
                      <p className="text-sumi mt-1">{data.applicant.phone}</p>
                    </div>
                    {data.applicant.email && (
                      <div>
                        <Label className="text-sm text-hai">メールアドレス</Label>
                        <p className="text-sumi mt-1">{data.applicant.email}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-hai">住所</Label>
                      <p className="text-sm text-hai mt-1">〒{data.applicant.postalCode}</p>
                      <p className="text-sumi">{data.applicant.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 備考 */}
            {data.notes && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
                    備考
                  </h3>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-line text-sumi">{data.notes}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 埋葬状況タブ */}
          <TabsContent value="capacity" className="space-y-6">
            {/* 埋葬状況サマリー */}
            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-ai rounded-full mr-3" />
                  埋葬状況
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className={`p-4 rounded-lg ${isCapacityReached ? 'bg-beni-50 border border-beni-200' : 'bg-matsu-50 border border-matsu-200'}`}>
                    <Label className="text-sm text-hai">現在の埋葬人数</Label>
                    <p className={`text-2xl font-bold mt-1 ${isCapacityReached ? 'text-beni-dark' : 'text-matsu-dark'}`}>
                      {data.currentBurialCount} 名
                    </p>
                  </div>
                  <div className="p-4 bg-ai-50 rounded-lg border border-ai-200">
                    <Label className="text-sm text-ai">埋葬上限</Label>
                    <p className="text-2xl font-bold text-ai-dark mt-1">{data.burialCapacity} 名</p>
                  </div>
                  <div className="p-4 bg-kinari rounded-lg border border-gin">
                    <Label className="text-sm text-hai">到達率</Label>
                    <p className="text-2xl font-bold text-sumi mt-1">{capacityPercentage}%</p>
                  </div>
                  <div className="p-4 bg-kinari rounded-lg border border-gin">
                    <Label className="text-sm text-hai">有効期間</Label>
                    <p className="text-2xl font-bold text-sumi mt-1">{data.validityPeriodYears} 年</p>
                    <p className="text-[11px] mt-1 leading-snug text-hai">
                      {isManualOverride
                        ? `手動指定（自動判定: ${inferredRule}年）`
                        : '自動判定どおり'}
                    </p>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-hai mb-2">
                    <span>埋葬進捗</span>
                    <span>{data.currentBurialCount} / {data.burialCapacity}</span>
                  </div>
                  <div className="w-full bg-gin rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${isCapacityReached ? 'bg-beni' : capacityPercentage >= 80 ? 'bg-kohaku' : 'bg-matsu'
                        }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* 日付情報 */}
                {data.capacityReachedDate && (
                  <div className="mt-6 text-sm">
                    <div className="p-3 bg-kinari rounded-lg inline-block">
                      <span className="text-hai">上限到達日:</span>
                      <span className="ml-2 font-semibold text-sumi">
                        {formatDateWithEra(new Date(data.capacityReachedDate))}
                      </span>
                    </div>
                  </div>
                )}

                {/* 合祀予定日（自動計算ルール） */}
                <div className="mt-6 p-4 bg-kinari rounded-lg border border-gin">
                  <Label className="text-sm text-hai mb-2 block">合祀予定日（自動計算）</Label>
                  {scheduledDate ? (
                    <p className="text-lg font-semibold text-sumi">
                      {formatDateWithEra(scheduledDate)}
                      {isFallbackScheduled && (
                        <span className="ml-2 text-xs text-hai font-normal">
                          ※ 請求予定日未設定のため埋葬日 + 有効年数で自動算出
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-hai">埋葬日が未設定のため算出できません</p>
                  )}
                  <p className="text-xs text-hai mt-2">自動判定: {ruleBasis}</p>
                  {isManualOverride && (
                    <p className="text-xs text-kohaku-dark mt-1">
                      この区画は手動指定 {data.validityPeriodYears} 年 / 自動判定 {inferredRule} 年 です。業務上の例外指定（短縮など）の場合はそのままで問題ありません。
                      ※ お墓のタイプ別の年数（24年等）は業務確認中で、確定後に自動判定へ反映予定です。
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 埋葬者一覧 */}
            {data.buriedPersons && data.buriedPersons.length > 0 && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-cha rounded-full mr-3" />
                    埋葬者一覧（{data.buriedPersons.length}名）
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-kinari border-b border-gin">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">氏名</th>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">続柄</th>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">死亡日</th>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">埋葬日</th>
                        <th className="text-center p-4 text-sm font-semibold text-sumi">経過年数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.buriedPersons.map((person) => {
                        // 経過年数: 命日 優先、無ければ埋葬日から
                        const elapsedYears = calculateElapsedYears(person.deathDate ?? person.burialDate);
                        return (
                          <tr key={person.id} className="border-b border-gin last:border-b-0 hover:bg-kinari transition-colors">
                            <td className="p-4">
                              <p className="font-semibold text-sumi">{person.name}</p>
                              {person.nameKana && <p className="text-sm text-hai">（{person.nameKana}）</p>}
                            </td>
                            <td className="p-4 text-sumi">{person.relationship || '-'}</td>
                            <td className="p-4 text-sumi">
                              {person.deathDate ? formatDateWithEra(new Date(person.deathDate)) : '-'}
                            </td>
                            <td className="p-4 text-sumi">
                              {person.burialDate ? formatDateWithEra(new Date(person.burialDate)) : '-'}
                            </td>
                            <td className="p-4 text-center text-sumi">
                              {elapsedYears !== null ? `${elapsedYears}年` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 請求管理タブ */}
          <TabsContent value="billing" className="space-y-6">
            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
                  請求情報
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-matsu-50 rounded-elegant border border-matsu-100">
                    <Label className="text-sm text-matsu">請求金額</Label>
                    <p className="text-2xl font-bold text-matsu-dark mt-2">
                      {data.billingAmount != null
                        ? `¥${data.billingAmount.toLocaleString()}`
                        : '未設定'}
                    </p>
                  </div>
                  <div className="p-4 bg-ai-50 rounded-elegant border border-ai-100">
                    <Label className="text-sm text-ai">請求ステータス</Label>
                    <p className={`text-2xl font-bold mt-2 ${data.billingStatus === 'paid' ? 'text-matsu-dark' :
                      data.billingStatus === 'billed' ? 'text-ai-dark' :
                        'text-kohaku-dark'
                      }`}>
                      {BILLING_STATUS_LABELS[data.billingStatus as BillingStatus]}
                    </p>
                  </div>
                </div>

                {/* ステータス変更ボタン */}
                <div className="mt-6 p-4 bg-kinari rounded-lg">
                  <Label className="text-sm text-hai mb-3 block">請求ステータスを変更</Label>
                  <div className="flex space-x-3">
                    <Button
                      variant={data.billingStatus === 'pending' ? 'cha' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('pending')}
                      disabled={isUpdatingStatus}
                    >
                      請求前
                    </Button>
                    <Button
                      variant={data.billingStatus === 'billed' ? 'cha' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('billed')}
                      disabled={isUpdatingStatus}
                    >
                      請求済
                    </Button>
                    <Button
                      variant={data.billingStatus === 'paid' ? 'cha' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('paid')}
                      disabled={isUpdatingStatus}
                    >
                      支払済
                    </Button>
                  </div>
                </div>

                {data.billingScheduledDate ? (
                  <div className="mt-6">
                    <Label className="text-sm text-hai">請求予定日</Label>
                    <p className="text-lg font-semibold text-sumi mt-1">
                      {formatDateWithEra(new Date(data.billingScheduledDate))}
                    </p>
                  </div>
                ) : scheduledDateFallback ? (
                  <div className="mt-6">
                    <Label className="text-sm text-hai">請求予定日（自動計算）</Label>
                    <p className="text-lg font-semibold text-sumi mt-1">
                      {formatDateWithEra(scheduledDateFallback)}
                      <span className="ml-2 text-xs text-hai font-normal">
                        ※ 埋葬日 + 有効年数 ({data.validityPeriodYears} 年) で算出
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="bg-kinari border border-gin rounded-elegant-lg p-5">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <Label className="text-xs text-hai">登録日時</Label>
                  <p className="text-sumi mt-1">{formatDateWithEra(new Date(data.createdAt))}</p>
                </div>
                <div>
                  <Label className="text-xs text-hai">最終更新日時</Label>
                  <p className="text-sumi mt-1">{formatDateWithEra(new Date(data.updatedAt))}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
