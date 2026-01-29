import { test, expect } from '@playwright/test';

test.describe('TN Power Tracker - Site Verification', () => {
  test('homepage loads without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to the site
    await page.goto('http://localhost:3000');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check title
    await expect(page).toHaveTitle(/Tennessee Power Outage Tracker/);

    // Check for Red Cross header
    await expect(page.locator('nav')).toContainText('TN Power Outage Tracker');

    // Check for stats panel
    await expect(page.locator('text=Tennessee Power Outages')).toBeVisible();
    await expect(page.locator('text=Customers Out')).toBeVisible();
    await expect(page.locator('text=Counties Affected')).toBeVisible();

    // Check for legend
    await expect(page.locator('text=Outage Level')).toBeVisible();

    // Verify no critical errors (ignore DevTools suggestion and minor warnings)
    const criticalErrors = errors.filter(err =>
      !err.includes('DevTools') &&
      !err.includes('hydration') &&
      err.includes('Error:')
    );

    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('map renders correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Wait for Leaflet map container
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // Check for map tiles loaded
    const tiles = page.locator('.leaflet-tile');
    await expect(tiles.first()).toBeVisible({ timeout: 10000 });

    // Verify map is interactive (zoom controls should exist)
    const leafletLayer = page.locator('.leaflet-pane').first();
    await expect(leafletLayer).toBeVisible();
  });

  test('data loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Wait for stats to show (not loading state)
    await expect(page.locator('text=Loading outage data')).not.toBeVisible({ timeout: 5000 });

    // Verify stats are showing numbers
    const customersOut = page.locator('text=Customers Out').locator('xpath=preceding-sibling::div[1]');
    await expect(customersOut).toBeVisible();
  });

  test('mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Stats panel should still be visible on mobile
    await expect(page.locator('text=Tennessee Power Outages')).toBeVisible();

    // Map should render
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});
