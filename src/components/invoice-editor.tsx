'use client';

import { useState, useRef } from 'react';
import { Customer } from '@/types/customer';
import { formatDateWithEra } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportInvoiceToExcel } from '@/lib/excel-exporter';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceEditorProps {
  customer: Customer;
  onClose: () => void;
  onSave?: () => void;
}

export default function InvoiceEditor({ customer, onClose, onSave }: InvoiceEditorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // 請求書番号の生成
  const generateInvoiceNumber = () => {
    const now = new Date();
    return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${customer.customerCode}`;
  };

  // 初期の請求項目
  const getInitialItems = (): InvoiceItem[] => {
    const items: InvoiceItem[] = [];

    // 管理料から請求金額を取得
    if (customer.managementFee?.managementFee) {
      items.push({
        description: '墓地年間管理料',
        quantity: 1,
        unitPrice: customer.managementFee.managementFee,
        amount: customer.managementFee.managementFee
      });
    } else {
      items.push({
        description: '墓地年間管理料',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000
      });
    }

    return items;
  };

  // 編集可能な状態
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>(getInitialItems());
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 霊園情報（編集可能）
  const [cemeteryName, setCemeteryName] = useState('小峰霊園');
  const [cemeteryAddress, setCemeteryAddress] = useState('〒000-0000 東京都○○区○○ 1-2-3');
  const [cemeteryPhone, setCemeteryPhone] = useState('TEL: 03-0000-0000 / FAX: 03-0000-0001');
  const [bankInfo, setBankInfo] = useState('お振込先: ○○銀行 ○○支店 普通 1234567');

  // 計算
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  // 項目の更新
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'description') {
      newItems[index].description = value as string;
    } else {
      const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
      newItems[index][field] = numValue;
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
      }
    }
    setItems(newItems);
  };

  // 項目の追加
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  // 項目の削除
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // 印刷（新しいウィンドウで開いて印刷）
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('ポップアップがブロックされました。ポップアップを許可してください。');
      return;
    }

    const styles = `
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans CJK JP", sans-serif;
          font-size: 11px;
          line-height: 1.4;
          background: white;
        }
        .print-container {
          width: 100%;
          max-width: 190mm;
          padding: 5mm;
          background: white;
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 4px 8px; text-align: left; font-size: 10px; }
        th { background: #1f2937; color: white; font-size: 10px; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border-b-2 { border-bottom: 2px solid #1f2937; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .font-semibold { font-weight: 600; }
        .text-3xl { font-size: 20px; }
        .text-xl { font-size: 14px; }
        .text-lg { font-size: 12px; }
        .text-base { font-size: 11px; }
        .text-sm { font-size: 10px; }
        .text-xs { font-size: 9px; }
        .mb-8 { margin-bottom: 12px; }
        .mb-6 { margin-bottom: 10px; }
        .mb-4 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 6px; }
        .mb-2 { margin-bottom: 4px; }
        .mb-1 { margin-bottom: 2px; }
        .mt-4 { margin-top: 8px; }
        .mt-1 { margin-top: 2px; }
        .p-4 { padding: 8px; }
        .p-3 { padding: 6px; }
        .py-3 { padding-top: 6px; padding-bottom: 6px; }
        .py-2 { padding-top: 4px; padding-bottom: 4px; }
        .pt-4 { padding-top: 8px; }
        .pt-2 { padding-top: 4px; }
        .pb-2 { padding-bottom: 4px; }
        .rounded { border-radius: 4px; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .bg-blue-50 { background-color: #eff6ff; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-800 { color: #1f2937; }
        .border-gray-800 { border-color: #1f2937; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .space-y-1 > * + * { margin-top: 2px; }
        .tracking-widest { letter-spacing: 0.1em; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .justify-end { justify-content: flex-end; }
        .items-center { align-items: center; }
        .w-1\\/2 { width: 50%; }
        .w-1\\/3 { width: 33.333%; }
        .w-64 { width: 160px; }
        .w-16 { width: 40px; }
        .h-16 { height: 40px; }
        .h-0\\.5 { height: 2px; }
        .w-32 { width: 80px; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .inline-block { display: inline-block; }
        .border-2 { border-width: 2px; }
        .border-red-400 { border-color: #f87171; }
        .rounded-full { border-radius: 50%; }
        .text-red-400 { color: #f87171; }
        .whitespace-pre-line { white-space: pre-line; }
        .border-dotted { border-style: dotted; }
        .min-h-\\[40px\\] { min-height: 30px; }
        input, textarea { border: none; background: transparent; font-size: inherit; }
        
        /* 印鑑スペース */
        .stamp-space {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 2px solid #f87171;
          border-radius: 50%;
          color: #f87171;
          font-size: 9px;
          margin-top: 8px;
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>請求書 - ${customer.name}</title>
          ${styles}
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Excel出力
  const handleExcelExport = async () => {
    await exportInvoiceToExcel(customer);
    if (onSave) onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">請求書作成・編集</h2>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              {isEditing ? '✓ 編集完了' : '✏️ 編集モード'}
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              🖨️ 印刷
            </Button>
            <Button
              onClick={handleExcelExport}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              📊 Excel出力
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              ✕ 閉じる
            </Button>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          {/* 印刷用コンテンツ */}
          <div
            ref={printRef}
            className="bg-white mx-auto shadow-lg print:shadow-none"
            style={{ width: '210mm', padding: '10mm' }}
            id="invoice-print-content"
          >
            {/* 請求書タイトル */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold tracking-widest mb-1">請 求 書</h1>
              <div className="w-24 h-0.5 bg-gray-800 mx-auto"></div>
            </div>

            {/* 請求書番号・発行日 */}
            <div className="flex justify-between mb-3 text-sm">
              <div>
                <p className="text-xs text-gray-600">請求書番号</p>
                {isEditing ? (
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-44 h-7 text-sm print:border-none print:p-0"
                  />
                ) : (
                  <p className="font-semibold text-sm">{invoiceNumber}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">発行日</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-36 h-7 text-sm print:border-none print:p-0"
                  />
                ) : (
                  <p className="font-semibold text-sm">{formatDateWithEra(new Date(invoiceDate))}</p>
                )}
              </div>
            </div>

            {/* 2カラムレイアウト: 請求先と発行元 */}
            <div className="flex justify-between mb-4">
              {/* 請求先 */}
              <div className="w-1/2">
                <div className="border-b-2 border-gray-800 pb-1 mb-2">
                  <p className="text-base font-bold">{customer.name} 様</p>
                  {customer.nameKana && (
                    <p className="text-xs text-gray-600">（{customer.nameKana}）</p>
                  )}
                </div>
                <div className="text-xs space-y-0.5">
                  {customer.address && (
                    <p>〒{customer.postalCode || ''} {customer.address}</p>
                  )}
                  {customer.phoneNumber && <p>TEL: {customer.phoneNumber}</p>}
                  <p className="text-gray-600">墓石コード: {customer.customerCode}</p>
                  {customer.plotNumber && (
                    <p className="text-gray-600">許可番号: {customer.plotNumber}</p>
                  )}
                </div>
              </div>

              {/* 発行元 */}
              <div className="w-1/3 text-right">
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      value={cemeteryName}
                      onChange={(e) => setCemeteryName(e.target.value)}
                      className="text-right h-7 text-xs"
                      placeholder="霊園名"
                    />
                    <Input
                      value={cemeteryAddress}
                      onChange={(e) => setCemeteryAddress(e.target.value)}
                      className="text-right h-7 text-xs"
                      placeholder="住所"
                    />
                    <Input
                      value={cemeteryPhone}
                      onChange={(e) => setCemeteryPhone(e.target.value)}
                      className="text-right h-7 text-xs"
                      placeholder="電話番号"
                    />
                  </div>
                ) : (
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-sm">{cemeteryName}</p>
                    <p>{cemeteryAddress}</p>
                    <p>{cemeteryPhone}</p>
                  </div>
                )}
                {/* 印鑑スペース */}
                <div className="mt-2 inline-flex items-center justify-center border-2 border-red-400 rounded-full w-10 h-10">
                  <span className="text-red-400 text-xs">印</span>
                </div>
              </div>
            </div>

            {/* 合計金額（目立つ表示） */}
            <div className="bg-gray-100 p-3 rounded mb-4 flex justify-between items-center">
              <span className="text-sm font-bold">ご請求金額</span>
              <span className="text-xl font-bold">¥{total.toLocaleString()}</span>
            </div>

            {/* 請求明細テーブル */}
            <div className="mb-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="text-left p-2 font-semibold text-xs">項目</th>
                    <th className="text-center p-2 font-semibold w-16 text-xs">数量</th>
                    <th className="text-right p-2 font-semibold w-24 text-xs">単価</th>
                    <th className="text-right p-2 font-semibold w-24 text-xs">金額</th>
                    {isEditing && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-2 text-xs">
                        {isEditing ? (
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="h-7 text-xs"
                            placeholder="項目名"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="text-center p-2 text-xs">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="h-7 w-14 text-center text-xs"
                            min="1"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="text-right p-2 text-xs">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            className="h-7 w-20 text-right text-xs"
                            min="0"
                          />
                        ) : (
                          `¥${item.unitPrice.toLocaleString()}`
                        )}
                      </td>
                      <td className="text-right p-2 font-semibold text-xs">
                        ¥{item.amount.toLocaleString()}
                      </td>
                      {isEditing && (
                        <td className="p-2">
                          <Button
                            onClick={() => removeItem(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 print:hidden h-6 w-6 p-0"
                          >
                            ✕
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {isEditing && (
                <Button
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                  className="mt-1 print:hidden text-xs"
                >
                  + 項目を追加
                </Button>
              )}
            </div>

            {/* 合計欄 */}
            <div className="flex justify-end mb-4">
              <div className="w-48 text-sm">
                <div className="flex justify-between py-1 border-b text-xs">
                  <span>小計</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b text-xs">
                  <span>消費税（10%）</span>
                  <span>¥{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b-2 border-gray-800 font-bold text-sm">
                  <span>合計</span>
                  <span>¥{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 振込先情報 */}
            <div className="bg-blue-50 p-2 rounded mb-3">
              <h3 className="font-bold mb-1 text-xs">お振込先</h3>
              {isEditing ? (
                <Input
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  className="h-7 text-xs"
                  placeholder="振込先情報"
                />
              ) : (
                <p className="text-xs">{bankInfo}</p>
              )}
            </div>

            {/* 備考 */}
            <div className="mb-3">
              <h3 className="font-bold mb-1 text-xs">備考</h3>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded p-1 min-h-[40px] text-xs"
                  placeholder="備考を入力..."
                />
              ) : (
                <p className="text-xs text-gray-700 whitespace-pre-line min-h-[20px] border-b border-dotted">
                  {notes || '　'}
                </p>
              )}
            </div>

            {/* フッター */}
            <div className="text-center text-xs text-gray-600 pt-2 border-t">
              <p>本請求書に関するお問い合わせは下記までお願いいたします。</p>
              <p className="font-semibold">{cemeteryName} / {cemeteryPhone}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

