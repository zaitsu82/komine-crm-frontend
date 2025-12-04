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

const statusStyles = {
  pending: 'bg-kohaku-50 text-kohaku-dark border-kohaku-200',
  scheduled: 'bg-ai-50 text-ai-dark border-ai-200',
  completed: 'bg-matsu-50 text-matsu-dark border-matsu-200',
  cancelled: 'bg-kinari text-hai border-gin'
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
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cha-50 to-kinari border-b border-cha-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-cha flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-mincho text-xl font-semibold text-sumi tracking-wide">合祀申込詳細</h2>
              <p className="text-sm text-hai mt-0.5">申込番号: {application.id}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${statusStyles[application.status]}`}>
              {statusLabels[application.status]}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {onPrint && (
              <Button onClick={onPrint} variant="outline" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                申込書印刷
              </Button>
            )}
            {onEdit && (
              <Button onClick={onEdit} variant="secondary" size="default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="persons">故人情報</TabsTrigger>
            <TabsTrigger value="ceremony">法要情報</TabsTrigger>
            <TabsTrigger value="documents">書類</TabsTrigger>
            <TabsTrigger value="payment">支払情報</TabsTrigger>
          </TabsList>

          {/* 基本情報タブ */}
          <TabsContent value="basic" className="space-y-6">
            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
                  申込情報
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-hai">申込番号</Label>
                    <p className="font-semibold text-sumi mt-1">{application.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">申込日</Label>
                    <p className="text-sumi mt-1">{formatDateWithEra(application.applicationDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">希望実施日</Label>
                    <p className="text-sumi mt-1">{application.desiredDate ? formatDateWithEra(application.desiredDate) : '未定'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">合祀種別</Label>
                    <p className="text-sumi mt-1">{burialTypeLabels[application.burialType]}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">主たる代表者</Label>
                    <p className="text-sumi mt-1">{application.mainRepresentative}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-cha rounded-full mr-3" />
                  申込者情報
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-hai">氏名</Label>
                    <p className="font-semibold text-sumi mt-1">{application.applicant.name}</p>
                    {application.applicant.nameKana && (
                      <p className="text-sm text-hai">（{application.applicant.nameKana}）</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-hai">電話番号</Label>
                    <p className="text-sumi mt-1">{application.applicant.phone}</p>
                  </div>
                  {application.applicant.email && (
                    <div className="col-span-2">
                      <Label className="text-sm text-hai">メールアドレス</Label>
                      <p className="text-sumi mt-1">{application.applicant.email}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label className="text-sm text-hai">住所</Label>
                    {application.applicant.postalCode && (
                      <p className="text-sm text-hai mt-1">〒{application.applicant.postalCode}</p>
                    )}
                    <p className="text-sumi">{application.applicant.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-ai rounded-full mr-3" />
                  区画情報
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm text-hai">区域</Label>
                    <p className="text-sumi mt-1">{application.plot.section}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-hai">許可番号</Label>
                    <p className="font-semibold text-sumi mt-1">{application.plot.number}</p>
                  </div>
                </div>
              </div>
            </div>

            {application.specialRequests && (
              <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin">
                  <h3 className="font-semibold text-sumi flex items-center">
                    <span className="w-1 h-5 bg-kohaku rounded-full mr-3" />
                    特別な要望・配慮事項
                  </h3>
                </div>
                <div className="p-5">
                  <p className="whitespace-pre-line text-sumi">{application.specialRequests}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 故人情報タブ */}
          <TabsContent value="persons" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-sumi">故人一覧（{application.persons.length}名）</h3>
            </div>
            {application.persons.map((person, index) => (
              <div key={person.id} className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                <div className="px-5 py-4 bg-kinari border-b border-gin flex items-center justify-between">
                  <h4 className="font-semibold text-sumi">故人 {index + 1}</h4>
                  {person.gender && (
                    <span className="text-sm px-3 py-1 bg-white border border-gin rounded-full text-hai">
                      {person.gender === 'male' ? '男性' : '女性'}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-hai">氏名</Label>
                      <p className="font-semibold text-sumi mt-1">{person.name}</p>
                      {person.nameKana && (
                        <p className="text-sm text-hai">（{person.nameKana}）</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm text-hai">続柄</Label>
                      <p className="text-sumi mt-1">{person.relationship}</p>
                    </div>
                    {person.deathDate && (
                      <div>
                        <Label className="text-sm text-hai">死亡日</Label>
                        <p className="text-sumi mt-1">{formatDateWithEra(person.deathDate)}</p>
                      </div>
                    )}
                    {person.age !== null && (
                      <div>
                        <Label className="text-sm text-hai">享年</Label>
                        <p className="text-sumi mt-1">{person.age}歳</p>
                      </div>
                    )}
                    {person.originalPlotNumber && (
                      <div>
                        <Label className="text-sm text-hai">元の区画番号</Label>
                        <p className="text-sumi mt-1">{person.originalPlotNumber}</p>
                      </div>
                    )}
                    {person.certificateNumber && (
                      <div>
                        <Label className="text-sm text-hai">改葬許可証番号</Label>
                        <p className="text-sumi mt-1">{person.certificateNumber}</p>
                      </div>
                    )}
                    {person.memo && (
                      <div className="col-span-2">
                        <Label className="text-sm text-hai">備考</Label>
                        <p className="text-sm text-sumi mt-1">{person.memo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 法要情報タブ */}
          <TabsContent value="ceremony" className="space-y-4">
            {application.ceremonies.length === 0 ? (
              <div className="text-center py-16 text-hai bg-kinari rounded-elegant-lg border border-gin">
                <svg className="w-12 h-12 mx-auto mb-4 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                法要情報が登録されていません
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-sumi">法要一覧（{application.ceremonies.length}回）</h3>
                </div>
                {application.ceremonies.map((ceremony, index) => (
                  <div key={ceremony.id} className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
                    <div className="px-5 py-4 bg-kinari border-b border-gin">
                      <h4 className="font-semibold text-sumi">法要 {index + 1}</h4>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-6">
                        {ceremony.date && (
                          <div>
                            <Label className="text-sm text-hai">実施日</Label>
                            <p className="text-sumi mt-1">{formatDateWithEra(ceremony.date)}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-sm text-hai">導師・執行者</Label>
                          <p className="text-sumi mt-1">{ceremony.officiant}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-hai">宗派</Label>
                          <p className="text-sumi mt-1">{ceremony.religion}</p>
                        </div>
                        {ceremony.participants !== null && (
                          <div>
                            <Label className="text-sm text-hai">参列者数</Label>
                            <p className="text-sumi mt-1">{ceremony.participants}名</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <Label className="text-sm text-hai">実施場所</Label>
                          <p className="text-sumi mt-1">{ceremony.location}</p>
                        </div>
                        {ceremony.memo && (
                          <div className="col-span-2">
                            <Label className="text-sm text-hai">備考</Label>
                            <p className="text-sm text-sumi mt-1">{ceremony.memo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </TabsContent>

          {/* 書類タブ */}
          <TabsContent value="documents" className="space-y-4">
            {application.documents.length === 0 ? (
              <div className="text-center py-16 text-hai bg-kinari rounded-elegant-lg border border-gin">
                <svg className="w-12 h-12 mx-auto mb-4 text-gin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                書類が登録されていません
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-sumi">書類一覧（{application.documents.length}件）</h3>
                </div>
                <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
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
                      {application.documents.map((doc) => (
                        <tr key={doc.id} className="border-b border-gin last:border-b-0 hover:bg-kinari transition-colors">
                          <td className="p-4 text-sumi">{documentTypeLabels[doc.type]}</td>
                          <td className="p-4 font-semibold text-sumi">{doc.name}</td>
                          <td className="p-4 text-sumi">
                            {doc.issuedDate ? formatDateWithEra(doc.issuedDate) : '-'}
                          </td>
                          <td className="p-4 text-sm text-hai">{doc.memo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>

          {/* 支払情報タブ */}
          <TabsContent value="payment" className="space-y-6">
            <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm overflow-hidden">
              <div className="px-5 py-4 bg-kinari border-b border-gin">
                <h3 className="font-semibold text-sumi flex items-center">
                  <span className="w-1 h-5 bg-matsu rounded-full mr-3" />
                  支払情報
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-matsu-50 rounded-elegant border border-matsu-100">
                    <Label className="text-sm text-matsu">合祀料金総額</Label>
                    <p className="text-2xl font-bold text-matsu-dark mt-2">
                      {application.payment.totalFee != null
                        ? `¥${application.payment.totalFee.toLocaleString()}`
                        : '未設定'}
                    </p>
                  </div>
                  <div className="p-4 bg-ai-50 rounded-elegant border border-ai-100">
                    <Label className="text-sm text-ai">入金額</Label>
                    <p className="text-2xl font-semibold text-ai-dark mt-2">
                      {application.payment.depositAmount != null
                        ? `¥${application.payment.depositAmount.toLocaleString()}`
                        : '未入金'}
                    </p>
                  </div>
                  {application.payment.totalFee != null && application.payment.depositAmount != null && (
                    <div className="p-4 bg-beni-50 rounded-elegant border border-beni-100">
                      <Label className="text-sm text-beni">残金</Label>
                      <p className="text-2xl font-semibold text-beni-dark mt-2">
                        ¥{(application.payment.totalFee - application.payment.depositAmount).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {application.payment.paymentMethod && (
                    <div>
                      <Label className="text-sm text-hai">支払方法</Label>
                      <p className="text-sumi mt-1">{application.payment.paymentMethod}</p>
                    </div>
                  )}
                  {application.payment.paymentDueDate && (
                    <div>
                      <Label className="text-sm text-hai">支払期限</Label>
                      <p className="text-sumi mt-1">{formatDateWithEra(application.payment.paymentDueDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-kinari border border-gin rounded-elegant-lg p-5">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <Label className="text-xs text-hai">登録日時</Label>
                  <p className="text-sumi mt-1">{formatDateWithEra(application.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-hai">最終更新日時</Label>
                  <p className="text-sumi mt-1">{formatDateWithEra(application.updatedAt)}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
