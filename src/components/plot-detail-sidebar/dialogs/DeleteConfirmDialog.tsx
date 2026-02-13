'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  targetName: string;
  targetCode: string;
  plotSection?: string;
  plotNumber?: string;
  isLoading?: boolean;
  onDelete: () => void;
  onClose: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  targetName,
  targetCode,
  plotSection,
  plotNumber,
  isLoading = false,
  onDelete,
  onClose,
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isConfirmValid = confirmText === targetCode;

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleDelete = () => {
    if (isConfirmValid) {
      onDelete();
      setConfirmText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-red-700 text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            データの削除
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium mb-2">
              この操作は取り消せません。以下のデータが完全に削除されます：
            </p>
            <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
              <li>顧客基本情報</li>
              <li>契約情報・区画情報</li>
              <li>埋葬者情報</li>
              <li>対応履歴・書類履歴</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">削除対象:</p>
            <p className="font-semibold text-gray-900">{targetName} 様</p>
            <p className="text-sm text-gray-600">コード: {targetCode}</p>
            {plotSection && (
              <p className="text-sm text-gray-600">区画: {plotSection} - {plotNumber}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              確認のため、コード <span className="font-mono bg-gray-100 px-1 rounded">{targetCode}</span> を入力してください
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="コードを入力"
              className="mt-2"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            キャンセル
          </Button>
          <Button
            className="bg-red-700 hover:bg-red-800 text-white disabled:bg-red-300"
            onClick={handleDelete}
            disabled={!isConfirmValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                削除中...
              </>
            ) : (
              '削除する'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
