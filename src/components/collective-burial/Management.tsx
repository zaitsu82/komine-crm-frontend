'use client';

/**
 * 合祀管理コンテナコンポーネント（API連携版）
 * 一覧・詳細の状態を管理（参照 + 請求管理のみ）
 */

import { useState, useCallback } from 'react';
import CollectiveBurialListView from './ListView';
import CollectiveBurialDetailView from './DetailView';
import { useCollectiveBurialDetail } from '@/hooks/useCollectiveBurials';
import { CollectiveBurialListItem } from '@/lib/api';

type ViewMode = 'list' | 'detail';

interface CollectiveBurialManagementProps {
  onBack?: () => void;
}

export default function CollectiveBurialManagement({ onBack }: CollectiveBurialManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // 詳細データ取得
  const {
    data: detailData,
    isLoading: isLoadingDetail,
    refresh: refreshDetail,
  } = useCollectiveBurialDetail(viewMode === 'detail' ? selectedId : null);

  // レコード選択時
  const handleSelectRecord = useCallback((record: CollectiveBurialListItem) => {
    setSelectedId(record.id);
    setViewMode('detail');
  }, []);

  // 詳細画面を閉じる
  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
    setViewMode('list');
    setListRefreshKey((prev) => prev + 1);
  }, []);

  // 一覧画面
  if (viewMode === 'list') {
    return (
      <CollectiveBurialListView
        key={listRefreshKey}
        onBack={onBack}
        onSelectRecord={handleSelectRecord}
      />
    );
  }

  // 詳細画面
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
      onRefresh={refreshDetail}
    />
  );
}
