'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  maxReachedStep: number;
  onStepChange: (index: number) => void;
}

export function WizardStepper({
  steps,
  currentStep,
  maxReachedStep,
  onStepChange,
}: WizardStepperProps) {
  return (
    <nav aria-label="一括インポート手順" className="mb-4 md:mb-6">
      <ol className="flex items-center gap-1 md:gap-2">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = index < maxReachedStep || index < currentStep;
          const isAccessible = index <= maxReachedStep;

          return (
            <li key={step.id} className="flex-1 flex items-center min-w-0">
              <button
                type="button"
                onClick={() => isAccessible && onStepChange(index)}
                disabled={!isAccessible}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex-1 flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-elegant border transition-all duration-200 text-left min-w-0',
                  isCurrent
                    ? 'bg-ai-50 border-ai shadow-elegant-sm'
                    : isCompleted
                      ? 'bg-matsu-50 border-matsu-200 hover:bg-matsu-100'
                      : 'bg-white border-gin opacity-60 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-sm font-bold tabular-nums',
                    isCurrent
                      ? 'bg-ai text-white'
                      : isCompleted
                        ? 'bg-matsu text-white'
                        : 'bg-kinari text-hai border border-gin'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0">
                  <div
                    className={cn(
                      'text-xs md:text-sm font-semibold truncate',
                      isCurrent ? 'text-ai' : isCompleted ? 'text-matsu-dark' : 'text-hai'
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="hidden md:block text-[11px] text-hai truncate">
                      {step.description}
                    </div>
                  )}
                </div>
              </button>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'shrink-0 w-4 md:w-8 h-px mx-1',
                    isCompleted ? 'bg-matsu' : 'bg-gin'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface WizardNavProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  className?: string;
}

export function WizardNav({
  onBack,
  onNext,
  nextLabel = '次へ',
  backLabel = '戻る',
  nextDisabled,
  className,
}: WizardNavProps) {
  return (
    <div className={cn('mt-4 flex items-center gap-3 flex-wrap', className)}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-hai hover:text-sumi border border-gin rounded-elegant hover:bg-kinari transition-colors"
        >
          ← {backLabel}
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="px-4 py-2 text-sm font-medium text-white bg-ai hover:bg-ai-dark rounded-elegant transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nextLabel} →
        </button>
      )}
    </div>
  );
}
