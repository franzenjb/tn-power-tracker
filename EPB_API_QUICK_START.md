# EPB Chattanooga API - Quick Start

## Working API Endpoint

```
https://api.epb.com/web/api/v2/outages/energy/incidents
```

## Test with curl

```bash
curl "https://api.epb.com/web/api/v2/outages/energy/incidents" | jq '.'
```

## Sample Response

```json
{
  "incidents": [
    {
      "customer_quantity": 1,
      "incident_status": "REPAIR_IN_PROGRESS",
      "latitude": 35.173673,
      "longitude": -85.328999
    },
    {
      "customer_quantity": 37,
      "incident_status": "REPAIR_IN_PROGRESS",
      "latitude": 35.352788,
      "longitude": -85.076639
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

## Data Structure

### Incidents Array
Each incident contains:
- `customer_quantity` - Number of customers affected
- `incident_status` - Current status (OUTAGE_REPORTED, REPAIR_IN_PROGRESS, etc.)
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate

### Summary Object
Aggregate statistics:
- `customers_affected` - Total customers without power
- `outage_incidents` - Total number of separate incidents
- `repairs_in_progress` - Number of active repair operations
- `customer_repairs_in_progress` - Customers being actively worked on

## Status Values

- `OUTAGE_REPORTED` - Outage reported, not yet being repaired
- `REPAIR_IN_PROGRESS` - Crews actively working
- `CREW_EN_ROUTE` - Crews on the way
- `RESTORED` - Power restored

## Alternative Endpoints

### v1 with District Data
```
https://api.epb.com/web/api/v1/outages/power/incidents
```
Includes district-level metrics and crew counts.

### Service Area Boundary
```
https://api.epb.com/web/api/v1/boundaries/service-area
```
Returns GeoJSON polygon of EPB service area.

## Integration Notes

- No authentication required
- CORS-enabled
- Updates in near real-time
- Coordinates are approximate (for privacy)

---

See `EPB_API_DISCOVERY.md` for full documentation.
