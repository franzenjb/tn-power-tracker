"""
Con Edison - Automated Scraper
Rank: #7 | 3,500,000 customers | NY
Platform: GENERIC
API: https://cdn.weglot.com/projects-settings/a186ae7313bdecf545dd02cd071a25736.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class ConEdisonScraper(BaseScraper):
    def __init__(self):
        super().__init__("Con Edison")
        self.api_url = "https://cdn.weglot.com/projects-settings/a186ae7313bdecf545dd02cd071a25736.json"
        self.state = "NY"
        self.customers_total = 3500000

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
    scraper = ConEdisonScraper()
    print(scraper.scrape())
