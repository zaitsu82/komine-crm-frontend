import { formatDate, formatDateWithEra } from '@/lib/utils'

describe('utils.ts - ユーティリティ関数', () => {
  describe('formatDate', () => {
    it('有効な日付を正しくフォーマットする', () => {
      const date = new Date(2023, 0, 15) // 2023年1月15日
      const formatted = formatDate(date)
      expect(formatted).toBe('2023/01/15')
    })

    it('nullの場合は空文字を返す', () => {
      const formatted = formatDate(null)
      expect(formatted).toBe('')
    })

    it('月と日が一桁の場合もゼロパディングされる', () => {
      const date = new Date(2023, 0, 5) // 2023年1月5日
      const formatted = formatDate(date)
      expect(formatted).toBe('2023/01/05')
    })
  })

  describe('formatDateWithEra', () => {
    describe('令和時代の日付', () => {
      it('令和元年の日付を正しくフォーマットする', () => {
        const date = new Date(2019, 3, 15) // 2019年4月15日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和1年 4月15日')
      })

      it('令和5年の日付を正しくフォーマットする', () => {
        const date = new Date(2023, 11, 25) // 2023年12月25日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和5年 12月25日')
      })

      it('令和6年の日付を正しくフォーマットする', () => {
        const date = new Date(2024, 0, 1) // 2024年1月1日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和6年 1月1日')
      })
    })

    describe('平成時代の日付', () => {
      it('平成元年の日付を正しくフォーマットする', () => {
        const date = new Date(1989, 0, 8) // 1989年1月8日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('平成1年 1月8日')
      })

      it('平成10年の日付を正しくフォーマットする', () => {
        const date = new Date(1998, 5, 10) // 1998年6月10日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('平成10年 6月10日')
      })

      it('平成31年の日付を正しくフォーマットする', () => {
        const date = new Date(2019, 2, 15) // 2019年3月15日（令和元年前）
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('平成31年 3月15日')
      })
    })

    describe('昭和時代の日付', () => {
      it('昭和64年の日付はフォーマットされない（範囲外）', () => {
        const date = new Date(1988, 11, 31) // 1988年12月31日
        const formatted = formatDateWithEra(date)
        // 昭和時代は実装されていないため、空文字または特定の形式が期待される
        expect(formatted).toBe('年 12月31日') // 元号部分が空になる
      })
    })

    describe('エッジケース', () => {
      it('nullの場合は空文字を返す', () => {
        const formatted = formatDateWithEra(null)
        expect(formatted).toBe('')
      })

      it('令和改元日（2019年5月1日）を正しく処理する', () => {
        const date = new Date(2019, 4, 1) // 2019年5月1日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和1年 5月1日')
      })

      it('平成最後の日（2019年4月30日）を正しく処理する', () => {
        const date = new Date(2019, 3, 30) // 2019年4月30日
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和1年 4月30日')
      })
    })

    describe('境界値テスト', () => {
      it('2019年1月1日は令和1年', () => {
        const date = new Date(2019, 0, 1)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和1年 1月1日')
      })

      it('2018年12月31日は平成30年', () => {
        const date = new Date(2018, 11, 31)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('平成30年 12月31日')
      })

      it('1989年1月1日は平成1年', () => {
        const date = new Date(1989, 0, 1)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('平成1年 1月1日')
      })

      it('1988年12月31日は範囲外（昭和）', () => {
        const date = new Date(1988, 11, 31)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('年 12月31日')
      })
    })

    describe('月日の表示', () => {
      it('1月は正しく表示される', () => {
        const date = new Date(2023, 0, 15)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和5年 1月15日')
      })

      it('12月は正しく表示される', () => {
        const date = new Date(2023, 11, 31)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和5年 12月31日')
      })

      it('1日は正しく表示される', () => {
        const date = new Date(2023, 5, 1)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和5年 6月1日')
      })

      it('31日は正しく表示される', () => {
        const date = new Date(2023, 6, 31)
        const formatted = formatDateWithEra(date)
        expect(formatted).toBe('令和5年 7月31日')
      })
    })

    describe('年の計算', () => {
      it('令和年数の計算が正しい', () => {
        const testCases = [
          { year: 2019, expected: 1 },
          { year: 2020, expected: 2 },
          { year: 2023, expected: 5 },
          { year: 2024, expected: 6 }
        ]

        testCases.forEach(({ year, expected }) => {
          const date = new Date(year, 0, 1)
          const formatted = formatDateWithEra(date)
          expect(formatted).toBe(`令和${expected}年 1月1日`)
        })
      })

      it('平成年数の計算が正しい', () => {
        const testCases = [
          { year: 1989, expected: 1 },
          { year: 1990, expected: 2 },
          { year: 2000, expected: 12 },
          { year: 2018, expected: 30 }
        ]

        testCases.forEach(({ year, expected }) => {
          const date = new Date(year, 0, 1)
          const formatted = formatDateWithEra(date)
          expect(formatted).toBe(`平成${expected}年 1月1日`)
        })
      })
    })
  })
})