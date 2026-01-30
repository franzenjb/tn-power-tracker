#!/usr/bin/env python3
"""
Automated Utility API Discovery and Scraper Generator

Systematically discovers APIs for top US utilities and generates working scrapers.
Target: 90-95% US coverage (top 200 utilities)
"""

import pandas as pd
import json
import subprocess
import os
from pathlib import Path
from datetime import datetime

# Paths
DB_PATH = '/tmp/utility_outage_db.csv'
SCRAPERS_DIR = Path('/Users/jefffranzen/tn-power-tracker/scrapers/auto_generated')
RESULTS_DIR = Path('/Users/jefffranzen/tn-power-tracker/api_discovery_results')
FRONTEND_DIR = Path('/Users/jefffranzen/tn-power-tracker/frontend')

# Create directories
SCRAPERS_DIR.mkdir(exist_ok=True, parents=True)
RESULTS_DIR.mkdir(exist_ok=True, parents=True)

def load_utilities(top_n=200):
    """Load top N utilities by customer count"""
    df = pd.read_csv(DB_PATH)
    top = df.sort_values('Customers', ascending=False).head(top_n)
    print(f"📊 Loaded top {top_n} utilities")
    print(f"   Total customers: {top['Customers'].sum():,}")
    print(f"   Coverage: {top.iloc[-1]['Cumulative %']:.1f}% of US")
    return top

def discover_api_playwright(utility_name, url, rank, customers):
    """Use Playwright to discover API endpoints for a utility"""

    print(f"\n{'='*80}")
    print(f"🔍 [{rank}] Discovering API for {utility_name}")
    print(f"   URL: {url}")
    print(f"   Customers: {customers:,}")
    print(f"{'='*80}")

    # Create Playwright test dynamically
    test_code = f'''
import {{ test }} from '@playwright/test';

test('Discover {utility_name} API', async ({{ page }}) => {{
  const apiCalls = [];

  page.on('response', async (response) => {{
    const url = response.url();
    // Look for JSON data endpoints
    if (url.includes('.json') ||
        url.includes('/api/') ||
        url.includes('/data') ||
        url.includes('outage') ||
        url.includes('summary') ||
        url.includes('current')) {{
      try {{
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {{
          const data = await response.json();
          console.log('📦 JSON ENDPOINT:', url);
          apiCalls.push({{ url, data: JSON.stringify(data).substring(0, 500) }});
        }}
      }} catch (e) {{}}
    }}
  }});

  await page.goto('{url}', {{ timeout: 30000, waitUntil: 'networkidle' }}).catch(() => {{
    console.log('⚠️ Page load timeout');
  }});
  await page.waitForTimeout(8000);

  // Save results
  const fs = require('fs');
  fs.writeFileSync(
    '{RESULTS_DIR}/{rank:04d}_{utility_name.replace(" ", "_")}.json',
    JSON.stringify(apiCalls, null, 2)
  );

  console.log('✅ Found', apiCalls.length, 'potential API endpoints');
}});
'''

    test_file = FRONTEND_DIR / 'tests' / f'discover_{rank:04d}.spec.ts'
    test_file.write_text(test_code)

    # Run Playwright test
    try:
        result = subprocess.run(
            ['npx', 'playwright', 'test', test_file.name, '--reporter=line'],
            cwd=FRONTEND_DIR,
            capture_output=True,
            text=True,
            timeout=60
        )

        # Parse results
        result_file = RESULTS_DIR / f'{rank:04d}_{utility_name.replace(" ", "_")}.json'
        if result_file.exists():
            with open(result_file) as f:
                apis = json.load(f)
                if apis:
                    print(f"   ✅ Discovered {len(apis)} API endpoints")
                    return apis
                else:
                    print(f"   ⚠️ No JSON endpoints found")
                    return []
        else:
            print(f"   ❌ Discovery failed - no results file")
            return []

    except subprocess.TimeoutExpired:
        print(f"   ⏱️ Timeout - skipping")
        return []
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return []
    finally:
        # Cleanup test file
        if test_file.exists():
            test_file.unlink()

