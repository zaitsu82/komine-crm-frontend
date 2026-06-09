import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BurialInfoTab } from '@/components/plot-form/BurialInfoTab';
import { defaultPlotFormData } from '@/lib/validations/plot-form';
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

  it('トグルON時の有効期間は自動判定値が初期値になる（通常区画 → 33年）（#259）', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByLabelText('合祀対象区画'));

    const input = screen.getByLabelText(/有効期間/) as HTMLInputElement;
    expect(input.value).toBe('33');
    expect(screen.getByText(/自動判定: 33年（通常区画 → 33年）/)).toBeInTheDocument();
  });

  it('樹林墓部＋2023-04以降の契約日なら自動判定は13年（#259）', async () => {
    const user = userEvent.setup();
    render(
      <BurialInfoTabHost
        defaultValues={{
          physicalPlot: {
            ...defaultPlotFormData.physicalPlot,
            areaName: '第3期樹林部',
          },
          saleContract: {
            ...defaultPlotFormData.saleContract,
            contractDate: '2023-05-01',
          },
        }}
      />
    );

    await user.click(screen.getByLabelText('合祀対象区画'));

    const input = screen.getByLabelText(/有効期間/) as HTMLInputElement;
    expect(input.value).toBe('13');
    expect(screen.getByText(/樹林墓部・契約日 2023-04-01 以降 → 13年/)).toBeInTheDocument();
  });

  it('自動判定と異なる値は手動指定（例外）として表示され、自動判定値に戻せる（#259）', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByLabelText('合祀対象区画'));

    const input = screen.getByLabelText(/有効期間/) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '24');

    expect(screen.getByText(/手動指定: 24年（自動判定: 33年/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '自動判定値に戻す' }));

    expect(input.value).toBe('33');
    expect(screen.queryByText(/手動指定: 24年/)).not.toBeInTheDocument();
    expect(screen.getByText(/自動判定: 33年（通常区画 → 33年）/)).toBeInTheDocument();
  });

  it('合祀年数の標準チップ（マスタ由来・24年含む）で有効期間を設定できる（#289）', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByLabelText('合祀対象区画'));

    const input = screen.getByLabelText(/有効期間/) as HTMLInputElement;
    expect(input.value).toBe('33');

    // マスタ未取得時は標準値（13/15/24/33）がフォールバックでチップに並ぶ
    await user.click(screen.getByRole('button', { name: '24年' }));
    expect(input.value).toBe('24');
  });

  it('「墓石情報を追加」で墓石情報セクションが展開される', async () => {
    const user = userEvent.setup();
    render(<BurialInfoTabHost />);

    await user.click(screen.getByRole('button', { name: '墓石情報を追加' }));
    expect(screen.getByPlaceholderText('御影石')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '墓石情報を削除' })).toBeInTheDocument();
  });
});
