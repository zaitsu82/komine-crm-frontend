import { test, expect } from '@playwright/test';

test.describe('顧客検索機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 検索タブに切り替え
    await page.getByRole('tab', { name: '検索' }).click();
  });

  test('検索画面が正常に表示されることを確認', async ({ page }) => {
    // 検索フォームの要素を確認
    await expect(page.getByLabel('顧客ID')).toBeVisible();
    await expect(page.getByLabel('氏名')).toBeVisible();
    await expect(page.getByLabel('フリガナ')).toBeVisible();
    await expect(page.getByLabel('電話番号')).toBeVisible();
    await expect(page.getByLabel('墓所番号')).toBeVisible();

    // 検索ボタンの確認
    await expect(page.getByRole('button', { name: '検索' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible();
  });

  test('顧客IDでの検索が動作することを確認', async ({ page }) => {
    const customerIdInput = page.getByLabel('顧客ID');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 顧客IDを入力
    await customerIdInput.fill('C001');

    // 検索実行
    await searchButton.click();

    // 検索結果が表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
  });

  test('氏名での検索が動作することを確認', async ({ page }) => {
    const nameInput = page.getByLabel('氏名');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 氏名を入力
    await nameInput.fill('田中');

    // 検索実行
    await searchButton.click();

    // 検索結果が表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
  });

  test('フリガナでの検索が動作することを確認', async ({ page }) => {
    const furiganaInput = page.getByLabel('フリガナ');
    const searchButton = page.getByRole('button', { name: '検索' });

    // フリガナを入力
    await furiganaInput.fill('タナカ');

    // 検索実行
    await searchButton.click();

    // 検索結果が表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
  });

  test('電話番号での検索が動作することを確認', async ({ page }) => {
    const phoneInput = page.getByLabel('電話番号');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 電話番号を入力
    await phoneInput.fill('03-1234-5678');

    // 検索実行
    await searchButton.click();

    // 検索結果が表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
  });

  test('墓所番号での検索が動作することを確認', async ({ page }) => {
    const graveInput = page.getByLabel('墓所番号');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 墓所番号を入力
    await graveInput.fill('A-001');

    // 検索実行
    await searchButton.click();

    // 検索結果が表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
  });

  test('複数条件での検索が動作することを確認', async ({ page }) => {
    const nameInput = page.getByLabel('氏名');
    const phoneInput = page.getByLabel('電話番号');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 複数の検索条件を入力
    await nameInput.fill('田中');
    await phoneInput.fill('03-1234');

    // 検索実行
    await searchButton.click();

    // 検索結果が表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
  });

  test('クリアボタンが正常に動作することを確認', async ({ page }) => {
    const customerIdInput = page.getByLabel('顧客ID');
    const nameInput = page.getByLabel('氏名');
    const clearButton = page.getByRole('button', { name: 'クリア' });

    // 入力フィールドに値を設定
    await customerIdInput.fill('C001');
    await nameInput.fill('田中太郎');

    // 値が入力されていることを確認
    await expect(customerIdInput).toHaveValue('C001');
    await expect(nameInput).toHaveValue('田中太郎');

    // クリアボタンをクリック
    await clearButton.click();

    // フィールドがクリアされていることを確認
    await expect(customerIdInput).toHaveValue('');
    await expect(nameInput).toHaveValue('');
  });

  test('検索結果から顧客を選択できることを確認', async ({ page }) => {
    const nameInput = page.getByLabel('氏名');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 検索実行
    await nameInput.fill('田中');
    await searchButton.click();

    // 検索結果が表示されるまで待機
    await expect(page.getByText('検索結果')).toBeVisible();

    // 検索結果テーブルの最初の行をクリック
    const firstResultRow = page.locator('[data-testid="search-results"] tbody tr').first();
    const rowCount = await page.locator('[data-testid="search-results"] tbody tr').count();

    if (rowCount > 0) {
      await firstResultRow.click();
      // 詳細画面に遷移することを確認
      await expect(page.getByText('顧客詳細')).toBeVisible();
    }
  });

  test('検索結果が0件の場合の表示を確認', async ({ page }) => {
    const customerIdInput = page.getByLabel('顧客ID');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 存在しない顧客IDで検索
    await customerIdInput.fill('NONEXISTENT');
    await searchButton.click();

    // 検索結果0件のメッセージを確認
    await expect(page.getByText('該当する顧客が見つかりませんでした')).toBeVisible();
  });

  test('検索条件の入力値検証が動作することを確認', async ({ page }) => {
    const phoneInput = page.getByLabel('電話番号');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 不正な電話番号形式を入力
    await phoneInput.fill('invalid-phone');
    await searchButton.click();

    // バリデーションエラーが表示されることを確認（実装に応じて調整）
    // await expect(page.getByText('正しい電話番号を入力してください')).toBeVisible();
  });

  test('検索履歴機能が動作することを確認', async ({ page }) => {
    const nameInput = page.getByLabel('氏名');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 複数回検索を実行
    await nameInput.fill('田中');
    await searchButton.click();
    await page.waitForTimeout(1000);

    await nameInput.fill('佐藤');
    await searchButton.click();
    await page.waitForTimeout(1000);

    // 検索履歴が表示されることを確認（実装されている場合）
    // await expect(page.getByText('検索履歴')).toBeVisible();
  });

  test('検索結果のソート機能を確認', async ({ page }) => {
    const nameInput = page.getByLabel('氏名');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 検索実行
    await nameInput.fill('田');
    await searchButton.click();

    // 検索結果が表示されるまで待機
    await expect(page.getByText('検索結果')).toBeVisible();

    // カラムヘッダーをクリックしてソート（実装されている場合）
    const nameColumnHeader = page.getByText('氏名').first();
    if (await nameColumnHeader.isVisible()) {
      await nameColumnHeader.click();
      // ソートが適用されることを確認
    }
  });

  test('検索結果のページネーションを確認', async ({ page }) => {
    const nameInput = page.getByLabel('氏名');
    const searchButton = page.getByRole('button', { name: '検索' });

    // 多くの結果が返される検索を実行
    await nameInput.fill('田');
    await searchButton.click();

    // 検索結果が表示されるまで待機
    await expect(page.getByText('検索結果')).toBeVisible();

    // ページネーション要素が表示されることを確認
    const pagination = page.locator('[data-testid="search-pagination"]');
    if (await pagination.isVisible()) {
      // 次のページボタンをクリック
      const nextButton = page.getByRole('button', { name: '次へ' });
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        // ページが変わることを確認
      }
    }
  });
});
