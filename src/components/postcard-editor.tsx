'use client';

import { useState, useRef } from 'react';
import { Customer } from '@/types/customer';
import { formatDateWithEra } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportPostcardToExcel } from '@/lib/excel-exporter';

interface PostcardEditorProps {
  customer: Customer;
  onClose: () => void;
  onSave?: () => void;
}

type PostcardType = 'ceremony_notice' | 'memorial_service' | 'custom';

const POSTCARD_TEMPLATES = {
  ceremony_notice: {
    title: '合祀法要のご案内',
    greeting: '拝啓\n\n時下ますますご清祥のこととお慶び申し上げます。',
    body: 'さて、この度、故 {buriedPerson} 様の合祀法要を執り行いますので、ご案内申し上げます。\n\nご多忙中とは存じますが、何卒ご参列賜りますようお願い申し上げます。',
    closing: '敬具'
  },
  memorial_service: {
    title: '年忌法要のご案内',
    greeting: '拝啓\n\n時下ますますご清祥のこととお慶び申し上げます。',
    body: 'さて、この度、故 {buriedPerson} 様の年忌法要を執り行いますので、ご案内申し上げます。\n\nご多忙中とは存じますが、何卒ご参列賜りますようお願い申し上げます。',
    closing: '敬具'
  },
  custom: {
    title: '',
    greeting: '',
    body: '',
    closing: ''
  }
};

