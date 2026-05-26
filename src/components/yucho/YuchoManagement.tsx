'use client';

import { useMemo, useState } from 'react';
import { Landmark, Download, FileText, Wallet, Users, Loader2, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { StatCard } from '@/components/ui/stat-card';
import { BaseDialog } from '@/components/shared/dialogs/BaseDialog';
import { showSuccess, showError } from '@/lib/toast';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  getYuchoBilling,
  exportYuchoCsv,
  downloadBlob,
  type YuchoBillingItem,
} from '@/lib/api/yucho';

const AVAILABLE_YEARS = [2024, 2025, 2026];
const DEFAULT_CLIENT_CODE = '0000000000';
const DEFAULT_CLIENT_NAME = 'ｺﾐﾈﾚｲｴﾝ';

function formatYen(amount: number) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * BillingInfo の口座番号からゆうちょ風の表示「記号-番号」を組み立てる。
 * 方式A前提: branch_name の3桁数字を支店コードとして「1{支店コード}0」を記号、account_number を番号として表示。
 */
function formatYuchoAccount(item: YuchoBillingItem): string {
  const info = item.billingInfo;
  if (!info) return '—';
  const branch = (info.branchName ?? '').match(/\d{3}/)?.[0];
  const symbol = branch ? `1${branch}0` : info.branchName ?? '';
  const number = info.accountNumber ?? '';
  if (!symbol && !number) return '—';
  return `${symbol}${symbol && number ? '-' : ''}${number}`;
}

