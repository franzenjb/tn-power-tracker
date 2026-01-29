"""Run all scrapers and aggregate results."""
import asyncio
import json
import sys
import os
from pathlib import Path
from datetime import datetime
import logging

# Add scrapers directory to path
sys.path.insert(0, str(Path(__file__).parent))

from nes_scraper import NEScraper
from mlgw_scraper import MLGWScraper
from epb_scraper import EPBScraper
from kub_scraper import KUBScraper
from utils.aggregator import aggregate_by_county, fill_missing_counties
from utils.service_territories import TN_COUNTIES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def run_scraper_async(scraper):
    """Run a single scraper asynchronously."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, scraper.scrape)


async def run_all_scrapers():
    """Run all scrapers in parallel and aggregate results."""
    scrapers = [
        NEScraper(),
        MLGWScraper(),
        EPBScraper(),
        KUBScraper(),
    ]

    logger.info(f"Running {len(scrapers)} scrapers in parallel...")

    # Run all scrapers concurrently
    tasks = [run_scraper_async(scraper) for scraper in scrapers]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out exceptions
    valid_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Scraper {scrapers[i].utility_name} failed: {result}")
        else:
            valid_results.append(result)

    logger.info(f"Successfully ran {len(valid_results)}/{len(scrapers)} scrapers")

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
