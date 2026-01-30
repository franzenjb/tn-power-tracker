"""
Pacific Gas & Electric - Automated Scraper
Rank: #2 | 5,500,000 customers | CA
Platform: GENERIC
API: https://cdn.cookielaw.org/consent/838e5e40-6705-4395-8583-c1a72f214e72/838e5e40-6705-4395-8583-c1a72f214e72.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class PacificGasAndElectricScraper(BaseScraper):
    def __init__(self):
        super().__init__("Pacific Gas & Electric")
        self.api_url = "https://cdn.cookielaw.org/consent/838e5e40-6705-4395-8583-c1a72f214e72/838e5e40-6705-4395-8583-c1a72f214e72.json"
        self.state = "CA"
        self.customers_total = 5500000

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
    scraper = PacificGasAndElectricScraper()
    print(scraper.scrape())
