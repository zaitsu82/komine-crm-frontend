/**
 * スタッフ管理用カスタムフック
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getStaffList,
  getStaffById,
  updateStaff as apiUpdateStaff,
  deleteStaff as apiDeleteStaff,
  toggleStaffActive as apiToggleStaffActive,
  StaffListItem,
  StaffDetail,
  StaffListResponse,
  UpdateStaffRequest,
  StaffSearchParams,
  StaffRole,
} from '@/lib/api';

/**
 * スタッフ一覧フック
 */
export function useStaffList(initialParams?: StaffSearchParams) {
  const [data, setData] = useState<StaffListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<StaffSearchParams>(initialParams || {});

  const fetchStaffList = useCallback(async (searchParams?: StaffSearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStaffList(searchParams || params);

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'スタッフ一覧の取得に失敗しました');
      }
    } catch {
      setError('スタッフ一覧の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // 初回読み込み
  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // 検索パラメータを更新して再取得
  const search = useCallback((newParams: StaffSearchParams) => {
    setParams(newParams);
    fetchStaffList(newParams);
  }, [fetchStaffList]);

  // 再取得
  const refresh = useCallback(() => {
    fetchStaffList(params);
  }, [fetchStaffList, params]);

  return {
    data,
    items: data?.items || [],
    pagination: data?.pagination,
    isLoading,
    error,
    search,
    refresh,
    setParams,
  };
}

/**
 * スタッフ詳細フック
 */
export function useStaffDetail(id: number | null) {
  const [data, setData] = useState<StaffDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffDetail = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getStaffById(id);

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'スタッフ詳細の取得に失敗しました');
      }
    } catch {
      setError('スタッフ詳細の取得中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaffDetail();
  }, [fetchStaffDetail]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchStaffDetail,
  };
}

/**
 * スタッフ操作フック（CRUD）
 */
export function useStaffMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // スタッフ更新
  const updateStaff = useCallback(async (
    id: number,
    data: UpdateStaffRequest
  ): Promise<StaffDetail | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiUpdateStaff(id, data);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || 'スタッフの更新に失敗しました');
        return null;
      }
    } catch {
      setError('スタッフの更新中にエラーが発生しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // スタッフ削除
  const deleteStaff = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiDeleteStaff(id);

      if (response.success) {
        return true;
      } else {
        setError(response.error?.message || 'スタッフの削除に失敗しました');
        return false;
      }
    } catch {
      setError('スタッフの削除中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // スタッフ有効/無効切り替え
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiToggleStaffActive(id);

      if (response.success) {
        return true;
      } else {
        setError(response.error?.message || 'スタッフの状態変更に失敗しました');
        return false;
      }
    } catch {
      setError('スタッフの状態変更中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateStaff,
    deleteStaff,
    toggleActive,
    isLoading,
    error,
    clearError,
  };
}

/**
 * ロールフィルタ用ヘルパー
 */
export function filterStaffByRole(
  items: StaffListItem[],
  role: StaffRole | null
): StaffListItem[] {
  if (!role) return items;
  return items.filter((item) => item.role === role);
}

/**
 * アクティブ状態フィルタ用ヘルパー
 */
export function filterStaffByActive(
  items: StaffListItem[],
  isActive: boolean | null
): StaffListItem[] {
  if (isActive === null) return items;
  return items.filter((item) => item.isActive === isActive);
}
