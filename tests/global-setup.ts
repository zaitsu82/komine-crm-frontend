/**
 * Playwright グローバルセットアップ
 *
 * テスト実行前に:
 * 1. バックエンドのヘルスチェック
 * 2. テストデータのシード（バックエンドAPI経由）
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const BACKEND_HEALTH_URL = 'http://localhost:4000/health';

async function waitForBackend(maxRetries = 30, intervalMs = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(BACKEND_HEALTH_URL);
      if (response.ok) {
        console.log('[E2E Setup] Backend is ready');
        return;
      }
    } catch {
      // Backend not ready yet
    }
    if (i < maxRetries - 1) {
      console.log(`[E2E Setup] Waiting for backend... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  throw new Error('[E2E Setup] Backend did not start within the timeout');
}

async function seedTestData(): Promise<void> {
  console.log('[E2E Setup] Seeding test data via backend API...');

  // テストデータシードエンドポイントがあるか確認
  // なければスキップ（insert-test-data.js で手動シード済みの前提）
  try {
    const response = await fetch(`${BACKEND_URL}/test/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      console.log('[E2E Setup] Test data seeded successfully');
    } else if (response.status === 404) {
      console.log('[E2E Setup] No seed endpoint found — assuming data is pre-seeded');
      console.log('[E2E Setup] Run `node scripts/insert-test-data.js` in backend to seed manually');
    } else {
      console.warn(`[E2E Setup] Seed endpoint returned ${response.status}`);
    }
  } catch {
    console.log('[E2E Setup] Could not reach seed endpoint — assuming data is pre-seeded');
  }
}

export default async function globalSetup(): Promise<void> {
  console.log('[E2E Setup] Starting global setup...');
  console.log(`[E2E Setup] Backend URL: ${BACKEND_URL}`);

  await waitForBackend();
  await seedTestData();

  console.log('[E2E Setup] Global setup complete');
}
