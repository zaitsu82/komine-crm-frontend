'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface RestoreConfirmDialogProps {
  isOpen: boolean;
  plotNumber: string;
  customerName: string;
  isLoading?: boolean;
  onRestore: (reason: string) => void;
  onClose: () => void;
}

const REASON_MAX_LENGTH = 200;

export default function RestoreConfirmDialog({
  isOpen,
  plotNumber,
  customerName,
  isLoading = false,
  onRestore,
  onClose,
}: RestoreConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length > 0 && trimmedReason.length <= REASON_MAX_LENGTH;
  const canSubmit = isReasonValid && acknowledged && !isLoading;

  const handleClose = () => {
    setReason('');
    setAcknowledged(false);
    onClose();
  };

  const handleRestore = () => {
    if (canSubmit) {
      onRestore(trimmedReason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-matsu text-white px-6 py-4 rounded-t-lg">
          <h3 className="text-base md:text-lg font-semibold flex items-center">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            契約を復活
          </h3>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          <div className="bg-kinari border border-gin rounded-lg p-3 md:p-4">
            <p className="text-sm text-sumi font-medium mb-2">
              この区画を <span className="font-mono bg-white px-1 rounded">terminated</span> から{' '}
              <span className="font-mono bg-white px-1 rounded">active</span> に戻します
            </p>
            <p className="text-xs text-hai">
              誤って解約・終了にしてしまった場合の復活操作です。実施日時・実施者・理由は履歴に記録されます。
            </p>
          </div>

          <div className="bg-shiro rounded-lg p-3 md:p-4 border border-gin">
            <p className="text-sm text-hai mb-1">対象:</p>
            <p className="font-semibold text-sumi">
              {plotNumber}
              {customerName ? `（${customerName}）` : ''}
            </p>
          </div>

          <div>
            <Label htmlFor="restore-reason" className="text-sm font-medium text-sumi">
              復活理由 <span className="text-beni">*</span>
            </Label>
            <textarea
              id="restore-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：担当者の入力ミスで誤って解約してしまったため"
              maxLength={REASON_MAX_LENGTH}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gin bg-white px-3 py-2 text-sm text-sumi placeholder:text-hai focus:border-matsu focus:outline-none focus:ring-2 focus:ring-matsu/30"
              disabled={isLoading}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-hai">必須・履歴に記録されます</p>
              <p className="text-xs text-hai tabular-nums">
                {reason.length} / {REASON_MAX_LENGTH}
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 h-4 w-4 rounded border-gin text-matsu focus:ring-matsu/30"
            />
            <span className="text-sm text-sumi">
              この区画を <strong>active</strong> に戻すことを確認しました
            </span>
          </label>
        </div>

        <div className="px-5 md:px-6 py-4 bg-shiro rounded-b-lg flex justify-end gap-2 md:gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} size="sm">
            キャンセル
          </Button>
          <Button
            onClick={handleRestore}
            disabled={!canSubmit}
            size="sm"
            className="bg-matsu hover:bg-matsu-light text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                復活中...
              </>
            ) : (
              '復活する'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
