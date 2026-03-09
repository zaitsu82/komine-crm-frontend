/**
 * ロールベースアクセス制御 E2Eテスト
 * 各ロールでのメニュー表示・画面アクセス権限を検証
 */
import { test, expect, type Page } from '@playwright/test';
import { storageStatePath, type TestRole } from './config/test-accounts';

// 各ロールで見えるべきメニュー項目
const EXPECTED_MENU_ITEMS: Record<TestRole, string[]> = {
  viewer: ['台帳問い合わせ', '合祀管理', '区画残数管理', '書類管理', 'アカウント設定'],
  operator: ['台帳問い合わせ', '合祀管理', '区画残数管理', '書類管理', 'アカウント設定'],
  manager: ['台帳問い合わせ', '合祀管理', '区画残数管理', '書類管理', 'スタッフ管理', '一括登録', 'アカウント設定'],
  admin: ['台帳問い合わせ', '合祀管理', '区画残数管理', '書類管理', 'スタッフ管理', 'マスタ管理', '一括登録', 'アカウント設定'],
};

// 各ロールで見えてはいけないメニュー項目
const HIDDEN_MENU_ITEMS: Record<TestRole, string[]> = {
  viewer: ['スタッフ管理', 'マスタ管理', '一括登録'],
  operator: ['スタッフ管理', 'マスタ管理', '一括登録'],
  manager: ['マスタ管理'],
  admin: [],
};

/**
 * サイドバー内のメニューボタンテキストを取得
 */
async function getSidebarMenuTexts(page: Page): Promise<string[]> {
  const sidebar = page.locator('.w-64');
  await expect(sidebar).toBeVisible({ timeout: 15_000 });

  // メニューボタン（button要素）のテキストを取得
  // ログアウトボタン等を除外するため、メインエリア内のみ取得
  const menuArea = sidebar.locator('.flex-1');
  const buttons = menuArea.locator('button');
  const count = await buttons.count();

  const labels: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = await buttons.nth(i).textContent();
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

test.describe('ロールベースルートガード', () => {
  test('2-5: viewer が /bulk-import に直接アクセス → リダイレクト', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('viewer'),
    });
    const page = await context.newPage();

    await page.goto('/bulk-import');

    // RoleGuard が / にリダイレクト、または AuthGuard が /login にリダイレクト
    await expect(page).not.toHaveURL('/bulk-import', { timeout: 20_000 });

    await context.close();
  });

  test('2-6: operator が /bulk-import に直接アクセス → リダイレクト', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('operator'),
    });
    const page = await context.newPage();

    await page.goto('/bulk-import');

    // メイン画面にリダイレクトされる
    await expect(page).not.toHaveURL('/bulk-import', { timeout: 20_000 });

    await context.close();
  });

  test('2-7: manager が /bulk-import にアクセス → 表示可能', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('manager'),
    });
    const page = await context.newPage();

    await page.goto('/bulk-import');

    // 一括登録画面が表示される（リダイレクトされない）
    await expect(page).toHaveURL('/bulk-import', { timeout: 15_000 });

    await context.close();
  });

  test('2-8: admin が /bulk-import にアクセス → 表示可能', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('admin'),
    });
    const page = await context.newPage();

    await page.goto('/bulk-import');

    await expect(page).toHaveURL('/bulk-import', { timeout: 15_000 });

    await context.close();
  });
});

test.describe('ロール別操作権限', () => {
  test('2-9: viewer はサイドバーに区画削除ボタンが表示されない', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('viewer'),
    });
    const page = await context.newPage();
    await page.goto('/');

    // サイドバーが表示されている
    await expect(page.locator('.w-64')).toBeVisible({ timeout: 15_000 });

    // 「区画情報を削除」ボタンが存在しない
    await expect(page.getByRole('button', { name: '区画情報を削除' })).not.toBeVisible();

    await context.close();
  });

  test('2-10: admin のサイドバーにロールラベル「管理者」が表示', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('admin'),
    });
    const page = await context.newPage();
    await page.goto('/');

    // サイドバーが表示され、ロールラベル「管理者」が見える
    const sidebar = page.locator('.w-64');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    await expect(sidebar.getByText('管理者', { exact: true })).toBeVisible();

    await context.close();
  });

  test('2-11: viewer のサイドバーにロールラベル「閲覧者」が表示', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: storageStatePath('viewer'),
    });
    const page = await context.newPage();
    await page.goto('/');

    const sidebar = page.locator('.w-64');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    await expect(sidebar.getByText('閲覧者', { exact: true })).toBeVisible();

    await context.close();
  });
});
