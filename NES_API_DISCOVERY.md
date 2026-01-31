# Nashville Electric Service (NES) Outage API Discovery

## Executive Summary

Successfully discovered the outage data API for Nashville Electric Service (NES). The utility uses **UtiliSocial** (a third-party outage management platform) to power their public outage map at https://www.nespower.com/user/report-outage.

## Working API Endpoint

**Base URL:** `https://utilisocial.io/datacapable/v2/p/NES/map/events`

**Method:** GET
**Authentication:** None required (public API)
**Response Format:** JSON
**CORS:** Enabled (can be called from browser)

## Current Data Statistics (as of January 30, 2026)

- **Total Active Outages:** 5,419
- **Total Customers Affected:** 69,645
- **Largest Single Outage:** 732 customers
- **Smallest Outage:** 1 customer

## Data Structure

Each outage event contains the following fields:

```json
{
  "id": 2010512,                           // Unique internal ID
  "startTime": 1769718083000,              // Unix timestamp (milliseconds)
  "lastUpdatedTime": 1769718623000,        // Unix timestamp (milliseconds)
  "title": "Outage",                       // Event type
  "numPeople": 732,                        // Customers affected
  "status": "Unassigned",                  // Status: "Unassigned", "Assigned", "Restored", etc.
  "cause": "",                             // Cause of outage (often empty)
  "identifier": "2635091",                 // External/ticket identifier
  "latitude": 36.06196,                    // Decimal degrees
  "longitude": -86.8341                    // Decimal degrees
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique internal database ID for the outage event |
| `startTime` | Long | Unix timestamp in milliseconds when outage began |
| `lastUpdatedTime` | Long | Unix timestamp in milliseconds of last update |
| `title` | String | Event type, typically "Outage" |
| `numPeople` | Integer | Number of customers affected by this outage |
| `status` | String | Current status of the outage (e.g., "Unassigned", "Assigned", "In Progress") |
| `cause` | String | Cause of the outage (often empty or populated later) |
| `identifier` | String | External ticket/incident identifier from NES OMS |
| `latitude` | Float | Latitude coordinate (decimal degrees) |
| `longitude` | Float | Longitude coordinate (decimal degrees) |

## Additional API Endpoints

### App Settings
**URL:** `https://utilisocial.io/datacapable/v2/p/NES/map/app/settings`
**Purpose:** Provides map configuration, theme settings, layer definitions, and icon configurations

### Territory Data
**URL:** `https://utilisocial.io/datacapable/v2/p/NES/map/territory?regionIds=`
**Purpose:** Returns service territory boundary polygons

## Usage Examples

### Get All Current Outages
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | jq .
```

### Get Total Customers Affected
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | jq '[.[] | .numPeople] | add'
```

### Get Count of Active Outages
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | jq 'length'
```

### Get Outages Affecting 100+ Customers
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | jq '[.[] | select(.numPeople >= 100)]'
```

### Get Summary Statistics
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | \
  jq '{
    total_outages: length,
    total_customers: ([.[] | .numPeople] | add),
    largest_outage: ([.[] | .numPeople] | max),
    smallest_outage: ([.[] | .numPeople] | min)
  }'
```

## Update Frequency

Based on the `lastUpdatedTime` timestamps, the API appears to update:
- In near real-time during active storm events
- Data is refreshed as crews update outage statuses
- Historical outages remain in the dataset even after restoration

## Integration Notes

1. **No Rate Limiting Observed:** The API appears to have no authentication or rate limiting, but use responsibly
2. **Geographic Coverage:** Covers NES service territory (Nashville, Tennessee area)
3. **Coordinate System:** WGS84 (standard lat/long)
4. **Timestamp Format:** Unix milliseconds (divide by 1000 for Unix seconds)
5. **Data Retention:** Appears to retain historical outage data, not just current outages

## Discovery Method

The API was discovered using Playwright to inspect network traffic on the NES outage map page:
1. Navigated to https://www.nespower.com/user/report-outage
2. Monitored XHR/Fetch requests in browser DevTools
3. Identified UtiliSocial as the third-party platform provider
4. Extracted and tested API endpoints

## Technology Stack

- **Vendor:** UtiliSocial (utilisocial.io)
- **Mapping:** ArcGIS API for JavaScript 4.25
- **Basemap:** ArcGIS World Basemap v2
- **Frontend:** React-based single-page application

## Sample Data Location

Full sample response saved to: `/Users/jefffranzen/tn-power-tracker/data/nes-sample-response.json`

## Verification

Test the API endpoint:
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | jq '.[0:3]'
```

Expected output: Array of outage objects with the structure shown above.

## Notes

- The API is publicly accessible without authentication
- Data appears to be real-time operational data
- Geographic coordinates are approximate locations (likely transformer/equipment locations)
- Status values may vary (observed: "Unassigned", but likely includes "Assigned", "Restored", etc.)
- The `cause` field is often empty but may be populated for major incidents

## Related Files

- Sample response data: `data/nes-sample-response.json`
- Discovery scripts: `discover-*.js`
- Screenshots: `*.png`
