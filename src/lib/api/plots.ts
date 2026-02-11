/**
 * 区画API (Plot-centric API)
 *
 * @komine/types を直接使用し、型変換なしでAPIレスポンスを返す
 * customers.ts の代替として段階的に移行
 */

import {
  PlotListItem,
  PlotDetailResponse,
  CreatePlotRequest,
  UpdatePlotRequest,
  PhysicalPlotStatus,
  PaymentStatus,
  ContractStatus,
  ContractRole,
} from '@komine/types';
import { apiGet, apiPost, apiPut, apiDelete, shouldUseMockData } from './client';
import { ApiResponse } from './types';

// ===== 型定義 =====

/**
 * 区画一覧のAPIレスポンス形式
 */
interface PlotListApiResponse {
  data: PlotListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 区画検索パラメータ
 */
export interface PlotSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  areaName?: string;
  status?: PhysicalPlotStatus;
  paymentStatus?: PaymentStatus;
  contractStatus?: ContractStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  nameKanaPrefix?: string;
}

/**
 * 区画一覧レスポンス（フロントエンド用）
 */
export interface PlotListResult {
  items: PlotListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== モック実装 =====

/**
 * モック用の区画データ
 */
const mockPlots: PlotListItem[] = [
  {
    id: 'mock-plot-1',
    contractAreaSqm: 3.6,
    locationDescription: null,
    plotNumber: 'A-001',
    areaName: '1期',
    physicalPlotAreaSqm: 3.6,
    physicalPlotStatus: PhysicalPlotStatus.SoldOut,
    contractDate: '2020-04-01',
    price: 500000,
    paymentStatus: PaymentStatus.Paid,
    customerName: '田中太郎',
    customerNameKana: 'タナカタロウ',
    customerPhoneNumber: '09012345678',
    customerAddress: '東京都新宿区西新宿1-1-1',
    customerRole: ContractRole.Contractor,
    roles: [
      {
        role: ContractRole.Contractor,
        customer: { id: 'customer-1', name: '田中太郎' },
      },
    ],
    nextBillingDate: '2025-04-01',
    managementFee: '5000',
    createdAt: '2020-04-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'mock-plot-2',
    contractAreaSqm: 1.8,
    locationDescription: '左半分',
    plotNumber: 'B-015',
    areaName: '2期',
    physicalPlotAreaSqm: 3.6,
    physicalPlotStatus: PhysicalPlotStatus.PartiallySold,
    contractDate: '2022-08-15',
    price: 300000,
    paymentStatus: PaymentStatus.Unpaid,
    customerName: '鈴木花子',
    customerNameKana: 'スズキハナコ',
    customerPhoneNumber: '08098765432',
    customerAddress: '神奈川県横浜市中区本町1-2-3',
    customerRole: ContractRole.Contractor,
    roles: [
      {
        role: ContractRole.Contractor,
        customer: { id: 'customer-2', name: '鈴木花子' },
      },
    ],
    nextBillingDate: '2025-08-15',
    managementFee: '3000',
    createdAt: '2022-08-15T00:00:00Z',
    updatedAt: '2024-02-20T14:45:00Z',
  },
];

/**
 * モック: 区画一覧取得
 */
async function mockGetPlots(
  params: PlotSearchParams
): Promise<ApiResponse<PlotListResult>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let plots = [...mockPlots];

  // 検索フィルタ
  if (params.search) {
    const query = params.search.toLowerCase();
    plots = plots.filter(
      (p) =>
        p.plotNumber.toLowerCase().includes(query) ||
        p.customerName?.toLowerCase().includes(query) ||
        p.customerNameKana?.toLowerCase().includes(query) ||
        p.customerPhoneNumber?.includes(query) ||
        p.customerAddress?.toLowerCase().includes(query)
    );
  }

  // エリアフィルタ
  if (params.areaName) {
    plots = plots.filter((p) => p.areaName === params.areaName);
  }

  // ステータスフィルタ
  if (params.status) {
    plots = plots.filter((p) => p.physicalPlotStatus === params.status);
  }

  if (params.paymentStatus) {
    plots = plots.filter((p) => p.paymentStatus === params.paymentStatus);
  }

  // ページネーション
  const page = params.page || 1;
  const limit = params.limit || 50;
  const startIndex = (page - 1) * limit;
  const paginatedItems = plots.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      items: paginatedItems,
      total: plots.length,
      page,
      limit,
      totalPages: Math.ceil(plots.length / limit),
    },
  };
}

/**
 * モック: 区画詳細取得
 */
