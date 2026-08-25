'use client';

import { useEffect, useMemo, useState } from 'react';
import { Printer, Download, Loader2, AlertCircle, FileWarning, Wallet, Users } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCard } from '@/components/ui/stat-card';
import { LegacyAwareValue } from '@/components/legacy-aware-value';
import { showSuccess, showError } from '@/lib/toast';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  getBulkInvoiceTargets,
  generateBulkInvoice,
  downloadPdfFromBase64,
} from '@/lib/api/documents';
import type { BulkInvoiceTarget } from '@komine/types';

/** 支払い周期の選択肢。年払い（1年）は毎年の請求のため一括印刷の対象外 */
const CYCLE_OPTIONS = [
  { value: '5,10', label: '五年一回・十年一回' },
  { value: '5', label: '五年一回のみ' },
  { value: '10', label: '十年一回のみ' },
] as const;

/** 請求月。ほぼ全件が3月だが、月未設定などを拾うため「すべて」も選べる */
const MONTH_OPTIONS = [
  { value: '3', label: '3月' },
  { value: 'all', label: 'すべての月' },
] as const;

function formatYen(amount: number) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * 既定の請求対象年。請求月（3月）を過ぎていれば翌年を初期表示する。
 */
function defaultTargetYear(now: Date = new Date()): number {
  return now.getMonth() + 1 > 3 ? now.getFullYear() + 1 : now.getFullYear();
}

export default function BulkInvoicePrint() {
  const [year, setYear] = useState(() => defaultTargetYear());
  const [cycle, setCycle] = useState<string>('5,10');
  const [month, setMonth] = useState<string>('3');
  const [includeOverdue, setIncludeOverdue] = useState(true);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const billingYears = useMemo(() => cycle.split(',').map(Number), [cycle]);

  const { data, isLoading, error } = useAsyncData(
    () =>
      getBulkInvoiceTargets({
        year,
        ...(month === 'all' ? {} : { month: Number(month) }),
        billingYears,
        includeOverdue,
      }),
    { deps: [year, cycle, month, includeOverdue] },
  );

  const targets = useMemo(() => data?.targets ?? [], [data]);

  // 条件を変えたら除外指定はリセットする（別の対象集合に前回の除外を持ち越さない）
  useEffect(() => {
    setExcludedIds(new Set());
  }, [year, cycle, month, includeOverdue]);

  const selected = useMemo(
    () => targets.filter((t) => !excludedIds.has(t.contractPlotId)),
    [targets, excludedIds],
  );
  const selectedAmount = selected.reduce((sum, t) => sum + t.amount, 0);
  const overdueCount = selected.filter((t) => t.overdue).length;

  const toggle = (contractPlotId: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contractPlotId)) {
        next.delete(contractPlotId);
      } else {
        next.add(contractPlotId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setExcludedIds(
      selected.length === targets.length ? new Set(targets.map((t) => t.contractPlotId)) : new Set(),
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await generateBulkInvoice({
        year,
        ...(month === 'all' ? {} : { month: Number(month) }),
        billingYears,
        includeOverdue,
        // 全件が対象なら ID を送らず、サーバ側の抽出結果をそのまま使う
        ...(selected.length === targets.length
          ? {}
          : { contractPlotIds: selected.map((t) => t.contractPlotId) }),
      });

      if (!response.success) {
        showError('PDFの生成に失敗しました', response.error.message);
        return;
      }

      downloadPdfFromBase64(response.data.pdf, response.data.fileName);
      showSuccess('請求書を出力しました', `${response.data.count}件を1つのPDFにまとめました`);
    } catch (e) {
      showError('PDFの生成に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-kinari">
      <PageHeader
        title="請求書一括印刷"
        subtitle="十年一回・五年一回払いの契約者へ、請求年の護持費のお知らせをまとめて印刷"
        theme="matsu"
        icon={<Printer className="w-4 h-4 md:w-5 md:h-5 text-white" />}
      />

      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="bg-white rounded-lg border border-gin p-3 md:p-4 shadow-elegant-sm">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="bulk-invoice-year" className="text-sm font-medium text-sumi whitespace-nowrap">
                請求対象年
              </label>
              <Input
                id="bulk-invoice-year"
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-28"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-sumi whitespace-nowrap">請求月</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="bulk-invoice-month" className="w-36" aria-label="請求月">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-sumi whitespace-nowrap">支払い周期</label>
              <Select value={cycle} onValueChange={setCycle}>
                <SelectTrigger id="bulk-invoice-cycle" className="w-48" aria-label="支払い周期">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CYCLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm text-sumi cursor-pointer">
              <input
                type="checkbox"
                checked={includeOverdue}
                onChange={(e) => setIncludeOverdue(e.target.checked)}
                className="w-4 h-4 accent-matsu"
              />
              過去の請求漏れも含める
            </label>

            <div className="lg:ml-auto">
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerate}
                disabled={selected.length === 0 || isLoading || isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1.5" />
                )}
                {selected.length}件をPDF出力
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-white rounded-lg border border-matsu-200 p-3 md:p-4 shadow-elegant-sm">
            <div className="flex items-start gap-2 text-matsu">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">対象の取得に失敗しました</p>
                <p className="text-xs text-hai mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && overdueCount > 0 && (
          <div className="bg-kohaku-50 border border-kohaku-200 rounded-lg p-3 md:p-4 shadow-elegant-sm">
            <div className="flex items-start gap-2 text-kohaku-dark">
              <FileWarning className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">
                  {year}年より前に請求すべきだった {overdueCount}件 が含まれています
                </p>
                <p className="text-xs mt-0.5">
                  最終請求月から請求年数を過ぎている契約です。内容を確認のうえ印刷するか、「過去の請求漏れも含める」を外してください。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatCard
            label="印刷対象"
            value={`${selected.length}件`}
            description={
              targets.length === selected.length ? '全件を印刷' : `全${targets.length}件中`
            }
            icon={<Users className="w-4 h-4" />}
            theme="matsu"
          />
          <StatCard
            label="請求金額の合計"
            value={formatYen(selectedAmount)}
            description={`${year}年${month === 'all' ? '' : `${month}月`}分`}
            icon={<Wallet className="w-4 h-4" />}
            theme="ai"
          />
          <StatCard
            label="請求漏れ"
            value={`${overdueCount}件`}
            description={includeOverdue ? '対象に含む' : '対象から除外中'}
            icon={<FileWarning className="w-4 h-4" />}
            theme="kohaku"
          />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg border border-gin p-8 md:p-12 text-center">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-hai" />
            <p className="text-sm text-hai">読み込み中...</p>
          </div>
        ) : targets.length === 0 ? (
          <EmptyState
            icon={<Printer className="w-6 h-6" />}
            title={`${year}年に請求する対象がありません`}
            description="請求対象年を変えるか、支払い周期・請求月の条件を広げてください。年払いの契約者は一括印刷の対象外です。"
          />
        ) : (
          <TargetTable
            targets={targets}
            excludedIds={excludedIds}
            onToggle={toggle}
            onToggleAll={toggleAll}
            allSelected={selected.length === targets.length}
          />
        )}
      </div>
    </div>
  );
}

