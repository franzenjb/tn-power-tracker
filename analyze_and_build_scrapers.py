#!/usr/bin/env python3
"""
Analyze discovered APIs and generate optimized scrapers
"""

import json
import glob
from pathlib import Path
from collections import defaultdict

DISCOVERY_DIR = Path('/tmp')
SCRAPERS_DIR = Path('/Users/jefffranzen/tn-power-tracker/scrapers/generated')
SCRAPERS_DIR.mkdir(exist_ok=True, parents=True)

def analyze_discoveries():
    """Analyze all discovered API files"""

    discovery_files = glob.glob(str(DISCOVERY_DIR / 'api_discovery_*.json'))

    print(f"\n{'='*80}")
    print(f"📊 ANALYZING {len(discovery_files)} DISCOVERED UTILITIES")
    print(f"{'='*80}\n")

    platforms = defaultdict(list)
    total_customers = 0
    apis_found = 0

    results = []

    for file_path in sorted(discovery_files):
        with open(file_path) as f:
            data = json.load(f)

        results.append(data)
        total_customers += data['customers']

        if data['apis_found'] > 0:
            apis_found += 1

            # Identify platform patterns
            for api in data['apis']:
                url = api['url']

                if 'kubra.io' in url or 'stormcenter' in url:
                    platforms['Kubra'].append(data['name'])
                elif 'outagemap' in url and 'duke-energy' in url:
                    platforms['Duke Energy Platform'].append(data['name'])
                elif 'arcgis.com' in url or 'esri' in url:
                    platforms['ArcGIS/ESRI'].append(data['name'])
                elif 'outagemap.coop' in url or 'outagemap-data.cloud.coop' in url:
                    platforms['OutageMap.coop'].append(data['name'])
                else:
                    platforms['Custom'].append(data['name'])
                break  # Only count first API per utility

            print(f"✅ [{data['rank']:3d}] {data['name']:40s} - {data['apis_found']} APIs")
            print(f"      🔗 Primary: {data['apis'][0]['url'][:80]}")
        else:
            print(f"❌ [{data['rank']:3d}] {data['name']:40s} - No APIs found")

    print(f"\n{'='*80}")
    print(f"📈 SUMMARY")
    print(f"{'='*80}")
    print(f"Utilities analyzed: {len(results)}")
    print(f"APIs discovered: {apis_found} / {len(results)} ({apis_found/len(results)*100:.1f}%)")
    print(f"Total customers covered: {total_customers:,}")
    print(f"\n🏗️  PLATFORM BREAKDOWN:")
    for platform, utils in sorted(platforms.items(), key=lambda x: -len(x[1])):
        print(f"  {platform:25s}: {len(utils):3d} utilities")
        if len(utils) <= 5:
            for u in utils:
                print(f"    - {u}")

    return results, platforms

def generate_scraper(utility_data):
    """Generate scraper for a utility based on discovered APIs"""

    if not utility_data['apis']:
        return None

    name = utility_data['name']
    rank = utility_data['rank']
    state = utility_data['state']
    customers = utility_data['customers']
    api_url = utility_data['apis'][0]['url']

    # Determine platform and scraper template
    if 'kubra.io' in api_url:
        template = 'kubra'
    elif 'outagemap-data.cloud.coop' in api_url:
        template = 'outagemap_coop'
    elif 'arcgis.com' in api_url:
        template = 'arcgis'
    else:
        template = 'generic'

    class_name = name.replace(" ", "").replace("&", "And").replace("-", "").replace("'", "")

    scraper_code = f'''"""
{name} - Automated Scraper
Rank: #{rank} | {customers:,} customers | {state}
Platform: {template.upper()}
API: {api_url}
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class {class_name}Scraper(BaseScraper):
    def __init__(self):
        super().__init__("{name}")
        self.api_url = "{api_url}"
        self.state = "{state}"
        self.customers_total = {customers}

    def scrape(self):
        try:
            data = self.fetch_json(self.api_url)

            # Parse based on platform (customize as needed)
            customers_out = data.get('customersOut', data.get('outages', 0))
            customers_tracked = data.get('customersServed', self.customers_total)

            logger.info(f"[{{self.utility_name}}] {{customers_out:,}} / {{customers_tracked:,}} out")

            return {{
                self.state: self.standardize_output(
                    self.state,
                    customers_out,
                    customers_tracked
                )
            }}

        except Exception as e:
            logger.error(f"[{{self.utility_name}}] Error: {{e}}")
            return {{}}


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    scraper = {class_name}Scraper()
    print(scraper.scrape())
'''

    scraper_file = SCRAPERS_DIR / f'{rank:04d}_{name.replace(" ", "_").lower()}_scraper.py'
    scraper_file.write_text(scraper_code)

    return scraper_file

def main():
    results, platforms = analyze_discoveries()

    print(f"\n{'='*80}")
    print(f"🔨 GENERATING SCRAPERS")
    print(f"{'='*80}\n")

    generated = 0
    for utility in results:
        if utility['apis_found'] > 0:
            scraper = generate_scraper(utility)
            if scraper:
                print(f"  ✅ Generated: {scraper.name}")
                generated += 1

    print(f"\n{'='*80}")
    print(f"✅ COMPLETE: {generated} scrapers generated")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()
