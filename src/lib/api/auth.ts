/**
 * 認証API
 * モックデータとリアルAPIの切り替えをサポート
 */

import {
  apiPost,
  apiGet,
  apiPut,
  shouldUseMockData,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from './client';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  AuthUser,
  ChangePasswordRequest,
} from './types';

// モック認証データ
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    name: '管理者',
    role: 'admin',
    isActive: true,
  },
  {
    id: 2,
    email: 'operator@example.com',
    password: 'operator123',
    name: '操作者',
    role: 'operator',
    isActive: true,
  },
  {
    id: 3,
    email: 'viewer@example.com',
    password: 'viewer123',
    name: '閲覧者',
    role: 'viewer',
    isActive: true,
  },
];

let mockCurrentUser: AuthUser | null = null;

/**
 * モックログイン
 */
async function mockLogin(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  // 遅延をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (!user) {
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'メールアドレスまたはパスワードが正しくありません',
      },
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      error: {
        code: 'USER_INACTIVE',
        message: 'このアカウントは無効です',
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  mockCurrentUser = userWithoutPassword;

  const mockToken = `mock_token_${user.id}_${Date.now()}`;
  setAuthToken(mockToken);

  return {
    success: true,
    data: {
      token: mockToken,
      user: userWithoutPassword,
    },
  };
}

/**
 * モックログアウト
 */
async function mockLogout(): Promise<ApiResponse<void>> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  mockCurrentUser = null;
  clearAuthToken();
  return { success: true, data: undefined };
}

/**
 * モック現在ユーザー取得
 */
async function mockGetCurrentUser(): Promise<ApiResponse<AuthUser>> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const token = getAuthToken();
  if (!token || !mockCurrentUser) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
      },
    };
  }

  return {
    success: true,
    data: mockCurrentUser,
  };
}

/**
 * モックパスワード変更
 */
async function mockChangePassword(
  request: ChangePasswordRequest
): Promise<ApiResponse<void>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!mockCurrentUser) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
      },
    };
  }

  const user = MOCK_USERS.find((u) => u.id === mockCurrentUser!.id);
  if (!user || user.password !== request.currentPassword) {
    return {
      success: false,
      error: {
        code: 'INVALID_PASSWORD',
        message: '現在のパスワードが正しくありません',
      },
    };
  }

  // パスワード更新（モック）
  user.password = request.newPassword;

  return { success: true, data: undefined };
}

// ===== 公開API =====

/**
 * ログイン
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  if (shouldUseMockData()) {
    return mockLogin(credentials);
  }

  const response = await apiPost<LoginResponse>('/auth/login', credentials);

  if (response.success) {
    setAuthToken(response.data.token);
  }

  return response;
}

/**
 * ログアウト
 */
export async function logout(): Promise<ApiResponse<void>> {
  if (shouldUseMockData()) {
    return mockLogout();
  }

  const response = await apiPost<void>('/auth/logout');
  clearAuthToken();
  return response;
}

/**
 * 現在のユーザー情報取得
 */
export async function getCurrentUser(): Promise<ApiResponse<AuthUser>> {
  if (shouldUseMockData()) {
    return mockGetCurrentUser();
  }

  return apiGet<AuthUser>('/auth/me');
}

/**
 * パスワード変更
 */
export async function changePassword(
  request: ChangePasswordRequest
): Promise<ApiResponse<void>> {
  if (shouldUseMockData()) {
    return mockChangePassword(request);
  }

  return apiPut<void>('/auth/password', request);
}

/**
 * 認証状態をチェック
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * モックユーザーを設定（テスト用）
 */
export function setMockCurrentUser(user: AuthUser | null): void {
  if (shouldUseMockData()) {
    mockCurrentUser = user;
  }
}
