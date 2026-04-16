'use client';

import { useMemo, useState } from 'react';
import { Landmark, Download, FileText, Wallet, Users } from 'lucide-react';
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
import { BaseDialog } from '@/components/shared/dialogs/BaseDialog';
import { showSuccess } from '@/lib/toast';
import {
  getYuchoBillings,
  type ManagementFeeBilling,
  type CollectiveBurialBilling,
} from '@/lib/mock-data/yucho-billing';
import { buildYuchoCsv, downloadCsv } from './yuchoCsv';

const AVAILABLE_YEARS = [2024, 2025, 2026];
const DEFAULT_CLIENT_CODE = '00000000';
const DEFAULT_CLIENT_NAME = '小嶺霊園';
const DEFAULT_DEPOSITOR_CODE = '000000';

function formatYen(amount: number) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

function statusBadge(status: 'pending' | 'ready' | 'exported') {
  const styles: Record<typeof status, string> = {
    pending: 'bg-kinari text-hai border-gin',
    ready: 'bg-matsu-50 text-matsu border-matsu-200',
    exported: 'bg-ai/10 text-ai border-ai/30',
  };
  const labels: Record<typeof status, string> = {
    pending: '未確定',
    ready: '出力準備',
    exported: '出力済',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs border font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: 'matsu' | 'cha' | 'ai' | 'kohaku';
}

const accentStyles: Record<SummaryCardProps['accent'], string> = {
  matsu: 'bg-matsu-50 text-matsu border-matsu-200',
  cha: 'bg-cha-50 text-cha border-cha/30',
  ai: 'bg-ai/10 text-ai border-ai/30',
  kohaku: 'bg-kohaku/10 text-kohaku border-kohaku/30',
};

function SummaryCard({ label, value, sub, icon, accent }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gin p-3 md:p-4 shadow-elegant-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-hai">{label}</p>
        <div
          className={`w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center border ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
      <p className="font-mincho text-lg md:text-2xl font-semibold text-sumi">{value}</p>
      {sub && <p className="text-[10px] md:text-xs text-hai mt-0.5">{sub}</p>}
    </div>
  );
}

export default function YuchoManagement() {
  const [billingYear, setBillingYear] = useState(2026);
  const [activeTab, setActiveTab] = useState<'management' | 'collective'>('management');
  const [previewOpen, setPreviewOpen] = useState(false);

  const { management, collective, managementTotal, collectiveTotal, grandTotal, totalCount } =
    useMemo(() => getYuchoBillings(billingYear), [billingYear]);

  const csvPreview = useMemo(
    () =>
      buildYuchoCsv(management, collective, {
        clientCode: DEFAULT_CLIENT_CODE,
        clientName: DEFAULT_CLIENT_NAME,
        depositorCode: DEFAULT_DEPOSITOR_CODE,
        withdrawalDate: `${billingYear}0531`,
        billingYear,
      }),
    [management, collective, billingYear],
  );

  const handleDownload = () => {
    downloadCsv(`yucho_${billingYear}.csv`, csvPreview);
    showSuccess('CSVを出力したよ', `${billingYear}年度 ${totalCount}件`);
    setPreviewOpen(false);
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
                <SelectTrigger className="w-32 md:w-40">
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
                onClick={() => setPreviewOpen(true)}
                disabled={totalCount === 0}
              >
                <FileText className="w-4 h-4 mr-1.5" />
                プレビュー
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={handleDownload}
                disabled={totalCount === 0}
              >
                <Download className="w-4 h-4 mr-1.5" />
                CSV出力
              </Button>
            </div>
          </div>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <SummaryCard
            label="管理料合計"
            value={formatYen(managementTotal)}
            sub={`${management.length}件`}
            icon={<Wallet className="w-4 h-4" />}
            accent="matsu"
          />
          <SummaryCard
            label="合祀料金合計"
            value={formatYen(collectiveTotal)}
            sub={`${collective.length}件`}
            icon={<Users className="w-4 h-4" />}
            accent="cha"
          />
          <SummaryCard
            label="総合計"
            value={formatYen(grandTotal)}
            sub={`全${totalCount}件`}
            icon={<Landmark className="w-4 h-4" />}
            accent="ai"
          />
          <SummaryCard
            label="引落予定日"
            value={`${billingYear}/05/31`}
            sub="※仮設定"
            icon={<FileText className="w-4 h-4" />}
            accent="kohaku"
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
              <ManagementTable items={management} />
            </TabsContent>
            <TabsContent value="collective">
              <CollectiveTable items={collective} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CSVプレビューダイアログ */}
      <BaseDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="CSVプレビュー"
        description={`${billingYear}年度 ゆうちょ自動払込CSV（${totalCount}件 / ${formatYen(grandTotal)}）`}
        size="full"
        footer={
          <>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              閉じる
            </Button>
            <Button variant="ai" onClick={handleDownload} disabled={totalCount === 0}>
              <Download className="w-4 h-4 mr-1.5" />
              ダウンロード
            </Button>
          </>
        }
      >
        <pre className="bg-sumi text-white text-[10px] md:text-xs p-3 md:p-4 rounded-md overflow-auto max-h-[50vh] whitespace-pre font-mono">
          {csvPreview || '出力対象データがありません'}
        </pre>
        <p className="text-[10px] md:text-xs text-hai mt-2">
          ※ フォーマットは仮実装。ゆうちょBizダイレクト仕様確定後に正式対応予定。
        </p>
      </BaseDialog>
    </div>
  );
}

function ManagementTable({ items }: { items: ManagementFeeBilling[] }) {
  if (items.length === 0) {
    return <EmptyState message="対象の管理料データがないよ" />;
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
                <tr key={item.id} className="border-t border-gin hover:bg-kinari/50">
                  <td className="px-4 py-3 font-mono text-sumi">{item.plotNumber}</td>
                  <td className="px-4 py-3 text-sumi">{item.section}</td>
                  <td className="px-4 py-3 text-sumi">
                    <div>{item.contractorName}</div>
                    <div className="text-xs text-hai">{item.contractorNameKana}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-hai">
                    {item.yuchoSymbol}-{item.yuchoNumber}
                  </td>
                  <td className="px-4 py-3 text-right font-mincho text-sumi">
                    {formatYen(item.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gin p-3 shadow-elegant-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-hai">{item.plotNumber}</p>
                <p className="text-sm text-sumi truncate">{item.contractorName}</p>
                <p className="text-[10px] text-hai truncate">{item.contractorNameKana}</p>
              </div>
              {statusBadge(item.status)}
            </div>
            <div className="flex items-end justify-between pt-2 border-t border-gin">
              <p className="font-mono text-[10px] text-hai">
                {item.yuchoSymbol}-{item.yuchoNumber}
              </p>
              <p className="font-mincho text-sumi">{formatYen(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CollectiveTable({ items }: { items: CollectiveBurialBilling[] }) {
  if (items.length === 0) {
    return <EmptyState message="対象の合祀料金データがないよ" />;
  }
  return (
    <>
      <div className="hidden md:block bg-white rounded-lg border border-gin shadow-elegant-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-kinari text-hai text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-medium">申込者</th>
                <th className="text-left px-4 py-3 font-medium">対象故人</th>
                <th className="text-left px-4 py-3 font-medium">記号・番号</th>
                <th className="text-right px-4 py-3 font-medium">金額</th>
                <th className="text-center px-4 py-3 font-medium">状態</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gin hover:bg-kinari/50">
                  <td className="px-4 py-3 text-sumi">
                    <div>{item.applicantName}</div>
                    <div className="text-xs text-hai">{item.applicantNameKana}</div>
                  </td>
                  <td className="px-4 py-3 text-sumi">{item.deceasedName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-hai">
                    {item.yuchoSymbol}-{item.yuchoNumber}
                  </td>
                  <td className="px-4 py-3 text-right font-mincho text-sumi">
                    {formatYen(item.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gin p-3 shadow-elegant-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="text-sm text-sumi truncate">{item.applicantName}</p>
                <p className="text-[10px] text-hai truncate">{item.applicantNameKana}</p>
                <p className="text-xs text-hai mt-1">故人: {item.deceasedName}</p>
              </div>
              {statusBadge(item.status)}
            </div>
            <div className="flex items-end justify-between pt-2 border-t border-gin">
              <p className="font-mono text-[10px] text-hai">
                {item.yuchoSymbol}-{item.yuchoNumber}
              </p>
              <p className="font-mincho text-sumi">{formatYen(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg border border-gin border-dashed p-8 md:p-12 text-center">
      <p className="text-sm text-hai">{message}</p>
    </div>
  );
}
