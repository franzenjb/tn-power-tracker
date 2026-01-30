import { test } from '@playwright/test';
import * as fs from 'fs';

const utilities = [
  { rank: 22, name: "San Diego Gas & Electric", state: "CA", customers: 1500000, url: "https://www.sdge.com/residential/customer-service/outage-center" },
  { rank: 23, name: "Alabama Power", state: "AL", customers: 1500000, url: "https://outagemap.alabamapower.com/" },
  { rank: 24, name: "AEP Ohio", state: "OH", customers: 1500000, url: "https://www.aepohio.com/outages/" },
  { rank: 25, name: "PPL Electric Utilities", state: "PA", customers: 1400000, url: "https://www.pplelectric.com/outages/outage-map" },
  { rank: 26, name: "National Grid (MA)", state: "MA", customers: 1400000, url: "https://www.nationalgridus.com/Massachusetts-Home/Outages/Outage-Map" },
  { rank: 29, name: "Xcel Energy Minnesota", state: "MN", customers: 1300000, url: "https://xcelenergy.com/stormcenter" },
  { rank: 30, name: "Baltimore Gas & Electric", state: "MD", customers: 1300000, url: "https://outagemap.bge.com/" },
  { rank: 28, name: "Arizona Public Service", state: "AZ", customers: 1300000, url: "https://www.aps.com/en/Outages-and-Storms/Outage-Map" },
  { rank: 27, name: "Eversource (CT)", state: "CT", customers: 1300000, url: "https://www.eversource.com/content/ct-c/residential/outages/current-outages" },
  { rank: 31, name: "Ameren Missouri", state: "MO", customers: 1200000, url: "https://www.ameren.com/missouri/outage/outage-map" },
  { rank: 32, name: "Ameren Illinois", state: "IL", customers: 1200000, url: "https://www.ameren.com/illinois/outage/outage-map" },
  { rank: 33, name: "Puget Sound Energy", state: "WA", customers: 1200000, url: "https://www.pse.com/en/outage/outage-map" },
  { rank: 34, name: "PSEG Long Island", state: "NY", customers: 1200000, url: "https://outagemap.psegliny.com/" },
  { rank: 35, name: "Salt River Project", state: "AZ", customers: 1100000, url: "https://srpnet.com/outages/default.aspx" },
  { rank: 36, name: "Entergy Louisiana", state: "LA", customers: 1100000, url: "https://www.entergy.com/view-outages/" },
  { rank: 37, name: "AEP Texas", state: "TX", customers: 1100000, url: "https://www.aeptexas.com/outages/" },
  { rank: 38, name: "We Energies", state: "WI", customers: 1100000, url: "https://www.we-energies.com/outagemap/" },
  { rank: 39, name: "JCP&L (FirstEnergy)", state: "NJ", customers: 1100000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 40, name: "FirstEnergy Ohio (Ohio Edison)", state: "OH", customers: 1100000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 41, name: "NV Energy (Southern Nevada)", state: "NV", customers: 1000000, url: "https://www.nvenergy.com/my-account/outages-and-alerts" },
  { rank: 42, name: "Rocky Mountain Power", state: "UT", customers: 950000, url: "https://www.rockymountainpower.net/outages-safety/outages/outage-map.html" },
  { rank: 43, name: "CPS Energy", state: "TX", customers: 900000, url: "https://www.cpsenergy.com/en/outages.html" },
  { rank: 44, name: "Portland General Electric", state: "OR", customers: 900000, url: "https://portlandgeneral.com/outages" },
  { rank: 45, name: "New York State Electric & Gas", state: "NY", customers: 900000, url: "https://www.nyseg.com/OutageMap" },
  { rank: 46, name: "Duke Energy Indiana", state: "IN", customers: 870000, url: "https://outagemap.duke-energy.com/" },
  { rank: 47, name: "OG&E", state: "OK", customers: 870000, url: "https://oge.com/residential/outages-safety/outage-status" },
  { rank: 48, name: "MidAmerican Energy", state: "IA", customers: 800000, url: "https://www.midamericanenergy.com/outages" },
  { rank: 49, name: "Tampa Electric", state: "FL", customers: 800000, url: "https://www.tampaelectric.com/residential/outages-and-alerts/outage-map/" },
  { rank: 50, name: "Wabash Valley Power Alliance", state: "IN", customers: 800000, url: "https://www.wvpa.com/" },
];

async function discoverAPI(page: any, utility: any) {
  const apis: any[] = [];
  
  page.on('response', async (response: any) => {
    const url = response.url();
    if (url.includes('.json') || url.includes('/api/') || url.includes('summary') || url.includes('outage') || url.includes('data')) {
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

  console.log(`🔍 [${utility.rank}] ${utility.name} (${(utility.customers / 1000000).toFixed(1)}M customers)`);

  try {
    await page.goto(utility.url, { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);
  } catch (e) {
    console.log(`  ⚠️ Page load timeout/error`);
  }

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

utilities.forEach(utility => {
  test(`Discover API: [${utility.rank}] ${utility.name}`, async ({ page }) => {
    await discoverAPI(page, utility);
  });
});
