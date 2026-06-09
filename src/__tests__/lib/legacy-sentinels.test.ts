import { formatFeeType, isUnsetContractor, UNSET_CONTRACTOR_CODE } from '@/lib/legacy-sentinels';

describe('formatFeeType (#334)', () => {
  it('legacy センチネルを使用料/管理料へ変換する', () => {
    expect(formatFeeType('legacy-fee-20230001')).toBe('使用料');
    expect(formatFeeType('legacy-fee-20230002')).toBe('管理料');
  });

  it('未設定は "-" を返す', () => {
    expect(formatFeeType(null)).toBe('-');
    expect(formatFeeType(undefined)).toBe('-');
    expect(formatFeeType('')).toBe('-');
  });

  it('既知センチネル以外（手入力値等）は素通しする', () => {
    expect(formatFeeType('使用料')).toBe('使用料');
    expect(formatFeeType('legacy-fee-99999999')).toBe('legacy-fee-99999999');
  });
});

describe('isUnsetContractor (#334)', () => {
  it('legacy-gyousha-0（未設定センチネル）のみ true', () => {
    expect(isUnsetContractor(UNSET_CONTRACTOR_CODE)).toBe(true);
    expect(isUnsetContractor('legacy-gyousha-0')).toBe(true);
  });

  it('実在業者コード・未設定値は false', () => {
    expect(isUnsetContractor('legacy-gyousha-12')).toBe(false);
    expect(isUnsetContractor('財津工務店')).toBe(false);
    expect(isUnsetContractor(null)).toBe(false);
    expect(isUnsetContractor(undefined)).toBe(false);
  });
});