function statusBadge(status: string) {
  const isUnpaid = status === 'unpaid' || status === 'pending';
  const isPaid = status === 'paid';
  const styles = isPaid
    ? 'bg-ai/10 text-ai border-ai/30'
    : isUnpaid
      ? 'bg-matsu-50 text-matsu border-matsu-200'
      : 'bg-kinari text-hai border-gin';
  const label = isPaid ? '支払済' : isUnpaid ? '請求対象' : status;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs border font-medium ${styles}`}
    >
      {label}
    </span>
  );
}

export default function YuchoManagement() {
  const [billingYear, setBillingYear] = useState(2026);
  const [activeTab, setActiveTab] = useState<'management' | 'collective'>('management');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useAsyncData(
    () => getYuchoBilling({ year: billingYear, status: 'unbilled' }),
    { deps: [billingYear] },
  );

  const summary = data?.summary;
  const management = useMemo(
    () => (data?.items ?? []).filter((i) => i.category === 'management'),
    [data],
  );
  const collective = useMemo(
    () => (data?.items ?? []).filter((i) => i.category === 'collective'),
    [data],
  );
  const managementTotal = summary?.byCategory.management.amount ?? 0;
  const collectiveTotal = summary?.byCategory.collective.amount ?? 0;
  const grandTotal = summary?.totalAmount ?? 0;
  const totalCount = summary?.totalCount ?? 0;
  // 実際にCSV（振替ファイル）へ出力される件数・金額と、口座未登録で除外される件数（#172）
  const exportableCount = summary?.exportableCount ?? 0;
  const exportableAmount = summary?.exportableAmount ?? 0;
  const excludedNoAccountCount = summary?.excludedNoAccountCount ?? 0;

  // プレビュー用: バックエンドのCSV出力(全銀協固定長)を取得して表示
  const [previewText, setPreviewText] = useState<string>('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const transferDate = `${billingYear}-05-31`;

  const buildExportParams = () => ({
    year: billingYear,
    transferDate,
    clientCode: DEFAULT_CLIENT_CODE,
    clientName: DEFAULT_CLIENT_NAME,
  });

  const openPreview = async () => {
    setPreviewOpen(true);
    setIsPreviewLoading(true);
    try {
      const blob = await exportYuchoCsv(buildExportParams());
      const text = await blob.text();
      setPreviewText(text);
    } catch (e) {
      showError('プレビューの取得に失敗しました', e instanceof Error ? e.message : String(e));
      setPreviewText('');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await exportYuchoCsv(buildExportParams());
      downloadBlob(`yucho_${billingYear}.csv`, blob);
      const excludedNote =
        excludedNoAccountCount > 0 ? `（口座未登録${excludedNoAccountCount}件は除外）` : '';
      showSuccess('CSVを出力しました', `${billingYear}年度 ${exportableCount}件出力${excludedNote}`);
      setPreviewOpen(false);
    } catch (e) {
      showError('CSV出力に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-kinari">
      <PageHeader
        title="ゆうちょ連携"
        subtitle="自動払込CSVの作成・出力"
        theme="ai"
        icon={<Landmark className="w-4 h-4 md:w-5 md:h-5 text-white" />}
      />

      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
        {/* 対象期間選択 */}
        <div className="bg-white rounded-lg border border-gin p-3 md:p-4 shadow-elegant-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-sumi whitespace-nowrap">対象年度</label>
              <Select
                value={String(billingYear)}
                onValueChange={(v) => setBillingYear(Number(v))}
              >
                <SelectTrigger id="yucho-year-select" className="w-32 md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}年度
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openPreview}
                disabled={exportableCount === 0 || isLoading}
              >
                <FileText className="w-4 h-4 mr-1.5" />
                プレビュー
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={handleDownload}
                disabled={exportableCount === 0 || isLoading || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1.5" />
                )}
                CSV出力
              </Button>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-white rounded-lg border border-matsu-200 p-3 md:p-4 shadow-elegant-sm">
            <div className="flex items-start gap-2 text-matsu">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">データの取得に失敗しました</p>
                <p className="text-xs text-hai mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 口座未登録による除外の警告（#172: 無言除外で請求漏れに気づけない問題への可視化） */}
        {!isLoading && excludedNoAccountCount > 0 && (
          <div className="bg-kohaku-50 border border-kohaku-200 rounded-lg p-3 md:p-4 shadow-elegant-sm">
            <div className="flex items-start gap-2 text-kohaku-dark">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">
                  口座未登録の {excludedNoAccountCount}件 が振替ファイルから除外されます
                </p>
                <p className="text-xs mt-0.5">
                  全{totalCount}件中 {exportableCount}件 を出力します。記号・番号が「—」の対象は口座が未登録のため、別途の請求対応が必要です。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* サマリー */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            label="管理料合計"
            value={formatYen(managementTotal)}
            description={`${management.length}件`}
            icon={<Wallet className="w-4 h-4" />}
            theme="matsu"
          />
          <StatCard
            label="合祀料金合計"
            value={formatYen(collectiveTotal)}
            description={`${collective.length}件`}
            icon={<Users className="w-4 h-4" />}
            theme="cha"
          />
          <StatCard
            label="総合計"
            value={formatYen(grandTotal)}
            description={
              excludedNoAccountCount > 0
                ? `全${totalCount}件・出力${exportableCount}件`
                : `全${totalCount}件`
            }
            icon={<Landmark className="w-4 h-4" />}
            theme="ai"
          />
          <StatCard
            label="引落予定日"
            value={`${billingYear}/05/31`}
            description="※仮設定"
            icon={<FileText className="w-4 h-4" />}
            theme="kohaku"
          />
        </div>

        {/* タブ */}
        <div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="management" className="flex-1 sm:flex-none">
                管理料 ({management.length})
              </TabsTrigger>
              <TabsTrigger value="collective" className="flex-1 sm:flex-none">
                合祀料金 ({collective.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="management">
              {isLoading ? (
                <LoadingState />
              ) : (
                <ManagementTable items={management} year={billingYear} />
              )}
            </TabsContent>
            <TabsContent value="collective">
              {isLoading ? (
                <LoadingState />
              ) : (
                <CollectiveTable items={collective} year={billingYear} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CSVプレビューダイアログ */}
      <BaseDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="CSVプレビュー"
        description={`${billingYear}年度 ゆうちょ自動払込CSV（出力${exportableCount}件 / ${formatYen(exportableAmount)}${
          excludedNoAccountCount > 0 ? ` ・口座未登録${excludedNoAccountCount}件は除外` : ''
        }）`}
        size="full"
        footer={
          <>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              閉じる
            </Button>
            <Button
              variant="ai"
              onClick={handleDownload}
              disabled={exportableCount === 0 || isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1.5" />
              )}
              ダウンロード
            </Button>
          </>
        }
      >
        {isPreviewLoading ? (
          <div className="flex items-center justify-center p-8 text-hai">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            読み込み中...
          </div>
        ) : (
          <pre className="bg-sumi text-white text-[10px] md:text-xs p-3 md:p-4 rounded-md overflow-auto max-h-[50vh] whitespace-pre font-mono">
            {previewText || '出力対象データがありません'}
          </pre>
        )}
        <p className="text-[10px] md:text-xs text-hai mt-2">
          ※ 全銀協フォーマット(120バイト固定長)。委託者コード・委託者名は仮値。ゆうちょBizダイレクト仕様確定後に正式対応予定。
        </p>
      </BaseDialog>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-lg border border-gin p-8 md:p-12 text-center">
      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-hai" />
      <p className="text-sm text-hai">読み込み中...</p>
    </div>
  );
}

function ManagementTable({ items, year }: { items: YuchoBillingItem[]; year: number }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Wallet className="w-6 h-6" />}
        title={`${year}年度の管理料請求対象がありません`}
        description="対象年度を切り替えるか、区画の管理料マスタが登録されているか確認してください。"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const target = document.getElementById('yucho-year-select');
              target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              target?.focus();
            }}
          >
            対象年度を変更
          </Button>
        }
      />
    );
  }
  return (
    <>
      <div className="hidden md:block bg-white rounded-lg border border-gin shadow-elegant-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-kinari text-hai text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-medium">区画番号</th>
                <th className="text-left px-4 py-3 font-medium">区画名</th>
                <th className="text-left px-4 py-3 font-medium">契約者</th>
                <th className="text-left px-4 py-3 font-medium">記号・番号</th>
                <th className="text-right px-4 py-3 font-medium">金額</th>
                <th className="text-center px-4 py-3 font-medium">状態</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.sourceId} className="border-t border-gin hover:bg-kinari/50">
                  <td className="px-4 py-3 font-mono text-sumi">{item.plotNumber}</td>
                  <td className="px-4 py-3 text-sumi">{item.areaName}</td>
                  <td className="px-4 py-3 text-sumi">
                    <div>{item.customerName ?? '—'}</div>
                    <div className="text-xs text-hai">{item.customerNameKana ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-hai">{formatYuchoAccount(item)}</td>
                  <td className="px-4 py-3 text-right text-sumi tabular-nums">
                    {formatYen(item.billingAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">{statusBadge(item.billingStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div
            key={item.sourceId}
            className="bg-white rounded-lg border border-gin p-3 shadow-elegant-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-hai">{item.plotNumber}</p>
                <p className="text-sm text-sumi truncate">{item.customerName ?? '—'}</p>
                <p className="text-[10px] text-hai truncate">{item.customerNameKana ?? ''}</p>
              </div>
              {statusBadge(item.billingStatus)}
            </div>
            <div className="flex items-end justify-between pt-2 border-t border-gin">
              <p className="font-mono text-[10px] text-hai">{formatYuchoAccount(item)}</p>
              <p className="text-sumi tabular-nums">{formatYen(item.billingAmount)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CollectiveTable({ items, year }: { items: YuchoBillingItem[]; year: number }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6" />}
        title={`${year}年度の合祀料金請求対象がありません`}
        description="対象年度を切り替えるか、合祀者の請求予定年が今年度に設定されているか確認してください。"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const target = document.getElementById('yucho-year-select');
              target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              target?.focus();
            }}
          >
            対象年度を変更
          </Button>
        }
      />
    );
  }
  return (
    <>
      <div className="hidden md:block bg-white rounded-lg border border-gin shadow-elegant-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-kinari text-hai text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-medium">区画番号</th>
                <th className="text-left px-4 py-3 font-medium">申込者</th>
                <th className="text-left px-4 py-3 font-medium">記号・番号</th>
                <th className="text-right px-4 py-3 font-medium">金額</th>
                <th className="text-center px-4 py-3 font-medium">状態</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.sourceId} className="border-t border-gin hover:bg-kinari/50">
                  <td className="px-4 py-3 font-mono text-sumi">{item.plotNumber}</td>
                  <td className="px-4 py-3 text-sumi">
                    <div>{item.customerName ?? '—'}</div>
                    <div className="text-xs text-hai">{item.customerNameKana ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-hai">{formatYuchoAccount(item)}</td>
                  <td className="px-4 py-3 text-right text-sumi tabular-nums">
                    {formatYen(item.billingAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">{statusBadge(item.billingStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div
            key={item.sourceId}
            className="bg-white rounded-lg border border-gin p-3 shadow-elegant-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-hai">{item.plotNumber}</p>
                <p className="text-sm text-sumi truncate">{item.customerName ?? '—'}</p>
                <p className="text-[10px] text-hai truncate">{item.customerNameKana ?? ''}</p>
              </div>
              {statusBadge(item.billingStatus)}
            </div>
            <div className="flex items-end justify-between pt-2 border-t border-gin">
              <p className="font-mono text-[10px] text-hai">{formatYuchoAccount(item)}</p>
              <p className="text-sumi tabular-nums">{formatYen(item.billingAmount)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

