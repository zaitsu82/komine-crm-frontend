'use client';

/**
 * 書類作成/編集フォームコンポーネント
 */

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
} from 'lucide-react';
import { toast } from 'sonner';

type DocumentType = 'invoice' | 'postcard' | 'contract' | 'permit' | 'other';
type DocumentStatus = 'draft' | 'generated' | 'sent' | 'archived';

interface DocumentFormProps {
  documentId?: string; // 編集時のみ
  customerId?: string; // 顧客詳細から遷移時にプリセット
  onBack: () => void;
  onSaved: (doc: DocumentDetail) => void;
}

export function DocumentForm({ documentId, customerId: initialCustomerId, onBack, onSaved }: DocumentFormProps) {
  const isEditMode = !!documentId;
  const { data: existingData, isLoading: isLoadingDetail } = useDocumentDetail(documentId || null);
  const { create, update, upload, generate, isLoading: isMutating, error: mutationError } = useDocumentMutations();

  // フォーム状態
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
    type: 'invoice',
    status: 'draft',
    description: '',
    notes: '',
    contractPlotId: '',
    customerId: initialCustomerId || '',
    templateType: '',
  });

  // ファイルアップロード
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF生成用テンプレートデータ
  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 既存データの読み込み
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
          data[key] = typeof value === 'string' ? value : JSON.stringify(value);
        });
        setTemplateData(data);
      }
    }
  }, [existingData]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateDataChange = (key: string, value: string) => {
    setTemplateData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('ファイルサイズは10MB以下にしてください');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('書類名を入力してください');
      return;
    }

    let result: DocumentDetail | null = null;

    if (isEditMode && documentId) {
      // 更新
      const updateData: UpdateDocumentRequest = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        templateData: Object.keys(templateData).length > 0 ? templateData : undefined,
      };
      result = await update(documentId, updateData);
    } else {
      // 新規作成
      const createData: CreateDocumentRequest = {
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        contractPlotId: formData.contractPlotId || undefined,
        customerId: formData.customerId || undefined,
        templateType: formData.templateType || undefined,
        templateData: Object.keys(templateData).length > 0 ? templateData : undefined,
      };
      result = await create(createData);
    }

    if (result) {
      // ファイルアップロード
      if (selectedFile) {
        const uploaded = await upload(result.id, selectedFile);
        if (!uploaded) {
          toast.error('ファイルのアップロードに失敗しました');
        }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await generate({
        templateType: formData.templateType as 'invoice' | 'postcard',
        templateData: templateData as any,
        documentId: documentId,
        name: formData.name || undefined,
      });

      if (result) {
        // PDFをダウンロード
        downloadPdfFromBase64(result.pdf, `${formData.name || 'document'}.pdf`);
        toast.success(`PDF生成完了 (${(result.fileSize / 1024).toFixed(1)} KB)`);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // テンプレートタイプに応じたフィールド
  const getTemplateFields = (type: string): { key: string; label: string }[] => {
    switch (type) {
      case 'invoice':
        return [
          { key: 'invoiceNumber', label: '請求書番号' },
          { key: 'invoiceDate', label: '請求日' },
          { key: 'dueDate', label: '支払期限' },
          { key: 'customerName', label: '顧客名' },
          { key: 'customerAddress', label: '顧客住所' },
          { key: 'subtotal', label: '小計' },
          { key: 'tax', label: '消費税' },
          { key: 'total', label: '合計' },
        ];
      case 'postcard':
        return [
          { key: 'recipientPostalCode', label: '宛先郵便番号' },
          { key: 'recipientAddress', label: '宛先住所' },
          { key: 'recipientName', label: '宛先名' },
          { key: 'senderPostalCode', label: '差出人郵便番号' },
          { key: 'senderAddress', label: '差出人住所' },
          { key: 'senderName', label: '差出人名' },
        ];
      default:
        return [];
    }
  };

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
            {isEditMode ? '書類編集' : '新規書類作成'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="type">種類 {!isEditMode && '*'}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                disabled={isEditMode}
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
                onValueChange={(value) => handleInputChange('status', value)}
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
              <Label htmlFor="templateType">テンプレート種類</Label>
              <Select
                value={formData.templateType}
                onValueChange={(value) => handleInputChange('templateType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">請求書</SelectItem>
                  <SelectItem value="postcard">はがき</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="書類の説明"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">備考</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="備考・メモ"
                className="w-full min-h-[100px] px-3 py-2 border border-sumi-200 rounded-md focus:outline-none focus:ring-2 focus:ring-matsu-500"
              />
            </div>
          </div>
        </div>

        {/* ファイルアップロード */}
        <div className="bg-white rounded-lg border border-sumi-200 p-6">
          <h3 className="text-lg font-semibold text-sumi-900 mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-matsu-600" />
            ファイルアップロード
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

        {/* テンプレートデータ */}
        {formData.templateType && (
          <div className="bg-white rounded-lg border border-sumi-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-sumi-900 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-matsu-600" />
                テンプレートデータ ({formData.templateType === 'invoice' ? '請求書' : 'はがき'})
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF生成
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getTemplateFields(formData.templateType).map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    value={templateData[field.key] || ''}
                    onChange={(e) => handleTemplateDataChange(field.key, e.target.value)}
                    placeholder={field.label}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* エラー表示 */}
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
      </form>
    </div>
  );
}
