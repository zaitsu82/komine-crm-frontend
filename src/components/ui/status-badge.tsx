import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * StatusBadge — 支払い・契約・区画状態などのステータス表示を統一。
 * 色のみに依存せず、記号（●▲■◆○）で色覚多様性にも対応する。
 */
const statusBadgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        // 支払い・入金系
        paid: 'bg-matsu-50 text-matsu-dark border-matsu-200',
        unpaid: 'bg-kohaku-50 text-kohaku-dark border-kohaku-200',
        partial: 'bg-ai-50 text-ai border-ai-200',
        overdue: 'bg-beni-50 text-beni border-beni-200',
        refunded: 'bg-kinari text-hai-dark border-gin',
        cancelled: 'bg-kinari text-hai border-gin line-through',
        // 契約・区画状態
        active: 'bg-matsu-50 text-matsu-dark border-matsu-200',
        pending: 'bg-kohaku-50 text-kohaku-dark border-kohaku-200',
        sold: 'bg-beni-50 text-beni border-beni-200',
        available: 'bg-shiro text-hai border-gin',
        // 汎用
        info: 'bg-ai-50 text-ai border-ai-200',
        warning: 'bg-kohaku-50 text-kohaku-dark border-kohaku-200',
        error: 'bg-beni-50 text-beni border-beni-200',
        success: 'bg-matsu-50 text-matsu-dark border-matsu-200',
        neutral: 'bg-kinari text-hai-dark border-gin',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        default: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'default',
    },
  }
);

// バリアントごとのパターン記号（色覚多様性対応）
const VARIANT_SYMBOLS: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  paid: '●',
  unpaid: '▲',
  partial: '◐',
  overdue: '■',
  refunded: '↩',
  cancelled: '×',
  active: '●',
  pending: '▲',
  sold: '■',
  available: '○',
  info: 'ⓘ',
  warning: '▲',
  error: '■',
  success: '●',
  neutral: '・',
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** true にすると variant に応じたパターン記号を自動で先頭に表示 */
  withSymbol?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, withSymbol, children, ...props }, ref) => {
    const symbol = withSymbol && variant ? VARIANT_SYMBOLS[variant] : null;
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {symbol && <span aria-hidden="true">{symbol}</span>}
        <span>{children}</span>
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
