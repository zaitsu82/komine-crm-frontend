/**
 * APIクライアント
 * 環境変数に基づいてモックデータとリアルAPIを切り替える
 */

import { ApiResponse, ApiErrorResponse } from './types';

// 環境設定
export const API_CONFIG = {
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
};

// トークン管理
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at';

// トークン更新中フラグ（複数リクエストでの重複更新を防ぐ）
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// トークン更新コールバック（auth.tsで設定される）
let onTokenRefresh: (() => Promise<boolean>) | null = null;

export function setTokenRefreshCallback(callback: () => Promise<boolean>): void {
  onTokenRefresh = callback;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getTokenExpiresAt(): number | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  return value ? parseInt(value, 10) : null;
}

export function setTokenExpiresAt(expiresAt: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
}

export function clearTokenExpiresAt(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
}

/**
 * 全てのトークン関連データをクリア
 */
export function clearAllTokens(): void {
  clearAuthToken();
  clearRefreshToken();
  clearTokenExpiresAt();
}

/**
 * トークンが期限切れ間近かどうかをチェック
 * @param thresholdMinutes 期限切れまでの閾値（分）、デフォルト5分
 */
export function isTokenExpiringSoon(thresholdMinutes = 5): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  const threshold = thresholdMinutes * 60;
  return expiresAt - now < threshold;
}

/**
 * トークンが既に期限切れかどうかをチェック
 */
export function isTokenExpired(): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt;
}

/**
 * トークンをリフレッシュ（重複防止付き）
 */
async function refreshTokenIfNeeded(): Promise<boolean> {
  if (!onTokenRefresh) return false;

  // 既にリフレッシュ中の場合は同じPromiseを返す
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = onTokenRefresh()
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// デバッグログ
function debugLog(message: string, data?: unknown): void {
  if (API_CONFIG.debug) {
    console.log(`[API] ${message}`, data ?? '');
  }
}

// エラーログ
function errorLog(message: string, error?: unknown): void {
  console.error(`[API Error] ${message}`, error ?? '');
}

/**
 * 汎用APIリクエスト関数
 * 401エラー時は自動的にトークンリフレッシュを試行
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  skipTokenRefresh = false
): Promise<ApiResponse<T>> {
  // リクエスト前にトークンが期限切れ間近かチェック（認証が必要なエンドポイントのみ）
  const isAuthEndpoint = endpoint.includes('/auth/');
  if (!isAuthEndpoint && !skipTokenRefresh && isTokenExpiringSoon()) {
    debugLog('Token is expiring soon, attempting refresh');
    await refreshTokenIfNeeded();
  }

  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  debugLog(`Request: ${options.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 401エラーの場合、トークンリフレッシュを試行
    if (response.status === 401 && !isAuthEndpoint && !skipTokenRefresh) {
      debugLog('Received 401, attempting token refresh');
      const refreshed = await refreshTokenIfNeeded();

      if (refreshed) {
        debugLog('Token refreshed, retrying request');
        // リフレッシュ成功時はリクエストを再試行（無限ループ防止のためskipTokenRefresh=true）
        return apiRequest<T>(endpoint, options, true);
      } else {
        debugLog('Token refresh failed, returning 401 error');
        // リフレッシュ失敗時は認証エラーを返す
        return {
          success: false,
          error: {
            code: 'AUTH_EXPIRED',
            message: '認証の有効期限が切れました。再度ログインしてください。',
          },
        };
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: data.error?.code || `HTTP_${response.status}`,
          message: data.error?.message || `HTTP Error: ${response.status}`,
          details: data.error?.details,
        },
      };
      debugLog(`Response Error: ${response.status}`, errorResponse);
      return errorResponse;
    }

    debugLog(`Response Success: ${response.status}`, data);
    return data as ApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      errorLog('Request timeout', { endpoint, timeout: API_CONFIG.timeout });
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'リクエストがタイムアウトしました',
        },
      };
    }

    errorLog('Request failed', error);
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
 * GETリクエスト
 */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<T>(url, { method: 'GET' });
}

/**
 * POSTリクエスト
 */
export async function apiPost<T>(
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUTリクエスト
 */
export async function apiPut<T>(
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETEリクエスト
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * モックデータを使用するかどうかを判定
 */
export function shouldUseMockData(): boolean {
  return API_CONFIG.useMockData;
}
