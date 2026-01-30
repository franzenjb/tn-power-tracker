import { test } from '@playwright/test';
import * as fs from 'fs';

// Load top 50 utilities
const utilities = [
  { rank: 1, name: "Florida Power & Light", state: "FL", customers: 5800000, url: "https://www.fpl.com/outages/outage-map.html" },
  { rank: 2, name: "Pacific Gas & Electric", state: "CA", customers: 5500000, url: "https://pgealerts.alerts.pge.com/outagecenter/" },
  { rank: 3, name: "Southern California Edison", state: "CA", customers: 5200000, url: "https://www.sce.com/outage-center/check-outage-status" },
  { rank: 5, name: "ComEd", state: "IL", customers: 4000000, url: "https://outagemap.comed.com/" },
  { rank: 6, name: "Oncor", state: "TX", customers: 3900000, url: "https://stormcenter.oncor.com/" },
  { rank: 7, name: "Con Edison", state: "NY", customers: 3500000, url: "https://www.coned.com/en/outages" },
  { rank: 8, name: "Georgia Power", state: "GA", customers: 2700000, url: "https://outagemap.georgiapower.com/" },
  { rank: 9, name: "CenterPoint Energy", state: "TX", customers: 2700000, url: "https://www.centerpointenergy.com/en-us/residential/customer-service/electric-outage-center" },
  { rank: 10, name: "Dominion Energy Virginia", state: "VA", customers: 2700000, url: "https://www.dominionenergy.com/outages/outage-map" },
  { rank: 11, name: "Duke Energy Carolinas", state: "NC", customers: 2600000, url: "https://outagemap.duke-energy.com/" },
  { rank: 12, name: "PSE&G", state: "NJ", customers: 2300000, url: "https://nj.pseg.com/outages/outagemap" },
  { rank: 13, name: "DTE Energy", state: "MI", customers: 2200000, url: "https://outage.dteenergy.com/" },
  { rank: 14, name: "Duke Energy Florida", state: "FL", customers: 1900000, url: "https://outagemap.duke-energy.com/" },
  { rank: 15, name: "Consumers Energy", state: "MI", customers: 1800000, url: "https://www.consumersenergy.com/outagemap" },
  { rank: 16, name: "PECO Energy", state: "PA", customers: 1700000, url: "https://www.peco.com/outages/outage-map" },
  { rank: 17, name: "National Grid NY", state: "NY", customers: 1700000, url: "https://www.nationalgridus.com/Upstate-NY-Home/Outages/Outage-Map" },
  { rank: 18, name: "Los Angeles DWP", state: "CA", customers: 1600000, url: "https://www.ladwp.com/outages" },
  { rank: 19, name: "Duke Energy Progress", state: "NC", customers: 1600000, url: "https://outagemap.duke-energy.com/" },
  { rank: 20, name: "Eversource MA", state: "MA", customers: 1500000, url: "https://www.eversource.com/content/ema-c/residential/outages/current-outages" },
  { rank: 21, name: "AEP Ohio", state: "OH", customers: 1500000, url: "https://outagemap.aepohio.com/" },
  // Add more as needed...
];

async function discoverAPI(page: any, utility: any) {
  const apis: any[] = [];

  page.on('response', async (response: any) => {
    const url = response.url();
    if (url.includes('.json') || url.includes('/api/') || url.includes('summary') || url.includes('outage')) {
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          apis.push({ url, preview: JSON.stringify(data).substring(0, 300) });
          console.log(`  📦 [${utility.name}] Found JSON: ${url}`);
        }
      } catch (e) {}
    }
  });

  console.log(`\n🔍 [${utility.rank}] ${utility.name} (${(utility.customers / 1000000).toFixed(1)}M customers)`);

  try {
    await page.goto(utility.url, { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);
  } catch (e) {
    console.log(`  ⚠️ Page load timeout/error`);
  }

  // Save results
  const result = {
    rank: utility.rank,
    name: utility.name,
    state: utility.state,
    customers: utility.customers,
    url: utility.url,
    apis_found: apis.length,
    apis: apis
  };

  fs.writeFileSync(
    `/tmp/api_discovery_${utility.rank.toString().padStart(4, '0')}_${utility.name.replace(/ /g, '_')}.json`,
    JSON.stringify(result, null, 2)
  );

  console.log(`  ✅ ${apis.length} API endpoints discovered`);

  return result;
}

// Create a test for each utility (Playwright will run them in parallel)
utilities.forEach(utility => {
  test(`Discover API: [${utility.rank}] ${utility.name}`, async ({ page }) => {
    await discoverAPI(page, utility);
  });
});
