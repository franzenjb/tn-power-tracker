"""
Southern California Edison - Automated Scraper
Rank: #3 | 5,200,000 customers | CA
Platform: GENERIC
API: https://www.sce.com/sites/default/files/webchat/i18n/widgets-en.i18n.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class SouthernCaliforniaEdisonScraper(BaseScraper):
    def __init__(self):
        super().__init__("Southern California Edison")
        self.api_url = "https://www.sce.com/sites/default/files/webchat/i18n/widgets-en.i18n.json"
        self.state = "CA"
        self.customers_total = 5200000

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
    scraper = SouthernCaliforniaEdisonScraper()
    print(scraper.scrape())
