/**
 * マスタ管理 区画名（section-name）の期必須チェック（#227）
 *
 * 区画名マスタは DB で period が NOT NULL。期未入力のまま送信すると
 * backend で NOT NULL 違反 → 原因不明の 500 になるため、
 * フロントで送信前に弾くことを保証する。
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MastersManagement from '@/components/masters-management';

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'staff-1', email: 'admin@example.com', name: '管理者', role: 'admin' },
  }),
}));

const getAllMastersMock = jest.fn();
const createMasterItemMock = jest.fn();
const shouldUseMockDataMock = jest.fn(() => false);
jest.mock('@/lib/api', () => ({
  getAllMasters: (...args: unknown[]) => getAllMastersMock(...args),
  createMasterItem: (...args: unknown[]) => createMasterItemMock(...args),
  updateMasterItem: jest.fn(),
  deleteMasterItem: jest.fn(),
  shouldUseMockData: () => shouldUseMockDataMock(),
}));

jest.mock('@/lib/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

jest.mock('@/hooks/useMasters', () => ({
  clearMastersCache: jest.fn(),
}));

// Radix UI Select はJSDOMで動かないため最小モック
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const emptyMasters = {
  cemeteryType: [],
  paymentMethod: [],
  taxType: [],
  calcType: [],
  billingType: [],
  recipientType: [],
  constructionType: [],
  sectionName: [],
};

async function openSectionNameCreateDialog() {
  const user = userEvent.setup();
  render(<MastersManagement />);

  // データロード完了後、区画名タブへ切り替え
  const sectionNameNav = await screen.findByRole('button', { name: /区画名/ });
  await user.click(sectionNameNav);

  await user.click(screen.getByRole('button', { name: /新規登録/ }));
  return user;
}

describe('マスタ管理 区画名の期必須チェック (#227)', () => {
  beforeEach(() => {
    getAllMastersMock.mockReset();
    getAllMastersMock.mockResolvedValue({ success: true, data: emptyMasters });
    createMasterItemMock.mockReset();
    createMasterItemMock.mockResolvedValue({
      success: true,
      data: { id: 1, code: 'S1', name: '東1', description: null, sortOrder: null, isActive: true, period: '第1期' },
    });
  });

  it('期未入力で作成するとエラー表示し、API を呼ばない', async () => {
    const user = await openSectionNameCreateDialog();

    await user.type(screen.getByLabelText('名称 *'), '東1');
    await user.click(screen.getByRole('button', { name: '作成' }));

    expect(await screen.findByText('期を入力してください')).toBeInTheDocument();
    expect(createMasterItemMock).not.toHaveBeenCalled();
  });

  it('期を入力すれば period 付きで作成 API を呼ぶ', async () => {
    const user = await openSectionNameCreateDialog();

    await user.type(screen.getByLabelText('名称 *'), '東1');
    await user.type(screen.getByLabelText('期 *'), '第1期');
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(createMasterItemMock).toHaveBeenCalledWith('section-name', {
        name: '東1',
        description: null,
        sortOrder: null,
        period: '第1期',
      });
    });
  });
});

describe('マスタ管理 モックモードの書き込みガード (#228)', () => {
  beforeEach(() => {
    getAllMastersMock.mockReset();
    getAllMastersMock.mockResolvedValue({ success: true, data: emptyMasters });
    createMasterItemMock.mockReset();
    shouldUseMockDataMock.mockReturnValue(true);
  });

  afterEach(() => {
    shouldUseMockDataMock.mockReturnValue(false);
  });

  it('モックモードでは新規登録ボタンが無効化される', async () => {
    render(<MastersManagement />);

    const createButton = await screen.findByRole('button', { name: /新規登録/ });
    expect(createButton).toBeDisabled();
  });
});
