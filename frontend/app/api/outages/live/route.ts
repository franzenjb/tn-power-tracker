import { NextResponse } from 'next/server';

// Live validated Kubra utilities
const KUBRA_UTILITIES = [
  { name: 'ComEd', state: 'IL', rank: 5, url: 'https://kubra.io/data/35344c17-425a-48a4-afa0-54cbcaadae6e/public/summary-1/data.json' },
  { name: 'Oncor', state: 'TX', rank: 6, url: 'https://kubra.io/data/9c0e89fa-f533-453b-bf48-4a97944253f6/public/summary-1/data.json' },
  { name: 'Georgia Power', state: 'GA', rank: 8, url: 'https://kubra.io/data/66a4e0ff-a8b1-4d0a-bf08-84d3b8ddafbf/public/summary-1/data.json' },
  { name: 'AEP Ohio', state: 'OH', rank: 21, url: 'https://kubra.io/data/701742f7-7466-425b-b055-64405de54a84/public/summary-1/data.json' },
  { name: 'Alabama Power', state: 'AL', rank: 23, url: 'https://kubra.io/data/f37bfb01-d2e8-4353-9b1e-0bc39859148e/public/summary-1/data.json' },
  { name: 'Baltimore Gas & Electric', state: 'MD', rank: 30, url: 'https://kubra.io/data/66621031-23bc-48a5-b408-aae4a8301f11/public/summary-1/data.json' },
  { name: 'PSEG Long Island', state: 'NY', rank: 34, url: 'https://kubra.io/data/05a8f333-eef4-4a8e-ba13-d8a7bc96959a/public/summary-1/data.json' },
  { name: 'Austin Energy', state: 'TX', rank: 75, url: 'https://kubra.io/data/b2f783e4-a5dd-48c7-b5f9-c767037b2c56/public/summary-1/data.json' },
];

export async function GET() {
  try {
    const results = await Promise.all(
      KUBRA_UTILITIES.map(async (utility) => {
        try {
          const response = await fetch(utility.url);
          const data = await response.json();
          const totals = data.summaryFileData.totals[0];

          return {
            utility: utility.name,
            state: utility.state,
            rank: utility.rank,
            customersOut: totals.total_cust_a.val,
            customersTracked: totals.total_cust_s,
            percentOut: totals.total_percent_cust_a.val,
            lastUpdated: data.summaryFileData.date_generated,
            status: 'success'
          };
        } catch (error) {
          return {
            utility: utility.name,
            state: utility.state,
            rank: utility.rank,
            customersOut: 0,
            customersTracked: 0,
            percentOut: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const totalOut = results.reduce((sum, r) => sum + r.customersOut, 0);
    const totalTracked = results.reduce((sum, r) => sum + r.customersTracked, 0);
    const nationalRate = totalTracked > 0 ? (totalOut / totalTracked * 100) : 0;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: {
        utilitiesTracked: results.filter(r => r.status === 'success').length,
        totalCustomersOut: totalOut,
        totalCustomersTracked: totalTracked,
        nationalOutageRate: nationalRate,
        coveragePercent: (totalTracked / 160000000 * 100).toFixed(1)
      },
      utilities: results
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch outage data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
