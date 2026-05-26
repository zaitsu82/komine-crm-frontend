import { cn } from '@/lib/utils';
import type { SortKey, SortOrder } from './types';

interface SortIndicatorProps {
  columnKey: SortKey;
  sortKey: SortKey;
  sortOrder: SortOrder;
}

/** カラムヘッダーの昇順/降順インジケーター（▲▼）。 */
export function SortIndicator({ columnKey, sortKey, sortOrder }: SortIndicatorProps) {
  return (
    <div className="flex flex-col ml-1">
      <span className={cn(
        "text-[10px] leading-none",
        sortKey === columnKey && sortOrder === 'asc' ? 'text-kohaku' : 'text-matsu-200'
      )}>▲</span>
      <span className={cn(
        "text-[10px] leading-none",
        sortKey === columnKey && sortOrder === 'desc' ? 'text-kohaku' : 'text-matsu-200'
      )}>▼</span>
    </div>
  );
}
