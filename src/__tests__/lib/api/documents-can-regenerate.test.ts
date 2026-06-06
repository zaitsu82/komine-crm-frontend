/**
 * canRegenerateDocument のテスト（#230）
 *
 * 書類ダウンロードボタンの表示条件。本番（非モック）では backend が
 * fileName を返さないため、fileName ではなく templateType ベースで
 * 再生成可否を判定することを保証する。
 */

import { DOCUMENT_TEMPLATE_TYPES } from '@komine/types/api';
import { canRegenerateDocument } from '@/lib/api/documents';

describe('canRegenerateDocument (#230)', () => {
  it.each(DOCUMENT_TEMPLATE_TYPES.map((t) => [t]))(
    'テンプレートタイプ %s は再生成可能',
    (templateType) => {
      expect(canRegenerateDocument(templateType)).toBe(true);
    }
  );

  it('templateType が null のとき再生成不可', () => {
    expect(canRegenerateDocument(null)).toBe(false);
  });

  it('templateType が空文字のとき再生成不可', () => {
    expect(canRegenerateDocument('')).toBe(false);
  });

  it('未知の templateType は再生成不可', () => {
    expect(canRegenerateDocument('unknown-template')).toBe(false);
  });
});

describe('canRegenerateDocument with hasTemplateData (#251)', () => {
  it('有効な templateType + template_data あり → 再生成可能', () => {
    expect(canRegenerateDocument('invoice', true)).toBe(true);
  });

  it('有効な templateType でも template_data 無し → 再生成不可', () => {
    expect(canRegenerateDocument('invoice', false)).toBe(false);
  });

  it('hasTemplateData 省略時は templateType のみで判定（後方互換・一覧文脈）', () => {
    // 一覧応答は template_data を含まないため templateType だけで判定する
    expect(canRegenerateDocument('invoice')).toBe(true);
    expect(canRegenerateDocument('invoice', undefined)).toBe(true);
  });

  it('templateType 無効なら template_data の有無に関わらず再生成不可', () => {
    expect(canRegenerateDocument(null, true)).toBe(false);
    expect(canRegenerateDocument('unknown-template', true)).toBe(false);
  });
});
