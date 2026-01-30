"""
Georgia Power - Automated Scraper
Rank: #8 | 2,700,000 customers | GA
Platform: KUBRA
API: https://kubra.io/stormcenter/api/v1/stormcenters/7b38c047-7950-444b-a25c-9b3e5ab986eb/views/67b44af5-3847-4ca3-9f4e-9190aac343d6/currentState?preview=false
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class GeorgiaPowerScraper(BaseScraper):
    def __init__(self):
        super().__init__("Georgia Power")
        self.api_url = "https://kubra.io/stormcenter/api/v1/stormcenters/7b38c047-7950-444b-a25c-9b3e5ab986eb/views/67b44af5-3847-4ca3-9f4e-9190aac343d6/currentState?preview=false"
        self.state = "GA"
        self.customers_total = 2700000

    def scrape(self):
        try:
            data = self.fetch_json(self.api_url)

            # Parse based on platform (customize as needed)
            customers_out = data.get('customersOut', data.get('outages', 0))
            customers_tracked = data.get('customersServed', self.customers_total)

            logger.info(f"[{self.utility_name}] {customers_out:,} / {customers_tracked:,} out")

            return {
                self.state: self.standardize_output(
                    self.state,
                    customers_out,
                    customers_tracked
                )
            }

        except Exception as e:
            logger.error(f"[{self.utility_name}] Error: {e}")
            return {}


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    scraper = GeorgiaPowerScraper()
    print(scraper.scrape())
