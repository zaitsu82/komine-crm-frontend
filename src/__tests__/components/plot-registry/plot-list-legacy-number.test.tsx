import { render, screen } from '@testing-library/react';
import { PlotCardList } from '@/components/plot-registry/PlotCardList';
import { LEGACY_VALUE_NOTE } from '@/lib/legacy-plot-display';
import type { PlotListItem } from '@komine/types';

/**
 * #164: 台帳一覧の「区画No」に legacy-* 等の内部IDが生表示されない（主表示から排除）。
 * displayNumber があれば業務番号を、無ければ legacy 値を「整備中」ミュート表示する。
 */
function makePlot(overrides: Partial<PlotListItem>): PlotListItem {
  return {
    id: overrides.id ?? 'p1',
    plotNumber: 'legacy-0',
    displayNumber: null,
    areaName: '第1期',
    paymentStatus: 'paid',
    contractDate: null,
    roles: [],
    ...overrides,
  } as unknown as PlotListItem;
}

describe('区画一覧の区画No表示 (#164)', () => {
  const renderList = (plots: PlotListItem[]) =>
    render(
      <PlotCardList
        plots={plots}
        isLoading={false}
        startIndex={0}
        onPlotSelect={() => {}}
        emptyState={<div>empty</div>}
      />
    );

  it('displayNumber があれば業務番号をそのまま表示する', () => {
    renderList([makePlot({ id: 'a', displayNumber: 'A-1', plotNumber: 'legacy-101' })]);
    const el = screen.getByText('A-1');
    expect(el).toBeInTheDocument();
    // legacy 扱いされず（整備中ツールチップが付かない）
    expect(el).not.toHaveAttribute('title', LEGACY_VALUE_NOTE);
    // 生の legacy 値は主表示に出ない
    expect(screen.queryByText('legacy-101')).not.toBeInTheDocument();
  });

  it('displayNumber 未設定の legacy 区画は「整備中」ミュート表示にする', () => {
    renderList([makePlot({ id: 'b', displayNumber: null, plotNumber: 'legacy-3' })]);
    const el = screen.getByText('legacy-3');
    // 淡色・斜体 + 整備中ツールチップで業務番号と誤認させない
    expect(el).toHaveAttribute('title', LEGACY_VALUE_NOTE);
    expect(el.className).toContain('italic');
  });
});
