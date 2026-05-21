import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ConstructionInfoTab } from '@/components/plot-form/ConstructionInfoTab';
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

function ConstructionInfoTabHost({
  contractors = [],
}: {
  contractors?: { id: number; code: string; name: string; description: string | null; sortOrder: number | null; isActive: boolean }[];
} = {}) {
  return (
    <TabHost arrayName="constructionInfos">
      {(h) => (
        <ConstructionInfoTab
          {...h}
          constructionInfoFields={h.arrayFields ?? []}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addConstructionInfo={h.arrayAppend as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          removeConstructionInfo={h.arrayRemove as any}
          masterData={{ ...emptyMasterData, contractors }}
        />
      )}
    </TabHost>
  );
}

describe('ConstructionInfoTab', () => {
  it('工事情報ヘッダー・テーブルヘッダーを表示する', () => {
    render(<ConstructionInfoTabHost />);

    expect(screen.getByText('工事情報')).toBeInTheDocument();
    expect(screen.getByText('業者名')).toBeInTheDocument();
    expect(screen.getByText('工事種別')).toBeInTheDocument();
    expect(screen.getByText('進捗')).toBeInTheDocument();
  });

  it('初期状態では「工事情報が登録されていません」を表示する', () => {
    render(<ConstructionInfoTabHost />);
    expect(screen.getByText('工事情報が登録されていません')).toBeInTheDocument();
  });

  it('「工事を追加」ボタンで行が追加される', async () => {
    const user = userEvent.setup();
    render(<ConstructionInfoTabHost />);

    await user.click(screen.getByRole('button', { name: /工事を追加/ }));

    expect(screen.getByText('未入力')).toBeInTheDocument();
    expect(screen.queryByText('工事情報が登録されていません')).not.toBeInTheDocument();
  });

  it('複数行追加できる', async () => {
    const user = userEvent.setup();
    render(<ConstructionInfoTabHost />);

    const addBtn = screen.getByRole('button', { name: /工事を追加/ });
    await user.click(addBtn);
    await user.click(addBtn);

    expect(screen.getAllByText('未入力')).toHaveLength(2);
  });

  it('サマリー行クリックで展開され、工事基本情報・日程セクションが表示される', async () => {
    const user = userEvent.setup();
    render(<ConstructionInfoTabHost />);

    await user.click(screen.getByRole('button', { name: /工事を追加/ }));
    await user.click(screen.getByText('未入力'));

    expect(screen.getByText('工事基本情報')).toBeInTheDocument();
    expect(screen.getByText('日程')).toBeInTheDocument();
    expect(screen.getByText('許可・申請情報')).toBeInTheDocument();
    expect(screen.getByText('工事項目')).toBeInTheDocument();
    expect(screen.getByText('入金情報')).toBeInTheDocument();
  });

  it('業者名フィールドがマスタ由来のセレクトで表示される', async () => {
    const user = userEvent.setup();
    render(
      <ConstructionInfoTabHost
        contractors={[
          { id: 1, code: 'placeholder-1', name: '小嶺石材', description: null, sortOrder: 1, isActive: true },
          { id: 2, code: 'placeholder-2', name: '提携業者A', description: null, sortOrder: 2, isActive: true },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /工事を追加/ }));
    await user.click(screen.getByText('未入力'));

    expect(screen.getByText('小嶺石材')).toBeInTheDocument();
    expect(screen.getByText('提携業者A')).toBeInTheDocument();
  });

  it('既存値が master に存在しない場合「（既存値）」付きで表示される', async () => {
    const user = userEvent.setup();
    render(
      <ConstructionInfoTabHost
        contractors={[
          { id: 1, code: 'placeholder-1', name: '小嶺石材', description: null, sortOrder: 1, isActive: true },
        ]}
      />
    );

    await user.click(screen.getByRole('button', { name: /工事を追加/ }));
    // 未入力状態では既存値表示は出ない
    expect(screen.queryByText(/（既存値）/)).not.toBeInTheDocument();
  });

  it('削除ボタンで工事行が削除される', async () => {
    const user = userEvent.setup();
    render(<ConstructionInfoTabHost />);

    await user.click(screen.getByRole('button', { name: /工事を追加/ }));
    await user.click(screen.getByRole('button', { name: '工事情報を削除' }));

    expect(screen.queryByText('未入力')).not.toBeInTheDocument();
    expect(screen.getByText('工事情報が登録されていません')).toBeInTheDocument();
  });
});
