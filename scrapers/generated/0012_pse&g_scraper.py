"""
PSE&G - Automated Scraper
Rank: #12 | 2,300,000 customers | NJ
Platform: GENERIC
API: https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class PSEAndGScraper(BaseScraper):
    def __init__(self):
        super().__init__("PSE&G")
        self.api_url = "https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true"
        self.state = "NJ"
        self.customers_total = 2300000

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
    scraper = PSEAndGScraper()
    print(scraper.scrape())
