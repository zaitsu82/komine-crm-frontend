import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 *
 * CI: モックモード（フロントエンドのみ起動）
 * ローカル: 実APIモード（バックエンド + フロントエンド起動）
 *
 * 実行順序:
 *   1. auth-setup   … 各ロールでログインし storageState を保存
 *   2. chromium      … storageState を利用するメインテスト群（auth.spec.ts は除外）
 *   3. auth-tests    … ログイン・ログアウトを含む認証テスト（セッション破棄の影響を隔離）
 */

const isCI = !!process.env.CI;
const useRealApi = !isCI;

export default defineConfig({
  testDir: './tests',
  ...(useRealApi
    ? {
        globalSetup: './tests/global-setup.ts',
        globalTeardown: './tests/global-teardown.ts',
      }
    : {}),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 4,
  reporter: isCI
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
  ],

  webServer: useRealApi
    ? [
        // 実APIモード: バックエンド + フロントエンド
        {
          command: 'npm run dev',
          url: 'http://localhost:4000/health',
          reuseExistingServer: true,
          timeout: 120_000,
          cwd: '../komine-crm-backend',
          env: {
            E2E_TEST: 'true',
          },
        },
        {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 120_000,
          env: {
            NEXT_PUBLIC_USE_MOCK_DATA: 'false',
            NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
          },
        },
      ]
    : {
        // CIモック: フロントエンドのみ
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          NEXT_PUBLIC_USE_MOCK_DATA: 'true',
        },
      },
});
