"""Base scraper class with common functionality."""
import requests
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Abstract base class for utility scrapers."""

    def __init__(self, utility_name: str):
        self.utility_name = utility_name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    @abstractmethod
    def scrape(self) -> Dict[str, Dict[str, Any]]:
        """
        Scrape outage data from utility.

        Returns:
            Dict mapping county names to outage data:
            {
                'CountyName': {
                    'customers_out': int,
                    'customers_tracked': int,
                    'timestamp': str (ISO format),
                    'source': str (utility name)
                }
            }
        """
        pass

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def fetch_url(self, url: str, **kwargs) -> requests.Response:
        """Fetch URL with retry logic."""
        logger.info(f"[{self.utility_name}] Fetching {url}")
        response = self.session.get(url, timeout=30, **kwargs)
        response.raise_for_status()
        return response

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def fetch_json(self, url: str, **kwargs) -> Any:
        """Fetch JSON data with retry logic."""
        response = self.fetch_url(url, **kwargs)
        return response.json()

    def standardize_output(self, county: str, customers_out: int,
                          customers_tracked: int) -> Dict[str, Any]:
        """Create standardized output format."""
        return {
            'customers_out': customers_out,
            'customers_tracked': customers_tracked,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'source': self.utility_name,
            'outage_percent': round(
                (customers_out / customers_tracked * 100) if customers_tracked > 0 else 0,
                2
            )
        }