export default function PostcardEditor({ customer, onClose, onSave }: PostcardEditorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const [postcardType, setPostcardType] = useState<PostcardType>('ceremony_notice');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSide, setCurrentSide] = useState<'address' | 'content'>('address');

  // 宛名面の編集状態
  const [recipientName, setRecipientName] = useState(customer.name);
  const [recipientPostalCode, setRecipientPostalCode] = useState(customer.postalCode || '');
  const [recipientAddress, setRecipientAddress] = useState(customer.address || '');

  // 差出人情報
  const [senderName, setSenderName] = useState('小峰霊園 管理事務所');
  const [senderPostalCode, setSenderPostalCode] = useState('XXX-XXXX');
  const [senderAddress, setSenderAddress] = useState('〇〇県〇〇市〇〇町1-2-3');
  const [senderPhone, setSenderPhone] = useState('TEL: 03-XXXX-XXXX');

  // 文面の編集状態
  const getBuriedPersonName = () => customer.buriedPersons?.[0]?.name || '〇〇';

  const getTemplateContent = (type: PostcardType) => {
    const template = POSTCARD_TEMPLATES[type];
    return {
      ...template,
      body: template.body.replace('{buriedPerson}', getBuriedPersonName())
    };
  };

  const [title, setTitle] = useState(getTemplateContent('ceremony_notice').title);
  const [greeting, setGreeting] = useState(getTemplateContent('ceremony_notice').greeting);
  const [body, setBody] = useState(getTemplateContent('ceremony_notice').body);
  const [closing, setClosing] = useState(getTemplateContent('ceremony_notice').closing);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventPlace, setEventPlace] = useState('小峰霊園 本堂');

  // テンプレート変更時
  const handleTemplateChange = (type: PostcardType) => {
    setPostcardType(type);
    const template = getTemplateContent(type);
    setTitle(template.title);
    setGreeting(template.greeting);
    setBody(template.body);
    setClosing(template.closing);
  };

  // 印刷（新しいウィンドウで開いて印刷）
  const handlePrint = () => {
    const addressContent = document.getElementById('postcard-address-content');
    const contentContent = document.getElementById('postcard-content-content');

    if (!addressContent || !contentContent) return;

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) {
      alert('ポップアップがブロックされました。ポップアップを許可してください。');
      return;
    }

    const styles = `
      <style>
        @page {
          size: 100mm 148mm;
          margin: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans CJK JP", sans-serif;
          margin: 0;
          padding: 0;
          background: white;
        }
        .postcard-page {
          width: 100mm;
          height: 148mm;
          padding: 8mm;
          box-sizing: border-box;
          background: white;
          page-break-after: always;
        }
        .postcard-page:last-child {
          page-break-after: auto;
        }
        .border-2 { border: 2px solid #d1d5db; }
        .border-red-400 { border-color: #f87171; }
        .border-gray-400 { border-color: #9ca3af; }
        .border-gray-300 { border-color: #d1d5db; }
        .p-4 { padding: 1rem; }
        .h-full { height: 100%; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-xl { font-size: 1.25rem; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: bold; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-12 { margin-top: 3rem; }
        .pt-2 { padding-top: 0.5rem; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .leading-relaxed { line-height: 1.625; }
        .tracking-wider { letter-spacing: 0.05em; }
        .whitespace-pre-line { white-space: pre-line; }
        .bg-gray-50 { background-color: #f9fafb; }
        .rounded { border-radius: 0.25rem; }
        .gap-1 { gap: 0.25rem; }
        .postal-box {
          display: flex;
          gap: 0.25rem;
          position: absolute;
          top: 0.5rem;
          right: 1rem;
        }
        .postal-digit {
          width: 1.25rem;
          height: 1.75rem;
          border: 1px solid #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-family: monospace;
        }
        .postal-digit.red { border-color: #f87171; }
        input, textarea { border: none; background: transparent; }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>はがき - ${customer.name}</title>
          ${styles}
        </head>
        <body>
          <div class="postcard-page">
            ${addressContent.innerHTML}
          </div>
          <div class="postcard-page">
            ${contentContent.innerHTML}
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
    await exportPostcardToExcel(customer);
    if (onSave) onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">はがき作成・編集</h2>
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

        {/* サイド切り替え＆テンプレート選択 */}
        <div className="bg-gray-100 px-6 py-3 flex items-center justify-between border-b print:hidden">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">表示面:</span>
            <div className="flex rounded-lg overflow-hidden border">
              <button
                onClick={() => setCurrentSide('address')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${currentSide === 'address'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                📮 宛名面
              </button>
              <button
                onClick={() => setCurrentSide('content')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${currentSide === 'content'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                📝 文面
              </button>
            </div>
          </div>

          {currentSide === 'content' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">テンプレート:</span>
              <select
                value={postcardType}
                onChange={(e) => handleTemplateChange(e.target.value as PostcardType)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="ceremony_notice">合祀法要のご案内</option>
                <option value="memorial_service">年忌法要のご案内</option>
                <option value="custom">カスタム（自由入力）</option>
              </select>
            </div>
          )}
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-auto p-6 bg-gray-200">
          <div className="flex justify-center gap-8">
            {/* 宛名面 */}
            <div
              ref={printRef}
              className={`bg-white shadow-lg ${currentSide !== 'address' ? 'hidden print:block' : ''}`}
              style={{ width: '100mm', height: '148mm', padding: '8mm' }}
              id="postcard-address-content"
            >
              <div className="h-full flex flex-col justify-between border-2 border-gray-300 p-4 relative">
                {/* 郵便番号枠（上部） */}
                <div className="absolute top-2 right-4 flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-7 border ${i < 3 ? 'border-red-400' : 'border-gray-400'} flex items-center justify-center text-sm font-mono`}
                    >
                      {recipientPostalCode.replace('-', '')[i] || ''}
                    </div>
                  ))}
                </div>

                {/* 宛先 */}
                <div className="mt-12 flex-1">
                  {/* 住所（縦書き風） */}
                  <div className="mb-4">
                    {isEditing ? (
                      <textarea
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="w-full h-20 border rounded p-2 text-sm"
                        placeholder="住所"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {recipientAddress}
                      </p>
                    )}
                  </div>

                  {/* 宛名 */}
                  <div className="text-center">
                    {isEditing ? (
                      <Input
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="text-center text-xl font-bold"
                        placeholder="宛名"
                      />
                    ) : (
                      <p className="text-xl font-bold">{recipientName} 様</p>
                    )}
                  </div>
                </div>

                {/* 差出人 */}
                <div className="text-right text-xs space-y-0.5">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        value={senderPostalCode}
                        onChange={(e) => setSenderPostalCode(e.target.value)}
                        className="text-right h-6 text-xs"
                        placeholder="郵便番号"
                      />
                      <Input
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        className="text-right h-6 text-xs"
                        placeholder="住所"
                      />
                      <Input
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="text-right h-6 text-xs font-bold"
                        placeholder="差出人名"
                      />
                      <Input
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="text-right h-6 text-xs"
                        placeholder="電話番号"
                      />
                    </div>
                  ) : (
                    <>
                      <p>〒{senderPostalCode}</p>
                      <p>{senderAddress}</p>
                      <p className="font-bold text-sm">{senderName}</p>
                      <p>{senderPhone}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 文面 */}
            <div
              className={`bg-white shadow-lg ${currentSide !== 'content' ? 'hidden print:block' : ''}`}
              style={{ width: '100mm', height: '148mm', padding: '8mm' }}
              id="postcard-content-content"
            >
              <div className="h-full flex flex-col border-2 border-gray-300 p-4">
                {/* タイトル */}
                <div className="text-center mb-4">
                  {isEditing ? (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-center text-lg font-bold"
                      placeholder="タイトル"
                    />
                  ) : (
                    <h1 className="text-lg font-bold tracking-wider">{title}</h1>
                  )}
                </div>

                {/* 本文 */}
                <div className="flex-1 text-sm leading-relaxed">
                  {isEditing ? (
                    <div className="space-y-3 h-full">
                      <textarea
                        value={greeting}
                        onChange={(e) => setGreeting(e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                        rows={3}
                        placeholder="挨拶文"
                      />
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full border rounded p-2 text-sm flex-1"
                        rows={5}
                        placeholder="本文"
                      />

                      {/* 日時・場所 */}
                      <div className="space-y-2 bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-12">日時:</span>
                          <Input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="h-7 text-xs flex-1"
                          />
                          <Input
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                            className="h-7 text-xs w-24"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs w-12">場所:</span>
                          <Input
                            value={eventPlace}
                            onChange={(e) => setEventPlace(e.target.value)}
                            className="h-7 text-xs flex-1"
                            placeholder="場所"
                          />
                        </div>
                      </div>

                      <Input
                        value={closing}
                        onChange={(e) => setClosing(e.target.value)}
                        className="w-20 text-sm"
                        placeholder="結び"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="whitespace-pre-line">{greeting}</p>
                      <p className="whitespace-pre-line">{body}</p>

                      {/* 日時・場所（入力されている場合のみ表示） */}
                      {(eventDate || eventPlace) && (
                        <div className="bg-gray-50 p-3 rounded mt-4">
                          <p className="font-bold text-center mb-2">記</p>
                          {eventDate && (
                            <p>日時: {formatDateWithEra(new Date(eventDate))} {eventTime && `${eventTime}〜`}</p>
                          )}
                          {eventPlace && <p>場所: {eventPlace}</p>}
                        </div>
                      )}

                      <p className="text-right mt-4">{closing}</p>
                    </div>
                  )}
                </div>

                {/* 発行日・発行元 */}
                <div className="text-right text-xs mt-4 pt-2 border-t">
                  <p>{formatDateWithEra(new Date())}</p>
                  <p className="font-bold">{senderName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 印刷ヒント */}
        <div className="bg-yellow-50 px-6 py-3 text-sm text-yellow-800">
          💡 ヒント: 印刷ボタンを押すと、印刷用の新しいウィンドウが開きます。用紙サイズを「はがき (100×148mm)」に設定してください。
        </div>
      </div>
    </div>
  );
}

