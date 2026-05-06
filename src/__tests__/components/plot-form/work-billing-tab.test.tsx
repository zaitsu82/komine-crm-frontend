import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { WorkBillingTab } from '@/components/plot-form/WorkBillingTab';
import { TabHost, emptyMasterData } from './test-helpers';

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value }: { children: React.ReactNode; value?: string }) => (
    <div data-testid="mock-select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`mock-select-item-${value}`}>{children}</div>
  ),
}));

describe('WorkBillingTab', () => {
  it('勤務先情報のセクションヘッダーを表示する', () => {
    render(
      <TabHost>
        {(h) => <WorkBillingTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByText('勤務先情報')).toBeInTheDocument();
    // 請求情報セクションは Phase 2 で廃止
  });

  it('初期状態では勤務先の「追加」ボタンが表示される', () => {
    render(
      <TabHost>
        {(h) => <WorkBillingTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getAllByRole('button', { name: '追加' })).toHaveLength(1);
  });

  it('勤務先情報の「追加」ボタンクリックで入力欄が表示される', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <WorkBillingTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const addButtons = screen.getAllByRole('button', { name: '追加' });
    await user.click(addButtons[0]);

    expect(screen.getByPlaceholderText('会社名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('カイシャメイ')).toBeInTheDocument();
  });

  // 請求情報（BillingInfo）の「追加」ボタンテストは Phase 2 で廃止。

  it('勤務先名称フィールドに入力できる', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <WorkBillingTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    await user.click(screen.getAllByRole('button', { name: '追加' })[0]);
    const companyInput = screen.getByPlaceholderText('会社名');
    await user.type(companyInput, '株式会社テスト');
    expect(companyInput).toHaveValue('株式会社テスト');
  });

  it('追加→削除トグルで入力欄が消える', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <WorkBillingTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const addButtons = screen.getAllByRole('button', { name: '追加' });
    await user.click(addButtons[0]);
    expect(screen.getByPlaceholderText('会社名')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '削除' }));
    expect(screen.queryByPlaceholderText('会社名')).not.toBeInTheDocument();
  });

  // 請求情報（BillingInfo）セクションは Phase 2 移行で廃止。
  // Phase 3 で Billing/Payment エンティティとして再設計予定。
  // Refs: zaitsu82/komine-crm-backend#106
});
