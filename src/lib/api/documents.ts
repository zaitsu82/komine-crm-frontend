/**
 * 書類管理API
 */

import { ApiResponse } from './types';
import { apiGet, apiPost, apiPut, apiDelete, shouldUseMockData, API_CONFIG } from './client';

// =============================================================================
// 型定義
// =============================================================================

// 書類タイプ
export type DocumentType = 'invoice' | 'postcard' | 'contract' | 'permit' | 'other';

// 書類ステータス
export type DocumentStatus = 'draft' | 'generated' | 'sent' | 'archived';

// 書類一覧アイテム
export interface DocumentListItem {
  id: string;
  contractPlotId: string | null;
  customerId: string | null;
  type: DocumentType;
  name: string;
  description: string | null;
  status: DocumentStatus;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  templateType: string | null;
  generatedAt: string | null;
  sentAt: string | null;
  createdBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contractPlot: {
    id: string;
    plotNumber: string;
    areaName: string;
  } | null;
  customer: {
    id: string;
    name: string;
    nameKana: string;
  } | null;
}

// 書類詳細
export interface DocumentDetail {
  id: string;
  contractPlotId: string | null;
  customerId: string | null;
  type: DocumentType;
  name: string;
  description: string | null;
  status: DocumentStatus;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  templateType: string | null;
  generatedAt: string | null;
  sentAt: string | null;
  createdBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  fileKey: string | null;
  templateData: Record<string, unknown> | null;
  contractPlot: {
    id: string;
    contractAreaSqm: number;
    contractDate: string | null;
    physicalPlot: {
      id: string;
      plotNumber: string;
      areaName: string;
    };
  } | null;
  customer: {
    id: string;
    name: string;
    nameKana: string;
    postalCode: string;
    address: string;
    phoneNumber: string | null;
    email: string | null;
  } | null;
}

