"""
National Grid NY - Automated Scraper
Rank: #17 | 1,700,000 customers | NY
Platform: GENERIC
API: https://s.yimg.com/wi/config/10207244.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class NationalGridNYScraper(BaseScraper):
    def __init__(self):
        super().__init__("National Grid NY")
        self.api_url = "https://s.yimg.com/wi/config/10207244.json"
        self.state = "NY"
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
    scraper = NationalGridNYScraper()
    print(scraper.scrape())
