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
  ApiPlotData,
} from './types';

// ===== データ変換関数 =====

/**
 * APIレスポンスをフロントエンドの顧客型に変換
 */
function apiPlotToCustomer(apiData: ApiPlotData): Customer {
  const customer = apiData.saleContract.customer;
  const physicalPlot = apiData.physicalPlot;

  return {
    id: apiData.id,
    customerCode: apiData.saleContract.contractCode,
    plotNumber: physicalPlot.plotNumber,
    section: physicalPlot.section,
    reservationDate: apiData.contractDate ? new Date(apiData.contractDate) : null,
    acceptanceNumber: apiData.saleContract.acceptanceNumber || undefined,
    permitDate: apiData.saleContract.permitDate
      ? new Date(apiData.saleContract.permitDate)
      : null,
    startDate: apiData.effectiveStartDate
      ? new Date(apiData.effectiveStartDate)
      : null,
    name: customer.name,
    nameKana: customer.nameKana,
    birthDate: customer.birthDate ? new Date(customer.birthDate) : null,
    gender: customer.gender as 'male' | 'female' | undefined,
    phoneNumber: customer.phoneNumber || '',
    faxNumber: customer.faxNumber || undefined,
    email: customer.email || undefined,
    address: customer.address || '',
    postalCode: customer.postalCode || undefined,
    status: apiData.deletedAt ? 'inactive' : 'active',
    usageFee: apiData.usageFee
      ? {
        calculationType: apiData.usageFee.calculationType,
        taxType: apiData.usageFee.taxType,
        billingType: apiData.usageFee.billingType,
        billingYears: apiData.usageFee.billingYears,
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
      plotNumber: physicalPlot.plotNumber,
      section: physicalPlot.section,
      usage: apiData.usageStatus as 'in_use' | 'available' | 'reserved',
      size: `${apiData.contractedArea}㎡`,
      price: String(physicalPlot.basePrice),
      contractDate: apiData.contractDate ? new Date(apiData.contractDate) : null,
    },
    createdAt: new Date(apiData.createdAt),
    updatedAt: new Date(apiData.updatedAt),
  };
}

/**
 * フロントエンドのフォームデータをAPI用に変換
 */
function customerFormToApiPayload(formData: CustomerFormData): Record<string, unknown> {
  return {
    physicalPlot: {
      plotNumber: formData.plotNumber || '',
      section: formData.section || '',
    },
    contractPlot: {
      contractDate: formData.reservationDate || null,
      effectiveStartDate: formData.startDate || null,
    },
    saleContract: {
      contractCode: formData.customerCode,
      acceptanceNumber: formData.acceptanceNumber || null,
      permitDate: formData.permitDate || null,
    },
    customer: {
      name: formData.name,
      nameKana: formData.nameKana,
      gender: formData.gender || null,
      birthDate: formData.birthDate || null,
      postalCode: formData.postalCode || null,
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      faxNumber: formData.faxNumber || null,
      email: formData.email || null,
    },
    usageFee: formData.usageFee
      ? {
        calculationType: formData.usageFee.calculationType,
        taxType: formData.usageFee.taxType,
        billingType: formData.usageFee.billingType,
        billingYears: formData.usageFee.billingYears
          ? parseInt(formData.usageFee.billingYears, 10)
          : null,
        area: formData.usageFee.area,
        unitPrice: formData.usageFee.unitPrice
          ? parseInt(formData.usageFee.unitPrice, 10)
          : null,
        usageFee: formData.usageFee.usageFee
          ? parseInt(formData.usageFee.usageFee, 10)
          : null,
        paymentMethod: formData.usageFee.paymentMethod,
      }
      : undefined,
    managementFee: formData.managementFee
      ? {
        calculationType: formData.managementFee.calculationType,
        taxType: formData.managementFee.taxType,
        billingType: formData.managementFee.billingType,
        billingYears: formData.managementFee.billingYears
          ? parseInt(formData.managementFee.billingYears, 10)
          : null,
        area: formData.managementFee.area,
        billingMonth: formData.managementFee.billingMonth
          ? parseInt(formData.managementFee.billingMonth, 10)
          : null,
        managementFee: formData.managementFee.managementFee
          ? parseInt(formData.managementFee.managementFee, 10)
          : null,
        unitPrice: formData.managementFee.unitPrice
          ? parseInt(formData.managementFee.unitPrice, 10)
          : null,
        lastBillingMonth: formData.managementFee.lastBillingMonth,
        paymentMethod: formData.managementFee.paymentMethod,
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
 * 顧客一覧取得
 */
export async function getCustomers(
  params: CustomerSearchParams = {}
): Promise<ApiResponse<PaginatedResponse<Customer>>> {
  if (shouldUseMockData()) {
    return mockGetCustomers(params);
  }

  const response = await apiGet<PaginatedResponse<ApiPlotData>>('/plots', {
    page: params.page,
    limit: params.limit,
    query: params.query,
    status: params.status,
    section: params.section,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: {
      ...response.data,
      items: response.data.items.map(apiPlotToCustomer),
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

  const response = await apiGet<ApiPlotData>(`/plots/${id}`);

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotToCustomer(response.data),
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
  const response = await apiPost<ApiPlotData>('/plots', payload);

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotToCustomer(response.data),
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
  const response = await apiPut<ApiPlotData>(`/plots/${id}`, payload);

  if (!response.success) {
    return response;
  }

  return {
    success: true,
    data: apiPlotToCustomer(response.data),
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
  const response = await apiPut<ApiPlotData>(`/plots/${id}`, {
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
    data: apiPlotToCustomer(response.data),
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
