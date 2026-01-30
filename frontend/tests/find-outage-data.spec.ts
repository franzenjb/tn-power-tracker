import { test } from '@playwright/test';

test('Reverse-engineer NES API', async ({ page }) => {
  console.log('\n=== NASHVILLE ELECTRIC SERVICE ===');

  const apiCalls: any[] = [];

  // Intercept all network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📡 REQUEST:', request.method(), url);
      apiCalls.push({ type: 'request', method: request.method(), url });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📥 RESPONSE:', response.status(), url);
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          console.log('📦 JSON DATA:', JSON.stringify(data, null, 2).substring(0, 500));
          apiCalls.push({ type: 'response', url, status: response.status(), data });
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  });

  await page.goto('https://www.nespower.com/outages/');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'nes-outage-map.png', fullPage: true });

  console.log(`\n✅ Found ${apiCalls.length} API calls`);
  console.log('API CALLS:', JSON.stringify(apiCalls, null, 2));
});

test('Reverse-engineer MLGW API', async ({ page }) => {
  console.log('\n=== MEMPHIS LIGHT GAS & WATER ===');

  const apiCalls: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📡 REQUEST:', request.method(), url);
      apiCalls.push({ type: 'request', method: request.method(), url });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📥 RESPONSE:', response.status(), url);
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          console.log('📦 JSON DATA:', JSON.stringify(data, null, 2).substring(0, 500));
          apiCalls.push({ type: 'response', url, status: response.status(), data });
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  });

  await page.goto('https://www.mlgw.com/residential/outagemap');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'mlgw-outage-map.png', fullPage: true });

  console.log(`\n✅ Found ${apiCalls.length} API calls`);
  console.log('API CALLS:', JSON.stringify(apiCalls, null, 2));
});

test('Reverse-engineer EPB API', async ({ page }) => {
  console.log('\n=== EPB CHATTANOOGA ===');

  const apiCalls: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📡 REQUEST:', request.method(), url);
      apiCalls.push({ type: 'request', method: request.method(), url });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📥 RESPONSE:', response.status(), url);
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          console.log('📦 JSON DATA:', JSON.stringify(data, null, 2).substring(0, 500));
          apiCalls.push({ type: 'response', url, status: response.status(), data });
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  });

  await page.goto('https://epb.com/outage-and-storm-center/energy-outages/');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'epb-outage-map.png', fullPage: true });

  console.log(`\n✅ Found ${apiCalls.length} API calls`);
  console.log('API CALLS:', JSON.stringify(apiCalls, null, 2));
});

test('Reverse-engineer KUB API', async ({ page }) => {
  console.log('\n=== KNOXVILLE UTILITIES BOARD ===');

  const apiCalls: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📡 REQUEST:', request.method(), url);
      apiCalls.push({ type: 'request', method: request.method(), url });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('outage') || url.includes('data')) {
      console.log('📥 RESPONSE:', response.status(), url);
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          console.log('📦 JSON DATA:', JSON.stringify(data, null, 2).substring(0, 500));
          apiCalls.push({ type: 'response', url, status: response.status(), data });
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  });

  await page.goto('https://www.kub.org/outage/map');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'kub-outage-map.png', fullPage: true });

  console.log(`\n✅ Found ${apiCalls.length} API calls`);
  console.log('API CALLS:', JSON.stringify(apiCalls, null, 2));
});
