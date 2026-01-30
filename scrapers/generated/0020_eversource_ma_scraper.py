"""
Eversource MA - Automated Scraper
Rank: #20 | 1,500,000 customers | MA
Platform: GENERIC
API: https://www.eversource.com/RestApi/personalizations/render?pageNodeId=540db03e-9545-4ea6-a604-eaae7b959509&pageDataId=7a439edc-7a56-4552-b493-8d2ff924773e&pageNodeKey=540DB03E-9545-4EA6-A604-EAAE7B959509/bafed630-1d7b-4a4c-acac-6a2160725a00/SitefinitySiteMap&url=https%3A%2F%2Fwww.eversource.com%2Ferror%2Fpage-not-found%3FinitialRequestUrl%3Dhttps%253a%252f%252fwww.eversource.com%252fresidential%252foutages%252fcurrent-outages&controls=dcfb6ea8-7aaa-438f-80b4-7dd24ac482b2_1,d6c2f7b4-c44a-4b83-a853-78fb6d19a5c6_1&correlationId=ml10pnbvav51mrmsak6
"""

from base_scraper import BaseScraper
import logging

logger = logging.getLogger(__name__)


class EversourceMAScraper(BaseScraper):
    def __init__(self):
        super().__init__("Eversource MA")
        self.api_url = "https://www.eversource.com/RestApi/personalizations/render?pageNodeId=540db03e-9545-4ea6-a604-eaae7b959509&pageDataId=7a439edc-7a56-4552-b493-8d2ff924773e&pageNodeKey=540DB03E-9545-4EA6-A604-EAAE7B959509/bafed630-1d7b-4a4c-acac-6a2160725a00/SitefinitySiteMap&url=https%3A%2F%2Fwww.eversource.com%2Ferror%2Fpage-not-found%3FinitialRequestUrl%3Dhttps%253a%252f%252fwww.eversource.com%252fresidential%252foutages%252fcurrent-outages&controls=dcfb6ea8-7aaa-438f-80b4-7dd24ac482b2_1,d6c2f7b4-c44a-4b83-a853-78fb6d19a5c6_1&correlationId=ml10pnbvav51mrmsak6"
        self.state = "MA"
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
    scraper = EversourceMAScraper()
    print(scraper.scrape())
