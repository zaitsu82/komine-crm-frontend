import {
  resolvePeriodFromAreaName,
  buildSectionPeriodMap,
  PERIOD_NAMES,
} from '@/lib/section-period';
import type { SectionNameMasterItem } from '@/lib/api/masters';

function sn(name: string, period: string, overrides: Partial<SectionNameMasterItem> = {}): SectionNameMasterItem {
  return {
    id: 1,
    code: name,
    name,
    description: null,
    sortOrder: null,
    isActive: true,
    period,
    ...overrides,
  };
}

describe('resolvePeriodFromAreaName', () => {
  const master: SectionNameMasterItem[] = [
    sn('凛A', '第4期'),
    sn('つながり', '第4期'),
    sn('樹木葬', '第3期樹林部'),
    sn('吉相C', '第1期'),
  ];

  it('area_name 自体が期名ならそのまま返す（手動作成区画など）', () => {
    for (const p of PERIOD_NAMES) {
      expect(resolvePeriodFromAreaName(p, master)).toBe(p);
    }
  });

  it('区画名マスタに登録があればその期を返す', () => {
    expect(resolvePeriodFromAreaName('凛A', master)).toBe('第4期');
    expect(resolvePeriodFromAreaName('樹木葬', master)).toBe('第3期樹林部');
    expect(resolvePeriodFromAreaName('吉相C', master)).toBe('第1期');
  });

  it('前後の空白を無視して解決する', () => {
    expect(resolvePeriodFromAreaName('  凛A  ', master)).toBe('第4期');
    expect(resolvePeriodFromAreaName(' 第2期 ', master)).toBe('第2期');
  });

  it('レガシー未正規化値（"1-29" 等）やマスタ未登録は null', () => {
    expect(resolvePeriodFromAreaName('1-29', master)).toBeNull();
    expect(resolvePeriodFromAreaName('legacy-101', master)).toBeNull();
    expect(resolvePeriodFromAreaName('存在しない区画', master)).toBeNull();
  });

  it('空値・マスタ未取得時は null', () => {
    expect(resolvePeriodFromAreaName(null, master)).toBeNull();
    expect(resolvePeriodFromAreaName(undefined, master)).toBeNull();
    expect(resolvePeriodFromAreaName('', master)).toBeNull();
    expect(resolvePeriodFromAreaName('凛A', null)).toBeNull();
    expect(resolvePeriodFromAreaName('凛A', [])).toBeNull();
  });
});

describe('buildSectionPeriodMap', () => {
  it('name → period のマップを作る', () => {
    const map = buildSectionPeriodMap([sn('凛A', '第4期'), sn('吉相C', '第1期')]);
    expect(map.get('凛A')).toBe('第4期');
    expect(map.get('吉相C')).toBe('第1期');
  });

  it('period が空のエントリは除外する', () => {
    const map = buildSectionPeriodMap([sn('凛A', '第4期'), sn('壊れ', '')]);
    expect(map.has('壊れ')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('null/undefined は空マップ', () => {
    expect(buildSectionPeriodMap(null).size).toBe(0);
    expect(buildSectionPeriodMap(undefined).size).toBe(0);
  });
});
