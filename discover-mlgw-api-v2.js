const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiRequests = [];
  let outageDataFound = false;

  // Monitor all network requests
  page.on('request', request => {
    const url = request.url();
    // Log interesting requests
    if (url.includes('outage') ||
        url.includes('api') ||
        url.includes('data') ||
        url.includes('json') ||
        url.includes('xml') ||
        url.includes('geojson') ||
        url.includes('feature')) {
      console.log(`\n📡 REQUEST: ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    // Look for any response that might contain outage data
    if (contentType.includes('json') ||
        contentType.includes('xml') ||
        contentType.includes('geojson') ||
        url.includes('outage') ||
        url.includes('feature') ||
        url.includes('layer') ||
        url.includes('arcgis') ||
        url.includes('mapserver') ||
        url.includes('featureserver')) {

      console.log(`\n✅ RESPONSE: ${response.status()} ${url}`);
      console.log(`   Content-Type: ${contentType}`);

      try {
        const responseBody = await response.text();
        const bodyLower = responseBody.toLowerCase();

        // Check if it contains outage-related data
        if (bodyLower.includes('outage') ||
            bodyLower.includes('customer') ||
            bodyLower.includes('affected') ||
            bodyLower.includes('restored') ||
            bodyLower.includes('geometry') ||
            bodyLower.includes('features')) {

          console.log(`   🎯 POTENTIAL OUTAGE DATA FOUND!`);
          outageDataFound = true;

          const timestamp = Date.now();
          const filename = `/Users/jefffranzen/tn-power-tracker/mlgw-data-${timestamp}.json`;

          apiRequests.push({
            url: url,
            method: response.request().method(),
            status: response.status(),
            contentType: contentType,
            timestamp: timestamp,
            savedFile: filename,
            preview: responseBody.substring(0, 500)
          });

          fs.writeFileSync(filename, responseBody, 'utf8');
          console.log(`   💾 Saved to: ${filename}`);
          console.log(`   Preview: ${responseBody.substring(0, 200)}...`);
        }
      } catch (e) {
        console.log(`   ⚠️  Could not read response: ${e.message}`);
      }
    }
  });

  console.log('🌐 Navigating to MLGW outage map...\n');

  await page.goto('https://www.mlgw.com/residential/outagemap', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('✅ Page loaded\n');
  await page.waitForTimeout(2000);

  // Look for the map link and click it
  console.log('🔍 Looking for outage map link...\n');

  try {
    // Try to find and click the "View the Electric Outage Summary Map" link
    const mapLink = page.locator('a:has-text("Electric Outage Summary Map")').first();

    if (await mapLink.count() > 0) {
      console.log('📍 Found map link, clicking...\n');
      await mapLink.click();
      await page.waitForTimeout(5000); // Wait for map to load
      console.log('✅ Map page loaded, waiting for data...\n');
      await page.waitForTimeout(10000); // Wait longer for API calls
    } else {
      console.log('⚠️  Map link not found on page\n');
    }
  } catch (e) {
    console.log(`⚠️  Error clicking map link: ${e.message}\n`);
  }

  // Take screenshots
  await page.screenshot({
    path: '/Users/jefffranzen/tn-power-tracker/mlgw-screenshot-1.png',
    fullPage: true
  });
  console.log('📸 Screenshot saved\n');

  // Try to find iframe with map
  const frames = page.frames();
  console.log(`🔍 Found ${frames.length} frames on page\n`);

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const frameUrl = frame.url();
    console.log(`Frame ${i}: ${frameUrl}`);

    if (frameUrl.includes('outage') || frameUrl.includes('map')) {
      console.log(`   🎯 This frame might contain the map!\n`);
    }
  }

  // Wait a bit more for any delayed API calls
  console.log('\n⏳ Waiting for additional network activity...\n');
  await page.waitForTimeout(10000);

  // Save summary
  const summaryFile = '/Users/jefffranzen/tn-power-tracker/mlgw-api-discovery-v2.json';
  const summary = {
    discoveryTime: new Date().toISOString(),
    outageDataFound: outageDataFound,
    apiEndpoints: apiRequests,
    pageUrl: page.url(),
    frameUrls: frames.map(f => f.url())
  };

  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\n📋 Summary saved to: ${summaryFile}`);
  console.log(`🔍 Found ${apiRequests.length} API endpoint(s) with potential outage data\n`);

  if (apiRequests.length > 0) {
    console.log('📡 DISCOVERED ENDPOINTS:\n');
    apiRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.method} ${req.url}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   File: ${req.savedFile}`);
      console.log(`   Preview: ${req.preview.substring(0, 150)}...\n`);
    });
  } else {
    console.log('❌ No outage data endpoints discovered. The map might use a different loading mechanism.\n');
    console.log('💡 Manual inspection needed - keeping browser open...\n');
  }

  // Keep browser open for manual inspection
  console.log('⏸️  Browser open for manual inspection. Check DevTools Network tab.');
  console.log('Press Ctrl+C when done.\n');
  await page.waitForTimeout(120000); // Wait 2 minutes

  await browser.close();
})();
