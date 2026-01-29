"""Knoxville Utilities Board scraper."""
from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class KUBScraper(BaseScraper):
    """Scraper for Knoxville Utilities Board."""

    def __init__(self):
        super().__init__("Knoxville Utilities Board")
        self.api_url = "https://kubinteractive.com/outage/data"

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """
        Scrape KUB outage data.

        KUB primarily serves Knox County.
        """
        try:
            data = self.fetch_json(self.api_url)

            customers_out = data.get('totalOut', 0)
            customers_tracked = data.get('totalCustomers', 230000)

            logger.info(f"[{self.utility_name}] Found {customers_out} customers out")

            return {
                'Knox': self.standardize_output(
                    'Knox',
                    customers_out,
                    customers_tracked
                )
            }

        except Exception as e:
            logger.error(f"[{self.utility_name}] Error scraping: {e}")
            return {
                'Knox': self.standardize_output('Knox', 0, 230000)
            }


if __name__ == '__main__':
    scraper = KUBScraper()
    result = scraper.scrape()
    print(result)
