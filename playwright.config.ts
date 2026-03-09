import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 * 認証セットアップ → ブラウザテストの順で実行
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
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // 認証セットアップ（各ロールのstorageState生成）
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Chromium（主要テスト）
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-setup'],
    },

    // Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['auth-setup'],
    },

    // WebKit
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['auth-setup'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
