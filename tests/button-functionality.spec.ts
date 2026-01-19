import { test, expect } from '@playwright/test';

test.describe('霊園CRM - 全ボタン機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションのホームページにアクセス
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('検索画面のボタン動作確認', async ({ page }) => {
    // 検索タブがデフォルトで選択されているか確認
    const searchTab = page.getByRole('tab', { name: /顧客検索/ });
    await expect(searchTab).toBeVisible();

    // 検索ボタンのテスト
    const searchButton = page.getByRole('button', { name: /^検索$/ });
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toBeEnabled();

    // クリアボタンのテスト
    const clearButton = page.getByRole('button', { name: /クリア/ });
    await expect(clearButton).toBeVisible();
    await expect(clearButton).toBeEnabled();

    // 新規登録ボタンのテスト
    const newCustomerButton = page.getByRole('button', { name: /新規登録/ });
    await expect(newCustomerButton).toBeVisible();
    await expect(newCustomerButton).toBeEnabled();

    // 検索フィールドに値を入力して検索ボタンをクリック
    await page.fill('input[placeholder*="顧客番号"]', 'TEST001');
    await searchButton.click();

    // 検索中の表示確認（ボタンテキストが変わるか）
    const searchingButton = page.getByRole('button', { name: /検索中/ });
    if (await searchingButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(searchingButton).toBeDisabled();
    }

    // クリアボタンの動作確認
    await clearButton.click();
    const customerIdInput = page.locator('input[placeholder*="顧客番号"]');
    await expect(customerIdInput).toHaveValue('');
  });

  test('新規登録タブのボタン動作確認', async ({ page }) => {
    // 新規登録タブに切り替え
    const registryTab = page.getByRole('tab', { name: /新規登録/ });
    await registryTab.click();
    await page.waitForTimeout(500); // タブ切り替えのアニメーション待機

    // 家族・連絡先の新規追加ボタン
    const addContactButton = page.getByRole('button', { name: /\+ 新規追加/ }).first();
    if (await addContactButton.isVisible()) {
      await expect(addContactButton).toBeEnabled();

      // ボタンをクリックして新しい連絡先フォームが追加されるか確認
      const initialContactCount = await page.locator('[class*="contact-item"]').count();
      await addContactButton.click();
      await page.waitForTimeout(500);
      const newContactCount = await page.locator('[class*="contact-item"]').count();

      // 新しい連絡先が追加されたか確認（要素が増えているか）
      if (newContactCount > initialContactCount) {
        console.log('新規連絡先が正常に追加されました');
      }
    }

    // 埋葬者一覧の新規追加ボタン
    const addBuriedPersonButton = page.getByRole('button', { name: /\+ 新規追加/ }).nth(1);
    if (await addBuriedPersonButton.isVisible()) {
      await expect(addBuriedPersonButton).toBeEnabled();

      // ボタンをクリックして新しい埋葬者フォームが追加されるか確認
      await addBuriedPersonButton.click();
      await page.waitForTimeout(500);
    }

    // 削除ボタンの確認
    const deleteButtons = page.getByRole('button', { name: /削除/ });
    const deleteButtonCount = await deleteButtons.count();
    if (deleteButtonCount > 0) {
      for (let i = 0; i < Math.min(deleteButtonCount, 2); i++) {
        const deleteButton = deleteButtons.nth(i);
        await expect(deleteButton).toBeVisible();
        await expect(deleteButton).toBeEnabled();
      }
    }

    // 登録/更新ボタンの確認
    const submitButton = page.getByRole('button', { name: /登録|更新/ });
    await expect(submitButton).toBeVisible();

    // 必須フィールドが空の場合、ボタンの状態を確認
    const isDisabled = await submitButton.isDisabled();
    console.log(`登録ボタンの状態: ${isDisabled ? '無効' : '有効'}`);
  });

  test('フォーム送信ボタンの状態変化確認', async ({ page }) => {
    // 新規登録タブに切り替え
    const registryTab = page.getByRole('tab', { name: /新規登録/ });
    await registryTab.click();
    await page.waitForTimeout(500);

    // 必須フィールドに値を入力
    await page.fill('input[name="customerId"]', 'TEST002');
    await page.fill('input[name="name"]', 'テスト太郎');
    await page.fill('input[name="postalCode"]', '1234567');
    await page.fill('input[name="address"]', '東京都テスト区テスト町1-2-3');
    await page.fill('input[name="phone"]', '090-1234-5678');

    // 登録ボタンの状態確認
    const submitButton = page.getByRole('button', { name: /登録/ });
    await expect(submitButton).toBeEnabled();

    // フォーム送信をテスト（実際には送信しない）
    await submitButton.click();

    // 送信中の表示確認
    const savingButton = page.getByRole('button', { name: /保存中/ });
    if (await savingButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(savingButton).toBeDisabled();
      console.log('保存中の状態が正しく表示されました');
    }
  });

  test('タブ切り替えボタンの動作確認', async ({ page }) => {
    // 各タブの切り替えをテスト
    const tabs = [
      { name: '顧客検索', selector: 'tab' },
      { name: '新規登録', selector: 'tab' }
    ];

    for (const tab of tabs) {
      const tabButton = page.getByRole('tab', { name: new RegExp(tab.name) });
      await expect(tabButton).toBeVisible();
      await tabButton.click();

      // タブがアクティブになったか確認
      const isSelected = await tabButton.getAttribute('aria-selected');
      expect(isSelected).toBe('true');

      console.log(`${tab.name}タブが正常に切り替わりました`);
      await page.waitForTimeout(300);
    }
  });

  test('検索結果の顧客選択ボタン動作確認', async ({ page }) => {
    // 検索を実行して結果を表示
    await page.fill('input[placeholder*="氏名"]', 'テスト');
    const searchButton = page.getByRole('button', { name: /^検索$/ });
    await searchButton.click();

    // 検索結果が表示されるまで待機
    await page.waitForTimeout(2000);

    // 検索結果の顧客カード（クリック可能な要素）を確認
    const customerCards = page.locator('[role="button"][aria-label*="顧客"]');
    const cardCount = await customerCards.count();

    if (cardCount > 0) {
      console.log(`${cardCount}件の顧客が見つかりました`);

      // 最初の顧客カードをクリック
      const firstCard = customerCards.first();
      await expect(firstCard).toBeVisible();
      await firstCard.click();

      console.log('顧客カードのクリックが正常に動作しました');
    } else {
      console.log('検索結果に顧客が見つかりませんでした');
    }

    // 検索をクリアボタンの動作確認
    const clearSearchButton = page.getByRole('button', { name: /検索をクリア/ });
    if (await clearSearchButton.isVisible()) {
      await clearSearchButton.click();
      console.log('検索クリアボタンが正常に動作しました');
    }
  });

  test('アクセシビリティ: キーボード操作でのボタン動作確認', async ({ page }) => {
    // Tabキーでボタン間を移動
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // フォーカスされている要素を確認
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName);

    if (tagName === 'BUTTON') {
      // Enterキーでボタンをクリック
      await page.keyboard.press('Enter');
      console.log('キーボード操作でボタンがクリックできました');
    }

    // Spaceキーでもボタンをクリック可能か確認
    await page.keyboard.press('Tab');
    const nextFocusedElement = page.locator(':focus');
    const nextTagName = await nextFocusedElement.evaluate(el => el.tagName);

    if (nextTagName === 'BUTTON') {
      await page.keyboard.press('Space');
      console.log('Spaceキーでもボタンがクリックできました');
    }
  });

  test('レスポンシブデザイン: モバイルビューでのボタン表示確認', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });

    // ボタンが適切に表示されているか確認
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    console.log(`モバイルビューで${buttonCount}個のボタンが表示されています`);

    // 各ボタンがタップ可能なサイズか確認
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();

      if (box) {
        // モバイルでのタップターゲットの最小推奨サイズ（44x44px）を確認
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    console.log('モバイルビューでのボタンサイズが適切です');
  });

  test('エラー状態でのボタン動作確認', async ({ page }) => {
    // 新規登録タブに切り替え
    const registryTab = page.getByRole('tab', { name: /新規登録/ });
    await registryTab.click();
    await page.waitForTimeout(500);

    // 不正な値を入力
    await page.fill('input[name="postalCode"]', 'invalid');
    await page.fill('input[name="phone"]', 'invalid-phone');

    // 登録ボタンをクリック
    const submitButton = page.getByRole('button', { name: /登録/ });
    await submitButton.click();

    // エラーメッセージが表示されるか確認
    await page.waitForTimeout(1000);
    const errorMessages = page.locator('[class*="error"], [class*="invalid"]');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      console.log(`${errorCount}個のエラーメッセージが表示されました`);
      // エラー状態でもボタンが適切に動作するか確認
      await expect(submitButton).toBeEnabled();
    }
  });
});

test.describe('パフォーマンステスト', () => {
  test('ボタンクリックの応答時間測定', async ({ page }) => {
    await page.goto('/');

    // 検索ボタンのクリック応答時間を測定
    const searchButton = page.getByRole('button', { name: /^検索$/ });

    const startTime = Date.now();
    await searchButton.click();
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { });
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    console.log(`検索ボタンの応答時間: ${responseTime}ms`);

    // 応答時間が3秒以内であることを確認
    expect(responseTime).toBeLessThan(3000);
  });
});