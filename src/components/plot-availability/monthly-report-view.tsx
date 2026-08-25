'use client';

/**
 * 月次報告（区画残数）帳票の画面表示。
 *
 * 業務が税理士へ提出している Excel シートの配置をそのまま再現する
 * （議事録 2026-07-21 §6）。Excel ダウンロードも同じデータから作るのでズレない。
 */

import { useState } from 'react';
import { Download, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MonthlyReportBlock, MonthlyReportResponse } from '@/lib/api/plot-inventory';
import {
  downloadMonthlyReportExcel,
  formatAsOfExact,
  formatAsOfLabel,
  formatFiscalYear,
} from './monthly-report-excel';

interface MonthlyReportViewProps {
  report: MonthlyReportResponse | null;
  isLoading: boolean;
  error: string | null;
  includeOther: boolean;
  onIncludeOtherChange: (includeOther: boolean) => void;
  onRefresh: () => void;
}

/** 使用数（オレンジ）・残数（ブルーグレー）の塗り。原本の合計行の色に合わせる。 */
const FILL_USED_CLASS = 'bg-[#D9B382]/40';
const FILL_REMAINING_CLASS = 'bg-[#9DB2BF]/40';

const CELL = 'border border-sumi/40 px-2 py-1';

/** 帳票1ブロック（第N期の縦長の表）。 */
function ReportBlock({ block, minRows }: { block: MonthlyReportBlock; minRows: number }) {
  // 原本は固定の枠で印刷されるため、行数の少ないブロックは空行で下端を揃える
  const padding = Math.max(0, minRows - block.rows.length);

  return (
    <div className="shrink-0">
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th
              colSpan={4}
              className={cn(CELL, 'py-1.5 text-center font-bold text-sumi bg-kinari whitespace-nowrap')}
            >
              {block.title}
            </th>
          </tr>
          <tr>
            <th className={cn(CELL, 'font-semibold text-hai bg-kinari/60 w-[5.5rem]')}>区</th>
            <th className={cn(CELL, 'font-semibold text-hai bg-kinari/60 w-[4.5rem]')}>区画数</th>
            <th className={cn(CELL, 'font-semibold text-hai bg-kinari/60 w-[4.5rem]')}>使用数</th>
            <th className={cn(CELL, 'font-semibold text-hai bg-kinari/60 w-[4.5rem]')}>残数</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label}>
              <td className={cn(CELL, 'text-center text-sumi whitespace-nowrap')}>{row.label}</td>
              <td className={cn(CELL, 'text-right tabular-nums text-sumi')}>
                {row.totalCount.toLocaleString()}
              </td>
              <td className={cn(CELL, 'text-right tabular-nums text-sumi')}>
                {row.usedCount.toLocaleString()}
              </td>
              <td
                className={cn(
                  CELL,
                  'text-right tabular-nums',
                  row.remainingCount > 0 ? 'text-ai font-medium' : 'text-hai'
                )}
              >
                {row.remainingCount.toLocaleString()}
              </td>
            </tr>
          ))}
          {Array.from({ length: padding }, (_, i) => (
            <tr key={`pad-${i}`} aria-hidden="true">
              <td className={CELL}>&nbsp;</td>
              <td className={CELL} />
              <td className={CELL} />
              <td className={CELL} />
            </tr>
          ))}
          <tr className="font-bold">
            <td className={cn(CELL, 'text-center text-sumi')}>{block.total.label}</td>
            <td className={cn(CELL, 'text-right tabular-nums text-sumi')}>
              {block.total.totalCount.toLocaleString()}
            </td>
            <td className={cn(CELL, FILL_USED_CLASS, 'text-right tabular-nums text-sumi')}>
              {block.total.usedCount.toLocaleString()}
            </td>
            <td className={cn(CELL, FILL_REMAINING_CLASS, 'text-right tabular-nums text-sumi')}>
              {block.total.remainingCount.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** 左下の集計表。 */
function SummaryTable({ report }: { report: MonthlyReportResponse }) {
  const { summary } = report;
  const asOf = new Date(report.asOfDate);
  const rows: Array<{ label: string; value: number; fill?: string; note?: string }> = [
    { label: '総区画数', value: summary.totalCount },
    {
      label: '累計販売区画数',
      value: summary.cumulativeSoldCount,
      note: '契約日が入っている契約の全期間累計',
    },
    {
      label: '今年度販売区画数',
      value: summary.soldThisFiscalYear,
      note: formatFiscalYear(summary.fiscalYear),
    },
    { label: '使用区画数', value: summary.usedCount, fill: FILL_USED_CLASS },
    { label: '残区画数', value: summary.remainingCount, fill: FILL_REMAINING_CLASS },
  ];

  return (
    <table className="border-collapse text-sm">
      <thead>
        <tr>
          <th className={cn(CELL, 'bg-kinari/60')} />
          <th className={cn(CELL, 'px-3 bg-kinari/60 font-semibold text-hai w-[6rem]')}>
            {asOf.getFullYear()}/{asOf.getMonth() + 1}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className={cn(CELL, 'text-sumi whitespace-nowrap')}>
              {row.label}
              {row.note && <span className="ml-2 text-xs text-hai">{row.note}</span>}
            </td>
            <td
              className={cn(CELL, 'px-3 text-right tabular-nums font-medium text-sumi', row.fill)}
            >
              {row.value.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MonthlyReportView({
  report,
  isLoading,
  error,
  includeOther,
  onIncludeOtherChange,
  onRefresh,
}: MonthlyReportViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!report) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadMonthlyReportExcel(report);
    } catch {
      setDownloadError('Excelの作成に失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="p-3 md:p-6">
        <div className="rounded-elegant border border-beni-200 bg-beni-50 p-4 text-sm text-beni-dark">
          {error}
          <button onClick={onRefresh} className="ml-3 underline hover:no-underline">
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !report) {
    return (
      <div className="p-3 md:p-6 text-sm text-hai">
        <RefreshCw className="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />
        月次報告データを集計中...
      </div>
    );
  }

  if (!report) return null;

  const minRows = Math.max(...report.blocks.map((b) => b.rows.length));

  return (
    <div className="p-3 md:p-6">
      {/* ヘッダー */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="font-mincho text-lg md:text-xl font-bold text-sumi">区画残数</h2>
            <span className="text-sm md:text-base text-sumi">
              {formatAsOfLabel(report.asOfDate)}
            </span>
          </div>
          <p className="mt-1 text-xs text-hai">
            集計時点: {formatAsOfExact(report.asOfDate)}
            <span className="ml-2">
              （区画の増減履歴を持たないため、過去月時点の再現ではありません）
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-hai">
            <input
              type="checkbox"
              checked={includeOther}
              onChange={(e) => onIncludeOtherChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-ai"
            />
            レイアウト外の区画も含める
          </label>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-elegant border border-gin bg-white px-3 py-1.5 text-sm text-hai transition-colors hover:text-sumi disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} aria-hidden="true" />
            更新
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 rounded-elegant bg-matsu px-3 py-1.5 text-sm font-medium text-white shadow-elegant transition-colors hover:bg-matsu-dark disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {isDownloading ? '作成中...' : 'Excelダウンロード'}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="mb-4 rounded-elegant border border-beni-200 bg-beni-50 p-3 text-sm text-beni-dark">
          {downloadError}
        </div>
      )}

      {/* 期ブロックを横並びに（原本の配置） */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-4">
          {report.blocks.map((block) => (
            <ReportBlock key={block.period} block={block} minRows={minRows} />
          ))}
        </div>
      </div>

      {/* 左下の集計表 */}
      <div className="mt-6 overflow-x-auto">
        <SummaryTable report={report} />
      </div>

      {/* レイアウト外の区画 */}
      {report.otherBlock && (
        <div className="mt-8">
          <div className="mb-2 flex items-start gap-2 text-sm text-hai">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ai" aria-hidden="true" />
            <p>
              この帳票のレイアウトに含まれない区画が{' '}
              <span className="font-bold text-sumi tabular-nums">
                {report.otherBlock.total.totalCount.toLocaleString()}
              </span>{' '}
              件あります。上の5ブロックと合わせて全区画数になります。
            </p>
          </div>
          <div className="overflow-x-auto pb-2">
            <ReportBlock block={report.otherBlock} minRows={0} />
          </div>
        </div>
      )}
    </div>
  );
}
