'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  DocumentTemplateGallery,
  TemplateId,
} from './document-template-gallery';
import { DocumentListView } from './document-list-view';
import { DocumentDetailView } from './document-detail-view';
import { DocumentForm } from './document-form';
import { useDocumentMutations, DocumentDetail } from '@/hooks/useDocuments';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PlotDetailResponse } from '@komine/types';

type ViewMode = 'templates' | 'list' | 'detail' | 'create' | 'edit';

interface DocumentManagementProps {
  customerId?: string;
  customerName?: string;
  /** 区画詳細データ（区画コンテキストから書類作成時、フォームに自動挿入するため） */
  plotDetail?: PlotDetailResponse;
  initialMode?: 'list' | 'create' | 'templates';
  onBack?: () => void;
}

export function DocumentManagement({
  customerId,
  customerName,
  plotDetail,
  initialMode = 'templates',
  onBack,
}: DocumentManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialMode === 'create' ? 'create' : initialMode === 'list' ? 'list' : 'templates'
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<TemplateId | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const { remove, download, isLoading: isMutating } = useDocumentMutations();

  useEffect(() => {
    if (initialMode === 'create') setViewMode('create');
    else if (initialMode === 'list') setViewMode('list');
    else setViewMode('templates');
  }, [initialMode]);

  const handleBackToTemplates = useCallback(() => {
    setViewMode('templates');
    setSelectedDocumentId(null);
    setSelectedTemplateId(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedDocumentId(null);
  }, []);

  const handleViewHistory = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleSelectTemplate = useCallback((templateId: TemplateId) => {
    setSelectedTemplateId(templateId);
    setViewMode('create');
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelectedTemplateId(null);
    setViewMode('create');
  }, []);

  const handleViewDetail = useCallback((id: string) => {
    setSelectedDocumentId(id);
    setViewMode('detail');
  }, []);

  const handleEdit = useCallback((id: string) => {
    setSelectedDocumentId(id);
    setViewMode('edit');
  }, []);

  const handleSaved = useCallback(
    (doc: DocumentDetail) => {
      setSelectedDocumentId(doc.id);
      setViewMode('detail');
    },
    []
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!documentToDelete) return;
    const success = await remove(documentToDelete);
    if (success) {
      toast.success('書類を削除しました');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      handleBackToList();
    } else {
      toast.error('削除に失敗しました');
    }
  }, [documentToDelete, remove, handleBackToList]);

  const handleDownload = useCallback(
    async (id: string) => {
      const ok = await download(id);
      if (!ok) {
        toast.error('ダウンロードに失敗しました');
      }
    },
    [download]
  );

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      handleBackToTemplates();
    }
  }, [onBack, handleBackToTemplates]);

  const formOnBack =
    customerId
      ? handleBackToTemplates
      : viewMode === 'create'
        ? handleBackToTemplates
        : handleBackToList;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 顧客コンテキストヘッダー */}
      {customerId && customerName && viewMode === 'list' && (
        <div className="px-6 py-2 flex items-center gap-4 border-b border-gin">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            顧客詳細に戻る
          </Button>
          <div className="text-sumi-600 text-sm">
            <span className="font-medium">{customerName}</span> 様の書類
          </div>
        </div>
      )}

      {/* 顧客コンテキストヘッダー（テンプレートギャラリー） */}
      {customerId && customerName && viewMode === 'templates' && (
        <div className="mb-4 flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            区画詳細に戻る
          </Button>
          <div className="text-sumi-600">
            <span className="font-medium">{customerName}</span> 様の書類を作成
          </div>
        </div>
      )}

      {viewMode === 'templates' && (
        <DocumentTemplateGallery
          onSelectTemplate={handleSelectTemplate}
          onViewHistory={handleViewHistory}
        />
      )}

      {viewMode === 'list' && (
        <DocumentListView
          customerId={customerId}
          customerName={customerName}
          onCreateNew={customerId ? handleCreateNew : handleBackToTemplates}
          onViewDetail={handleViewDetail}
          onDownload={handleDownload}
          onBack={customerId ? undefined : handleBackToTemplates}
        />
      )}

      {viewMode === 'detail' && selectedDocumentId && (
        <DocumentDetailView
          documentId={selectedDocumentId}
          onBack={handleBackToList}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onDownload={handleDownload}
        />
      )}

      {viewMode === 'create' && (
        <DocumentForm
          customerId={customerId}
          templateId={selectedTemplateId || undefined}
          plotDetail={plotDetail}
          onBack={formOnBack}
          onSaved={handleSaved}
        />
      )}

      {viewMode === 'edit' && selectedDocumentId && (
        <DocumentForm
          documentId={selectedDocumentId}
          onBack={handleBackToList}
          onSaved={handleSaved}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-beni-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">書類の削除</h3>
            </div>
            <div className="p-6">
              <p className="text-sumi-700">
                この書類を削除してもよろしいですか？この操作は取り消せません。
              </p>
            </div>
            <div className="px-6 py-4 bg-sumi-50 rounded-b-lg flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isMutating}
              >
                キャンセル
              </Button>
              <Button
                className="bg-beni-600 hover:bg-beni-700 text-white"
                onClick={handleDeleteConfirm}
                disabled={isMutating}
              >
                {isMutating ? '削除中...' : '削除'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
