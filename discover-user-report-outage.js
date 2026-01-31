const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiCalls = [];

  // Capture all requests
  page.on('request', request => {
    apiCalls.push({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType()
    });
  });

  // Capture responses with potential outage data
  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';

    try {
      if (contentType.includes('application/json') ||
          contentType.includes('application/xml') ||
          contentType.includes('text/xml')) {

        const body = await response.text();

        // Check if this looks like outage data
        if (body.includes('outage') ||
            body.includes('customer') ||
            body.includes('incident') ||
            body.includes('affected') ||
            body.includes('polygon') ||
            body.includes('coordinates') ||
            body.length > 500) {

          console.log('\n========== API RESPONSE FOUND ==========');
          console.log('URL:', url);
          console.log('Status:', response.status());
          console.log('Content-Type:', contentType);
          console.log('\nResponse body preview (first 3000 chars):');
          console.log(body.substring(0, 3000));
          console.log('========================================\n');
        }
      }
    } catch (e) {
      // Ignore
    }
  });

  console.log('Navigating to /user/report-outage...');
  try {
    await page.goto('https://www.nespower.com/user/report-outage', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
  } catch (e) {
    console.log('Error navigating:', e.message);
  }

  console.log('\nWaiting for dynamic content to load...');
  await page.waitForTimeout(15000);

  // Check for iframes
  console.log('\n=== IFRAMES ===');
  const frames = page.frames();
  frames.forEach((frame, index) => {
    console.log(`Frame ${index}: ${frame.url()}`);
  });

  // Take screenshot
  await page.screenshot({
    path: '/Users/jefffranzen/tn-power-tracker/user-report-outage.png',
    fullPage: true
  });

  // Check for window variables
  const windowVars = await page.evaluate(() => {
    const vars = {};
    const keys = Object.keys(window);
    const interesting = keys.filter(k =>
      k.toLowerCase().includes('outage') ||
      k.toLowerCase().includes('map') ||
      k.toLowerCase().includes('data') ||
      k.toLowerCase().includes('config')
    );
    interesting.forEach(k => {
      try {
        vars[k] = typeof window[k];
      } catch (e) {
        vars[k] = 'error';
      }
    });
    return vars;
  });

  console.log('\n=== WINDOW VARIABLES ===');
  console.log(JSON.stringify(windowVars, null, 2));

  console.log('\n=== SUMMARY OF API CALLS ===');
  const relevantCalls = apiCalls.filter(c =>
    !c.url.includes('google-analytics') &&
    !c.url.includes('doubleclick') &&
    !c.url.includes('youtube') &&
    !c.url.includes('.woff') &&
    !c.url.includes('.css') &&
    (c.resourceType === 'xhr' || c.resourceType === 'fetch' || c.url.includes('api'))
  );

  relevantCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.method} ${call.url}`);
  });

  await browser.close();
})();
