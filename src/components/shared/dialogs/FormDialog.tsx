'use client';

import { ReactNode, FormEvent } from 'react';
import { BaseDialog } from './BaseDialog';

interface FormDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 閉じるコールバック */
  onClose: () => void;
  /** フォーム送信コールバック */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** タイトル */
  title: string;
  /** 説明テキスト */
  description?: string;
  /** フォームの内容 */
  children: ReactNode;
  /** 送信ボタンのテキスト */
  submitText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** ダイアログのサイズ */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** 送信ボタンのローディング状態 */
  isLoading?: boolean;
  /** 送信ボタンを無効化 */
  isSubmitDisabled?: boolean;
}

/**
 * フォームダイアログコンポーネント
 */
export function FormDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = '保存',
  cancelText = 'キャンセル',
  size = 'md',
  isLoading = false,
  isSubmitDisabled = false,
}: FormDialogProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading && !isSubmitDisabled) {
      onSubmit(e);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      size={size}
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitDisabled}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                処理中...
              </span>
            ) : (
              submitText
            )}
          </button>
        </div>
      </form>
    </BaseDialog>
  );
}
