import {
  COLUMN_WIDTHS_KEY,
  COLUMN_MIN_WIDTH,
  COLUMN_MAX_WIDTH,
  clampColumnWidth,
  loadColumnWidths,
  saveColumnWidths,
  isColumnExpanded,
} from '../plots-column-widths';

describe('plots-column-widths', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('clampColumnWidth', () => {
    it('下限・上限でクランプし整数に丸める', () => {
      expect(clampColumnWidth(10)).toBe(COLUMN_MIN_WIDTH);
      expect(clampColumnWidth(9999)).toBe(COLUMN_MAX_WIDTH);
      expect(clampColumnWidth(120.7)).toBe(121);
    });
  });

  describe('load/save', () => {
    it('保存した値を読み戻せる（往復）', () => {
      saveColumnWidths({ address: 240, customerName: 180 });
      expect(loadColumnWidths()).toEqual({ address: 240, customerName: 180 });
    });

    it('未保存時は空オブジェクト', () => {
      expect(loadColumnWidths()).toEqual({});
    });

    it('不正な JSON は無視して空を返す', () => {
      window.localStorage.setItem(COLUMN_WIDTHS_KEY, '{not json');
      expect(loadColumnWidths()).toEqual({});
    });

    it('未知のキー・非数値は除外し、数値はクランプする', () => {
      window.localStorage.setItem(
        COLUMN_WIDTHS_KEY,
        JSON.stringify({ address: 9999, phone: 'wide', bogus: 100 })
      );
      expect(loadColumnWidths()).toEqual({ address: COLUMN_MAX_WIDTH });
    });
  });

  describe('isColumnExpanded', () => {
    it('デフォルト幅より広いと展開扱い', () => {
      expect(isColumnExpanded({ address: 240 }, 'address')).toBe(true);
    });

    it('デフォルト幅以下なら非展開（truncate 維持）', () => {
      expect(isColumnExpanded({ address: 60 }, 'address')).toBe(false);
      expect(isColumnExpanded({}, 'address')).toBe(false);
    });

    it('デフォルト幅 null（備考）は幅指定があれば展開', () => {
      expect(isColumnExpanded({ notes: 200 }, 'notes')).toBe(true);
      expect(isColumnExpanded({}, 'notes')).toBe(false);
    });
  });
});
