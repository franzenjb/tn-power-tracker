"""
Duke Energy Carolinas - Automated Scraper
Rank: #11 | 2,600,000 customers | NC
Platform: GENERIC
API: https://outagemap.duke-energy.com/config/env.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class DukeEnergyCarolinasScraper(BaseScraper):
    def __init__(self):
        super().__init__("Duke Energy Carolinas")
        self.api_url = "https://outagemap.duke-energy.com/config/env.json"
        self.state = "NC"
        self.customers_total = 2600000

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
    scraper = DukeEnergyCarolinasScraper()
    print(scraper.scrape())
