/**
 * トースト通知ユーティリティ
 * アプリケーション全体で統一的なトースト通知を提供
 */

import { toast } from 'sonner';

function formatErrorDescription(
  message?: string,
  details?: Array<{ field?: string; message: string }>,
): string | undefined {
  if (!details || details.length === 0) return message;

  const detailLines = details.map((d) => d.message).join('\n');

  return message ? `${message}\n${detailLines}` : detailLines;
}

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
 * details がある場合はフィールドごとのエラーメッセージを description に表示
 */
export function showApiError(
  operation: string,
  errorMessage?: string,
  details?: Array<{ field?: string; message: string }>,
) {
  const description = formatErrorDescription(errorMessage, details);
  toast.error(`${operation}に失敗しました`, {
    description,
    duration: details?.length ? 10000 : 5000,
  });
}

// 直接toast関数もエクスポート（カスタマイズが必要な場合用）
export { toast };
