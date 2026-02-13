'use client';

/**
 * 合祀管理コンテナコンポーネント（API連携版）
 * 一覧・詳細・フォームの状態を管理
 */

import { useState, useCallback } from 'react';
import CollectiveBurialListView from './ListView';
import CollectiveBurialDetailView from './DetailView';
import CollectiveBurialForm from './Form';
import { useCollectiveBurialDetail } from '@/hooks/useCollectiveBurials';
import { CollectiveBurialListItem } from '@/lib/api';

type ViewMode = 'list' | 'detail' | 'create' | 'edit';

interface CollectiveBurialManagementProps {
  onBack?: () => void;
}

export default function CollectiveBurialManagement({ onBack }: CollectiveBurialManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // 詳細データ取得
  const { data: detailData, isLoading: isLoadingDetail, refresh: refreshDetail } = useCollectiveBurialDetail(
    viewMode === 'detail' || viewMode === 'edit' ? selectedId : null
  );

  // レコード選択時
  const handleSelectRecord = useCallback((record: CollectiveBurialListItem) => {
    setSelectedId(record.id);
    setViewMode('detail');
  }, []);

  // 新規作成ボタン押下時
  const handleCreateNew = useCallback(() => {
    setSelectedId(null);
    setViewMode('create');
  }, []);

  // 詳細画面から編集へ
  const handleEdit = useCallback(() => {
    setViewMode('edit');
  }, []);

  // 詳細画面を閉じる
  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
    setViewMode('list');
  }, []);

  // 削除成功時
  const handleDelete = useCallback(() => {
    // リストを再読み込みして一覧に戻る
    setListRefreshKey(prev => prev + 1);
    setSelectedId(null);
    setViewMode('list');
  }, []);

  // フォームキャンセル
  const handleCancelForm = useCallback(() => {
    if (selectedId) {
      // 編集キャンセル → 詳細に戻る
      setViewMode('detail');
    } else {
      // 新規作成キャンセル → 一覧に戻る
      setViewMode('list');
    }
  }, [selectedId]);

  // フォーム送信成功
  const handleSubmitSuccess = useCallback(() => {
    // リストを再読み込み
    setListRefreshKey(prev => prev + 1);

    if (selectedId) {
      // 編集成功 → 詳細に戻る
      refreshDetail();
      setViewMode('detail');
    } else {
      // 新規作成成功 → 一覧に戻る
      setViewMode('list');
    }
  }, [selectedId, refreshDetail]);

  // 一覧画面
  if (viewMode === 'list') {
    return (
      <CollectiveBurialListView
        key={listRefreshKey}
        onBack={onBack}
        onSelectRecord={handleSelectRecord}
        onCreateNew={handleCreateNew}
      />
    );
  }

  // 詳細画面
  if (viewMode === 'detail') {
    if (isLoadingDetail) {
      return (
        <div className="h-full flex items-center justify-center bg-shiro">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cha mx-auto mb-4"></div>
            <p className="text-hai">読み込み中...</p>
          </div>
        </div>
      );
    }

    if (!detailData) {
      return (
        <div className="h-full flex items-center justify-center bg-shiro">
          <div className="text-center">
            <p className="text-hai mb-4">データが見つかりません</p>
            <button
              onClick={handleCloseDetail}
              className="px-4 py-2 bg-cha text-white rounded hover:bg-cha-dark"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      );
    }

    return (
      <CollectiveBurialDetailView
        data={detailData}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onRefresh={refreshDetail}
        onDelete={handleDelete}
      />
    );
  }

  // 新規作成・編集フォーム
  return (
    <div className="h-full flex flex-col bg-shiro">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cha-50 to-kinari border-b border-cha-100 px-6 py-5">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-cha flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="font-mincho text-xl font-semibold text-sumi tracking-wide">
              {viewMode === 'create' ? '合祀情報 新規登録' : '合祀情報 編集'}
            </h2>
            {viewMode === 'edit' && detailData && (
              <p className="text-sm text-hai mt-0.5">
                区画: {detailData.plotNumber} / {detailData.areaName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* フォーム */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <CollectiveBurialForm
            editId={viewMode === 'edit' ? selectedId : null}
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={handleCancelForm}
          />
        </div>
      </div>
    </div>
  );
}
