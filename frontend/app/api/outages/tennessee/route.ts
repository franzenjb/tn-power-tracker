import { NextResponse } from 'next/server';
import { isTennesseeCounty } from '@/lib/tn-counties';

// County-level data aggregator
interface CountyData {
  county: string;
  customersOut: number;
  customersTracked: number;
  utilities: string[];
  lastUpdated: string;
}

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
    type: 'outagemap',
    hasCountyBreakdown: true
  },
  {
    name: 'Volunteer Energy Cooperative',
    county: 'Multiple',
    customers: 131653,
    url: 'https://outagemap-data.cloud.coop/volunteer/Hosted_Outage_Map/summary.json',
    type: 'outagemap',
    hasCountyBreakdown: true
  },
  {
    name: 'Meriwether Lewis Electric',
    county: 'Multiple',
    customers: 16067,
    url: 'https://outagemap-data.cloud.coop/mlecmn/Hosted_Outage_Map/summary.json',
    type: 'outagemap',
    hasCountyBreakdown: true
  },
  {
    name: 'Sequachee Valley Electric',
    county: 'Multiple',
    customers: 40074,
    url: 'https://outagemap-data.cloud.coop/svalleyec/Hosted_Outage_Map/summary.json',
    type: 'outagemap',
    hasCountyBreakdown: true
  },
  {
    name: 'Appalachian Electric',
    county: 'Multiple',
    customers: 52434,
    url: 'https://outagemap-data.cloud.coop/aec/Hosted_Outage_Map/summary.json',
    type: 'outagemap',
    hasCountyBreakdown: true
  },
];

export async function GET() {
  try {
    // County aggregator - key is county name
    const countyMap = new Map<string, CountyData>();

    // Fetch all utilities in parallel
    await Promise.all(
      TN_UTILITIES.map(async (utility) => {
        try {
          const headers: HeadersInit = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          };
          if (utility.type === 'mlgw') {
            headers['Referer'] = 'https://outagemap.mlgw.org/';
          }

          const response = await fetch(utility.url, { headers });
          const data = await response.json();

          const lastUpdated = new Date().toISOString();

          // Parse based on utility type
          if (utility.type === 'nes') {
            // NES: Array of events with numPeople - serves Davidson only
            const customersOut = data.reduce((sum: number, event: any) => sum + (event.numPeople || 0), 0);
            addOrUpdateCounty(countyMap, 'Davidson', customersOut, utility.customers, utility.name, lastUpdated);
          }
          else if (utility.type === 'mlgw') {
            // MLGW: GeoJSON with CUR_CUST_AFF field - serves Shelby only
            const customersOut = data.features?.reduce((sum: number, feature: any) =>
              sum + (feature.properties?.CUR_CUST_AFF || 0), 0) || 0;
            addOrUpdateCounty(countyMap, 'Shelby', customersOut, utility.customers, utility.name, lastUpdated);
          }
          else if (utility.type === 'epb') {
            // EPB: summary object - serves Hamilton only
            const customersOut = data.summary?.customers_affected || 0;
            addOrUpdateCounty(countyMap, 'Hamilton', customersOut, utility.customers, utility.name, lastUpdated);
          }
          else if (utility.type === 'kub') {
            // KUB: electricOutageInfo - serves Knox only
            const customersOut = data.electricOutageInfo?.electricCustomersWithoutPower || 0;
            const customersTracked = data.electricOutageInfo?.totalElectricCustomers || utility.customers;
            addOrUpdateCounty(countyMap, 'Knox', customersOut, customersTracked, utility.name, lastUpdated);
          }
          else if (utility.type === 'outagemap') {
            // OutageMap.coop: Check for county-level breakdown in regionDataSets
            if (data.regionDataSets && Array.isArray(data.regionDataSets)) {
              // Look for county region data
              const countyRegions = data.regionDataSets.find((ds: any) =>
                ds.id === 'newCounty' || ds.description?.toLowerCase().includes('county')
              );

              if (countyRegions && Array.isArray(countyRegions.regions)) {
                // Parse each county in the region
                countyRegions.regions.forEach((region: any) => {
                  const countyName = region.id || region.description;
                  const numberOut = region.numberOut || 0;
                  const numberServed = region.numberServed || 0;

                  if (countyName && numberServed > 0) {
                    addOrUpdateCounty(countyMap, countyName, numberOut, numberServed, utility.name, lastUpdated);
                  }
                });
              } else {
                // No county breakdown available, use total
                const customersTracked = data.totalServed || utility.customers;
                const customersOut = data.outages?.reduce((sum: number, outage: any) =>
                  sum + (outage.nbrOut || 0), 0) || 0;
                addOrUpdateCounty(countyMap, utility.county, customersOut, customersTracked, utility.name, lastUpdated);
              }
            } else {
              // Fallback: use total for the utility's listed county
              const customersTracked = data.totalServed || utility.customers;
              const customersOut = data.outages?.reduce((sum: number, outage: any) =>
                sum + (outage.nbrOut || 0), 0) || 0;
              addOrUpdateCounty(countyMap, utility.county, customersOut, customersTracked, utility.name, lastUpdated);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${utility.name}:`, error);
        }
      })
    );

    // Convert map to array, filter to Tennessee counties only, and sort by outages (highest first)
    const counties = Array.from(countyMap.values())
      .filter(county => isTennesseeCounty(county.county))
      .map(county => ({
        ...county,
        percentOut: county.customersTracked > 0
          ? ((county.customersOut / county.customersTracked) * 100).toFixed(2)
          : '0.00'
      }))
      .sort((a, b) => b.customersOut - a.customersOut);

    const totalOut = counties.reduce((sum, c) => sum + c.customersOut, 0);
    const totalTracked = counties.reduce((sum, c) => sum + c.customersTracked, 0);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      state: 'Tennessee',
      summary: {
        countiesReporting: counties.length,
        totalCustomersOut: totalOut,
        totalCustomersTracked: totalTracked,
        stateOutageRate: totalTracked > 0 ? ((totalOut / totalTracked) * 100).toFixed(3) : '0.000'
      },
      counties
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch Tennessee outage data' },
      { status: 500 }
    );
  }
}

// Helper function to add or update county data
function addOrUpdateCounty(
  map: Map<string, CountyData>,
  county: string,
  customersOut: number,
  customersTracked: number,
  utilityName: string,
  lastUpdated: string
) {
  const existing = map.get(county);

  if (existing) {
    // County already exists - aggregate the data
    existing.customersOut += customersOut;
    existing.customersTracked += customersTracked;
    existing.utilities.push(utilityName);
    // Use most recent update time
    if (lastUpdated > existing.lastUpdated) {
      existing.lastUpdated = lastUpdated;
    }
  } else {
    // New county
    map.set(county, {
      county,
      customersOut,
      customersTracked,
      utilities: [utilityName],
      lastUpdated
    });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