async function mockGetPlotById(
  id: string
): Promise<ApiResponse<PlotDetailResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const plot = mockPlots.find((p) => p.id === id);
  if (!plot) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '区画が見つかりません',
      },
    };
  }

  // PlotListItem から PlotDetailResponse への変換（モック用）
  const detail: PlotDetailResponse = {
    id: plot.id,
    contractAreaSqm: plot.contractAreaSqm,
    locationDescription: plot.locationDescription,
    createdAt: plot.createdAt,
    updatedAt: plot.updatedAt,
    physicalPlot: {
      id: `physical-${plot.id}`,
      plotNumber: plot.plotNumber,
      areaName: plot.areaName,
      areaSqm: plot.physicalPlotAreaSqm,
      status: plot.physicalPlotStatus,
      notes: null,
    },
    contractDate: plot.contractDate,
    price: plot.price,
    contractStatus: ContractStatus.Active,
    paymentStatus: plot.paymentStatus as PaymentStatus,
    reservationDate: null,
    acceptanceNumber: null,
    permitDate: null,
    permitNumber: null,
    startDate: null,
    contractNotes: null,
    usageFee: null,
    managementFee: plot.managementFee
      ? {
        calculationType: null,
        taxType: null,
        billingType: null,
        billingYears: null,
        area: null,
        billingMonth: null,
        managementFee: plot.managementFee,
        unitPrice: null,
        lastBillingMonth: null,
        paymentMethod: null,
      }
      : null,
    buriedPersons: [],
    familyContacts: [],
    gravestoneInfo: null,
    constructionInfos: [],
    collectiveBurial: null,
    roles: plot.roles.map((r, idx) => ({
      id: `role-${idx}`,
      role: r.role,
      roleStartDate: null,
      roleEndDate: null,
      notes: null,
      customer: {
        id: r.customer.id,
        name: r.customer.name,
        nameKana: plot.customerNameKana || null,
        gender: null,
        birthDate: null,
        phoneNumber: plot.customerPhoneNumber || null,
        faxNumber: null,
        email: null,
        postalCode: null,
        address: plot.customerAddress || null,
        registeredAddress: null,
        notes: null,
        workInfo: null,
        billingInfo: null,
      },
    })),
  };

  return {
    success: true,
    data: detail,
  };
}

/**
 * モック: 区画作成
 */
async function mockCreatePlot(
  request: CreatePlotRequest
): Promise<ApiResponse<PlotDetailResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 簡易的なモック応答
  const newId = `mock-plot-${Date.now()}`;
  const detail: PlotDetailResponse = {
    id: newId,
    contractAreaSqm: request.contractPlot.contractAreaSqm,
    locationDescription: request.contractPlot.locationDescription || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    physicalPlot: {
      id: `physical-${newId}`,
      plotNumber: request.physicalPlot.plotNumber,
      areaName: request.physicalPlot.areaName,
      areaSqm: request.physicalPlot.areaSqm || 3.6,
      status: PhysicalPlotStatus.SoldOut,
      notes: request.physicalPlot.notes || null,
    },
    contractDate: request.saleContract.contractDate,
    price: request.saleContract.price,
    contractStatus: ContractStatus.Active,
    paymentStatus: request.saleContract.paymentStatus || PaymentStatus.Unpaid,
    reservationDate: request.saleContract.reservationDate || null,
    acceptanceNumber: request.saleContract.acceptanceNumber || null,
    permitDate: request.saleContract.permitDate || null,
    permitNumber: request.saleContract.permitNumber || null,
    startDate: request.saleContract.startDate || null,
    contractNotes: request.saleContract.notes || null,
    usageFee: null,
    managementFee: null,
    buriedPersons: [],
    familyContacts: [],
    gravestoneInfo: null,
    constructionInfos: [],
    collectiveBurial: null,
    roles: [
      {
        id: `role-${newId}`,
        role: request.customer.role || ContractRole.Contractor,
        roleStartDate: null,
        roleEndDate: null,
        notes: null,
        customer: {
          id: `customer-${newId}`,
          name: request.customer.name,
          nameKana: request.customer.nameKana,
          gender: request.customer.gender || null,
          birthDate: request.customer.birthDate || null,
          phoneNumber: request.customer.phoneNumber,
          faxNumber: request.customer.faxNumber || null,
          email: request.customer.email || null,
          postalCode: request.customer.postalCode,
          address: request.customer.address,
          registeredAddress: request.customer.registeredAddress || null,
          notes: request.customer.notes || null,
          workInfo: null,
          billingInfo: null,
        },
      },
    ],
  };

  return {
    success: true,
    data: detail,
  };
}

// ===== 公開API =====

/**
 * 区画一覧取得
 * サーバーサイド検索・ページネーション対応
 */
export async function getPlots(
  params: PlotSearchParams = {}
): Promise<ApiResponse<PlotListResult>> {
  if (shouldUseMockData()) {
    return mockGetPlots(params);
  }

  const response = await apiGet<PlotListApiResponse>('/plots', {
    page: params.page,
    limit: params.limit,
    search: params.search,
    areaName: params.areaName,
    status: params.status,
    paymentStatus: params.paymentStatus,
    contractStatus: params.contractStatus,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    nameKanaPrefix: params.nameKanaPrefix,
  });

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: {
      items: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      totalPages: response.data.pagination.totalPages,
    },
  };
}

/**
 * 全区画一覧取得（複数ページを順次取得）
 * クライアントサイドで全件を扱う場合に使用
 */
