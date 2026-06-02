jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual('@/lib/api/client');
  return { __esModule: true, ...actual, shouldUseMockData: () => true };
});

import { ContractRole } from '@komine/types';
import { getCollectiveBurialList } from '@/lib/api/collective-burials';
import { getPlotById } from '@/lib/api/plots';

/**
 * #176: 合祀モックと台帳（plots）モックが同一区画・同一契約者を指すことを保証する。
 * これが崩れると「合祀管理と台帳問い合わせが別世界のサンプルに見える」状態が再発する。
 */
describe('合祀モック ⇔ 台帳モックの整合 (#176)', () => {
  it('各合祀レコードの contractPlotId が台帳に解決し、plotNumber と契約者名が一致する', async () => {
    const list = await getCollectiveBurialList();
    expect(list.success).toBe(true);
    if (!list.success) return;

    expect(list.data.items.length).toBeGreaterThan(0);

    for (const cb of list.data.items) {
      // 合祀一覧 → 台帳詳細への遷移リンク（/plots/[contractPlotId]）が解決する
      const plot = await getPlotById(cb.contractPlotId);
      expect(plot.success).toBe(true);
      if (!plot.success) continue;

      // 区画番号が両画面で一致する
      expect(plot.data.physicalPlot.plotNumber).toBe(cb.plotNumber);

      // 契約者名が両画面で一致する
      const contractor = plot.data.roles.find(
        (r) => r.role === ContractRole.Contractor
      );
      expect(contractor?.customer.name).toBe(cb.applicantName);
    }
  });
});
