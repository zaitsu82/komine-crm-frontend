import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BurialInfoTab } from '@/components/plot-form/BurialInfoTab';
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

// Switch コンポーネントのモック（Radix UIベース）
jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id }: { checked?: boolean; onCheckedChange?: (v: boolean) => void; id?: string }) => (
    <input
      type="checkbox"
      id={id}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

function BurialInfoTabHost({ defaultValues }: { defaultValues?: Parameters<typeof TabHost>[0]['defaultValues'] }) {
  return (
    <TabHost arrayName="buriedPersons" defaultValues={defaultValues}>
      {(h) => (
        <BurialInfoTab
          {...h}
          buriedPersonFields={h.arrayFields ?? []}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addBuriedPerson={h.arrayAppend as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          removeBuriedPerson={h.arrayRemove as any}
          masterData={emptyMasterData}
        />
      )}
    </TabHost>
  );
}

describe('BurialInfoTab', () => {
  it('埋葬者情報・合祀設定・墓石情報のセクションヘッダーを表示する', () => {
    render(<BurialInfoTabHost />);

    expect(screen.getByText('埋葬者情報')).toBeInTheDocument();
    expect(screen.getByText('合祀設定')).toBeInTheDocument();
    expect(screen.getByText('墓石情報')).toBeInTheDocument();
  });

  it('初期状態では「埋葬者が登録されていません」を表示する', () => {
    render(<BurialInfoTabHost />);
    expect(screen.getByText('埋葬者が登録されていません')).toBeInTheDocument();
  });

  it('「埋葬者を追加」ボタンで行が追加される', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByRole('button', { name: /埋葬者を追加/ }));

    expect(screen.getByText('未入力')).toBeInTheDocument();
    expect(screen.queryByText('埋葬者が登録されていません')).not.toBeInTheDocument();
  });

  it('複数行追加できる', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    const addBtn = screen.getByRole('button', { name: /埋葬者を追加/ });
    await user.click(addBtn);
    await user.click(addBtn);

    expect(screen.getAllByText('未入力')).toHaveLength(2);
  });

  it('サマリー行クリックで展開され、入力欄が表示される', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByRole('button', { name: /埋葬者を追加/ }));
    await user.click(screen.getByText('未入力'));

    // 展開後は戒名・宗派など埋葬者特有のフィールドが見える
    expect(screen.getByLabelText('戒名')).toBeInTheDocument();
    expect(screen.getByLabelText('享年')).toBeInTheDocument();
  });

  it('削除ボタンで埋葬者行が削除される', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByRole('button', { name: /埋葬者を追加/ }));
    expect(screen.getByText('未入力')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '埋葬者を削除' }));
    expect(screen.queryByText('未入力')).not.toBeInTheDocument();
    expect(screen.getByText('埋葬者が登録されていません')).toBeInTheDocument();
  });

  it('合祀対象トグルONで埋葬上限・有効期間の入力欄が表示される', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    const toggle = screen.getByLabelText('合祀対象区画') as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    await user.click(toggle);

    expect(screen.getByLabelText(/埋葬上限数/)).toBeInTheDocument();
    expect(screen.getByLabelText(/有効期間/)).toBeInTheDocument();
  });

  it('「墓石情報を追加」で墓石情報セクションが展開される', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByRole('button', { name: '墓石情報を追加' }));
    expect(screen.getByPlaceholderText('御影石')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '墓石情報を削除' })).toBeInTheDocument();
  });
});
