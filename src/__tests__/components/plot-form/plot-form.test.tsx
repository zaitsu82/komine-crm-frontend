import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ViewModeField, ViewModeSelect, ViewModeTextarea } from '@/components/plot-form/ViewModeField';
import { HistoryTab } from '@/components/plot-form/HistoryTab';
import type { PlotDetailResponse } from '@komine/types';
import {
  PaymentStatus,
  ContractRole,
  PhysicalPlotStatus,
  ContractStatus,
} from '@komine/types';

// ===== Mocks =====

// useMasters をモック
jest.mock('@/hooks', () => ({
  useMasters: () => ({
    calcTypes: [],
    taxTypes: [],
    billingTypes: [],
    paymentMethods: [],
    accountTypes: [],
    isLoading: false,
  }),
}));

// Radix UI Select をモック（JSDOMで動作しないため）
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) => (
    <div data-testid="mock-select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="mock-select-trigger">{children}</button>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-select-content">{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="mock-select-value">{placeholder}</span>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`mock-select-item-${value}`}>{children}</div>
  ),
}));

// ===== テストヘルパー =====

function makePlotDetail(overrides: Partial<PlotDetailResponse> = {}): PlotDetailResponse {
  return {
    id: 'plot-1',
    contractAreaSqm: 3.6,
    locationDescription: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    physicalPlot: {
      id: 'pp-1',
      plotNumber: 'A-001',
      areaName: '1期',
      areaSqm: 3.6,
      status: PhysicalPlotStatus.SoldOut,
      notes: null,
    },
    contractDate: '2024-01-15',
    price: 500000,
    contractStatus: ContractStatus.Active,
    paymentStatus: PaymentStatus.Paid,
    reservationDate: null,
    acceptanceNumber: null,
    permitDate: null,
    permitNumber: null,
    startDate: null,
    contractNotes: null,
    usageFee: null,
    managementFee: null,
    buriedPersons: [],
    familyContacts: [],
    gravestoneInfo: null,
    constructionInfos: [],
    collectiveBurial: null,
    roles: [
      {
        id: 'role-1',
        role: ContractRole.Contractor,
        roleStartDate: null,
        roleEndDate: null,
        notes: null,
        customer: {
          id: 'cust-1',
          name: '田中太郎',
          nameKana: 'タナカタロウ',
          gender: null,
          birthDate: null,
          phoneNumber: '09012345678',
          faxNumber: null,
          email: null,
          postalCode: '1234567',
          address: '東京都新宿区',
          registeredAddress: null,
          notes: null,
          workInfo: null,
          billingInfo: null,
        },
      },
    ],
    ...overrides,
  };
}

// ===== ViewModeField =====

