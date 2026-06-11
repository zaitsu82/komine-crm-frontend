import {
  cn,
  calculateOwnedPlotsInfo,
  getPlotArea,
  calculateEffectiveCapacity,
  calculateSuggestedPrice,
  validatePlotAssignment,
  validatePlotAssignments,
  formatPlotNumber,
} from '@/lib/utils'
import type { OwnedPlot } from '@/types/plot-constants'

describe('utils.ts - ユーティリティ関数', () => {

  // ===== cn =====
  describe('cn', () => {
    it('複数のクラス名を結合する', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('条件付きクラスを処理する', () => {
      expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
    })

    it('Tailwindの競合を解消する', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })

    it('空の入力で空文字を返す', () => {
      expect(cn()).toBe('')
    })
  })

  // ===== calculateOwnedPlotsInfo =====
  describe('calculateOwnedPlotsInfo', () => {
    it('undefinedの場合はデフォルト値を返す', () => {
      const result = calculateOwnedPlotsInfo(undefined)
      expect(result).toEqual({
        totalAreaSqm: 0,
        plotCount: 0,
        plotNumbers: [],
        displayText: '-',
      })
    })

    it('空配列の場合はデフォルト値を返す', () => {
      const result = calculateOwnedPlotsInfo([])
      expect(result).toEqual({
        totalAreaSqm: 0,
        plotCount: 0,
        plotNumbers: [],
        displayText: '-',
      })
    })

    it('1区画の場合を正しく集計する', () => {
      const plots: OwnedPlot[] = [
        { id: '1', plotNumber: 'A-001', sizeType: 'full', areaSqm: 3.6, status: 'in_use' },
      ]
      const result = calculateOwnedPlotsInfo(plots)
      expect(result.totalAreaSqm).toBe(3.6)
      expect(result.plotCount).toBe(1)
      expect(result.plotNumbers).toEqual(['A-001'])
      expect(result.displayText).toBe('3.6㎡（A-001）')
    })

    it('複数区画の場合を正しく集計する', () => {
      const plots: OwnedPlot[] = [
        { id: '1', plotNumber: 'C-29', sizeType: 'full', areaSqm: 3.6, status: 'in_use' },
        { id: '2', plotNumber: 'C-30', sizeType: 'half', areaSqm: 1.8, status: 'in_use' },
      ]
      const result = calculateOwnedPlotsInfo(plots)
      expect(result.totalAreaSqm).toBeCloseTo(5.4)
      expect(result.plotCount).toBe(2)
      expect(result.plotNumbers).toEqual(['C-29', 'C-30'])
      expect(result.displayText).toContain('C-29／C-30')
    })
  })

  // ===== getPlotArea =====
  describe('getPlotArea', () => {
    it('fullの場合3.6を返す', () => {
      expect(getPlotArea('full')).toBe(3.6)
    })

    it('halfの場合1.8を返す', () => {
      expect(getPlotArea('half')).toBe(1.8)
    })
  })

  // ===== calculateEffectiveCapacity =====
  describe('calculateEffectiveCapacity', () => {
    it('上書きがない場合は基本値を返す', () => {
      expect(calculateEffectiveCapacity(6)).toBe(6)
    })

    it('上書きがある場合はその値を返す', () => {
      expect(calculateEffectiveCapacity(6, 10)).toBe(10)
    })

    it('上書きが0の場合は0を返す', () => {
      expect(calculateEffectiveCapacity(6, 0)).toBe(0)
    })
  })

  // ===== calculateSuggestedPrice =====
  describe('calculateSuggestedPrice', () => {
    it('grave_siteの場合15万円/㎡で計算する', () => {
      expect(calculateSuggestedPrice(3.6, 'grave_site')).toBe(540000)
    })

    it('columbariumの場合20万円/㎡で計算する', () => {
      expect(calculateSuggestedPrice(2.0, 'columbarium')).toBe(400000)
    })

    it('ossuaryの場合10万円/㎡で計算する', () => {
      expect(calculateSuggestedPrice(1.0, 'ossuary')).toBe(100000)
    })

    it('otherの場合10万円/㎡で計算する', () => {
      expect(calculateSuggestedPrice(5.0, 'other')).toBe(500000)
    })

    it('面積がundefinedの場合undefinedを返す', () => {
      expect(calculateSuggestedPrice(undefined, 'grave_site')).toBeUndefined()
    })

    it('面積が0の場合undefinedを返す', () => {
      expect(calculateSuggestedPrice(0, 'grave_site')).toBeUndefined()
    })
  })

  // ===== validatePlotAssignment =====
  describe('validatePlotAssignment', () => {
    it('plotNumberがある場合はバリデーション成功', () => {
      const result = validatePlotAssignment({ plotNumber: 'A-001' })
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('draftUnitがある場合はバリデーション成功', () => {
      const result = validatePlotAssignment({
        draftUnit: { section: 'A', type: 'grave_site', baseCapacity: 6, allowGoushi: true },
      })
      expect(result.isValid).toBe(true)
    })

    it('plotNumberもdraftUnitもない場合はエラー', () => {
      const result = validatePlotAssignment({})
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('既存区画の選択または新規区画の情報が必要です')
    })

    it('収容人数が0以下の場合はエラー', () => {
      const result = validatePlotAssignment({ plotNumber: 'A-001', effectiveCapacity: 0 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('収容人数は1人以上である必要があります')
    })

    it('収容人数が50超の場合はエラー', () => {
      const result = validatePlotAssignment({ plotNumber: 'A-001', effectiveCapacity: 51 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('収容人数は50人以下である必要があります')
    })

    it('合祀不可で収容人数2以上の場合は警告', () => {
      const result = validatePlotAssignment({
        plotNumber: 'A-001',
        allowGoushi: false,
        effectiveCapacity: 2,
      })
      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('価格が負の場合はエラー', () => {
      const result = validatePlotAssignment({ plotNumber: 'A-001', price: -1 })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('価格は0以上である必要があります')
    })

    it('draftUnitの面積が0以下の場合はエラー', () => {
      const result = validatePlotAssignment({
        draftUnit: { section: 'A', type: 'grave_site', areaSqm: 0, baseCapacity: 6, allowGoushi: true },
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('面積は正の数値である必要があります')
    })

    it('draftUnitの面積が100超の場合は警告', () => {
      const result = validatePlotAssignment({
        draftUnit: { section: 'A', type: 'grave_site', areaSqm: 101, baseCapacity: 6, allowGoushi: true },
      })
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('面積が100㎡を超えています。正しい値かご確認ください。')
    })

    it('使用中の区画への割当は警告', () => {
      const existingUnits = [
        {
          id: '1', plotNumber: 'A-001', section: 'A', type: 'grave_site' as const,
          baseCapacity: 6, allowGoushi: true, currentStatus: 'in_use' as const,
          createdAt: new Date(), updatedAt: new Date(),
        },
      ]
      const result = validatePlotAssignment({ plotNumber: 'A-001' }, existingUnits)
      expect(result.isValid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('既に使用中')
    })

    it('予約済みの区画への割当は警告', () => {
      const existingUnits = [
        {
          id: '1', plotNumber: 'A-001', section: 'A', type: 'grave_site' as const,
          baseCapacity: 6, allowGoushi: true, currentStatus: 'reserved' as const,
          createdAt: new Date(), updatedAt: new Date(),
        },
      ]
      const result = validatePlotAssignment({ plotNumber: 'A-001' }, existingUnits)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('予約済み')
    })
  })

  // ===== validatePlotAssignments =====
  describe('validatePlotAssignments', () => {
    it('重複区画番号がある場合はエラー', () => {
      const result = validatePlotAssignments([
        { plotNumber: 'A-001' },
        { plotNumber: 'A-001' },
      ])
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('同一の区画が複数回選択'))).toBe(true)
    })

    it('重複がない場合は成功', () => {
      const result = validatePlotAssignments([
        { plotNumber: 'A-001' },
        { plotNumber: 'A-002' },
      ])
      expect(result.isValid).toBe(true)
    })

    it('空配列の場合は成功', () => {
      const result = validatePlotAssignments([])
      expect(result.isValid).toBe(true)
    })

    it('個別バリデーションエラーも含む', () => {
      const result = validatePlotAssignments([
        {}, // plotNumber も draftUnit もない
      ])
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('区画1:'))).toBe(true)
    })
  })

  // ===== formatPlotNumber =====
  describe('formatPlotNumber', () => {
    it('区域と番号を結合する', () => {
      expect(formatPlotNumber('東区', 'A-56')).toBe('東区-A-56')
    })
  })
})