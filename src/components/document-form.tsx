'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDocumentDetail,
  useDocumentMutations,
  DocumentDetail,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
} from '@/hooks/useDocuments';
import { downloadPdfFromBase64 } from '@/lib/api/documents';
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  RefreshCw,
  X,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TemplateId } from './document-template-gallery';
import {
  InvoiceLivePreview,
  PostcardLivePreview,
} from './document-template-preview';
import {
  normalizeTextStylePreset,
  type DocumentTextStylePresetId,
} from './document-text-style-presets';
import { PlotDetailResponse, ContractRole } from '@komine/types';

type DocumentType = 'invoice' | 'postcard' | 'contract' | 'permit' | 'other';
type DocumentStatus = 'draft' | 'generated' | 'sent' | 'archived';

interface InvoiceItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

interface DocumentFormProps {
  documentId?: string;
  customerId?: string;
  templateId?: TemplateId;
  /** 区画詳細データ（自動挿入用） */
  plotDetail?: PlotDetailResponse;
  onBack: () => void;
  onSaved: (doc: DocumentDetail) => void;
}

/**
 * 区画詳細から契約者（applicant or contractor）を取得
 */
function getPrimaryCustomer(plotDetail: PlotDetailResponse) {
  const contractor = plotDetail.roles.find(
    (r) => r.role === ContractRole.Contractor
  );
  const applicant = plotDetail.roles.find(
    (r) => r.role === ContractRole.Applicant
  );
  return contractor?.customer || applicant?.customer || plotDetail.roles[0]?.customer || null;
}

/**
 * 区画詳細からテンプレートデータを自動生成
 */
