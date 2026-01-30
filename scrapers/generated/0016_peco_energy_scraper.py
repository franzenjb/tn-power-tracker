"""
PECO Energy - Automated Scraper
Rank: #16 | 1,700,000 customers | PA
Platform: GENERIC
API: https://www.peco.com/api/GetConfig
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class PECOEnergyScraper(BaseScraper):
    def __init__(self):
        super().__init__("PECO Energy")
        self.api_url = "https://www.peco.com/api/GetConfig"
        self.state = "PA"
        self.customers_total = 1700000

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
    scraper = PECOEnergyScraper()
    print(scraper.scrape())
