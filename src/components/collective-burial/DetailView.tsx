'use client';

/**
 * 合祀詳細表示コンポーネント（API連携版）
 * Prisma CollectiveBurialモデルに準拠
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CollectiveBurialDetail,
  BillingStatus,
  BILLING_STATUS_LABELS,
  BILLING_STATUS_COLORS,
  parseNotesData,
} from '@/lib/api';
import { useCollectiveBurialMutations } from '@/hooks/useCollectiveBurials';
import { formatDateWithEra } from '@/lib/utils';

interface CollectiveBurialDetailViewProps {
  data: CollectiveBurialDetail;
  onClose?: () => void;
  onEdit?: () => void;
  onRefresh?: () => void;
  onDelete?: () => void;
}

const burialTypeLabels = {
  family: '家族合祀',
  relative: '親族合祀',
  other: 'その他'
};

const documentTypeLabels = {
  permit: '改葬許可証',
  certificate: '証明書',
  agreement: '同意書',
  other: 'その他'
};

export default function CollectiveBurialDetailView({
  data,
  onClose,
  onEdit,
  onRefresh,
  onDelete,
}: CollectiveBurialDetailViewProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { updateBillingStatus, syncBurialCount, deleteCollectiveBurial } = useCollectiveBurialMutations();

  // notesからパースしたデータ
  const notesData = parseNotesData(data.notes);

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

  // 埋葬人数同期
  const handleSyncCount = async () => {
    setIsSyncing(true);
    try {
      const result = await syncBurialCount(data.id);
      if (result) {
        onRefresh?.();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteCollectiveBurial(data.id);
      if (success) {
        setShowDeleteConfirm(false);
        onDelete?.();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 上限到達率の計算
  const capacityPercentage = Math.round((data.currentBurialCount / data.burialCapacity) * 100);
  const isCapacityReached = data.currentBurialCount >= data.burialCapacity;

  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cha-50 to-kinari border-b border-cha-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-cha flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-mincho text-xl font-semibold text-sumi tracking-wide">合祀詳細</h2>
              <p className="text-sm text-hai mt-0.5">
                区画: {data.plotNumber} / {data.areaName}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${BILLING_STATUS_COLORS[data.billingStatus as BillingStatus]}`}>
              {BILLING_STATUS_LABELS[data.billingStatus as BillingStatus]}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {onEdit && (
              <Button onClick={onEdit} variant="secondary" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </Button>
            )}
            {onDelete && (
              <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                削除
              </Button>
            )}
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="capacity">埋葬状況</TabsTrigger>
            <TabsTrigger value="billing">請求管理</TabsTrigger>
            <TabsTrigger value="notes">備考・法要</TabsTrigger>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <Label className="text-sm text-hai">区画番号</Label>
                    <p className="font-semibold text-sumi mt-1">{data.plotNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">区域</Label>
                    <p className="text-sumi mt-1">{data.areaName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">契約日</Label>
                    <p className="text-sumi mt-1">{data.contractDate ? formatDateWithEra(new Date(data.contractDate)) : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">合祀種別</Label>
                    <p className="text-sumi mt-1">{notesData.burialType ? burialTypeLabels[notesData.burialType] : '-'}</p>
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
          </TabsContent>

          {/* 埋葬状況タブ */}
          <TabsContent value="capacity" className="space-y-6">
            {/* 埋葬状況サマリー */}
            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin flex items-center justify-between">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-ai rounded-full mr-3" />
                  埋葬状況
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncCount}
                  disabled={isSyncing}
                >
                  {isSyncing ? '同期中...' : '埋葬人数を再集計'}
                </Button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-hai mb-2">
                    <span>埋葬進捗</span>
                    <span>{data.currentBurialCount} / {data.burialCapacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${isCapacityReached ? 'bg-beni' : capacityPercentage >= 80 ? 'bg-kohaku' : 'bg-matsu'
                        }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* 日付情報 */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  {data.capacityReachedDate && (
                    <div className="p-3 bg-kinari rounded-lg">
                      <span className="text-hai">上限到達日:</span>
                      <span className="ml-2 font-semibold text-sumi">
                        {formatDateWithEra(new Date(data.capacityReachedDate))}
                      </span>
                    </div>
                  )}
                  {data.billingScheduledDate && (
                    <div className="p-3 bg-kinari rounded-lg">
                      <span className="text-hai">請求予定日:</span>
                      <span className="ml-2 font-semibold text-sumi">
                        {formatDateWithEra(new Date(data.billingScheduledDate))}
                      </span>
                    </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {data.buriedPersons.map((person) => (
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
                        </tr>
                      ))}
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

                {data.billingScheduledDate && (
                  <div className="mt-6">
                    <Label className="text-sm text-hai">請求予定日</Label>
                    <p className="text-lg font-semibold text-sumi mt-1">
                      {formatDateWithEra(new Date(data.billingScheduledDate))}
                    </p>
                  </div>
                )}
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

          {/* 備考・法要タブ */}
          <TabsContent value="notes" className="space-y-6">
            {/* 特別な要望 */}
            {notesData.specialRequests && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-kohaku rounded-full mr-3" />
                    特別な要望・配慮事項
                  </h3>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-line text-sumi">{notesData.specialRequests}</p>
                </div>
              </div>
            )}

            {/* 法要情報 */}
            {notesData.ceremonies && notesData.ceremonies.length > 0 && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-ai rounded-full mr-3" />
                    法要情報（{notesData.ceremonies.length}回）
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {notesData.ceremonies.map((ceremony, index) => (
                    <div key={index} className="p-4 bg-kinari rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {ceremony.date && (
                          <div>
                            <span className="text-hai">実施日:</span>
                            <span className="ml-2 text-sumi">{ceremony.date}</span>
                          </div>
                        )}
                        {ceremony.officiant && (
                          <div>
                            <span className="text-hai">導師:</span>
                            <span className="ml-2 text-sumi">{ceremony.officiant}</span>
                          </div>
                        )}
                        {ceremony.religion && (
                          <div>
                            <span className="text-hai">宗派:</span>
                            <span className="ml-2 text-sumi">{ceremony.religion}</span>
                          </div>
                        )}
                        {ceremony.participants && (
                          <div>
                            <span className="text-hai">参列者:</span>
                            <span className="ml-2 text-sumi">{ceremony.participants}名</span>
                          </div>
                        )}
                        {ceremony.location && (
                          <div className="col-span-2">
                            <span className="text-hai">場所:</span>
                            <span className="ml-2 text-sumi">{ceremony.location}</span>
                          </div>
                        )}
                        {ceremony.memo && (
                          <div className="col-span-2">
                            <span className="text-hai">備考:</span>
                            <span className="ml-2 text-sumi">{ceremony.memo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 書類情報 */}
            {notesData.documents && notesData.documents.length > 0 && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-cha rounded-full mr-3" />
                    関連書類（{notesData.documents.length}件）
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-kinari border-b border-gin">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">書類種別</th>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">書類名</th>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">発行日</th>
                        <th className="text-left p-4 text-sm font-semibold text-sumi">備考</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notesData.documents.map((doc, index) => (
                        <tr key={index} className="border-b border-gin last:border-b-0 hover:bg-kinari transition-colors">
                          <td className="p-4 text-sumi">{documentTypeLabels[doc.type]}</td>
                          <td className="p-4 font-semibold text-sumi">{doc.name}</td>
                          <td className="p-4 text-sumi">{doc.issuedDate || '-'}</td>
                          <td className="p-4 text-sm text-hai">{doc.memo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 自由記述備考 */}
            {notesData.freeText && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
                    備考
                  </h3>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-line text-sumi">{notesData.freeText}</p>
                </div>
              </div>
            )}

            {/* データがない場合 */}
            {!notesData.specialRequests && !notesData.ceremonies?.length && !notesData.documents?.length && !notesData.freeText && (
              <div className="text-center py-16 text-hai bg-kinari rounded-elegant-lg border border-gin">
                <svg className="w-12 h-12 mx-auto mb-4 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                備考・法要・書類情報は登録されていません
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-elegant-lg shadow-elegant-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 bg-beni-50 border-b border-beni-200">
              <h3 className="text-lg font-semibold text-beni-dark flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                削除の確認
              </h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sumi mb-2">
                以下の合祀記録を削除しますか？
              </p>
              <div className="bg-kinari p-4 rounded-lg border border-gin mb-4">
                <p className="font-semibold text-sumi">区画: {data.plotNumber}</p>
                <p className="text-sm text-hai mt-1">区域: {data.areaName}</p>
                {data.applicant && (
                  <p className="text-sm text-hai mt-1">契約者: {data.applicant.name}</p>
                )}
              </div>
              <p className="text-sm text-hai">
                ※ この操作は論理削除となります。データは完全には削除されません。
              </p>
            </div>
            <div className="px-6 py-4 bg-kinari border-t border-gin flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
