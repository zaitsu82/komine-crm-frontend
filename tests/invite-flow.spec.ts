/**
 * 招待受諾フロー E2E テスト（scaffold）
 *
 * 対応 issue: zaitsu82/komine-crm-frontend#94
 *
 * 検証範囲:
 *   - /set-password ページの静的挙動（コードなし・不正コード）
 *   - GuestGuard（ログイン済みユーザーが /set-password を開いた場合）
 *   - 実際の招待メール受信 → パスワード設定 → ログインの E2E は、
 *     Supabase のメール受信テスト環境（Inbucket / 本物のメールボックス等）が
 *     必要なため test.fixme() で保留。環境整備後に解放する。
 */
import { test, expect } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

test.describe('招待受諾フロー', () => {
  // 94-1: コードなしで /set-password を開く → リンク無効メッセージ表示
  test('94-1: /set-password をコードなしで開くと招待リンク無効メッセージを表示', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/set-password');

    await expect(
      page.getByText('招待リンクが無効です。管理者に招待メールの再送をご依頼ください。')
    ).toBeVisible({ timeout: 10_000 });

    // パスワード入力フォームはレンダーされない
    await expect(page.getByLabel('新しいパスワード')).not.toBeVisible();

    await context.close();
  });

  // 94-2: /reset-password をコードなしで開いた場合
  test('94-2: /reset-password をコードなしで開くとリセットリンク無効メッセージを表示', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/reset-password');

    await expect(
      page.getByText('リセットリンクが無効です。再度パスワードリセットをお試しください。')
    ).toBeVisible({ timeout: 10_000 });

    await context.close();
  });

  // 94-3: 不正なコードで submit → INVALID_TOKEN エラー + 期限切れヒント
  test('94-3: 不正なcodeでsubmit → 期限切れヒントと再実行CTAを表示（reset）', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/reset-password?code=invalid-token-12345');

    await page.getByLabel('新しいパスワード').fill('TestPass123');
    await page.getByLabel('パスワード確認').fill('TestPass123');
    await page.getByRole('button', { name: 'パスワードを再設定' }).click();

    // バックエンドから INVALID_TOKEN が返り、期限切れヒントが表示される
    await expect(page.getByText(/有効期限が切れている/)).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByRole('button', { name: 'パスワードリセットをやり直す' })
    ).toBeVisible();

    await context.close();
  });

  // 94-4: ログイン済みユーザーが /set-password を直接開く → GuestGuard で / にリダイレクト
  // auth-setup で生成した viewer の storageState を利用
  test.describe('ログイン済みユーザーのガード', () => {
    test.use({ storageState: storageStatePath('viewer') });

    test('94-4: ログイン済みで /set-password を開くと GuestGuard で / にリダイレクト', async ({ page }) => {
      await page.goto('/set-password?code=some-code');

      // パスワード設定フォームではなくメイン画面が表示される
      await expect(page.locator('h2').filter({ hasText: '小嶺霊園CRM' })).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.getByLabel('新しいパスワード')).not.toBeVisible();
    });
  });

  // 94-5: パスワード要件UI（リアルタイムチェックリスト）
  test('94-5: パスワード要件のチェックリストがリアルタイムに更新される', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('/set-password?code=dummy-code-for-ui-check');

    const passwordInput = page.getByLabel('新しいパスワード');

    // 初期状態: 全て未チェック（• プレフィックス）
    await expect(page.getByText(/・?\s*8文字以上/, { exact: false })).toBeVisible();

    // 8文字以上を入力 → チェックマーク
    await passwordInput.fill('Abcdefg1');
    await expect(page.locator('.text-matsu').filter({ hasText: '8文字以上' })).toBeVisible();
    await expect(page.locator('.text-matsu').filter({ hasText: '大文字と小文字を含む' })).toBeVisible();
    await expect(page.locator('.text-matsu').filter({ hasText: '数字を含む' })).toBeVisible();

    await context.close();
  });

  // 94-E2E: 実メール受信を伴う完全E2E — 環境整備後に解放
  test.fixme(
    '94-E2E: admin招待 → メール受信 → パスワード設定 → ログイン（実環境必要）',
    async () => {
      // 実装メモ:
      // 1. adminでログイン → /staff からテスト用staffを作成（createStaff API）
      // 2. Supabase がテスト用メールボックス（Inbucket等）に招待メール送信
      // 3. メール本文から /set-password?code=xxx URLを抽出
      // 4. 新規コンテキストでそのURLに遷移
      // 5. パスワードを入力 → submit
      // 6. /login にリダイレクトされることを確認
      // 7. 設定したパスワードでログイン → 指定したroleで権限が反映されることを検証
      //
      // 要件:
      //   - Supabase local/dev環境で Inbucket などのメール受信サーバーを設定
      //   - playwright.config.ts に INBUCKET_URL を追加
      //   - テスト専用のメールアドレス生成ロジック
    }
  );
});
