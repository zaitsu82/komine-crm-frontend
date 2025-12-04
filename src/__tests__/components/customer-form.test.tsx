import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomerForm from '@/components/customer-form'
import { mockCustomers } from '@/lib/data'

describe('CustomerForm', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('新規登録モード', () => {
    it('正しくレンダリングされる', () => {
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('新規顧客登録')).toBeInTheDocument()
      expect(screen.getByText('新しい顧客の情報を入力してください')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /登録/ })).toBeInTheDocument()
    })

    it('必須フィールドが空の場合エラーが表示される', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const submitButton = screen.getByRole('button', { name: /登録/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('顧客コードは必須です')).toBeInTheDocument()
        expect(screen.getByText('氏名は必須です')).toBeInTheDocument()
        expect(screen.getByText('フリガナは必須です')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('有効なデータでフォームが送信できる', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // 必須フィールドを入力
      await user.type(screen.getByLabelText(/顧客コード/), 'T-123')
      await user.type(screen.getByLabelText(/氏名/), 'テスト 太郎')
      await user.type(screen.getByLabelText(/フリガナ/), 'てすと たろう')
      await user.type(screen.getByLabelText(/郵便番号/), '100-0001')
      await user.type(screen.getByLabelText(/都道府県/), '東京都')
      await user.type(screen.getByLabelText(/市区町村/), '千代田区')
      await user.type(screen.getByLabelText(/住所詳細/), '千代田1-1-1')
      await user.type(screen.getByLabelText(/電話番号/), '03-1234-5678')

      const submitButton = screen.getByRole('button', { name: /登録/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            customerCode: 'T-123',
            name: 'テスト 太郎',
            nameKana: 'てすと たろう',
            postalCode: '100-0001',
            prefecture: '東京都',
            city: '千代田区',
            address: '千代田1-1-1',
            phoneNumber: '03-1234-5678'
          })
        )
      })
    })

    it('メールアドレスの形式チェックが動作する', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const emailInput = screen.getByLabelText(/メールアドレス/)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /登録/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('正しいメールアドレスを入力してください')).toBeInTheDocument()
      })
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('編集モード', () => {
    const customer = mockCustomers[0]

    it('既存の顧客データが正しく表示される', () => {
      render(
        <CustomerForm
          customer={customer}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('顧客情報編集')).toBeInTheDocument()
      expect(screen.getByDisplayValue(customer.name)).toBeInTheDocument()
      expect(screen.getByDisplayValue(customer.nameKana)).toBeInTheDocument()
      expect(screen.getByDisplayValue(customer.customerCode)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /更新/ })).toBeInTheDocument()
    })

    it('緊急連絡先が正しく表示される', () => {
      render(
        <CustomerForm
          customer={customer}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      if (customer.emergencyContact) {
        expect(screen.getByDisplayValue(customer.emergencyContact.name)).toBeInTheDocument()
        expect(screen.getByDisplayValue(customer.emergencyContact.relationship)).toBeInTheDocument()
        expect(screen.getByDisplayValue(customer.emergencyContact.phoneNumber)).toBeInTheDocument()
      }
    })
  })

  describe('アクセシビリティ', () => {
    it('全ての入力フィールドに適切なラベルが設定されている', () => {
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const requiredFields = ['顧客コード', '氏名', 'フリガナ', '郵便番号', '都道府県', '市区町村', '住所詳細', '電話番号']
      
      requiredFields.forEach(label => {
        expect(screen.getByLabelText(new RegExp(label))).toBeInTheDocument()
      })
    })

    it('フォーカス順序が正しい', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // 最初の入力フィールドにフォーカス
      await user.tab()
      expect(screen.getByLabelText(/顧客コード/)).toHaveFocus()
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中はボタンが無効化される', () => {
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      )

      expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeDisabled()
    })
  })

  describe('キャンセル機能', () => {
    it('キャンセルボタンクリックで正しいコールバックが呼ばれる', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /キャンセル/ })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})