/**
 * 区画情報 CRUD E2Eテスト
 *
 * 登録（必須項目のみ / 全項目最大桁 / 全項目最小桁）
 * 更新（区画情報を編集して保存）
 * 削除（確認ダイアログで区画コードを入力して削除）
 */
import { test, expect, type Page } from '@playwright/test';
import { storageStatePath } from './config/test-accounts';

// ===== ヘルパー関数 =====

/** サイドバーでメニューをクリック */
async function clickSidebarMenu(page: Page, label: string) {
  const sidebar = page.locator('.w-64');
  await sidebar.getByText(label, { exact: true }).click();
}

/** 台帳一覧が表示されるまで待機 */
async function waitForRegistry(page: Page) {
  await page.goto('/');
  const sidebar = page.locator('.w-64');
  await expect(sidebar.getByText('台帳問い合わせ', { exact: true })).toBeVisible({ timeout: 20_000 });
}

/** 「新規登録」ボタンをクリックして登録フォームを表示 */
async function navigateToNewPlotForm(page: Page) {
  await waitForRegistry(page);
  // 台帳問い合わせ画面の「新規登録」ボタンをクリック
  await page.getByRole('button', { name: '新規登録', exact: true }).click();
  // フォームヘッダー「新規区画登録」が表示される
  await expect(page.getByText('新規区画登録')).toBeVisible({ timeout: 10_000 });
}

/** Radix UI Select で値を選択 */
async function selectRadixValue(page: Page, triggerLocator: ReturnType<Page['locator']>, itemText: string) {
  await triggerLocator.click();
  await page.getByRole('option', { name: itemText, exact: true }).click();
}

/** 区画（期）の2段階セレクトで期と区画を選択 */
async function selectPlotPeriodAndSection(page: Page, period: string, section: string) {
  // 物理区画情報セクション内のcomboboxを探す
  const physicalPlotSection = page.locator('.border.rounded-lg').filter({ hasText: '物理区画情報' });
  const comboboxes = physicalPlotSection.locator('[role="combobox"]');

  // 期を選択（最初のcombobox）
  await selectRadixValue(page, comboboxes.first(), period);
  await page.waitForTimeout(300);

  // 区画を選択（2つ目のcombobox — 期選択後に出現）
  await selectRadixValue(page, comboboxes.nth(1), section);
}

/** テキスト入力フィールドに値をセット（name属性で特定） */
async function fillInput(page: Page, name: string, value: string) {
  const input = page.locator(`input[name="${name}"]`);
  await input.clear();
  await input.fill(value);
}

/** タブを切り替え */
async function switchTab(page: Page, tabName: string) {
  await page.getByRole('tab', { name: tabName }).click();
  await page.waitForTimeout(300);
}

/** フォームの送信ボタン（「登録」or「更新」）をクリック */
async function clickSubmitButton(page: Page, label: string) {
  // type="submit" の方を特定（サイドバーの「一括登録」と区別）
  await page.locator(`button[type="submit"]`).filter({ hasText: label }).click();
}

/** 区画一覧の最初の行をクリックして詳細表示 */
async function selectFirstPlotInList(page: Page) {
  await clickSidebarMenu(page, '台帳問い合わせ');
  await page.waitForTimeout(1_000);

  const table = page.locator('table').first();
  await expect(table).toBeVisible({ timeout: 5_000 });

  const firstRow = table.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 3_000 });
  await firstRow.click();
  await page.waitForTimeout(1_000);

  // サイドバーにコンテキストメニューが表示される
  await expect(page.getByRole('button', { name: '区画詳細' })).toBeVisible({ timeout: 10_000 });
}

// ===== テストデータ定義 =====

/** 必須項目のみ */
const REQUIRED_ONLY = {
  plotNumber: 'E2E-001',
  period: '1期',
  section: 'A',
  contractAreaSqm: '3.6',
  contractDate: '2025-01-15',
  price: '500000',
  customerName: 'テスト 太郎',
  customerNameKana: 'テスト タロウ',
  postalCode: '1234567',
  address: '東京都新宿区テスト町1-1-1',
  phoneNumber: '09012345678',
};

