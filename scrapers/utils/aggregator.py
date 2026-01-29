"""Aggregate outage data from multiple sources."""
from typing import Dict, List, Any
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


def aggregate_by_county(scraper_results: List[Dict[str, Dict[str, Any]]]) -> Dict[str, Dict[str, Any]]:
    """
    Aggregate scraper results by county.

    When multiple sources report data for the same county,
    select the one with the highest outage count (most complete data).

    Args:
        scraper_results: List of dicts from each scraper

    Returns:
        Dict mapping county names to aggregated outage data
    """
    county_data = defaultdict(list)

    # Group all sources by county
    for result in scraper_results:
        if isinstance(result, dict):
            for county, data in result.items():
                county_data[county].append(data)

    # For each county, select the best source
    final = {}
    for county, sources in county_data.items():
        if not sources:
            continue

        # Pick source with highest customers_out
        best_source = max(sources, key=lambda x: x.get('customers_out', 0))
        final[county] = best_source

        if len(sources) > 1:
            logger.info(
                f"County {county} has {len(sources)} sources, "
                f"selected {best_source['source']} with {best_source['customers_out']} out"
            )

    return final


def fill_missing_counties(data: Dict[str, Dict[str, Any]], all_counties: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Fill in missing counties with zero outages.

    Args:
        data: Current outage data
        all_counties: List of all county names

    Returns:
        Complete data with all counties
    """
    from datetime import datetime

    for county in all_counties:
        if county not in data:
            data[county] = {
                'customers_out': 0,
                'customers_tracked': 0,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'source': 'No data available',
                'outage_percent': 0
            }

    return data
