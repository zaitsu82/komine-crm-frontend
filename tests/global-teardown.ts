/**
 * Playwright グローバルティアダウン
 *
 * テスト実行後のクリーンアップ。
 * テストデータの削除やセッションのクリアを行う。
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function cleanupTestData(): Promise<void> {
  // テストデータクリーンアップエンドポイントがあれば呼び出す
  try {
    const response = await fetch(`${BACKEND_URL}/test/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      console.log('[E2E Teardown] Test data cleaned up');
    } else if (response.status === 404) {
      console.log('[E2E Teardown] No cleanup endpoint — skipping');
    }
  } catch {
    console.log('[E2E Teardown] Could not reach cleanup endpoint — skipping');
  }
}

export default async function globalTeardown(): Promise<void> {
  console.log('[E2E Teardown] Starting global teardown...');
  await cleanupTestData();
  console.log('[E2E Teardown] Global teardown complete');
}
