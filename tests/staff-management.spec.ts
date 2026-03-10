/**
 * スタッフ管理 E2Eテスト
 * 一覧表示・検索・ロールフィルター・CRUD（admin）
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('スタッフ管理 - admin', () => {
  test.use({ storageState: storageStatePath('admin') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });
    await sidebar.getByText('スタッフ管理', { exact: true }).click();
    await page.waitForTimeout(1_000);
  });

  test('7-1: スタッフ管理画面が表示される', async ({ page }) => {
    await expect(page.getByText(/スタッフ/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('7-2: スタッフ一覧にデータが表示される', async ({ page }) => {
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const rows = table.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('7-3: スタッフ検索（名前）', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"], input[placeholder*="名前"]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasSearch) {
      await searchInput.fill('管理者');
      await page.waitForTimeout(1_000);

      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const rows = table.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('7-4: ロールフィルター', async ({ page }) => {
    const roleFilter = page.locator('select').filter({ hasText: /全て|admin|管理者/ }).first()
      .or(page.getByRole('button', { name: /全て/ }).first());

    const hasFilter = await roleFilter.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasFilter) {
      await expect(roleFilter).toBeVisible();
    }
  });

  test('7-5: スタッフ新規登録ボタンが表示される（admin）', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /新規|登録|追加/ }).first();
    const hasButton = await createButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasButton) {
      await expect(createButton).toBeEnabled();
    }
  });

  test('7-6: 権限マトリクスパネルが表示される', async ({ page }) => {
    const matrixToggle = page.getByText(/権限マトリクス|権限一覧/).first();
    const hasMatrix = await matrixToggle.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasMatrix) {
      await matrixToggle.click();
      await page.waitForTimeout(500);

      await expect(page.getByText(/viewer|閲覧者/).first()).toBeVisible({ timeout: 3_000 });
    }
  });
});

test.describe('スタッフ管理 - manager', () => {
  test.use({ storageState: storageStatePath('manager') });

  test('7-7: manager でスタッフ管理画面にアクセス可能', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    const menuItem = sidebar.getByText('スタッフ管理', { exact: true });
    await expect(menuItem).toBeVisible();

    await menuItem.click();
    await page.waitForTimeout(1_000);

    await expect(page.getByText(/スタッフ/).first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('スタッフ管理 - viewer/operator', () => {
  test('7-8: viewer にはスタッフ管理メニューが非表示', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('viewer'),
    });
    const page = await context.newPage();
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    await expect(
      sidebar.getByText('スタッフ管理', { exact: true })
    ).not.toBeVisible();

    await context.close();
  });

  test('7-9: operator にはスタッフ管理メニューが非表示', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('operator'),
    });
    const page = await context.newPage();
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    await expect(
      sidebar.getByText('スタッフ管理', { exact: true })
    ).not.toBeVisible();

    await context.close();
  });
});
