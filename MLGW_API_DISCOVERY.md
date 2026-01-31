# MLGW (Memphis Light, Gas & Water) Outage API Discovery

## Discovery Date
January 30, 2026

## API Endpoint

**URL:** `https://outagemap.mlgw.org/geojson.php`

**Method:** GET

**Format:** GeoJSON (application/json)

## Important Notes

### Authentication Requirements
- The API requires browser-like headers to prevent blocking
- **User-Agent** header is required
- **Referer** header is recommended

### Working curl Command
```bash
curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
     -H "Referer: https://outagemap.mlgw.org/" \
     'https://outagemap.mlgw.org/geojson.php'
```

## Data Structure

### Response Format
Standard GeoJSON FeatureCollection with Point geometries for each outage location.

### Sample Response
```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "OUTAGE_NO": 1483029,
                "TIME_STAMP": "01/30/2026 02:40:38 PM",
                "DURATION": "10 Mins",
                "IMPACT": "Single Customer",
                "STATUS": "The extent of the outage has been determined",
                "EST_REPAIR_TIME": "",
                "CUR_CUST_AFF": 1,
                "OUT_CAUSE": " "
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-90.09635, 35.03403]
            },
            "id": 1
        }
    ]
}
```

## Field Definitions

### Properties Object

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `OUTAGE_NO` | Integer | Unique outage identifier | 1483029 |
| `TIME_STAMP` | String | When the outage was reported | "01/30/2026 02:40:38 PM" |
| `DURATION` | String | How long the outage has lasted | "10 Mins", "38 Mins" |
| `IMPACT` | String | Scope of the outage | "Single Customer", potentially "Multiple Customers" |
| `STATUS` | String | Current status message | "Customer Svc is working this single customer outage", "The extent of the outage has been determined" |
| `EST_REPAIR_TIME` | String | Estimated restoration time (often empty) | "" |
| `CUR_CUST_AFF` | Integer | Current customers affected | 1, 2, etc. |
| `OUT_CAUSE` | String | Cause of outage (often empty/blank) | " " |

### Geometry Object

| Field | Type | Description |
|-------|------|-------------|
| `type` | String | Always "Point" |
| `coordinates` | Array | [longitude, latitude] in decimal degrees |

**Coordinate System:** WGS84 (EPSG:4326)
- Longitude: ~-90.0 (West)
- Latitude: ~35.0 (North)
- Coverage: Memphis/Shelby County, Tennessee area

## Usage Notes

1. **Update Frequency:** Unknown - recommend polling every 1-5 minutes
2. **Data Coverage:** All active outages in MLGW service territory
3. **Empty Outages:** The API returns a valid GeoJSON FeatureCollection even when there are no active outages (empty features array)
4. **Aggregation:** Each feature represents a distinct outage location; `CUR_CUST_AFF` indicates customers impacted

## Integration Example (Python)

```python
import requests

def fetch_mlgw_outages():
    url = "https://outagemap.mlgw.org/geojson.php"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://outagemap.mlgw.org/"
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    data = response.json()

    # Extract metrics
    total_outages = len(data["features"])
    total_customers_affected = sum(
        feature["properties"]["CUR_CUST_AFF"]
        for feature in data["features"]
    )

    return {
        "total_outages": total_outages,
        "total_customers_affected": total_customers_affected,
        "outages": data["features"]
    }
```

## Web Interface

**Primary Page:** https://www.mlgw.com/residential/outagemap

**Interactive Map:** https://outagemap.mlgw.org/

The interactive map uses:
- ArcGIS JavaScript API 4.33
- Esri basemap tiles
- Real-time GeoJSON data from the API endpoint

## Service Territory

Memphis Light, Gas and Water (MLGW) serves:
- Memphis, Tennessee
- Shelby County, Tennessee
- Approximately 428,500 customers (as seen in the map header)

## Discovery Method

Used Playwright browser automation to:
1. Navigate to the outage map page
2. Monitor network traffic
3. Identify the GeoJSON API endpoint used by the map
4. Verify with direct curl requests

## Related Files

- `/Users/jefffranzen/tn-power-tracker/mlgw-api-response-formatted.json` - Sample API response
- `/Users/jefffranzen/tn-power-tracker/mlgw-outage-map-final.png` - Screenshot of the web interface
- `/Users/jefffranzen/tn-power-tracker/discover-mlgw-api-v3.js` - Playwright discovery script

## Status Types Observed

Based on the sample data, status messages include:
- "Customer Svc is working this single customer outage"
- "The extent of the outage has been determined"

(Additional status types may exist for larger outages)

## Recommendations for Integration

1. **Polling Interval:** Poll every 2-5 minutes to balance freshness with server load
2. **Error Handling:** Implement retry logic with exponential backoff if requests are blocked
3. **Data Validation:** Validate GeoJSON structure before processing
4. **Customer Count:** Use `CUR_CUST_AFF` field to calculate total customers affected
5. **Timestamp Parsing:** Parse `TIME_STAMP` field to calculate actual outage duration
6. **Filtering:** Consider filtering out single-customer outages for public dashboards
