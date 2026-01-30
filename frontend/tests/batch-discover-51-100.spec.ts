import { test } from '@playwright/test';
import * as fs from 'fs';

const utilities = [
  { rank: 51, name: "FirstEnergy Ohio (Illuminating Co)", state: "OH", customers: 750000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 52, name: "Dominion Energy SC", state: "SC", customers: 750000, url: "https://www.dominionenergy.com/outages/outage-map" },
  { rank: 54, name: "Entergy Arkansas", state: "AR", customers: 720000, url: "https://www.entergy.com/view-outages/" },
  { rank: 53, name: "West Penn Power (FirstEnergy)", state: "PA", customers: 720000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 55, name: "Duke Energy Ohio", state: "OH", customers: 700000, url: "https://outagemap.duke-energy.com/" },
  { rank: 57, name: "Great River Energy Co-ops", state: "MN", customers: 700000, url: "https://greatriverenergy.com/" },
  { rank: 56, name: "Duke Energy (SC)", state: "SC", customers: 700000, url: "https://outagemap.duke-energy.com/" },
  { rank: 58, name: "Sacramento Municipal Utility District", state: "CA", customers: 650000, url: "https://www.smud.org/en/Customer-Support/Outage-Status" },
  { rank: 59, name: "Central Maine Power", state: "ME", customers: 640000, url: "https://www.cmpco.com/outages/outageinformation" },
  { rank: 60, name: "Idaho Power", state: "ID", customers: 600000, url: "https://www.idahopower.com/outages/outage-map/" },
  { rank: 61, name: "Duquesne Light", state: "PA", customers: 600000, url: "https://www.duquesnelight.com/outages-safety/current-outages" },
  { rank: 62, name: "PacifiCorp (OR)", state: "OR", customers: 600000, url: "https://www.pacificpower.net/outages-safety/outages/outage-map.html" },
  { rank: 63, name: "Penelec (FirstEnergy)", state: "PA", customers: 600000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 64, name: "Nebraska Public Power District", state: "NE", customers: 600000, url: "https://www.nppd.com/outages" },
  { rank: 65, name: "Pepco", state: "MD", customers: 600000, url: "https://pepco.com/Outages/CheckOutageStatus" },
  { rank: 67, name: "Atlantic City Electric", state: "NJ", customers: 560000, url: "https://www.atlanticcityelectric.com/Outages/CheckOutageStatus" },
  { rank: 68, name: "PSO (AEP)", state: "OK", customers: 560000, url: "https://www.psoklahoma.com/outages/" },
  { rank: 66, name: "Met-Ed (FirstEnergy)", state: "PA", customers: 560000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 70, name: "PNM", state: "NM", customers: 550000, url: "https://www.pnm.com/outage-center" },
  { rank: 71, name: "Georgia Electric Membership Corporation", state: "GA", customers: 550000, url: "https://www.georgiaemc.com/outage-center" },
  { rank: 72, name: "Kentucky Utilities", state: "KY", customers: 550000, url: "https://lge-ku.com/outage-map" },
  { rank: 69, name: "Evergy Missouri Metro", state: "MO", customers: 550000, url: "https://www.evergy.com/outages/outage-map" },
  { rank: 73, name: "Eversource (NH)", state: "NH", customers: 530000, url: "https://www.eversource.com/content/nh/residential/outages/current-outages" },
  { rank: 74, name: "Appalachian Power (AEP)", state: "VA", customers: 530000, url: "https://www.appalachianpower.com/outages/" },
  { rank: 75, name: "Austin Energy", state: "TX", customers: 530000, url: "https://outagemap.austinenergy.com/" },
  { rank: 76, name: "Dayton Power & Light", state: "OH", customers: 530000, url: "https://www.aes-ohio.com/outages" },
  { rank: 77, name: "AES Indiana", state: "IN", customers: 520000, url: "https://www.aesindiana.com/outages" },
  { rank: 78, name: "Rhode Island Energy", state: "RI", customers: 510000, url: "https://www.rienergy.com/site/Outages" },
  { rank: 82, name: "JEA", state: "FL", customers: 500000, url: "https://www.jea.com/outage-map/" },
  { rank: 83, name: "Alliant Energy (IA)", state: "IA", customers: 500000, url: "https://www.alliantenergy.com/outages/outagemap" },
  { rank: 80, name: "ElectriCities of NC", state: "NC", customers: 500000, url: "https://www.electricities.org/" },
  { rank: 81, name: "Appalachian Power (WV)", state: "WV", customers: 500000, url: "https://www.appalachianpower.com/outages/" },
  { rank: 79, name: "Arkansas Electric Cooperatives", state: "AR", customers: 500000, url: "https://www.aecc.com/" },
  { rank: 84, name: "NIPSCO", state: "IN", customers: 480000, url: "https://nipsco.com/safety-and-emergencies/electric-safety/outages-and-problems" },
  { rank: 85, name: "Gulf Power (NextEra)", state: "FL", customers: 470000, url: "https://www.gulfpower.com/outages/outage-map.html" },
  { rank: 86, name: "Alliant Energy (WI)", state: "WI", customers: 470000, url: "https://www.alliantenergy.com/outages/outagemap" },
  { rank: 87, name: "Indiana Michigan Power", state: "IN", customers: 470000, url: "https://www.indianamichiganpower.com/outages/" },
  { rank: 88, name: "Seattle City Light", state: "WA", customers: 470000, url: "https://www.seattle.gov/city-light/outages" },
  { rank: 89, name: "Entergy Mississippi", state: "MS", customers: 460000, url: "https://www.entergy.com/view-outages/" },
  { rank: 90, name: "Hawaiian Electric", state: "HI", customers: 460000, url: "https://www.hawaiianelectric.com/safety-and-outages/power-outages/outage-map" },
  { rank: 91, name: "Tucson Electric Power", state: "AZ", customers: 450000, url: "https://www.tep.com/outage-map/" },
  { rank: 92, name: "WPS (Wisconsin Public Service)", state: "WI", customers: 450000, url: "https://www.wisconsinpublicservice.com/outages/outagemap" },
  { rank: 95, name: "Memphis Light Gas & Water", state: "TN", customers: 420000, url: "https://www.mlgw.com/outages" },
  { rank: 94, name: "Louisville Gas & Electric", state: "KY", customers: 420000, url: "https://lge-ku.com/outage-map" },
  { rank: 93, name: "Nashville Electric Service", state: "TN", customers: 420000, url: "https://www.nespower.com/outages/" },
  { rank: 96, name: "NV Energy (Northern Nevada)", state: "NV", customers: 400000, url: "https://www.nvenergy.com/my-account/outages-and-alerts" },
  { rank: 97, name: "Mon Power (FirstEnergy)", state: "WV", customers: 400000, url: "https://www.firstenergycorp.com/outages_help/current_outages.html" },
  { rank: 98, name: "Omaha Public Power District", state: "NE", customers: 400000, url: "https://www.oppd.com/outages/" },
  { rank: 99, name: "Buckeye Power", state: "OH", customers: 400000, url: "https://www.buckeyepower.com/" },
  { rank: 100, name: "TVA Distributors (AL)", state: "AL", customers: 400000, url: "https://www.tva.com/" },
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
        }
      } catch (e) {}
    }
  });

  console.log(`🔍 [${utility.rank}] ${utility.name} (${(utility.customers / 1000000).toFixed(1)}M)`);

  try {
    await page.goto(utility.url, { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(8000);
  } catch (e) {
    console.log(`  ⚠️ Timeout`);
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

  console.log(`  ✅ ${apis.length} APIs`);
  return result;
}

utilities.forEach(utility => {
  test(`[${utility.rank}] ${utility.name}`, async ({ page }) => {
    await discoverAPI(page, utility);
  });
});
