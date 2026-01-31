const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiRequests = [];

  // Listen to all network requests
  page.on('request', request => {
    apiRequests.push({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType()
    });
  });

  // Listen to all network responses
  page.on('response', async response => {
    const url = response.url();
    const request = response.request();

    try {
      const contentType = response.headers()['content-type'] || '';
      const body = await response.text();

      // Look for outage-related data
      if (body.includes('customersAffected') ||
          body.includes('outageCount') ||
          body.includes('customers_out') ||
          body.includes('incidents') ||
          body.includes('customers_affected') ||
          (url.includes('outage') || url.includes('storm') || url.includes('oms'))) {
        console.log('\n=== POTENTIAL OUTAGE API FOUND ===');
        console.log('URL:', url);
        console.log('Status:', response.status());
        console.log('Content-Type:', contentType);
        console.log('\nResponse Body:');
        console.log(body);
        console.log('=================================\n');
      }
    } catch (e) {
      // Some responses can't be read as text
    }
  });

  console.log('Navigating to NES Storm Center page...');
  await page.goto('https://www.nespower.com/outages/storm-center/', { waitUntil: 'networkidle' });

  console.log('\nWaiting for page to fully load...');
  await page.waitForTimeout(10000);

  // Take screenshot
  await page.screenshot({ path: '/Users/jefffranzen/tn-power-tracker/storm-center-page.png', fullPage: true });

  // Check for data embedded in window object
  console.log('\n=== CHECKING FOR EMBEDDED DATA ===');
  const embeddedData = await page.evaluate(() => {
    const data = {
      windowKeys: Object.keys(window).filter(k =>
        k.toLowerCase().includes('outage') ||
        k.toLowerCase().includes('storm') ||
        k.toLowerCase().includes('oms')
      ),
      globalVars: []
    };

    // Check for common variable patterns
    const patterns = ['outageData', 'stormData', 'omsData', 'mapData', 'config', 'nesData'];
    patterns.forEach(pattern => {
      if (window[pattern]) {
        data.globalVars.push({ name: pattern, value: window[pattern] });
      }
    });

    return data;
  });
  console.log('Embedded data:', JSON.stringify(embeddedData, null, 2));

  console.log('\n\n=== ALL API REQUESTS ===');
  apiRequests
    .filter(req => !req.url.includes('google-analytics') &&
                   !req.url.includes('doubleclick') &&
                   !req.url.includes('youtube') &&
                   !req.url.includes('.css') &&
                   !req.url.includes('.woff') &&
                   !req.url.includes('.png') &&
                   !req.url.includes('.jpg'))
    .forEach((req, index) => {
      console.log(`\n${index + 1}. ${req.method} ${req.resourceType}`);
      console.log(`   ${req.url}`);
    });

  await browser.close();
})();
