"""
Dominion Energy Virginia - Automated Scraper
Rank: #10 | 2,700,000 customers | VA
Platform: GENERIC
API: https://cdn.cookielaw.org/consent/e5dffbdb-5407-499a-97bf-16e0f36978be/e5dffbdb-5407-499a-97bf-16e0f36978be.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class DominionEnergyVirginiaScraper(BaseScraper):
    def __init__(self):
        super().__init__("Dominion Energy Virginia")
        self.api_url = "https://cdn.cookielaw.org/consent/e5dffbdb-5407-499a-97bf-16e0f36978be/e5dffbdb-5407-499a-97bf-16e0f36978be.json"
        self.state = "VA"
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
    scraper = DominionEnergyVirginiaScraper()
    print(scraper.scrape())
