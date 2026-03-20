/**
 * サイドバーナビゲーション E2Eテスト
 * メニュー遷移・コンテキスト切り替え・ユーザー情報表示
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

  test('3-2: サイドバーのタイトルが「小峰霊園CRM」と表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.w-64 h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('3-3: ユーザー情報がサイドバー下部に表示される', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    // ユーザー情報セクション
    const userInfo = sidebar.locator('.border-t');
    await expect(userInfo).toBeVisible();

    // ユーザー名またはロールラベルが表示される
    await expect(sidebar.getByText('管理者', { exact: true }).first()).toBeVisible();
  });

  test('3-5: メニュー項目クリック時にアクティブ状態が反映される', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    // 合祀管理をクリック
    const menuButton = sidebar.getByText('合祀管理', { exact: true });
    await menuButton.click();
    await page.waitForTimeout(500);

    // アクティブ状態のスタイルが適用されているか（bg-matsu-50 クラス）
    await expect(menuButton).toHaveClass(/matsu/);
  });
});
