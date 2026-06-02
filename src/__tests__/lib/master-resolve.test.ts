import { resolveMasterName, LEGACY_FEE_CODE_MAP } from '@/lib/master-resolve';
import type { MasterItem } from '@/lib/api/masters';

const calcTypes: MasterItem[] = [
  { id: 1, code: 'AREA', name: '面積×単価', description: null, sortOrder: 1, isActive: true },
  { id: 2, code: 'FIXED', name: '任意設定', description: null, sortOrder: 2, isActive: true },
];
const taxTypes: MasterItem[] = [
  { id: 1, code: 'INCLUSIVE', name: '内税', description: null, sortOrder: 1, isActive: true },
  { id: 2, code: 'EXCLUSIVE', name: '外税', description: null, sortOrder: 2, isActive: true },
];
const directions: MasterItem[] = [
  { id: 1, code: '1', name: '東', description: null, sortOrder: 1, isActive: true },
  { id: 2, code: '2', name: '西', description: null, sortOrder: 2, isActive: true },
];

describe('resolveMasterName (#177)', () => {
  it('null / 空文字は null を返す', () => {
    expect(resolveMasterName(calcTypes, null)).toBeNull();
    expect(resolveMasterName(calcTypes, undefined)).toBeNull();
    expect(resolveMasterName(calcTypes, '')).toBeNull();
  });

  it('master code 一致でマスタ名を返す（新規データ）', () => {
    expect(resolveMasterName(calcTypes, 'AREA', LEGACY_FEE_CODE_MAP.calc)).toBe('面積×単価');
    expect(resolveMasterName(taxTypes, 'INCLUSIVE', LEGACY_FEE_CODE_MAP.tax)).toBe('内税');
  });

  it('旧int値を移行マップで正規化して正しいマスタ名に解決する', () => {
    // calc: 0→AREA(面積×単価), 1→FIXED(任意設定)。id 一致の off-by-one 誤マッチを起こさない。
    expect(resolveMasterName(calcTypes, '0', LEGACY_FEE_CODE_MAP.calc)).toBe('面積×単価');
    expect(resolveMasterName(calcTypes, '1', LEGACY_FEE_CODE_MAP.calc)).toBe('任意設定');
    // tax: 0→内税, 1→外税
    expect(resolveMasterName(taxTypes, '0', LEGACY_FEE_CODE_MAP.tax)).toBe('内税');
    expect(resolveMasterName(taxTypes, '1', LEGACY_FEE_CODE_MAP.tax)).toBe('外税');
  });

  it('マスタ未登録時は素の数値を残さず元の保存値を「旧コード: X」と明示する', () => {
    // マスタが空（未 seed 環境）→ 正規化はするが解決できないので元値を明示
    expect(resolveMasterName([], '1', LEGACY_FEE_CODE_MAP.calc)).toBe('旧コード: 1');
    // legacyMap に無い未知コード
    expect(resolveMasterName(calcTypes, '99', LEGACY_FEE_CODE_MAP.calc)).toBe('旧コード: 99');
    // 送付方法（マップ無し・意味不明な旧コード）
    expect(resolveMasterName([], '1')).toBe('旧コード: 1');
  });

  it('移行センチネル legacy-{prefix}-{value} は末尾の元値のみ表示する', () => {
    expect(resolveMasterName([], 'legacy-shiharai-3')).toBe('旧コード: 3');
  });

  it('id 参照のマスタ（方位・位置）は legacyMap 無しで従来どおり解決する', () => {
    expect(resolveMasterName(directions, '1')).toBe('東');
    expect(resolveMasterName(directions, '2')).toBe('西');
  });
});
