import { customerFormSchema } from '@/lib/validations'

describe('validations.ts - フォームバリデーション', () => {
  describe('顧客フォームスキーマ', () => {
    describe('必須フィールド', () => {
      it('全ての必須フィールドが空の場合エラーが返される', () => {
        const result = customerFormSchema.safeParse({})
        
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toHaveLength(8) // 必須フィールド数
          expect(result.error.issues.some(issue => issue.path[0] === 'customerCode')).toBe(true)
          expect(result.error.issues.some(issue => issue.path[0] === 'name')).toBe(true)
          expect(result.error.issues.some(issue => issue.path[0] === 'nameKana')).toBe(true)
        }
      })

      it('必須フィールドがすべて入力されている場合は成功', () => {
        const validData = {
          customerCode: 'A-001',
          name: 'テスト 太郎',
          nameKana: 'てすと たろう',
          gender: 'male' as const,
          postalCode: '100-0001',
          prefecture: '東京都',
          city: '千代田区',
          address: '千代田1-1-1',
          phoneNumber: '03-1234-5678'
        }

        const result = customerFormSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })
    })

    describe('メールアドレスバリデーション', () => {
      const baseData = {
        customerCode: 'A-001',
        name: 'テスト 太郎',
        nameKana: 'てすと たろう',
        gender: 'male' as const,
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneNumber: '03-1234-5678'
      }

      it('有効なメールアドレスは受け入れられる', () => {
        const validEmails = [
          'test@example.com',
          'user.name+tag@domain.co.jp',
          'test123@gmail.com'
        ]

        validEmails.forEach(email => {
          const result = customerFormSchema.safeParse({
            ...baseData,
            email
          })
          expect(result.success).toBe(true)
        })
      })

      it('無効なメールアドレスはエラーになる', () => {
        const invalidEmails = [
          'invalid-email',
          'test@',
          '@domain.com',
          'test..test@domain.com'
        ]

        invalidEmails.forEach(email => {
          const result = customerFormSchema.safeParse({
            ...baseData,
            email
          })
          expect(result.success).toBe(false)
          if (!result.success) {
            expect(result.error.issues.some(issue => 
              issue.path[0] === 'email' && 
              issue.message === '正しいメールアドレスを入力してください'
            )).toBe(true)
          }
        })
      })

      it('空文字列のメールアドレスは許可される', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          email: ''
        })
        expect(result.success).toBe(true)
      })
    })

    describe('性別バリデーション', () => {
      const baseData = {
        customerCode: 'A-001',
        name: 'テスト 太郎',
        nameKana: 'てすと たろう',
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneNumber: '03-1234-5678'
      }

      it('male は有効な性別', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          gender: 'male'
        })
        expect(result.success).toBe(true)
      })

      it('female は有効な性別', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          gender: 'female'
        })
        expect(result.success).toBe(true)
      })

      it('無効な性別はエラーになる', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          gender: 'other'
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path[0] === 'gender' && 
            issue.message === '性別を選択してください'
          )).toBe(true)
        }
      })
    })

    describe('オプションフィールド', () => {
      const baseData = {
        customerCode: 'A-001',
        name: 'テスト 太郎',
        nameKana: 'てすと たろう',
        gender: 'male' as const,
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneNumber: '03-1234-5678'
      }

      it('生年月日は省略可能', () => {
        const result = customerFormSchema.safeParse(baseData)
        expect(result.success).toBe(true)
      })

      it('FAX番号は省略可能', () => {
        const result = customerFormSchema.safeParse(baseData)
        expect(result.success).toBe(true)
      })

      it('緊急連絡先は省略可能', () => {
        const result = customerFormSchema.safeParse(baseData)
        expect(result.success).toBe(true)
      })

      it('墓地区画情報は省略可能', () => {
        const result = customerFormSchema.safeParse(baseData)
        expect(result.success).toBe(true)
      })
    })

    describe('緊急連絡先バリデーション', () => {
      const baseData = {
        customerCode: 'A-001',
        name: 'テスト 太郎',
        nameKana: 'てすと たろう',
        gender: 'male' as const,
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneNumber: '03-1234-5678'
      }

      it('完全な緊急連絡先情報は有効', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          emergencyContact: {
            name: '緊急 太郎',
            relationship: '息子',
            phoneNumber: '090-1234-5678'
          }
        })
        expect(result.success).toBe(true)
      })

      it('緊急連絡先の一部が欠けている場合はエラー', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          emergencyContact: {
            name: '緊急 太郎',
            relationship: '',
            phoneNumber: '090-1234-5678'
          }
        })
        expect(result.success).toBe(false)
      })
    })

    describe('墓地区画情報バリデーション', () => {
      const baseData = {
        customerCode: 'A-001',
        name: 'テスト 太郎',
        nameKana: 'てすと たろう',
        gender: 'male' as const,
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneNumber: '03-1234-5678'
      }

      it('完全な墓地区画情報は有効', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          plotInfo: {
            plotNumber: 'A-001',
            section: '東区',
            usage: 'in_use' as const,
            size: '10㎡',
            price: 200000,
            contractDate: '2023-01-01'
          }
        })
        expect(result.success).toBe(true)
      })

      it('利用状況の有効な値', () => {
        const validUsages: Array<'in_use' | 'available' | 'reserved'> = ['in_use', 'available', 'reserved']
        
        validUsages.forEach(usage => {
          const result = customerFormSchema.safeParse({
            ...baseData,
            plotInfo: {
              plotNumber: 'A-001',
              section: '東区',
              usage,
              size: '10㎡',
              price: 200000
            }
          })
          expect(result.success).toBe(true)
        })
      })

      it('金額が負の値の場合はエラー', () => {
        const result = customerFormSchema.safeParse({
          ...baseData,
          plotInfo: {
            plotNumber: 'A-001',
            section: '東区',
            usage: 'in_use' as const,
            size: '10㎡',
            price: -1000
          }
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.message === '金額は0以上である必要があります'
          )).toBe(true)
        }
      })
    })

    describe('エラーメッセージの日本語化', () => {
      it('必須フィールドのエラーメッセージが日本語', () => {
        const result = customerFormSchema.safeParse({})
        
        expect(result.success).toBe(false)
        if (!result.success) {
          const customerCodeError = result.error.issues.find(issue => issue.path[0] === 'customerCode')
          expect(customerCodeError?.message).toBe('墓石コードは必須です')

          const nameError = result.error.issues.find(issue => issue.path[0] === 'name')
          expect(nameError?.message).toBe('氏名は必須です')

          const nameKanaError = result.error.issues.find(issue => issue.path[0] === 'nameKana')
          expect(nameKanaError?.message).toBe('フリガナは必須です')
        }
      })
    })
  })
})