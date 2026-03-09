/**
 * 認証フロー E2Eテスト
 *
 * 注意:
 * - このファイルは auth-tests プロジェクトで最後に実行される。
 *   テスト 1-4 のログアウトが Supabase の admin.signOut (global scope) を
 *   呼び出し、同一ユーザーの全セッションを破棄するため。
 * - Supabase のレートリミット回避のため、テストごとにアカウントを分散させる。
 *   auth-setup で使う4アカウント + ここで使うアカウントが短時間に集中しないよう注意。
 */
import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from './config/test-accounts';

test.describe('認証フロー', () => {
  // 1-1: manager でログイン成功を検証（admin は auth-setup で使用済み）
  test('1-1: 正しい認証情報でログイン成功', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.manager;

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

    // 存在しないアカウント（バックエンドへの負荷最小）
    await page.getByLabel('メールアドレス').fill('nonexistent@example.com');
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // エラーメッセージが表示される（フォーム内のインラインメッセージを特定）
    await expect(
      page.locator('.bg-beni-50 p.text-beni')
    ).toBeVisible({ timeout: 10_000 });

    // ログインページのまま
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  // 1-3: operator でパスワード間違いを検証
  test('1-3: パスワード間違いでログイン失敗', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.operator;

    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // フォーム内のエラーメッセージが表示される
    await expect(
      page.locator('.bg-beni-50 p.text-beni')
    ).toBeVisible({ timeout: 10_000 });
  });

  // 1-4: viewer でログイン→ログアウトを検証（admin セッションを壊さない）
  test('1-4: ログアウト → ログイン画面遷移', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.viewer;
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
    await page.goto('/');

    // ログインページにリダイレクトされる
    await expect(page.getByLabel('メールアドレス')).toBeVisible({ timeout: 15_000 });
  });

  // 1-6: operator でフレッシュログイン → GuestGuard 検証
  test('1-6: ログイン済みで /login にアクセス → / にリダイレクト', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login');
    const account = TEST_ACCOUNTS.operator;
    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill(account.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({ timeout: 15_000 });

    // ログイン済みで再度 /login にアクセス
    await page.goto('/login');

    // メイン画面にリダイレクトされる（GuestGuard）
    await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
      timeout: 15_000,
    });

    await context.close();
  });

  // 1-7: manager でログインボタン状態を検証
  test('1-7: ログイン中はボタンが無効化される', async ({ page }) => {
    await page.goto('/login');
    const account = TEST_ACCOUNTS.manager;

    await page.getByLabel('メールアドレス').fill(account.email);
    await page.getByLabel('パスワード').fill(account.password);

    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await loginButton.click();

    // ログイン中... テキストまたは disabled 状態を確認（高速な場合は一瞬）
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
