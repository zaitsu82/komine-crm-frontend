/**
 * テストフィクスチャ
 * ロール別の認証済みページを提供
 */
import { test as base, expect, type Page } from '@playwright/test';

/**
 * サイドバーメニューのテキストを取得するヘルパー
 */
export async function getVisibleMenuItems(page: Page): Promise<string[]> {
  // サイドバー内のメニューボタンのテキストを全取得
  const sidebar = page.locator('.w-64');
  const buttons = sidebar.locator('button');
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

/**
 * サイドバーでメニュー項目をクリック
 */
export async function clickMenuItem(page: Page, label: string): Promise<void> {
  const sidebar = page.locator('.w-64');
  await sidebar.getByText(label, { exact: true }).click();
}

/**
 * ログインヘルパー（storageStateなしでログインする場合）
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('メールアドレス').fill(email);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.locator('h2').filter({ hasText: '小峰霊園CRM' })).toBeVisible({
    timeout: 15_000,
  });
}

export { base as test, expect };
