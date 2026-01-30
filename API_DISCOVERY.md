# Tennessee Utilities - API Endpoint Discovery

**Date:** January 29, 2026
**Method:** Playwright network interception + manual testing
**Status:** Phase 1 - Municipal utilities research

---

## ✅ SUCCESSFULLY DISCOVERED

### 1. Knoxville Utilities Board (KUB)
- **Outage Map URL:** https://www.kub.org/outage/map
- **API Endpoint:** `https://www.kub.org/outage-data/data.json`
- **Method:** GET
- **Format:** JSON
- **Status:** ✅ WORKING - Verified 2026-01-29

**Data Structure:**
```json
{
  "electricOutageInfo": {
    "totalElectricCustomers": 226715,
    "electricCustomersWithoutPower": 0,
    "lastUpdated": "2026-01-29T01:45:25.080+00:00"
  },
  "electricOutages": [],
  "electricOutageDetails": [],
  "stormMode": "normal",
  "electricOutageHistories": [...]
}
```

**Key Fields:**
- `electricOutageInfo.totalElectricCustomers` - Total customer count
- `electricOutageInfo.electricCustomersWithoutPower` - Current outages
- `electricOutageInfo.lastUpdated` - Timestamp

**Counties:** Knox
**Scraper:** `/scrapers/kub_scraper.py` - Updated with real endpoint

---

## ⚠️ PENDING DISCOVERY

### 2. Nashville Electric Service (NES)
- **Outage Map URL:** https://www.nespower.com/outages/
- **Counties:** Davidson
- **Status:** ⏳ INVESTIGATING
- **Notes:**
  - Page loads successfully
  - Interactive map visible
  - Uses ArcGIS for mapping (detected js.arcgis.com/4.29 calls)
  - Need to identify data source endpoint

**Next Steps:**
- Check for embedded JSON in page source
- Inspect iframe sources
- Look for XHR/Fetch calls when map loads
- Check ArcGIS FeatureServer URLs

### 3. Memphis Light, Gas & Water (MLGW)
- **Outage Map URL:** https://www.mlgw.com/residential/outagemap (landing page)
- **Alt URL:** https://outagemap.mlgw.org/ (from database)
- **Counties:** Shelby
- **Status:** ⏳ INVESTIGATING
- **Notes:**
  - Landing page doesn't embed the actual map
  - Has link to "Electric Outage Summary Map"
  - Need to test alt URL: https://outagemap.mlgw.org/

**Next Steps:**
- Navigate to https://outagemap.mlgw.org/ directly
- Intercept network calls on actual map page

### 4. EPB Chattanooga
- **Outage Map URL:** https://epb.com/outage-and-storm-center/energy-outages/ (from database)
- **Tested URL:** https://epb.com/outage-storm-center/energy-outages/ (404 error)
- **Counties:** Hamilton
- **Status:** ⏳ INVESTIGATING
- **Notes:**
  - URL discrepancy found
  - Need to verify correct current URL

**Next Steps:**
- Test database URL directly
- Search EPB.com for current outage map link

---

## 🚧 COOPERATIVE UTILITIES - PATTERN DISCOVERY

### OutageMap.coop Platform (Kubra-based)
**Utilities using this platform** (10+ cooperatives):
- Middle Tennessee Electric (MTE)
- Volunteer Energy Cooperative
- Meriwether Lewis Electric
- Sequachee Valley Electric
- Appalachian Electric
- Gibson Electric
- Plus 4+ more...

**Strategy:** Build ONE generic scraper for all OutageMap.coop utilities
**Priority:** HIGH - covers many counties

**Standard URL format:**
```
https://[utility-name].outagemap.coop/
```

**Next Steps:**
- Test MTE as proof of concept: https://mtemc.outagemap.coop/
- Reverse-engineer Kubra API structure
- If successful, replicate for all OutageMap.coop utilities

### OutageEntry Platform
**Utilities using this:**
- Chickasaw Electric
- Tri-State Electric
- Forked Deer Electric

**Standard URL format:**
```
https://www.outageentry.com/CustomerFacingAppJQM/outage.php?clientid=[UTILITY_ID]
```

**Next Steps:**
- Test one utility
- Build generic scraper if API accessible

---

## 📊 CURRENT OUTAGE TOTALS (Verified Data)

### As of 2026-01-29 ~6:00 PM EST

| Utility | County | Customers Out | Total Customers | % Out | Data Source |
|---------|--------|---------------|-----------------|-------|-------------|
| KUB     | Knox   | 0             | 226,715         | 0.0%  | Real API    |

**Other utilities:** Pending API discovery
**Total coverage so far:** 1 of 27 utilities (~4% of TN)

---

## 🎯 IMMEDIATE NEXT ACTIONS

### Phase 1: Complete Municipal Utilities (Day 1-2)
1. ✅ KUB - DONE
2. ⏳ NES - Research ArcGIS data source
3. ⏳ MLGW - Test https://outagemap.mlgw.org/
4. ⏳ EPB - Verify correct URL

**Goal:** 100% coverage of 4 major cities (covers ~50% of TN customers)

### Phase 2: OutageMap.coop Platform (Day 3)
1. Reverse-engineer MTE outage map
2. Build generic Kubra scraper
3. Deploy to all 10+ cooperatives using same platform

**Goal:** Cover majority of remaining counties

### Phase 3: Custom Platforms (Day 4-5)
1. Research remaining cooperatives
2. Build platform-specific scrapers
3. Handle edge cases (phone-only utilities)

**Goal:** 100% Tennessee coverage

---

## 🔬 RESEARCH METHODOLOGY

### Tools Used:
1. **Playwright** - Network interception, screenshot verification
2. **Chrome DevTools** - Manual inspection when needed
3. **Python requests** - API testing
4. **curl** - Quick endpoint verification

### Process:
1. Load utility outage map page in Playwright
2. Intercept all network requests
3. Filter for JSON/API endpoints
4. Take screenshot to verify page loads
5. Test discovered endpoints with curl
6. Build scraper with real endpoint
7. Verify with live data

### Lessons Learned:
- ❌ Never use placeholder/fake endpoints
- ✅ Always verify URLs from database
- ✅ Screenshot testing catches broken pages
- ✅ Many cooperatives share common platforms
- ✅ Real-time network interception is most reliable method

---

## 📈 PROGRESS METRICS

- **Utilities Researched:** 4 / 27 (15%)
- **APIs Discovered:** 1 / 27 (4%)
- **Scrapers Working:** 1 / 27 (4%)
- **Counties Covered:** 1 / 95 (1%)
- **Customer Coverage:** ~227K / ~2.5M (9%)

**Target:** 27/27 utilities with real APIs by end of week