function TargetTable({
  targets,
  excludedIds,
  onToggle,
  onToggleAll,
  allSelected,
}: {
  targets: BulkInvoiceTarget[];
  excludedIds: Set<string>;
  onToggle: (contractPlotId: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
}) {
  return (
    <>
      <div className="hidden md:block bg-white rounded-lg border border-gin shadow-elegant-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-kinari text-hai text-xs">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    aria-label="すべて選択"
                    className="w-4 h-4 accent-matsu"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium">区画番号</th>
                <th className="text-left px-4 py-3 font-medium">区画名</th>
                <th className="text-left px-4 py-3 font-medium">契約者</th>
                <th className="text-left px-4 py-3 font-medium">支払い周期</th>
                <th className="text-left px-4 py-3 font-medium">最終請求</th>
                <th className="text-left px-4 py-3 font-medium">請求対象年</th>
                <th className="text-right px-4 py-3 font-medium">金額</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => {
                const excluded = excludedIds.has(t.contractPlotId);
                return (
                  <tr
                    key={t.contractPlotId}
                    className={`border-t border-gin hover:bg-kinari/50 ${excluded ? 'opacity-40' : ''}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!excluded}
                        onChange={() => onToggle(t.contractPlotId)}
                        aria-label={`${t.customerName} を印刷対象にする`}
                        className="w-4 h-4 accent-matsu"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-sumi">
                      <LegacyAwareValue value={t.displayNumber || t.plotNumber} kind="plotNumber" />
                    </td>
                    <td className="px-4 py-3 text-sumi">
                      <LegacyAwareValue value={t.areaName} kind="areaName" />
                    </td>
                    <td className="px-4 py-3 text-sumi">
                      <div>{t.customerName}</div>
                      <div className="text-xs text-hai">{t.customerNameKana ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sumi">{t.billingYears}年に1回</td>
                    <td className="px-4 py-3 text-hai tabular-nums">{t.lastBillingMonth ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-sumi tabular-nums">{t.targetYear}年</span>
                      {t.overdue && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border font-medium bg-kohaku-50 text-kohaku-dark border-kohaku-200">
                          請求漏れ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sumi tabular-nums">
                      {formatYen(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {targets.map((t) => {
          const excluded = excludedIds.has(t.contractPlotId);
          return (
            <div
              key={t.contractPlotId}
              className={`bg-white rounded-lg border border-gin p-3 shadow-elegant-sm ${excluded ? 'opacity-40' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-hai">
                    <LegacyAwareValue value={t.displayNumber || t.plotNumber} kind="plotNumber" />
                  </p>
                  <p className="text-sm text-sumi truncate">{t.customerName}</p>
                  <p className="text-[10px] text-hai truncate">{t.customerNameKana ?? ''}</p>
                </div>
                <input
                  type="checkbox"
                  checked={!excluded}
                  onChange={() => onToggle(t.contractPlotId)}
                  aria-label={`${t.customerName} を印刷対象にする`}
                  className="w-4 h-4 accent-matsu shrink-0"
                />
              </div>
              <div className="flex items-end justify-between pt-2 border-t border-gin">
                <p className="text-[10px] text-hai">
                  {t.billingYears}年に1回 ・ 最終請求 {t.lastBillingMonth ?? '—'}
                </p>
                <p className="text-sumi tabular-nums">{formatYen(t.amount)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
