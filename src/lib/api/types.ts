/**
 * API統合レイヤーの型定義
 */

// APIレスポンスの基本型
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ページネーション
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 認証関連
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'viewer' | 'operator' | 'manager' | 'admin';
  isActive: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 顧客/区画検索
export interface CustomerSearchParams extends PaginationParams {
  query?: string;
  status?: string;
  section?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// バックエンドの区画データ型（API応答形式）
export interface ApiPlotData {
  id: string;
  physicalPlotId: string;
  contractedArea: number;
  contractDate: string | null;
  effectiveStartDate: string | null;
  effectiveEndDate: string | null;
  usageStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  physicalPlot: {
    id: string;
    plotNumber: string;
    section: string;
    area: number;
    baseCapacity: number;
    allowGoushi: boolean;
    basePrice: number;
    currentStatus: string;
  };

  saleContract: {
    id: string;
    contractCode: string;
    acceptanceNumber: string | null;
    permitDate: string | null;
    contractDate: string | null;

    customer: {
      id: string;
      name: string;
      nameKana: string;
      gender: string | null;
      birthDate: string | null;
      postalCode: string | null;
      address: string | null;
      phoneNumber: string | null;
      faxNumber: string | null;
      email: string | null;
    };
  };

  usageFee?: {
    calculationType: string;
    taxType: string;
    billingType: string;
    billingYears: number | null;
    area: string | null;
    unitPrice: number | null;
    usageFee: number | null;
    paymentMethod: string | null;
  };

  managementFee?: {
    calculationType: string;
    taxType: string;
    billingType: string;
    billingYears: number | null;
    area: string | null;
    billingMonth: number | null;
    managementFee: number | null;
    unitPrice: number | null;
    lastBillingMonth: string | null;
    paymentMethod: string | null;
  };
}

// マスタデータ
export interface MasterDataItem {
  code: string;
  name: string;
}

export interface AllMasterData {
  cemeteryTypes: MasterDataItem[];
  paymentMethods: MasterDataItem[];
  taxTypes: MasterDataItem[];
  calculationTypes: MasterDataItem[];
  billingTypes: MasterDataItem[];
  accountTypes: MasterDataItem[];
  recipientTypes: MasterDataItem[];
  constructionTypes: MasterDataItem[];
}
