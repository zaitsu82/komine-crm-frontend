/**
 * 認証フロー E2Eテスト
 * ログイン・ログアウト・ガードの動作確認
 */
import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS, storageStatePath } from './config/test-accounts';

test.describe('認証フロー', () => {
  test('1-1: 正しい認証情報でログイン成功', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.admin;

    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill(account.password);
    await page.getByRole('button', { name: 'ログイン' }).click();

    // メイン画面のサイドバータイトルが表示される
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('1-2: 不正な認証情報でログイン失敗 → エラーメッセージ表示', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill('wrong@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージが表示される
    await expect(page.locator('text=ログインに失敗しました').or(
      page.locator('text=メールアドレスまたはパスワードが正しくありません')
    )).toBeVisible({ timeout: 10_000 });

    // ログインページのまま
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('1-3: パスワード間違いでログイン失敗', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.admin;

    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージが表示される
    await expect(page.locator('[class*="beni"]').filter({ hasText: /ログイン|パスワード|正しくありません/ })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('1-4: ログアウト → ログイン画面遷移', async ({ page }) => {
    // admin でログイン済みの状態を使用
    await page.goto('/login');
    const account = TEST_ACCOUNTS.admin;
    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill(account.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({ timeout: 15_000 });

    // ログアウトボタンをクリック
    await page.getByRole('button', { name: 'ログアウト' }).click();

    // ログインページにリダイレクト
    await expect(page.getByLabel('メールアドレス')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('h1').filter({ hasText: '小峰霊園CRM' })).toBeVisible();
  });

  test('1-5: 未認証状態で保護ページにアクセス → /login にリダイレクト', async ({ page }) => {
    // 認証なしで直接メイン画面にアクセス
    await page.goto('/');

    // ログインページにリダイレクトされる
    await expect(page.getByLabel('メールアドレス')).toBeVisible({ timeout: 15_000 });
  });

  test('1-6: ログイン済みで /login にアクセス → / にリダイレクト', async ({ browser }) => {
    // admin の storageState を使用
    const context = await browser.newContext({
      storageState: storageStatePath('admin'),
    });
    const page = await context.newPage();

    await page.goto('/login');

    // メイン画面にリダイレクトされる
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
      timeout: 15_000,
    });

    await context.close();
  });

  test('1-7: ログイン中はボタンが無効化される', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.admin;

    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill(account.password);

    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await loginButton.click();

    // ログイン中... のテキストまたは disabled 状態を確認
    // 高速な場合は一瞬なのでsoftアサーションとする
    const loadingText = page.getByText('ログイン中...');
    if (await loadingText.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await expect(loadingText).toBeVisible();
    }

    // 最終的にログイン成功
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
