import { test, expect } from '@playwright/test';

test('verify Tennessee dashboard works', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(5000); // Wait for API calls
  
  // Take screenshot
  await page.screenshot({ path: 'tennessee-dashboard-working.png', fullPage: true });

  // Check title
  await expect(page.locator('h1')).toContainText('Tennessee Power Outage Tracker');

  // Check that we have data loaded
  const customersOut = await page.locator('text=Total Customers Out').locator('..').locator('div').nth(1).textContent();
  console.log('Customers Out:', customersOut);

  // Check table exists with utilities
  const tableRows = await page.locator('tbody tr').count();
  console.log('Utilities in table:', tableRows);
  expect(tableRows).toBeGreaterThan(0);

  // Check for Tennessee utilities
  await expect(page.locator('text=NES (Nashville)')).toBeVisible();

  console.log('Errors found:', errors.filter(e => !e.includes('DevTools') && !e.includes('favicon')));
});
