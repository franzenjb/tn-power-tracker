// Test script for EPB Chattanooga Outage API
// Discovered: January 30, 2026

const https = require('https');

const API_ENDPOINTS = {
  v2_incidents: 'https://api.epb.com/web/api/v2/outages/energy/incidents',
  v1_power: 'https://api.epb.com/web/api/v1/outages/power/incidents',
  service_area: 'https://api.epb.com/web/api/v1/boundaries/service-area'
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testEPBAPI() {
  console.log('='.repeat(60));
  console.log('EPB Chattanooga Outage API Test');
  console.log('='.repeat(60));

  try {
    // Test v2 incidents endpoint
    console.log('\n1. Testing v2 Energy Incidents Endpoint...');
    console.log(`   URL: ${API_ENDPOINTS.v2_incidents}`);

    const v2Data = await fetchJSON(API_ENDPOINTS.v2_incidents);

    console.log('\n   Summary:');
    console.log(`   - Total Customers Affected: ${v2Data.summary.customers_affected}`);
    console.log(`   - Total Outage Incidents: ${v2Data.summary.outage_incidents}`);
    console.log(`   - Repairs in Progress: ${v2Data.summary.repairs_in_progress}`);

    console.log('\n   Incidents:');
    v2Data.incidents.forEach((incident, idx) => {
      console.log(`   ${idx + 1}. ${incident.customer_quantity} customers affected`);
      console.log(`      Status: ${incident.incident_status}`);
      console.log(`      Location: ${incident.latitude}, ${incident.longitude}`);
    });

    // Test v1 power endpoint
    console.log('\n2. Testing v1 Power Incidents Endpoint...');
    console.log(`   URL: ${API_ENDPOINTS.v1_power}`);

    const v1Data = await fetchJSON(API_ENDPOINTS.v1_power);

    console.log('\n   District Metrics:');
    v1Data.district_metrics.forEach((district) => {
      console.log(`   - ${district.district}`);
      if (district.outage_reported) {
        console.log(`     Outages Reported: ${district.outage_reported.customer_qty} customers`);
      }
      if (district.repair_in_progress) {
        console.log(`     Repairs in Progress: ${district.repair_in_progress.customer_qty} customers`);
      }
    });

    console.log('\n   Outage Points with Crew Info:');
    v1Data.outage_points.slice(0, 3).forEach((point, idx) => {
      console.log(`   ${idx + 1}. ${point.customer_qty} customers, ${point.crew_qty} crews`);
      console.log(`      Status: ${point.incident_status}`);
      console.log(`      Location: ${point.latitude}, ${point.longitude}`);
    });

    // Test service area endpoint
    console.log('\n3. Testing Service Area Boundary Endpoint...');
    console.log(`   URL: ${API_ENDPOINTS.service_area}`);

    const boundaryData = await fetchJSON(API_ENDPOINTS.service_area);

    console.log(`\n   Type: ${boundaryData.type}`);
    console.log(`   Region: ${boundaryData.properties.region}`);
    console.log(`   Geometry Type: ${boundaryData.geometry.type || 'Polygon'}`);
    console.log(`   Coordinate Count: ${boundaryData.geometry.coordinates[0]?.length || 0}`);

    console.log('\n' + '='.repeat(60));
    console.log('API Test Complete - All Endpoints Working!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nError testing API:', error.message);
    process.exit(1);
  }
}

// Run the test
testEPBAPI();
