/**
 * 埋葬者の行展開ロジック（議事録 2026-07-21 §3）
 *
 * 旧システム（ソフタス）の区画一覧と同じく、埋葬者を1人1行で並べる。
 * 「同一区画の複数埋葬者も一目で把握できるUI」が要件。
 */
import { buildPlotDisplayRows } from '@/components/plot-registry/utils';
import type { PlotListItem } from '@komine/types';

function makePlot(id: string, buriedPersonNames: string[]): PlotListItem {
  return {
    id,
    plotNumber: id,
    displayNumber: id,
    areaName: '第1期',
    customerName: `契約者${id}`,
    buriedPersonNames,
    roles: [],
  } as unknown as PlotListItem;
}

describe('buildPlotDisplayRows', () => {
  it('展開OFFなら区画ごとに1行、埋葬者名は載せない', () => {
    const rows = buildPlotDisplayRows([makePlot('A-1', ['一郎', '花子'])], 0, false);

    expect(rows).toHaveLength(1);
    expect(rows[0].buriedPersonName).toBeNull();
    expect(rows[0].isPlotLead).toBe(true);
  });

  it('展開ONなら埋葬者の人数だけ行を作る', () => {
    const rows = buildPlotDisplayRows([makePlot('A-1', ['一郎', '花子', '次郎'])], 0, true);

    expect(rows.map((r) => r.buriedPersonName)).toEqual(['一郎', '花子', '次郎']);
    expect(rows.map((r) => r.isPlotLead)).toEqual([true, false, false]);
    expect(rows.map((r) => r.buriedIndex)).toEqual([0, 1, 2]);
  });

  // 契約者名で探しているときに区画が結果から消えないようにする
  it('埋葬者0人の区画も1行残す', () => {
    const rows = buildPlotDisplayRows([makePlot('A-1', [])], 0, true);

    expect(rows).toHaveLength(1);
    expect(rows[0].buriedPersonName).toBeNull();
    expect(rows[0].isPlotLead).toBe(true);
  });

  it('空文字の埋葬者名は行を作らない（0人扱いになる）', () => {
    const rows = buildPlotDisplayRows([makePlot('A-1', ['', ''])], 0, true);

    expect(rows).toHaveLength(1);
    expect(rows[0].buriedPersonName).toBeNull();
  });

  it('buriedPersonNames が未定義でも落ちない', () => {
    const plot = { id: 'A-1', plotNumber: 'A-1', roles: [] } as unknown as PlotListItem;
    const rows = buildPlotDisplayRows([plot], 0, true);

    expect(rows).toHaveLength(1);
    expect(rows[0].buriedPersonName).toBeNull();
  });

  // ゼブラ縞を行単位で付けると同一区画が縞で分断され、まとまりが崩れる
  it('同一区画の全行が同じ plotAbsoluteIndex を持つ（縞を区画単位で揃えるため）', () => {
    const rows = buildPlotDisplayRows(
      [makePlot('A-1', ['一郎', '花子']), makePlot('A-2', ['次郎'])],
      0,
      true
    );

    expect(rows.map((r) => r.plotAbsoluteIndex)).toEqual([0, 0, 1]);
  });

  it('startIndex を区画の絶対 index に反映する（ページ跨ぎで縞を連続させる）', () => {
    const rows = buildPlotDisplayRows([makePlot('A-1', ['一郎', '花子'])], 50, true);

    expect(rows.map((r) => r.plotAbsoluteIndex)).toEqual([50, 50]);
  });

  it('複数区画をまたいで展開しても各行が元の区画を指す', () => {
    const a = makePlot('A-1', ['一郎', '花子']);
    const b = makePlot('A-2', []);
    const rows = buildPlotDisplayRows([a, b], 0, true);

    expect(rows.map((r) => r.plot.id)).toEqual(['A-1', 'A-1', 'A-2']);
  });

  it('区画0件なら空配列', () => {
    expect(buildPlotDisplayRows([], 0, true)).toEqual([]);
  });
});
