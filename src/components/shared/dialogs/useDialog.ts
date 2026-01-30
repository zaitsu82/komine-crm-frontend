'use client';

import { useState, useCallback } from 'react';

interface UseDialogReturn<T = unknown> {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** ダイアログに渡すデータ */
  data: T | null;
  /** ダイアログを開く */
  open: (data?: T) => void;
  /** ダイアログを閉じる */
  close: () => void;
  /** 開閉を切り替え */
  toggle: () => void;
}

/**
 * ダイアログの開閉状態を管理するフック
 */
export function useDialog<T = unknown>(): UseDialogReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((newData?: T) => {
    setData(newData ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // データのクリアは少し遅延させる（アニメーション完了後）
    setTimeout(() => {
      setData(null);
    }, 150);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

interface UseConfirmDialogReturn {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 確認メッセージ */
  message: string;
  /** 確認ダイアログを開く（Promiseを返す） */
  confirm: (message: string) => Promise<boolean>;
  /** 確認アクション（OK押下時） */
  handleConfirm: () => void;
  /** キャンセルアクション */
  handleCancel: () => void;
}

/**
 * 確認ダイアログ用のフック
 * confirm()を呼ぶとダイアログを開き、ユーザーの選択結果をPromiseで返す
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((msg: string): Promise<boolean> => {
    setMessage(msg);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  return {
    isOpen,
    message,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
