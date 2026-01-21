'use client';

import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { CustomerFormData } from '@/lib/validations';
import {
  getCustomers,
  getCustomerById,
  createCustomer as apiCreateCustomer,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  terminateCustomer as apiTerminateCustomer,
  CustomerSearchParams,
  PaginatedResponse,
} from '@/lib/api';
import { TerminationInput } from '@/lib/data';

// 顧客一覧の状態型
interface CustomersState {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

// 顧客詳細の状態型
interface CustomerDetailState {
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
}

// 操作結果の型
interface OperationResult {
  success: boolean;
  error?: string;
}

/**
 * 顧客一覧管理フック
 */
export function useCustomers(initialParams?: CustomerSearchParams) {
  const [state, setState] = useState<CustomersState>({
    customers: [],
    total: 0,
    page: 1,
    totalPages: 0,
    isLoading: true,
    error: null,
  });

  const [params, setParams] = useState<CustomerSearchParams>(
    initialParams || {}
  );

  // 顧客一覧を取得
  const fetchCustomers = useCallback(async (searchParams: CustomerSearchParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await getCustomers(searchParams);

    if (response.success) {
      const data = response.data as PaginatedResponse<Customer>;
      setState({
        customers: data.items,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
        error: null,
      });
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error.message,
      }));
    }
  }, []);

  // パラメータ変更時に再取得
  useEffect(() => {
    fetchCustomers(params);
  }, [params, fetchCustomers]);

  // 検索
  const search = useCallback((query: string) => {
    setParams((prev) => ({ ...prev, query, page: 1 }));
  }, []);

  // ページ変更
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  // フィルタ変更
  const setFilter = useCallback(
    (filter: Partial<CustomerSearchParams>) => {
      setParams((prev) => ({ ...prev, ...filter, page: 1 }));
    },
    []
  );

  // リフレッシュ
  const refresh = useCallback(() => {
    fetchCustomers(params);
  }, [fetchCustomers, params]);

  // 顧客作成
  const createCustomer = useCallback(
    async (formData: CustomerFormData): Promise<OperationResult> => {
      const response = await apiCreateCustomer(formData);

      if (response.success) {
        refresh();
        return { success: true };
      }

      return { success: false, error: response.error.message };
    },
    [refresh]
  );

  // 顧客更新
  const updateCustomer = useCallback(
    async (id: string, formData: CustomerFormData): Promise<OperationResult> => {
      const response = await apiUpdateCustomer(id, formData);

      if (response.success) {
        refresh();
        return { success: true };
      }

      return { success: false, error: response.error.message };
    },
    [refresh]
  );

  // 顧客削除
  const deleteCustomer = useCallback(
    async (id: string): Promise<OperationResult> => {
      const response = await apiDeleteCustomer(id);

      if (response.success) {
        refresh();
        return { success: true };
      }

      return { success: false, error: response.error.message };
    },
    [refresh]
  );

  // 顧客解約
  const terminateCustomer = useCallback(
    async (id: string, input: TerminationInput): Promise<OperationResult> => {
      const response = await apiTerminateCustomer(id, input);

      if (response.success) {
        refresh();
        return { success: true };
      }

      return { success: false, error: response.error.message };
    },
    [refresh]
  );

  return {
    ...state,
    params,
    search,
    setPage,
    setFilter,
    refresh,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    terminateCustomer,
  };
}

/**
 * 顧客詳細管理フック
 */
export function useCustomerDetail(id: string | null) {
  const [state, setState] = useState<CustomerDetailState>({
    customer: null,
    isLoading: false,
    error: null,
  });

  // 顧客詳細を取得
  const fetchCustomer = useCallback(async (customerId: string) => {
    setState({ customer: null, isLoading: true, error: null });

    const response = await getCustomerById(customerId);

    if (response.success) {
      setState({
        customer: response.data,
        isLoading: false,
        error: null,
      });
    } else {
      setState({
        customer: null,
        isLoading: false,
        error: response.error.message,
      });
    }
  }, []);

  // IDが変更されたら再取得
  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    } else {
      setState({ customer: null, isLoading: false, error: null });
    }
  }, [id, fetchCustomer]);

  // リフレッシュ
  const refresh = useCallback(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id, fetchCustomer]);

  // 顧客更新
  const updateCustomer = useCallback(
    async (formData: CustomerFormData): Promise<OperationResult> => {
      if (!id) {
        return { success: false, error: '顧客IDがありません' };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await apiUpdateCustomer(id, formData);

      if (response.success) {
        setState({
          customer: response.data,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error.message,
      }));
      return { success: false, error: response.error.message };
    },
    [id]
  );

  // 顧客削除
  const deleteCustomer = useCallback(async (): Promise<OperationResult> => {
    if (!id) {
      return { success: false, error: '顧客IDがありません' };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await apiDeleteCustomer(id);

    if (response.success) {
      setState({
        customer: null,
        isLoading: false,
        error: null,
      });
      return { success: true };
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: response.error.message,
    }));
    return { success: false, error: response.error.message };
  }, [id]);

  // 顧客解約
  const terminateCustomer = useCallback(
    async (input: TerminationInput): Promise<OperationResult> => {
      if (!id) {
        return { success: false, error: '顧客IDがありません' };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await apiTerminateCustomer(id, input);

      if (response.success) {
        setState({
          customer: response.data,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error.message,
      }));
      return { success: false, error: response.error.message };
    },
    [id]
  );

  return {
    ...state,
    refresh,
    updateCustomer,
    deleteCustomer,
    terminateCustomer,
  };
}

/**
 * 顧客作成フック
 */
export function useCreateCustomer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(
    async (formData: CustomerFormData): Promise<Customer | null> => {
      setIsLoading(true);
      setError(null);

      const response = await apiCreateCustomer(formData);

      setIsLoading(false);

      if (response.success) {
        return response.data;
      }

      setError(response.error.message);
      return null;
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createCustomer,
    isLoading,
    error,
    clearError,
  };
}
