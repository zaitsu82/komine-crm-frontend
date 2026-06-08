jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual('@/lib/api/client');
  return { __esModule: true, ...actual, shouldUseMockData: () => true };
});

import { getPlotById } from '@/lib/api/plots';

/**
 * #267: モックモードで区画詳細の履歴タブが全区画で常に空になる回帰を防ぐ。
 * mockGetPlotById が組み立てる PlotDetailResponse に妥当な histories が含まれ、
 * HistoryTab が解釈できる shape（actionType/changedBy/changeReason/createdAt）に
 * なっていることを保証する。
 */
describe('モック区画詳細の履歴 (#267)', () => {
  const mockPlotIds = ['mock-plot-1', 'mock-plot-2'];

  it.each(mockPlotIds)('%s は空でない履歴を返す', async (id) => {
    const res = await getPlotById(id);
    expect(res.success).toBe(true);
    if (!res.success) return;

    const histories = res.data.histories ?? [];
    expect(histories.length).toBeGreaterThan(0);
  });

  it('各履歴エントリが HistoryTab の必須フィールドを持つ', async () => {
    const res = await getPlotById('mock-plot-1');
    expect(res.success).toBe(true);
    if (!res.success) return;

    const histories = res.data.histories ?? [];
    for (const h of histories) {
      expect(typeof h.id).toBe('string');
      expect(h.id.length).toBeGreaterThan(0);
      expect(['CREATE', 'UPDATE', 'DELETE']).toContain(h.actionType);
      expect('changedBy' in h).toBe(true);
      expect('changeReason' in h).toBe(true);
      expect(typeof h.createdAt).toBe('string');
    }
  });

  it('レガシー移行を表す CREATE エントリを含む', async () => {
    const res = await getPlotById('mock-plot-2');
    expect(res.success).toBe(true);
    if (!res.success) return;

    const histories = res.data.histories ?? [];
    expect(histories.some((h) => h.actionType === 'CREATE')).toBe(true);
  });
});
