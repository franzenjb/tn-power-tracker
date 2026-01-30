import { test } from '@playwright/test';

test('Research NES actual API', async ({ page }) => {
  const requests: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('outage') || url.includes('api') || url.includes('data') || url.includes('map')) {
      requests.push({
        url: url,
        method: request.method(),
        headers: request.headers()
      });
    }
  });

  console.log('\n=== NASHVILLE ELECTRIC SERVICE ===');
  await page.goto('https://www.nespower.com/outages-safety/outage-map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  console.log('API Requests found:');
  requests.forEach(req => {
    console.log(`${req.method} ${req.url}`);
  });

  requests.length = 0;
});

test('Research MLGW actual API', async ({ page }) => {
  const requests: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('outage') || url.includes('api') || url.includes('data') || url.includes('map')) {
      requests.push({
        url: url,
        method: request.method()
      });
    }
  });

  console.log('\n=== MEMPHIS LIGHT GAS & WATER ===');
  await page.goto('https://www.mlgw.com/outage-map', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  console.log('API Requests found:');
  requests.forEach(req => {
    console.log(`${req.method} ${req.url}`);
  });

  requests.length = 0;
});

test('Research EPB actual API', async ({ page }) => {
  const requests: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('outage') || url.includes('api') || url.includes('data') || url.includes('map')) {
      requests.push({
        url: url,
        method: request.method()
      });
    }
  });

  console.log('\n=== EPB CHATTANOOGA ===');
  await page.goto('https://epb.com/outages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  console.log('API Requests found:');
  requests.forEach(req => {
    console.log(`${req.method} ${req.url}`);
  });

  requests.length = 0;
});

test('Research KUB actual API', async ({ page }) => {
  const requests: any[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('outage') || url.includes('api') || url.includes('data') || url.includes('map') || url.includes('kub')) {
      requests.push({
        url: url,
        method: request.method()
      });
    }
  });

  console.log('\n=== KNOXVILLE UTILITIES BOARD ===');
  await page.goto('https://www.kub.org/outages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  console.log('API Requests found:');
  requests.forEach(req => {
    console.log(`${req.method} ${req.url}`);
  });
});
