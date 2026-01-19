import { test, expect } from '@playwright/test';

test.describe('統合テスト - 顧客管理フロー', () => {
  test('完全な顧客管理フローが正常に動作することを確認', async ({ page }) => {
    await page.goto('/');

    // 1. 新規顧客登録
    await page.getByRole('button', { name: '新規顧客登録' }).click();

    // 顧客情報を入力
    const timestamp = Date.now();
    const testCustomerName = `テスト太郎${timestamp}`;
    const testCustomerEmail = `test${timestamp}@example.com`;
    const testGraveNumber = `T-${timestamp}`;

    await page.getByLabel('契約者氏名').fill(testCustomerName);
    await page.getByLabel('フリガナ').fill('テストタロウ');
    await page.getByLabel('性別').selectOption('男性');
    await page.getByLabel('生年月日').fill('1980-05-15');
    await page.getByLabel('郵便番号').fill('123-4567');
    await page.getByLabel('住所').fill('東京都渋谷区神宮前1-1-1');
    await page.getByLabel('電話番号').fill('03-1234-5678');
    await page.getByLabel('メールアドレス').fill(testCustomerEmail);
    await page.getByLabel('墓所番号').fill(testGraveNumber);
    await page.getByLabel('墓所種別').selectOption('一般墓所');
    await page.getByLabel('区画面積').fill('4.0');
    await page.getByLabel('使用料').fill('500000');
    await page.getByLabel('管理料').fill('30000');
    await page.getByLabel('契約日').fill('2024-01-15');

    // 登録実行
    await page.getByRole('button', { name: '登録' }).click();

    // 登録完了確認
    await expect(page.getByText('顧客を登録しました')).toBeVisible({ timeout: 10000 });

    // 2. 検索機能で登録した顧客を検索
    await page.getByRole('tab', { name: '検索' }).click();
    await page.getByLabel('氏名').fill(testCustomerName);
    await page.getByRole('button', { name: '検索' }).click();

    // 検索結果に表示されることを確認
    await expect(page.getByText('検索結果')).toBeVisible();
    await expect(page.getByText(testCustomerName)).toBeVisible();

    // 3. 検索結果から顧客詳細を表示
    const customerRow = page.locator(`text=${testCustomerName}`).locator('..');
    await customerRow.click();

    // 詳細画面の表示確認
    await expect(page.getByText('顧客詳細')).toBeVisible();
    await expect(page.getByText(testCustomerName)).toBeVisible();
    await expect(page.getByText(testGraveNumber)).toBeVisible();

    // 4. 顧客情報を編集
    await page.getByRole('button', { name: '編集' }).click();

    // 編集画面の表示確認
    await expect(page.getByText('顧客情報編集')).toBeVisible();

    // 電話番号を変更
    const newPhoneNumber = '03-9876-5432';
    await page.getByLabel('電話番号').clear();
    await page.getByLabel('電話番号').fill(newPhoneNumber);

    // 保存実行
    await page.getByRole('button', { name: '保存' }).click();

    // 更新完了確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });

    // 5. 更新された情報を確認
    await expect(page.getByText(newPhoneNumber)).toBeVisible();

    // 6. 台帳一覧に戻る
    await page.getByRole('button', { name: '一覧に戻る' }).click();
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();

    // 7. 台帳一覧で更新された顧客情報を確認
    await expect(page.getByText(testCustomerName)).toBeVisible();
  });

  test('複数タブでの操作が正常に動作することを確認', async ({ page }) => {
    await page.goto('/');

    // 台帳タブでの操作
    await expect(page.getByRole('tab', { name: '台帳' })).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('顧客ID')).toBeVisible();

    // 検索タブに切り替え
    await page.getByRole('tab', { name: '検索' }).click();
    await expect(page.getByRole('tab', { name: '検索' })).toHaveAttribute('data-state', 'active');
    await expect(page.getByLabel('顧客ID')).toBeVisible();

    // 検索実行
    await page.getByLabel('氏名').fill('田中');
    await page.getByRole('button', { name: '検索' }).click();
    await expect(page.getByText('検索結果')).toBeVisible();

    // 台帳タブに戻る
    await page.getByRole('tab', { name: '台帳' }).click();
    await expect(page.getByRole('tab', { name: '台帳' })).toHaveAttribute('data-state', 'active');
    await expect(page.getByText('顧客ID')).toBeVisible();
  });

  test('ページネーション機能の統合テスト', async ({ page }) => {
    await page.goto('/');

    // ページサイズを変更
    const pageSizeSelector = page.locator('select').filter({ hasText: '件表示' });
    if (await pageSizeSelector.isVisible()) {
      await pageSizeSelector.selectOption('20');
    }

    // ページネーション要素の確認
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // 次のページボタンをクリック
      const nextButton = page.getByRole('button', { name: '次へ' });
      if (await nextButton.isEnabled()) {
        await nextButton.click();

        // ページが変わったことを確認
        await expect(page.locator('[data-testid="current-page"]')).toContainText('2');

        // 前のページボタンをクリック
        const prevButton = page.getByRole('button', { name: '前へ' });
        await prevButton.click();

        // 最初のページに戻ったことを確認
        await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
      }
    }
  });

  test('エラーハンドリングの統合テスト', async ({ page }) => {
    await page.goto('/');

    // ネットワークエラーをシミュレート
    await page.route('**/api/**', route => route.abort());

    // 新規登録を試行
    await page.getByRole('button', { name: '新規顧客登録' }).click();

    await page.getByLabel('契約者氏名').fill('エラーテスト');
    await page.getByLabel('フリガナ').fill('エラーテスト');
    await page.getByLabel('性別').selectOption('男性');
    await page.getByLabel('生年月日').fill('1980-05-15');
    await page.getByLabel('郵便番号').fill('123-4567');
    await page.getByLabel('住所').fill('東京都渋谷区神宮前1-1-1');
    await page.getByLabel('電話番号').fill('03-1234-5678');
    await page.getByLabel('墓所番号').fill('E-001');
    await page.getByLabel('墓所種別').selectOption('一般墓所');
    await page.getByLabel('契約日').fill('2024-01-15');

    await page.getByRole('button', { name: '登録' }).click();

    // エラーメッセージが表示されることを確認
    await expect(page.getByText('エラーが発生しました')).toBeVisible({ timeout: 10000 });

    // ネットワークルートを元に戻す
    await page.unroute('**/api/**');
  });

  test('レスポンシブデザインでの操作確認', async ({ page }) => {
    // デスクトップ表示
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();

    // タブレット表示
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();

    // 新規登録ボタンが表示されることを確認
    await expect(page.getByRole('button', { name: '新規顧客登録' })).toBeVisible();

    // モバイル表示
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();

    // メニューが適切に表示されることを確認
    const hamburgerMenu = page.locator('[data-testid="mobile-menu"]');
    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click();
      await expect(page.getByText('台帳問合せ')).toBeVisible();
    }
  });

  test('アクセシビリティの統合テスト', async ({ page }) => {
    await page.goto('/');

    // キーボードナビゲーション
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // フォーカスが適切に移動することを確認
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // スクリーンリーダー用のaria-labelが設定されていることを確認
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const buttonText = await button.textContent();
      expect(ariaLabel || buttonText).toBeTruthy();
    }

    // 見出しの階層が適切に設定されていることを確認
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('パフォーマンステスト', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // ページロード時間を測定
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5秒以内でロード

    // 大量データでの検索パフォーマンステスト
    await page.getByRole('tab', { name: '検索' }).click();

    const searchStartTime = Date.now();
    await page.getByLabel('氏名').fill('田');
    await page.getByRole('button', { name: '検索' }).click();

    // 検索結果が表示されるまでの時間を測定
    await expect(page.getByText('検索結果')).toBeVisible({ timeout: 10000 });
    const searchTime = Date.now() - searchStartTime;
    expect(searchTime).toBeLessThan(10000); // 10秒以内で検索完了
  });

  test('データの整合性テスト', async ({ page }) => {
    await page.goto('/');

    // 顧客一覧の件数確認
    const customerRows = page.locator('tbody tr');
    const initialCount = await customerRows.count();

    // 新規顧客登録
    const timestamp = Date.now();
    await page.getByRole('button', { name: '新規顧客登録' }).click();

    await page.getByLabel('契約者氏名').fill(`整合性テスト${timestamp}`);
    await page.getByLabel('フリガナ').fill('セイゴウセイテスト');
    await page.getByLabel('性別').selectOption('女性');
    await page.getByLabel('生年月日').fill('1990-12-25');
    await page.getByLabel('郵便番号').fill('987-6543');
    await page.getByLabel('住所').fill('大阪府大阪市北区梅田2-2-2');
    await page.getByLabel('電話番号').fill('06-9999-9999');
    await page.getByLabel('墓所番号').fill(`I-${timestamp}`);
    await page.getByLabel('墓所種別').selectOption('一般墓所');
    await page.getByLabel('契約日').fill('2024-02-01');

    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText('顧客を登録しました')).toBeVisible({ timeout: 10000 });

    // 一覧画面で件数が増加していることを確認
    const newCustomerRows = page.locator('tbody tr');
    const newCount = await newCustomerRows.count();
    expect(newCount).toBeGreaterThan(initialCount);

    // 登録した顧客が検索できることを確認
    await page.getByRole('tab', { name: '検索' }).click();
    await page.getByLabel('氏名').fill(`整合性テスト${timestamp}`);
    await page.getByRole('button', { name: '検索' }).click();

    await expect(page.getByText('検索結果')).toBeVisible();
    await expect(page.getByText(`整合性テスト${timestamp}`)).toBeVisible();
  });
});
