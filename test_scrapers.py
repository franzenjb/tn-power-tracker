#!/usr/bin/env python3
"""
Test all generated scrapers and refine based on actual API responses
"""

import sys
import json
import requests
from pathlib import Path
from datetime import datetime

# Known working API endpoints from discovery
KNOWN_APIS = {
    'AEP Ohio': {
        'url': 'https://kubra.io/data/701742f7-7466-425b-b055-64405de54a84/public/summary-1/data.json',
        'parse': lambda d: {
            'customers_out': d['summaryFileData']['totals'][0]['total_cust_a']['val'],
            'customers_tracked': d['summaryFileData']['totals'][0]['total_cust_s']
        }
    },
    'Oncor': {
        'url': 'https://kubra.io/data/c9373c08-6df0-43da-a6f8-04f6fab7e690/public/summary-1/data.json',
        'parse': lambda d: {
            'customers_out': d['summaryFileData']['totals'][0]['total_cust_a']['val'],
            'customers_tracked': d['summaryFileData']['totals'][0]['total_cust_s']
        }
    },
    'Georgia Power': {
        'url': 'https://kubra.io/data/0e0e4078-5c9f-4c74-9156-c3e87c20912e/public/summary-1/data.json',
        'parse': lambda d: {
            'customers_out': d['summaryFileData']['totals'][0]['total_cust_a']['val'],
            'customers_tracked': d['summaryFileData']['totals'][0]['total_cust_s']
        }
    },
    'Duke Energy Carolinas': {
        'url': 'https://outagemap.duke-energy.com/ncsc/default.html',  # Need to find actual data endpoint
        'parse': lambda d: {'customers_out': 0, 'customers_tracked': 0}  # Placeholder
    }
}

def test_api(name, config):
    """Test a single API endpoint"""
    print(f"\n{'='*80}")
    print(f"🧪 Testing: {name}")
    print(f"   URL: {config['url']}")
    print(f"{'='*80}")

    try:
        response = requests.get(config['url'], timeout=10)
        response.raise_for_status()
        data = response.json()

        # Parse using utility-specific parser
        result = config['parse'](data)

        print(f"✅ SUCCESS")
        print(f"   Customers out: {result['customers_out']:,}")
        print(f"   Total customers: {result['customers_tracked']:,}")
        print(f"   Outage rate: {result['customers_out']/result['customers_tracked']*100:.3f}%")

        return {
            'status': 'SUCCESS',
            'customers_out': result['customers_out'],
            'customers_tracked': result['customers_tracked'],
            'timestamp': datetime.utcnow().isoformat()
        }

    except requests.exceptions.RequestException as e:
        print(f"❌ NETWORK ERROR: {e}")
        return {'status': 'NETWORK_ERROR', 'error': str(e)}
    except (KeyError, IndexError) as e:
        print(f"❌ PARSE ERROR: {e}")
        print(f"   Data structure may have changed")
        return {'status': 'PARSE_ERROR', 'error': str(e)}
    except Exception as e:
        print(f"❌ UNKNOWN ERROR: {e}")
        return {'status': 'ERROR', 'error': str(e)}

def main():
    print("\n" + "="*80)
    print("🧪 SCRAPER VALIDATION - Testing Known APIs")
    print("="*80)

    results = {}
    working = 0
    total = len(KNOWN_APIS)

    for name, config in KNOWN_APIS.items():
        result = test_api(name, config)
        results[name] = result
        if result['status'] == 'SUCCESS':
            working += 1

    print(f"\n{'='*80}")
    print(f"📊 VALIDATION SUMMARY")
    print(f"{'='*80}")
    print(f"Working APIs: {working} / {total} ({working/total*100:.1f}%)")

    # Calculate total coverage
    total_customers = sum(r['customers_tracked'] for r in results.values() if r['status'] == 'SUCCESS')
    total_out = sum(r['customers_out'] for r in results.values() if r['status'] == 'SUCCESS')

    print(f"\n📈 Current Coverage:")
    print(f"   Total customers tracked: {total_customers:,}")
    print(f"   Total customers out: {total_out:,}")
    print(f"   Overall outage rate: {total_out/total_customers*100:.3f}%")

    # Save results
    with open('/tmp/scraper_validation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✅ Results saved to /tmp/scraper_validation_results.json")

if __name__ == '__main__':
    main()
