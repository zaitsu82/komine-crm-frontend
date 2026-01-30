'use client';

import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { BaseDialog } from './BaseDialog';

type ConfirmDialogVariant = 'info' | 'warning' | 'danger' | 'success';

interface ConfirmDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** 確認コールバック */
  onConfirm: () => void;
  /** タイトル */
  title?: string;
  /** メッセージ */
  message: string;
  /** 確認ボタンのテキスト */
  confirmText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** バリアント（スタイル） */
  variant?: ConfirmDialogVariant;
  /** 確認ボタンのローディング状態 */
  isLoading?: boolean;
}

const variantStyles = {
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
};

/**
 * 確認ダイアログコンポーネント
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '確認',
  message,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  variant = 'info',
  isLoading = false,
}: ConfirmDialogProps) {
  const { icon: Icon, iconColor, buttonColor } = variantStyles[variant];

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      showCloseButton={false}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`mb-4 ${iconColor}`}>
          <Icon className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-md text-white ${buttonColor} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                処理中...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}
