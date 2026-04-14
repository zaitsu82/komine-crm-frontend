/**
 * 区画詳細・登録・編集 E2Eテスト
 * 詳細表示・ツールバー・パンくず・削除
 *
 * リファクタ後: サイドバーは常にグローバルナビ。
 * 区画固有アクション（書類作成/書類履歴/削除）はページ内ツールバーに配置。
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('区画詳細表示', () => {
  test.use({ storageState: storageStatePath('admin') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });
  });

  test('5-1: 区画詳細の情報が表示される', async ({ page }) => {
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(2_000);

        // URLが /plots/[id] に遷移
        await expect(page).toHaveURL(/\/plots\//, { timeout: 10_000 });

        // パンくずの「台帳」リンクが表示される
        await expect(page.getByRole('link', { name: '台帳' })).toBeVisible({ timeout: 10_000 });

        // 編集ボタンがページ内に表示される
        await expect(page.getByRole('button', { name: '編集' })).toBeVisible();
      }
    }
  });

  test('5-2: 区画詳細のツールバーに書類作成・書類履歴リンクが表示', async ({ page }) => {
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(2_000);

        // ページ内のツールバーに書類作成・書類履歴リンクが表示
        await expect(page.getByRole('link', { name: /書類作成/ })).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('link', { name: /書類履歴/ })).toBeVisible();
      }
    }
  });

  test('5-3: admin は区画詳細で「区画情報を削除」がドロップダウンに表示される', async ({ page }) => {
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(2_000);

        // "..." ドロップダウンを開く
        const moreButton = page.getByRole('button', { name: 'その他の操作' });
        await expect(moreButton).toBeVisible({ timeout: 10_000 });
        await moreButton.click();

        // ドロップダウン内に「区画情報を削除」が表示される
        await expect(page.getByText('区画情報を削除')).toBeVisible();
      }
    }
  });
});

test.describe('区画詳細 - viewer ロール', () => {
  test.use({ storageState: storageStatePath('viewer') });

  test('5-4: viewer は区画詳細で削除ボタンが非表示', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    await sidebar.getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(2_000);

        // "..." ドロップダウンボタン自体が表示されない（admin限定）
        await expect(page.getByRole('button', { name: 'その他の操作' })).not.toBeVisible();
      }
    }
  });
});

test.describe('区画詳細ナビゲーション', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('5-5: 区画詳細画面でもグローバルナビが維持される', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });

    // メインメニューが表示されている
    await expect(sidebar.getByText('合祀管理', { exact: true })).toBeVisible();

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
        await page.waitForTimeout(2_000);

        // 区画詳細でもグローバルナビが維持される（サイドバーが切り替わらない）
        await expect(sidebar.getByText('合祀管理', { exact: true })).toBeVisible({ timeout: 10_000 });
        await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible();
        await expect(sidebar.getByText('スタッフ管理', { exact: true })).toBeVisible();

        // パンくずから台帳に戻れる
        await page.getByRole('link', { name: '台帳' }).click();
        await page.waitForTimeout(1_000);

        // 一覧画面に戻る
        await expect(page).toHaveURL('/plots', { timeout: 10_000 });
      }
    }
  });
});
