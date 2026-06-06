/**
 * 書類ダウンロード経路のテスト（#249 / #251）
 *
 * - getDocumentFile: アップロード済みファイル実体（Blob）の取得
 * - mockRegenerateDocumentPdf: backend と同条件
 *   （template_type AND template_data）でゲートすること
 */

import {
  getDocumentFile,
  regenerateDocumentPdf,
  getDocumentDownloadUrl,
} from '@/lib/api/documents';

// shouldUseMockData を true 固定にしてモック実装を検証する
jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual('@/lib/api/client');
  return {
    ...actual,
    shouldUseMockData: () => true,
  };
});

describe('getDocumentFile（モック・#249）', () => {
  it('fileKey/fileName のある書類は Blob とファイル名を返す', async () => {
    // doc-001 は fileName/fileKey あり
    const result = await getDocumentFile('doc-001');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fileName).toBe('請求書_2024年1月分.pdf');
      expect(result.data.blob).toBeInstanceOf(Blob);
    }
  });

  it('ファイル未添付の書類（doc-003）は NO_FILE を返す', async () => {
    const result = await getDocumentFile('doc-003');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('NO_FILE');
    }
  });

  it('存在しない書類は NOT_FOUND を返す', async () => {
    const result = await getDocumentFile('doc-does-not-exist');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('NOT_FOUND');
    }
  });
});

describe('mockRegenerateDocumentPdf（#251 — backend 条件と一致）', () => {
  it('template_type AND template_data あり（doc-001）→ 再生成成功', async () => {
    const result = await regenerateDocumentPdf('doc-001');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pdf).toBeTruthy();
    }
  });

  it('template_type あり・template_data 無し（doc-002）→ NO_TEMPLATE_DATA', async () => {
    const result = await regenerateDocumentPdf('doc-002');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('NO_TEMPLATE_DATA');
    }
  });

  it('template_type あり・template_data 無し・ファイル無し（doc-004）→ NO_TEMPLATE_DATA', async () => {
    const result = await regenerateDocumentPdf('doc-004');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('NO_TEMPLATE_DATA');
    }
  });
});

describe('getDocumentDownloadUrl（モック）', () => {
  it('ファイルのある書類は file 配信用の相対URLを返す', async () => {
    const result = await getDocumentDownloadUrl('doc-001');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fileName).toBe('請求書_2024年1月分.pdf');
    }
  });

  it('ファイル未添付（doc-003）は NO_FILE を返す', async () => {
    const result = await getDocumentDownloadUrl('doc-003');
    expect(result.success).toBe(false);
  });
});
