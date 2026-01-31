const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiRequests = [];

  // Monitor all network requests
  page.on('request', request => {
    const url = request.url();
    // Look for potential API endpoints
    if (url.includes('outage') || url.includes('api') || url.includes('json') || url.includes('data')) {
      console.log(`\n📡 REQUEST: ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    // Look for JSON responses that might contain outage data
    if (contentType.includes('application/json') ||
        url.includes('outage') ||
        url.includes('api') ||
        url.includes('data')) {

      console.log(`\n✅ RESPONSE: ${response.status()} ${url}`);
      console.log(`   Content-Type: ${contentType}`);

      try {
        const responseBody = await response.text();

        // Check if it looks like outage data
        if (responseBody.includes('outage') ||
            responseBody.includes('customer') ||
            responseBody.includes('affected') ||
            responseBody.includes('count')) {

          console.log(`   🎯 POTENTIAL OUTAGE DATA FOUND!`);

          apiRequests.push({
            url: url,
            method: response.request().method(),
            status: response.status(),
            contentType: contentType,
            headers: response.headers(),
            body: responseBody.substring(0, 2000) // First 2000 chars
          });

          // Save the full response
          const filename = `/Users/jefffranzen/tn-power-tracker/mlgw-api-response-${Date.now()}.json`;
          fs.writeFileSync(filename, responseBody, 'utf8');
          console.log(`   💾 Saved full response to: ${filename}`);
        }
      } catch (e) {
        console.log(`   ⚠️  Could not read response body: ${e.message}`);
      }
    }
  });

  console.log('🌐 Navigating to MLGW outage map...\n');

  // Try the main site first
  try {
    await page.goto('https://www.mlgw.com/residential/outagemap', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✅ Loaded: https://www.mlgw.com/residential/outagemap');
  } catch (e) {
    console.log('⚠️  Main site failed, trying alternate URL...');
    try {
      await page.goto('https://outagemap.mlgw.org/', {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      console.log('✅ Loaded: https://outagemap.mlgw.org/');
    } catch (e2) {
      console.log('❌ Both URLs failed');
    }
  }

  // Wait a bit more for dynamic content to load
  console.log('\n⏳ Waiting for dynamic content to load...');
  await page.waitForTimeout(5000);

  // Take a screenshot
  await page.screenshot({
    path: '/Users/jefffranzen/tn-power-tracker/mlgw-outage-map.png',
    fullPage: true
  });
  console.log('📸 Screenshot saved to: mlgw-outage-map.png');

  // Save summary of all API requests found
  const summaryFile = '/Users/jefffranzen/tn-power-tracker/mlgw-api-summary.json';
  fs.writeFileSync(summaryFile, JSON.stringify(apiRequests, null, 2), 'utf8');
  console.log(`\n📋 API Summary saved to: ${summaryFile}`);
  console.log(`\n🔍 Found ${apiRequests.length} potential API endpoints`);

  if (apiRequests.length > 0) {
    console.log('\n📡 API ENDPOINTS DISCOVERED:');
    apiRequests.forEach((req, i) => {
      console.log(`\n${i + 1}. ${req.method} ${req.url}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Preview: ${req.body.substring(0, 200)}...`);
    });
  }

  // Keep browser open for manual inspection
  console.log('\n⏸️  Browser kept open for manual inspection. Press Ctrl+C to close.');
  await page.waitForTimeout(60000); // Wait 1 minute before auto-closing

  await browser.close();
})();
