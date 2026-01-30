"""
AEP Ohio - Automated Scraper
Rank: #21 | 1,500,000 customers | OH
Platform: KUBRA
API: https://kubra.io/stormcenter/api/v1/stormcenters/9c0735d8-b721-4dce-b80b-558e98ce1083/views/9b2feb80-69f8-4035-925e-f2acbcf1728e/currentState?preview=false
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class AEPOhioScraper(BaseScraper):
    def __init__(self):
        super().__init__("AEP Ohio")
        self.api_url = "https://kubra.io/stormcenter/api/v1/stormcenters/9c0735d8-b721-4dce-b80b-558e98ce1083/views/9b2feb80-69f8-4035-925e-f2acbcf1728e/currentState?preview=false"
        self.state = "OH"
        self.customers_total = 1500000

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
    scraper = AEPOhioScraper()
    print(scraper.scrape())
