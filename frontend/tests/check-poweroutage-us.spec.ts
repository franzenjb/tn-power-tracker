import { test } from '@playwright/test';

test('Check PowerOutage.us for Tennessee data', async ({ page }) => {
  const apiCalls: string[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('json') || url.includes('data') || url.includes('poweroutage')) {
      console.log('📡 REQUEST:', request.method(), url);
      apiCalls.push(url);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('data')) {
      console.log('📥 RESPONSE:', response.status(), url);
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          console.log('📦 JSON DATA:', JSON.stringify(data).substring(0, 1000));
        }
      } catch (e) {}
    }
  });

  console.log('\n=== LOADING POWEROUTAGE.US/TENNESSEE ===');
  await page.goto('https://poweroutage.us/area/state/tennessee');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'poweroutage-us-tennessee.png', fullPage: true });

  console.log('\n✅ Found API calls:', apiCalls.length);
  if (apiCalls.length > 0) {
    console.log('API URLs:', JSON.stringify(apiCalls, null, 2));
  }

  // Check for embedded data
  const pageContent = await page.content();
  const jsonMatches = pageContent.match(/<script[^>]*>[\s\S]*?var\s+\w+\s*=\s*(\{[\s\S]*?\});?[\s\S]*?<\/script>/gi);
  if (jsonMatches) {
    console.log('\n📄 Found embedded JavaScript data blocks:', jsonMatches.length);
  }
});
