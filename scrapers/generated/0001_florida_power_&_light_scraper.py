"""
Florida Power & Light - Automated Scraper
Rank: #1 | 5,800,000 customers | FL
Platform: GENERIC
API: https://www.fpl.com/data/eso-cq-values.json?10272025103115
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class FloridaPowerAndLightScraper(BaseScraper):
    def __init__(self):
        super().__init__("Florida Power & Light")
        self.api_url = "https://www.fpl.com/data/eso-cq-values.json?10272025103115"
        self.state = "FL"
        self.customers_total = 5800000

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
    scraper = FloridaPowerAndLightScraper()
    print(scraper.scrape())
