# EPB Chattanooga Outage API Discovery

## Summary
Successfully discovered EPB's public outage API endpoints using Playwright browser automation and network monitoring.

## Primary API Endpoints

### 1. Energy/Power Outage Incidents (v2)
**URL:** `https://api.epb.com/web/api/v2/outages/energy/incidents`

**Method:** GET

**Description:** Returns current power outage incidents with location coordinates and summary statistics.

**Response Structure:**
```json
{
  "incidents": [
    {
      "customer_quantity": 1,
      "incident_status": "REPAIR_IN_PROGRESS",
      "latitude": 35.173673,
      "longitude": -85.328999
    }
  ],
  "summary": {
    "customer_repairs_in_progress": 39,
    "customers_affected": 40,
    "outage_incidents": 4,
    "repairs_in_progress": 3
  }
}
```

**Fields:**
- `incidents`: Array of outage incidents
  - `customer_quantity`: Number of customers affected
  - `incident_status`: Status (e.g., "REPAIR_IN_PROGRESS", "OUTAGE_REPORTED", "CREW_EN_ROUTE", "RESTORED")
  - `latitude`: Latitude coordinate
  - `longitude`: Longitude coordinate
- `summary`: Aggregate statistics
  - `customer_repairs_in_progress`: Total customers with repairs in progress
  - `customers_affected`: Total customers affected
  - `outage_incidents`: Total number of outage incidents
  - `repairs_in_progress`: Number of repairs currently in progress

### 2. Power Outage Incidents with District Metrics (v1)
**URL:** `https://api.epb.com/web/api/v1/outages/power/incidents`

**Method:** GET

**Description:** Returns detailed outage information including district-level metrics and crew assignments.

**Response Structure:**
```json
{
  "district_metrics": [
    {
      "district": "Amnicola",
      "repair_in_progress": {
        "customer_qty": 1,
        "incident_qty": 1
      }
    }
  ],
  "outage_points": [
    {
      "crew_qty": 1,
      "customer_qty": 1,
      "incident_status": "REPAIR_IN_PROGRESS",
      "latitude": 35.171773,
      "longitude": -85.330299
    }
  ],
  "summary": {
    "outage_reported": {
      "customer_qty": 1,
      "incident_qty": 1
    },
    "repair_in_progress": {
      "customer_qty": 39,
      "incident_qty": 3
    }
  }
}
```

**Fields:**
- `district_metrics`: Array of metrics by district
  - `district`: District name
  - `outage_reported`/`repair_in_progress`: Status-specific metrics
    - `customer_qty`: Number of customers
    - `incident_qty`: Number of incidents
- `outage_points`: Array of individual outage locations
  - `crew_qty`: Number of crews assigned
  - `customer_qty`: Customers affected
  - `incident_status`: Current status
  - `latitude`, `longitude`: Location coordinates
- `summary`: Aggregate statistics by status

### 3. Service Area Boundary
**URL:** `https://api.epb.com/web/api/v1/boundaries/service-area`

**Method:** GET

**Description:** Returns GeoJSON polygon defining EPB's service area.

**Response Structure:**
```json
{
  "geometry": {
    "coordinates": [[[lng, lat], ...]]
  },
  "properties": {
    "region": "Service Area"
  },
  "type": "Feature"
}
```

## Incident Status Values

Based on the discovered data, possible `incident_status` values include:
- `OUTAGE_REPORTED` - Outage has been reported but repair not yet started
- `REPAIR_IN_PROGRESS` - Repair crews are actively working
- `CREW_EN_ROUTE` - Crews are traveling to the site
- `RESTORED` - Power has been restored

## Testing the API

### curl Example:
```bash
curl "https://api.epb.com/web/api/v2/outages/energy/incidents"
```

### Python Example:
```python
import requests

response = requests.get('https://api.epb.com/web/api/v2/outages/energy/incidents')
data = response.json()

print(f"Total customers affected: {data['summary']['customers_affected']}")
print(f"Total outage incidents: {data['summary']['outage_incidents']}")

for incident in data['incidents']:
    print(f"  - {incident['customer_quantity']} customers at "
          f"{incident['latitude']}, {incident['longitude']} "
          f"({incident['incident_status']})")
```

## Discovery Method

The API endpoints were discovered using Playwright browser automation:
1. Navigated to https://epb.com/outage-and-storm-center-old/
2. Monitored network traffic for JSON API calls
3. Identified EPB's internal API endpoints
4. Verified endpoints work without authentication

## Additional Files Discovered

- `/assets/component/json/c7100/c7100_outage_map.json` - Translations for outage map UI
- `/assets/comepb/js/modules/repository/outages.js` - Frontend outage module
- `/assets/comepb/js/modules/repository/powershare.js` - PowerShare module
- `/assets/comepb/js/modules/repository/backends/gateway/outages.js` - API gateway module

## Notes

- No authentication required
- CORS-enabled (can be called from browser)
- Data updates in near real-time
- Coordinates appear to be approximate locations (privacy)
- API is used by EPB's public outage map at https://epb.com/outage-storm-center/

## Recommended Endpoint

For integration into the Tennessee Power Tracker, use:
**`https://api.epb.com/web/api/v2/outages/energy/incidents`**

This endpoint provides:
- Clean, simple data structure
- All essential information (location, customers affected, status)
- Summary statistics
- Smaller payload than v1 endpoint

---

**Discovery Date:** January 30, 2026
**Method:** Playwright browser automation + network monitoring
**Status:** Verified working with curl
