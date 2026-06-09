import {
  isJurinArea,
  classifyGraveType,
  inferValidityPeriodYears,
  summarizeValidityRule,
  calculateElapsedYears,
  calculateScheduledCollectiveBurialDate,
  JURIN_RULE_TRANSITION_DATE,
  VALIDITY_RULE_TABLE,
  STANDARD_VALIDITY_YEARS,
  getValidityYearOptions,
} from '@/lib/collective-burial-rules';

describe('collective-burial-rules', () => {
  describe('isJurinArea', () => {
    it('区域名に「樹林」を含めば true', () => {
      expect(isJurinArea('第3期樹林部')).toBe(true);
      expect(isJurinArea('樹林墓部')).toBe(true);
    });

    it('「樹林」を含まない / null / 空文字は false', () => {
      expect(isJurinArea('第1期A')).toBe(false);
      expect(isJurinArea('第2期')).toBe(false);
      expect(isJurinArea(null)).toBe(false);
      expect(isJurinArea('')).toBe(false);
    });
  });

  describe('classifyGraveType（#259 対応表ベース判定）', () => {
    it('「樹林」を含む区域名は jurin', () => {
      expect(classifyGraveType('第3期樹林部')).toBe('jurin');
      expect(classifyGraveType('樹林墓部')).toBe('jurin');
    });

    it('それ以外 / null は general', () => {
      expect(classifyGraveType('第1期A')).toBe('general');
      expect(classifyGraveType(null)).toBe('general');
      expect(classifyGraveType(undefined)).toBe('general');
    });
  });

  describe('VALIDITY_RULE_TABLE（#259 タイプ×年数対応表）', () => {
    // Q34 回答後に行を追加した際の最低限の整合性ガード
    it('全タイプの年数が正の整数で label を持つ', () => {
      for (const [type, rule] of Object.entries(VALIDITY_RULE_TABLE)) {
        expect(rule.label.length).toBeGreaterThan(0);
        expect(Number.isInteger(rule.years)).toBe(true);
        expect(rule.years).toBeGreaterThan(0);
        expect(Number.isInteger(rule.yearsBeforeTransition)).toBe(true);
        expect(rule.yearsBeforeTransition).toBeGreaterThan(0);
        expect(type.length).toBeGreaterThan(0);
      }
    });

    it('現時点のエントリは旧帳票準拠（樹林13/15・通常33）', () => {
      expect(VALIDITY_RULE_TABLE.jurin).toEqual({
        label: '樹林墓部',
        years: 13,
        yearsBeforeTransition: 15,
      });
      expect(VALIDITY_RULE_TABLE.general).toEqual({
        label: '通常区画',
        years: 33,
        yearsBeforeTransition: 33,
      });
    });
  });

  describe('getValidityYearOptions（#289 合祀年数マスタ参照）', () => {
    it('マスタの code から年数を昇順・重複排除で返す', () => {
      const master = [
        { code: '33', name: '33年' },
        { code: '13', name: '13年' },
        { code: '24', name: '24年' },
        { code: '15', name: '15年' },
        { code: '13', name: '13年（重複）' },
      ];
      expect(getValidityYearOptions(master)).toEqual([13, 15, 24, 33]);
    });

    it('code が非数値でも name から年数を拾う', () => {
      const master = [
        { code: 'VP_13', name: '13年' },
        { code: null, name: '24年' },
      ];
      expect(getValidityYearOptions(master)).toEqual([13, 24]);
    });

    it('マスタが空 / undefined / null は標準値にフォールバックする', () => {
      expect(getValidityYearOptions([])).toEqual(STANDARD_VALIDITY_YEARS);
      expect(getValidityYearOptions(undefined)).toEqual(STANDARD_VALIDITY_YEARS);
      expect(getValidityYearOptions(null)).toEqual(STANDARD_VALIDITY_YEARS);
    });

    it('年数を一切取り出せない場合も標準値にフォールバックする', () => {
      const master = [{ code: 'x', name: '不明' }];
      expect(getValidityYearOptions(master)).toEqual(STANDARD_VALIDITY_YEARS);
    });

    it('標準値フォールバックには 24 年が含まれる（旧ハードコードに無かった値）', () => {
      expect(STANDARD_VALIDITY_YEARS).toContain(24);
      expect(getValidityYearOptions([])).toContain(24);
    });
  });

  describe('inferValidityPeriodYears', () => {
    it('樹林墓部 + 2023-04-01 以降 → 13 年', () => {
      expect(inferValidityPeriodYears('第3期樹林部', '2023-04-01')).toBe(13);
      expect(inferValidityPeriodYears('第3期樹林部', '2024-06-15')).toBe(13);
    });

    it('樹林墓部 + 2023-04-01 より前 → 15 年 (旧ルール)', () => {
      expect(inferValidityPeriodYears('第3期樹林部', '2023-03-31')).toBe(15);
      expect(inferValidityPeriodYears('第3期樹林部', '2020-01-01')).toBe(15);
    });

    it('非樹林部 → 33 年 (契約日に関わらず)', () => {
      expect(inferValidityPeriodYears('第1期A', '2020-01-01')).toBe(33);
      expect(inferValidityPeriodYears('第2期', '2024-06-15')).toBe(33);
      expect(inferValidityPeriodYears('第4期', null)).toBe(33);
    });

    it('契約日省略時は樹林部 → 新ルール 13 年扱い', () => {
      expect(inferValidityPeriodYears('第3期樹林部')).toBe(13);
    });

    it('areaName が null / undefined は 33 年', () => {
      expect(inferValidityPeriodYears(null)).toBe(33);
      expect(inferValidityPeriodYears(undefined)).toBe(33);
    });
  });

  describe('summarizeValidityRule (#259)', () => {
    it('樹林墓部 + 新ルール → 13年と根拠を返す', () => {
      expect(summarizeValidityRule('第3期樹林部', '2023-04-01')).toBe(
        '樹林墓部・契約日 2023-04-01 以降 → 13年'
      );
    });

    it('樹林墓部 + 旧ルール → 15年と根拠を返す', () => {
      expect(summarizeValidityRule('第3期樹林部', '2022-12-01')).toBe(
        '樹林墓部・契約日 2023-04-01 より前 → 15年'
      );
    });

    it('通常区画 → 33年と根拠を返す', () => {
      expect(summarizeValidityRule('第1期A', '2024-01-01')).toBe('通常区画 → 33年');
      expect(summarizeValidityRule(null)).toBe('通常区画 → 33年');
    });
  });

  describe('calculateElapsedYears', () => {
    it('単純な年差 (相当日経過後)', () => {
      const ref = new Date(2026, 5, 1); // 2026-06-01
      expect(calculateElapsedYears('2020-01-15', ref)).toBe(6);
    });

    it('相当日前は -1 年', () => {
      const ref = new Date(2026, 5, 1); // 2026-06-01
      // 2020-08-01 はまだ「相当日」(8月1日) を迎えていない → 5 年
      expect(calculateElapsedYears('2020-08-01', ref)).toBe(5);
    });

    it('相当日当日は完了扱い', () => {
      const ref = new Date(2026, 5, 1); // 2026-06-01
      expect(calculateElapsedYears('2020-06-01', ref)).toBe(6);
    });

    it('未来日は null', () => {
      const ref = new Date(2026, 5, 1);
      expect(calculateElapsedYears('2030-01-01', ref)).toBe(null);
    });

    it('null / undefined / 無効文字列は null', () => {
      expect(calculateElapsedYears(null)).toBe(null);
      expect(calculateElapsedYears(undefined)).toBe(null);
      expect(calculateElapsedYears('not-a-date')).toBe(null);
    });

    it('Date インスタンスも受け付ける', () => {
      const ref = new Date(2026, 5, 1);
      expect(calculateElapsedYears(new Date(2020, 0, 15), ref)).toBe(6);
    });
  });

  describe('calculateScheduledCollectiveBurialDate', () => {
    it('基準日 + N 年', () => {
      const result = calculateScheduledCollectiveBurialDate('2020-03-15', 13);
      expect(result?.getFullYear()).toBe(2033);
      expect(result?.getMonth()).toBe(2); // 3月
      expect(result?.getDate()).toBe(15);
    });

    it('33 年ルール', () => {
      const result = calculateScheduledCollectiveBurialDate('2000-01-01', 33);
      expect(result?.getFullYear()).toBe(2033);
    });

    it('基準日が null → null', () => {
      expect(calculateScheduledCollectiveBurialDate(null, 13)).toBe(null);
      expect(calculateScheduledCollectiveBurialDate(undefined, 33)).toBe(null);
    });
  });

  describe('JURIN_RULE_TRANSITION_DATE', () => {
    it('2023-04-01 である', () => {
      expect(JURIN_RULE_TRANSITION_DATE.getFullYear()).toBe(2023);
      expect(JURIN_RULE_TRANSITION_DATE.getMonth()).toBe(3); // 4月
      expect(JURIN_RULE_TRANSITION_DATE.getDate()).toBe(1);
    });
  });
});
