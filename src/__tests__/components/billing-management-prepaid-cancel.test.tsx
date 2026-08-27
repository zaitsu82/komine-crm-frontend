import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { Billing } from '@komine/types';
import BillingManagement from '@/components/billing/billing-management';

const mockUseHasPermission = jest.fn();
jest.mock('@/hooks', () => ({
  useHasPermission: (...args: unknown[]) => mockUseHasPermission(...args),
}));

const getBillings = jest.fn();
const getBillingSummary = jest.fn();
const deletePrepaidBilling = jest.fn();
jest.mock('@/lib/api/billings', () => ({
  getBillings: (...a: unknown[]) => getBillings(...a),
  getBillingSummary: (...a: unknown[]) => getBillingSummary(...a),
  createBilling: jest.fn(),
  updateBilling: jest.fn(),
  deleteBilling: jest.fn(),
  deletePrepaidBilling: (...a: unknown[]) => deletePrepaidBilling(...a),
  BILLING_CATEGORY_LABELS: {
    usage_fee: '使用料',
    management_fee: '管理料',
    collective_fee: '合祀料金',
    construction_fee: '工事料金',
    gravestone_fee: '墓石代',
    other: 'その他',
  },
  BILLING_RECORD_STATUS_LABELS: {
    pending: '請求前',
    billed: '請求済',
    partial_paid: '一部入金',
    paid: '全額入金',
    overdue: '延滞',
    terminated: '解約済',
    written_off: '貸倒',
  },
}));

jest.mock('@/lib/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showApiError: jest.fn(),
}));

jest.mock('@/components/billing/billing-form-dialog', () => ({
  BillingFormDialog: () => null,
}));
jest.mock('@/components/billing/billing-detail-dialog', () => ({
  BillingDetailDialog: () => null,
}));
jest.mock('@/components/billing/prepaid-billing-dialog', () => ({
  PrepaidBillingDialog: () => null,
}));

const prepaidBilling = {
  id: 'b-prepaid',
  contractPlotId: 'plot-1',
  customerId: 'cust-1',
  category: 'management_fee',
  amount: 1250,
  paidAmount: 1250,
  status: 'paid',
  billingDate: '2097-09-01',
  prepaidBatchId: 'batch-1',
  plotNumber: 'A-12',
  displayNumber: 'A-12',
  areaName: '第1期',
  customer: { id: 'cust-1', name: '山田太郎', nameKana: 'ヤマダタロウ' },
} as unknown as Billing;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseHasPermission.mockReturnValue(true);
  getBillings.mockResolvedValue({
    success: true,
    data: {
      items: [prepaidBilling],
      pagination: { page: 1, limit: 50, totalCount: 1, totalPages: 1 },
    },
  });
  getBillingSummary.mockResolvedValue({
    success: true,
    data: { totalAmount: 1250, paidAmount: 1250, unpaidAmount: 0, overdueCount: 0 },
  });
  deletePrepaidBilling.mockResolvedValue({
    success: true,
    data: { message: '前受金の登録を取り消しました（請求3件）' },
  });
});

describe('BillingManagement の前受取り消し', () => {
  it('確認して取り消すと、同じ前受のまとまりを消す', async () => {
    const user = userEvent.setup();
    render(<BillingManagement contractPlotId="plot-1" showHeader={false} />);

    expect(await screen.findByRole('button', { name: '前受取り消し' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '前受取り消し' }));

    expect(await screen.findByText('前受金の取り消し')).toBeInTheDocument();
    expect(screen.getByText(/まとめて取り消します/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '取り消す' }));

    await waitFor(() => {
      expect(deletePrepaidBilling).toHaveBeenCalledWith('batch-1');
    });
  });

  it('マネージャー未満には取り消しボタンを出さない', async () => {
    mockUseHasPermission.mockReturnValue(false);
    render(<BillingManagement contractPlotId="plot-1" showHeader={false} />);

    expect(await screen.findByText('管理料')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '前受取り消し' })).not.toBeInTheDocument();
  });
});
