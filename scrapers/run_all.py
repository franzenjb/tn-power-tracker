"""Run all scrapers and aggregate results using REAL PowerOutage.us scraper."""
import asyncio
import json
import sys
import os
from pathlib import Path
from datetime import datetime
import logging
import requests

# Add scrapers directory to path
sys.path.insert(0, str(Path(__file__).parent))

from utils.aggregator import aggregate_by_county, fill_missing_counties
from utils.service_territories import TN_COUNTIES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def scrape_poweroutage_us():
    """Scrape PowerOutage.us API for Tennessee data."""
    try:
        logger.info("Scraping PowerOutage.us API...")

        url = "https://poweroutage.us/api/states"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://poweroutage.us/'
        }

        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        data = response.json()

        # Find Tennessee
        for state in data:
            if state.get('name') == 'Tennessee' or state.get('id') == 'Tennessee':
                logger.info(f"Found TN state data: {state.get('customers_out', 0)} customers out")

                # Try to get county-level data
                state_id = state.get('id', 'Tennessee').lower()
                county_url = f"https://poweroutage.us/api/counties?state={state_id}"

                county_response = requests.get(county_url, headers=headers, timeout=15)
                if county_response.status_code == 200:
                    counties_data = county_response.json()
                    logger.info(f"Got county data: {len(counties_data) if isinstance(counties_data, list) else 'state-level only'}")
                    return parse_poweroutage_data(counties_data)

                # Fallback to state-level data
                return {
                    'Statewide': {
                        'customers_out': state.get('customers_out', 0),
                        'customers_tracked': state.get('customers_tracked', 0),
                        'timestamp': datetime.utcnow().isoformat() + 'Z',
                        'source': 'PowerOutage.us',
                        'outage_percent': 0
                    }
                }

        logger.warning("Tennessee not found in PowerOutage.us API")
        return {}

    except Exception as e:
        logger.error(f"PowerOutage.us scraping failed: {e}")
        return {}


def parse_poweroutage_data(data):
    """Parse county data from PowerOutage.us."""
    result = {}

    if isinstance(data, list):
        for county_data in data:
            county_name = county_data.get('name', '').replace(' County', '').strip()
            if county_name in TN_COUNTIES:
                result[county_name] = {
                    'customers_out': county_data.get('customers_out', 0),
                    'customers_tracked': county_data.get('customers_tracked', 0),
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                    'source': 'PowerOutage.us',
                    'outage_percent': 0
                }

    return result


async def run_all_scrapers():
    """Run PowerOutage.us scraper (the one that actually works)."""
    logger.info("Running PowerOutage.us scraper...")

    # Use the REAL scraper that we already built
    poweroutage_data = scrape_poweroutage_us()

    valid_results = [poweroutage_data] if poweroutage_data else []
    logger.info(f"PowerOutage.us returned {len(poweroutage_data)} counties with data")

    # Aggregate by county
    aggregated = aggregate_by_county(valid_results)

    # Fill missing counties
    complete = fill_missing_counties(aggregated, TN_COUNTIES)

    # Calculate totals
    total_out = sum(d['customers_out'] for d in complete.values())
    total_tracked = sum(d['customers_tracked'] for d in complete.values())
    counties_affected = sum(1 for d in complete.values() if d['customers_out'] > 0)

    summary = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'total_counties': len(TN_COUNTIES),
        'counties_affected': counties_affected,
        'total_customers_out': total_out,
        'total_customers_tracked': total_tracked,
        'outage_percent': round((total_out / total_tracked * 100) if total_tracked > 0 else 0, 2),
        'counties': complete
    }

    return summary


def save_json(data, filepath):
    """Save data to JSON file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

    logger.info(f"Saved data to {filepath}")


def save_historical(data, history_dir):
    """Save timestamped historical snapshot."""
    os.makedirs(history_dir, exist_ok=True)

    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    filepath = os.path.join(history_dir, f'outages_{timestamp}.json')

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

    logger.info(f"Saved historical snapshot to {filepath}")


def main():
    """Main entry point."""
    # Determine project root
    project_root = Path(__file__).parent.parent
    data_dir = project_root / 'data'
    history_dir = data_dir / 'history'

    # Run scrapers
    summary = asyncio.run(run_all_scrapers())

    # Save current data
    save_json(summary, data_dir / 'current_outages.json')

    # Save historical snapshot
    save_historical(summary, history_dir)

    # Also save to frontend public directory for easy access
    frontend_data = project_root / 'frontend' / 'public' / 'data'
    save_json(summary, frontend_data / 'current_outages.json')

    logger.info(
        f"Complete! {summary['total_customers_out']:,} customers out "
        f"across {summary['counties_affected']} counties"
    )


if __name__ == '__main__':
    main()
