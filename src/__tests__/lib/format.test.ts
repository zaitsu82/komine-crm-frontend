import {
  formatCurrency,
  formatNumber,
  formatPhoneNumber,
  formatPostalCode,
  formatBillingMonth,
  formatDate,
  formatYearMonth,
} from '@/lib/format';

describe('formatCurrency', () => {
  it('数値をカンマ区切り + 円で表示する', () => {
    expect(formatCurrency(270000)).toBe('270,000円');
    expect(formatCurrency(1500000)).toBe('1,500,000円');
  });

  it('0 は "0円" として表示する', () => {
    expect(formatCurrency(0)).toBe('0円');
  });

  it('null / undefined / 空文字は fallback を返す', () => {
    expect(formatCurrency(null)).toBe('-');
    expect(formatCurrency(undefined)).toBe('-');
    expect(formatCurrency('')).toBe('-');
    expect(formatCurrency('  ')).toBe('-');
    expect(formatCurrency(null, '未設定')).toBe('未設定');
  });

  it('カンマ・円・通貨記号付き文字列も数値として解釈する', () => {
    expect(formatCurrency('270,000')).toBe('270,000円');
    expect(formatCurrency('270000円')).toBe('270,000円');
    expect(formatCurrency('¥270,000')).toBe('270,000円');
  });

  it('数値化できない文字列はトリムして返す', () => {
    expect(formatCurrency('応相談')).toBe('応相談');
  });
});

describe('formatNumber', () => {
  it('カンマ区切りの数値文字列を返す', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  it('null / undefined は fallback を返す', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined, '-')).toBe('-');
  });
});

describe('formatPhoneNumber', () => {
  it('携帯番号を 3-4-4 で区切る', () => {
    expect(formatPhoneNumber('09083526733')).toBe('090-8352-6733');
    expect(formatPhoneNumber('08012345678')).toBe('080-1234-5678');
  });

  it('東京/大阪の固定電話を 2-4-4 で区切る', () => {
    expect(formatPhoneNumber('0312345678')).toBe('03-1234-5678');
    expect(formatPhoneNumber('0612345678')).toBe('06-1234-5678');
  });

  it('その他10桁の固定電話は 3-3-4 で区切る', () => {
    expect(formatPhoneNumber('0429876543')).toBe('042-987-6543');
  });

  it('フリーダイヤル 0120 を 4-3-3 で区切る', () => {
    expect(formatPhoneNumber('0120123456')).toBe('0120-123-456');
  });

  it('null / 空は空文字を返す', () => {
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber('')).toBe('');
  });

  it('想定外の桁数は元の値を返す', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});

describe('formatPostalCode', () => {
  it('7桁を XXX-XXXX で区切る', () => {
    expect(formatPostalCode('8070842')).toBe('807-0842');
  });

  it('既にハイフン付きでも整形する', () => {
    expect(formatPostalCode('807-0842')).toBe('807-0842');
  });

  it('null / 空は空文字、7桁以外はそのまま返す', () => {
    expect(formatPostalCode(null)).toBe('');
    expect(formatPostalCode('')).toBe('');
    expect(formatPostalCode('123')).toBe('123');
  });
});

describe('formatBillingMonth', () => {
  it('YYYYMM を YYYY年M月 に変換する', () => {
    expect(formatBillingMonth('202403')).toBe('2024年3月');
    expect(formatBillingMonth('202412')).toBe('2024年12月');
  });

  it('YYYY年M月 形式は前ゼロを除いて返す', () => {
    expect(formatBillingMonth('2024年03月')).toBe('2024年3月');
    expect(formatBillingMonth('2024年3月')).toBe('2024年3月');
  });

  it('区切り付きの年月も変換する', () => {
    expect(formatBillingMonth('2024/03')).toBe('2024年3月');
    expect(formatBillingMonth('2024-03')).toBe('2024年3月');
  });

  it('"0" / 空 / null / 全ゼロは未設定を返す', () => {
    expect(formatBillingMonth('0')).toBe('未設定');
    expect(formatBillingMonth('')).toBe('未設定');
    expect(formatBillingMonth(null)).toBe('未設定');
    expect(formatBillingMonth('000000')).toBe('未設定');
    expect(formatBillingMonth('0', '-')).toBe('-');
  });

  it('不正な月は未設定を返す', () => {
    expect(formatBillingMonth('202413')).toBe('未設定');
  });
});

describe('formatDate', () => {
  it('ISO日付文字列を YYYY/MM/DD（ゼロ埋め）にする', () => {
    expect(formatDate('2006-02-09')).toBe('2006/02/09');
    expect(formatDate('2024-12-31T00:00:00.000Z')).toBe('2024/12/31');
  });

  it('Date インスタンスも受け付ける', () => {
    expect(formatDate(new Date(2006, 1, 9))).toBe('2006/02/09');
  });

  it('null / 空 / 不正値は fallback を返す', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
    expect(formatDate('not-a-date')).toBe('-');
    expect(formatDate(null, '未設定')).toBe('未設定');
  });
});

describe('formatYearMonth', () => {
  it('YYYY/MM（ゼロ埋め）にする', () => {
    expect(formatYearMonth('2006-02-09')).toBe('2006/02');
    expect(formatYearMonth(new Date(1991, 4, 15))).toBe('1991/05');
  });

  it('null / 不正値は fallback を返す', () => {
    expect(formatYearMonth(null)).toBe('-');
    expect(formatYearMonth('bad')).toBe('-');
  });
});
