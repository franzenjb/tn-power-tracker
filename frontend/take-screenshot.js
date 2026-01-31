const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Loading Tennessee dashboard...');
  await page.goto('http://localhost:3000');
  
  console.log('Waiting for data to load...');
  await page.waitForTimeout(5000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'tennessee-dashboard.png', fullPage: true });
  
  // Get some stats
  const html = await page.content();
  console.log('\nPage loaded successfully!');
  
  await browser.close();
  console.log('Screenshot saved to: tennessee-dashboard.png');
})();