function buildAutoFillData(
  plotDetail: PlotDetailResponse,
  templateType: TemplateId
): { templateData: Record<string, string>; invoiceItems: InvoiceItem[] } {
  const customer = getPrimaryCustomer(plotDetail);
  const plot = plotDetail.physicalPlot;
  const customerName = customer?.name || '';
  const customerAddress = [
    customer?.postalCode ? `〒${customer.postalCode}` : '',
    customer?.address || '',
    customer?.addressLine2 || '',
  ]
    .filter(Boolean)
    .join(' ');
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const base: Record<string, string> = {};
  let items: InvoiceItem[] = [];

  switch (templateType) {
    case 'invoice': {
      base.invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      base.issueDate = today;
      base.invoiceDate = today;
      base.dueDate = dueDate;
      base.customerName = customerName;
      base.customerAddress = customerAddress;

      items = [];
      if (plotDetail.managementFee?.managementFee) {
        const fee = parseFloat(plotDetail.managementFee.managementFee) || 0;
        items.push({
          description: `管理費（${plot.areaName} ${plot.plotNumber}）`,
          quantity: '1',
          unitPrice: String(fee),
          amount: String(fee),
        });
      }
      if (plotDetail.usageFee?.usageFee) {
        const fee = parseFloat(plotDetail.usageFee.usageFee) || 0;
        items.push({
          description: `使用料（${plot.areaName} ${plot.plotNumber}）`,
          quantity: '1',
          unitPrice: String(fee),
          amount: String(fee),
        });
      }
      if (plotDetail.uncollectedAmount > 0) {
        items.push({
          description: '未収金',
          quantity: '1',
          unitPrice: String(plotDetail.uncollectedAmount),
          amount: String(plotDetail.uncollectedAmount),
        });
      }
      if (items.length === 0) {
        items.push({ description: '', quantity: '1', unitPrice: '', amount: '0' });
      }
      break;
    }
    case 'postcard': {
      base.recipientPostalCode = customer?.postalCode || '';
      base.recipientAddress = customer?.address || '';
      base.recipientName = customerName;
      base.senderPostalCode = '';
      base.senderAddress = '';
      base.senderName = '小峰霊園管理事務所';
      base.message = '';
      break;
    }
    case 'contract': {
      base.contractNumber = `CON-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      base.contractDate = plotDetail.contractDate || today;
      base.contractorName = customerName;
      base.plotNumber = `${plot.areaName} ${plot.plotNumber}`;
      base.terms = '';
      break;
    }
    case 'permit': {
      base.permitNumber = plotDetail.permitNumber || '';
      base.permitDate = plotDetail.permitDate || today;
      base.applicantName = customerName;
      base.permitType = '改葬許可';
      base.permitContent = '';
      break;
    }
    default:
      break;
  }

  return { templateData: base, invoiceItems: items };
}

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  invoice: '請求書',
  postcard: 'はがき',
  contract: '契約書',
  permit: '許可証',
  other: 'その他',
};

function calcAmount(qty: string, price: string): string {
  const q = parseFloat(qty) || 0;
  const p = parseFloat(price) || 0;
  return String(Math.round(q * p));
}

export function DocumentForm({
  documentId,
  customerId: initialCustomerId,
  templateId,
  plotDetail,
  onBack,
  onSaved,
}: DocumentFormProps) {
  const isEditMode = !!documentId;
  const { data: existingData, isLoading: isLoadingDetail } = useDocumentDetail(
    documentId || null
  );
  const {
    create,
    update,
    upload: uploadFile,
    generate,
    isLoading: isMutating,
    error: mutationError,
  } = useDocumentMutations();

  const [formData, setFormData] = useState<{
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    description: string;
    notes: string;
    contractPlotId: string;
    customerId: string;
    templateType: string;
  }>({
    name: '',
    type: (templateId as DocumentType) || 'invoice',
    status: 'draft',
    description: '',
    notes: '',
    contractPlotId: '',
    customerId: initialCustomerId || '',
    templateType:
      templateId === 'invoice' || templateId === 'postcard'
        ? templateId
        : '',
  });

  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: '', quantity: '1', unitPrice: '', amount: '0' },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [freeText, setFreeText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingData) {
      setFormData({
        name: existingData.name,
        type: existingData.type,
        status: existingData.status,
        description: existingData.description || '',
        notes: existingData.notes || '',
        contractPlotId: existingData.contractPlotId || '',
        customerId: existingData.customerId || '',
        templateType: existingData.templateType || '',
      });
      if (existingData.templateData) {
        const data: Record<string, string> = {};
        Object.entries(existingData.templateData).forEach(([key, value]) => {
          if (key === 'items') return;
          if (key === 'freeText') {
            setFreeText(String(value));
            return;
          }
          data[key] = typeof value === 'string' ? value : JSON.stringify(value);
        });
        setTemplateData(data);

        const items = existingData.templateData.items;
        if (Array.isArray(items) && items.length > 0) {
          setInvoiceItems(
            items.map((it: Record<string, unknown>) => ({
              description: String(it.description || ''),
              quantity: String(it.quantity || '1'),
              unitPrice: String(it.unitPrice || ''),
              amount: String(it.amount || '0'),
            }))
          );
        }
      }
    }
  }, [existingData]);

  // テンプレート選択時 + 区画詳細からの自動挿入
  useEffect(() => {
    if (!templateId || isEditMode) return;

    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const customerName = plotDetail
      ? getPrimaryCustomer(plotDetail)?.name || ''
      : '';
    const plotNumber = plotDetail
      ? `${plotDetail.physicalPlot.areaName} ${plotDetail.physicalPlot.plotNumber}`
      : '';
    const nameSuffix = customerName
      ? `_${customerName}_${plotNumber}`
      : '';

    setFormData((prev) => ({
      ...prev,
      name: `${TEMPLATE_LABELS[templateId]}${nameSuffix}_${today}`,
      type: templateId as DocumentType,
      templateType:
        templateId === 'invoice' || templateId === 'postcard'
          ? templateId
          : '',
      contractPlotId: plotDetail?.id || prev.contractPlotId,
    }));

    // 区画詳細がある場合はテンプレートデータを自動挿入
    if (plotDetail) {
      const autoFill = buildAutoFillData(plotDetail, templateId);
      setTemplateData(autoFill.templateData);
      setInvoiceItems(autoFill.invoiceItems);
    }
  }, [templateId, isEditMode, plotDetail]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateDataChange = (key: string, value: string) => {
    setTemplateData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTextStyleChange = (id: DocumentTextStylePresetId) => {
    handleTemplateDataChange('textStylePreset', id);
  };

  const textStylePreset = normalizeTextStylePreset(
    templateData.textStylePreset
  );

  // --- Invoice items ---
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    setInvoiceItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        next[index].amount = calcAmount(
          field === 'quantity' ? value : next[index].quantity,
          field === 'unitPrice' ? value : next[index].unitPrice
        );
      }
      return next;
    });
  };

  const addItem = () => {
    setInvoiceItems((prev) => [
      ...prev,
      { description: '', quantity: '1', unitPrice: '', amount: '0' },
    ]);
  };

  const removeItem = (index: number) => {
    if (invoiceItems.length <= 1) return;
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const taxRate = 0.1;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('ファイルサイズは10MB以下にしてください');
        return;
      }
      setSelectedFile(file);
    }
  };

  const buildTemplateDataPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = { ...templateData };
    if (formData.templateType === 'invoice') {
      payload.items = invoiceItems.map((it) => ({
        description: it.description,
        quantity: parseFloat(it.quantity) || 0,
        unitPrice: parseFloat(it.unitPrice) || 0,
        amount: parseFloat(it.amount) || 0,
      }));
      payload.subtotal = subtotal;
      payload.tax = tax;
      payload.total = total;
    }
    if (freeText.trim()) {
      payload.freeText = freeText;
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('書類名を入力してください');
      return;
    }

    const tPayload = buildTemplateDataPayload();
    let result: DocumentDetail | null = null;

    if (isEditMode && documentId) {
      const updateData: UpdateDocumentRequest = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        templateData: Object.keys(tPayload).length > 0 ? tPayload : undefined,
      };
      result = await update(documentId, updateData);
    } else {
      const createData: CreateDocumentRequest = {
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        contractPlotId: formData.contractPlotId || undefined,
        customerId: formData.customerId || undefined,
        templateType: formData.templateType || undefined,
        templateData: Object.keys(tPayload).length > 0 ? tPayload : undefined,
      };
      result = await create(createData);
    }

    if (result) {
      if (selectedFile) {
        const uploaded = await uploadFile(result.id, selectedFile);
        if (!uploaded) toast.error('ファイルのアップロードに失敗しました');
      }
      toast.success(isEditMode ? '書類を更新しました' : '書類を作成しました');
      onSaved(result);
    } else if (mutationError) {
      toast.error(mutationError);
    }
  };

  const handleGeneratePdf = async () => {
    if (!formData.templateType) {
      toast.error('テンプレート種類を選択してください');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const tPayload = buildTemplateDataPayload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await generate({
        templateType: formData.templateType as 'invoice' | 'postcard',
        templateData: tPayload as any,
        documentId: documentId,
        name: formData.name || undefined,
      });

      if (result) {
        downloadPdfFromBase64(result.pdf, `${formData.name || 'document'}.pdf`);
        toast.success(
          `PDF生成完了 (${(result.fileSize / 1024).toFixed(1)} KB)`
        );
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const templateType = formData.templateType || templateId || '';
  const showInvoiceFields =
    templateType === 'invoice' || formData.type === 'invoice';
  const showPostcardFields =
    templateType === 'postcard' || formData.type === 'postcard';
  const showContractFields = formData.type === 'contract';
  const showPermitFields = formData.type === 'permit';
  const showPdfTemplatePreview = showInvoiceFields || showPostcardFields;

  if (isEditMode && isLoadingDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-matsu-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <h2 className="text-2xl font-bold text-sumi-900">
            {isEditMode
              ? '書類編集'
              : templateId
                ? `${TEMPLATE_LABELS[templateId]}を作成`
                : '新規書類作成'}
          </h2>
        </div>
        {(showInvoiceFields || showPostcardFields) && (
          <Button
            type="button"
            variant="outline"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            PDF生成・ダウンロード
          </Button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={showPdfTemplatePreview ? '' : 'space-y-6'}
      >
        <div
          className={
            showPdfTemplatePreview
              ? 'flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(360px,1.35fr)_minmax(260px,380px)] xl:gap-8 xl:items-start'
              : 'space-y-6'
          }
        >
          {showPdfTemplatePreview && (
            <aside className="order-first xl:order-none space-y-3 xl:sticky xl:top-4 xl:self-start min-w-0">
              <div>
                <h3 className="text-base font-semibold text-sumi-900">
                  プレビューで編集
                </h3>
                <p className="text-xs text-sumi-500 mt-1 leading-relaxed">
                  下の「テキストの種」で書体バランスを変えられます。本文はプレビュー内を直接編集してください。右のフォームとも同期します。
                </p>
              </div>
              <div className="rounded-xl border border-sumi-200 bg-kinari-50/90 p-3 max-h-[min(90vh,58rem)] overflow-auto shadow-inner">
                {showInvoiceFields && (
                  <InvoiceLivePreview
                    templateData={templateData}
                    onTemplateDataChange={handleTemplateDataChange}
                    textStylePreset={textStylePreset}
                    onTextStyleChange={handleTextStyleChange}
                    invoiceItems={invoiceItems}
                    onItemChange={handleItemChange}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                    subtotal={subtotal}
                    tax={tax}
                    total={total}
                  />
                )}
                {showPostcardFields && (
                  <PostcardLivePreview
                    templateData={templateData}
                    onTemplateDataChange={handleTemplateDataChange}
                    textStylePreset={textStylePreset}
                    onTextStyleChange={handleTextStyleChange}
                  />
                )}
              </div>
            </aside>
          )}

          <div className="min-w-0 space-y-6 order-last xl:order-none">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-matsu-600" />
            基本情報
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">書類名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="請求書_2026年1月"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">種類</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleInputChange('type', v)}
                disabled={isEditMode || !!templateId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleInputChange('status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="書類の説明"
              />
            </div>
          </div>
        </div>

        {/* ===== 請求書テンプレート ===== */}
        {showInvoiceFields && (
          <div className="bg-white rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              請求書情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>請求書番号</Label>
                <Input
                  value={templateData.invoiceNumber || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('invoiceNumber', e.target.value)
                  }
                  placeholder="INV-2026-0001"
                />
              </div>
              <div className="space-y-2">
                <Label>請求日</Label>
                <Input
                  type="date"
                  value={templateData.invoiceDate || templateData.issueDate || ''}
                  onChange={(e) => {
                    handleTemplateDataChange('issueDate', e.target.value);
                    handleTemplateDataChange('invoiceDate', e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>支払期限</Label>
                <Input
                  type="date"
                  value={templateData.dueDate || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('dueDate', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label>顧客名</Label>
                <Input
                  value={templateData.customerName || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('customerName', e.target.value)
                  }
                  placeholder="田中 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label>顧客住所</Label>
                <Input
                  value={templateData.customerAddress || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('customerAddress', e.target.value)
                  }
                  placeholder="東京都○○区..."
                />
              </div>
            </div>

            {/* 明細行 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">明細</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  行追加
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-sumi-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium w-[40%]">
                        品目・内容
                      </th>
                      <th className="px-3 py-2 text-right font-medium w-[15%]">
                        数量
                      </th>
                      <th className="px-3 py-2 text-right font-medium w-[20%]">
                        単価
                      </th>
                      <th className="px-3 py-2 text-right font-medium w-[20%]">
                        金額
                      </th>
                      <th className="px-3 py-2 w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sumi-100">
                    {invoiceItems.map((item, i) => (
                      <tr key={i} className="group">
                        <td className="px-2 py-1">
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(i, 'description', e.target.value)
                            }
                            placeholder="管理費（年額）"
                            className="border-0 shadow-none focus-visible:ring-1 h-9"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(i, 'quantity', e.target.value)
                            }
                            className="border-0 shadow-none focus-visible:ring-1 h-9 text-right"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <Input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(i, 'unitPrice', e.target.value)
                            }
                            placeholder="10000"
                            className="border-0 shadow-none focus-visible:ring-1 h-9 text-right"
                          />
                        </td>
                        <td className="px-2 py-1 text-right font-medium text-sumi-700 pr-3">
                          {Number(item.amount).toLocaleString()}円
                        </td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            className="text-sumi-300 hover:text-beni-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            disabled={invoiceItems.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 合計 */}
              <div className="flex justify-end mt-3">
                <div className="w-72 space-y-1 text-sm">
                  <div className="flex justify-between px-3 py-1">
                    <span className="text-sumi-500">小計</span>
                    <span>{subtotal.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between px-3 py-1">
                    <span className="text-sumi-500">消費税（10%）</span>
                    <span>{tax.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-blue-50 rounded font-bold text-blue-800 text-base">
                    <span>合計</span>
                    <span>{total.toLocaleString()}円</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== はがきテンプレート ===== */}
        {showPostcardFields && (
          <div className="bg-white rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              はがき情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-sumi-700 border-b pb-1">
                  宛先
                </h4>
                <div className="space-y-2">
                  <Label>郵便番号</Label>
                  <Input
                    value={templateData.recipientPostalCode || ''}
                    onChange={(e) =>
                      handleTemplateDataChange(
                        'recipientPostalCode',
                        e.target.value
                      )
                    }
                    placeholder="123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>住所</Label>
                  <textarea
                    value={templateData.recipientAddress || ''}
                    onChange={(e) =>
                      handleTemplateDataChange(
                        'recipientAddress',
                        e.target.value
                      )
                    }
                    placeholder="東京都○○区..."
                    className="w-full min-h-[60px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>宛名</Label>
                  <Input
                    value={templateData.recipientName || ''}
                    onChange={(e) =>
                      handleTemplateDataChange('recipientName', e.target.value)
                    }
                    placeholder="田中 太郎"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sumi-700 border-b pb-1">
                  差出人
                </h4>
                <div className="space-y-2">
                  <Label>郵便番号</Label>
                  <Input
                    value={templateData.senderPostalCode || ''}
                    onChange={(e) =>
                      handleTemplateDataChange(
                        'senderPostalCode',
                        e.target.value
                      )
                    }
                    placeholder="987-6543"
                  />
                </div>
                <div className="space-y-2">
                  <Label>住所</Label>
                  <textarea
                    value={templateData.senderAddress || ''}
                    onChange={(e) =>
                      handleTemplateDataChange('senderAddress', e.target.value)
                    }
                    placeholder="○○県○○市..."
                    className="w-full min-h-[60px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>差出人名</Label>
                  <Input
                    value={templateData.senderName || ''}
                    onChange={(e) =>
                      handleTemplateDataChange('senderName', e.target.value)
                    }
                    placeholder="小峰霊園管理事務所"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>メッセージ</Label>
              <textarea
                value={templateData.message || ''}
                onChange={(e) =>
                  handleTemplateDataChange('message', e.target.value)
                }
                placeholder="拝啓 時下ますますご清栄のこととお慶び申し上げます..."
                className="w-full min-h-[120px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* ===== 契約書テンプレート ===== */}
        {showContractFields && (
          <div className="bg-white rounded-lg border border-amber-200 p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              契約書情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>契約番号</Label>
                <Input
                  value={templateData.contractNumber || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('contractNumber', e.target.value)
                  }
                  placeholder="CON-2026-0001"
                />
              </div>
              <div className="space-y-2">
                <Label>契約日</Label>
                <Input
                  type="date"
                  value={templateData.contractDate || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('contractDate', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>契約者名</Label>
                <Input
                  value={templateData.contractorName || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('contractorName', e.target.value)
                  }
                  placeholder="田中 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label>区画番号</Label>
                <Input
                  value={templateData.plotNumber || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('plotNumber', e.target.value)
                  }
                  placeholder="A-56"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>契約条件</Label>
              <textarea
                value={templateData.terms || ''}
                onChange={(e) =>
                  handleTemplateDataChange('terms', e.target.value)
                }
                placeholder="契約条件を入力..."
                className="w-full min-h-[150px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* ===== 許可証テンプレート ===== */}
        {showPermitFields && (
          <div className="bg-white rounded-lg border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              許可証情報
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>許可番号</Label>
                <Input
                  value={templateData.permitNumber || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('permitNumber', e.target.value)
                  }
                  placeholder="PER-2026-0001"
                />
              </div>
              <div className="space-y-2">
                <Label>許可日</Label>
                <Input
                  type="date"
                  value={templateData.permitDate || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('permitDate', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>申請者名</Label>
                <Input
                  value={templateData.applicantName || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('applicantName', e.target.value)
                  }
                  placeholder="田中 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label>許可種別</Label>
                <Input
                  value={templateData.permitType || ''}
                  onChange={(e) =>
                    handleTemplateDataChange('permitType', e.target.value)
                  }
                  placeholder="改葬許可"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>許可内容</Label>
              <textarea
                value={templateData.permitContent || ''}
                onChange={(e) =>
                  handleTemplateDataChange('permitContent', e.target.value)
                }
                placeholder="許可内容を入力..."
                className="w-full min-h-[120px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* ===== 自由テキスト編集エリア ===== */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-2">
            自由記入欄
          </h3>
          <p className="text-sm text-sumi-500 mb-3">
            手作業で追記・修正したい内容を自由に入力できます。書類に添付メモとして保存されます。
          </p>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="追加の備考、修正内容、特記事項などを自由に入力..."
            className="w-full min-h-[150px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-matsu-500 text-sm font-mono leading-relaxed"
          />
        </div>

        {/* 備考 */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4">備考</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="管理用メモ（書類には出力されません）"
            className="w-full min-h-[80px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-matsu-500 text-sm"
          />
        </div>

        {/* ファイルアップロード */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-matsu-600" />
            ファイル添付
          </h3>
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                ファイルを選択
              </Button>
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-kinari-50 rounded-md">
                  <FileText className="h-4 w-4 text-matsu-600" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-sumi-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-sumi-400 hover:text-sumi-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-sumi-500">
              対応形式: PDF, Word, Excel, 画像 (最大10MB)
            </p>
          </div>
        </div>

        {/* エラー */}
        {mutationError && (
          <div className="p-4 bg-beni-50 text-beni-700 rounded-lg">
            {mutationError}
          </div>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            キャンセル
          </Button>
          <Button
            type="submit"
            className="bg-matsu-600 hover:bg-matsu-700"
            disabled={isMutating}
          >
            {isMutating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? '更新' : '作成'}
          </Button>
        </div>
          </div>
        </div>
      </form>
    </div>
  );
}
