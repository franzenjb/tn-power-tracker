const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const apiRequests = [];
  const allResponses = [];

  // Listen to all network requests
  page.on('request', request => {
    const url = request.url();
    const resourceType = request.resourceType();

    apiRequests.push({
      method: request.method(),
      url: url,
      resourceType: resourceType,
      headers: request.headers(),
      postData: request.postData()
    });
  });

  // Listen to all network responses
  page.on('response', async response => {
    const url = response.url();
    const request = response.request();
    const status = response.status();

    try {
      const contentType = response.headers()['content-type'] || '';
      const body = await response.text();

      allResponses.push({
        url: url,
        status: status,
        contentType: contentType,
        bodyLength: body.length,
        hasOutageKeyword: body.toLowerCase().includes('outage') ||
                          body.toLowerCase().includes('customer') ||
                          body.toLowerCase().includes('incident')
      });

      // Look for potential outage data
      if (body.toLowerCase().includes('outage') ||
          body.toLowerCase().includes('customer') ||
          body.toLowerCase().includes('incident') ||
          body.toLowerCase().includes('affected')) {
        console.log('\n=== POTENTIAL OUTAGE DATA FOUND ===');
        console.log('URL:', url);
        console.log('Status:', status);
        console.log('Content-Type:', contentType);
        console.log('\nBody preview (first 3000 chars):');
        console.log(body.substring(0, 3000));
        console.log('=================================\n');
      }
    } catch (e) {
      // Some responses can't be read as text
    }
  });

  console.log('Navigating to NES outage page...');
  await page.goto('https://www.nespower.com/outages/', { waitUntil: 'networkidle' });

  console.log('\nWaiting for page to load completely...');
  await page.waitForTimeout(8000);

  // Check for iframes
  console.log('\n=== CHECKING FOR IFRAMES ===');
  const frames = page.frames();
  console.log(`Found ${frames.length} frames on the page`);
  frames.forEach((frame, index) => {
    console.log(`Frame ${index}: ${frame.url()}`);
  });

  // Look for embedded scripts or data in the page
  console.log('\n=== CHECKING PAGE SOURCE FOR EMBEDDED DATA ===');
  const pageContent = await page.content();

  // Look for common patterns in the HTML
  const patterns = [
    /https?:\/\/[^\s"'<>]+outage[^\s"'<>]*/gi,
    /https?:\/\/[^\s"'<>]+api[^\s"'<>]*/gi,
    /"url"\s*:\s*"([^"]+)"/gi,
    /"endpoint"\s*:\s*"([^"]+)"/gi,
    /"apiUrl"\s*:\s*"([^"]+)"/gi,
  ];

  patterns.forEach((pattern, index) => {
    const matches = [...pageContent.matchAll(pattern)];
    if (matches.length > 0) {
      console.log(`\nPattern ${index + 1} matches:`);
      matches.forEach(match => console.log('  ', match[0]));
    }
  });

  // Look for script tags with embedded JSON data
  const scriptContents = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.map(script => script.textContent).filter(content =>
      content && (
        content.includes('outage') ||
        content.includes('customer') ||
        content.includes('api') ||
        content.includes('endpoint')
      )
    );
  });

  if (scriptContents.length > 0) {
    console.log('\n=== SCRIPTS WITH POTENTIAL API REFERENCES ===');
    scriptContents.forEach((content, index) => {
      console.log(`\nScript ${index + 1} (first 1000 chars):`);
      console.log(content.substring(0, 1000));
    });
  }

  // Check for map-related elements
  console.log('\n=== CHECKING FOR MAP ELEMENTS ===');
  const mapInfo = await page.evaluate(() => {
    const mapElements = document.querySelectorAll('[class*="map"], [id*="map"]');
    return Array.from(mapElements).map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      src: el.src || null,
      innerHTML: el.innerHTML.substring(0, 200)
    }));
  });
  console.log(JSON.stringify(mapInfo, null, 2));

  await page.screenshot({
    path: '/Users/jefffranzen/tn-power-tracker/nes-outage-page-full.png',
    fullPage: true
  });

  console.log('\n\n=== ALL NETWORK REQUESTS SUMMARY ===');
  apiRequests
    .filter(req => !req.url.includes('google-analytics') &&
                   !req.url.includes('doubleclick') &&
                   !req.url.includes('youtube'))
    .forEach((req, index) => {
      console.log(`\n${index + 1}. ${req.method} ${req.resourceType}`);
      console.log(`   ${req.url}`);
    });

  console.log('\n\n=== RESPONSES WITH POTENTIAL OUTAGE DATA ===');
  allResponses
    .filter(res => res.hasOutageKeyword)
    .forEach(res => {
      console.log(`\nURL: ${res.url}`);
      console.log(`Status: ${res.status}, Type: ${res.contentType}, Size: ${res.bodyLength}`);
    });

  await browser.close();
})();
