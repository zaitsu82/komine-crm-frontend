'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollectiveBurialApplication } from '@/types/collective-burial';
import { formatDateWithEra } from '@/lib/utils';

interface CollectiveBurialDetailProps {
  application: CollectiveBurialApplication;
  onClose?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
}

const statusLabels = {
  pending: '申込受付',
  scheduled: '実施予定',
  completed: '実施完了',
  cancelled: 'キャンセル'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
};

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

export default function CollectiveBurialDetail({
  application,
  onClose,
  onEdit,
  onPrint
}: CollectiveBurialDetailProps) {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ヘッダー */}
      <div className="bg-yellow-100 border-b border-gray-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">合祀申込詳細</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[application.status]}`}>
              {statusLabels[application.status]}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {onPrint && (
              <Button onClick={onPrint} variant="outline" size="sm">
                申込書印刷
              </Button>
            )}
            {onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm">
                編集
              </Button>
            )}
            {onClose && (
              <Button onClick={onClose} variant="default" size="sm">
                閉じる
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="persons">故人情報</TabsTrigger>
            <TabsTrigger value="ceremony">法要情報</TabsTrigger>
            <TabsTrigger value="documents">書類</TabsTrigger>
            <TabsTrigger value="payment">支払情報</TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">申込情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">申込番号</Label>
                  <p className="font-semibold">{application.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">申込日</Label>
                  <p>{formatDateWithEra(application.applicationDate)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">希望実施日</Label>
                  <p>{application.desiredDate ? formatDateWithEra(application.desiredDate) : '未定'}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">合祀種別</Label>
                  <p>{burialTypeLabels[application.burialType]}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">主たる代表者</Label>
                  <p>{application.mainRepresentative}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">申込者情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">氏名</Label>
                  <p className="font-semibold">{application.applicant.name}</p>
                  {application.applicant.nameKana && (
                    <p className="text-sm text-gray-600">（{application.applicant.nameKana}）</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">電話番号</Label>
                  <p>{application.applicant.phone}</p>
                </div>
                {application.applicant.email && (
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-600">メールアドレス</Label>
                    <p>{application.applicant.email}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-sm text-gray-600">住所</Label>
                  {application.applicant.postalCode && (
                    <p className="text-sm">〒{application.applicant.postalCode}</p>
                  )}
                  <p>{application.applicant.address}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">区画情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">区域</Label>
                  <p>{application.plot.section}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">区画番号</Label>
                  <p className="font-semibold">{application.plot.number}</p>
                </div>
              </div>
            </div>

            {application.specialRequests && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 border-b pb-2">特別な要望・配慮事項</h3>
                <p className="whitespace-pre-line">{application.specialRequests}</p>
              </div>
            )}
          </TabsContent>

          {/* 故人情報タブ */}
          <TabsContent value="persons" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">故人一覧（{application.persons.length}名）</h3>
            </div>
            {application.persons.map((person, index) => (
              <div key={person.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">故人 {index + 1}</h4>
                  {person.gender && (
                    <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                      {person.gender === 'male' ? '男性' : '女性'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">氏名</Label>
                    <p className="font-semibold">{person.name}</p>
                    {person.nameKana && (
                      <p className="text-sm text-gray-600">（{person.nameKana}）</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">続柄</Label>
                    <p>{person.relationship}</p>
                  </div>
                  {person.deathDate && (
                    <div>
                      <Label className="text-sm text-gray-600">死亡日</Label>
                      <p>{formatDateWithEra(person.deathDate)}</p>
                    </div>
                  )}
                  {person.age !== null && (
                    <div>
                      <Label className="text-sm text-gray-600">享年</Label>
                      <p>{person.age}歳</p>
                    </div>
                  )}
                  {person.originalPlotNumber && (
                    <div>
                      <Label className="text-sm text-gray-600">元の区画番号</Label>
                      <p>{person.originalPlotNumber}</p>
                    </div>
                  )}
                  {person.certificateNumber && (
                    <div>
                      <Label className="text-sm text-gray-600">改葬許可証番号</Label>
                      <p>{person.certificateNumber}</p>
                    </div>
                  )}
                  {person.memo && (
                    <div className="col-span-2">
                      <Label className="text-sm text-gray-600">備考</Label>
                      <p className="text-sm">{person.memo}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 法要情報タブ */}
          <TabsContent value="ceremony" className="space-y-4">
            {application.ceremonies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                法要情報が登録されていません
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">法要一覧（{application.ceremonies.length}回）</h3>
                </div>
                {application.ceremonies.map((ceremony, index) => (
                  <div key={ceremony.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">法要 {index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {ceremony.date && (
                        <div>
                          <Label className="text-sm text-gray-600">実施日</Label>
                          <p>{formatDateWithEra(ceremony.date)}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm text-gray-600">導師・執行者</Label>
                        <p>{ceremony.officiant}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">宗派</Label>
                        <p>{ceremony.religion}</p>
                      </div>
                      {ceremony.participants !== null && (
                        <div>
                          <Label className="text-sm text-gray-600">参列者数</Label>
                          <p>{ceremony.participants}名</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <Label className="text-sm text-gray-600">実施場所</Label>
                        <p>{ceremony.location}</p>
                      </div>
                      {ceremony.memo && (
                        <div className="col-span-2">
                          <Label className="text-sm text-gray-600">備考</Label>
                          <p className="text-sm">{ceremony.memo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </TabsContent>

          {/* 書類タブ */}
          <TabsContent value="documents" className="space-y-4">
            {application.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                書類が登録されていません
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">書類一覧（{application.documents.length}件）</h3>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">書類種別</th>
                        <th className="text-left p-3 text-sm font-semibold">書類名</th>
                        <th className="text-left p-3 text-sm font-semibold">発行日</th>
                        <th className="text-left p-3 text-sm font-semibold">備考</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.documents.map((doc) => (
                        <tr key={doc.id} className="border-b last:border-b-0">
                          <td className="p-3">{documentTypeLabels[doc.type]}</td>
                          <td className="p-3 font-semibold">{doc.name}</td>
                          <td className="p-3">
                            {doc.issuedDate ? formatDateWithEra(doc.issuedDate) : '-'}
                          </td>
                          <td className="p-3 text-sm text-gray-600">{doc.memo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>

          {/* 支払情報タブ */}
          <TabsContent value="payment" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">支払情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">合祀料金総額</Label>
                  <p className="text-xl font-bold">
                    {application.payment.totalFee !== null
                      ? `¥${application.payment.totalFee.toLocaleString()}`
                      : '未設定'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">入金額</Label>
                  <p className="text-xl font-semibold text-green-600">
                    {application.payment.depositAmount !== null
                      ? `¥${application.payment.depositAmount.toLocaleString()}`
                      : '未入金'}
                  </p>
                </div>
                {application.payment.totalFee !== null && application.payment.depositAmount !== null && (
                  <div>
                    <Label className="text-sm text-gray-600">残金</Label>
                    <p className="text-xl font-semibold text-red-600">
                      ¥{(application.payment.totalFee - application.payment.depositAmount).toLocaleString()}
                    </p>
                  </div>
                )}
                {application.payment.paymentMethod && (
                  <div>
                    <Label className="text-sm text-gray-600">支払方法</Label>
                    <p>{application.payment.paymentMethod}</p>
                  </div>
                )}
                {application.payment.paymentDueDate && (
                  <div>
                    <Label className="text-sm text-gray-600">支払期限</Label>
                    <p>{formatDateWithEra(application.payment.paymentDueDate)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-600">登録日時</Label>
                  <p>{formatDateWithEra(application.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">最終更新日時</Label>
                  <p>{formatDateWithEra(application.updatedAt)}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
