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

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// 認証関連
export interface LoginRequest {
  email: string;
  password: string;
}

// フロントエンド内部で使用するログインレスポンス形式
export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// バックエンドから返されるログインレスポンス形式
export interface BackendLoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'viewer' | 'operator' | 'manager' | 'admin';
    supabase_uid: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'viewer' | 'operator' | 'manager' | 'admin';
  isActive: boolean;
}

// バックエンドから返される現在ユーザーレスポンス形式
export interface BackendCurrentUserResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'viewer' | 'operator' | 'manager' | 'admin';
    is_active: boolean;
    supabase_uid: string;
    created_at: string;
    updated_at: string;
    last_login_at: string | null;
  };
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

// バックエンドの区画一覧データ型（GET /plots 応答形式）
export interface ApiPlotListItem {
  id: string;
  contractAreaSqm: number;
  locationDescription: string | null;
  plotNumber: string;
  areaName: string;
  physicalPlotAreaSqm: number;
  physicalPlotStatus: string;
  contractDate: string | null;
  price: number;
  paymentStatus: string;
  customerName: string | null;
  customerNameKana: string | null;
  customerPhoneNumber: string | null;
  customerAddress: string | null;
  customerRole: string | null;
  roles: Array<{
    role: string;
    customer: {
      id: string;
      name: string;
    };
  }>;
  nextBillingDate: string | null;
  managementFee: number | null;
  createdAt: string;
  updatedAt: string;
}

// バックエンドの区画詳細データ型（GET /plots/:id 応答形式）
export interface ApiPlotDetail {
  id: string;
  contractAreaSqm: number;
  locationDescription: string | null;
  createdAt: string;
  updatedAt: string;

  physicalPlot: {
    id: string;
    plotNumber: string;
    areaName: string;
    areaSqm: number;
    status: string;
    notes: string | null;
  };

  contractDate: string | null;
  price: number;
  paymentStatus: string;
  reservationDate: string | null;
  acceptanceNumber: string | null;
  permitDate: string | null;
  startDate: string | null;
  contractNotes: string | null;

  primaryCustomer?: {
    id: string;
    name: string;
    nameKana: string;
    gender: string | null;
    birthDate: string | null;
    phoneNumber: string | null;
    faxNumber: string | null;
    email: string | null;
    postalCode: string | null;
    address: string | null;
    registeredAddress: string | null;
    notes: string | null;
    role: string;
    workInfo: {
      companyName: string | null;
      companyNameKana: string | null;
      workAddress: string | null;
      workPostalCode: string | null;
      workPhoneNumber: string | null;
      dmSetting: string | null;
      addressType: string | null;
      notes: string | null;
    } | null;
    billingInfo: {
      billingType: string | null;
      bankName: string | null;
      branchName: string | null;
      accountType: string | null;
      accountNumber: string | null;
      accountHolder: string | null;
    } | null;
  };

  roles: Array<{
    id: string;
    role: string;
    roleStartDate: string | null;
    roleEndDate: string | null;
    notes: string | null;
    customer: {
      id: string;
      name: string;
      nameKana: string;
      gender: string | null;
      birthDate: string | null;
      phoneNumber: string | null;
      faxNumber: string | null;
      email: string | null;
      postalCode: string | null;
      address: string | null;
      registeredAddress: string | null;
      notes: string | null;
      workInfo: {
        companyName: string | null;
        companyNameKana: string | null;
        workAddress: string | null;
        workPostalCode: string | null;
        workPhoneNumber: string | null;
        dmSetting: string | null;
        addressType: string | null;
        notes: string | null;
      } | null;
      billingInfo: {
        billingType: string | null;
        bankName: string | null;
        branchName: string | null;
        accountType: string | null;
        accountNumber: string | null;
        accountHolder: string | null;
      } | null;
    };
  }>;

  usageFee?: {
    calculationType: string;
    taxType: string;
    usageFee: number | null;
    area: string | null;
    unitPrice: number | null;
    paymentMethod: string | null;
  } | null;

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
  } | null;

  buriedPersons: Array<{
    id: string;
    name: string;
    nameKana: string | null;
    relationship: string | null;
    deathDate: string | null;
    age: number | null;
    gender: string | null;
    burialDate: string | null;
    notes: string | null;
  }>;

  familyContacts: Array<{
    id: string;
    name: string;
    birthDate: string | null;
    relationship: string | null;
    address: string | null;
    phoneNumber: string | null;
    faxNumber: string | null;
    email: string | null;
    registeredAddress: string | null;
    mailingType: string | null;
    companyName: string | null;
    companyNameKana: string | null;
    companyAddress: string | null;
    companyPhone: string | null;
    notes: string | null;
  }>;

  gravestoneInfo?: {
    gravestoneBase: string | null;
    enclosurePosition: string | null;
    gravestoneDealer: string | null;
    gravestoneType: string | null;
    surroundingArea: string | null;
    establishmentDeadline: string | null;
    establishmentDate: string | null;
  } | null;

  collectiveBurial?: {
    id: string;
    burialCapacity: number | null;
    currentBurialCount: number | null;
    capacityReachedDate: string | null;
    validityPeriodYears: number | null;
    billingScheduledDate: string | null;
    billingStatus: string | null;
    billingAmount: number | null;
    notes: string | null;
  } | null;
}

// 後方互換性のための旧型定義（非推奨）
/** @deprecated Use ApiPlotListItem or ApiPlotDetail instead */
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
