const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiRequests = [];

  // Listen to all network requests
  page.on('request', request => {
    const url = request.url();
    if (!url.includes('google-analytics') &&
        !url.includes('doubleclick') &&
        !url.includes('youtube') &&
        !url.includes('.woff') &&
        !url.includes('.png') &&
        !url.includes('.jpg') &&
        !url.includes('.css')) {
      console.log('[REQUEST]', request.method(), url);
      apiRequests.push({
        method: request.method(),
        url: url
      });
    }
  });

  // Listen to all network responses with JSON or XML content
  page.on('response', async response => {
    const url = response.url();

    try {
      const contentType = response.headers()['content-type'] || '';

      if ((contentType.includes('application/json') ||
           contentType.includes('application/xml') ||
           contentType.includes('text/xml')) &&
          !url.includes('google') &&
          !url.includes('maps.googleapis')) {

        const body = await response.text();

        console.log('\n=== JSON/XML RESPONSE FOUND ===');
        console.log('URL:', url);
        console.log('Status:', response.status());
        console.log('Content-Type:', contentType);
        console.log('\nBody (first 2000 chars):');
        console.log(body.substring(0, 2000));
        console.log('=================================\n');
      }
    } catch (e) {
      // Ignore
    }
  });

  console.log('Navigating to Report Outage page...');
  await page.goto('https://www.nespower.com/my-account/outage-center/report-an-outage/', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  console.log('\nWaiting for page to load...');
  await page.waitForTimeout(10000);

  // Check for iframes
  console.log('\n=== CHECKING FOR IFRAMES ===');
  const frames = page.frames();
  frames.forEach((frame, index) => {
    console.log(`Frame ${index}: ${frame.url()}`);
  });

  // Take screenshot
  await page.screenshot({
    path: '/Users/jefffranzen/tn-power-tracker/report-outage-page.png',
    fullPage: true
  });

  console.log('\n=== SUMMARY ===');
  console.log(`Total requests captured: ${apiRequests.length}`);

  await browser.close();
})();
