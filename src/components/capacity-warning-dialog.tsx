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
      bgColor: 'bg-kohaku-50',
      borderColor: 'border-kohaku',
      iconColor: 'text-kohaku-dark',
      titleColor: 'text-kohaku-dark',
      icon: '⚠️',
      defaultTitle: '合祀人数が上限に近づいています',
      defaultMessage: '合祀可能な人数が残りわずかです。申込を続行しますか？'
    },
    critical: {
      bgColor: 'bg-kohaku-50',
      borderColor: 'border-kohaku-dark',
      iconColor: 'text-kohaku-dark',
      titleColor: 'text-kohaku-dark',
      icon: '🚨',
      defaultTitle: '合祀人数が上限間近です',
      defaultMessage: '合祀可能な人数がほとんど残っていません。申込を続行しますか？'
    },
    full: {
      bgColor: 'bg-beni-50',
      borderColor: 'border-beni',
      iconColor: 'text-beni',
      titleColor: 'text-beni-dark',
      icon: '🚫',
      defaultTitle: '合祀人数が上限に達しました',
      defaultMessage: 'これ以上の合祀申込は受け付けできません。管理者にお問い合わせください。'
    }
  };

  const config = statusConfig[status];
  const isFull = status === 'full';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-elegant-lg shadow-elegant-xl max-w-md w-full border-4 ${config.borderColor} animate-fade-in`}>
        {/* ヘッダー */}
        <div className={`${config.bgColor} p-6 rounded-t-lg border-b-2 ${config.borderColor}`}>
          <div className="flex items-center space-x-3">
            <span className="text-4xl" aria-hidden="true">{config.icon}</span>
            <h2 className={`text-xl font-bold ${config.titleColor}`}>
              {title || config.defaultTitle}
            </h2>
          </div>
        </div>

        {/* 本文 */}
        <div className="p-6">
          <p className="text-sumi mb-6 text-base leading-relaxed">
            {message || config.defaultMessage}
          </p>

          {/* 人数情報 */}
          <div className="bg-kinari rounded-elegant-lg p-4 mb-6 border border-gin">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-hai">現在の合祀人数</span>
                <span className="text-xl font-bold text-sumi">{current}名</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-hai">上限人数</span>
                <span className="text-lg font-semibold text-sumi">{max}名</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-hai">残り人数</span>
                <span className={`text-xl font-bold ${isFull ? 'text-beni' :
                  status === 'critical' ? 'text-kohaku-dark' :
                    'text-kohaku'
                  }`}>
                  {remaining}名
                </span>
              </div>

              {/* プログレスバー */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-hai">使用率</span>
                  <span className={`text-sm font-bold ${isFull ? 'text-beni' :
                    status === 'critical' ? 'text-kohaku-dark' :
                      'text-kohaku'
                    }`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-gin rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${isFull ? 'bg-beni' :
                      status === 'critical' ? 'bg-kohaku' :
                        'bg-kohaku-light'
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
