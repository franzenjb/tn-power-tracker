"""
Auto-generated scraper for NIPSCO
Rank: 84 | Customers: 480,000 | State: IN
Generated: 2026-01-30T10:28:51.263009
"""

from base_scraper import BaseScraper
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class NIPSCOScraper(BaseScraper):
    """Scraper for NIPSCO"""

    def __init__(self):
        super().__init__("NIPSCO")
        self.api_url = "https://columbiagas-svc.smartcmobile.com/SmartChatBotAgentService/api/1/ChatBot/GetConfigSettings"
        self.state = "IN"
        self.customers_total = 480000

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
                'IN': self.standardize_output(
                    'IN',
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
    scraper = NIPSCOScraper()
    result = scraper.scrape()
    print(result)
