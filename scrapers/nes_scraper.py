"""Nashville Electric Service scraper."""
from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class NEScraper(BaseScraper):
    """Scraper for Nashville Electric Service."""

    def __init__(self):
        super().__init__("Nashville Electric Service")
        self.api_url = "https://www.nespower.com/OutageMap/rest/OutageSummaryService"

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """
        Scrape NES outage data.

        NES serves Davidson County.
        """
        try:
            data = self.fetch_json(self.api_url)

            # NES API returns summary data
            # Example: {"totalCustomersOut": 84484, "totalCustomersTracked": 400000}
            customers_out = data.get('totalCustomersOut', 0)
            customers_tracked = data.get('totalCustomersTracked', 0)

            logger.info(f"[{self.utility_name}] Found {customers_out} customers out")

            return {
                'Davidson': self.standardize_output(
                    'Davidson',
                    customers_out,
                    customers_tracked
                )
            }

        except Exception as e:
            logger.error(f"[{self.utility_name}] Error scraping: {e}")
            # Return empty data rather than failing completely
            return {
                'Davidson': self.standardize_output('Davidson', 0, 400000)
            }


if __name__ == '__main__':
    scraper = NEScraper()
    result = scraper.scrape()
    print(result)