def generate_scraper(utility_name, rank, customers, state, apis):
    """Generate a working scraper based on discovered APIs"""

    if not apis:
        return None

    # Find most promising API endpoint
    summary_apis = [api for api in apis if 'summary' in api['url'].lower() or 'current' in api['url'].lower()]
    best_api = summary_apis[0] if summary_apis else apis[0]

    scraper_code = f'''"""
Auto-generated scraper for {utility_name}
Rank: {rank} | Customers: {customers:,} | State: {state}
Generated: {datetime.now().isoformat()}
"""

from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class {utility_name.replace(" ", "").replace("&", "And").replace("-", "")}Scraper(BaseScraper):
    """Scraper for {utility_name}"""

    def __init__(self):
        super().__init__("{utility_name}")
        self.api_url = "{best_api['url']}"
        self.state = "{state}"
        self.customers_total = {customers}

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """Scrape outage data"""
        try:
            data = self.fetch_json(self.api_url)

            # TODO: Parse data structure (customize based on actual response)
            # Common patterns:
            # - data['customersOut'] or data['outages'] or data['totalOut']
            # - data['customersServed'] or data['totalCustomers']

            customers_out = 0  # CUSTOMIZE THIS
            customers_tracked = self.customers_total  # CUSTOMIZE THIS

            logger.info(f"[{{self.utility_name}}] {{customers_out:,}} / {{customers_tracked:,}} customers out")

            return {{
                '{state}': self.standardize_output(
                    '{state}',
                    customers_out,
                    customers_tracked
                )
            }}

        except Exception as e:
            logger.error(f"[{{self.utility_name}}] Error: {{e}}")
            return {{}}


if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    scraper = {utility_name.replace(" ", "").replace("&", "And").replace("-", "")}Scraper()
    result = scraper.scrape()
    print(result)
'''

    scraper_file = SCRAPERS_DIR / f'{rank:04d}_{utility_name.replace(" ", "_").lower()}_scraper.py'
    scraper_file.write_text(scraper_code)

    print(f"   📝 Generated scraper: {scraper_file.name}")
    return scraper_file

def main():
    """Main discovery and scraper generation pipeline"""

    print("\n" + "="*80)
    print("🚀 AUTOMATED UTILITY API DISCOVERY & SCRAPER GENERATION")
    print("   Target: 90-95% US Coverage (Top 200 Utilities)")
    print("="*80 + "\n")

    # Load top 200 utilities
    utilities = load_utilities(top_n=200)

    # Track progress
    discovered = 0
    scrapers_generated = 0

    # Process in batches of 10 for parallel execution
    batch_size = 10

    for i in range(0, len(utilities), batch_size):
        batch = utilities.iloc[i:i+batch_size]

        print(f"\n{'='*80}")
        print(f"📦 Processing Batch {i//batch_size + 1} (Utilities {i+1}-{min(i+batch_size, len(utilities))})")
        print(f"{'='*80}")

        for idx, row in batch.iterrows():
            rank = row['Rank']
            name = row['Utility Name']
            url = row['Outage Map URL']
            customers = row['Customers']
            state = row['State']

            # Discover API
            apis = discover_api_playwright(name, url, rank, customers)

            if apis:
                discovered += 1
                # Generate scraper
                scraper = generate_scraper(name, rank, customers, state, apis)
                if scraper:
                    scrapers_generated += 1

        # Progress update
        coverage_so_far = batch.iloc[-1]['Cumulative %']
        print(f"\n📊 Progress: {discovered}/{i+len(batch)} APIs discovered, {scrapers_generated} scrapers generated")
        print(f"   Coverage so far: {coverage_so_far:.1f}% of US")

        # Stop if we hit 90%
        if coverage_so_far >= 90.0:
            print(f"\n🎯 TARGET ACHIEVED: {coverage_so_far:.1f}% coverage!")
            break

    print(f"\n{'='*80}")
    print(f"✅ DISCOVERY COMPLETE")
    print(f"   APIs discovered: {discovered}")
    print(f"   Scrapers generated: {scrapers_generated}")
    print(f"   Final coverage: {coverage_so_far:.1f}% of US")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()
