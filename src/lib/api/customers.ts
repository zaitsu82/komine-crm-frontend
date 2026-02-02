/**
 * 顧客/区画API
 * モックデータとリアルAPIの切り替えをサポート
 */

import { Customer } from '@/types/customer';
import { CustomerFormData } from '@/lib/validations';
import {
  mockCustomers,
  searchCustomers as searchCustomersFromMock,
  getCustomerById as getCustomerByIdFromMock,
  createCustomer as createCustomerFromMock,
  updateCustomer as updateCustomerFromMock,
  deleteCustomer as deleteCustomerFromMock,
  formDataToCustomer,
  terminateCustomer as terminateCustomerFromMock,
  TerminationInput,
} from '@/lib/data';
import { apiGet, apiPost, apiPut, apiDelete, shouldUseMockData } from './client';
import {
  ApiResponse,
  CustomerSearchParams,
  PaginatedResponse,
  ApiPlotListItem,
  ApiPlotDetail,
} from './types';

// ===== データ変換関数 =====

/**
 * API一覧レスポンスをフロントエンドの顧客型に変換
 */
function apiPlotListItemToCustomer(apiData: ApiPlotListItem): Customer {
  return {
    id: apiData.id,
    customerCode: apiData.plotNumber, // 区画番号を顧客コードとして使用
    plotNumber: apiData.plotNumber,
    section: apiData.areaName,
    reservationDate: apiData.contractDate ? new Date(apiData.contractDate) : null,
    acceptanceNumber: undefined,
    permitDate: null,
    startDate: null,
    name: apiData.customerName || '',
    nameKana: apiData.customerNameKana || '',
    birthDate: null,
    gender: undefined,
    phoneNumber: apiData.customerPhoneNumber || '',
    faxNumber: undefined,
    email: undefined,
    address: apiData.customerAddress || '',
    postalCode: undefined,
    status: 'active',
    usageFee: undefined,
    managementFee: apiData.managementFee
      ? {
        calculationType: '',
        taxType: '',
        billingType: '',
        billingYears: null,
        area: '',
        billingMonth: null,
        managementFee: apiData.managementFee,
        unitPrice: null,
        lastBillingMonth: '',
        paymentMethod: '',
      }
      : undefined,
    plotInfo: {
      plotNumber: apiData.plotNumber,
      section: apiData.areaName,
      usage: apiData.physicalPlotStatus === 'sold_out' ? 'in_use' : 'available',
      size: `${apiData.contractAreaSqm}㎡`,
      price: String(apiData.price),
      contractDate: apiData.contractDate ? new Date(apiData.contractDate) : null,
    },
    createdAt: new Date(apiData.createdAt),
    updatedAt: new Date(apiData.updatedAt),
  };
}

/**
 * API詳細レスポンスをフロントエンドの顧客型に変換
 */
function apiPlotDetailToCustomer(apiData: ApiPlotDetail): Customer {
  const customer = apiData.primaryCustomer;

  return {
    id: apiData.id,
    customerCode: apiData.physicalPlot.plotNumber,
    plotNumber: apiData.physicalPlot.plotNumber,
    section: apiData.physicalPlot.areaName,
    reservationDate: apiData.reservationDate ? new Date(apiData.reservationDate) : null,
    acceptanceNumber: apiData.acceptanceNumber || undefined,
    permitDate: apiData.permitDate ? new Date(apiData.permitDate) : null,
    startDate: apiData.startDate ? new Date(apiData.startDate) : null,
    name: customer?.name || '',
    nameKana: customer?.nameKana || '',
    birthDate: customer?.birthDate ? new Date(customer.birthDate) : null,
    gender: customer?.gender as 'male' | 'female' | undefined,
    phoneNumber: customer?.phoneNumber || '',
    faxNumber: customer?.faxNumber || undefined,
    email: customer?.email || undefined,
    address: customer?.address || '',
    postalCode: customer?.postalCode || undefined,
    status: 'active',
    usageFee: apiData.usageFee
      ? {
        calculationType: apiData.usageFee.calculationType,
        taxType: apiData.usageFee.taxType,
        billingType: '',
        billingYears: null,
        area: apiData.usageFee.area || '',
        unitPrice: apiData.usageFee.unitPrice,
        usageFee: apiData.usageFee.usageFee,
        paymentMethod: apiData.usageFee.paymentMethod || '',
      }
      : undefined,
    managementFee: apiData.managementFee
      ? {
        calculationType: apiData.managementFee.calculationType,
        taxType: apiData.managementFee.taxType,
        billingType: apiData.managementFee.billingType,
        billingYears: apiData.managementFee.billingYears,
        area: apiData.managementFee.area || '',
        billingMonth: apiData.managementFee.billingMonth,
        managementFee: apiData.managementFee.managementFee,
        unitPrice: apiData.managementFee.unitPrice,
        lastBillingMonth: apiData.managementFee.lastBillingMonth || '',
        paymentMethod: apiData.managementFee.paymentMethod || '',
      }
      : undefined,
    plotInfo: {
      plotNumber: apiData.physicalPlot.plotNumber,
      section: apiData.physicalPlot.areaName,
      usage: apiData.physicalPlot.status === 'sold_out' ? 'in_use' : 'available',
      size: `${apiData.contractAreaSqm}㎡`,
      price: String(apiData.price),
      contractDate: apiData.contractDate ? new Date(apiData.contractDate) : null,
    },
    createdAt: new Date(apiData.createdAt),
    updatedAt: new Date(apiData.updatedAt),
  };
}

