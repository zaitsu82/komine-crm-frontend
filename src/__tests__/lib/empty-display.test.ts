import { isEmptyDisplayValue, EMPTY_LABELS } from '@/lib/empty-display';

/**
 * #181: 空値表示の統一ルール。
 */
describe('isEmptyDisplayValue (#181)', () => {
  it('null / undefined / 空文字は空とみなす', () => {
    expect(isEmptyDisplayValue(null)).toBe(true);
    expect(isEmptyDisplayValue(undefined)).toBe(true);
    expect(isEmptyDisplayValue('')).toBe(true);
    expect(isEmptyDisplayValue('   ')).toBe(true);
  });

  it('各種ダッシュ・「未設定」などのフォールバック値も空とみなす', () => {
    expect(isEmptyDisplayValue('-')).toBe(true);
    expect(isEmptyDisplayValue('—')).toBe(true);
    expect(isEmptyDisplayValue('―')).toBe(true);
    expect(isEmptyDisplayValue('未設定')).toBe(true);
  });

  it('実データは空とみなさない', () => {
    expect(isEmptyDisplayValue('田中太郎')).toBe(false);
    expect(isEmptyDisplayValue('0')).toBe(false); // 金額0等は有効値
    expect(isEmptyDisplayValue('2020/04/01')).toBe(false);
    expect(isEmptyDisplayValue('面積×単価')).toBe(false);
  });

  it('空値ラベルは未登録/対象外', () => {
    expect(EMPTY_LABELS.unregistered).toBe('未登録');
    expect(EMPTY_LABELS.na).toBe('対象外');
  });
});
