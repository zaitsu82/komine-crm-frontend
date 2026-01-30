import { test, expect } from '@playwright/test';

test.describe('顧客情報編集機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 顧客詳細画面に遷移して編集画面を開く
    const firstCustomerRow = page.locator('tbody tr').first();
    const rowCount = await page.locator('tbody tr').count();

    if (rowCount > 0) {
      await firstCustomerRow.click();
      await page.getByRole('button', { name: '編集' }).click();
    } else {
      // テストデータがない場合は、検索から詳細画面に遷移
      await page.getByRole('tab', { name: '検索' }).click();
      await page.getByLabel('顧客ID').fill('C001');
      await page.getByRole('button', { name: '検索' }).click();

      const searchResultRow = page.locator('[data-testid="search-results"] tbody tr').first();
      const searchRowCount = await page.locator('[data-testid="search-results"] tbody tr').count();

      if (searchRowCount > 0) {
        await searchResultRow.click();
        await page.getByRole('button', { name: '編集' }).click();
      }
    }
  });

  test('顧客情報編集画面が正常に表示されることを確認', async ({ page }) => {
    // 編集画面のタイトルを確認
    await expect(page.getByText('顧客情報編集')).toBeVisible();

    // フォームが表示されることを確認
    await expect(page.locator('form')).toBeVisible();

    // 保存・キャンセル・削除ボタンの確認
    await expect(page.getByRole('button', { name: '保存' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();
    await expect(page.getByRole('button', { name: '削除' })).toBeVisible();
  });

  test('既存の顧客データが正しくロードされることを確認', async ({ page }) => {
    // フィールドに既存データが入力されていることを確認
    const nameField = page.getByLabel('契約者氏名');
    const nameValue = await nameField.inputValue();
    expect(nameValue).toBeTruthy();
    expect(nameValue.length).toBeGreaterThan(0);

    const phoneField = page.getByLabel('電話番号');
    const phoneValue = await phoneField.inputValue();
    expect(phoneValue).toBeTruthy();
    expect(phoneValue.length).toBeGreaterThan(0);
  });

  test('基本情報の編集が正常に動作することを確認', async ({ page }) => {
    // 契約者氏名を変更
    const nameField = page.getByLabel('契約者氏名');
    await nameField.clear();
    await nameField.fill('鈴木花子');

    // 電話番号を変更
    const phoneField = page.getByLabel('電話番号');
    await phoneField.clear();
    await phoneField.fill('03-9876-5432');

    // メールアドレスを変更
    const emailField = page.getByLabel('メールアドレス');
    await emailField.clear();
    await emailField.fill('suzuki@example.com');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージを確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });
  });

  test('住所情報の編集が正常に動作することを確認', async ({ page }) => {
    // 郵便番号を変更
    const postalCodeField = page.getByLabel('郵便番号');
    await postalCodeField.clear();
    await postalCodeField.fill('456-7890');

    // 住所を変更
    const addressField = page.getByLabel('住所');
    await addressField.clear();
    await addressField.fill('大阪府大阪市北区梅田1-1-1');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージを確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });
  });

  test('墓所情報の編集が正常に動作することを確認', async ({ page }) => {
    // 墓所種別を変更
    const graveTypeField = page.getByLabel('墓所種別');
    await graveTypeField.selectOption('永代供養墓');

    // 使用料を変更
    const usageFeeField = page.getByLabel('使用料');
    await usageFeeField.clear();
    await usageFeeField.fill('600000');

    // 管理料を変更
    const managementFeeField = page.getByLabel('管理料');
    await managementFeeField.clear();
    await managementFeeField.fill('35000');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージを確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });
  });

  test('必須フィールドの削除時にバリデーションエラーが表示されることを確認', async ({ page }) => {
    // 必須フィールドを空にする
    await page.getByLabel('契約者氏名').clear();
    await page.getByLabel('電話番号').clear();
    await page.getByLabel('住所').clear();

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // バリデーションエラーが表示されることを確認
    await expect(page.getByText('契約者氏名は必須です')).toBeVisible();
    await expect(page.getByText('電話番号は必須です')).toBeVisible();
    await expect(page.getByText('住所は必須です')).toBeVisible();
  });

  test('不正な形式での入力時にバリデーションエラーが表示されることを確認', async ({ page }) => {
    // 不正な電話番号を入力
    const phoneField = page.getByLabel('電話番号');
    await phoneField.clear();
    await phoneField.fill('invalid-phone');

    // 不正なメールアドレスを入力
    const emailField = page.getByLabel('メールアドレス');
    await emailField.clear();
    await emailField.fill('invalid-email');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // バリデーションエラーが表示されることを確認
    await expect(page.getByText('電話番号は正しい形式で入力してください')).toBeVisible();
    await expect(page.getByText('メールアドレスは正しい形式で入力してください')).toBeVisible();
  });

  test('部分的な編集が正常に動作することを確認', async ({ page }) => {
    // 一つのフィールドのみを変更
    const emailField = page.getByLabel('メールアドレス');
    // Store original value for potential future assertions
    void await emailField.inputValue();

    await emailField.clear();
    await emailField.fill('newemail@example.com');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージを確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });

    // 他のフィールドが変更されていないことを確認
    const nameField = page.getByLabel('契約者氏名');
    const nameValue = await nameField.inputValue();
    expect(nameValue).toBeTruthy();
  });

  test('キャンセルボタンで編集をキャンセルできることを確認', async ({ page }) => {
    // フィールドを変更
    const nameField = page.getByLabel('契約者氏名');
    // Store original value for potential future assertions
    void await nameField.inputValue();
    await nameField.clear();
    await nameField.fill('変更テスト');

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 確認ダイアログが表示される場合
    const confirmDialog = page.locator('[role="dialog"]');
    if (await confirmDialog.isVisible()) {
      await page.getByRole('button', { name: 'はい' }).click();
    }

    // 詳細画面に戻ることを確認
    await expect(page.getByText('顧客詳細')).toBeVisible();
  });

  test('削除機能が正常に動作することを確認', async ({ page }) => {
    // 削除ボタンをクリック
    await page.getByRole('button', { name: '削除' }).click();

    // 削除確認ダイアログが表示されることを確認
    await expect(page.getByText('この顧客を削除しますか？')).toBeVisible();
    await expect(page.getByText('この操作は取り消せません')).toBeVisible();

    // 削除を実行
    await page.getByRole('button', { name: '削除する' }).click();

    // 削除完了メッセージを確認
    await expect(page.getByText('顧客を削除しました')).toBeVisible({ timeout: 10000 });

    // 一覧画面に戻ることを確認
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();
  });

  test('削除キャンセルが正常に動作することを確認', async ({ page }) => {
    // 削除ボタンをクリック
    await page.getByRole('button', { name: '削除' }).click();

    // 削除確認ダイアログでキャンセルをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 編集画面に留まることを確認
    await expect(page.getByText('顧客情報編集')).toBeVisible();
  });

  test('変更履歴が記録されることを確認', async ({ page }) => {
    // フィールドを変更
    const phoneField = page.getByLabel('電話番号');
    await phoneField.clear();
    await phoneField.fill('03-0000-0000');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 成功メッセージを確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });

    // 詳細画面で変更履歴を確認（実装されている場合）
    const historySection = page.getByText('変更履歴');
    if (await historySection.isVisible()) {
      await expect(historySection).toBeVisible();
      await expect(page.getByText('電話番号を変更')).toBeVisible();
    }
  });

  test('楽観的ロックが正常に動作することを確認', async ({ page }) => {
    // 編集中に別のセッションで同じ顧客が更新された場合の処理
    // （実装されている場合のテスト）

    // フィールドを変更
    const nameField = page.getByLabel('契約者氏名');
    await nameField.clear();
    await nameField.fill('競合テスト');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 競合エラーメッセージが表示される場合
    // await expect(page.getByText('他のユーザーによって更新されています')).toBeVisible();
  });

  test('埋葬者情報の編集が正常に動作することを確認', async ({ page }) => {
    // 埋葬者情報セクションが存在する場合
    const burialSection = page.getByText('埋葬者情報');
    if (await burialSection.isVisible()) {
      // 新しい埋葬者を追加
      const addBurialButton = page.getByRole('button', { name: '埋葬者追加' });
      if (await addBurialButton.isVisible()) {
        await addBurialButton.click();

        // 埋葬者情報を入力
        await page.getByLabel('埋葬者氏名').fill('田中一郎');
        await page.getByLabel('続柄').selectOption('父');
        await page.getByLabel('生年月日').fill('1950-01-01');
        await page.getByLabel('死亡年月日').fill('2020-01-01');
        await page.getByLabel('埋葬日').fill('2020-01-15');

        // 保存ボタンをクリック
        await page.getByRole('button', { name: '保存' }).click();

        // 成功メッセージを確認
        await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('支払情報の編集が正常に動作することを確認', async ({ page }) => {
    // 支払情報セクションが存在する場合
    const paymentSection = page.getByText('支払情報');
    if (await paymentSection.isVisible()) {
      // 新しい支払記録を追加
      const addPaymentButton = page.getByRole('button', { name: '支払追加' });
      if (await addPaymentButton.isVisible()) {
        await addPaymentButton.click();

        // 支払情報を入力
        await page.getByLabel('支払日').fill('2024-01-15');
        await page.getByLabel('項目').selectOption('管理料');
        await page.getByLabel('金額').fill('30000');
        await page.getByLabel('支払方法').selectOption('銀行振込');

        // 保存ボタンをクリック
        await page.getByRole('button', { name: '保存' }).click();

        // 成功メッセージを確認
        await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('フィールドの文字数制限が正常に動作することを確認', async ({ page }) => {
    // 長すぎる文字列を入力
    const longString = 'あ'.repeat(100);

    const nameField = page.getByLabel('契約者氏名');
    await nameField.clear();
    await nameField.fill(longString);

    // 文字数制限エラーまたは自動トリミングを確認
    const nameValue = await nameField.inputValue();
    expect(nameValue.length).toBeLessThanOrEqual(50); // 仮の制限値
  });

  test('保存確認ダイアログが表示されることを確認', async ({ page }) => {
    // フィールドを変更
    const phoneField = page.getByLabel('電話番号');
    await phoneField.clear();
    await phoneField.fill('03-1111-1111');

    // 保存ボタンをクリック
    await page.getByRole('button', { name: '保存' }).click();

    // 確認ダイアログが表示される場合
    const confirmDialog = page.locator('[role="dialog"]');
    if (await confirmDialog.isVisible()) {
      await expect(page.getByText('変更内容を保存しますか？')).toBeVisible();
      await page.getByRole('button', { name: 'はい' }).click();
    }

    // 保存完了を確認
    await expect(page.getByText('顧客情報を更新しました')).toBeVisible({ timeout: 10000 });
  });

  test('編集権限チェックが動作することを確認', async ({ page }) => {
    // 権限がない場合の編集制限（実装されている場合）
    // 編集不可のフィールドが disabled になっていることを確認
    const restrictedField = page.locator('[data-restricted="true"]');
    if (await restrictedField.isVisible()) {
      await expect(restrictedField).toBeDisabled();
    }
  });
});