/**
 * フロントエンドのフォームデータをAPI用に変換
 * バックエンドの CreateContractPlotInput 形式に合わせる
 */
function customerFormToApiPayload(formData: CustomerFormData): Record<string, unknown> {
  // 面積を数値に変換（例: "3.6㎡" → 3.6）
  const parseArea = (size?: string): number => {
    if (!size) return 3.6; // デフォルト値
    const match = size.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 3.6;
  };

  // 価格を数値に変換
  const parsePrice = (price?: string): number => {
    if (!price) return 0;
    const cleaned = price.replace(/[,円]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  // 電話番号からハイフンを除去
  const formatPhone = (phone?: string): string => {
    if (!phone) return '';
    return phone.replace(/[-－ー]/g, '');
  };

  // ひらがなをカタカナに変換
  const toKatakana = (str?: string): string => {
    if (!str) return '';
    return str.replace(/[\u3041-\u3096]/g, (match) =>
      String.fromCharCode(match.charCodeAt(0) + 0x60)
    );
  };

  return {
    // 物理区画情報
    physicalPlot: {
      plotNumber: formData.plotNumber || formData.customerCode || '',
      areaName: formData.section || formData.plotPeriod || '',
      areaSqm: parseArea(formData.plotInfo?.size),
    },
    // 契約区画情報
    contractPlot: {
      contractAreaSqm: parseArea(formData.plotInfo?.size),
    },
    // 販売契約情報
    saleContract: {
      contractDate: formData.plotInfo?.contractDate || formData.reservationDate || new Date().toISOString().split('T')[0],
      price: parsePrice(formData.plotInfo?.price),
      paymentStatus: 'unpaid',
      customerRole: 'contractor',
      ...(formData.reservationDate && { reservationDate: formData.reservationDate }),
      ...(formData.acceptanceNumber && { acceptanceNumber: formData.acceptanceNumber }),
      ...(formData.permitDate && { permitDate: formData.permitDate }),
      ...(formData.startDate && { startDate: formData.startDate }),
    },
    // 顧客情報
    customer: {
      name: formData.name,
      nameKana: toKatakana(formData.nameKana),
      postalCode: (formData.postalCode || '0000000').replace(/-/g, ''),
      address: formData.address,
      phoneNumber: formatPhone(formData.phoneNumber),
      ...(formData.gender && { gender: formData.gender }),
      ...(formData.birthDate && { birthDate: formData.birthDate }),
      ...(formData.registeredAddress && { registeredAddress: formData.registeredAddress }),
      ...(formData.faxNumber && { faxNumber: formatPhone(formData.faxNumber) }),
      ...(formData.email && { email: formData.email }),
    },
    // 勤務先情報（オプション）
    workInfo: formData.workInfo?.companyName
      ? {
        companyName: formData.workInfo.companyName,
        companyNameKana: formData.workInfo.companyNameKana || '',
        workPostalCode: formData.workInfo.workPostalCode || '',
        workAddress: formData.workInfo.workAddress || '',
        workPhoneNumber: formData.workInfo.workPhoneNumber || '',
        dmSetting: formData.workInfo.dmSetting || 'allow',
        addressType: formData.workInfo.addressType || 'home',
        notes: formData.workInfo.notes || null,
      }
      : undefined,
    // 請求情報（オプション）
    billingInfo: formData.billingInfo?.billingType
      ? {
        billingType: formData.billingInfo.billingType,
        bankName: formData.billingInfo.bankName || formData.billingInfo.institutionName || '',
        branchName: formData.billingInfo.branchName || '',
        accountType: formData.billingInfo.accountType || 'ordinary',
        accountNumber: formData.billingInfo.accountNumber || '',
        accountHolder: formData.billingInfo.accountHolder || '',
      }
      : undefined,
    // 使用料情報（オプション）
    usageFee: formData.usageFee?.usageFee
      ? {
        calculationType: formData.usageFee.calculationType || '',
        taxType: formData.usageFee.taxType || '',
        usageFee: parseInt(formData.usageFee.usageFee, 10) || 0,
        area: parseFloat(formData.usageFee.area || '0') || 0,
        unitPrice: parseInt(formData.usageFee.unitPrice || '0', 10) || 0,
        paymentMethod: formData.usageFee.paymentMethod || '',
      }
      : undefined,
    // 管理料情報（オプション）
    managementFee: formData.managementFee?.managementFee
      ? {
        calculationType: formData.managementFee.calculationType || '',
        taxType: formData.managementFee.taxType || '',
        billingType: formData.managementFee.billingType || '',
        billingYears: parseInt(formData.managementFee.billingYears || '1', 10) || 1,
        area: parseFloat(formData.managementFee.area || '0') || 0,
        billingMonth: formData.managementFee.billingMonth || '',
        managementFee: parseInt(formData.managementFee.managementFee, 10) || 0,
        unitPrice: parseInt(formData.managementFee.unitPrice || '0', 10) || 0,
        lastBillingMonth: formData.managementFee.lastBillingMonth || '',
        paymentMethod: formData.managementFee.paymentMethod || '',
      }
      : undefined,
  };
}

// ===== モック実装 =====

/**
 * モック顧客一覧取得
 */
async function mockGetCustomers(
  params: CustomerSearchParams
): Promise<ApiResponse<PaginatedResponse<Customer>>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let customers = params.query
    ? searchCustomersFromMock(params.query)
    : [...mockCustomers];

  // ステータスフィルタ
  if (params.status) {
    customers = customers.filter((c) => c.status === params.status);
  }

  // セクションフィルタ
  if (params.section) {
    customers = customers.filter((c) => c.section === params.section);
  }

  // ソート
  if (params.sortBy) {
    customers.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[params.sortBy!];
      const bVal = (b as unknown as Record<string, unknown>)[params.sortBy!];
      if (aVal === bVal) return 0;
      const comparison = aVal! < bVal! ? -1 : 1;
      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // ページネーション
  const page = params.page || 1;
  const limit = params.limit || 50;
  const startIndex = (page - 1) * limit;
  const paginatedItems = customers.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      items: paginatedItems,
      total: customers.length,
      page,
      limit,
      totalPages: Math.ceil(customers.length / limit),
    },
  };
}

