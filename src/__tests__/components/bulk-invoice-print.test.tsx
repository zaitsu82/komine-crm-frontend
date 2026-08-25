/**
 * 請求書一括印刷（議事録 2026-07-21 §7）
 *
 * 3月に数百通を送る運用のため、「誰が印刷対象に入るか」と
 * 「除外した人が PDF に混ざらないか」を固定する。
 */
// jest.mock のファクトリからは `mock` で始まる名前しか参照できないため別名で取り込む
import * as mockReact from 'react';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { BulkInvoiceTarget } from '@komine/types';

import BulkInvoicePrint from '@/components/document/bulk-invoice-print';

const getBulkInvoiceTargets = jest.fn();
const generateBulkInvoice = jest.fn();
const downloadPdfFromBase64 = jest.fn();
jest.mock('@/lib/api/documents', () => ({
  getBulkInvoiceTargets: (...a: unknown[]) => getBulkInvoiceTargets(...a),
  generateBulkInvoice: (...a: unknown[]) => generateBulkInvoice(...a),
  downloadPdfFromBase64: (...a: unknown[]) => downloadPdfFromBase64(...a),
}));

const showError = jest.fn();
const showSuccess = jest.fn();
jest.mock('@/lib/toast', () => ({
  showError: (...a: unknown[]) => showError(...a),
  showSuccess: (...a: unknown[]) => showSuccess(...a),
}));

// Radix Select は jsdom でポップオーバーを開けないため、選択肢を直接押せる形に置き換える
jest.mock('@/components/ui/select', () => {
  const Ctx = mockReact.createContext<((value: string) => void) | undefined>(undefined);
  type Props = { children?: React.ReactNode; value?: string; onValueChange?: (v: string) => void };

  return {
    __esModule: true,
    Select: ({ value, onValueChange, children }: Props) => (
      <Ctx.Provider value={onValueChange}>
        <div data-value={value}>{children}</div>
      </Ctx.Provider>
    ),
    SelectTrigger: ({ children, ...rest }: Props) => <div {...rest}>{children}</div>,
    SelectValue: () => null,
    SelectContent: ({ children }: Props) => <div>{children}</div>,
    SelectItem: ({ children, value }: Props) => {
      const onValueChange = mockReact.useContext(Ctx);
      return (
        <button type="button" onClick={() => onValueChange?.(value ?? '')}>
          {children}
        </button>
      );
    },
  };
});

// PageHeader が UserMenu 経由で参照する。画面の対象抽出とは無関係なため最小限で差し替える
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/bulk-invoice',
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'staff-1', email: 'test@example.com', name: 'テスト太郎', role: 'admin' },
    logout: jest.fn(),
    isLoading: false,
  }),
}));

const target = (overrides: Partial<BulkInvoiceTarget> = {}): BulkInvoiceTarget => ({
  contractPlotId: 'cp-1',
  customerId: 'cust-1',
  customerName: '山田 太郎',
  customerNameKana: 'ヤマダ タロウ',
  areaName: '第1期',
  plotNumber: 'A-56',
  displayNumber: 'A-56',
  billingYears: 10,
  billingMonth: 3,
  lastBillingMonth: '2017-03',
  targetYear: 2027,
  amount: 82800,
  nextNoticeDate: '2037年3月',
  overdue: false,
  ...overrides,
});

const TARGETS = [
  target(),
  target({
    contractPlotId: 'cp-2',
    customerName: '佐藤 花子',
    billingYears: 5,
    lastBillingMonth: '2022-03',
    amount: 31820,
  }),
];

beforeEach(() => {
  jest.clearAllMocks();
  getBulkInvoiceTargets.mockResolvedValue({
    success: true,
    data: { targets: TARGETS, total: 2, totalAmount: 114620 },
  });
  generateBulkInvoice.mockResolvedValue({
    success: true,
    data: {
      pdf: 'JVBERi0=',
      mimeType: 'application/pdf',
      fileName: '護持費のお知らせ_202703_2件.pdf',
      fileSize: 8,
      count: 2,
    },
  });
});

