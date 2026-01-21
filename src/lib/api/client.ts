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
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
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
