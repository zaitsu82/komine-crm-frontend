import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        sm: 'py-8 px-4 gap-2',
        default: 'py-12 px-6 gap-3',
        lg: 'py-16 px-8 gap-4',
      },
      container: {
        bordered: 'rounded-elegant-lg border border-dashed border-gin bg-kinari/40',
        plain: '',
      },
    },
    defaultVariants: {
      size: 'default',
      container: 'bordered',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size, container, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(emptyStateVariants({ size, container }), className)}
        {...props}
      >
        {icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-kinari text-hai" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <p className="font-mincho text-base md:text-lg text-sumi">{title}</p>
          {description && (
            <p className="text-xs md:text-sm text-hai max-w-md">{description}</p>
          )}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState, emptyStateVariants };
