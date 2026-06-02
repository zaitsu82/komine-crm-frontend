import { cn } from '@/lib/utils';
import {
  isLegacyPlotNumber,
  isLegacyAreaName,
  LEGACY_VALUE_NOTE,
} from '@/lib/legacy-plot-display';

interface LegacyAwareValueProps {
  value?: string | null;
  /** plotNumber=区画番号/セクション, areaName=エリア/期 */
  kind: 'plotNumber' | 'areaName';
  className?: string;
  emptyText?: string;
}

/**
 * 区画番号・エリア値を表示し、レガシー移行値（legacy-101 / 1-29 等）の場合は
 * 淡色・斜体＋ツールチップで「整備中」であることを示す（#164/#166/#182 暫定）。
 * 正規化済みの値はそのまま表示する。
 */
export function LegacyAwareValue({
  value,
  kind,
  className,
  emptyText = '-',
}: LegacyAwareValueProps) {
  if (!value) return <span className={className}>{emptyText}</span>;

  const isLegacy =
    kind === 'plotNumber' ? isLegacyPlotNumber(value) : isLegacyAreaName(value);

  if (!isLegacy) return <span className={className}>{value}</span>;

  return (
    <span className={cn('text-hai italic', className)} title={LEGACY_VALUE_NOTE}>
      {value}
    </span>
  );
}

/**
 * レガシー移行値が画面に含まれる場合に表示する注記。淡色・斜体の値の意味を補う。
 * 表示するかどうかは呼び出し側で判定する（含まれない＝正規化済みなら出さない）。
 */
export function LegacyValueNote({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-center gap-1.5 text-xs text-hai', className)}>
      <span className="inline-flex shrink-0 items-center rounded-full border border-kohaku-200 bg-kohaku-50 px-1.5 py-0.5 text-[10px] font-medium text-kohaku-dark">
        整備中
      </span>
      <span className="leading-snug">
        淡色・斜体の区画番号／エリアはレガシー移行値です。正式な区画番号・区画名は整備中（要確認）です。
      </span>
    </p>
  );
}
