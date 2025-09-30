import { test, expect } from '@playwright/test';

test.describe('合祀申込機能', () => {
  test('新規合祀申込を登録できる', async ({ page }) => {
    await page.goto('/');

    await page.getByText('合祀管理', { exact: true }).click();
    await expect(page.getByText('合祀管理メニュー')).toBeVisible();

    await page.getByRole('button', { name: '合祀申込' }).click();
    await expect(page.getByText('合祀の新規申込を登録します')).toBeVisible();

    const representative = '長女（代理人）';
    const applicantName = '佐藤 太郎';
    const applicantKana = 'サトウ タロウ';
    const applicantPhone = '090-1111-2222';
    const applicantAddress = '東京都港区赤坂1-1-1';
    const personName = '佐藤 花子';
    const personKana = 'サトウ ハナコ';

    await page.locator('#mainRepresentative').fill(representative);
    await page.locator('#plotSection').fill('東区');
    await page.locator('#plotNumber').fill('C-123');

    await page.locator('#applicantName').fill(applicantName);
    await page.locator('#applicantNameKana').fill(applicantKana);
    await page.locator('#applicantPhone').fill(applicantPhone);
    await page.locator('#applicantAddress').fill(applicantAddress);

    await page.locator('#persons-0-name').fill(personName);
    await page.locator('#persons-0-nameKana').fill(personKana);
    await page.locator('#persons-0-relationship').fill('母');
    await page.locator('#persons-0-deathDate').fill('2024-03-15');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('合祀申込を登録しました');
      await dialog.accept();
    });

    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('申込ID')).toBeVisible();

    await page.getByRole('button', { name: '合祀実施記録' }).click();
    await expect(page.getByText(`申込者: ${applicantName}`)).toBeVisible();
    await expect(page.getByText(representative)).toBeVisible();
  });
});
