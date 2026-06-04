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