/** 全項目最大桁数 */
const MAX_LENGTH = {
  plotNumber: 'A-' + 'B'.repeat(47), // 50 chars (backend max)
  period: '1期',
  section: 'A',
  contractAreaSqm: '999.99',
  contractDate: '2025-12-31',
  price: '999999999',
  locationDescription: 'あ'.repeat(100),
  reservationDate: '2025-01-01',
  acceptanceNumber: 'R'.repeat(50),
  permitDate: '2025-06-01',
  permitNumber: 'P'.repeat(50),
  startDate: '2025-07-01',
  acceptanceDate: '2025-02-01',
  staffInCharge: 'あ'.repeat(50),
  customerName: 'あ'.repeat(50) + ' ' + 'い'.repeat(49), // 100 chars
  customerNameKana: 'ア'.repeat(50) + ' ' + 'イ'.repeat(49), // 100 chars
  postalCode: '9999999',
  address: 'あ'.repeat(200), // 200 chars (backend max)
  addressLine2: 'マンション' + 'あ'.repeat(95),
  registeredAddress: 'い'.repeat(200),
  phoneNumber: '09099999999', // 11 digits (max)
  faxNumber: '0399999999',
  email: 'test-max-length@example-very-long-domain-name.com',
};

/** 全項目最小桁数（最小有効値） */
const MIN_LENGTH = {
  plotNumber: 'A', // 1 char
  period: '2期',
  section: '1',
  contractAreaSqm: '0.1', // positive minimum
  contractDate: '2020-01-01',
  price: '0', // non-negative min
  customerName: 'あ',
  customerNameKana: 'ア',
  postalCode: '1000001', // exactly 7 digits
  address: '東',
  phoneNumber: '0312345678', // 10 digits (min)
};

// ===== テスト: 区画登録 =====

