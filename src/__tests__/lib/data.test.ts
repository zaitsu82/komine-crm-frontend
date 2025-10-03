import {
  mockCustomers,
  searchCustomers,
  getCustomerById,
  getCustomerByCode,
  getCustomersByUsage,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStatus,
  filterByAiueo,
  sortByKana,
  formDataToCustomer,
} from '@/lib/data'
import { Customer } from '@/types/customer'

describe('data.ts - 顧客データ管理', () => {
  describe('検索機能', () => {
    it('名前で検索できる', () => {
      const results = searchCustomers('吉永')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('吉永 修')
    })

    it('カナで検索できる', () => {
      const results = searchCustomers('よしなが')
      expect(results).toHaveLength(1)
      expect(results[0].nameKana).toBe('よしなが おさむ')
    })

    it('顧客コードで検索できる', () => {
      const results = searchCustomers('A-56')
      expect(results).toHaveLength(1)
      expect(results[0].customerCode).toBe('A-56')
    })

    it('電話番号で検索できる', () => {
      const results = searchCustomers('093-964-3779')
      expect(results).toHaveLength(1)
      expect(results[0].phoneNumber).toBe('093-964-3779')
    })

    it('住所で検索できる', () => {
      const results = searchCustomers('守田')
      expect(results).toHaveLength(1)
      expect(results[0].address).toBe('守田4-1-3-102')
    })

    it('空の検索文字列で全件取得', () => {
      const results = searchCustomers('')
      expect(results).toHaveLength(mockCustomers.length)
    })

    it('部分一致検索が動作する', () => {
      const results = searchCustomers('田中')
      expect(results.length).toBeGreaterThan(0)
      results.forEach(customer => {
        expect(customer.name.includes('田中')).toBe(true)
      })
    })
  })

  describe('IDによる取得', () => {
    it('有効なIDで顧客を取得できる', () => {
      const customer = getCustomerById('1')
      expect(customer).toBeDefined()
      expect(customer?.id).toBe('1')
    })

    it('無効なIDではundefinedを返す', () => {
      const customer = getCustomerById('999')
      expect(customer).toBeUndefined()
    })
  })

  describe('顧客コードによる取得', () => {
    it('有効な顧客コードで取得できる', () => {
      const customer = getCustomerByCode('A-56')
      expect(customer).toBeDefined()
      expect(customer?.customerCode).toBe('A-56')
    })

    it('無効な顧客コードではundefinedを返す', () => {
      const customer = getCustomerByCode('X-999')
      expect(customer).toBeUndefined()
    })
  })

  describe('利用状況による取得', () => {
    it('利用中の顧客を取得できる', () => {
      const customers = getCustomersByUsage('in_use')
      expect(customers.length).toBeGreaterThan(0)
      customers.forEach(customer => {
        expect(customer.plotInfo?.usage).toBe('in_use')
      })
    })

    it('予約済みの顧客を取得できる', () => {
      const customers = getCustomersByUsage('reserved')
      customers.forEach(customer => {
        expect(customer.plotInfo?.usage).toBe('reserved')
      })
    })
  })

  describe('CRUD操作', () => {
    it('新しい顧客を作成できる', () => {
      const newCustomerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
        customerCode: 'TEST-001',
        name: 'テスト 太郎',
        nameKana: 'てすと たろう',
        birthDate: new Date(1980, 0, 1),
        gender: 'male',
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneNumber: '03-1234-5678',
        faxNumber: undefined,
        email: undefined,
        emergencyContact: null,
        plotInfo: null,
        status: 'active'
      }

      const originalLength = mockCustomers.length
      const createdCustomer = createCustomer(newCustomerData)

      expect(createdCustomer).toBeDefined()
      expect(createdCustomer.name).toBe('テスト 太郎')
      expect(createdCustomer.id).toBeDefined()
      expect(createdCustomer.createdAt).toBeInstanceOf(Date)
      expect(createdCustomer.updatedAt).toBeInstanceOf(Date)
      expect(mockCustomers).toHaveLength(originalLength + 1)
    })

    it('既存の顧客を更新できる', () => {
      const existingCustomer = mockCustomers[0]
      const updateData = {
        name: '更新 太郎',
        phoneNumber: '03-9999-9999'
      }

      const updatedCustomer = updateCustomer(existingCustomer.id, updateData)

      expect(updatedCustomer).toBeDefined()
      expect(updatedCustomer?.name).toBe('更新 太郎')
      expect(updatedCustomer?.phoneNumber).toBe('03-9999-9999')
      expect(updatedCustomer?.updatedAt).toBeInstanceOf(Date)
    })

    it('存在しない顧客の更新はnullを返す', () => {
      const result = updateCustomer('999', { name: 'テスト' })
      expect(result).toBeNull()
    })

    it('顧客を削除できる', () => {
      const originalLength = mockCustomers.length
      const result = deleteCustomer('1')

      expect(result).toBe(true)
      expect(mockCustomers).toHaveLength(originalLength - 1)
    })

    it('存在しない顧客の削除はfalseを返す', () => {
      const result = deleteCustomer('999')
      expect(result).toBe(false)
    })
  })

  describe('ステータス判定', () => {
    it('通常のアクティブ顧客のステータス', () => {
      const customer = mockCustomers.find(c => c.updatedAt > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      if (customer) {
        const status = getCustomerStatus(customer)
        expect(status.status).toBe('active')
        expect(status.label).toBe('契約中')
      }
    })

    it('長期未更新顧客のステータス', () => {
      const oldCustomer: Customer = {
        ...mockCustomers[0],
        updatedAt: new Date(2020, 0, 1) // 古い日付
      }
      const status = getCustomerStatus(oldCustomer)
      expect(['attention', 'overdue']).toContain(status.status)
    })

    it('非アクティブ顧客のステータス', () => {
      const inactiveCustomer: Customer = {
        ...mockCustomers[0],
        status: 'inactive'
      }
      const status = getCustomerStatus(inactiveCustomer)
      expect(status.status).toBe('attention')
    })
  })

  describe('あいう順フィルタリング', () => {
    it('あ行でフィルタできる', () => {
      const filtered = filterByAiueo(mockCustomers, 'あ')
      // あ行の顧客はいないはず
      expect(filtered).toHaveLength(0)
    })

    it('た行でフィルタできる', () => {
      const filtered = filterByAiueo(mockCustomers, 'た')
      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach(customer => {
        expect(customer.nameKana.charAt(0)).toMatch(/^[た-ど]/)
      })
    })

    it('全てを指定すると全件取得', () => {
      const filtered = filterByAiueo(mockCustomers, '全')
      expect(filtered).toHaveLength(mockCustomers.length)
    })

    it('存在しないキーを指定すると全件取得', () => {
      const filtered = filterByAiueo(mockCustomers, '存在しないキー')
      expect(filtered).toHaveLength(mockCustomers.length)
    })
  })

  describe('かな順ソート', () => {
    it('かな順で正しくソートされる', () => {
      const sorted = sortByKana(mockCustomers)
      expect(sorted).toHaveLength(mockCustomers.length)
      
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].nameKana.localeCompare(sorted[i + 1].nameKana, 'ja', { numeric: true })).toBeLessThanOrEqual(0)
      }
    })

    it('元の配列は変更されない', () => {
      const original = [...mockCustomers]
      const sorted = sortByKana(mockCustomers)
      
      expect(mockCustomers).toEqual(original)
      expect(sorted).not.toBe(mockCustomers) // 異なるインスタンス
    })
  })

  describe('フォームデータ変換', () => {
    it('フォームデータを顧客データに変換できる', () => {
      const formData = {
        customerCode: 'F-001',
        name: 'フォーム 太郎',
        nameKana: 'ふぉーむ たろう',
        birthDate: '1990-01-01',
        gender: 'male' as const,
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '新宿区',
        address: '新宿1-1-1',
        phoneNumber: '03-1111-2222',
        faxNumber: '03-1111-2223',
        email: 'test@example.com'
      }

      const customerData = formDataToCustomer(formData)

      expect(customerData.customerCode).toBe('F-001')
      expect(customerData.name).toBe('フォーム 太郎')
      expect(customerData.birthDate).toBeInstanceOf(Date)
      expect(customerData.gender).toBe('male')
      expect(customerData.status).toBe('active')
    })

    it('空のオプションフィールドは適切に処理される', () => {
      const formData = {
        customerCode: 'F-002',
        name: 'フォーム 花子',
        nameKana: 'ふぉーむ はなこ',
        gender: 'female' as const,
        postalCode: '123-4567',
        prefecture: '東京都',
        city: '新宿区',
        address: '新宿1-1-1',
        phoneNumber: '03-1111-2222',
        faxNumber: '',
        email: ''
      }

      const customerData = formDataToCustomer(formData)

      expect(customerData.faxNumber).toBeUndefined()
      expect(customerData.email).toBeUndefined()
      expect(customerData.emergencyContact).toBeNull()
      expect(customerData.plotInfo).toBeNull()
    })
  })
})