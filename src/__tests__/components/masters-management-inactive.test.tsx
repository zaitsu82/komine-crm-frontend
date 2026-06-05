/**
 * マスタ管理 無効マスタの表示・再有効化（#238）
 *
 * - 一覧は include_inactive 付きで取得し、無効マスタも表示する
 *   （表示しないと無効化したマスタを再有効化できない）
 * - 編集ダイアログの有効トグルで isActive を更新できる
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
const updateMasterItemMock = jest.fn();
jest.mock('@/lib/api', () => ({
  getAllMasters: (...args: unknown[]) => getAllMastersMock(...args),
  createMasterItem: jest.fn(),
  updateMasterItem: (...args: unknown[]) => updateMasterItemMock(...args),
  deleteMasterItem: jest.fn(),
  shouldUseMockData: () => false,
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

// Radix UI Switch も最小モック（role/aria-checked のみ再現）
jest.mock('@/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id?: string;
  }) => (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}));

const masters = {
  cemeteryType: [
    { id: 1, code: 'GENERAL', name: '一般墓地', description: null, sortOrder: 1, isActive: true },
    { id: 2, code: 'OLD', name: '旧タイプ', description: null, sortOrder: 2, isActive: false },
  ],
  paymentMethod: [],
  taxType: [],
  calcType: [],
  billingType: [],
  recipientType: [],
  constructionType: [],
  sectionName: [],
};

describe('マスタ管理 無効マスタの表示・再有効化 (#238)', () => {
  beforeEach(() => {
    getAllMastersMock.mockReset();
    getAllMastersMock.mockResolvedValue({ success: true, data: masters });
    updateMasterItemMock.mockReset();
    updateMasterItemMock.mockResolvedValue({
      success: true,
      data: { id: 2, code: 'OLD', name: '旧タイプ', description: null, sortOrder: 2, isActive: true },
    });
  });

  it('include_inactive 付きで取得し、無効マスタも一覧に表示する', async () => {
    render(<MastersManagement />);

    // 無効マスタが一覧に出る（バッジ「無効」付き）
    expect(await screen.findByText('旧タイプ')).toBeInTheDocument();
    expect(screen.getByText('無効')).toBeInTheDocument();
    expect(getAllMastersMock).toHaveBeenCalledWith({ includeInactive: true });
  });

  it('編集ダイアログの有効トグルで isActive を更新できる', async () => {
    const user = userEvent.setup();
    render(<MastersManagement />);

    await screen.findByText('旧タイプ');
    // 2行目（無効マスタ）の編集を開く
    await user.click(screen.getAllByRole('button', { name: '編集' })[1]);

    // 無効状態で開く → トグルで有効化
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('button', { name: '更新' }));

    await waitFor(() => {
      expect(updateMasterItemMock).toHaveBeenCalledWith(
        'cemetery-type',
        2,
        expect.objectContaining({ isActive: true }),
      );
    });
  });

  it('新規作成ダイアログには有効トグルを出さない（新規は常に有効で作成）', async () => {
    const user = userEvent.setup();
    render(<MastersManagement />);

    await screen.findByText('旧タイプ');
    await user.click(screen.getByRole('button', { name: /新規登録/ }));

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
