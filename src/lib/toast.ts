/**
 * トースト通知ユーティリティ
 * アプリケーション全体で統一的なトースト通知を提供
 */

import { toast } from 'sonner';

/**
 * 成功通知
 */
export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  });
}

/**
 * エラー通知
 */
export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 5000,
  });
}

/**
 * 警告通知
 */
export function showWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 5000,
  });
}

/**
 * 情報通知
 */
export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 4000,
  });
}

/**
 * API操作成功通知
 */
export function showApiSuccess(operation: '作成' | '更新' | '削除' | '保存', targetName?: string) {
  const message = targetName
    ? `${targetName}を${operation}しました`
    : `${operation}しました`;
  showSuccess(message);
}

/**
 * API操作エラー通知
 */
export function showApiError(operation: string, errorMessage?: string) {
  showError(`${operation}に失敗しました`, errorMessage);
}

/**
 * ネットワークエラー通知
 */
export function showNetworkError() {
  showError('通信エラー', 'サーバーに接続できません。ネットワーク接続を確認してください。');
}

/**
 * 認証エラー通知
 */
export function showAuthError(message?: string) {
  showWarning('認証エラー', message || '再度ログインしてください。');
}

/**
 * バリデーションエラー通知
 */
export function showValidationError(message?: string) {
  showError('入力エラー', message || '入力内容を確認してください。');
}

// 直接toast関数もエクスポート（カスタマイズが必要な場合用）
export { toast };
