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

// ConfirmDialog（Radix AlertDialog ベース）は open 時の内容と確定操作だけ見たいのでモックする
jest.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    description,
    confirmLabel,
    onConfirm,
    onOpenChange,
  }: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <p data-testid="confirm-description">{description}</p>
        <button type="button" onClick={onConfirm}>
          {confirmLabel ?? '確認'}
        </button>
        <button type="button" onClick={() => onOpenChange(false)}>
          キャンセル
        </button>
      </div>
    ) : null,
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

  // 最終納骨者（合祀カウントダウンの起点）— 議事録 2026-07-21 §1
  describe('最終納骨者', () => {
    /** 埋葬者を n 人追加し、index 番目の詳細を開く */
    const addAndExpand = async (
      user: ReturnType<typeof userEvent.setup>,
      count: number,
      expandIndex: number,
    ) => {
      for (let i = 0; i < count; i += 1) {
        await user.click(screen.getByRole('button', { name: /埋葬者を追加/ }));
      }
      const summaries = screen.getAllByText('未入力');
      await user.click(summaries[expandIndex]);
    };

    it('埋葬者の詳細に最終納骨者トグルを表示する', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);
      await addAndExpand(user, 1, 0);

      expect(screen.getByLabelText('最終納骨者')).toBeInTheDocument();
    });

    it('トグルONで確認ダイアログを出し、確定するまでフラグは立たない', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);
      await addAndExpand(user, 1, 0);

      await user.click(screen.getByLabelText('最終納骨者'));

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('合祀までのカウントダウンを開始しますか？')).toBeInTheDocument();
      // 未確定なのでフラグは立っていない
      expect(screen.getByLabelText('最終納骨者')).not.toBeChecked();

      await user.click(screen.getByRole('button', { name: '最終納骨者にする' }));
      expect(screen.getByLabelText('最終納骨者')).toBeChecked();
    });

    it('確認ダイアログをキャンセルするとフラグは立たない', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);
      await addAndExpand(user, 1, 0);

      await user.click(screen.getByLabelText('最終納骨者'));
      await user.click(screen.getByRole('button', { name: 'キャンセル' }));

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
      expect(screen.getByLabelText('最終納骨者')).not.toBeChecked();
    });

    it('OFFに戻すときは確認を出さない', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);
      await addAndExpand(user, 1, 0);

      await user.click(screen.getByLabelText('最終納骨者'));
      await user.click(screen.getByRole('button', { name: '最終納骨者にする' }));
      expect(screen.getByLabelText('最終納骨者')).toBeChecked();

      await user.click(screen.getByLabelText('最終納骨者'));
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
      expect(screen.getByLabelText('最終納骨者')).not.toBeChecked();
    });

    it('埋葬日が未入力なら契約日起点で数える旨を確認ダイアログに出す', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);
      await addAndExpand(user, 1, 0);

      await user.click(screen.getByLabelText('最終納骨者'));

      expect(screen.getByTestId('confirm-description')).toHaveTextContent(
        '埋葬日が未入力のため、入力されるまでは契約日起点で数えます。',
      );
    });

    // 合祀対象かつ2人目以降が居るのに最終納骨者未指定なら、常設の注意を出して
    // 「毎回確認を促す」（議事録 §1）を満たす
    it('合祀ONで埋葬者2人以上・最終納骨者未指定なら未指定の注意を出す', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);

      await user.click(screen.getByLabelText('合祀対象区画'));
      await user.click(screen.getByRole('button', { name: /埋葬者を追加/ }));
      expect(screen.queryByText('最終納骨者が指定されていません')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /埋葬者を追加/ }));
      expect(screen.getByText('最終納骨者が指定されていません')).toBeInTheDocument();
    });

    it('最終納骨者を指定すると未指定の注意が消える', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);

      await user.click(screen.getByLabelText('合祀対象区画'));
      await addAndExpand(user, 2, 0);
      expect(screen.getByText('最終納骨者が指定されていません')).toBeInTheDocument();

      await user.click(screen.getByLabelText('最終納骨者'));
      await user.click(screen.getByRole('button', { name: '最終納骨者にする' }));

      expect(screen.queryByText('最終納骨者が指定されていません')).not.toBeInTheDocument();
    });

    // backend は1契約区画につき1人しか受け付けない（複数指定は 400）ため、
    // 画面側でも自動的に付け替える
    it('別の人をONにすると先の最終納骨者は外れる', async () => {
      const user = userEvent.setup();
      render(<BurialInfoTabHost />);
      await addAndExpand(user, 2, 0);

      // 1人目をON
      await user.click(screen.getByLabelText('最終納骨者'));
      await user.click(screen.getByRole('button', { name: '最終納骨者にする' }));
      expect(screen.getAllByText('最終納骨者')).toHaveLength(2); // ラベル + サマリー行バッジ

      // 2人目を開いてON。付け替えの旨が確認ダイアログに出る
      await user.click(screen.getAllByText('未入力')[1]);
      await user.click(screen.getByLabelText('最終納骨者'));
      expect(screen.getByTestId('confirm-description')).toHaveTextContent(
        '現在の最終納骨者「（氏名未入力）」の指定は外れます（1区画につき1人まで）。',
      );
      await user.click(screen.getByRole('button', { name: '最終納骨者にする' }));

      // バッジは1つだけ（＝最終納骨者は1人）
      const badges = screen.getAllByText('最終納骨者');
      expect(badges).toHaveLength(2);
    });
  });
});
