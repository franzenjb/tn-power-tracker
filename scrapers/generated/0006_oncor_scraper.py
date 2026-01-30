"""
Oncor - Automated Scraper
Rank: #6 | 3,900,000 customers | TX
Platform: KUBRA
API: https://kubra.io/stormcenter/api/v1/stormcenters/560abba3-7881-4741-b538-ca416b58ba1e/views/ca124b24-9a06-4b19-aeb3-1841a9c962e1/currentState?preview=false
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class OncorScraper(BaseScraper):
    def __init__(self):
        super().__init__("Oncor")
        self.api_url = "https://kubra.io/stormcenter/api/v1/stormcenters/560abba3-7881-4741-b538-ca416b58ba1e/views/ca124b24-9a06-4b19-aeb3-1841a9c962e1/currentState?preview=false"
        self.state = "TX"
        self.customers_total = 3900000

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
    scraper = OncorScraper()
    print(scraper.scrape())
