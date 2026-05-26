import { COLUMN_DEFAULT_WIDTHS, type ResizableColumnKey } from '@/lib/plots-column-widths';

interface ColumnResizerProps {
  columnKey: ResizableColumnKey;
  onResizeStart: (key: ResizableColumnKey, startX: number, startWidth: number) => void;
}

/**
 * ヘッダー右端のドラッグハンドル。十分な幅（8px）を確保し、
 * クリックがソート操作に伝播しないよう stopPropagation する。
 */
export function ColumnResizer({ columnKey, onResizeStart }: ColumnResizerProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="列幅を調整"
      data-testid={`col-resizer-${columnKey}`}
      className="absolute top-0 right-0 z-20 h-full w-2 cursor-col-resize touch-none select-none hover:bg-white/40"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const th = e.currentTarget.parentElement;
        const startWidth = th ? th.getBoundingClientRect().width : COLUMN_DEFAULT_WIDTHS[columnKey] ?? 90;
        onResizeStart(columnKey, e.clientX, startWidth);
      }}
    />
  );
}
