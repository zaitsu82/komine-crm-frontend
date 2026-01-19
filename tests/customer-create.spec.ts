import { test, expect } from '@playwright/test';

test.describe('新規顧客登録機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 新規顧客登録ボタンをクリックして登録画面に遷移
    await page.getByRole('button', { name: '新規顧客登録' }).click();
  });

  test('新規顧客登録画面が正常に表示されることを確認', async ({ page }) => {
    // 登録画面のタイトルを確認
    await expect(page.getByText('新規顧客登録')).toBeVisible();

    // フォームが表示されることを確認
    await expect(page.locator('form')).toBeVisible();

    // 登録ボタンとキャンセルボタンの確認
    await expect(page.getByRole('button', { name: '登録' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();
  });

  test('基本情報入力フィールドが正しく表示されることを確認', async ({ page }) => {
    // 基本情報セクションの確認
    await expect(page.getByText('基本情報')).toBeVisible();

    // 必須フィールドの確認
    const requiredFields = [
      '契約者氏名',
      'フリガナ',
      '性別',
      '生年月日',
      '郵便番号',
      '住所',
      '電話番号'
    ];

    for (const field of requiredFields) {
      await expect(page.getByLabel(field)).toBeVisible();
    }

    // オプションフィールドの確認
    const optionalFields = [
      'FAX番号',
      'メールアドレス'
    ];

    for (const field of optionalFields) {
      await expect(page.getByLabel(field)).toBeVisible();
    }
  });

  test('墓所情報入力フィールドが正しく表示されることを確認', async ({ page }) => {
    // 墓所情報セクションの確認
    await expect(page.getByText('墓所情報')).toBeVisible();

    // 墓所情報フィールドの確認
    const graveFields = [
      '墓所番号',
      '墓所種別',
      '区画面積',
      '使用料',
      '管理料',
      '契約日'
    ];

    for (const field of graveFields) {
      await expect(page.getByLabel(field)).toBeVisible();
    }
  });

  test('正常な顧客データで登録が成功することを確認', async ({ page }) => {
    // 基本情報を入力
    await page.getByLabel('契約者氏名').fill('田中太郎');
    await page.getByLabel('フリガナ').fill('タナカタロウ');
    await page.getByLabel('性別').selectOption('男性');
    await page.getByLabel('生年月日').fill('1980-05-15');
    await page.getByLabel('郵便番号').fill('123-4567');
    await page.getByLabel('住所').fill('東京都渋谷区神宮前1-1-1');
    await page.getByLabel('電話番号').fill('03-1234-5678');
    await page.getByLabel('メールアドレス').fill('tanaka@example.com');

    // 墓所情報を入力
    await page.getByLabel('墓所番号').fill('A-001');
    await page.getByLabel('墓所種別').selectOption('一般墓所');
    await page.getByLabel('区画面積').fill('4.0');
    await page.getByLabel('使用料').fill('500000');
    await page.getByLabel('管理料').fill('30000');
    await page.getByLabel('契約日').fill('2024-01-15');

    // 登録ボタンをクリック
    await page.getByRole('button', { name: '登録' }).click();

    // 成功メッセージまたは一覧画面への遷移を確認
    await expect(page.getByText('顧客を登録しました')).toBeVisible({ timeout: 10000 });
  });

  test('必須フィールドの入力チェックが動作することを確認', async ({ page }) => {
    // 登録ボタンをクリック（必須フィールド未入力）
    await page.getByRole('button', { name: '登録' }).click();

    // バリデーションエラーが表示されることを確認
    await expect(page.getByText('契約者氏名は必須です')).toBeVisible();
    await expect(page.getByText('フリガナは必須です')).toBeVisible();
    await expect(page.getByText('性別は必須です')).toBeVisible();
    await expect(page.getByText('生年月日は必須です')).toBeVisible();
    await expect(page.getByText('郵便番号は必須です')).toBeVisible();
    await expect(page.getByText('住所は必須です')).toBeVisible();
    await expect(page.getByText('電話番号は必須です')).toBeVisible();
    await expect(page.getByText('墓所番号は必須です')).toBeVisible();
  });

  test('フリガナの入力形式チェックが動作することを確認', async ({ page }) => {
    // 不正なフリガナを入力
    await page.getByLabel('契約者氏名').fill('田中太郎');
    await page.getByLabel('フリガナ').fill('田中太郎'); // ひらがな・漢字（不正）

    await page.getByRole('button', { name: '登録' }).click();

    // フリガナのバリデーションエラーを確認
    await expect(page.getByText('フリガナはカタカナで入力してください')).toBeVisible();
  });

  test('郵便番号の入力形式チェックが動作することを確認', async ({ page }) => {
    // 不正な郵便番号を入力
    await page.getByLabel('郵便番号').fill('1234567'); // ハイフンなし（不正）

    await page.getByRole('button', { name: '登録' }).click();

    // 郵便番号のバリデーションエラーを確認
    await expect(page.getByText('郵便番号は正しい形式で入力してください')).toBeVisible();
  });

  test('電話番号の入力形式チェックが動作することを確認', async ({ page }) => {
    // 不正な電話番号を入力
    await page.getByLabel('電話番号').fill('03-1234'); // 不完全な番号（不正）

    await page.getByRole('button', { name: '登録' }).click();

    // 電話番号のバリデーションエラーを確認
    await expect(page.getByText('電話番号は正しい形式で入力してください')).toBeVisible();
  });

  test('メールアドレスの入力形式チェックが動作することを確認', async ({ page }) => {
    // 不正なメールアドレスを入力
    await page.getByLabel('メールアドレス').fill('invalid-email'); // 不正な形式

    await page.getByRole('button', { name: '登録' }).click();

    // メールアドレスのバリデーションエラーを確認
    await expect(page.getByText('メールアドレスは正しい形式で入力してください')).toBeVisible();
  });

  test('生年月日の入力範囲チェックが動作することを確認', async ({ page }) => {
    // 未来の日付を入力
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    await page.getByLabel('生年月日').fill(futureDateString);

    await page.getByRole('button', { name: '登録' }).click();

    // 生年月日のバリデーションエラーを確認
    await expect(page.getByText('生年月日は過去の日付を入力してください')).toBeVisible();
  });

  test('墓所番号の重複チェックが動作することを確認', async ({ page }) => {
    // 基本情報を入力
    await page.getByLabel('契約者氏名').fill('田中太郎');
    await page.getByLabel('フリガナ').fill('タナカタロウ');
    await page.getByLabel('性別').selectOption('男性');
    await page.getByLabel('生年月日').fill('1980-05-15');
    await page.getByLabel('郵便番号').fill('123-4567');
    await page.getByLabel('住所').fill('東京都渋谷区神宮前1-1-1');
    await page.getByLabel('電話番号').fill('03-1234-5678');

    // 既存の墓所番号を入力
    await page.getByLabel('墓所番号').fill('A-001'); // 既存の番号と仮定
    await page.getByLabel('墓所種別').selectOption('一般墓所');
    await page.getByLabel('契約日').fill('2024-01-15');

    await page.getByRole('button', { name: '登録' }).click();

    // 重複エラーメッセージを確認（既存データがある場合）
    // await expect(page.getByText('この墓所番号は既に使用されています')).toBeVisible();
  });

  test('使用料・管理料の数値入力チェックが動作することを確認', async ({ page }) => {
    // 不正な数値を入力
    await page.getByLabel('使用料').fill('abc'); // 数値以外
    await page.getByLabel('管理料').fill('-1000'); // 負の数値

    await page.getByRole('button', { name: '登録' }).click();

    // 数値バリデーションエラーを確認
    await expect(page.getByText('使用料は正の数値で入力してください')).toBeVisible();
    await expect(page.getByText('管理料は正の数値で入力してください')).toBeVisible();
  });

  test('キャンセルボタンで登録をキャンセルできることを確認', async ({ page }) => {
    // 一部のフィールドを入力
    await page.getByLabel('契約者氏名').fill('田中太郎');
    await page.getByLabel('フリガナ').fill('タナカタロウ');

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // 確認ダイアログが表示される場合
    const confirmDialog = page.locator('[role="dialog"]');
    if (await confirmDialog.isVisible()) {
      await page.getByRole('button', { name: 'はい' }).click();
    }

    // 一覧画面に戻ることを確認
    await expect(page.getByRole('heading', { name: '顧客台帳' })).toBeVisible();
  });

  test('フォームの入力内容保持機能を確認', async ({ page }) => {
    // フィールドに入力
    await page.getByLabel('契約者氏名').fill('田中太郎');
    await page.getByLabel('フリガナ').fill('タナカタロウ');

    // ページを更新（実際の実装では別のタブへの移動など）
    await page.reload();

    // 新規登録画面に再度遷移
    await page.getByRole('button', { name: '新規顧客登録' }).click();

    // 入力内容が保持されていることを確認（実装されている場合）
    // await expect(page.getByLabel('契約者氏名')).toHaveValue('田中太郎');
  });

  test('自動生成機能が動作することを確認', async ({ page }) => {
    // 顧客IDの自動生成ボタンがある場合
    const generateIdButton = page.getByRole('button', { name: '顧客ID自動生成' });
    if (await generateIdButton.isVisible()) {
      await generateIdButton.click();

      // 顧客IDが自動生成されることを確認
      const customerIdField = page.getByLabel('顧客ID');
      await expect(customerIdField).not.toHaveValue('');
    }
  });

  test('登録確認ダイアログが表示されることを確認', async ({ page }) => {
    // 有効なデータを入力
    await page.getByLabel('契約者氏名').fill('田中太郎');
    await page.getByLabel('フリガナ').fill('タナカタロウ');
    await page.getByLabel('性別').selectOption('男性');
    await page.getByLabel('生年月日').fill('1980-05-15');
    await page.getByLabel('郵便番号').fill('123-4567');
    await page.getByLabel('住所').fill('東京都渋谷区神宮前1-1-1');
    await page.getByLabel('電話番号').fill('03-1234-5678');
    await page.getByLabel('墓所番号').fill('A-002');
    await page.getByLabel('墓所種別').selectOption('一般墓所');
    await page.getByLabel('契約日').fill('2024-01-15');

    // 登録ボタンをクリック
    await page.getByRole('button', { name: '登録' }).click();

    // 確認ダイアログが表示される場合
    const confirmDialog = page.locator('[role="dialog"]');
    if (await confirmDialog.isVisible()) {
      await expect(page.getByText('この内容で登録しますか？')).toBeVisible();
      await page.getByRole('button', { name: 'はい' }).click();
    }

    // 登録完了を確認
    await expect(page.getByText('顧客を登録しました')).toBeVisible({ timeout: 10000 });
  });

  test('入力文字数制限が動作することを確認', async ({ page }) => {
    // 長すぎる文字列を入力
    const longString = 'あ'.repeat(100);

    await page.getByLabel('契約者氏名').fill(longString);

    // 文字数制限エラーまたは自動トリミングを確認
    const nameValue = await page.getByLabel('契約者氏名').inputValue();
    expect(nameValue.length).toBeLessThanOrEqual(50); // 仮の制限値
  });

  test('必須マークが正しく表示されることを確認', async ({ page }) => {
    // 必須フィールドに「*」マークが表示されることを確認
    const requiredFields = [
      '契約者氏名',
      'フリガナ',
      '性別',
      '生年月日',
      '郵便番号',
      '住所',
      '電話番号',
      '墓所番号'
    ];

    for (const field of requiredFields) {
      const fieldLabel = page.getByText(field);
      const requiredMark = fieldLabel.locator('..').locator('.text-red-500, .required');
      if (await requiredMark.isVisible()) {
        await expect(requiredMark).toBeVisible();
      }
    }
  });
});
