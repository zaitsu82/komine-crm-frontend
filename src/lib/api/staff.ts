/**
 * スタッフ管理API
 * モックデータとリアルAPIの切り替えをサポート
 */

import { apiGet, apiPost, apiPut, apiDelete, shouldUseMockData } from './client';
import { ApiResponse } from './types';

// スタッフロール
export type StaffRole = 'viewer' | 'operator' | 'manager' | 'admin';

// スタッフ一覧アイテム
export interface StaffListItem {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// スタッフ詳細
export interface StaffDetail extends StaffListItem {
  updatedAt: string;
}

// ページネーション情報
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// スタッフ一覧レスポンス
export interface StaffListResponse {
  items: StaffListItem[];
  pagination: PaginationInfo;
}

// スタッフ作成リクエスト
export interface CreateStaffRequest {
  name: string;
  email: string;
  role: StaffRole;
}

// スタッフ更新リクエスト
export interface UpdateStaffRequest {
  name?: string;
  email?: string;
  role?: StaffRole;
  isActive?: boolean;
}

// トグルアクティブレスポンス
export interface ToggleActiveResponse {
  id: number;
  isActive: boolean;
  message: string;
}

// スタッフ検索パラメータ
export interface StaffSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
  isActive?: boolean;
}

// ロール表示名
export const ROLE_LABELS: Record<StaffRole, string> = {
  viewer: '閲覧者',
  operator: 'オペレーター',
  manager: 'マネージャー',
  admin: '管理者',
};

// モックデータ
const MOCK_STAFF: StaffDetail[] = [
  {
    id: 1,
    name: '管理者 太郎',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    lastLoginAt: '2026-01-27T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-27T10:00:00Z',
  },
  {
    id: 2,
    name: 'マネージャー 花子',
    email: 'manager@example.com',
    role: 'manager',
    isActive: true,
    lastLoginAt: '2026-01-26T15:30:00Z',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-26T15:30:00Z',
  },
  {
    id: 3,
    name: 'オペレーター 次郎',
    email: 'operator@example.com',
    role: 'operator',
    isActive: true,
    lastLoginAt: '2026-01-25T09:00:00Z',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-25T09:00:00Z',
  },
  {
    id: 4,
    name: '閲覧者 三郎',
    email: 'viewer@example.com',
    role: 'viewer',
    isActive: false,
    lastLoginAt: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
];

/**
 * モック: スタッフ一覧取得
 */
async function mockGetStaffList(params?: StaffSearchParams): Promise<ApiResponse<StaffListResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredStaff = [...MOCK_STAFF];

  // ロールでフィルタ
  if (params?.role) {
    filteredStaff = filteredStaff.filter((s) => s.role === params.role);
  }

  // 有効/無効でフィルタ
  if (params?.isActive !== undefined) {
    filteredStaff = filteredStaff.filter((s) => s.isActive === params.isActive);
  }

  // 検索キーワードでフィルタ
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredStaff = filteredStaff.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower)
    );
  }

  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const total = filteredStaff.length;
  const start = (page - 1) * limit;
  const items = filteredStaff.slice(start, start + limit);

  return {
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
}

/**
 * モック: スタッフ詳細取得
 */
async function mockGetStaffById(id: number): Promise<ApiResponse<StaffDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const staff = MOCK_STAFF.find((s) => s.id === id);

  if (!staff) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'スタッフが見つかりません',
      },
    };
  }

  return {
    success: true,
    data: staff,
  };
}

/**
 * モック: スタッフ作成
 */
async function mockCreateStaff(
  data: CreateStaffRequest
): Promise<ApiResponse<StaffDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // メールアドレスの重複チェック
  const existing = MOCK_STAFF.find((s) => s.email === data.email);
  if (existing) {
    return {
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'このメールアドレスは既に使用されています',
      },
    };
  }

  // 新規スタッフ作成
  const newId = Math.max(...MOCK_STAFF.map((s) => s.id)) + 1;
  const now = new Date().toISOString();
  const newStaff: StaffDetail = {
    id: newId,
    name: data.name,
    email: data.email,
    role: data.role,
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  MOCK_STAFF.push(newStaff);

  return {
    success: true,
    data: newStaff,
  };
}

