"""EPB Chattanooga scraper."""
from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class EPBScraper(BaseScraper):
    """Scraper for EPB Chattanooga."""

    def __init__(self):
        super().__init__("EPB Chattanooga")
        self.api_url = "https://epb.com/outages/outagemap/data"

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """
        Scrape EPB outage data.

        EPB primarily serves Hamilton County.
        """
        try:
            data = self.fetch_json(self.api_url)

            customers_out = data.get('customersAffected', 0)
            customers_tracked = data.get('totalCustomers', 180000)

            logger.info(f"[{self.utility_name}] Found {customers_out} customers out")

            return {
                'Hamilton': self.standardize_output(
                    'Hamilton',
                    customers_out,
                    customers_tracked
                )
            }

        except Exception as e:
            logger.error(f"[{self.utility_name}] Error scraping: {e}")
            return {
                'Hamilton': self.standardize_output('Hamilton', 0, 180000)
            }


if __name__ == '__main__':
    scraper = EPBScraper()
    result = scraper.scrape()
    print(result)
