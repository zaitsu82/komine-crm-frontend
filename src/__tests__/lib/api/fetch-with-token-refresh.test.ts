/**
 * fetchWithTokenRefresh のテスト（#256）
 *
 * blob 取得等で apiRequest を使えない直 fetch にも、共有クライアントと同じ
 * トークンリフレッシュ（期限間近の先行リフレッシュ・401 時の一度きり再試行）を
 * 提供することを固定する。getDocumentFile / uploadDocumentFile / exportYuchoCsv
 * が利用する。
 */

import {
  fetchWithTokenRefresh,
  setTokenRefreshCallback,
  setTokenExpiresAt,
  clearAllTokens,
} from '@/lib/api/client';

// jsdom には Response が無いため最小限のスタブを使う
const mockResponse = (status: number): Response =>
  ({ status, ok: status >= 200 && status < 300 }) as Response;

describe('fetchWithTokenRefresh (#256)', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    clearAllTokens();
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    // 他テストへ漏れないようコールバックを無効化
    setTokenRefreshCallback(() => Promise.resolve(false));
    clearAllTokens();
  });

  it('200 応答ならリフレッシュせず 1 回だけ fetch する', async () => {
    const onRefresh = jest.fn().mockResolvedValue(true);
    setTokenRefreshCallback(onRefresh);
    fetchMock.mockResolvedValue(mockResponse(200));

    const res = await fetchWithTokenRefresh('http://api/test', { method: 'GET' });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onRefresh).not.toHaveBeenCalled();
    // HttpOnly Cookie 送信のため credentials: 'include' が必ず付くこと
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api/test',
      expect.objectContaining({ credentials: 'include', method: 'GET' })
    );
  });

  it('401 応答なら一度リフレッシュして再 fetch する', async () => {
    const onRefresh = jest.fn().mockResolvedValue(true);
    setTokenRefreshCallback(onRefresh);
    fetchMock
      .mockResolvedValueOnce(mockResponse(401))
      .mockResolvedValueOnce(mockResponse(200));

    const res = await fetchWithTokenRefresh('http://api/test');

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
  });

  it('リフレッシュ失敗時は再試行せず 401 をそのまま返す', async () => {
    const onRefresh = jest.fn().mockResolvedValue(false);
    setTokenRefreshCallback(onRefresh);
    fetchMock.mockResolvedValue(mockResponse(401));

    const res = await fetchWithTokenRefresh('http://api/test');

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(401);
  });

  it('再試行後も 401 なら無限ループせずそのまま返す', async () => {
    const onRefresh = jest.fn().mockResolvedValue(true);
    setTokenRefreshCallback(onRefresh);
    fetchMock.mockResolvedValue(mockResponse(401));

    const res = await fetchWithTokenRefresh('http://api/test');

    // リフレッシュは一度きり・fetch は最大2回
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(401);
  });

  it('トークンが期限切れ間近なら fetch 前に先行リフレッシュする', async () => {
    const onRefresh = jest.fn().mockResolvedValue(true);
    setTokenRefreshCallback(onRefresh);
    // 有効期限を「今から1分後」に設定（5分閾値の期限間近に該当）
    setTokenExpiresAt(Math.floor(Date.now() / 1000) + 60);
    fetchMock.mockResolvedValue(mockResponse(200));

    const res = await fetchWithTokenRefresh('http://api/test');

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
  });
});
