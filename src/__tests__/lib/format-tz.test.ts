/**
 * formatDate / formatYearMonth の TZ 非依存テスト（#218 / #250）
 *
 * backend は date-only 値（@db.Date）を返すが、シリアライズ形状は 2 通りある:
 *  - 手書き / 旧 backend: 'YYYY-MM-DD'
 *  - 実 API（Prisma 生 Date → res.json → toISOString）: 'YYYY-MM-DDT00:00:00.000Z'
 * いずれも `new Date(value)` は UTC 00:00 としてパースされるため、
 * ローカル getter（getFullYear/getMonth/getDate）依存の整形は
 * 負オフセット TZ（米国等）で前日表示になる。
 *
 * Jest プロセスでは実行時に TZ を切り替えられない（V8 がキャッシュ）ため、
 * 「date-only 入力ではローカル getter を一切使わない」ことをスパイで保証する。
 * ローカル getter を使わなければ、どの TZ でも結果は同一になる。
 */

import { formatDate, formatYearMonth } from '@/lib/format';

describe('formatDate の date-only 整形 (#218)', () => {
  it('date-only 文字列を正しく整形する', () => {
    expect(formatDate('2006-02-09')).toBe('2006/02/09');
    expect(formatDate('2020-01-01')).toBe('2020/01/01');
    expect(formatDate('2024-12-31')).toBe('2024/12/31');
  });

  it('date-only 入力ではローカル TZ getter を使わない（TZ 非依存の保証）', () => {
    const spyYear = jest.spyOn(Date.prototype, 'getFullYear');
    const spyMonth = jest.spyOn(Date.prototype, 'getMonth');
    const spyDate = jest.spyOn(Date.prototype, 'getDate');
    try {
      formatDate('2006-02-09');
      formatYearMonth('2024-03-01');
      expect(spyYear).not.toHaveBeenCalled();
      expect(spyMonth).not.toHaveBeenCalled();
      expect(spyDate).not.toHaveBeenCalled();
    } finally {
      spyYear.mockRestore();
      spyMonth.mockRestore();
      spyDate.mockRestore();
    }
  });

  it('date-only 形式で実在しない日付は fallback（legacy パーサの繰り上がりに流さない）', () => {
    expect(formatDate('2024-02-31')).toBe('-');
    expect(formatDate('2024-13-01')).toBe('-');
    expect(formatDate('2024-00-10')).toBe('-');
  });

  it('datetime 文字列・Date インスタンスは従来どおりローカルTZで整形', () => {
    expect(formatDate(new Date(2024, 5, 15))).toBe('2024/06/15');
    // datetime はローカル getter 経由（時刻成分が意味を持つケース）
    const spyDate = jest.spyOn(Date.prototype, 'getDate');
    try {
      formatDate('2024-06-15T12:00:00Z');
      expect(spyDate).toHaveBeenCalled();
    } finally {
      spyDate.mockRestore();
    }
  });

  // #250: 実 API は @db.Date を 'YYYY-MM-DDT00:00:00.000Z' で返す。
  // これも date-only として整形し、ローカル getter を経由しないことを保証する。
  it('実 API の @db.Date 形状（UTC 深夜 datetime）を date-only として整形する', () => {
    expect(formatDate('2024-03-15T00:00:00.000Z')).toBe('2024/03/15');
    expect(formatDate('2006-02-09T00:00:00.000Z')).toBe('2006/02/09');
    expect(formatDate('2020-01-01T00:00:00.000Z')).toBe('2020/01/01');
  });

  it('@db.Date 形状入力ではローカル TZ getter を使わない（TZ 非依存の保証 #250）', () => {
    const spyYear = jest.spyOn(Date.prototype, 'getFullYear');
    const spyMonth = jest.spyOn(Date.prototype, 'getMonth');
    const spyDate = jest.spyOn(Date.prototype, 'getDate');
    try {
      formatDate('2024-03-15T00:00:00.000Z');
      formatYearMonth('2024-03-15T00:00:00.000Z');
      expect(spyYear).not.toHaveBeenCalled();
      expect(spyMonth).not.toHaveBeenCalled();
      expect(spyDate).not.toHaveBeenCalled();
    } finally {
      spyYear.mockRestore();
      spyMonth.mockRestore();
      spyDate.mockRestore();
    }
  });

  it('@db.Date 形状で実在しない日付は fallback', () => {
    expect(formatDate('2024-02-31T00:00:00.000Z')).toBe('-');
  });

  // 時刻成分を持つ本物のタイムスタンプ（created_at 等）は date-only 扱いしない。
  // 厳密な T00:00:00.000Z 以外（ミリ秒なし・時刻あり）はローカル整形にフォールバック。
  it('時刻成分のあるタイムスタンプは従来どおりローカルTZ整形（厳密形状のみ date-only）', () => {
    const spyDate = jest.spyOn(Date.prototype, 'getDate');
    try {
      formatDate('2024-03-15T08:30:00.000Z');
      formatDate('2024-03-15T00:00:00Z'); // ミリ秒なしは @db.Date 形状ではない
      expect(spyDate).toHaveBeenCalled();
    } finally {
      spyDate.mockRestore();
    }
  });
});

describe('formatYearMonth の date-only 整形 (#218 / #250)', () => {
  it('date-only 文字列の年月を正しく整形する', () => {
    expect(formatYearMonth('2024-03-01')).toBe('2024/03');
    expect(formatYearMonth('2020-01-01')).toBe('2020/01');
  });

  it('実 API の @db.Date 形状（UTC 深夜 datetime）の年月を正しく整形する', () => {
    expect(formatYearMonth('2024-03-01T00:00:00.000Z')).toBe('2024/03');
    expect(formatYearMonth('2020-01-01T00:00:00.000Z')).toBe('2020/01');
  });

  it('date-only 形式で実在しない日付は fallback', () => {
    expect(formatYearMonth('2024-02-31')).toBe('-');
    expect(formatYearMonth('2024-02-31T00:00:00.000Z')).toBe('-');
  });
});