// 書類一覧レスポンス
export interface DocumentListResponse {
  items: DocumentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 書類検索パラメータ
export interface DocumentSearchParams {
  contractPlotId?: string;
  customerId?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 書類作成リクエスト
export interface CreateDocumentRequest {
  contractPlotId?: string;
  customerId?: string;
  type: DocumentType;
  name: string;
  description?: string;
  templateType?: string;
  templateData?: Record<string, unknown>;
  notes?: string;
}

// 書類更新リクエスト
export interface UpdateDocumentRequest {
  name?: string;
  description?: string;
  status?: DocumentStatus;
  templateData?: Record<string, unknown>;
  notes?: string;
}

// ダウンロードURLレスポンス
export interface DownloadUrlResponse {
  url: string;
  fileName: string;
  mimeType: string;
  expiresIn: number;
}

// PDF生成リクエスト
export interface GeneratePdfRequest {
  templateType: 'invoice' | 'postcard';
  templateData: InvoiceTemplateData | PostcardTemplateData;
  documentId?: string;
  name?: string;
  contractPlotId?: string;
  customerId?: string;
}

// 請求書テンプレートデータ
export interface InvoiceTemplateData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

// はがきテンプレートデータ
export interface PostcardTemplateData {
  recipientName: string;
  recipientAddress: string;
  recipientPostalCode: string;
  senderName: string;
  senderAddress: string;
  senderPostalCode: string;
  message: string;
  date: string;
}

// PDF生成レスポンス
export interface GeneratePdfResponse {
  documentId: string;
  pdf: string; // Base64エンコードされたPDF
  mimeType: string;
  fileSize: number;
}

// =============================================================================
// 定数
// =============================================================================

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: '請求書',
  postcard: 'はがき',
  contract: '契約書',
  permit: '許可証',
  other: 'その他',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: '下書き',
  generated: '生成済み',
  sent: '送付済み',
  archived: 'アーカイブ',
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'gray',
  generated: 'blue',
  sent: 'green',
  archived: 'slate',
};

// =============================================================================
// モックデータ
// =============================================================================

const MOCK_DOCUMENTS: DocumentDetail[] = [
  {
    id: 'doc-001',
    contractPlotId: 'cp-001',
    customerId: 'cust-001',
    type: 'invoice',
    name: '請求書_2024年1月分',
    description: '2024年1月の管理料請求書',
    status: 'sent',
    fileKey: 'documents/doc-001/invoice.pdf',
    fileName: '請求書_2024年1月分.pdf',
    fileSize: 102400,
    mimeType: 'application/pdf',
    templateType: 'invoice',
    templateData: null,
    generatedAt: '2024-01-15T10:00:00Z',
    sentAt: '2024-01-16T09:00:00Z',
    createdBy: '管理者',
    notes: null,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
    contractPlot: {
      id: 'cp-001',
      contractAreaSqm: 3.6,
      contractDate: '2020-04-01',
      physicalPlot: {
        id: 'pp-001',
        plotNumber: 'A-56',
        areaName: '1期',
      },
    },
    customer: {
      id: 'cust-001',
      name: '山田太郎',
      nameKana: 'ヤマダタロウ',
      postalCode: '1234567',
      address: '東京都渋谷区1-2-3',
      phoneNumber: '09012345678',
      email: 'yamada@example.com',
    },
  },
  {
    id: 'doc-002',
    contractPlotId: 'cp-002',
    customerId: 'cust-002',
    type: 'postcard',
    name: '年賀状_2024年',
    description: '2024年年賀状',
    status: 'generated',
    fileKey: 'documents/doc-002/postcard.pdf',
    fileName: '年賀状_2024年.pdf',
    fileSize: 51200,
    mimeType: 'application/pdf',
    templateType: 'postcard',
    templateData: null,
    generatedAt: '2023-12-20T14:00:00Z',
    sentAt: null,
    createdBy: 'オペレーター',
    notes: '発送予定日: 12/25',
    createdAt: '2023-12-20T13:00:00Z',
    updatedAt: '2023-12-20T14:00:00Z',
    contractPlot: {
      id: 'cp-002',
      contractAreaSqm: 1.8,
      contractDate: '2021-06-15',
      physicalPlot: {
        id: 'pp-002',
        plotNumber: 'B-12',
        areaName: '2期',
      },
    },
    customer: {
      id: 'cust-002',
      name: '佐藤花子',
      nameKana: 'サトウハナコ',
      postalCode: '9876543',
      address: '大阪府大阪市4-5-6',
      phoneNumber: '08087654321',
      email: 'sato@example.com',
    },
  },
  {
    id: 'doc-003',
    contractPlotId: null,
    customerId: 'cust-003',
    type: 'contract',
    name: '契約書_田中様',
    description: '契約書原本',
    status: 'draft',
    fileKey: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    templateType: null,
    templateData: null,
    generatedAt: null,
    sentAt: null,
    createdBy: '管理者',
    notes: '作成中',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    contractPlot: null,
    customer: {
      id: 'cust-003',
      name: '田中一郎',
      nameKana: 'タナカイチロウ',
      postalCode: '1112222',
      address: '神奈川県横浜市7-8-9',
      phoneNumber: '07011112222',
      email: 'tanaka@example.com',
    },
  },
];

// =============================================================================
// モック実装
// =============================================================================

async function mockGetDocuments(
  params?: DocumentSearchParams
): Promise<ApiResponse<DocumentListResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...MOCK_DOCUMENTS];

  // フィルタリング
  if (params?.contractPlotId) {
    filtered = filtered.filter((d) => d.contractPlotId === params.contractPlotId);
  }
  if (params?.customerId) {
    filtered = filtered.filter((d) => d.customerId === params.customerId);
  }
  if (params?.type) {
    filtered = filtered.filter((d) => d.type === params.type);
  }
  if (params?.status) {
    filtered = filtered.filter((d) => d.status === params.status);
  }

  // ソート
  const sortBy = params?.sortBy || 'createdAt';
  const sortOrder = params?.sortOrder || 'desc';
  filtered.sort((a, b) => {
    const aVal = a[sortBy as keyof DocumentDetail] as string;
    const bVal = b[sortBy as keyof DocumentDetail] as string;
    const cmp = (aVal || '').localeCompare(bVal || '');
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  // ページネーション
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    success: true,
    data: {
      items: items.map((d) => ({
        ...d,
        contractPlot: d.contractPlot
          ? {
            id: d.contractPlot.id,
            plotNumber: d.contractPlot.physicalPlot.plotNumber,
            areaName: d.contractPlot.physicalPlot.areaName,
          }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}

async function mockGetDocumentById(id: string): Promise<ApiResponse<DocumentDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const document = MOCK_DOCUMENTS.find((d) => d.id === id);
  if (!document) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '書類が見つかりません',
      },
    };
  }

  return { success: true, data: document };
}

async function mockCreateDocument(
  data: CreateDocumentRequest
): Promise<ApiResponse<DocumentDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newDocument: DocumentDetail = {
    id: `doc-${Date.now()}`,
    contractPlotId: data.contractPlotId || null,
    customerId: data.customerId || null,
    type: data.type,
    name: data.name,
    description: data.description || null,
    status: 'draft',
    fileKey: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    templateType: data.templateType || null,
    templateData: data.templateData || null,
    generatedAt: null,
    sentAt: null,
    createdBy: 'テストユーザー',
    notes: data.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    contractPlot: null,
    customer: null,
  };

  return { success: true, data: newDocument };
}

