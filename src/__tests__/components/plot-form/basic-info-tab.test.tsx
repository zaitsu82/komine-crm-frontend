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
  it('物理区画情報・契約区画情報・販売契約情報・契約者情報の4セクションを表示する', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    expect(screen.getByText('物理区画情報')).toBeInTheDocument();
    expect(screen.getByText('契約区画情報')).toBeInTheDocument();
    expect(screen.getByText('販売契約情報')).toBeInTheDocument();
    expect(screen.getByText('契約者情報')).toBeInTheDocument();
  });

  it('必須項目に*マークが表示される', () => {
    render(
      <TabHost>
        {(h) => <BasicInfoTab {...h} masterData={emptyMasterData} />}
      </TabHost>
    );

    // 区画番号、契約面積、契約日、金額、氏名、氏名カナ、郵便番号、住所、電話番号 が必須
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThanOrEqual(8);
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
});
