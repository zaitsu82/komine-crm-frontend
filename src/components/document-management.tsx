'use client';

/**
 * 書類管理メインコンテナコンポーネント
 */

import { useState, useCallback, useEffect } from 'react';
import { DocumentListView } from './document-list-view';
import { DocumentDetailView } from './document-detail-view';
import { DocumentForm } from './document-form';
import { useDocumentMutations, DocumentDetail } from '@/hooks/useDocuments';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

interface DocumentManagementProps {
  /** 顧客IDでフィルター（顧客詳細から遷移時） */
  customerId?: string;
  /** 顧客名（表示用） */
  customerName?: string;
  /** 初期表示モード */
  initialMode?: 'list' | 'create';
  /** 戻るボタン押下時のコールバック */
  onBack?: () => void;
}

export function DocumentManagement({
  customerId,
  customerName,
  initialMode = 'list',
  onBack,
}: DocumentManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const { remove, download, isLoading: isMutating } = useDocumentMutations();

  // 初期モードが変更された場合に反映
  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  // 一覧に戻る
  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedDocumentId(null);
  }, []);

  // 新規作成画面へ
  const handleCreateNew = useCallback(() => {
    setViewMode('create');
    setSelectedDocumentId(null);
  }, []);

  // 詳細画面へ
  const handleViewDetail = useCallback((id: string) => {
    setSelectedDocumentId(id);
    setViewMode('detail');
  }, []);

  // 編集画面へ
  const handleEdit = useCallback((id: string) => {
    setSelectedDocumentId(id);
    setViewMode('edit');
  }, []);

  // 保存完了後
  const handleSaved = useCallback((doc: DocumentDetail) => {
    setSelectedDocumentId(doc.id);
    setViewMode('detail');
  }, []);

  // 削除確認ダイアログを開く
  const handleDeleteRequest = useCallback((id: string) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  // 削除実行
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

  // ダウンロード
  const handleDownload = useCallback(async (id: string) => {
    const url = await download(id);
    if (url) {
      // URLを新しいタブで開く
      window.open(url, '_blank');
    } else {
      toast.error('ダウンロードに失敗しました');
    }
  }, [download]);

  // 戻るボタンのハンドラ（顧客コンテキストの場合は親に戻る）
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      handleBackToList();
    }
  }, [onBack, handleBackToList]);

  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* 顧客コンテキストヘッダー */}
      {customerId && customerName && viewMode === 'list' && (
        <div className="px-6 py-3 flex items-center gap-4 bg-white border-b border-gin">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            顧客詳細に戻る
          </Button>
          <div className="text-hai">
            <span className="font-medium text-sumi">{customerName}</span> 様の書類
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <DocumentListView
          customerId={customerId}
          customerName={customerName}
          onCreateNew={handleCreateNew}
          onViewDetail={handleViewDetail}
          onDownload={handleDownload}
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
          onBack={handleBackToList}
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
          <div className="bg-white rounded-elegant-lg shadow-elegant-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-beni-50 to-kinari px-6 py-4 border-b border-gin">
              <h3 className="text-lg font-semibold text-beni font-mincho">書類の削除</h3>
            </div>
            <div className="p-6">
              <p className="text-sumi">
                この書類を削除してもよろしいですか？この操作は取り消せません。
              </p>
            </div>
            <div className="px-6 py-4 bg-kinari border-t border-gin flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isMutating}
              >
                キャンセル
              </Button>
              <Button
                className="bg-beni hover:bg-beni-dark text-white"
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
