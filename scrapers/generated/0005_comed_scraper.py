"""
ComEd - Automated Scraper
Rank: #5 | 4,000,000 customers | IL
Platform: GENERIC
API: https://www.comed.com/api/GetConfig
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class ComEdScraper(BaseScraper):
    def __init__(self):
        super().__init__("ComEd")
        self.api_url = "https://www.comed.com/api/GetConfig"
        self.state = "IL"
        self.customers_total = 4000000

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
    scraper = ComEdScraper()
    print(scraper.scrape())
