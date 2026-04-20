import { resendInvitation } from '@/lib/api/staff';

const apiPostMock = jest.fn();
const shouldUseMockDataMock = jest.fn();

jest.mock('@/lib/api/client', () => ({
  apiGet: jest.fn(),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
  shouldUseMockData: () => shouldUseMockDataMock(),
}));

describe('resendInvitation', () => {
  beforeEach(() => {
    apiPostMock.mockReset();
    shouldUseMockDataMock.mockReset();
  });

  describe('real API', () => {
    beforeEach(() => {
      shouldUseMockDataMock.mockReturnValue(false);
    });

    it('POST /staff/:id/resend-invitation を呼び出す', async () => {
      apiPostMock.mockResolvedValue({
        success: true,
        data: { message: '招待メールを再送信しました' },
      });

      const result = await resendInvitation(42);

      expect(apiPostMock).toHaveBeenCalledWith('/staff/42/resend-invitation');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe('招待メールを再送信しました');
      }
    });

    it('エラーレスポンスをそのまま返す', async () => {
      apiPostMock.mockResolvedValue({
        success: false,
        error: { code: 'NOT_FOUND', message: 'スタッフが見つかりません' },
      });

      const result = await resendInvitation(999);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('mock mode', () => {
    beforeEach(() => {
      shouldUseMockDataMock.mockReturnValue(true);
    });

    it('存在するID(1)で成功レスポンスを返し、APIは呼ばれない', async () => {
      const result = await resendInvitation(1);

      expect(apiPostMock).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe('招待メールを再送信しました');
      }
    });

    it('存在しないIDでNOT_FOUNDを返す', async () => {
      const result = await resendInvitation(99999);

      expect(apiPostMock).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe('NOT_FOUND');
      }
    });
  });
});
