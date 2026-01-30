'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface BaseDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** タイトル */
  title?: string;
  /** 説明テキスト */
  description?: string;
  /** ダイアログの内容 */
  children: ReactNode;
  /** フッター（ボタンなど） */
  footer?: ReactNode;
  /** ダイアログのサイズ */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** オーバーレイクリックで閉じるか */
  closeOnOverlayClick?: boolean;
  /** ESCキーで閉じるか */
  closeOnEsc?: boolean;
  /** 閉じるボタンを表示するか */
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

/**
 * 基本ダイアログコンポーネント
 */
export function BaseDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
}: BaseDialogProps) {
  // ESCキーで閉じる
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [closeOnEsc, isOpen, onClose]);

  // ダイアログが開いている間はbodyのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* ダイアログ本体 */}
      <div
        className={`relative z-50 w-full ${sizeClasses[size]} mx-4 bg-white rounded-lg shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* ヘッダー */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              {title && (
                <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="dialog-description" className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* フッター */}
        {footer && <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}
