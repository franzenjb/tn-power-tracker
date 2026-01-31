# NES Outage API - Quick Start Guide

## TL;DR

```bash
# Get all current outages
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | jq .

# Get summary stats
./test-nes-api.sh
```

## API Endpoint

**URL:** `https://utilisocial.io/datacapable/v2/p/NES/map/events`

- No authentication required
- Returns JSON array of outage events
- Updates in near real-time
- CORS enabled

## Data Structure

```json
{
  "id": 2010512,
  "startTime": 1769718083000,        // Unix timestamp (ms)
  "lastUpdatedTime": 1769718623000,  // Unix timestamp (ms)
  "title": "Outage",
  "numPeople": 732,                   // Customers affected
  "status": "Unassigned",
  "cause": "",
  "identifier": "2635091",            // Ticket ID
  "latitude": 36.06196,
  "longitude": -86.8341
}
```

## Common Queries

### Total customers out
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | \
  jq '[.[] | .numPeople] | add'
```

### Number of outages
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | \
  jq 'length'
```

### Large outages (100+ customers)
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | \
  jq '[.[] | select(.numPeople >= 100)]'
```

### Outages by location
```bash
curl -s "https://utilisocial.io/datacapable/v2/p/NES/map/events" | \
  jq '[.[] | {customers: .numPeople, lat: .latitude, lon: .longitude}]'
```

## Integration

### Python Example
```python
import requests

response = requests.get('https://utilisocial.io/datacapable/v2/p/NES/map/events')
outages = response.json()

total_customers = sum(o['numPeople'] for o in outages)
print(f"Total customers affected: {total_customers}")
print(f"Total outages: {len(outages)}")
```

### JavaScript Example
```javascript
fetch('https://utilisocial.io/datacapable/v2/p/NES/map/events')
  .then(res => res.json())
  .then(outages => {
    const totalCustomers = outages.reduce((sum, o) => sum + o.numPeople, 0);
    console.log(`Total customers affected: ${totalCustomers}`);
    console.log(`Total outages: ${outages.length}`);
  });
```

## Files

- **NES_API_DISCOVERY.md** - Full technical documentation
- **test-nes-api.sh** - Automated test script
- **data/nes-sample-response.json** - Sample API response
- **discover-*.js** - Playwright discovery scripts

## Testing

Run the included test script:
```bash
chmod +x test-nes-api.sh
./test-nes-api.sh
```

## Source

Official NES Outage Map: https://www.nespower.com/user/report-outage

Powered by: UtiliSocial (datacapable platform)
