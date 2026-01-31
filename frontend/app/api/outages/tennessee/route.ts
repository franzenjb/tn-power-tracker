import { NextResponse } from 'next/server';

// TENNESSEE UTILITIES ONLY - All discovered and working APIs
const TN_UTILITIES = [
  // Major Municipal Utilities
  {
    name: 'NES (Nashville)',
    county: 'Davidson',
    customers: 420000,
    url: 'https://utilisocial.io/datacapable/v2/p/NES/map/events',
    type: 'nes'
  },
  {
    name: 'MLGW (Memphis)',
    county: 'Shelby',
    customers: 437000,
    url: 'https://outagemap.mlgw.org/geojson.php',
    type: 'mlgw'
  },
  {
    name: 'EPB (Chattanooga)',
    county: 'Hamilton',
    customers: 180000,
    url: 'https://api.epb.com/web/api/v2/outages/energy/incidents',
    type: 'epb'
  },
  {
    name: 'KUB (Knoxville)',
    county: 'Knox',
    customers: 230000,
    url: 'https://www.kub.org/outage-data/data.json',
    type: 'kub'
  },
  // Electric Cooperatives using OutageMap.coop
  {
    name: 'Middle Tennessee EMC',
    county: 'Multiple (9 counties)',
    customers: 359129,
    url: 'https://outagemap-data.cloud.coop/mtemc/Hosted_Outage_Map/summary.json',
    type: 'outagemap'
  },
  {
    name: 'Volunteer Energy Cooperative',
    county: 'Multiple',
    customers: 131653,
    url: 'https://outagemap-data.cloud.coop/volunteer/Hosted_Outage_Map/summary.json',
    type: 'outagemap'
  },
  {
    name: 'Meriwether Lewis Electric',
    county: 'Multiple',
    customers: 16067,
    url: 'https://outagemap-data.cloud.coop/mlecmn/Hosted_Outage_Map/summary.json',
    type: 'outagemap'
  },
  {
    name: 'Sequachee Valley Electric',
    county: 'Multiple',
    customers: 40074,
    url: 'https://outagemap-data.cloud.coop/svalleyec/Hosted_Outage_Map/summary.json',
    type: 'outagemap'
  },
  {
    name: 'Appalachian Electric',
    county: 'Multiple',
    customers: 52434,
    url: 'https://outagemap-data.cloud.coop/aec/Hosted_Outage_Map/summary.json',
    type: 'outagemap'
  },
];

export async function GET() {
  try {
    const results = await Promise.all(
      TN_UTILITIES.map(async (utility) => {
        try {
          const response = await fetch(utility.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Referer': utility.type === 'mlgw' ? 'https://outagemap.mlgw.org/' : undefined
            }
          });
          const data = await response.json();

          let customersOut = 0;
          let customersTracked = utility.customers;
          let lastUpdated = new Date().toISOString();

          // Parse based on utility type
          if (utility.type === 'nes') {
            // NES: Array of events with numPeople
            customersOut = data.reduce((sum: number, event: any) => sum + (event.numPeople || 0), 0);
          } else if (utility.type === 'mlgw') {
            // MLGW: GeoJSON with CUR_CUST_AFF field
            customersOut = data.features?.reduce((sum: number, feature: any) =>
              sum + (feature.properties?.CUR_CUST_AFF || 0), 0) || 0;
          } else if (utility.type === 'epb') {
            // EPB: summary object
            customersOut = data.summary?.customers_affected || 0;
          } else if (utility.type === 'kub') {
            // KUB: electricOutageInfo
            customersOut = data.electricOutageInfo?.electricCustomersWithoutPower || 0;
            customersTracked = data.electricOutageInfo?.totalElectricCustomers || utility.customers;
            lastUpdated = data.electricOutageInfo?.lastUpdated || lastUpdated;
          } else if (utility.type === 'outagemap') {
            // OutageMap.coop: summary with outages array
            customersTracked = data.totalServed || utility.customers;
            customersOut = data.outages?.reduce((sum: number, outage: any) =>
              sum + (outage.nbrOut || 0), 0) || 0;
            lastUpdated = data.lastUpdate ? new Date(data.lastUpdate).toISOString() : lastUpdated;
          }

          return {
            utility: utility.name,
            county: utility.county,
            customersOut,
            customersTracked,
            percentOut: customersTracked > 0 ? ((customersOut / customersTracked) * 100).toFixed(2) : '0.00',
            lastUpdated,
            status: 'success'
          };
        } catch (error) {
          return {
            utility: utility.name,
            county: utility.county,
            customersOut: 0,
            customersTracked: utility.customers,
            percentOut: '0.00',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const totalOut = results.reduce((sum, r) => sum + (r.customersOut || 0), 0);
    const totalTracked = results.reduce((sum, r) => sum + (r.customersTracked || 0), 0);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      state: 'Tennessee',
      summary: {
        utilitiesTracked: results.filter(r => r.status === 'success').length,
        utilitiesPending: results.filter(r => r.status === 'pending').length,
        totalCustomersOut: totalOut,
        totalCustomersTracked: totalTracked,
        stateOutageRate: totalTracked > 0 ? ((totalOut / totalTracked) * 100).toFixed(3) : '0.000'
      },
      utilities: results
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Tennessee outage data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
