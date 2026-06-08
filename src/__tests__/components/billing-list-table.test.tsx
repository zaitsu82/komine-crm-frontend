import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BillingListTable } from '@/components/billing/billing-list-table';
import type { Billing } from '@komine/types';
import { LEGACY_VALUE_NOTE } from '@/lib/legacy-plot-display';

/**
 * #171: 請求一覧の空状態テスト
 * - emptyState 未指定時は既定メッセージ
 * - emptyState 指定時は文脈付き説明を表示（理由・次のアクション）
 */
describe('BillingListTable empty state', () => {
  it('items が空で emptyState 未指定なら既定メッセージを表示する', () => {
    render(<BillingListTable items={[]} />);
    expect(screen.getByText('請求データがありません')).toBeInTheDocument();
  });

  it('items が空で emptyState 指定なら、その文脈付きノードを表示し既定メッセージは出さない', () => {
    render(
      <BillingListTable
        items={[]}
        emptyState={
          <div>
            <p>発行済みの請求はありません</p>
            <p>「新規登録」から請求を追加してください</p>
          </div>
        }
      />
    );
    expect(screen.getByText('発行済みの請求はありません')).toBeInTheDocument();
    expect(screen.getByText(/新規登録/)).toBeInTheDocument();
    expect(screen.queryByText('請求データがありません')).not.toBeInTheDocument();
  });

  it('読み込み中は emptyState ではなくローディング表示を出す', () => {
    render(
      <BillingListTable
        items={[]}
        isLoading
        emptyState={<p>発行済みの請求はありません</p>}
      />
    );
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(screen.queryByText('発行済みの請求はありません')).not.toBeInTheDocument();
  });
});

/**
 * #283: 請求一覧の区画番号も displayNumber 優先・legacy-* はミュート表示。
 */
describe('BillingListTable の区画番号表示 (#283)', () => {
  const makeBilling = (overrides: Partial<Billing>): Billing =>
    ({
      id: 'b1',
      amount: 5000,
      paidAmount: 0,
      plotNumber: 'legacy-0',
      displayNumber: null,
      areaName: '第1期',
      customer: null,
      ...overrides,
    } as unknown as Billing);

  it('displayNumber があれば業務番号を表示し、生の legacy 値は出さない', () => {
    render(<BillingListTable items={[makeBilling({ displayNumber: 'A-1', plotNumber: 'legacy-101' })]} />);
    const el = screen.getByText('A-1');
    expect(el).not.toHaveAttribute('title', LEGACY_VALUE_NOTE);
    expect(screen.queryByText('legacy-101')).not.toBeInTheDocument();
  });

  it('displayNumber 未設定の legacy 区画は「整備中」ミュート表示にする', () => {
    render(<BillingListTable items={[makeBilling({ displayNumber: null, plotNumber: 'legacy-3' })]} />);
    const el = screen.getByText('legacy-3');
    expect(el).toHaveAttribute('title', LEGACY_VALUE_NOTE);
    expect(el.className).toContain('italic');
  });
});
