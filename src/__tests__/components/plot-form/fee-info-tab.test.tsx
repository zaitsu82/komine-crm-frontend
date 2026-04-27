import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FeeInfoTab } from '@/components/plot-form/FeeInfoTab';
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

describe('FeeInfoTab', () => {
  it('初期状態では使用料・管理料ともに「登録されていません」を表示する', () => {
    render(
      <TabHost>
        {(h) => <FeeInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByText('使用料が登録されていません')).toBeInTheDocument();
    expect(screen.getByText('管理料が登録されていません')).toBeInTheDocument();
  });

  it('「使用料を追加」ボタンクリックで使用料セクションが表示される', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <FeeInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const addButton = screen.getByRole('button', { name: '使用料を追加' });
    await user.click(addButton);

    // 「登録されていません」メッセージが消える
    expect(screen.queryByText('使用料が登録されていません')).not.toBeInTheDocument();
    // 「使用料を削除」ボタンに変わる
    expect(screen.getByRole('button', { name: '使用料を削除' })).toBeInTheDocument();
    // 使用料の入力欄が表示される
    expect(screen.getByPlaceholderText('36000')).toBeInTheDocument();
  });

  it('「管理料を追加」ボタンクリックで管理料セクションが表示される', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <FeeInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const addButton = screen.getByRole('button', { name: '管理料を追加' });
    await user.click(addButton);

    expect(screen.queryByText('管理料が登録されていません')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '管理料を削除' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('12000')).toBeInTheDocument();
  });

  it('使用料追加→削除のトグル動作が正しい', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <FeeInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    await user.click(screen.getByRole('button', { name: '使用料を追加' }));
    await user.click(screen.getByRole('button', { name: '使用料を削除' }));

    expect(screen.getByText('使用料が登録されていません')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '使用料を追加' })).toBeInTheDocument();
  });

  it('使用料の単価フィールドに入力できる', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <FeeInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    await user.click(screen.getByRole('button', { name: '使用料を追加' }));
    const unitPriceInput = screen.getByPlaceholderText('10000');
    await user.type(unitPriceInput, '50000');
    expect(unitPriceInput).toHaveValue('50000');
  });

  it('viewMode=trueの場合、追加・削除ボタンが表示されない', () => {
    render(
      <TabHost>
        {(h) => <FeeInfoTab {...h} masterData={emptyMasterData} viewMode={true} />}
      </TabHost>
    );

    expect(screen.queryByRole('button', { name: '使用料を追加' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '管理料を追加' })).not.toBeInTheDocument();
  });
});
