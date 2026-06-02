import {
  isLegacyPlotNumber,
  isLegacyAreaName,
} from '@/lib/legacy-plot-display';

/**
 * #164/#166/#182: レガシー移行値の判定。
 * 正規化済みの業務値は false（＝整備中表示を出さない）になることが重要。
 */
describe('isLegacyPlotNumber (#164)', () => {
  it('legacy-101 / unknown-xxx / bare legacy はレガシー', () => {
    expect(isLegacyPlotNumber('legacy-101')).toBe(true);
    expect(isLegacyPlotNumber('unknown-999')).toBe(true);
    expect(isLegacyPlotNumber('legacy')).toBe(true); // 集計のセクション抽出結果
    expect(isLegacyPlotNumber('LEGACY-5')).toBe(true); // 大小無視
  });

  it('業務区画番号（A-56 等）はレガシーではない', () => {
    expect(isLegacyPlotNumber('A-56')).toBe(false);
    expect(isLegacyPlotNumber('第1期-A-12')).toBe(false);
    expect(isLegacyPlotNumber('123')).toBe(false);
  });

  it('null / undefined / 空は false', () => {
    expect(isLegacyPlotNumber(null)).toBe(false);
    expect(isLegacyPlotNumber(undefined)).toBe(false);
    expect(isLegacyPlotNumber('')).toBe(false);
  });
});

describe('isLegacyAreaName (#166)', () => {
  it('chiku_cd-area_cd（数字-数字）/ unknown はレガシー', () => {
    expect(isLegacyAreaName('1-29')).toBe(true);
    expect(isLegacyAreaName('10-3')).toBe(true);
    expect(isLegacyAreaName('unknown-123')).toBe(true);
    expect(isLegacyAreaName('unknown')).toBe(true);
  });

  it('正式な期・区画名はレガシーではない', () => {
    expect(isLegacyAreaName('第1期')).toBe(false);
    expect(isLegacyAreaName('第3期樹林部')).toBe(false);
    expect(isLegacyAreaName('A')).toBe(false);
    expect(isLegacyAreaName('1.5')).toBe(false); // 小数の区画名はハイフンでないので対象外
  });

  it('null / undefined / 空は false', () => {
    expect(isLegacyAreaName(null)).toBe(false);
    expect(isLegacyAreaName(undefined)).toBe(false);
    expect(isLegacyAreaName('')).toBe(false);
  });
});
