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
    iconColor: 'text-ai',
    buttonColor: 'bg-ai hover:bg-ai-dark',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-kohaku',
    buttonColor: 'bg-kohaku hover:bg-kohaku-dark',
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-beni',
    buttonColor: 'bg-beni hover:bg-beni-dark',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-matsu',
    buttonColor: 'bg-matsu hover:bg-matsu-dark',
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
        <h3 className="text-lg font-semibold text-sumi mb-2">{title}</h3>
        <p className="text-sumi mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gin rounded-md text-sumi bg-white hover:bg-shiro disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
