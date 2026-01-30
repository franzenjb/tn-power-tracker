"""
Knoxville Utilities Board (KUB) scraper.
REAL ENDPOINT discovered via Playwright network interception on 2026-01-29
"""
from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class KUBScraper(BaseScraper):
    """Scraper for Knoxville Utilities Board."""

    def __init__(self):
        super().__init__("Knoxville Utilities Board")
        # REAL ENDPOINT (verified working 2026-01-29)
        self.api_url = "https://www.kub.org/outage-data/data.json"

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """
        Scrape KUB outage data.

        KUB primarily serves Knox County.
        Real API structure:
        {
          "electricOutageInfo": {
            "totalElectricCustomers": 226715,
            "electricCustomersWithoutPower": 0,
            "lastUpdated": "2026-01-29T01:45:25.080+00:00"
          },
          "electricOutages": [],
          "stormMode": "normal"
        }
        """
        try:
            data = self.fetch_json(self.api_url)

            outage_info = data.get('electricOutageInfo', {})
            customers_out = outage_info.get('electricCustomersWithoutPower', 0)
            customers_tracked = outage_info.get('totalElectricCustomers', 226715)

            logger.info(f"[{self.utility_name}] {customers_out:,} / {customers_tracked:,} customers out")

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
                'Knox': self.standardize_output('Knox', 0, 226715)
            }


if __name__ == '__main__':
    scraper = KUBScraper()
    result = scraper.scrape()
    print(result)
