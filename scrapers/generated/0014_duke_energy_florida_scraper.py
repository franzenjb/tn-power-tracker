"""
Duke Energy Florida - Automated Scraper
Rank: #14 | 1,900,000 customers | FL
Platform: GENERIC
API: https://outagemap.duke-energy.com/config/env.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class DukeEnergyFloridaScraper(BaseScraper):
    def __init__(self):
        super().__init__("Duke Energy Florida")
        self.api_url = "https://outagemap.duke-energy.com/config/env.json"
        self.state = "FL"
        self.customers_total = 1900000

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
    scraper = DukeEnergyFloridaScraper()
    print(scraper.scrape())
