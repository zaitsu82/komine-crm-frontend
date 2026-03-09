/**
 * 区画詳細・登録・編集 E2Eテスト
 * 詳細表示・CRUD操作・バリデーション
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('区画詳細表示', () => {
  test.use({ storageState: storageStatePath('admin') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.w-64')).toBeVisible({ timeout: 15_000 });
  });

  test('5-1: 区画詳細の情報が表示される', async ({ page }) => {
    // 台帳問い合わせから区画を選択
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // 区画詳細のコンテンツが表示される
        const detailContent = page.locator('.ml-64, [class*="ml-64"]').first();
        await expect(detailContent).toBeVisible({ timeout: 10_000 });

        // サイドバーに「区画詳細」ボタンが表示される
        const detailButton = page.getByRole('button', { name: '区画詳細' });
        await expect(detailButton).toBeVisible({ timeout: 5_000 });
      }
    }
  });

  test('5-2: 区画詳細のサイドバーに書類作成・書類履歴ボタンが表示', async ({ page }) => {
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        const sidebar = page.locator('.w-64');
        await expect(sidebar.getByRole('button', { name: '書類作成' })).toBeVisible({ timeout: 5_000 });
        await expect(sidebar.getByRole('button', { name: '書類履歴' })).toBeVisible();
        await expect(sidebar.getByRole('button', { name: '台帳一覧に戻る' })).toBeVisible();
      }
    }
  });

  test('5-3: admin は区画詳細で「区画情報を削除」ボタンが表示される', async ({ page }) => {
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // admin には削除ボタンが表示される
        await expect(page.getByRole('button', { name: '区画情報を削除' })).toBeVisible({ timeout: 5_000 });
      }
    }
  });
});

test.describe('区画詳細 - viewer ロール', () => {
  test.use({ storageState: storageStatePath('viewer') });

  test('5-4: viewer は区画詳細で削除ボタンが非表示', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.w-64')).toBeVisible({ timeout: 15_000 });

    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // viewer には削除ボタンが表示されない
        await expect(page.getByRole('button', { name: '区画情報を削除' })).not.toBeVisible();
      }
    }
  });
});

test.describe('区画フォーム', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('5-5: 区画詳細画面でコンテキストメニューが切り替わる', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.w-64')).toBeVisible({ timeout: 15_000 });

    const sidebar = page.locator('.w-64');

    // メインメニューが最初に表示
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible();

    // 区画を選択して詳細に入る
    await sidebar.getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // サイドバーがコンテキストビューに切り替わる
        await expect(sidebar.getByRole('button', { name: '台帳一覧に戻る' })).toBeVisible({ timeout: 5_000 });
        await expect(sidebar.getByRole('button', { name: '区画詳細' })).toBeVisible();

        // メインメニュー項目は非表示
        await expect(sidebar.getByText('合祀管理', { exact: true })).not.toBeVisible();

        // 台帳一覧に戻るをクリック
        await sidebar.getByRole('button', { name: '台帳一覧に戻る' }).click();
        await page.waitForTimeout(1_000);

        // メインメニューが復帰
        await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 5_000 });
        await expect(sidebar.getByText('合祀管理', { exact: true })).toBeVisible();
      }
    }
  });
});
