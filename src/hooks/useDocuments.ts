/**
 * 書類管理用カスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import {
  DocumentListItem,
  DocumentDetail,
  DocumentSearchParams,
  DocumentListResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  GeneratePdfRequest,
  GeneratePdfResponse,
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  getDocumentDownloadUrl,
  generatePdf,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
} from '@/lib/api/documents';

// 一覧取得パラメータ型
interface DocumentListParams extends DocumentSearchParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
}

// 型のエクスポート
export type { DocumentListItem, DocumentDetail, CreateDocumentRequest, UpdateDocumentRequest, GeneratePdfRequest };
export { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_COLORS };

// 一覧取得フック
export function useDocumentList(initialParams?: Partial<DocumentListParams>) {
  const [data, setData] = useState<DocumentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<DocumentListParams>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialParams,
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDocuments(params);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPage = useCallback((page: number) => {
    setParams((prev: DocumentListParams) => ({ ...prev, page }));
  }, []);

  const setFilters = useCallback((filters: Partial<DocumentListParams>) => {
    setParams((prev: DocumentListParams) => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    params,
    setPage,
    setFilters,
    refresh,
  };
}

// 詳細取得フック
export function useDocumentDetail(id: string | null) {
  const [data, setData] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getDocumentById(id);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'データの取得に失敗しました');
      }
    } catch (err) {
      setError('データの取得に失敗しました');
      console.error('Error fetching document detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}

// CRUD操作フック
export function useDocumentMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateDocumentRequest): Promise<DocumentDetail | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createDocument(data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '作成に失敗しました');
        return null;
      }
    } catch (err) {
      setError('作成に失敗しました');
      console.error('Error creating document:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateDocumentRequest): Promise<DocumentDetail | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateDocument(id, data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || '更新に失敗しました');
        return null;
      }
    } catch (err) {
      setError('更新に失敗しました');
      console.error('Error updating document:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteDocument(id);
      if (response.success) {
        return true;
      } else {
        setError(response.error?.message || '削除に失敗しました');
        return false;
      }
    } catch (err) {
      setError('削除に失敗しました');
      console.error('Error deleting document:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upload = useCallback(async (id: string, file: File): Promise<{ id: string; fileName: string; fileSize: number; mimeType: string } | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadDocumentFile(id, file);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || 'アップロードに失敗しました');
        return null;
      }
    } catch (err) {
      setError('アップロードに失敗しました');
      console.error('Error uploading file:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const download = useCallback(async (id: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDocumentDownloadUrl(id);
      if (response.success) {
        return response.data.url;
      } else {
        setError(response.error?.message || 'ダウンロードURLの取得に失敗しました');
        return null;
      }
    } catch (err) {
      setError('ダウンロードURLの取得に失敗しました');
      console.error('Error getting download URL:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(async (data: GeneratePdfRequest): Promise<GeneratePdfResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generatePdf(data);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error?.message || 'PDF生成に失敗しました');
        return null;
      }
    } catch (err) {
      setError('PDF生成に失敗しました');
      console.error('Error generating PDF:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    create,
    update,
    remove,
    upload,
    download,
    generate,
  };
}
