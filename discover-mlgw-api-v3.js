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
    const method = request.method();

    // Log all requests to help find the API
    console.log(`📡 ${method} ${url}`);
  });

  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    const status = response.status();

    // Focus on JSON/GeoJSON/XML responses and anything with outage/data keywords
    if (contentType.includes('json') ||
        contentType.includes('xml') ||
        contentType.includes('geojson') ||
        url.includes('outage') ||
        url.includes('data') ||
        url.includes('api') ||
        url.includes('feature') ||
        url.includes('arcgis') ||
        url.includes('mapserver') ||
        url.includes('featureserver')) {

      console.log(`\n✅ ${status} ${url}`);
      console.log(`   Type: ${contentType}`);

      try {
        const responseBody = await response.text();
        const bodyLower = responseBody.toLowerCase();

        // Check for outage-related content
        const hasOutageData =
          bodyLower.includes('customer') ||
          bodyLower.includes('outage') ||
          bodyLower.includes('affected') ||
          bodyLower.includes('restored') ||
          bodyLower.includes('geometry') && bodyLower.includes('features');

        if (hasOutageData && responseBody.length > 100) {
          console.log(`   🎯 OUTAGE DATA DETECTED!`);

          const timestamp = Date.now();
          const filename = `/Users/jefffranzen/tn-power-tracker/mlgw-outage-data-${timestamp}.json`;

          const requestInfo = {
            url: url,
            method: response.request().method(),
            status: status,
            contentType: contentType,
            timestamp: new Date().toISOString(),
            savedFile: filename,
            size: responseBody.length,
            preview: responseBody.substring(0, 1000)
          };

          apiRequests.push(requestInfo);

          fs.writeFileSync(filename, responseBody, 'utf8');
          console.log(`   💾 Saved to: ${filename}`);
          console.log(`   Size: ${responseBody.length} bytes`);
          console.log(`   Preview:\n${responseBody.substring(0, 500)}...\n`);
        }
      } catch (e) {
        console.log(`   ⚠️  Error reading response: ${e.message}`);
      }
    }
  });

  console.log('🌐 Navigating to MLGW Outage Map...\n');

  try {
    await page.goto('https://outagemap.mlgw.org/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✅ Page loaded\n');

    // Wait for dynamic content to load
    console.log('⏳ Waiting for map and API calls to load...\n');
    await page.waitForTimeout(15000);

    // Take a screenshot
    await page.screenshot({
      path: '/Users/jefffranzen/tn-power-tracker/mlgw-outage-map-final.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved\n');

    // Check for iframes
    const frames = page.frames();
    console.log(`🔍 Found ${frames.length} frame(s)\n`);
    frames.forEach((frame, i) => {
      console.log(`Frame ${i}: ${frame.url()}`);
    });

  } catch (e) {
    console.log(`❌ Error loading page: ${e.message}\n`);
  }

  // Save discovery summary
  const summaryFile = '/Users/jefffranzen/tn-power-tracker/mlgw-api-final-summary.json';
  const summary = {
    discoveryTime: new Date().toISOString(),
    targetUrl: 'https://outagemap.mlgw.org/',
    apiEndpointsFound: apiRequests.length,
    endpoints: apiRequests
  };

  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n' + '='.repeat(80));
  console.log('📊 DISCOVERY SUMMARY');
  console.log('='.repeat(80));
  console.log(`Found ${apiRequests.length} API endpoint(s) with outage data\n`);

  if (apiRequests.length > 0) {
    console.log('🎯 DISCOVERED API ENDPOINTS:\n');
    apiRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.method} ${req.url}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Content-Type: ${req.contentType}`);
      console.log(`   Size: ${req.size} bytes`);
      console.log(`   Saved to: ${req.savedFile}\n`);
    });

    console.log('✅ API endpoint(s) discovered! Testing with curl...\n');

    // Test the first endpoint with curl
    const testEndpoint = apiRequests[0].url;
    console.log(`🧪 Testing endpoint: ${testEndpoint}\n`);

  } else {
    console.log('❌ No API endpoints discovered automatically.');
    console.log('💡 Keeping browser open for manual inspection...\n');
  }

  console.log('Summary saved to: ' + summaryFile);
  console.log('\n⏸️  Browser will stay open for 2 minutes for manual inspection.');
  console.log('Press Ctrl+C to close early.\n');

  await page.waitForTimeout(120000);
  await browser.close();
})();
