import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CustomerForm from '@/components/customer-form'

// fetch のモック（useMastersがAPIを呼び出すため）
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] }),
  })
) as jest.Mock

describe('CustomerForm', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('新規登録モード', () => {
    it('正しくレンダリングされる', async () => {
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // タブが表示される
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /基本情報1/ })).toBeInTheDocument()
      })
      expect(screen.getByRole('tab', { name: /基本情報2/ })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /連絡先/ })).toBeInTheDocument()
      // 登録ボタンが表示される
      expect(screen.getByRole('button', { name: /登録/ })).toBeInTheDocument()
    })

    it('必須フィールドが空の場合バリデーションエラーが表示される', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // 登録ボタンをクリック
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登録/ })).toBeInTheDocument()
      })
      const submitButton = screen.getByRole('button', { name: /登録/ })
      await user.click(submitButton)

      // バリデーションエラーのため、onSaveは呼ばれない
      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled()
      })
    })
  })

  describe('編集モード', () => {
    const customer = {
      id: 'test-1',
      customerCode: 'A-001',
      name: '田中太郎',
      nameKana: 'たなかたろう',
      phoneNumber: '090-1234-5678',
      address: '東京都新宿区1-1-1',
      gender: 'male' as const,
      birthDate: null,
      reservationDate: null,
      permitDate: null,
      startDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active' as const,
    }

    it('既存の顧客データが正しく表示される', async () => {
      render(
        <CustomerForm
          customer={customer}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // タブが表示される
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /基本情報1/ })).toBeInTheDocument()
      })

      // 更新ボタンが表示される（編集モード）
      expect(screen.getByRole('button', { name: /更新/ })).toBeInTheDocument()

      // 顧客データが入力フィールドに表示される（複数フィールドに同じ値が入る場合がある）
      const nameInputs = screen.getAllByDisplayValue(customer.name)
      expect(nameInputs.length).toBeGreaterThan(0)
      const nameKanaInputs = screen.getAllByDisplayValue(customer.nameKana)
      expect(nameKanaInputs.length).toBeGreaterThan(0)
    })
  })

  describe('ローディング状態', () => {
    it('ローディング中はボタンが無効化される', async () => {
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /保存中/ })).toBeDisabled()
      })
    })
  })

  describe('タブナビゲーション', () => {
    it('タブをクリックするとコンテンツが切り替わる', async () => {
      const user = userEvent.setup()
      render(
        <CustomerForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // 最初は基本情報1タブがアクティブ
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /基本情報1/ })).toBeInTheDocument()
      })

      // 基本情報2タブをクリック
      const tab2 = screen.getByRole('tab', { name: /基本情報2/ })
      await user.click(tab2)

      // タブがアクティブになる
      expect(tab2).toHaveAttribute('data-state', 'active')
    })
  })
})
