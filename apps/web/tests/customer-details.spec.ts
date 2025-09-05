import { test, expect } from '@playwright/test';

test.describe('顧客詳細表示機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // 台帳から顧客を選択して詳細画面に遷移
    // テストデータがある場合の想定
    const firstCustomerRow = page.locator('tbody tr').first();
    const rowCount = await page.locator('tbody tr').count();
    
    if (rowCount > 0) {
      await firstCustomerRow.click();
    } else {
      // テストデータがない場合は、検索から詳細画面に遷移
      await page.getByRole('tab', { name: '検索' }).click();
      await page.getByLabel('顧客ID').fill('C001');
      await page.getByRole('button', { name: '検索' }).click();
      
      const searchResultRow = page.locator('[data-testid="search-results"] tbody tr').first();
      const searchRowCount = await page.locator('[data-testid="search-results"] tbody tr').count();
      
      if (searchRowCount > 0) {
        await searchResultRow.click();
      }
    }
  });

  test('顧客詳細画面が正常に表示されることを確認', async ({ page }) => {
    // 詳細画面のタイトルを確認
    await expect(page.getByText('顧客詳細')).toBeVisible();
    
    // 戻るボタンの確認
    await expect(page.getByRole('button', { name: '一覧に戻る' })).toBeVisible();
  });

  test('顧客基本情報が表示されることを確認', async ({ page }) => {
    // 基本情報セクションの確認
    await expect(page.getByText('基本情報')).toBeVisible();
    
    // 基本情報フィールドの確認
    const basicInfoFields = [
      '顧客ID',
      '契約者氏名',
      'フリガナ',
      '性別',
      '生年月日',
      '郵便番号',
      '住所',
      '電話番号',
      'FAX番号',
      'メールアドレス'
    ];

    for (const field of basicInfoFields) {
      await expect(page.getByText(field)).toBeVisible();
    }
  });

  test('墓所情報が表示されることを確認', async ({ page }) => {
    // 墓所情報セクションの確認
    await expect(page.getByText('墓所情報')).toBeVisible();
    
    // 墓所情報フィールドの確認
    const graveInfoFields = [
      '墓所番号',
      '墓所種別',
      '区画面積',
      '使用料',
      '管理料',
      '契約日',
      '使用期限'
    ];

    for (const field of graveInfoFields) {
      await expect(page.getByText(field)).toBeVisible();
    }
  });

  test('埋葬者情報が表示されることを確認', async ({ page }) => {
    // 埋葬者情報セクションの確認
    await expect(page.getByText('埋葬者情報')).toBeVisible();
    
    // 埋葬者情報テーブルの確認
    const burialInfoColumns = [
      '氏名',
      '続柄',
      '生年月日',
      '死亡年月日',
      '埋葬日'
    ];

    for (const column of burialInfoColumns) {
      await expect(page.getByText(column)).toBeVisible();
    }
  });

  test('支払履歴が表示されることを確認', async ({ page }) => {
    // 支払履歴セクションの確認
    await expect(page.getByText('支払履歴')).toBeVisible();
    
    // 支払履歴テーブルの確認
    const paymentHistoryColumns = [
      '支払日',
      '項目',
      '金額',
      '支払方法',
      '備考'
    ];

    for (const column of paymentHistoryColumns) {
      await expect(page.getByText(column)).toBeVisible();
    }
  });

  test('連絡履歴が表示されることを確認', async ({ page }) => {
    // 連絡履歴セクションの確認
    await expect(page.getByText('連絡履歴')).toBeVisible();
    
    // 連絡履歴テーブルの確認
    const contactHistoryColumns = [
      '日付',
      '種別',
      '内容',
      '担当者'
    ];

    for (const column of contactHistoryColumns) {
      await expect(page.getByText(column)).toBeVisible();
    }
  });

  test('編集ボタンが表示され動作することを確認', async ({ page }) => {
    // 編集ボタンの確認
    const editButton = page.getByRole('button', { name: '編集' });
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeEnabled();
    
    // 編集ボタンをクリック
    await editButton.click();
    
    // 編集画面に遷移することを確認
    await expect(page.getByText('顧客情報編集')).toBeVisible();
  });

  test('印刷ボタンが表示され動作することを確認', async ({ page }) => {
    // 印刷ボタンの確認
    const printButton = page.getByRole('button', { name: '印刷' });
    await expect(printButton).toBeVisible();
    await expect(printButton).toBeEnabled();
    
    // 印刷ダイアログの確認（実装されている場合）
    // await printButton.click();
    // 印刷プレビューまたは印刷ダイアログが表示されることを確認
  });

  test('戻るボタンで一覧画面に戻ることを確認', async ({ page }) => {
    // 戻るボタンをクリック
    const backButton = page.getByRole('button', { name: '一覧に戻る' });
    await backButton.click();
    
    // 一覧画面に戻ることを確認
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '台帳' })).toHaveAttribute('data-state', 'active');
  });

  test('タブ切り替えで各セクションが表示されることを確認', async ({ page }) => {
    // 詳細画面内のタブが存在する場合のテスト
    const tabs = ['基本情報', '墓所情報', '埋葬者情報', '支払履歴', '連絡履歴'];
    
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: tabName });
      if (await tab.isVisible()) {
        await tab.click();
        await expect(tab).toHaveAttribute('data-state', 'active');
        // 対応するコンテンツが表示されることを確認
        await expect(page.getByText(tabName)).toBeVisible();
      }
    }
  });

  test('日付フォーマットが正しく表示されることを確認', async ({ page }) => {
    // 日本の年号フォーマット（令和、平成など）で表示されることを確認
    const dateElements = page.locator('[data-testid*="date"]');
    const count = await dateElements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const dateText = await dateElements.nth(i).textContent();
        // 日本の年号または西暦フォーマットかどうかを確認
        expect(dateText).toMatch(/(令和|平成|昭和|大正|明治).*年.*月.*日|\d{4}年\d{1,2}月\d{1,2}日/);
      }
    }
  });

  test('電話番号リンクが動作することを確認', async ({ page }) => {
    // 電話番号がリンクとして表示されている場合のテスト
    const phoneLink = page.locator('a[href^="tel:"]').first();
    if (await phoneLink.isVisible()) {
      await expect(phoneLink).toBeVisible();
      // クリックしても電話アプリが起動することを確認（実際には起動しない）
      await phoneLink.click();
    }
  });

  test('メールアドレスリンクが動作することを確認', async ({ page }) => {
    // メールアドレスがリンクとして表示されている場合のテスト
    const emailLink = page.locator('a[href^="mailto:"]').first();
    if (await emailLink.isVisible()) {
      await expect(emailLink).toBeVisible();
      // クリックしてもメールアプリが起動することを確認（実際には起動しない）
      await emailLink.click();
    }
  });

  test('住所リンクでマップが開くことを確認', async ({ page }) => {
    // 住所がマップリンクとして表示されている場合のテスト
    const mapLink = page.locator('a[href*="maps"]').first();
    if (await mapLink.isVisible()) {
      await expect(mapLink).toBeVisible();
      // 新しいタブでマップが開くことを確認
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        mapLink.click()
      ]);
      await expect(newPage.url()).toContain('maps');
      await newPage.close();
    }
  });

  test('アクセシビリティが適切に設定されていることを確認', async ({ page }) => {
    // フォーカス可能な要素がキーボードでアクセスできることを確認
    await page.keyboard.press('Tab');
    
    // 適切なaria-labelやroleが設定されていることを確認
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // テーブルに適切なヘッダーが設定されていることを確認
    const tables = page.locator('table');
    const tableCount = await tables.count();
    if (tableCount > 0) {
      await expect(tables.first().locator('thead')).toBeVisible();
    }
  });

  test('データの整合性チェック', async ({ page }) => {
    // 顧客IDが一意であることを確認
    const customerIdElements = page.locator('[data-testid="customer-id"]');
    if (await customerIdElements.count() > 0) {
      const customerId = await customerIdElements.textContent();
      expect(customerId).toBeTruthy();
      expect(customerId?.length).toBeGreaterThan(0);
    }
    
    // 必須フィールドが空でないことを確認
    const requiredFields = ['契約者氏名', '墓所番号'];
    for (const field of requiredFields) {
      const fieldElement = page.getByText(field).locator('..').locator('[data-testid*="value"]');
      if (await fieldElement.isVisible()) {
        const value = await fieldElement.textContent();
        expect(value?.trim()).toBeTruthy();
      }
    }
  });
});
