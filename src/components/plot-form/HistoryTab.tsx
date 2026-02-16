'use client';

import { useState } from 'react';
import type { HistoryTabProps } from './types';

const ACTION_TYPE_LABELS: Record<string, string> = {
  CREATE: '作成',
  UPDATE: '更新',
  DELETE: '削除',
};

export function HistoryTab({ plotDetail }: HistoryTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const histories = plotDetail?.histories || [];

  if (histories.length === 0) {
    return (
      <div className="border border-gin rounded-elegant-lg p-4">
        <h3 className="text-sm font-semibold text-sumi mb-3">履歴情報</h3>
        <p className="text-sm text-hai">履歴データはありません</p>
      </div>
    );
  }

  return (
    <div className="border border-gin rounded-elegant-lg p-4">
      <h3 className="text-sm font-semibold text-sumi mb-3">履歴情報</h3>

      {/* ヘッダー */}
      <div className="grid grid-cols-4 gap-4 px-3 py-2 bg-kinari border rounded-t-md text-sm font-medium text-hai">
        <span>日時</span>
        <span>操作</span>
        <span>変更フィールド</span>
        <span>変更者</span>
      </div>

      {/* 行 */}
      <div className="border border-t-0 rounded-b-md divide-y">
        {histories.map((history) => (
          <div
            key={history.id}
            className={`grid grid-cols-4 gap-4 px-3 py-2 text-sm cursor-pointer hover:bg-matsu-50 transition-colors duration-200 ${selectedId === history.id ? 'bg-matsu-50' : ''
              }`}
            onClick={() => setSelectedId(selectedId === history.id ? null : history.id)}
          >
            <span>{new Date(history.createdAt).toLocaleString('ja-JP')}</span>
            <span>{ACTION_TYPE_LABELS[history.actionType] || history.actionType}</span>
            <span className="truncate">
              {history.changedFields?.join(', ') || '-'}
            </span>
            <span>{history.changedBy || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
