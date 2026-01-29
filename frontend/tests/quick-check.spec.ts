import { test } from '@playwright/test';

test('screenshot current state', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
  console.log('Screenshot saved to test-screenshot.png');
});
