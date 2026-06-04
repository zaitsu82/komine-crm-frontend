import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BasicInfoTab } from '@/components/plot-form/BasicInfoTab';
import { TabHost, emptyMasterData } from './test-helpers';

// Radix UI Select はJSDOMで動かないため最小モック
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) => (
    <div data-testid="mock-select" data-value={value}>
      <button
        type="button"
        data-testid={`mock-select-trigger-${value || 'empty'}`}
        onClick={() => onValueChange?.('test-value')}
      >
        trigger
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`mock-select-item-${value}`}>{children}</div>
  ),
}));

describe('BasicInfoTab', () => {
  it('物理区画情報・契約区画情報・販売契約情報・契約者情報・申込者情報の5セクションを表示する', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByText('物理区画情報')).toBeInTheDocument();
    expect(screen.getByText('契約区画情報')).toBeInTheDocument();
    expect(screen.getByText('販売契約情報')).toBeInTheDocument();
    expect(screen.getByText('契約者情報')).toBeInTheDocument();
    expect(screen.getByText(/申込者情報/)).toBeInTheDocument();
  });

  it('デフォルトでは申込者 section は折りたたまれていて「申込者を追加」ボタンがある', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByRole('button', { name: '申込者を追加' })).toBeInTheDocument();
    // 入力フィールドは未表示
    expect(screen.queryByPlaceholderText('山田 花子')).not.toBeInTheDocument();
  });

  it('「申込者を追加」を押すと氏名・カナ等の入力フィールドが現れる', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    await user.click(screen.getByRole('button', { name: '申込者を追加' }));

    expect(screen.getByPlaceholderText('山田 花子')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ヤマダ ハナコ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '申込者を削除' })).toBeInTheDocument();
  });

  it('「申込者を削除」を押すと申込者フィールドが消え、再度「追加」ボタンが表示される', async () => {
    const user = userEvent.setup();
    render(
      <TabHost defaultValues={{
        applicant: {
          name: '山田花子',
          nameKana: 'ヤマダハナコ',
          birthDate: null,
          gender: null,
          postalCode: null,
          address: null,
          addressLine2: null,
          registeredPostalCode: null,
          registeredAddress: null,
          phoneNumber: null,
          faxNumber: null,
          email: null,
          notes: null,
        },
      }}>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByPlaceholderText('山田 花子')).toHaveValue('山田花子');

    await user.click(screen.getByRole('button', { name: '申込者を削除' }));

    expect(screen.queryByPlaceholderText('山田 花子')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '申込者を追加' })).toBeInTheDocument();
  });

  it('viewMode の場合、追加・削除ボタンは表示されず、未入力時は「契約者と同一」テキストが出る', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} viewMode={true} />}
      </TabHost>
    );

    expect(screen.queryByRole('button', { name: '申込者を追加' })).not.toBeInTheDocument();
    expect(screen.getByText('申込者は契約者と同一です。')).toBeInTheDocument();
  });

  it('必須項目に*マークが表示される', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    // 区画番号、契約面積、契約日、金額、氏名、氏名カナ、郵便番号、住所 が必須（電話番号は nullable）
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThanOrEqual(7);
  });

  it('区画番号フィールドに入力できる', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const plotNumberInput = screen.getByPlaceholderText('例: A-001');
    await user.type(plotNumberInput, 'B-100');
    expect(plotNumberInput).toHaveValue('B-100');
  });

  it('氏名フィールドに入力できる', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const nameInput = screen.getByPlaceholderText('山田 太郎');
    await user.type(nameInput, '田中花子');
    expect(nameInput).toHaveValue('田中花子');
  });

  it('errors props経由でエラーメッセージが表示される', () => {
    // errors をフォームに直接埋め込んで確認できないため、
    // BasicInfoTab に直接 errors を渡してエラー表示を確認する
    function ErrorHost() {
      return (
        <TabHost>
          {(h) => (
            <BasicInfoTab
              {...h}
              errors={
                {
                  physicalPlot: { plotNumber: { message: '区画番号は必須です', type: 'required' } },
                  customer: { name: { message: '氏名は必須です', type: 'required' } },
                } as typeof h.errors
              }
              masterData={emptyMasterData}
            />
          )}
        </TabHost>
      );
    }
    render(<ErrorHost />);

    expect(screen.getByText('区画番号は必須です')).toBeInTheDocument();
    expect(screen.getByText('氏名は必須です')).toBeInTheDocument();
  });

  it('viewMode=trueの場合、入力フィールドの代わりに表示用ボックスを使う', () => {
    render(
      <TabHost defaultValues={{
        physicalPlot: { plotNumber: 'A-001', areaName: '第1期', areaSqm: 3.6, notes: null },
      }}>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} viewMode={true} />}
      </TabHost>
    );

    // viewMode の場合、`例: A-001` プレースホルダーの入力欄は出ない
    expect(screen.queryByPlaceholderText('例: A-001')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('山田 太郎')).not.toBeInTheDocument();
    // 区画 (areaName) は watch() から表示する独自実装
    expect(screen.getByText('第1期')).toBeInTheDocument();
  });

  it('物理区画備考・契約備考・契約者備考の3つの備考入力欄を表示する（#145）', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByText('契約備考')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('物理区画に関するメモ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('契約に関するメモ')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('契約者に関するメモ')).toBeInTheDocument();
  });

  it('契約備考に入力できる（#145）', async () => {
    const user = userEvent.setup();
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    const notesInput = screen.getByPlaceholderText('契約に関するメモ');
    await user.type(notesInput, '2026年度分は分割払い');
    expect(notesInput).toHaveValue('2026年度分は分割払い');
  });

  describe('期/区画 2段階セレクトの初期化（#220）', () => {
    const sectionNameMasters = [
      { id: 1, code: 'S1', name: '東1', description: null, sortOrder: 1, isActive: true, period: '第1期' },
      { id: 2, code: 'S2', name: '西2', description: null, sortOrder: 2, isActive: true, period: '第2期' },
    ];

    it('マスタが初期レンダー後に到着しても、登録済み areaName から期が復元される', async () => {
      // 編集画面の実挙動: 初回レンダー時は masterData が空（非同期取得中）
      const { rerender } = render(
        <TabHost defaultValues={{
          physicalPlot: { plotNumber: 'A-001', areaName: '西2', areaSqm: 3.6, notes: null },
        }}>
          {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
        </TabHost>
      );

      // マスタ未到着の間は期セレクトが未選択
      // （periodSelect は最初の mock-select。value 空）
      expect(screen.getAllByTestId('mock-select')[0]).toHaveAttribute('data-value', '');

      // マスタ到着（再レンダー）
      rerender(
        <TabHost defaultValues={{
          physicalPlot: { plotNumber: 'A-001', areaName: '西2', areaSqm: 3.6, notes: null },
        }}>
          {(h) => (
            <BasicInfoTab
              {...h}
              masterData={{ ...emptyMasterData, sectionNames: sectionNameMasters }}
            />
          )}
        </TabHost>
      );

      // areaName='西2' の所属期 '第2期' が自動選択され、区画サブセレクトも表示される
      const selects = screen.getAllByTestId('mock-select');
      expect(selects[0]).toHaveAttribute('data-value', '第2期');
      // サブセレクト（区画）が areaName を保持したまま表示される
      expect(selects[1]).toHaveAttribute('data-value', '西2');
    });

    it('マスタが最初から存在する場合も期が選択される', () => {
      render(
        <TabHost defaultValues={{
          physicalPlot: { plotNumber: 'A-001', areaName: '東1', areaSqm: 3.6, notes: null },
        }}>
          {(h) => (
            <BasicInfoTab
              {...h}
              masterData={{ ...emptyMasterData, sectionNames: sectionNameMasters }}
            />
          )}
        </TabHost>
      );

      expect(screen.getAllByTestId('mock-select')[0]).toHaveAttribute('data-value', '第1期');
    });

    it('areaName がどの期にも属さない（レガシー未正規化）場合は期未選択のまま', () => {
      render(
        <TabHost defaultValues={{
          physicalPlot: { plotNumber: 'A-001', areaName: '1', areaSqm: 3.6, notes: null },
        }}>
          {(h) => (
            <BasicInfoTab
              {...h}
              masterData={{ ...emptyMasterData, sectionNames: sectionNameMasters }}
            />
          )}
        </TabHost>
      );

      expect(screen.getAllByTestId('mock-select')[0]).toHaveAttribute('data-value', '');
    });
  });

  it('viewMode=trueの場合、契約備考の値が表示用ボックスに表示される（#145）', () => {
    render(
      <TabHost defaultValues={{
        saleContract: { notes: '解約予定あり' } as never,
      }}>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} viewMode={true} />}
      </TabHost>
    );

    // viewMode では入力欄ではなく値が表示される
    expect(screen.queryByPlaceholderText('契約に関するメモ')).not.toBeInTheDocument();
    expect(screen.getByText('解約予定あり')).toBeInTheDocument();
  });
});
