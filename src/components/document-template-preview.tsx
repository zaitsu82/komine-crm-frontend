'use client';

import { Plus, Trash2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DOCUMENT_TEXT_STYLE_PRESETS,
  type DocumentTextStylePresetId,
} from './document-text-style-presets';
import './document-preview-templates.css';

function DocumentTextStyleToolbar({
  value,
  onChange,
}: {
  value: DocumentTextStylePresetId;
  onChange: (id: DocumentTextStylePresetId) => void;
}) {
  const current =
    DOCUMENT_TEXT_STYLE_PRESETS.find((p) => p.id === value) ??
    DOCUMENT_TEXT_STYLE_PRESETS[0];

  return (
    <div className="rounded-xl border-2 border-matsu-500/35 bg-gradient-to-br from-matsu-50/90 to-white p-4 shadow-sm ring-1 ring-matsu-500/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-matsu-600 text-white shrink-0">
          <Type className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-sumi-900 leading-tight">
            テキストの種
          </h4>
          <p className="text-[11px] text-sumi-500 leading-snug mt-0.5">
            プレビューとPDFの書体・サイズバランスが変わります
          </p>
        </div>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="テキストの種"
      >
        {DOCUMENT_TEXT_STYLE_PRESETS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={value === p.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-9 min-h-9 px-3 text-xs font-medium rounded-lg transition-all',
              value === p.id &&
                'bg-matsu-600 hover:bg-matsu-700 shadow-sm ring-2 ring-matsu-600/30'
            )}
            onClick={() => onChange(p.id)}
            aria-pressed={value === p.id}
            aria-label={p.label}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <p className="text-[11px] text-sumi-600 mt-3 leading-relaxed border-t border-sumi-100 pt-3">
        {current.description}
      </p>
    </div>
  );
}

export interface InvoicePreviewItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