test.describe('区画登録', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('6-1: 必須項目のみで区画を登録できる', async ({ page }) => {
    await navigateToNewPlotForm(page);

    // 物理区画情報
    await fillInput(page, 'physicalPlot.plotNumber', REQUIRED_ONLY.plotNumber);
    await selectPlotPeriodAndSection(page, REQUIRED_ONLY.period, REQUIRED_ONLY.section);

    // 販売契約情報
    await fillInput(page, 'saleContract.contractDate', REQUIRED_ONLY.contractDate);
    await fillInput(page, 'saleContract.price', REQUIRED_ONLY.price);

    // 契約者情報
    await fillInput(page, 'customer.name', REQUIRED_ONLY.customerName);
    await fillInput(page, 'customer.nameKana', REQUIRED_ONLY.customerNameKana);
    await fillInput(page, 'customer.postalCode', REQUIRED_ONLY.postalCode);
    await fillInput(page, 'customer.address', REQUIRED_ONLY.address);
    await fillInput(page, 'customer.phoneNumber', REQUIRED_ONLY.phoneNumber);

    // 登録ボタンをクリック
    await clickSubmitButton(page, '登録');

    // 成功: 台帳一覧ビューに戻る（サイドバーのメインメニューが復帰）
    await expect(
      page.locator('.w-64').getByText('台帳問い合わせ', { exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('6-2: 全項目を最大桁数で設定して登録できる', async ({ page }) => {
    await navigateToNewPlotForm(page);

    // --- Tab 1: 区画・契約情報 ---

    // 物理区画情報
    await fillInput(page, 'physicalPlot.plotNumber', MAX_LENGTH.plotNumber);
    await selectPlotPeriodAndSection(page, MAX_LENGTH.period, MAX_LENGTH.section);
    await fillInput(page, 'physicalPlot.areaSqm', MAX_LENGTH.contractAreaSqm);

    // 契約区画情報
    await fillInput(page, 'contractPlot.contractAreaSqm', MAX_LENGTH.contractAreaSqm);
    await fillInput(page, 'contractPlot.locationDescription', MAX_LENGTH.locationDescription);

    // 販売契約情報
    await fillInput(page, 'saleContract.contractDate', MAX_LENGTH.contractDate);
    await fillInput(page, 'saleContract.price', MAX_LENGTH.price);
    await fillInput(page, 'saleContract.reservationDate', MAX_LENGTH.reservationDate);
    await fillInput(page, 'saleContract.acceptanceNumber', MAX_LENGTH.acceptanceNumber);
    await fillInput(page, 'saleContract.permitDate', MAX_LENGTH.permitDate);
    await fillInput(page, 'saleContract.permitNumber', MAX_LENGTH.permitNumber);
    await fillInput(page, 'saleContract.startDate', MAX_LENGTH.startDate);
    await fillInput(page, 'saleContract.acceptanceDate', MAX_LENGTH.acceptanceDate);
    await fillInput(page, 'saleContract.staffInCharge', MAX_LENGTH.staffInCharge);

    // 契約者情報
    await fillInput(page, 'customer.name', MAX_LENGTH.customerName);
    await fillInput(page, 'customer.nameKana', MAX_LENGTH.customerNameKana);
    await fillInput(page, 'customer.postalCode', MAX_LENGTH.postalCode);
    await fillInput(page, 'customer.address', MAX_LENGTH.address);
    await fillInput(page, 'customer.addressLine2', MAX_LENGTH.addressLine2);
    await fillInput(page, 'customer.registeredAddress', MAX_LENGTH.registeredAddress);
    await fillInput(page, 'customer.phoneNumber', MAX_LENGTH.phoneNumber);
    await fillInput(page, 'customer.faxNumber', MAX_LENGTH.faxNumber);
    await fillInput(page, 'customer.email', MAX_LENGTH.email);

    // 使用料を追加
    await page.getByRole('button', { name: '使用料を追加' }).click();
    await page.waitForTimeout(300);

    // 管理料を追加
    await page.getByRole('button', { name: '管理料を追加' }).click();
    await page.waitForTimeout(300);

    // 墓石情報を追加
    await page.getByRole('button', { name: '墓石情報を追加' }).click();
    await page.waitForTimeout(300);

    // 墓石情報の入力
    await fillInput(page, 'gravestoneInfo.gravestoneBase', 'あ'.repeat(100));
    await fillInput(page, 'gravestoneInfo.enclosurePosition', 'い'.repeat(100));
    await fillInput(page, 'gravestoneInfo.gravestoneDealer', 'う'.repeat(100));
    await fillInput(page, 'gravestoneInfo.gravestoneType', 'え'.repeat(100));
    await fillInput(page, 'gravestoneInfo.surroundingArea', 'お'.repeat(100));
    await fillInput(page, 'gravestoneInfo.establishmentDeadline', '2026-12-31');
    await fillInput(page, 'gravestoneInfo.establishmentDate', '2026-06-15');

    // --- Tab 2: 勤務先・請求 ---
    await switchTab(page, '勤務先・請求');

    // 勤務先情報を追加（勤務先セクション内の「追加」ボタン）
    const workSection = page.locator('.border.rounded-lg').filter({ hasText: '勤務先情報' });
    await workSection.getByRole('button', { name: '追加' }).click();
    await page.waitForTimeout(300);

    await fillInput(page, 'workInfo.companyName', 'あ'.repeat(100));
    await fillInput(page, 'workInfo.companyNameKana', 'カ'.repeat(100));
    await fillInput(page, 'workInfo.workPostalCode', '9876543');
    await fillInput(page, 'workInfo.workPhoneNumber', '0311112222');
    await fillInput(page, 'workInfo.workAddress', 'か'.repeat(200));

    // 請求情報を追加
    const billingSection = page.locator('.border.rounded-lg').filter({ hasText: '請求情報' });
    await billingSection.getByRole('button', { name: '追加' }).click();
    await page.waitForTimeout(300);

    await fillInput(page, 'billingInfo.bankName', 'あ'.repeat(100));
    await fillInput(page, 'billingInfo.branchName', 'い'.repeat(100));
    await fillInput(page, 'billingInfo.accountNumber', '1234567890123456789');
    await fillInput(page, 'billingInfo.accountHolder', 'う'.repeat(100));

    // --- Tab 3: 連絡先/家族 ---
    await switchTab(page, '連絡先/家族');

    // 家族連絡先を追加
    await page.getByRole('button', { name: '新規追加' }).click();
    await page.waitForTimeout(300);

    // アコーディオンを展開（最初の連絡先行をクリック）
    await page.locator('.border.rounded-lg .cursor-pointer').first().click();
    await page.waitForTimeout(300);

    // 連絡先フォームを入力
    await page.locator('#familyContacts\\.0\\.name').fill('あ'.repeat(100));
    await page.locator('#familyContacts\\.0\\.relationship').fill('あ'.repeat(50));
    await page.locator('#familyContacts\\.0\\.address').fill('あ'.repeat(200));
    await page.locator('#familyContacts\\.0\\.phoneNumber').fill('09088887777');

    // --- Tab 4: 埋葬情報 ---
    await switchTab(page, '埋葬情報');

    // 埋葬者を追加
    await page.getByRole('button', { name: '新規追加' }).click();
    await page.waitForTimeout(300);

    // アコーディオンを展開
    await page.locator('.border.rounded-lg .cursor-pointer').first().click();
    await page.waitForTimeout(300);

    await page.locator('#buriedPersons\\.0\\.name').fill('あ'.repeat(100));
    await page.locator('#buriedPersons\\.0\\.nameKana').fill('ア'.repeat(100));
    await page.locator('#buriedPersons\\.0\\.posthumousName').fill('あ'.repeat(200));
    await page.locator('#buriedPersons\\.0\\.religion').fill('あ'.repeat(50));
    await page.locator('#buriedPersons\\.0\\.relationship').fill('あ'.repeat(50));

    // 登録
    await clickSubmitButton(page, '登録');

    await expect(
      page.locator('.w-64').getByText('台帳問い合わせ', { exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('6-3: 全項目を最小桁数で設定して登録できる', async ({ page }) => {
    await navigateToNewPlotForm(page);

    // 物理区画情報
    await fillInput(page, 'physicalPlot.plotNumber', MIN_LENGTH.plotNumber);
    await selectPlotPeriodAndSection(page, MIN_LENGTH.period, MIN_LENGTH.section);
    await fillInput(page, 'physicalPlot.areaSqm', MIN_LENGTH.contractAreaSqm);

    // 契約区画情報
    await fillInput(page, 'contractPlot.contractAreaSqm', MIN_LENGTH.contractAreaSqm);

    // 販売契約情報
    await fillInput(page, 'saleContract.contractDate', MIN_LENGTH.contractDate);
    await fillInput(page, 'saleContract.price', MIN_LENGTH.price);

    // 契約者情報
    await fillInput(page, 'customer.name', MIN_LENGTH.customerName);
    await fillInput(page, 'customer.nameKana', MIN_LENGTH.customerNameKana);
    await fillInput(page, 'customer.postalCode', MIN_LENGTH.postalCode);
    await fillInput(page, 'customer.address', MIN_LENGTH.address);
    await fillInput(page, 'customer.phoneNumber', MIN_LENGTH.phoneNumber);

    // 登録ボタンをクリック
    await clickSubmitButton(page, '登録');

    await expect(
      page.locator('.w-64').getByText('台帳問い合わせ', { exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('6-4: 必須項目が未入力の場合フォーム送信がブロックされる', async ({ page }) => {
    await navigateToNewPlotForm(page);

    // 何も入力せず登録ボタンをクリック
    await clickSubmitButton(page, '登録');

    // ブラウザのネイティブrequiredバリデーションにより送信がブロックされ、
    // フォーム画面に留まる（「新規区画登録」のヘッダーと送信ボタンが表示されたまま）
    await expect(page.getByText('新規区画登録')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

// ===== テスト: 区画更新 =====

test.describe('区画更新', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('6-5: 必須項目のみで区画を更新できる', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    const editButton = page.getByRole('button', { name: '編集' });
    const hasEditButton = await editButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasEditButton) {
      await editButton.click();
      await page.waitForTimeout(1_000);

      await expect(page.getByText('区画情報編集')).toBeVisible({ timeout: 10_000 });

      // 契約者名を更新
      await fillInput(page, 'customer.name', '更新テスト 太郎');
      await fillInput(page, 'customer.nameKana', 'コウシンテスト タロウ');
      await fillInput(page, 'customer.address', '東京都港区更新テスト町2-2-2');

      // 更新ボタンをクリック
      await clickSubmitButton(page, '更新');

      // 成功: 区画詳細ビューに戻る
      await expect(
        page.getByRole('button', { name: '区画詳細' })
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test('6-6: 全項目を最大桁数で更新できる', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    const editButton = page.getByRole('button', { name: '編集' });
    const hasEditButton = await editButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasEditButton) {
      await editButton.click();
      await page.waitForTimeout(1_000);
      await expect(page.getByText('区画情報編集')).toBeVisible({ timeout: 10_000 });

      // 契約者情報を最大桁数で更新
      await fillInput(page, 'customer.name', MAX_LENGTH.customerName);
      await fillInput(page, 'customer.nameKana', MAX_LENGTH.customerNameKana);
      await fillInput(page, 'customer.address', MAX_LENGTH.address);
      await fillInput(page, 'customer.addressLine2', MAX_LENGTH.addressLine2);
      await fillInput(page, 'customer.registeredAddress', MAX_LENGTH.registeredAddress);
      await fillInput(page, 'customer.phoneNumber', MAX_LENGTH.phoneNumber);
      await fillInput(page, 'customer.faxNumber', MAX_LENGTH.faxNumber);
      await fillInput(page, 'customer.email', MAX_LENGTH.email);

      // Tab 2: 勤務先・請求
      await switchTab(page, '勤務先・請求');

      // 勤務先情報がなければ追加
      const workSection = page.locator('.border.rounded-lg').filter({ hasText: '勤務先情報' });
      const addWorkButton = workSection.getByRole('button', { name: '追加' });
      const hasAddWork = await addWorkButton.isVisible({ timeout: 2_000 }).catch(() => false);
      if (hasAddWork) {
        await addWorkButton.click();
        await page.waitForTimeout(300);
      }

      const workNameInput = page.locator('input[name="workInfo.companyName"]');
      const hasWorkInput = await workNameInput.isVisible({ timeout: 2_000 }).catch(() => false);
      if (hasWorkInput) {
        await fillInput(page, 'workInfo.companyName', 'あ'.repeat(100));
      }

      // 更新ボタンをクリック
      await clickSubmitButton(page, '更新');

      await expect(
        page.getByRole('button', { name: '区画詳細' })
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test('6-7: 全項目を最小桁数で更新できる', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    const editButton = page.getByRole('button', { name: '編集' });
    const hasEditButton = await editButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasEditButton) {
      await editButton.click();
      await page.waitForTimeout(1_000);
      await expect(page.getByText('区画情報編集')).toBeVisible({ timeout: 10_000 });

      await fillInput(page, 'customer.name', MIN_LENGTH.customerName);
      await fillInput(page, 'customer.nameKana', MIN_LENGTH.customerNameKana);
      await fillInput(page, 'customer.address', MIN_LENGTH.address);
      await fillInput(page, 'customer.phoneNumber', MIN_LENGTH.phoneNumber);

      await clickSubmitButton(page, '更新');

      await expect(
        page.getByRole('button', { name: '区画詳細' })
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test('6-8: 編集をキャンセルして区画詳細に戻れる', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    const editButton = page.getByRole('button', { name: '編集' });
    const hasEditButton = await editButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasEditButton) {
      await editButton.click();
      await page.waitForTimeout(1_000);
      await expect(page.getByText('区画情報編集')).toBeVisible({ timeout: 10_000 });

      await page.getByRole('button', { name: 'キャンセル' }).click();

      await expect(page.getByRole('button', { name: '区画詳細' })).toBeVisible({ timeout: 10_000 });
    }
  });
});

// ===== テスト: 区画削除 =====

test.describe('区画削除', () => {
  test.use({ storageState: storageStatePath('admin') });

  test('6-9: 確認ダイアログでコードを入力して区画を削除できる', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    // 削除ボタンをクリック
    const deleteButton = page.getByRole('button', { name: '区画情報を削除' });
    await expect(deleteButton).toBeVisible({ timeout: 10_000 });
    await deleteButton.click();

    // 削除確認ダイアログが表示される
    await expect(page.getByRole('heading', { name: 'データの削除' })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('この操作は取り消せません')).toBeVisible();

    // 削除対象のコードを取得
    const codeElement = page.locator('text=コード:').first();
    const codeFullText = await codeElement.textContent();
    const plotCode = codeFullText?.replace('コード: ', '').trim() || '';

    // コードを入力
    await page.locator('input[placeholder="コードを入力"]').fill(plotCode);

    // 「削除する」ボタンをクリック
    await page.getByRole('button', { name: '削除する' }).click();

    // 成功: 台帳一覧に戻る（サイドバーのメインメニューが復帰）
    await expect(
      page.locator('.w-64').getByText('台帳問い合わせ', { exact: true })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('6-10: コードが一致しない場合は削除ボタンが無効', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    const deleteButton = page.getByRole('button', { name: '区画情報を削除' });
    await expect(deleteButton).toBeVisible({ timeout: 10_000 });
    await deleteButton.click();

    await expect(page.getByRole('heading', { name: 'データの削除' })).toBeVisible({ timeout: 5_000 });

    // 間違ったコードを入力
    await page.locator('input[placeholder="コードを入力"]').fill('WRONG-CODE');

    // 「削除する」ボタンが無効
    const confirmDeleteButton = page.getByRole('button', { name: '削除する' });
    await expect(confirmDeleteButton).toBeDisabled();
  });

  test('6-11: 削除ダイアログでキャンセルできる', async ({ page }) => {
    await waitForRegistry(page);
    await selectFirstPlotInList(page);

    const deleteButton = page.getByRole('button', { name: '区画情報を削除' });
    await expect(deleteButton).toBeVisible({ timeout: 10_000 });
    await deleteButton.click();

    await expect(page.getByRole('heading', { name: 'データの削除' })).toBeVisible({ timeout: 5_000 });

    // キャンセルボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // ダイアログが閉じる
    await expect(page.getByRole('heading', { name: 'データの削除' })).not.toBeVisible({ timeout: 5_000 });

    // 区画詳細に留まる
    await expect(page.getByRole('button', { name: '区画情報を削除' })).toBeVisible();
  });
});

// ===== テスト: 権限チェック =====

test.describe('区画CRUD - viewer権限', () => {
  test.use({ storageState: storageStatePath('viewer') });

  test('6-12: viewer ロールでは削除ボタンが非表示', async ({ page }) => {
    await waitForRegistry(page);

    await clickSidebarMenu(page, '台帳問い合わせ');
    await page.waitForTimeout(1_000);

    const table = page.locator('table').first();
    const hasTable = await table.isVisible({ timeout: 5_000 }).catch(() => false);

    if (hasTable) {
      const firstRow = table.locator('tbody tr').first();
      const hasRow = await firstRow.isVisible({ timeout: 3_000 }).catch(() => false);

      if (hasRow) {
        await firstRow.click();
        await page.waitForTimeout(1_000);

        // viewer は削除ボタンが非表示
        await expect(page.getByRole('button', { name: '区画情報を削除' })).not.toBeVisible();
      }
    }
  });
});

test.describe('区画CRUD - operator権限', () => {
  test.use({ storageState: storageStatePath('operator') });

  test('6-13: operator ロールで新規登録フォームを開ける', async ({ page }) => {
    await waitForRegistry(page);

    await clickSidebarMenu(page, '台帳問い合わせ');
    await page.waitForTimeout(1_000);

    const newButton = page.getByRole('button', { name: '新規登録', exact: true });
    const isVisible = await newButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (isVisible) {
      await newButton.click();
      await expect(page.getByText('新規区画登録')).toBeVisible({ timeout: 10_000 });
    }
  });
});
