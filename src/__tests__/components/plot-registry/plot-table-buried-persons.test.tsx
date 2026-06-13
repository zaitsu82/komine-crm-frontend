import { render, screen, within } from '@testing-library/react';
import { PlotTable } from '@/components/plot-registry/PlotTable';
import type { PlotListItem } from '@komine/types';

/**
 * #299 回帰防止: 台帳一覧「埋葬者を含む」ON時、埋葬者は氏名セル内のラベル付き
 * テキストではなく、独立した「埋葬者」カラム（<td>）で描画されること。
 *
 * 旧 plot-list-table.tsx では氏名セル内に `埋葬者: ◯◯` を折返し表示し、
 * 親 td の whitespace-nowrap と行高が衝突してラベルと内容が重なっていた（#299）。
 * 現行 plot-registry/PlotTable は埋葬者を別カラム化したため、この衝突は構造的に
 * 起き得ない。本テストはその「別カラム描画」を固定し、氏名セル内へ埋葬者ラベルを
 * 戻すリグレッションを検知する。
 */
function makePlot(overrides: Partial<PlotListItem>): PlotListItem {
  return {
    id: 'p1',
    plotNumber: 'A-1',
    displayNumber: 'A-1',
    areaName: '第1期',
    customerName: '山田太郎',
    customerNameKana: 'ヤマダタロウ',
    paymentStatus: 'paid',
    contractDate: null,
    buriedPersonNames: [],
    roles: [],
    ...overrides,
  } as unknown as PlotListItem;
}

function renderTable(plots: PlotListItem[], showBuriedPersons: boolean) {
  return render(
    <PlotTable
      plots={plots}
      isLoading={false}
      error={null}
      onRetry={() => {}}
      sortKey="plotNumber"
      sortOrder="asc"
      onSort={() => {}}
      columnWidths={{}}
      onColumnResizeStart={() => {}}
      showBuriedPersons={showBuriedPersons}
      onPlotSelect={() => {}}
      startIndex={0}
      emptyState={<div>empty</div>}
    />
  );
}

describe('台帳一覧の埋葬者表示 (#299)', () => {
  it('「埋葬者を含む」ON時、埋葬者カラムのヘッダーと氏名を別セルで描画する', () => {
    renderTable(
      [makePlot({ buriedPersonNames: ['故人一郎', '故人花子'] })],
      true
    );

    // 専用の「埋葬者」カラムヘッダーが存在する
    expect(screen.getByText('埋葬者')).toBeInTheDocument();

    // 埋葬者氏名は独立セルに `、`/`, ` 連結で表示される（ラベル `埋葬者:` の接頭辞なし）
    const buriedCell = screen.getByText('故人一郎, 故人花子');
    expect(buriedCell).toBeInTheDocument();
    expect(buriedCell.closest('td')).not.toBeNull();
    // 旧実装のような氏名セル内ラベルは存在しない
    expect(screen.queryByText('埋葬者:')).not.toBeInTheDocument();
  });

  it('埋葬者氏名は契約者名セルとは別セルに描画される（重なりの原因を作らない）', () => {
    renderTable(
      [makePlot({ customerName: '山田太郎', buriedPersonNames: ['故人一郎'] })],
      true
    );

    const customerNameCell = screen.getByText('山田太郎').closest('td');
    expect(customerNameCell).not.toBeNull();
    // 契約者名セルの中に埋葬者氏名が混在していない
    expect(within(customerNameCell as HTMLElement).queryByText('故人一郎')).toBeNull();
  });

  it('「埋葬者を含む」OFF時は埋葬者カラム自体を描画しない', () => {
    renderTable(
      [makePlot({ buriedPersonNames: ['故人一郎'] })],
      false
    );

    expect(screen.queryByText('埋葬者')).not.toBeInTheDocument();
    expect(screen.queryByText('故人一郎')).not.toBeInTheDocument();
  });
});
