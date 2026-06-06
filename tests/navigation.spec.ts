/**
 * サイドバーナビゲーション E2Eテスト
 * メニュー遷移・アクティブ状態・ユーザー情報表示
 *
 * 注意: ログアウトテストは auth.spec.ts に移動済み（セッション破棄防止）
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('サイドバーナビゲーション', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('3-1: メインメニューから各画面への遷移', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    // サイドバーの実際のメニュー項目が描画されるまで待機
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    // 台帳問い合わせ（デフォルト表示）
    await sidebar.getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(500);

    // 合祀管理
    await sidebar.getByText('合祀管理', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('合祀').first()).toBeVisible();

    // 区画残数管理
    await sidebar.getByText('区画残数管理', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/区画残数|在庫/).first()).toBeVisible();

    // 書類管理
    await sidebar.getByText('書類管理', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/書類/).first()).toBeVisible();

    // スタッフ管理
    await sidebar.getByText('スタッフ管理', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/スタッフ/).first()).toBeVisible();

    // マスタ管理
    await sidebar.getByText('マスタ管理', { exact: true }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/マスタ/).first()).toBeVisible();
  });

  test('3-2: サイドバーのタイトルが「小嶺霊園CRM」と表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.w-64 h2').filter({ hasText: '小嶺霊園CRM' })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('3-3: ユーザー情報がUserMenuドロップダウンに表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.w-64').getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    // UserMenuボタンをクリック
    const userMenuButton = page.getByRole('button', { name: 'ユーザーメニュー' });
    await expect(userMenuButton).toBeVisible();
    await userMenuButton.click();

    // ドロップダウン内にロールラベルが表示される
    await expect(page.getByText('管理者', { exact: true })).toBeVisible();
  });

  test('3-5: メニュー項目クリック時にアクティブ状態が反映される', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    // 合祀管理をクリック（Link要素）。exact 指定で「業務の流れ」ステッパー側のリンクと区別する
    const menuLink = sidebar.getByRole('link', { name: '合祀管理', exact: true });
    await menuLink.click();
    await page.waitForTimeout(500);

    // アクティブ状態のスタイルが適用されているか（bg-matsu-50 クラス）
    await expect(menuLink).toHaveClass(/matsu/);
  });
});
