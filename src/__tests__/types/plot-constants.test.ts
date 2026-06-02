import { getPlotSizeLabel, PLOT_SIZE } from '@/types/plot-constants';

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
