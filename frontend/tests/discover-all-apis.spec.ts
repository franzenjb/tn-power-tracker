import { test } from '@playwright/test';

// Helper function to capture API calls
async function captureAPIs(page: any, utilityName: string, url: string) {
  const apiCalls: any[] = [];

  page.on('request', (request: any) => {
    const reqUrl = request.url();
    // Look for JSON, data, API endpoints - be aggressive
    if (reqUrl.includes('.json') ||
        reqUrl.includes('/api/') ||
        reqUrl.includes('/data') ||
        reqUrl.includes('outage') ||
        reqUrl.includes('summary') ||
        reqUrl.includes('kubra') ||
        reqUrl.includes('thematic')) {
      console.log(`📡 ${utilityName} REQUEST:`, request.method(), reqUrl);
      apiCalls.push({ type: 'request', method: request.method(), url: reqUrl });
    }
  });

  page.on('response', async (response: any) => {
    const respUrl = response.url();
    if (respUrl.includes('.json') ||
        respUrl.includes('/api/') ||
        respUrl.includes('/data') ||
        respUrl.includes('outage') ||
        respUrl.includes('summary')) {
      console.log(`📥 ${utilityName} RESPONSE:`, response.status(), respUrl);
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          console.log(`📦 ${utilityName} JSON:`, JSON.stringify(data).substring(0, 300));
          apiCalls.push({ type: 'response', url: respUrl, status: response.status(), data });
        }
      } catch (e) {
        // Not JSON or error parsing
      }
    }
  });

  console.log(`\n=== ${utilityName.toUpperCase()} ===`);
  await page.goto(url, { timeout: 30000, waitUntil: 'networkidle' }).catch(() => {
    console.log(`⚠️ ${utilityName} - Page load timeout, continuing anyway`);
  });
  await page.waitForTimeout(8000);

  const screenshotName = utilityName.toLowerCase().replace(/\s+/g, '-') + '-map.png';
  await page.screenshot({ path: screenshotName, fullPage: true });

  console.log(`\n✅ ${utilityName} - Found ${apiCalls.length} potential API calls`);
  if (apiCalls.length > 0) {
    console.log(`🎯 ${utilityName} API ENDPOINTS:`, JSON.stringify(apiCalls.map(c => c.url).filter(u => u.includes('.json') || u.includes('/api/')), null, 2));
  }

  return apiCalls;
}

// Priority 1: Major Municipal Utilities (covers ~42% of TN)
test('Discover NES API (Nashville - 400k customers)', async ({ page }) => {
  await captureAPIs(page, 'NES', 'https://www.nespower.com/outages/');
});

test('Discover MLGW API (Memphis - 437k customers)', async ({ page }) => {
  // Try the direct outage map URL
  await captureAPIs(page, 'MLGW', 'https://outagemap.mlgw.org/');
});

test('Discover EPB API (Chattanooga - 180k customers)', async ({ page }) => {
  await captureAPIs(page, 'EPB', 'https://epb.com/outage-and-storm-center/energy-outages/');
});

// Priority 2: Largest Cooperatives (covers ~20% of TN)
test('Discover MTE API (Middle TN Electric - 9 counties)', async ({ page }) => {
  await captureAPIs(page, 'MTE', 'https://mtemc.outagemap.coop/');
});

test('Discover Duck River API (3 counties)', async ({ page }) => {
  await captureAPIs(page, 'Duck River', 'https://outagemap.dremc.com:8182/');
});

test('Discover Cumberland API (7 counties)', async ({ page }) => {
  await captureAPIs(page, 'Cumberland', 'https://cemc.org/outagemap/');
});

test('Discover Meriwether Lewis API (4 counties)', async ({ page }) => {
  await captureAPIs(page, 'Meriwether Lewis', 'https://mlecmn.outagemap.coop/');
});

test('Discover Volunteer Energy API (3 counties)', async ({ page }) => {
  await captureAPIs(page, 'Volunteer Energy', 'https://volunteer.outagemap.coop/');
});

// Priority 3: More cooperatives for coverage
test('Discover Sequachee Valley API (4 counties)', async ({ page }) => {
  await captureAPIs(page, 'Sequachee Valley', 'https://svalleyec.outagemap.coop/');
});

test('Discover Appalachian API (5 counties)', async ({ page }) => {
  await captureAPIs(page, 'Appalachian', 'https://aec.outagemap.coop/');
});

test('Discover Gibson API (4 counties)', async ({ page }) => {
  await captureAPIs(page, 'Gibson', 'https://gibsonconnect.outagemap.coop/');
});

test('Discover Tri-County API (7 counties)', async ({ page }) => {
  await captureAPIs(page, 'Tri-County', 'https://outages.tcemc.org/');
});

test('Discover Plateau API (4 counties)', async ({ page }) => {
  await captureAPIs(page, 'Plateau', 'https://map.pec.coop/');
});
