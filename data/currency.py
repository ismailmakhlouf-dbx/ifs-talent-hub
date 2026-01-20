"""
Currency Conversion Utilities
Fixed FX rates for consistent salary conversions across the application.
Rates as of January 2026 (approximate).
"""

from typing import Tuple, Dict, Any

# ===========================================
# FIXED EXCHANGE RATES (GBP as base currency)
# ===========================================
# All rates are: 1 GBP = X foreign currency
FX_RATES = {
    "GBP": 1.0,      # Base currency
    "USD": 1.27,     # 1 GBP = 1.27 USD
    "SEK": 13.20,    # 1 GBP = 13.20 SEK
    "EUR": 1.17,     # 1 GBP = 1.17 EUR (for future use)
}

# Currency display configuration
CURRENCY_CONFIG = {
    "GBP": {"symbol": "£", "position": "before", "decimals": 0},
    "USD": {"symbol": "$", "position": "before", "decimals": 0},
    "SEK": {"symbol": "SEK", "position": "after", "decimals": 0},
    "EUR": {"symbol": "€", "position": "before", "decimals": 0},
}


def convert_gbp_to_currency(gbp_amount: float, target_currency: str) -> float:
    """
    Convert an amount from GBP to target currency.
    
    Args:
        gbp_amount: Amount in GBP
        target_currency: Target currency code (USD, SEK, EUR, GBP)
    
    Returns:
        Amount in target currency, rounded to nearest 1000
    """
    rate = FX_RATES.get(target_currency.upper(), 1.0)
    converted = gbp_amount * rate
    # Round to nearest 1000 for cleaner display
    return round(converted / 1000) * 1000


def convert_currency_to_gbp(amount: float, source_currency: str) -> float:
    """
    Convert an amount from source currency to GBP.
    
    Args:
        amount: Amount in source currency
        source_currency: Source currency code (USD, SEK, EUR, GBP)
    
    Returns:
        Amount in GBP, rounded to nearest 1000
    """
    rate = FX_RATES.get(source_currency.upper(), 1.0)
    if rate == 0:
        rate = 1.0
    converted = amount / rate
    # Round to nearest 1000 for cleaner display
    return round(converted / 1000) * 1000


def format_currency(amount: float, currency: str) -> str:
    """
    Format an amount with the correct currency symbol and position.
    
    Args:
        amount: Amount to format
        currency: Currency code (GBP, USD, SEK)
    
    Returns:
        Formatted string like "£60,000" or "720,000 SEK"
    """
    config = CURRENCY_CONFIG.get(currency.upper(), CURRENCY_CONFIG["GBP"])
    formatted_number = f"{int(amount):,}"
    
    if config["position"] == "after":
        return f"{formatted_number} {config['symbol']}"
    else:
        return f"{config['symbol']}{formatted_number}"


def get_currency_config(currency: str) -> Dict[str, Any]:
    """Get currency display configuration."""
    return CURRENCY_CONFIG.get(currency.upper(), CURRENCY_CONFIG["GBP"])


def get_fx_rate(currency: str) -> float:
    """Get the FX rate for a currency (GBP to that currency)."""
    return FX_RATES.get(currency.upper(), 1.0)


# Location definitions with proper FX integration
# These use the FX_RATES for consistent conversion
LOCATIONS = [
    # United Kingdom - GBP base
    {"city": "Staines", "country": "United Kingdom", "currency": "GBP", "region": "UK"},
    {"city": "London", "country": "United Kingdom", "currency": "GBP", "region": "UK", "cost_adjustment": 1.10},
    {"city": "Manchester", "country": "United Kingdom", "currency": "GBP", "region": "UK", "cost_adjustment": 0.92},
    {"city": "Birmingham", "country": "United Kingdom", "currency": "GBP", "region": "UK", "cost_adjustment": 0.90},
    # Sweden - SEK
    {"city": "Linköping", "country": "Sweden", "currency": "SEK", "region": "EU"},
    {"city": "Stockholm", "country": "Sweden", "currency": "SEK", "region": "EU", "cost_adjustment": 1.08},
    {"city": "Gothenburg", "country": "Sweden", "currency": "SEK", "region": "EU", "cost_adjustment": 1.02},
    # United States - USD
    {"city": "Chicago", "country": "United States", "currency": "USD", "region": "US"},
    {"city": "Dallas", "country": "United States", "currency": "USD", "region": "US", "cost_adjustment": 0.95},
    {"city": "Atlanta", "country": "United States", "currency": "USD", "region": "US", "cost_adjustment": 0.92},
    {"city": "San Francisco", "country": "United States", "currency": "USD", "region": "US", "cost_adjustment": 1.25},
]


def get_salary_multiplier(location: Dict) -> float:
    """
    Get the total salary multiplier for a location.
    This combines the FX rate with any cost-of-living adjustment.
    
    For a role with base GBP salary of £100,000:
    - London: £110,000 (1.0 FX * 1.10 cost adjustment)
    - Stockholm: 1,425,600 SEK (13.20 FX * 1.08 cost adjustment)
    - San Francisco: $158,750 (1.27 FX * 1.25 cost adjustment)
    """
    currency = location.get("currency", "GBP")
    fx_rate = FX_RATES.get(currency, 1.0)
    cost_adjustment = location.get("cost_adjustment", 1.0)
    return fx_rate * cost_adjustment


def convert_salary_range(min_gbp: float, max_gbp: float, location: Dict) -> Tuple[float, float]:
    """
    Convert a GBP salary range to local currency for a location.
    
    Args:
        min_gbp: Minimum salary in GBP
        max_gbp: Maximum salary in GBP
        location: Location dict with currency and cost_adjustment
    
    Returns:
        Tuple of (min_local, max_local) rounded to nearest 1000
    """
    multiplier = get_salary_multiplier(location)
    min_local = round((min_gbp * multiplier) / 1000) * 1000
    max_local = round((max_gbp * multiplier) / 1000) * 1000
    return min_local, max_local


def generate_expected_salary(min_gbp: float, max_gbp: float, location: Dict) -> Tuple[float, float]:
    """
    Generate a realistic expected salary for a candidate.
    Returns both local currency amount and GBP equivalent.
    
    Args:
        min_gbp: Role minimum in GBP
        max_gbp: Role maximum in GBP
        location: Location dict
    
    Returns:
        Tuple of (expected_local, expected_gbp)
    """
    import random
    
    # Generate base expectation in GBP (within role range)
    expected_gbp = random.randint(int(min_gbp), int(max_gbp))
    expected_gbp = round(expected_gbp / 1000) * 1000  # Round to nearest 1000
    
    # Convert to local currency
    multiplier = get_salary_multiplier(location)
    expected_local = round((expected_gbp * multiplier) / 1000) * 1000
    
    return expected_local, expected_gbp
