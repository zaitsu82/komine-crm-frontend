/**
 * useCollectiveBurialList の二重フェッチ防止テスト（#223）
 *
 * search() が setParams と fetchList を同時に呼ぶと、params 変化による
 * useEffect 再発火と合わせて同一条件の取得が2回走っていた。
 * 検索1回につきフェッチが1回だけ走ることを保証する。
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollectiveBurialList } from '@/hooks/useCollectiveBurials';

const getCollectiveBurialListMock = jest.fn();
jest.mock('@/lib/api', () => ({
  getCollectiveBurialList: (...args: unknown[]) => getCollectiveBurialListMock(...args),
  getCollectiveBurialById: jest.fn(),
  createCollectiveBurial: jest.fn(),
  updateCollectiveBurial: jest.fn(),
  updateBillingStatus: jest.fn(),
  syncBurialCount: jest.fn(),
  deleteCollectiveBurial: jest.fn(),
  getCollectiveBurialStatsByYear: jest.fn(),
}));

const emptyResponse = {
  success: true,
  data: {
    items: [],
    pagination: { page: 1, limit: 50, totalCount: 0, totalPages: 0 },
  },
};

describe('useCollectiveBurialList 二重フェッチ防止 (#223)', () => {
  beforeEach(() => {
    getCollectiveBurialListMock.mockReset();
    getCollectiveBurialListMock.mockResolvedValue(emptyResponse);
  });

  it('初回マウントでフェッチは1回だけ走る', async () => {
    renderHook(() => useCollectiveBurialList());

    await waitFor(() => {
      expect(getCollectiveBurialListMock).toHaveBeenCalledTimes(1);
    });
    // 追加のフェッチが走らないこと
    await new Promise((r) => setTimeout(r, 50));
    expect(getCollectiveBurialListMock).toHaveBeenCalledTimes(1);
  });

  it('search() 1回につきフェッチは1回だけ走る', async () => {
    const { result } = renderHook(() => useCollectiveBurialList());
    await waitFor(() => {
      expect(getCollectiveBurialListMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.search({ search: '田中' });
    });

    await waitFor(() => {
      expect(getCollectiveBurialListMock).toHaveBeenCalledTimes(2);
    });
    expect(getCollectiveBurialListMock).toHaveBeenLastCalledWith({ search: '田中' });

    // 二重フェッチ（3回目）が走らないこと
    await new Promise((r) => setTimeout(r, 50));
    expect(getCollectiveBurialListMock).toHaveBeenCalledTimes(2);
  });
});
