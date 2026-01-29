"""Memphis Light, Gas & Water scraper."""
from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class MLGWScraper(BaseScraper):
    """Scraper for Memphis Light, Gas & Water."""

    def __init__(self):
        super().__init__("Memphis Light, Gas & Water")
        # MLGW uses a different outage system - need to investigate
        self.api_url = "https://www.mlgw.com/outagedata"

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """
        Scrape MLGW outage data.

        MLGW serves Shelby County.
        """
        try:
            # Try to fetch outage data
            # MLGW may use different format - this is a placeholder
            data = self.fetch_json(self.api_url)

            customers_out = data.get('outages', 0)
            customers_tracked = data.get('customers', 437000)  # Approximate

            logger.info(f"[{self.utility_name}] Found {customers_out} customers out")

            return {
                'Shelby': self.standardize_output(
                    'Shelby',
                    customers_out,
                    customers_tracked
                )
            }

        except Exception as e:
            logger.error(f"[{self.utility_name}] Error scraping: {e}")
            # Return empty data
            return {
                'Shelby': self.standardize_output('Shelby', 0, 437000)
            }


if __name__ == '__main__':
    scraper = MLGWScraper()
    result = scraper.scrape()
    print(result)
