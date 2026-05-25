import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BillingRecordStatus } from '@komine/types';
import { BillingSummaryBadges } from '@/components/plot-list-table';

/**
 * B10: 区画一覧「請求状況」サマリ列のバッジ表示テスト
 */
describe('BillingSummaryBadges', () => {
  it('Billing が無い場合は「—」を表示する', () => {
    render(
      <BillingSummaryBadges
        summary={{
          hasBilling: false,
          latestYear: null,
          latestYearStatus: null,
          unpaidYearCount: 0,
        }}
      />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/未納/)).not.toBeInTheDocument();
  });

  it('完納（未納0年）は最新年度バッジのみ・未納バッジは出さない', () => {
    render(
      <BillingSummaryBadges
        summary={{
          hasBilling: true,
          latestYear: 2024,
          latestYearStatus: BillingRecordStatus.Paid,
          unpaidYearCount: 0,
        }}
      />
    );
    expect(screen.getByText(/2024年/)).toBeInTheDocument();
    expect(screen.getByText(/完納/)).toBeInTheDocument();
    expect(screen.queryByText(/未納/)).not.toBeInTheDocument();
  });

  it('延滞かつ未納2年は 最新年度バッジ ＋ 未納2年バッジ', () => {
    render(
      <BillingSummaryBadges
        summary={{
          hasBilling: true,
          latestYear: 2024,
          latestYearStatus: BillingRecordStatus.Overdue,
          unpaidYearCount: 2,
        }}
      />
    );
    expect(screen.getByText(/2024年/)).toBeInTheDocument();
    expect(screen.getByText(/延滞/)).toBeInTheDocument();
    expect(screen.getByText('未納2年')).toBeInTheDocument();
  });

  it('年度が null でも未納件数があれば未納バッジは出す（年度バッジは出さない）', () => {
    render(
      <BillingSummaryBadges
        summary={{
          hasBilling: true,
          latestYear: null,
          latestYearStatus: null,
          unpaidYearCount: 1,
        }}
      />
    );
    expect(screen.getByText('未納1年')).toBeInTheDocument();
    expect(screen.queryByText(/年 /)).not.toBeInTheDocument();
  });
});
