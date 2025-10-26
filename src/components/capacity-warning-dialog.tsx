'use client';

import { Button } from '@/components/ui/button';

interface CapacityWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  status: 'warning' | 'critical' | 'full';
  current: number;
  max: number;
  remaining: number;
  percentage: number;
  title?: string;
  message?: string;
}

export default function CapacityWarningDialog({
  isOpen,
  onClose,
  onContinue,
  status,
  current,
  max,
  remaining,
  percentage,
  title,
  message
}: CapacityWarningDialogProps) {
  if (!isOpen) return null;

  const statusConfig = {
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      icon: '⚠️',
      defaultTitle: '合祀人数が上限に近づいています',
      defaultMessage: '合祀可能な人数が残りわずかです。申込を続行しますか？'
    },
    critical: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      icon: '🚨',
      defaultTitle: '合祀人数が上限間近です',
      defaultMessage: '合祀可能な人数がほとんど残っていません。申込を続行しますか？'
    },
    full: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      icon: '🚫',
      defaultTitle: '合祀人数が上限に達しました',
      defaultMessage: 'これ以上の合祀申込は受け付けできません。管理者にお問い合わせください。'
    }
  };

  const config = statusConfig[status];
  const isFull = status === 'full';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-2xl max-w-md w-full border-4 ${config.borderColor} animate-fade-in`}>
        {/* ヘッダー */}
        <div className={`${config.bgColor} p-6 rounded-t-lg border-b-2 ${config.borderColor}`}>
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{config.icon}</span>
            <h2 className={`text-xl font-bold ${config.titleColor}`}>
              {title || config.defaultTitle}
            </h2>
          </div>
        </div>

        {/* 本文 */}
        <div className="p-6">
          <p className="text-gray-700 mb-6 text-base leading-relaxed">
            {message || config.defaultMessage}
          </p>

          {/* 人数情報 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">現在の合祀人数</span>
                <span className="text-xl font-bold text-gray-900">{current}名</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">上限人数</span>
                <span className="text-lg font-semibold text-gray-700">{max}名</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">残り人数</span>
                <span className={`text-xl font-bold ${
                  isFull ? 'text-red-600' :
                  status === 'critical' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}>
                  {remaining}名
                </span>
              </div>

              {/* プログレスバー */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">使用率</span>
                  <span className={`text-sm font-bold ${
                    isFull ? 'text-red-600' :
                    status === 'critical' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isFull ? 'bg-red-600' :
                      status === 'critical' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isFull && onContinue ? (
              <>
                <Button
                  onClick={onContinue}
                  variant="default"
                  className="flex-1 btn-senior"
                  size="lg"
                >
                  続行する
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 btn-senior"
                  size="lg"
                >
                  キャンセル
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                variant="default"
                className="w-full btn-senior"
                size="lg"
              >
                閉じる
              </Button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