/**
 * モック顧客詳細取得
 */
async function mockGetCustomerByIdApi(
  id: string
): Promise<ApiResponse<Customer>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const customer = getCustomerByIdFromMock(id);
  if (!customer) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '顧客が見つかりません',
      },
    };
  }

  return {
    success: true,
    data: customer,
  };
}

/**
 * モック顧客作成
 */
async function mockCreateCustomerApi(
  formData: CustomerFormData
): Promise<ApiResponse<Customer>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const customerData = formDataToCustomer(formData);
    const newCustomer = createCustomerFromMock(customerData);
    return {
      success: true,
      data: newCustomer,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message:
          error instanceof Error ? error.message : '顧客の作成に失敗しました',
      },
    };
  }
}

/**
 * モック顧客更新
 */
async function mockUpdateCustomerApi(
  id: string,
  formData: CustomerFormData
): Promise<ApiResponse<Customer>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const customerData = formDataToCustomer(formData);
    const updatedCustomer = updateCustomerFromMock(id, customerData);
    if (!updatedCustomer) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '顧客が見つかりません',
        },
      };
    }
    return {
      success: true,
      data: updatedCustomer,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message:
          error instanceof Error ? error.message : '顧客の更新に失敗しました',
      },
    };
  }
}

/**
 * モック顧客削除
 */
