/**
 * データ取得フックの世代ガードテスト（#231/#221）
 *
 * 連続操作時に先発の遅いレスポンスが後発の速いレスポンスを
 * 上書きしない（リクエスト順序逆転対策）ことを保証する。
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAsyncList } from '@/hooks/useAsyncList';
import type { ApiResponse } from '@/lib/api/types';

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('useAsyncData 世代ガード (#231)', () => {
  it('先発の遅いレスポンスが後発の結果を上書きしない', async () => {
    const d1 = deferred<ApiResponse<string>>();
    const d2 = deferred<ApiResponse<string>>();
    const fetchFn = jest
      .fn<Promise<ApiResponse<string>>, []>()
      .mockReturnValueOnce(d1.promise)
      .mockReturnValueOnce(d2.promise);

    const { result } = renderHook(() => useAsyncData<string>(fetchFn));

    // 初回フェッチ（世代1 = d1）が in-flight のまま refetch（世代2 = d2）
    act(() => {
      void result.current.refetch();
    });
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

    // 後発（世代2）が先に解決 → 反映される
    await act(async () => {
      d2.resolve({ success: true, data: 'newer' });
    });
    expect(result.current.data).toBe('newer');
    expect(result.current.isLoading).toBe(false);

    // 先発（世代1）が遅れて解決 → 破棄され、上書きされない
    await act(async () => {
      d1.resolve({ success: true, data: 'stale' });
    });
    expect(result.current.data).toBe('newer');
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useAsyncList 世代ガード (#231/#221)', () => {
  type Item = string;
  const page = (items: Item[]): ApiResponse<{
    items: Item[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => ({
    success: true,
    data: {
      items,
      pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
    },
  });

  it('検索条件変更後、古い条件のレスポンスで items が上書きされない', async () => {
    const d1 = deferred<ReturnType<typeof page>>();
    const d2 = deferred<ReturnType<typeof page>>();
    const fetchFn = jest
      .fn()
      .mockReturnValueOnce(d1.promise)
      .mockReturnValueOnce(d2.promise);

    const { result } = renderHook(() => useAsyncList<Item>(fetchFn));

    // 初回フェッチ（世代1）が in-flight のまま検索条件変更（世代2）
    act(() => {
      result.current.setSearch('柳');
    });
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

    // 後発（世代2 = 新しい検索結果）が先に解決
    await act(async () => {
      d2.resolve(page(['柳田一郎']));
    });
    expect(result.current.items).toEqual(['柳田一郎']);
    expect(result.current.isLoading).toBe(false);

    // 先発（世代1 = 全件）が遅れて解決 → 破棄される
    await act(async () => {
      d1.resolve(page(['山田太郎', '佐藤花子']));
    });
    expect(result.current.items).toEqual(['柳田一郎']);
    expect(result.current.total).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });
});
