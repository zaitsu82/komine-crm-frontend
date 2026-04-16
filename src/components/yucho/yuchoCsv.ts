// ゆうちょ自動払込CSV生成（モック実装）
// 正式フォーマットは顧客確認後に確定。現状は全銀/ゆうちょ標準の共通的な項目を含むダミー形式。

import type {
  ManagementFeeBilling,
  CollectiveBurialBilling,
} from '@/lib/mock-data/yucho-billing';

export interface CsvOptions {
  clientCode: string;
  clientName: string;
  depositorCode: string;
  withdrawalDate: string;
  billingYear: number;
}

type Row = {
  type: '管理料' | '合祀';
  symbol: string;
  number: string;
  payerName: string;
  payerNameKana: string;
  amount: number;
};

function toRows(
  management: ManagementFeeBilling[],
  collective: CollectiveBurialBilling[],
): Row[] {
  return [
    ...management.map<Row>((m) => ({
      type: '管理料',
      symbol: m.yuchoSymbol,
      number: m.yuchoNumber,
      payerName: m.contractorName,
      payerNameKana: m.contractorNameKana,
      amount: m.amount,
    })),
    ...collective.map<Row>((c) => ({
      type: '合祀',
      symbol: c.yuchoSymbol,
      number: c.yuchoNumber,
      payerName: c.applicantName,
      payerNameKana: c.applicantNameKana,
      amount: c.amount,
    })),
  ];
}

export function buildYuchoCsv(
  management: ManagementFeeBilling[],
  collective: CollectiveBurialBilling[],
  options: CsvOptions,
): string {
  const rows = toRows(management, collective);
  const totalAmount = rows.reduce((sum, r) => sum + r.amount, 0);
  const totalCount = rows.length;

  const header = [
    '1',
    options.clientCode,
    options.clientName,
    options.depositorCode,
    options.withdrawalDate,
  ].join(',');

  const dataLines = rows.map((r, i) =>
    [
      '2',
      String(i + 1).padStart(6, '0'),
      r.type,
      r.symbol,
      r.number,
      r.payerNameKana,
      r.payerName,
      String(r.amount),
    ].join(','),
  );

  const trailer = ['8', String(totalCount), String(totalAmount)].join(',');
  const end = ['9', String(options.billingYear)].join(',');

  return [header, ...dataLines, trailer, end].join('\r\n');
}

export function downloadCsv(filename: string, content: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
