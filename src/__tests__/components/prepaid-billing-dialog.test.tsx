import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrepaidBillingDialog } from '@/components/billing/prepaid-billing-dialog';

jest.mock('@/lib/api/billings', () => ({
  previewPrepaidBilling: jest.fn(),
  createPrepaidBilling: jest.fn(),
}));

jest.mock('@/lib/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showApiError: jest.fn(),
}));

import { previewPrepaidBilling, createPrepaidBilling } from '@/lib/api/billings';

const PLOT_ID = '22222222-2222-4222-8222-222222222222';

const previewMock = previewPrepaidBilling as jest.Mock;
const createMock = createPrepaidBilling as jest.Mock;

const previewOk = {
  success: true,
  data: {
    rows: [
      { year: 2026, amount: 10000, duplicated: false, needsReview: false },
      { year: 2027, amount: 10000, duplicated: false, needsReview: false },
    ],
    startYear: 2026,
    startYearEstimated: true,
    annualFee: 10000,
    difference: 0,
    duplicatedYears: [],
    needsReviewYears: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

const openDialog = () =>
  render(
    <PrepaidBillingDialog
      open
      contractPlotId={PLOT_ID}
      onClose={jest.fn()}
      onCreated={jest.fn()}
    />
  );

describe('PrepaidBillingDialog', () => {
  it('受領額と年数を入力して確認すると年ごとの内訳が出る', async () => {
    previewMock.mockResolvedValue(previewOk);
    const user = userEvent.setup();
    openDialog();

    await user.type(screen.getByLabelText(/受領額/), '20000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));

    expect(await screen.findByText('2026年')).toBeInTheDocument();
    expect(await screen.findByText('2027年')).toBeInTheDocument();
  });

  it('重複年があるときは警告を出して登録できない', async () => {
    previewMock.mockResolvedValue({
      success: true,
      data: { ...previewOk.data, duplicatedYears: [2027] },
    });
    const user = userEvent.setup();
    openDialog();

    await user.type(screen.getByLabelText(/受領額/), '20000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));

    expect(await screen.findByText(/既に請求がある年/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeDisabled();
  });

  it('確認後に登録すると API が呼ばれる', async () => {
    previewMock.mockResolvedValue(previewOk);
    createMock.mockResolvedValue({
      success: true,
      data: {
        prepaidBatchId: 'batch-1',
        billingCount: 2,
        startYear: 2026,
        endYear: 2027,
        totalAmount: 20000,
      },
    });
    const onCreated = jest.fn();
    const user = userEvent.setup();
    render(
      <PrepaidBillingDialog
        open
        contractPlotId={PLOT_ID}
        onClose={jest.fn()}
        onCreated={onCreated}
      />
    );

    await user.type(screen.getByLabelText(/受領額/), '20000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));
    await screen.findByText('2026年');
    await user.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => expect(createMock).toHaveBeenCalled());
    expect(createMock.mock.calls[0][0]).toMatchObject({
      contractPlotId: PLOT_ID,
      receivedAmount: 20000,
      years: 2,
      startYear: 2026,
    });
    expect(onCreated).toHaveBeenCalled();
  });

  it('判定できない年があるときは確認を促す警告を出すが登録はできる', async () => {
    previewMock.mockResolvedValue({
      success: true,
      data: { ...previewOk.data, needsReviewYears: [2026, 2027] },
    });
    const user = userEvent.setup();
    openDialog();

    await user.type(screen.getByLabelText(/受領額/), '20000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));

    expect(await screen.findByText(/請求済みか判定できない年/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeEnabled();
  });

  it('年額との差額があるときは差額を表示する', async () => {
    previewMock.mockResolvedValue({
      success: true,
      data: { ...previewOk.data, difference: 5000 },
    });
    const user = userEvent.setup();
    openDialog();

    await user.type(screen.getByLabelText(/受領額/), '25000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));

    expect(await screen.findByText(/年額との差額/)).toBeInTheDocument();
  });

  it('入力を変更するとプレビューが破棄され登録ボタンが無効になる', async () => {
    previewMock.mockResolvedValue(previewOk);
    const user = userEvent.setup();
    openDialog();

    // 確認して内訳を表示
    await user.type(screen.getByLabelText(/受領額/), '20000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));
    expect(await screen.findByText('2026年')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeEnabled();

    // 受領額を変更すると内訳が消え、登録ボタンが無効になる
    await user.clear(screen.getByLabelText(/受領額/));
    await user.type(screen.getByLabelText(/受領額/), '30000');
    expect(screen.queryByText('2026年')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeDisabled();
  });

  it('開始年が空のとき startYear に null が渡り、推定結果が入力欄に反映される', async () => {
    previewMock.mockResolvedValue(previewOk);
    const user = userEvent.setup();
    openDialog();

    await user.type(screen.getByLabelText(/受領額/), '20000');
    await user.type(screen.getByLabelText(/年数/), '2');
    await user.click(screen.getByRole('button', { name: '確認' }));

    await waitFor(() => expect(previewMock).toHaveBeenCalled());
    expect(previewMock.mock.calls[0][0]).toMatchObject({
      startYear: null,
    });

    // 推定結果が開始年の入力欄に反映される
    expect(screen.getByLabelText(/開始年/)).toHaveValue('2026');
  });
});