describe('請求書一括印刷', () => {
  it('対象一覧と合計金額を表示する', async () => {
    render(<BulkInvoicePrint />);

    // デスクトップの表とモバイルのカードが同じ内容を描画するため件数は問わない
    expect(await screen.findAllByText('山田 太郎')).not.toHaveLength(0);
    expect(screen.getAllByText('佐藤 花子')).not.toHaveLength(0);
    expect(screen.getAllByText('¥114,620')).not.toHaveLength(0);
  });

  it('既定では五年一回・十年一回のみを、請求月3月で問い合わせる', async () => {
    render(<BulkInvoicePrint />);

    await waitFor(() => expect(getBulkInvoiceTargets).toHaveBeenCalled());
    expect(getBulkInvoiceTargets).toHaveBeenCalledWith(
      expect.objectContaining({ month: 3, billingYears: [5, 10], includeOverdue: true })
    );
  });

  it('支払い周期を十年一回のみに絞ると再取得する', async () => {
    const user = userEvent.setup();
    render(<BulkInvoicePrint />);
    await screen.findAllByText('山田 太郎');

    await user.click(screen.getByRole('button', { name: '十年一回のみ' }));

    await waitFor(() =>
      expect(getBulkInvoiceTargets).toHaveBeenLastCalledWith(
        expect.objectContaining({ billingYears: [10] })
      )
    );
  });

  it('全件が対象なら contractPlotIds を送らず、サーバの抽出結果をそのまま使う', async () => {
    const user = userEvent.setup();
    render(<BulkInvoicePrint />);
    await screen.findAllByText('山田 太郎');

    await user.click(screen.getByRole('button', { name: /2件をPDF出力/ }));

    await waitFor(() => expect(generateBulkInvoice).toHaveBeenCalled());
    expect(generateBulkInvoice.mock.calls[0][0]).not.toHaveProperty('contractPlotIds');
    expect(downloadPdfFromBase64).toHaveBeenCalledWith(
      'JVBERi0=',
      '護持費のお知らせ_202703_2件.pdf'
    );
  });

  it('チェックを外した契約者は印刷対象から除く', async () => {
    const user = userEvent.setup();
    render(<BulkInvoicePrint />);
    await screen.findAllByText('山田 太郎');

    await user.click(screen.getAllByLabelText('山田 太郎 を印刷対象にする')[0]);

    expect(await screen.findByRole('button', { name: /1件をPDF出力/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /1件をPDF出力/ }));

    await waitFor(() => expect(generateBulkInvoice).toHaveBeenCalled());
    expect(generateBulkInvoice.mock.calls[0][0].contractPlotIds).toEqual(['cp-2']);
  });

  it('請求漏れが含まれるときは警告を出す', async () => {
    getBulkInvoiceTargets.mockResolvedValue({
      success: true,
      data: {
        targets: [target({ overdue: true, targetYear: 2022 })],
        total: 1,
        totalAmount: 82800,
      },
    });

    render(<BulkInvoicePrint />);

    expect(await screen.findByText(/請求すべきだった 1件/)).toBeInTheDocument();
  });

  it('対象が0件なら出力ボタンを押せない', async () => {
    getBulkInvoiceTargets.mockResolvedValue({
      success: true,
      data: { targets: [], total: 0, totalAmount: 0 },
    });

    render(<BulkInvoicePrint />);

    expect(await screen.findByText(/請求する対象がありません/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /0件をPDF出力/ })).toBeDisabled();
  });

  it('生成に失敗したらエラーを通知し、ダウンロードしない', async () => {
    const user = userEvent.setup();
    generateBulkInvoice.mockResolvedValue({
      success: false,
      error: { code: 'PDF_GENERATION_ERROR', message: 'PDF生成に失敗しました' },
    });

    render(<BulkInvoicePrint />);
    await screen.findAllByText('山田 太郎');

    await user.click(screen.getByRole('button', { name: /2件をPDF出力/ }));

    await waitFor(() => expect(showError).toHaveBeenCalled());
    expect(downloadPdfFromBase64).not.toHaveBeenCalled();
  });
});
