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
  setRefreshToken,
  getRefreshToken,
  clearAllTokens,
  setTokenExpiresAt,
  setTokenRefreshCallback,
  API_CONFIG,
} from './client';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  BackendLoginResponse,
  BackendCurrentUserResponse,
  AuthUser,
  ChangePasswordRequest,
} from './types';

// モック認証データ
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 1,
    email: 'admin@komine-cemetery.jp',
    password: 'admin123',
    name: '管理者 太郎',
    role: 'admin',
    isActive: true,
  },
  {
    id: 2,
    email: 'manager@komine-cemetery.jp',
    password: 'manager123',
    name: 'マネージャー 花子',
    role: 'manager',
    isActive: true,
  },
  {
    id: 3,
    email: 'operator@komine-cemetery.jp',
    password: 'operator123',
    name: 'オペレーター 次郎',
    role: 'operator',
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
 * バックエンドレスポンスをフロントエンド形式に変換
 */
function transformBackendLoginResponse(
  backendResponse: BackendLoginResponse
): LoginResponse {
  return {
    token: backendResponse.session.access_token,
    user: {
      id: backendResponse.user.id,
      email: backendResponse.user.email,
      name: backendResponse.user.name,
      role: backendResponse.user.role,
      isActive: true, // バックエンドはログイン成功時点で active
    },
  };
}

/**
 * ログイン
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  if (shouldUseMockData()) {
    return mockLogin(credentials);
  }

  const response = await apiPost<BackendLoginResponse>('/auth/login', credentials);

  if (response.success) {
    // バックエンドレスポンスをフロントエンド形式に変換
    const transformedData = transformBackendLoginResponse(response.data);

    // トークンを保存
    setAuthToken(transformedData.token);

    // リフレッシュトークンと有効期限を保存
    if (response.data.session.refresh_token) {
      setRefreshToken(response.data.session.refresh_token);
    }
    if (response.data.session.expires_at) {
      setTokenExpiresAt(response.data.session.expires_at);
    }

    return {
      success: true,
      data: transformedData,
    };
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
  clearAllTokens(); // 全てのトークン関連データをクリア
  return response;
}

/**
 * バックエンド現在ユーザーレスポンスをフロントエンド形式に変換
 */
function transformBackendCurrentUserResponse(
  backendResponse: BackendCurrentUserResponse
): AuthUser {
  return {
    id: backendResponse.user.id,
    email: backendResponse.user.email,
    name: backendResponse.user.name,
    role: backendResponse.user.role,
    isActive: backendResponse.user.is_active,
  };
}

/**
 * 現在のユーザー情報取得
 */
export async function getCurrentUser(): Promise<ApiResponse<AuthUser>> {
  if (shouldUseMockData()) {
    return mockGetCurrentUser();
  }

  const response = await apiGet<BackendCurrentUserResponse>('/auth/me');

  if (response.success) {
    return {
      success: true,
      data: transformBackendCurrentUserResponse(response.data),
    };
  }

  return response;
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

/**
 * アクセストークンをリフレッシュ
 * @returns リフレッシュ成功時true、失敗時false
 */
export async function refreshAccessToken(): Promise<boolean> {
  // モックモードではリフレッシュ非対応
  if (shouldUseMockData()) {
    return false;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn('[Auth] No refresh token available');
    return false;
  }

  try {
    const url = `${API_CONFIG.baseUrl}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      console.error('[Auth] Token refresh failed:', response.status);
      // リフレッシュ失敗時は全てのトークンをクリア
      clearAllTokens();
      return false;
    }

    const data = await response.json();

    if (data.success && data.data?.session) {
      // 新しいトークンを保存
      setAuthToken(data.data.session.access_token);
      if (data.data.session.refresh_token) {
        setRefreshToken(data.data.session.refresh_token);
      }
      if (data.data.session.expires_at) {
        setTokenExpiresAt(data.data.session.expires_at);
      }
      console.log('[Auth] Token refreshed successfully');
      return true;
    }

    console.error('[Auth] Token refresh response invalid:', data);
    clearAllTokens();
    return false;
  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    clearAllTokens();
    return false;
  }
}

/**
 * トークンリフレッシュコールバックを初期化
 * アプリケーション起動時に呼び出す
 */
export function initializeTokenRefresh(): void {
  setTokenRefreshCallback(refreshAccessToken);
}

// モジュール読み込み時に自動初期化
initializeTokenRefresh();
