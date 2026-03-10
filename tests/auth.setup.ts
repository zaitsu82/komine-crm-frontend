/**
 * 認証セットアップ
 * 各ロールでログインし、storageState を保存する
 * テスト実行前に1度だけ走る
 *
 * モックモード（NEXT_PUBLIC_USE_MOCK_DATA=true）で実行されるため
 * バックエンドやSupabaseは不要
 */
import { test as setup, expect } from '@playwright/test';
import { TEST_ACCOUNTS, storageStatePath, type TestRole } from './config/test-accounts';

// 逐次実行（セッション干渉を防止）
setup.describe.configure({ mode: 'serial' });

const roles: TestRole[] = ['admin', 'manager', 'operator', 'viewer'];

for (const role of roles) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const account = TEST_ACCOUNTS[role];

    // ログインページへ
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('小峰霊園CRM');

    // メールアドレス・パスワードを入力
    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill(account.password);

    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // メイン画面に遷移するまで待機（サイドバーのタイトルで判定）
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
      timeout: 15_000,
    });

    // storageState を保存
    await page.context().storageState({ path: storageStatePath(role) });
  });
}
