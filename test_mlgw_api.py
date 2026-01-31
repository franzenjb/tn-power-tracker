#!/usr/bin/env python3
"""
Test script for MLGW Outage API
Demonstrates fetching and parsing outage data
"""

import requests
import json
from datetime import datetime

def fetch_mlgw_outages():
    """
    Fetch current outage data from MLGW API

    Returns:
        dict: Parsed outage data with summary metrics
    """
    url = "https://outagemap.mlgw.org/geojson.php"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://outagemap.mlgw.org/"
    }

    print(f"📡 Fetching data from: {url}")

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Calculate summary metrics
        total_outages = len(data.get("features", []))
        total_customers_affected = sum(
            feature["properties"]["CUR_CUST_AFF"]
            for feature in data.get("features", [])
        )

        # Extract unique status types
        status_types = set(
            feature["properties"]["STATUS"]
            for feature in data.get("features", [])
        )

        result = {
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "total_outages": total_outages,
            "total_customers_affected": total_customers_affected,
            "status_types": list(status_types),
            "outages": data.get("features", [])
        }

        return result

    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data: {e}")
        return {
            "timestamp": datetime.now().isoformat(),
            "success": False,
            "error": str(e)
        }

def print_summary(data):
    """Print a formatted summary of outage data"""

    if not data["success"]:
        print(f"\n❌ Failed to fetch data: {data.get('error', 'Unknown error')}")
        return

    print("\n" + "="*80)
    print("MLGW OUTAGE SUMMARY")
    print("="*80)
    print(f"Timestamp: {data['timestamp']}")
    print(f"Total Outages: {data['total_outages']}")
    print(f"Total Customers Affected: {data['total_customers_affected']}")
    print(f"\nStatus Types Observed:")
    for status in data['status_types']:
        print(f"  - {status}")

    if data['outages']:
        print(f"\n{'─'*80}")
        print("INDIVIDUAL OUTAGES:")
        print(f"{'─'*80}")

        for i, outage in enumerate(data['outages'], 1):
            props = outage['properties']
            coords = outage['geometry']['coordinates']

            print(f"\n{i}. Outage #{props['OUTAGE_NO']}")
            print(f"   Time: {props['TIME_STAMP']}")
            print(f"   Duration: {props['DURATION']}")
            print(f"   Customers Affected: {props['CUR_CUST_AFF']}")
            print(f"   Impact: {props['IMPACT']}")
            print(f"   Status: {props['STATUS']}")
            print(f"   Location: {coords[1]:.5f}°N, {coords[0]:.5f}°W")

            if props['EST_REPAIR_TIME']:
                print(f"   Est. Repair: {props['EST_REPAIR_TIME']}")
            if props['OUT_CAUSE'].strip():
                print(f"   Cause: {props['OUT_CAUSE']}")
    else:
        print("\n✅ No active outages reported!")

    print("\n" + "="*80)

if __name__ == "__main__":
    print("🔌 MLGW Power Outage API Test")
    print("="*80)

    data = fetch_mlgw_outages()
    print_summary(data)

    # Save raw data to file
    output_file = "mlgw_outages_latest.json"
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print(f"\n💾 Raw data saved to: {output_file}")
