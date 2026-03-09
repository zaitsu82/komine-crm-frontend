import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 *
 * 実行順序:
 *   1. auth-setup   … 各ロールでログインし storageState を保存
 *   2. chromium      … storageState を利用するメインテスト群（auth.spec.ts は除外）
 *   3. auth-tests    … ログイン・ログアウトを含む認証テスト（セッション破棄の影響を隔離）
 *   4. firefox / webkit … クロスブラウザ
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },

  projects: [
    // 1. 認証セットアップ（各ロールの storageState 生成）
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 2. メインテスト（auth.spec.ts を除く ─ セッション破棄を防ぐ）
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-setup'],
      testIgnore: /auth\.spec\.ts/,
    },

    // 3. 認証テスト（ログアウト等でセッションを破棄するため最後に実行）
    {
      name: 'auth-tests',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['chromium'],
      testMatch: /auth\.spec\.ts/,
    },

    // 4. クロスブラウザ（auth.spec.ts を除く）
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['auth-setup'],
      testIgnore: /auth\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['auth-setup'],
      testIgnore: /auth\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_USE_MOCK_DATA: 'true',
    },
  },
});
