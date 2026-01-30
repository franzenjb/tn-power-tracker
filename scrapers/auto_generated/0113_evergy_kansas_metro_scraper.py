"""
Auto-generated scraper for Evergy Kansas Metro
Rank: 113 | Customers: 300,000 | State: KS
Generated: 2026-01-30T10:36:07.188534
"""

from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class EvergyKansasMetroScraper(BaseScraper):
    """Scraper for Evergy Kansas Metro"""

    def __init__(self):
        super().__init__("Evergy Kansas Metro")
        self.api_url = "https://api-engage-us.sitecorecloud.io/v1.2/browser/create.json?client_key=77c6b08e47b988d13c05ddf9b0d3f826&message={}"
        self.state = "KS"
        self.customers_total = 300000

    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """Scrape outage data"""
        try:
            data = self.fetch_json(self.api_url)

            # TODO: Parse data structure (customize based on actual response)
            # Common patterns:
            # - data['customersOut'] or data['outages'] or data['totalOut']
            # - data['customersServed'] or data['totalCustomers']

            customers_out = 0  # CUSTOMIZE THIS
            customers_tracked = self.customers_total  # CUSTOMIZE THIS

            logger.info(f"[{self.utility_name}] {customers_out:,} / {customers_tracked:,} customers out")

            return {
                'KS': self.standardize_output(
                    'KS',
                    customers_out,
                    customers_tracked
                )
            }

        except Exception as e:
            logger.error(f"[{self.utility_name}] Error: {e}")
            return {}


if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.INFO)
    scraper = EvergyKansasMetroScraper()
    result = scraper.scrape()
    print(result)
