const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiRequests = [];

  // Listen to all network requests
  page.on('request', request => {
    const url = request.url();
    const resourceType = request.resourceType();

    // Log all XHR and Fetch requests
    if (resourceType === 'xhr' || resourceType === 'fetch') {
      console.log('\n[REQUEST]', request.method(), url);
      apiRequests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });

  // Listen to all network responses
  page.on('response', async response => {
    const url = response.url();
    const request = response.request();
    const resourceType = request.resourceType();

    // Check XHR/Fetch responses that might contain outage data
    if (resourceType === 'xhr' || resourceType === 'fetch') {
      const contentType = response.headers()['content-type'] || '';

      if (contentType.includes('application/json')) {
        console.log('\n[RESPONSE]', response.status(), url);
        console.log('Content-Type:', contentType);

        try {
          const body = await response.text();

          // Look for keywords that indicate outage data
          if (body.includes('outage') ||
              body.includes('customer') ||
              body.includes('affected') ||
              body.includes('incident') ||
              body.length > 100) {
            console.log('\n=== POTENTIAL OUTAGE API FOUND ===');
            console.log('URL:', url);
            console.log('Status:', response.status());
            console.log('Headers:', response.headers());
            console.log('\nResponse Body (first 2000 chars):');
            console.log(body.substring(0, 2000));
            console.log('\n=================================\n');
          }
        } catch (e) {
          console.log('Could not read response body:', e.message);
        }
      }
    }
  });

  console.log('Navigating to NES outage page...');
  await page.goto('https://www.nespower.com/outages/', { waitUntil: 'networkidle' });

  console.log('\nWaiting for page to fully load and make API calls...');
  await page.waitForTimeout(5000);

  // Try to interact with the page to trigger additional API calls
  console.log('\nChecking for interactive elements...');
  await page.screenshot({ path: '/Users/jefffranzen/tn-power-tracker/nes-outage-page.png', fullPage: true });

  console.log('\n\n=== SUMMARY OF ALL API REQUESTS ===');
  apiRequests.forEach((req, index) => {
    console.log(`\n${index + 1}. ${req.method} ${req.url}`);
  });

  await browser.close();
})();