export async function getAllPlots(
  params: Omit<PlotSearchParams, 'page' | 'limit'> = {}
): Promise<ApiResponse<PlotListItem[]>> {
  const allItems: PlotListItem[] = [];
  let page = 1;

  for (; ;) {
    const response = await getPlots({ ...params, page, limit: 100 });

    if (!response.success) {
      return response as ApiResponse<PlotListItem[]>;
    }

    allItems.push(...response.data.items);

    if (page >= response.data.totalPages) break;
    page++;
  }

  return { success: true, data: allItems };
}

/**
 * 区画詳細取得
 */
export async function getPlotById(
  id: string,
  options?: { includeHistory?: boolean }
): Promise<ApiResponse<PlotDetailResponse>> {
  if (shouldUseMockData()) {
    return mockGetPlotById(id);
  }

  const params = new URLSearchParams();
  if (options?.includeHistory) {
    params.set('includeHistory', 'true');
  }
  const query = params.toString();
  return apiGet<PlotDetailResponse>(`/plots/${id}${query ? `?${query}` : ''}`);
}

/**
 * 区画作成
 */
export async function createPlot(
  request: CreatePlotRequest
): Promise<ApiResponse<PlotDetailResponse>> {
  if (shouldUseMockData()) {
    return mockCreatePlot(request);
  }

  return apiPost<PlotDetailResponse>('/plots', request);
}

/**
 * 区画更新
 */
export async function updatePlot(
  id: string,
  request: UpdatePlotRequest
): Promise<ApiResponse<PlotDetailResponse>> {
  if (shouldUseMockData()) {
    // モック実装は簡略化
    return mockGetPlotById(id);
  }

  return apiPut<PlotDetailResponse>(`/plots/${id}`, request);
}

/**
 * 区画削除（論理削除）
 */
export async function deletePlot(id: string): Promise<ApiResponse<void>> {
  if (shouldUseMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, data: undefined };
  }

  return apiDelete<void>(`/plots/${id}`);
}

// ===== ヘルパー関数 =====

/**
 * 区画の主たる顧客を取得
 */
export function getPrimaryCustomer(plot: PlotDetailResponse) {
  // contractor ロールの顧客を優先
  const contractorRole = plot.roles.find((r) => r.role === 'contractor');
  if (contractorRole) {
    return contractorRole.customer;
  }

  // なければ最初の顧客
  return plot.roles[0]?.customer || null;
}

/**
 * 区画の表示用ステータスを取得
 */
export function getPlotDisplayStatus(plot: PlotListItem): 'active' | 'attention' | 'overdue' {
  if (plot.paymentStatus === PaymentStatus.Overdue) {
    return 'overdue';
  }
  if (plot.paymentStatus === PaymentStatus.Unpaid || plot.paymentStatus === PaymentStatus.PartialPaid) {
    return 'attention';
  }
  return 'active';
}

/**
 * 区画番号でソート
 */
export function sortPlotsByNumber(plots: PlotListItem[]): PlotListItem[] {
  return [...plots].sort((a, b) => {
    // 区画番号をパース（例: A-001 → { letter: 'A', number: 1 }）
    const parseNumber = (pn: string) => {
      const match = pn.match(/^([A-Z]+)-?(\d+)$/i);
      if (!match) return { letter: pn, number: 0 };
      return { letter: match[1].toUpperCase(), number: parseInt(match[2], 10) };
    };

    const aNum = parseNumber(a.plotNumber);
    const bNum = parseNumber(b.plotNumber);

    // 文字部分で比較
    if (aNum.letter !== bNum.letter) {
      return aNum.letter.localeCompare(bNum.letter);
    }

    // 数値部分で比較
    return aNum.number - bNum.number;
  });
}

/**
 * 顧客名カナであいうえお順にソート
 */
export function sortPlotsByCustomerKana(plots: PlotListItem[]): PlotListItem[] {
  return [...plots].sort((a, b) => {
    const aKana = a.customerNameKana || '';
    const bKana = b.customerNameKana || '';
    return aKana.localeCompare(bKana, 'ja');
  });
}

/**
 * あいうえおタブでフィルタ
 */
export function filterPlotsByAiueo(plots: PlotListItem[], tab: string): PlotListItem[] {
  if (tab === 'all') return plots;

  const kanaRanges: Record<string, [string, string]> = {
    'あ': ['ア', 'オ'],
    'か': ['カ', 'コ'],
    'さ': ['サ', 'ソ'],
    'た': ['タ', 'ト'],
    'な': ['ナ', 'ノ'],
    'は': ['ハ', 'ホ'],
    'ま': ['マ', 'モ'],
    'や': ['ヤ', 'ヨ'],
    'ら': ['ラ', 'ロ'],
    'わ': ['ワ', 'ン'],
  };

  const range = kanaRanges[tab];
  if (!range) return plots;

  return plots.filter((p) => {
    const kana = p.customerNameKana || '';
    if (!kana) return false;
    const firstChar = kana.charAt(0);
    return firstChar >= range[0] && firstChar <= range[1];
  });
}