async function mockUpdateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<ApiResponse<DocumentDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const document = MOCK_DOCUMENTS.find((d) => d.id === id);
  if (!document) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '書類が見つかりません',
      },
    };
  }

  const updated: DocumentDetail = {
    ...document,
    name: data.name ?? document.name,
    description: data.description ?? document.description,
    status: data.status ?? document.status,
    templateData: data.templateData ?? document.templateData,
    notes: data.notes ?? document.notes,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: updated };
}

async function mockDeleteDocument(id: string): Promise<ApiResponse<{ message: string }>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = MOCK_DOCUMENTS.findIndex((d) => d.id === id);
  if (index === -1) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '書類が見つかりません',
      },
    };
  }

  return { success: true, data: { message: '書類を削除しました' } };
}

async function mockGetDownloadUrl(id: string): Promise<ApiResponse<DownloadUrlResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const document = MOCK_DOCUMENTS.find((d) => d.id === id);
  if (!document) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '書類が見つかりません',
      },
    };
  }

  if (!document.fileKey) {
    return {
      success: false,
      error: {
        code: 'NO_FILE',
        message: 'ファイルがアップロードされていません',
      },
    };
  }

  return {
    success: true,
    data: {
      url: `https://example-bucket.s3.amazonaws.com/${document.fileKey}?signed=true`,
      fileName: document.fileName || 'document.pdf',
      mimeType: document.mimeType || 'application/pdf',
      expiresIn: 900,
    },
  };
}

async function mockGeneratePdf(
  data: GeneratePdfRequest
): Promise<ApiResponse<GeneratePdfResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // モックではBase64エンコードされた空のPDFを返す
  const mockPdf = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2Jq';

  return {
    success: true,
    data: {
      documentId: data.documentId || `doc-${Date.now()}`,
      pdf: mockPdf,
      mimeType: 'application/pdf',
      fileSize: mockPdf.length,
    },
  };
}

// =============================================================================
// API関数
// =============================================================================

/**
 * 書類一覧を取得
 */
export async function getDocuments(
  params?: DocumentSearchParams
): Promise<ApiResponse<DocumentListResponse>> {
  if (shouldUseMockData()) {
    return mockGetDocuments(params);
  }

  return apiGet<DocumentListResponse>('/documents', params as Record<string, string | number | undefined>);
}

/**
 * 書類詳細を取得
 */
export async function getDocumentById(id: string): Promise<ApiResponse<DocumentDetail>> {
  if (shouldUseMockData()) {
    return mockGetDocumentById(id);
  }

  return apiGet<DocumentDetail>(`/documents/${id}`);
}

/**
 * 書類を作成
 */
export async function createDocument(
  data: CreateDocumentRequest
): Promise<ApiResponse<DocumentDetail>> {
  if (shouldUseMockData()) {
    return mockCreateDocument(data);
  }

  return apiPost<DocumentDetail>('/documents', data);
}

/**
 * 書類を更新
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<ApiResponse<DocumentDetail>> {
  if (shouldUseMockData()) {
    return mockUpdateDocument(id, data);
  }

  return apiPut<DocumentDetail>(`/documents/${id}`, data);
}

/**
 * 書類を削除
 */
export async function deleteDocument(id: string): Promise<ApiResponse<{ message: string }>> {
  if (shouldUseMockData()) {
    return mockDeleteDocument(id);
  }

  return apiDelete<{ message: string }>(`/documents/${id}`);
}

/**
 * ファイルをアップロード
 */
export async function uploadDocumentFile(
  id: string,
  file: File
): Promise<ApiResponse<{ id: string; fileName: string; fileSize: number; mimeType: string }>> {
  if (shouldUseMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_CONFIG.baseUrl}/documents/${id}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || `HTTP_${response.status}`,
          message: data.error?.message || 'ファイルのアップロードに失敗しました',
        },
      };
    }

    return data;
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'ネットワークエラーが発生しました',
      },
    };
  }
}

/**
 * ダウンロードURLを取得
 */
export async function getDocumentDownloadUrl(
  id: string
): Promise<ApiResponse<DownloadUrlResponse>> {
  if (shouldUseMockData()) {
    return mockGetDownloadUrl(id);
  }

  return apiGet<DownloadUrlResponse>(`/documents/${id}/download`);
}

/**
 * PDFを生成
 */
export async function generatePdf(
  data: GeneratePdfRequest
): Promise<ApiResponse<GeneratePdfResponse>> {
  if (shouldUseMockData()) {
    return mockGeneratePdf(data);
  }

  return apiPost<GeneratePdfResponse>('/documents/generate-pdf', data);
}

/**
 * Base64 PDFをダウンロード
 */
export function downloadPdfFromBase64(base64: string, fileName: string): void {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
