"""
Consumers Energy - Automated Scraper
Rank: #15 | 1,800,000 customers | MI
Platform: ARCGIS
API: https://js.arcgis.com/4.27/esri/widgets/Attribution/t9n/Attribution_en.json
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class ConsumersEnergyScraper(BaseScraper):
    def __init__(self):
        super().__init__("Consumers Energy")
        self.api_url = "https://js.arcgis.com/4.27/esri/widgets/Attribution/t9n/Attribution_en.json"
        self.state = "MI"
        self.customers_total = 1800000

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
    scraper = ConsumersEnergyScraper()
    print(scraper.scrape())