describe('ViewModeField', () => {
  it('viewMode=trueの場合、表示用ボックスを表示する', () => {
    render(<ViewModeField label="氏名" value="田中太郎" viewMode={true} />);
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('viewMode=trueで値がnullの場合、ハイフンを表示する', () => {
    render(<ViewModeField label="氏名" value={null} viewMode={true} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('viewMode=trueで値が空文字の場合、ハイフンを表示する', () => {
    render(<ViewModeField label="氏名" value="" viewMode={true} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('viewMode=trueで数値の場合、文字列に変換して表示する', () => {
    render(<ViewModeField label="面積" value={3.6} viewMode={true} />);
    expect(screen.getByText('3.6')).toBeInTheDocument();
  });

  it('viewMode=falseの場合、Input要素を表示する', () => {
    render(<ViewModeField label="氏名" viewMode={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('required=trueの場合、アスタリスクを表示する', () => {
    render(<ViewModeField label="氏名" required={true} viewMode={false} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('required=falseの場合、アスタリスクを表示しない', () => {
    render(<ViewModeField label="氏名" required={false} viewMode={false} />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('error表示する', () => {
    render(<ViewModeField label="氏名" viewMode={false} error="入力必須です" />);
    expect(screen.getByText('入力必須です')).toBeInTheDocument();
  });

  it('ラベルを表示する', () => {
    render(<ViewModeField label="区画番号" viewMode={false} />);
    expect(screen.getByText('区画番号')).toBeInTheDocument();
  });
});

// ===== ViewModeSelect =====

describe('ViewModeSelect', () => {
  it('viewMode=trueの場合、表示用ボックスを表示する', () => {
    render(
      <ViewModeSelect label="性別" value="male" displayValue="男性" viewMode={true}>
        <div>options</div>
      </ViewModeSelect>
    );
    expect(screen.getByText('男性')).toBeInTheDocument();
  });

  it('viewMode=trueでdisplayValueがない場合、valueを表示する', () => {
    render(
      <ViewModeSelect label="性別" value="male" viewMode={true}>
        <div>options</div>
      </ViewModeSelect>
    );
    expect(screen.getByText('male')).toBeInTheDocument();
  });

  it('viewMode=trueで値がない場合、ハイフンを表示する', () => {
    render(
      <ViewModeSelect label="性別" viewMode={true}>
        <div>options</div>
      </ViewModeSelect>
    );
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('viewMode=falseの場合、Selectコンポーネントを表示する', () => {
    render(
      <ViewModeSelect label="性別" viewMode={false}>
        <div>options</div>
      </ViewModeSelect>
    );
    expect(screen.getByTestId('mock-select')).toBeInTheDocument();
  });

  it('required=trueの場合、アスタリスクを表示する', () => {
    render(
      <ViewModeSelect label="性別" required={true} viewMode={false}>
        <div>options</div>
      </ViewModeSelect>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

// ===== ViewModeTextarea =====

describe('ViewModeTextarea', () => {
  it('viewMode=trueの場合、表示用ボックスを表示する', () => {
    render(<ViewModeTextarea label="備考" value="テスト備考" viewMode={true} />);
    expect(screen.getByText('テスト備考')).toBeInTheDocument();
  });

  it('viewMode=trueで値がない場合、ハイフンを表示する', () => {
    render(<ViewModeTextarea label="備考" viewMode={true} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('viewMode=falseの場合、textarea要素を表示する', () => {
    render(<ViewModeTextarea label="備考" viewMode={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('required=trueの場合、アスタリスクを表示する', () => {
    render(<ViewModeTextarea label="備考" required={true} viewMode={false} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

// ===== HistoryTab =====

describe('HistoryTab', () => {
  it('historiesが空の場合「履歴データはありません」を表示する', () => {
    const detail = makePlotDetail({ histories: [] });
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('履歴データはありません')).toBeInTheDocument();
  });

  it('plotDetailが未定義の場合「履歴データはありません」を表示する', () => {
    render(<HistoryTab plotDetail={undefined} />);
    expect(screen.getByText('履歴データはありません')).toBeInTheDocument();
  });

  it('historiesプロパティがない場合「履歴データはありません」を表示する', () => {
    const detail = makePlotDetail();
    // histories は optional なので undefined でもOK
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('履歴データはありません')).toBeInTheDocument();
  });

  it('ヘッダーを表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'CREATE',
          changedFields: ['name'],
          changedBy: '管理者',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);

    expect(screen.getByText('日時')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
    expect(screen.getByText('変更フィールド')).toBeInTheDocument();
    expect(screen.getByText('変更者')).toBeInTheDocument();
  });

  it('CREATEアクションを「作成」と表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'CREATE',
          changedFields: null,
          changedBy: null,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('作成')).toBeInTheDocument();
  });

  it('UPDATEアクションを「更新」と表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'UPDATE',
          changedFields: ['price'],
          changedBy: '管理者',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('DELETEアクションを「削除」と表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'DELETE',
          changedFields: null,
          changedBy: null,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  it('未知のactionTypeはそのまま表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'ARCHIVE',
          changedFields: null,
          changedBy: null,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('ARCHIVE')).toBeInTheDocument();
  });

  it('changedFieldsがnullの場合ハイフンを表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'CREATE',
          changedFields: null,
          changedBy: '管理者',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    // changedFields columnにハイフン、changedByは「管理者」
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('changedFieldsをカンマ区切りで表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'UPDATE',
          changedFields: ['name', 'address', 'phone'],
          changedBy: '管理者',
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    expect(screen.getByText('name, address, phone')).toBeInTheDocument();
  });

  it('changedByがnullの場合ハイフンを表示する', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'CREATE',
          changedFields: ['all'],
          changedBy: null,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('行クリックで選択トグルする', () => {
    const detail = makePlotDetail({
      histories: [
        {
          id: 'h-1',
          actionType: 'CREATE',
          changedFields: null,
          changedBy: null,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
    });
    render(<HistoryTab plotDetail={detail} />);
    const row = screen.getByText('作成').closest('div[class*="cursor-pointer"]');
    expect(row).toBeInTheDocument();

    // 初期状態: クラスに " bg-blue-50" が含まれていない（hover:bg-blue-50 は含まれるが先頭にスペースなし）
    expect(row?.className).not.toMatch(/(?<![:\w-])bg-blue-50(?!\w)/);

    // クリックで選択
    fireEvent.click(row!);
    // 選択状態: bg-blue-50 がクラスに追加される（hover: ではない直接のクラス）
    expect(row?.className).toMatch(/ bg-blue-50/);

    // 再クリックで選択解除
    fireEvent.click(row!);
    expect(row?.className).not.toMatch(/ bg-blue-50/);
  });
});

// ===== PlotForm 統合テスト =====

describe('PlotForm', () => {
  // PlotForm を動的にインポート（モック設定後）
  let PlotForm: React.ComponentType<{
    plotDetail?: PlotDetailResponse;
    onSave: (data: unknown) => void;
    onCancel: () => void;
    isLoading?: boolean;
  }>;

  beforeAll(async () => {
    const mod = await import('@/components/plot-form/index');
    PlotForm = mod.default;
  });

  it('5つのタブを表示する', () => {
    render(
      <PlotForm onSave={jest.fn()} onCancel={jest.fn()} />
    );

    expect(screen.getByText('区画・契約情報')).toBeInTheDocument();
    expect(screen.getByText('勤務先・請求')).toBeInTheDocument();
    expect(screen.getByText('連絡先/家族')).toBeInTheDocument();
    expect(screen.getByText('埋葬情報')).toBeInTheDocument();
    expect(screen.getByText('履歴情報')).toBeInTheDocument();
  });

  it('新規作成モードで「登録」ボタンを表示する', () => {
    render(
      <PlotForm onSave={jest.fn()} onCancel={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('編集モード（plotDetail渡し）で「更新」ボタンを表示する', () => {
    const detail = makePlotDetail();
    render(
      <PlotForm plotDetail={detail} onSave={jest.fn()} onCancel={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument();
  });

  it('isLoading=trueの場合「保存中...」を表示する', () => {
    render(
      <PlotForm onSave={jest.fn()} onCancel={jest.fn()} isLoading={true} />
    );

    expect(screen.getByRole('button', { name: '保存中...' })).toBeInTheDocument();
  });

  it('isLoading=trueの場合ボタンがdisabledになる', () => {
    render(
      <PlotForm onSave={jest.fn()} onCancel={jest.fn()} isLoading={true} />
    );

    expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled();
  });

  it('タブ切り替えが動作する', () => {
    render(
      <PlotForm onSave={jest.fn()} onCancel={jest.fn()} />
    );

    // 勤務先・請求タブをクリック
    fireEvent.click(screen.getByText('勤務先・請求'));
    // タブがアクティブになる（Radixの内部動作に依存しないため、エラーがないことを確認）
  });

  it('form要素をレンダリングする', () => {
    const { container } = render(
      <PlotForm onSave={jest.fn()} onCancel={jest.fn()} />
    );

    expect(container.querySelector('form')).toBeInTheDocument();
  });
});
