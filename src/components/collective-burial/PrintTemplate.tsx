'use client';

import { CollectiveBurialApplication } from '@/types/collective-burial';
import { formatDateWithEra } from '@/lib/utils';

interface CollectiveBurialPrintTemplateProps {
  application: CollectiveBurialApplication;
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

export default function CollectiveBurialPrintTemplate({ application }: CollectiveBurialPrintTemplateProps) {
  return (
    <div className="bg-white p-4" id="collective-burial-print-content">
      {/* タイトル */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-1">合祀申込書</h1>
        <p className="text-xs text-gray-600">COLLECTIVE BURIAL APPLICATION FORM</p>
      </div>

      {/* 申込番号・日付 */}
      <div className="flex justify-between mb-4 text-sm border-b pb-2">
        <div>
          <span className="text-gray-600">申込番号：</span>
          <span className="font-semibold">{application.id}</span>
        </div>
        <div>
          <span className="text-gray-600">申込日：</span>
          <span className="font-semibold">{formatDateWithEra(application.applicationDate)}</span>
        </div>
      </div>

      {/* 申込情報 */}
      <div className="mb-4">
        <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">申込情報</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 w-1/4 font-semibold">合祀種別</td>
              <td className="py-1.5 px-2">{burialTypeLabels[application.burialType]}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 font-semibold">希望実施日</td>
              <td className="py-1.5 px-2">
                {application.desiredDate ? formatDateWithEra(application.desiredDate) : '未定'}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 font-semibold">主たる代表者</td>
              <td className="py-1.5 px-2">{application.mainRepresentative}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 申込者情報 */}
      <div className="mb-4">
        <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">申込者情報</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 w-1/4 font-semibold">氏名</td>
              <td className="py-1.5 px-2">
                {application.applicant.name}
                {application.applicant.nameKana && (
                  <span className="ml-2 text-gray-600">（{application.applicant.nameKana}）</span>
                )}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 font-semibold">電話番号</td>
              <td className="py-1.5 px-2">{application.applicant.phone}</td>
            </tr>
            {application.applicant.email && (
              <tr className="border-b">
                <td className="py-1.5 px-2 bg-gray-50 font-semibold">メール</td>
                <td className="py-1.5 px-2">{application.applicant.email}</td>
              </tr>
            )}
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 font-semibold">住所</td>
              <td className="py-1.5 px-2">
                {application.applicant.postalCode && `〒${application.applicant.postalCode} `}
                {application.applicant.address}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 区画情報 */}
      <div className="mb-4">
        <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">区画情報</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 w-1/4 font-semibold">区域</td>
              <td className="py-1.5 px-2">{application.plot.section}</td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 font-semibold">許可番号</td>
              <td className="py-1.5 px-2 font-semibold">{application.plot.number}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 故人情報 */}
      <div className="mb-4">
        <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">
          故人情報（{application.persons.length}名）
        </h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-1.5 text-left border">No.</th>
              <th className="p-1.5 text-left border">氏名（カナ）</th>
              <th className="p-1.5 text-left border">続柄</th>
              <th className="p-1.5 text-left border">死亡日</th>
              <th className="p-1.5 text-left border">享年</th>
              <th className="p-1.5 text-left border">性別</th>
              <th className="p-1.5 text-left border">元の区画</th>
            </tr>
          </thead>
          <tbody>
            {application.persons.map((person, index) => (
              <tr key={person.id} className="border-b">
                <td className="p-1.5 border text-center">{index + 1}</td>
                <td className="p-1.5 border">
                  {person.name}
                  {person.nameKana && (
                    <div className="text-gray-600">（{person.nameKana}）</div>
                  )}
                </td>
                <td className="p-1.5 border">{person.relationship}</td>
                <td className="p-1.5 border">
                  {person.deathDate ? formatDateWithEra(person.deathDate) : '-'}
                </td>
                <td className="p-1.5 border text-center">
                  {person.age !== null ? `${person.age}歳` : '-'}
                </td>
                <td className="p-1.5 border text-center">
                  {person.gender === 'male' ? '男' : person.gender === 'female' ? '女' : '-'}
                </td>
                <td className="p-1.5 border">{person.originalPlotNumber || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 法要情報 */}
      {application.ceremonies.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">
            法要情報（{application.ceremonies.length}回）
          </h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-1.5 text-left border">実施日</th>
                <th className="p-1.5 text-left border">導師・執行者</th>
                <th className="p-1.5 text-left border">宗派</th>
                <th className="p-1.5 text-left border">参列者数</th>
                <th className="p-1.5 text-left border">実施場所</th>
              </tr>
            </thead>
            <tbody>
              {application.ceremonies.map((ceremony) => (
                <tr key={ceremony.id} className="border-b">
                  <td className="p-1.5 border">
                    {ceremony.date ? formatDateWithEra(ceremony.date) : '-'}
                  </td>
                  <td className="p-1.5 border">{ceremony.officiant}</td>
                  <td className="p-1.5 border">{ceremony.religion}</td>
                  <td className="p-1.5 border text-center">
                    {ceremony.participants !== null ? `${ceremony.participants}名` : '-'}
                  </td>
                  <td className="p-1.5 border">{ceremony.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 書類情報 */}
      {application.documents.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">
            提出書類（{application.documents.length}件）
          </h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-1.5 text-left border">書類種別</th>
                <th className="p-1.5 text-left border">書類名</th>
                <th className="p-1.5 text-left border">発行日</th>
                <th className="p-1.5 text-left border">備考</th>
              </tr>
            </thead>
            <tbody>
              {application.documents.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="p-1.5 border">{documentTypeLabels[doc.type]}</td>
                  <td className="p-1.5 border">{doc.name}</td>
                  <td className="p-1.5 border">
                    {doc.issuedDate ? formatDateWithEra(doc.issuedDate) : '-'}
                  </td>
                  <td className="p-1.5 border text-xs">{doc.memo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 支払情報 */}
      <div className="mb-4">
        <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">支払情報</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 w-1/4 font-semibold">合祀料金総額</td>
              <td className="py-1.5 px-2 font-bold">
                {application.payment.totalFee != null
                  ? `¥${application.payment.totalFee.toLocaleString()}`
                  : '未設定'}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-1.5 px-2 bg-gray-50 font-semibold">入金額</td>
              <td className="py-1.5 px-2">
                {application.payment.depositAmount != null
                  ? `¥${application.payment.depositAmount.toLocaleString()}`
                  : '未入金'}
              </td>
            </tr>
            {application.payment.totalFee != null && application.payment.depositAmount != null && (
              <tr className="border-b">
                <td className="py-1.5 px-2 bg-gray-50 font-semibold">残金</td>
                <td className="py-1.5 px-2 font-bold text-red-600">
                  ¥{(application.payment.totalFee - application.payment.depositAmount).toLocaleString()}
                </td>
              </tr>
            )}
            {application.payment.paymentMethod && (
              <tr className="border-b">
                <td className="py-1.5 px-2 bg-gray-50 font-semibold">支払方法</td>
                <td className="py-1.5 px-2">{application.payment.paymentMethod}</td>
              </tr>
            )}
            {application.payment.paymentDueDate && (
              <tr className="border-b">
                <td className="py-1.5 px-2 bg-gray-50 font-semibold">支払期限</td>
                <td className="py-1.5 px-2">{formatDateWithEra(application.payment.paymentDueDate)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 特別な要望 */}
      {application.specialRequests && (
        <div className="mb-4">
          <h2 className="font-bold text-base mb-2 bg-gray-100 p-2 border-l-4 border-gray-600">
            特別な要望・配慮事項
          </h2>
          <div className="border p-2 text-sm whitespace-pre-line">{application.specialRequests}</div>
        </div>
      )}

      {/* フッター */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-600">
        <div className="text-center">
          <p className="font-semibold text-gray-800 mb-0.5">小峰霊園</p>
          <p>〒000-0000 東京都○○区○○ 1-2-3</p>
          <p>TEL: 03-0000-0000 / FAX: 03-0000-0001</p>
        </div>
      </div>

      {/* 印刷用スタイル */}
      <style jsx>{`
        @media print {
          #collective-burial-print-content {
            padding: 8mm;
            font-size: 10pt;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
