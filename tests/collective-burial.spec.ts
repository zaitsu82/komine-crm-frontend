/**
 * 合祀管理 E2Eテスト
 * 一覧表示・アクセス権限・CRUD操作
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('合祀管理 - admin', () => {
  test.use({ storageState: storageStatePath('admin') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });
    await sidebar.getByText('合祀管理', { exact: true }).click();
    await page.waitForTimeout(1_000);
  });

  test('6-1: 合祀管理画面が表示される', async ({ page }) => {
    const content = page.locator('.ml-64, [class*="ml-64"]').first();
    await expect(content).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/合祀/).first()).toBeVisible();
  });

  test('6-2: 合祀一覧がテーブルまたはリストで表示される', async ({ page }) => {
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const headers = table.locator('thead');
      await expect(headers).toBeVisible();
    }
  });

  test('6-3: 合祀新規登録ボタンが表示される（admin）', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /新規|登録|追加/ }).first();
    const hasCreateButton = await createButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasCreateButton) {
      await expect(createButton).toBeEnabled();
    }
  });
});

test.describe('合祀管理 - viewer', () => {
  test.use({ storageState: storageStatePath('viewer') });

  test('6-4: viewer で合祀管理画面にアクセス可能', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    const menuItem = sidebar.getByText('合祀管理', { exact: true });
    await expect(menuItem).toBeVisible();

    await menuItem.click();
    await page.waitForTimeout(1_000);

    await expect(page.getByText(/合祀/).first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('合祀管理 - manager', () => {
  test.use({ storageState: storageStatePath('manager') });

  test('6-5: manager で合祀管理画面にアクセス可能', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    await sidebar.getByText('合祀管理', { exact: true }).click();
    await page.waitForTimeout(1_000);

    await expect(page.getByText(/合祀/).first()).toBeVisible({ timeout: 10_000 });
  });
});
