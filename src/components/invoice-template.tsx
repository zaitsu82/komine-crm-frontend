'use client';

import { Customer } from '@/types/customer';
import { formatDateWithEra } from '@/lib/utils';

interface InvoiceTemplateProps {
  customer: Customer;
  invoiceDate?: Date;
  invoiceNumber?: string;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  notes?: string;
}

export default function InvoiceTemplate({
  customer,
  invoiceDate = new Date(),
  invoiceNumber = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  items = [],
  notes = ''
}: InvoiceTemplateProps) {
  // 管理料から請求金額を取得
  const managementFeeAmount = customer.managementFee?.managementFee
    ? (typeof customer.managementFee.managementFee === 'number'
        ? customer.managementFee.managementFee
        : parseInt(String(customer.managementFee.managementFee).replace(/[^0-9]/g, '')))
    : 50000;

  // デフォルトの請求項目（顧客の契約情報から自動生成）
  const defaultItems = items.length > 0 ? items : [
    {
      description: '墓地年間管理料',
      quantity: 1,
      unitPrice: managementFeeAmount,
      amount: managementFeeAmount
    }
  ];

  const subtotal = defaultItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div className="bg-white" id="invoice-content">
      {/* 請求書タイトル */}
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold mb-0.5">請求書</h1>
        <p className="text-xs text-gray-600">INVOICE</p>
      </div>

      {/* 請求書番号・発行日 */}
      <div className="flex justify-between mb-3 text-sm">
        <div>
          <p className="text-xs text-gray-600">請求書番号</p>
          <p className="font-semibold">{invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">発行日</p>
          <p className="font-semibold">{formatDateWithEra(invoiceDate)}</p>
        </div>
      </div>

      {/* お客様情報 */}
      <div className="mb-3 p-2 bg-gray-50 rounded border text-sm">
        <p className="text-xs text-gray-600 mb-0.5">請求先</p>
        <div className="space-y-0.5">
          <p className="font-semibold">
            {customer.name || '未設定'} 様
          </p>
          {customer.nameKana && (
            <p className="text-xs text-gray-600">
              （{customer.nameKana}）
            </p>
          )}
          {customer.address && (
            <p className="text-xs">
              〒{customer.postalCode || ''}<br />
              {customer.address}
            </p>
          )}
          {customer.phoneNumber && (
            <p className="text-xs">
              TEL: {customer.phoneNumber}
            </p>
          )}
          <p className="text-xs text-gray-600">
            墓石コード: {customer.customerCode}
          </p>
          {customer.plotNumber && (
            <p className="text-xs text-gray-600">
              許可番号: {customer.plotNumber}
            </p>
          )}
        </div>
      </div>

      {/* 請求明細 */}
      <div className="mb-3">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left p-1.5 font-semibold text-xs">項目</th>
              <th className="text-center p-1.5 font-semibold w-12 text-xs">数量</th>
              <th className="text-right p-1.5 font-semibold w-20 text-xs">単価</th>
              <th className="text-right p-1.5 font-semibold w-20 text-xs">金額</th>
            </tr>
          </thead>
          <tbody>
            {defaultItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-1.5 text-xs">{item.description}</td>
                <td className="text-center p-1.5 text-xs">{item.quantity}</td>
                <td className="text-right p-1.5 text-xs">¥{item.unitPrice.toLocaleString()}</td>
                <td className="text-right p-1.5 text-xs">¥{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 合計金額 */}
      <div className="flex justify-end mb-3">
        <div className="w-48 text-sm">
          <div className="flex justify-between py-1 border-b text-xs">
            <span>小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b text-xs">
            <span>消費税（10%）</span>
            <span>¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b-2 border-gray-800 font-bold text-sm">
            <span>合計</span>
            <span>¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 備考 */}
      {notes && (
        <div className="mb-3">
          <h3 className="font-semibold mb-0.5 text-xs">備考</h3>
          <p className="text-xs text-gray-700 whitespace-pre-line">{notes}</p>
        </div>
      )}

      {/* フッター情報 */}
      <div className="mt-4 pt-2 border-t border-gray-300 text-xs text-gray-600">
        <div className="text-center">
          <p className="font-semibold text-gray-800 mb-0.5">小峰霊園</p>
          <p>〒000-0000 東京都○○区○○ 1-2-3</p>
          <p>TEL: 03-0000-0000 / FAX: 03-0000-0001</p>
          <p className="mt-0.5">お振込先: ○○銀行 ○○支店 普通 1234567</p>
        </div>
      </div>

      {/* 印刷用のスタイル */}
      <style jsx>{`
        @media print {
          #invoice-content {
            padding: 10mm;
            max-width: 100%;
            height: auto;
            font-size: 11pt;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          * {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
