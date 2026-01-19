import { test, expect } from '@playwright/test';

test.describe('顧客台帳一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページが正常に読み込まれることを確認', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle(/霊園顧客管理システム|顧客管理/);

    // メイン見出しの確認
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();
  });

  test('タブ切り替えが正常に動作することを確認', async ({ page }) => {
    // デフォルトで台帳タブが選択されている
    await expect(page.getByRole('tab', { name: '台帳' })).toHaveAttribute('data-state', 'active');

    // 検索タブをクリック
    await page.getByRole('tab', { name: '検索' }).click();
    await expect(page.getByRole('tab', { name: '検索' })).toHaveAttribute('data-state', 'active');
    await expect(page.getByRole('tab', { name: '台帳' })).toHaveAttribute('data-state', 'inactive');

    // 台帳タブに戻る
    await page.getByRole('tab', { name: '台帳' }).click();
    await expect(page.getByRole('tab', { name: '台帳' })).toHaveAttribute('data-state', 'active');
  });

  test('新規登録ボタンが表示され、クリック可能であることを確認', async ({ page }) => {
    // 新規登録ボタンの確認
    const newCustomerButton = page.getByRole('button', { name: '新規顧客登録' });
    await expect(newCustomerButton).toBeVisible();
    await expect(newCustomerButton).toBeEnabled();
  });

  test('顧客テーブルが表示されることを確認', async ({ page }) => {
    // テーブルヘッダーの確認
    await expect(page.getByText('顧客ID')).toBeVisible();
    await expect(page.getByText('氏名')).toBeVisible();
    await expect(page.getByText('連絡先')).toBeVisible();
    await expect(page.getByText('墓所番号')).toBeVisible();
    await expect(page.getByText('操作')).toBeVisible();
  });

  test('ページネーションが表示されることを確認', async ({ page }) => {
    // ページネーション要素の確認
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test('ページサイズ変更が正常に動作することを確認', async ({ page }) => {
    // ページサイズセレクターの確認
    const pageSizeSelector = page.locator('select').filter({ hasText: '件表示' });
    await expect(pageSizeSelector).toBeVisible();

    // ページサイズを変更
    await pageSizeSelector.selectOption('20');
    // 変更が適用されることを確認（実際のデータがあれば表示件数の変化も確認）
  });

  test('顧客行をクリックすると詳細表示に遷移することを確認', async ({ page }) => {
    // テーブル内の最初の顧客行を探す
    const firstCustomerRow = page.locator('tbody tr').first();

    // 顧客データが存在する場合のテスト
    const rowCount = await page.locator('tbody tr').count();
    if (rowCount > 0) {
      await firstCustomerRow.click();
      // 詳細画面に遷移したことを確認
      await expect(page.getByText('顧客詳細')).toBeVisible();
    }
  });

  test('メニューアイテムが正しく表示されることを確認', async ({ page }) => {
    const expectedMenuItems = [
      '台帳問合せ',
      '契約訂正',
      '予約入力',
      '契約前入力',
      '名義変更',
      '住所変更',
      '埋葬情報更新',
      '個人票印刷',
      '許可証印刷',
      '封筒印刷',
      '墓所移動',
      '解約入力'
    ];

    for (const menuItem of expectedMenuItems) {
      await expect(page.getByText(menuItem)).toBeVisible();
    }
  });

  test('レスポンシブデザインが正常に動作することを確認', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();

    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();
  });
});
