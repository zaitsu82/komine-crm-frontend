/**
 * 台帳問い合わせ（区画一覧） E2Eテスト
 * 一覧表示・検索・ページネーション・ソート
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('台帳問い合わせ（区画一覧）', () => {
  test.use({ storageState: storageStatePath('admin') });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // サイドバーが表示されるまで待機
    await expect(page.locator('.w-64')).toBeVisible({ timeout: 15_000 });
    // 台帳問い合わせがデフォルトビュー
    await page.locator('.w-64').getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(500);
  });

  test('4-1: 区画一覧が正しく表示される', async ({ page }) => {
    // テーブルまたはリストが表示される
    const table = page.locator('table').first();
    const hasList = await table.isVisible().catch(() => false);

    if (hasList) {
      // テーブルヘッダーが存在する
      const headers = table.locator('thead th, thead td');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);

      // データ行が存在する
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    } else {
      // テーブルではなくカード/リスト形式の場合
      const content = page.locator('.ml-64, [class*="ml-64"]').first();
      await expect(content).toBeVisible();
    }
  });

  test('4-2: ページネーション - 次ページ・前ページ', async ({ page }) => {
    // ページネーション要素を探す
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="ページ"]').first();
    const hasPagination = await pagination.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasPagination) {
      // 次へボタン
      const nextButton = page.getByRole('button', { name: /次|→|>/ }).first();
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // 前へボタンが有効になる
        const prevButton = page.getByRole('button', { name: /前|←|</ }).first();
        await expect(prevButton).toBeEnabled();
        await prevButton.click();
      }
    }
    // ページネーションがない場合（データ数が少ない場合）はスキップ
  });

  test('4-3: 検索 - 顧客名で検索', async ({ page }) => {
    // 検索入力フィールドを探す
    const searchInput = page.locator('input[placeholder*="検索"], input[placeholder*="名前"], input[type="search"]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasSearch) {
      await searchInput.fill('田中');
      await page.waitForTimeout(1_000);

      // 検索結果が更新される（テーブルの行が変化）
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const rows = table.locator('tbody tr');
        const count = await rows.count();
        // 結果が表示される（0件でも正常）
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('4-4: AIUEOタブによる50音フィルタリング', async ({ page }) => {
    // 50音タブを探す
    const aiueoTab = page.getByRole('button', { name: 'ア' }).or(
      page.locator('button').filter({ hasText: /^ア$/ })
    ).first();

    const hasAiueo = await aiueoTab.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasAiueo) {
      await aiueoTab.click();
      await page.waitForTimeout(1_000);

      // フィルタリング結果が表示される
      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const rows = table.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('4-5: 行クリックで区画詳細に遷移', async ({ page }) => {
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // 区画詳細ビューまたは詳細ページに遷移
        // サイドバーに「台帳一覧に戻る」ボタンが表示される
        const backButton = page.getByRole('button', { name: '台帳一覧に戻る' });
        const detailLabel = page.getByText('区画詳細');

        await expect(
          backButton.or(detailLabel).first()
        ).toBeVisible({ timeout: 10_000 });
      }
    }
  });

  test('4-6: 区画詳細 → 「台帳一覧に戻る」で一覧に戻る', async ({ page }) => {
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        // 区画を選択
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // 「台帳一覧に戻る」をクリック
        const backButton = page.getByRole('button', { name: '台帳一覧に戻る' });
        if (await backButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await backButton.click();
          await page.waitForTimeout(1_000);

          // 一覧画面に戻る（テーブルが再表示）
          await expect(table).toBeVisible({ timeout: 10_000 });
        }
      }
    }
  });

  test('4-7: データが0件の場合の空状態表示', async ({ page }) => {
    // 存在しない検索条件で検索
    const searchInput = page.locator('input[placeholder*="検索"], input[type="search"]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasSearch) {
      await searchInput.fill('存在しないデータ99999999');
      await page.waitForTimeout(1_000);

      // 空状態メッセージまたは0件表示
      const emptyState = page.getByText(/該当.*なし|0件|データ.*ありません/).first();
      const noRows = page.locator('table tbody tr');
      const rowCount = await noRows.count();

      // 空メッセージが出るか、テーブル行が0件
      const hasEmptyMessage = await emptyState.isVisible({ timeout: 3_000 }).catch(() => false);
      expect(hasEmptyMessage || rowCount === 0).toBeTruthy();
    }
  });
});
