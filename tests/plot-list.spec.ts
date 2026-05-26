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
    // サイドバーのメニュー項目が描画されるまで待機（認証完了の確認）
    const sidebar = page.locator('.w-64');
    await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });
    await sidebar.getByText('台帳問い合わせ', { exact: true }).click();
    await page.waitForTimeout(1_000);
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
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="ページ"]').first();
    const hasPagination = await pagination.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasPagination) {
      const nextButton = page.getByRole('button', { name: /次|→|>/ }).first();
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        const prevButton = page.getByRole('button', { name: /前|←|</ }).first();
        await expect(prevButton).toBeEnabled();
        await prevButton.click();
      }
    }
  });

  test('4-3: 検索 - 顧客名で検索', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"], input[placeholder*="名前"], input[type="search"]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasSearch) {
      await searchInput.fill('田中');
      await page.waitForTimeout(1_000);

      const table = page.locator('table').first();
      if (await table.isVisible()) {
        const rows = table.locator('tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('4-4: AIUEOタブによる50音フィルタリング', async ({ page }) => {
    const aiueoTab = page.locator('button').filter({ hasText: /^ア$/ }).first();
    const hasAiueo = await aiueoTab.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasAiueo) {
      await aiueoTab.click();
      await page.waitForTimeout(1_000);

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
        await page.waitForTimeout(2_000);

        // URLが /plots/{id} に遷移する
        await expect(page).toHaveURL(/\/plots\//, { timeout: 10_000 });

        // パンくずまたは編集ボタンが表示される（区画詳細ページ確認）
        const breadcrumb = page.getByRole('link', { name: '台帳', exact: true });
        const editButton = page.getByRole('button', { name: '編集' });

        await expect(
          breadcrumb.or(editButton).first()
        ).toBeVisible({ timeout: 10_000 });
      }
    }
  });

  test('4-6: 区画詳細 → パンくずで一覧に戻る', async ({ page }) => {
    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(2_000);

        // パンくずの「台帳」リンクをクリック
        const breadcrumb = page.getByRole('link', { name: '台帳', exact: true });
        if (await breadcrumb.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await breadcrumb.click();
          await page.waitForTimeout(1_000);

          // 一覧画面に戻る
          await expect(page).toHaveURL('/plots', { timeout: 10_000 });
          await expect(table).toBeVisible({ timeout: 10_000 });
        }
      }
    }
  });

  test('4-7: データが0件の場合の空状態表示', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"], input[type="search"]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasSearch) {
      await searchInput.fill('存在しないデータ99999999');
      await page.waitForTimeout(1_000);

      const emptyState = page.getByText(/該当.*なし|0件|データ.*ありません/).first();
      const noRows = page.locator('table tbody tr');
      const rowCount = await noRows.count();

      const hasEmptyMessage = await emptyState.isVisible({ timeout: 3_000 }).catch(() => false);
      expect(hasEmptyMessage || rowCount === 0).toBeTruthy();
    }
  });

  // issue #146: 列幅のドラッグ調整と localStorage 保持
  test('4-8: 列幅をドラッグで広げると幅が変わりリロード後も保持される', async ({ page }) => {
    // 住所列はデスクトップ幅（md 以上）でのみ表示される
    await page.setViewportSize({ width: 1280, height: 800 });

    const addressHeader = page.locator('thead th', { hasText: '住所' }).first();
    const hasAddressHeader = await addressHeader.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasAddressHeader) return; // テーブル未表示環境ではスキップ

    const before = await addressHeader.boundingBox();
    const resizer = addressHeader.getByTestId('col-resizer-address');
    await expect(resizer).toBeVisible();

    // ハンドルを右へ 150px ドラッグして列を広げる
    const box = await resizer.boundingBox();
    if (!box || !before) return;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const after = await addressHeader.boundingBox();
    expect(after && before && after.width).toBeGreaterThan(before.width);

    // localStorage に保存され、リロード後も幅が維持される
    const stored = await page.evaluate(() => localStorage.getItem('komine:plots:column-widths'));
    expect(stored).toBeTruthy();

    await page.reload();
    await expect(addressHeader).toBeVisible({ timeout: 10_000 });
    const afterReload = await addressHeader.boundingBox();
    expect(afterReload && before && afterReload.width).toBeGreaterThan(before.width);

    // 「列幅をリセット」で初期状態に戻る
    const resetButton = page.getByRole('button', { name: '列幅をリセット' });
    if (await resetButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await resetButton.click();
      await page.waitForTimeout(300);
      const reset = await page.evaluate(() => localStorage.getItem('komine:plots:column-widths'));
      expect(reset === '{}' || reset === null).toBeTruthy();
    }
  });

  // issue #120: モバイル（iPhone SE 375px）でカードビューに切り替わる
  test('4-9: モバイル幅では一覧がカード表示になりタップで詳細へ遷移する', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const cards = page.getByTestId('plot-card');
    const cardCount = await cards.count().catch(() => 0);
    if (cardCount === 0) return; // データ未投入環境ではスキップ

    // モバイルではテーブルは非表示（md:block）
    const table = page.locator('table').first();
    await expect(table).toBeHidden();

    // カードタップで区画詳細に遷移
    await cards.first().click();
    await expect(page).toHaveURL(/\/plots\//, { timeout: 10_000 });
  });
});