/**
 * モック: スタッフ更新
 */
async function mockUpdateStaff(
  id: number,
  data: UpdateStaffRequest
): Promise<ApiResponse<StaffDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const staffIndex = MOCK_STAFF.findIndex((s) => s.id === id);

  if (staffIndex === -1) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'スタッフが見つかりません',
      },
    };
  }

  // 更新
  const updatedStaff = {
    ...MOCK_STAFF[staffIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  MOCK_STAFF[staffIndex] = updatedStaff;

  return {
    success: true,
    data: updatedStaff,
  };
}

/**
 * モック: スタッフ削除
 */
async function mockDeleteStaff(id: number): Promise<ApiResponse<{ message: string }>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const staffIndex = MOCK_STAFF.findIndex((s) => s.id === id);

  if (staffIndex === -1) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'スタッフが見つかりません',
      },
    };
  }

  // 論理削除（配列から削除）
  MOCK_STAFF.splice(staffIndex, 1);

  return {
    success: true,
    data: { message: 'スタッフを削除しました' },
  };
}

/**
 * モック: スタッフ有効/無効切り替え
 */
async function mockToggleStaffActive(id: number): Promise<ApiResponse<ToggleActiveResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const staffIndex = MOCK_STAFF.findIndex((s) => s.id === id);

  if (staffIndex === -1) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'スタッフが見つかりません',
      },
    };
  }

  // 切り替え
  MOCK_STAFF[staffIndex].isActive = !MOCK_STAFF[staffIndex].isActive;
  MOCK_STAFF[staffIndex].updatedAt = new Date().toISOString();

  return {
    success: true,
    data: {
      id,
      isActive: MOCK_STAFF[staffIndex].isActive,
      message: MOCK_STAFF[staffIndex].isActive
        ? 'スタッフを有効化しました'
        : 'スタッフを無効化しました',
    },
  };
}

// ===== 公開API =====

/**
 * スタッフ一覧取得
 */
export async function getStaffList(
  params?: StaffSearchParams
): Promise<ApiResponse<StaffListResponse>> {
  if (shouldUseMockData()) {
    return mockGetStaffList(params);
  }

  const queryParams: Record<string, string | number | undefined> = {
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    role: params?.role,
    isActive: params?.isActive !== undefined ? String(params.isActive) : undefined,
  };

  return apiGet<StaffListResponse>('/staff', queryParams);
}

/**
 * スタッフ作成
 */
export async function createStaff(
  data: CreateStaffRequest
): Promise<ApiResponse<StaffDetail>> {
  if (shouldUseMockData()) {
    return mockCreateStaff(data);
  }

  return apiPost<StaffDetail>('/staff', data);
}

/**
 * スタッフ詳細取得
 */
export async function getStaffById(id: number): Promise<ApiResponse<StaffDetail>> {
  if (shouldUseMockData()) {
    return mockGetStaffById(id);
  }

  return apiGet<StaffDetail>(`/staff/${id}`);
}

/**
 * スタッフ更新
 */
export async function updateStaff(
  id: number,
  data: UpdateStaffRequest
): Promise<ApiResponse<StaffDetail>> {
  if (shouldUseMockData()) {
    return mockUpdateStaff(id, data);
  }

  return apiPut<StaffDetail>(`/staff/${id}`, data);
}

/**
 * スタッフ削除
 */
export async function deleteStaff(id: number): Promise<ApiResponse<{ message: string }>> {
  if (shouldUseMockData()) {
    return mockDeleteStaff(id);
  }

  return apiDelete<{ message: string }>(`/staff/${id}`);
}

/**
 * スタッフ有効/無効切り替え
 */
export async function toggleStaffActive(id: number): Promise<ApiResponse<ToggleActiveResponse>> {
  if (shouldUseMockData()) {
    return mockToggleStaffActive(id);
  }

  return apiPut<ToggleActiveResponse>(`/staff/${id}/toggle-active`);
}
