/**
 * ロールベースアクセス制御 E2Eテスト
 * 各ロールでのメニュー表示・画面アクセス権限を検証
 */
import { test, expect, type Page } from '@playwright/test';
import { storageStatePath, type TestRole } from './config/test-accounts';

// 各ロールで見えるべきメニュー項目
// アカウント設定はサイドバーからUserMenuドロップダウンに移動済み
// 合祀管理・ゆうちょ連携はbackend権限(permission.ts)に合わせ manager 以上に統一
// 請求書一括印刷は PDF を出力する操作のため backend 権限に合わせ operator 以上
const EXPECTED_MENU_ITEMS: Record<TestRole, string[]> = {
  viewer: ['台帳問い合わせ', '区画残数管理', '書類管理'],
  operator: ['台帳問い合わせ', '区画残数管理', '書類管理', '請求書一括印刷'],
  manager: ['台帳問い合わせ', '合祀管理', '区画残数管理', '書類管理', '請求書一括印刷', 'ゆうちょ連携', 'スタッフ管理'],
  admin: ['台帳問い合わせ', '合祀管理', '区画残数管理', '書類管理', '請求書一括印刷', 'ゆうちょ連携', 'スタッフ管理', 'マスタ管理'],
};

// 各ロールで見えてはいけないメニュー項目
const HIDDEN_MENU_ITEMS: Record<TestRole, string[]> = {
  viewer: ['合祀管理', '請求書一括印刷', 'ゆうちょ連携', 'スタッフ管理', 'マスタ管理'],
  operator: ['合祀管理', 'ゆうちょ連携', 'スタッフ管理', 'マスタ管理'],
  manager: ['マスタ管理'],
  admin: [],
};

/**
 * サイドバー内のメニューリンクテキストを取得
 * GlobalSidebar は Link (a要素) でメニューを描画
 */
async function getSidebarMenuTexts(page: Page): Promise<string[]> {
  const sidebar = page.getByTestId('global-sidebar');
  await expect(sidebar).toBeVisible({ timeout: 15_000 });

  // メニューリンク（a要素）のテキストを取得
  const menuArea = sidebar.locator('nav');
  const links = menuArea.locator('a');
  const count = await links.count();

  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await links.nth(i).textContent();
    if (text && text.trim()) {
      labels.push(text.trim());
    }
  }
  return labels;
}

test.describe('ロールベースメニュー表示', () => {
  for (const role of ['viewer', 'operator', 'manager', 'admin'] as TestRole[]) {
    test(`2-${role}: ${role} ロールのメニュー表示が正しい`, async ({ browser }) => {
      const context = await browser.newContext({
        storageState: storageStatePath(role),
      });
      const page = await context.newPage();
      await page.goto('/');

      const menuTexts = await getSidebarMenuTexts(page);

      // 見えるべきメニュー項目の確認
      for (const expected of EXPECTED_MENU_ITEMS[role]) {
        expect(menuTexts, `${role} should see "${expected}"`).toContain(expected);
      }

      // 見えてはいけないメニュー項目の確認
      for (const hidden of HIDDEN_MENU_ITEMS[role]) {
        expect(menuTexts, `${role} should NOT see "${hidden}"`).not.toContain(hidden);
      }

      await context.close();
    });
  }
});

test.describe('ロール別操作権限', () => {
  test('2-9: viewer は区画詳細で削除ボタンが表示されない', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('viewer'),
    });
    const page = await context.newPage();
    await page.goto('/');

    // サイドバーが表示されている
    await expect(page.getByTestId('global-sidebar')).toBeVisible({ timeout: 15_000 });

    // 「区画情報を削除」ボタンが存在しない（ページ内ツールバーのドロップダウン）
    await expect(page.getByText('区画情報を削除')).not.toBeVisible();

    await context.close();
  });

  test('2-10: admin のUserMenuにロールラベル「管理者」が表示', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('admin'),
    });
    const page = await context.newPage();
    await page.goto('/');

    // サイドバーが表示されるまで待機
    await expect(page.getByTestId('global-sidebar')).toBeVisible({ timeout: 15_000 });

    // UserMenuを開いてロールラベルを確認
    const userMenuButton = page.getByRole('button', { name: 'ユーザーメニュー' });
    await expect(userMenuButton).toBeVisible();
    await userMenuButton.click();
    await expect(page.getByText('管理者', { exact: true })).toBeVisible();

    await context.close();
  });

  test('2-11: viewer のUserMenuにロールラベル「閲覧者」が表示', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('viewer'),
    });
    const page = await context.newPage();
    await page.goto('/');

    // サイドバーが表示されるまで待機
    await expect(page.getByTestId('global-sidebar')).toBeVisible({ timeout: 15_000 });

    // UserMenuを開いてロールラベルを確認
    const userMenuButton = page.getByRole('button', { name: 'ユーザーメニュー' });
    await expect(userMenuButton).toBeVisible();
    await userMenuButton.click();
    await expect(page.getByText('閲覧者', { exact: true })).toBeVisible();

    await context.close();
  });
});