async function mockDeleteCustomerApi(id: string): Promise<ApiResponse<void>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const success = deleteCustomerFromMock(id);
  if (!success) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '顧客が見つかりません',
      },
    };
  }

  return {
    success: true,
    data: undefined,
  };
}

/**
 * モック顧客解約
 */
async function mockTerminateCustomerApi(
  id: string,
  input: TerminationInput
): Promise<ApiResponse<Customer>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = terminateCustomerFromMock(id, input);
  if (!result) {
    return {
      success: false,
      error: {
        code: 'TERMINATION_FAILED',
        message: '解約処理に失敗しました',
      },
    };
  }

  return {
    success: true,
    data: result,
  };
}

// ===== 公開API =====

/**
 * バックエンドからのページネーション付きレスポンス
 */
interface ApiPaginatedResponse {
  data: ApiPlotListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 顧客一覧取得
 * サーバーサイド検索・ページネーション対応
 */
export async function getCustomers(
  params: CustomerSearchParams = {}
): Promise<ApiResponse<PaginatedResponse<Customer>>> {
  if (shouldUseMockData()) {
    return mockGetCustomers(params);
  }

  // サーバーサイド検索・ページネーション
  const response = await apiGet<ApiPaginatedResponse>('/plots', {
    page: params.page,
    limit: params.limit,
    search: params.query, // 'query' を 'search' に変換
    status: params.status,
    cemeteryType: params.section, // 'section' を 'cemeteryType' に変換
  });

  if (!response.success) {
    return response;
  }

  // サーバーのページネーション情報を使用
  const items = response.data.data.map(apiPlotListItemToCustomer);

  return {
    success: true,
    data: {
      items,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      totalPages: response.data.pagination.totalPages,
    },
  };
}

/**
 * 顧客詳細取得
 */
export async function getCustomerById(
  id: string
): Promise<ApiResponse<Customer>> {
  if (shouldUseMockData()) {
    return mockGetCustomerByIdApi(id);
  }

  const response = await apiGet<ApiPlotDetail>(`/plots/${id}`);

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotDetailToCustomer(response.data),
  };
}

/**
 * 顧客作成
 */
export async function createCustomer(
  formData: CustomerFormData
): Promise<ApiResponse<Customer>> {
  if (shouldUseMockData()) {
    return mockCreateCustomerApi(formData);
  }

  const payload = customerFormToApiPayload(formData);
  const response = await apiPost<ApiPlotDetail>('/plots', payload);

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotDetailToCustomer(response.data),
  };
}

/**
 * 顧客更新
 */
export async function updateCustomer(
  id: string,
  formData: CustomerFormData
): Promise<ApiResponse<Customer>> {
  if (shouldUseMockData()) {
    return mockUpdateCustomerApi(id, formData);
  }

  const payload = customerFormToApiPayload(formData);
  const response = await apiPut<ApiPlotDetail>(`/plots/${id}`, payload);

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotDetailToCustomer(response.data),
  };
}

/**
 * 顧客削除（論理削除）
 */
export async function deleteCustomer(id: string): Promise<ApiResponse<void>> {
  if (shouldUseMockData()) {
    return mockDeleteCustomerApi(id);
  }

  return apiDelete<void>(`/plots/${id}`);
}

/**
 * 顧客解約
 */
export async function terminateCustomer(
  id: string,
  input: TerminationInput
): Promise<ApiResponse<Customer>> {
  if (shouldUseMockData()) {
    return mockTerminateCustomerApi(id, input);
  }

  // APIでは解約も更新として処理
  const response = await apiPut<ApiPlotDetail>(`/plots/${id}`, {
    termination: {
      terminationDate: input.terminationDate.toISOString(),
      reason: input.reason,
      processType: input.processType,
      processDetail: input.processDetail,
      refundAmount: input.refundAmount,
      handledBy: input.handledBy,
      notes: input.notes,
    },
  });

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotDetailToCustomer(response.data),
  };
}

/**
 * 全顧客取得（モックデータのみ - 既存コードとの互換性用）
 */
export function getAllCustomersSync(): Customer[] {
  return [...mockCustomers];
}

/**
 * 顧客検索（モックデータのみ - 既存コードとの互換性用）
 */
export function searchCustomersSync(query: string): Customer[] {
  return searchCustomersFromMock(query);
}