function formatYen(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

interface InvoiceLivePreviewProps {
  templateData: Record<string, string>;
  onTemplateDataChange: (key: string, value: string) => void;
  textStylePreset: DocumentTextStylePresetId;
  onTextStyleChange: (id: DocumentTextStylePresetId) => void;
  invoiceItems: InvoicePreviewItem[];
  onItemChange: (
    index: number,
    field: keyof InvoicePreviewItem,
    value: string
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * 請求書PDFテンプレートに近いレイアウトで、その場編集できるプレビュー
 */
export function InvoiceLivePreview({
  templateData,
  onTemplateDataChange,
  textStylePreset,
  onTextStyleChange,
  invoiceItems,
  onItemChange,
  onAddItem,
  onRemoveItem,
  subtotal,
  tax,
  total,
}: InvoiceLivePreviewProps) {
  const issueDate =
    templateData.invoiceDate || templateData.issueDate || '';

  return (
    <div className="space-y-4">
      <DocumentTextStyleToolbar
        value={textStylePreset}
        onChange={onTextStyleChange}
      />
      <div
        className={cn(
          'komine-invoice-preview rounded border border-sumi-200 shadow-sm overflow-hidden',
          textStylePreset !== 'default' && `doc-preset-${textStylePreset}`
        )}
      >
      <div className="invoice-container">
        <div className="header">
          <h1>請 求 書</h1>
        </div>

        <div className="invoice-info">
          <div className="customer-info">
            <div className="customer-name-row">
              <input
                type="text"
                className="preview-input flex-1 min-w-0 bg-transparent"
                value={templateData.customerName || ''}
                onChange={(e) =>
                  onTemplateDataChange('customerName', e.target.value)
                }
                placeholder="顧客名"
                aria-label="顧客名（プレビュー）"
              />
              <span className="suffix">様</span>
            </div>
            <div className="customer-address">
              <textarea
                className="preview-textarea"
                value={templateData.customerAddress || ''}
                onChange={(e) =>
                  onTemplateDataChange('customerAddress', e.target.value)
                }
                placeholder="住所"
                rows={3}
                aria-label="顧客住所（プレビュー）"
              />
            </div>
          </div>
          <div className="invoice-meta">
            <table>
              <tbody>
                <tr>
                  <td className="label">請求書番号:</td>
                  <td>
                    <input
                      type="text"
                      className="preview-input preview-meta-input"
                      value={templateData.invoiceNumber || ''}
                      onChange={(e) =>
                        onTemplateDataChange('invoiceNumber', e.target.value)
                      }
                      aria-label="請求書番号（プレビュー）"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">発行日:</td>
                  <td>
                    <input
                      type="date"
                      className="preview-input preview-meta-input"
                      value={issueDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        onTemplateDataChange('issueDate', v);
                        onTemplateDataChange('invoiceDate', v);
                      }}
                      aria-label="発行日（プレビュー）"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="label">お支払期限:</td>
                  <td>
                    <input
                      type="date"
                      className="preview-input preview-meta-input"
                      value={templateData.dueDate || ''}
                      onChange={(e) =>
                        onTemplateDataChange('dueDate', e.target.value)
                      }
                      aria-label="お支払期限（プレビュー）"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="total-box">
          <div className="total-label">ご請求金額（税込）</div>
          <div className="total-amount">{total}</div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>品目・内容</th>
              <th style={{ width: '15%' }} className="text-center">
                数量
              </th>
              <th style={{ width: '17.5%' }} className="text-right">
                単価
              </th>
              <th style={{ width: '12.5%' }} className="text-right">
                金額
              </th>
              <th style={{ width: '5%' }} />
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    className="preview-input-table"
                    value={item.description}
                    onChange={(e) =>
                      onItemChange(i, 'description', e.target.value)
                    }
                    aria-label={`明細${i + 1} 品目`}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    min={0}
                    className="preview-input-table text-center"
                    value={item.quantity}
                    onChange={(e) =>
                      onItemChange(i, 'quantity', e.target.value)
                    }
                    aria-label={`明細${i + 1} 数量`}
                  />
                </td>
                <td className="text-right">
                  <input
                    type="number"
                    min={0}
                    className="preview-input-table text-right"
                    value={item.unitPrice}
                    onChange={(e) =>
                      onItemChange(i, 'unitPrice', e.target.value)
                    }
                    aria-label={`明細${i + 1} 単価`}
                  />
                </td>
                <td className="text-right">
                  {formatYen(parseFloat(item.amount) || 0)}
                </td>
                <td className="text-center p-0">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(i)}
                    disabled={invoiceItems.length <= 1}
                    className="p-1 text-sumi-400 hover:text-beni-600 disabled:opacity-30"
                    aria-label={`明細${i + 1}を削除`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onAddItem}
          >
            <Plus className="mr-1 h-3 w-3" />
            行を追加
          </Button>
        </div>

        <table className="summary-table">
          <tbody>
            <tr>
              <td className="label">小計</td>
              <td className="text-right">{formatYen(subtotal)}</td>
            </tr>
            <tr>
              <td className="label">消費税</td>
              <td className="text-right">{formatYen(tax)}</td>
            </tr>
            <tr className="total-row">
              <td className="label">合計</td>
              <td className="text-right">{formatYen(total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="notes">
          <div className="notes-title">備考</div>
          <textarea
            className="preview-textarea min-h-[4rem]"
            value={templateData.notes || ''}
            onChange={(e) => onTemplateDataChange('notes', e.target.value)}
            placeholder="請求書に印字される備考"
            rows={4}
            aria-label="備考（PDFに出力）"
          />
        </div>

        <div className="company-info">
          <div className="company-name">小峰霊園管理事務所</div>
          <div>〒XXX-XXXX</div>
          <div>○○県○○市○○町X-X-X</div>
          <div>TEL: XXX-XXX-XXXX</div>
          <div>FAX: XXX-XXX-XXXX</div>
          <div className="stamp-area" />
        </div>
      </div>
    </div>
    </div>
  );
}

interface PostcardLivePreviewProps {
  templateData: Record<string, string>;
  onTemplateDataChange: (key: string, value: string) => void;
  textStylePreset: DocumentTextStylePresetId;
  onTextStyleChange: (id: DocumentTextStylePresetId) => void;
}

/**
 * はがきPDF（宛先面）テンプレートに近いレイアウトで、その場編集できるプレビュー
 */
export function PostcardLivePreview({
  templateData,
  onTemplateDataChange,
  textStylePreset,
  onTextStyleChange,
}: PostcardLivePreviewProps) {
  return (
    <div className="space-y-4">
      <DocumentTextStyleToolbar
        value={textStylePreset}
        onChange={onTextStyleChange}
      />
      <div
        className={cn(
          'komine-postcard-preview rounded border border-sumi-200 shadow-sm overflow-auto flex justify-center bg-sumi-100 p-4',
          textStylePreset !== 'default' && `doc-preset-${textStylePreset}`
        )}
      >
      <div className="postcard-container address-side bg-white shadow">
        <div className="postal-code-area">
          <div className="postal-code">
            <span className="prefix">〒</span>
            <input
              type="text"
              className="preview-input border-0 flex-1 min-w-0 text-right font-bold tracking-wider"
              style={{ fontSize: '16px', letterSpacing: '0.25em' }}
              value={templateData.recipientPostalCode || ''}
              onChange={(e) =>
                onTemplateDataChange('recipientPostalCode', e.target.value)
              }
              placeholder="123-4567"
              aria-label="宛先郵便番号（プレビュー）"
            />
          </div>
        </div>

        <div className="recipient-area">
          <div className="recipient-address">
            <textarea
              className="preview-textarea text-[11px] leading-relaxed"
              value={templateData.recipientAddress || ''}
              onChange={(e) =>
                onTemplateDataChange('recipientAddress', e.target.value)
              }
              placeholder="住所"
              rows={4}
              aria-label="宛先住所（プレビュー）"
            />
          </div>
          <div className="recipient-name-row">
            <input
              type="text"
              className="preview-input text-center font-bold flex-1 min-w-0 max-w-[85%]"
              style={{ fontSize: '18px' }}
              value={templateData.recipientName || ''}
              onChange={(e) =>
                onTemplateDataChange('recipientName', e.target.value)
              }
              placeholder="宛名"
              aria-label="宛名（プレビュー）"
            />
            <span className="suffix">様</span>
          </div>
        </div>

        <div className="sender-area">
          <div className="sender-postal-code">
            <span>〒</span>
            <input
              type="text"
              className="preview-input inline-block w-auto min-w-[6rem] flex-1 text-[10px]"
              value={templateData.senderPostalCode || ''}
              onChange={(e) =>
                onTemplateDataChange('senderPostalCode', e.target.value)
              }
              placeholder="差出人郵便番号"
              aria-label="差出人郵便番号（プレビュー）"
            />
          </div>
          <div className="sender-address">
            <textarea
              className="preview-textarea text-[9px] leading-snug min-h-[2.5rem]"
              value={templateData.senderAddress || ''}
              onChange={(e) =>
                onTemplateDataChange('senderAddress', e.target.value)
              }
              placeholder="差出人住所"
              rows={2}
              aria-label="差出人住所（プレビュー）"
            />
          </div>
          <div className="sender-name">
            <input
              type="text"
              className="preview-input font-bold text-[11px]"
              value={templateData.senderName || ''}
              onChange={(e) =>
                onTemplateDataChange('senderName', e.target.value)
              }
              placeholder="差出人名"
              aria-label="差出人名（プレビュー）"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
