import {
  getPlotSizeLabel,
  PLOT_SIZE,
  getAvailabilityStatus,
  AVAILABILITY_STATUS_LABELS,
  LOW_STOCK_THRESHOLD,
} from '@/types/plot-constants';

/**
 * #178: 面積から区画サイズラベルを導出するヘルパー。
 * 分割販売注記（物理区画 3.6㎡ / 契約 1.8㎡ 等）の表示に使用。
 */
describe('getPlotSizeLabel (#178)', () => {
  it('3.6㎡（FULL）は「1区画」', () => {
    expect(getPlotSizeLabel(PLOT_SIZE.FULL)).toBe('1区画');
    expect(getPlotSizeLabel(3.6)).toBe('1区画');
  });

  it('1.8㎡（HALF）は「半区画」', () => {
    expect(getPlotSizeLabel(PLOT_SIZE.HALF)).toBe('半区画');
    expect(getPlotSizeLabel(1.8)).toBe('半区画');
  });

  it('既知サイズ以外（0.9㎡ 等）は null', () => {
    expect(getPlotSizeLabel(0.9)).toBeNull();
    expect(getPlotSizeLabel(2.7)).toBeNull();
  });

  it('null / undefined は null', () => {
    expect(getPlotSizeLabel(null)).toBeNull();
    expect(getPlotSizeLabel(undefined)).toBeNull();
  });
});

/**
 * #183: 在庫状況ステータスは残数（絶対値）で判定する。
 * テーブルの状況バッジと画面凡例が同じロジック・定数を参照することで表示と判定の乖離を防ぐ。
 */
describe('getAvailabilityStatus (#183)', () => {
  it('残0 は完売', () => {
    expect(getAvailabilityStatus(0)).toBe('sold_out');
    expect(AVAILABILITY_STATUS_LABELS[getAvailabilityStatus(0)]).toBe('完売');
  });

  it('残1〜閾値は残少', () => {
    expect(getAvailabilityStatus(1)).toBe('low_stock');
    expect(getAvailabilityStatus(LOW_STOCK_THRESHOLD)).toBe('low_stock');
    expect(AVAILABILITY_STATUS_LABELS[getAvailabilityStatus(3)]).toBe('残少');
  });

  it('閾値超は空有', () => {
    expect(getAvailabilityStatus(LOW_STOCK_THRESHOLD + 1)).toBe('available');
    expect(getAvailabilityStatus(100)).toBe('available');
    expect(AVAILABILITY_STATUS_LABELS[getAvailabilityStatus(50)]).toBe('空有');
  });

  it('負の残数は完売扱い（防御的）', () => {
    expect(getAvailabilityStatus(-1)).toBe('sold_out');
  });
});
