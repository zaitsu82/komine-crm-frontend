import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BillingListTable } from '@/components/billing/billing-list-table';

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
