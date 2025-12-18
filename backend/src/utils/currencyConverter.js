import cacheService from '../services/cacheService.js';

/**
 * Currency Converter Utility
 * Normalizes prices to EUR with caching
 */

// Static exchange rates (fallback if no API available)
// In production, would fetch from API like exchangerate-api.com
const STATIC_RATES = {
  EUR: 1.0,
  GBP: 1.17, // 1 GBP = 1.17 EUR
  USD: 0.92, // 1 USD = 0.92 EUR
  CHF: 1.05, // 1 CHF = 1.05 EUR
  NOK: 0.09, // 1 NOK = 0.09 EUR
  SEK: 0.09, // 1 SEK = 0.09 EUR
  DKK: 0.13, // 1 DKK = 0.13 EUR
  PLN: 0.23, // 1 PLN = 0.23 EUR
  CZK: 0.04, // 1 CZK = 0.04 EUR
};

/**
 * Convert amount from one currency to EUR
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {object} logger - Logger instance (optional)
 * @returns {Promise<number>} Amount in EUR
 */
export async function convertToEUR(amount, fromCurrency, logger = console) {
  // If already in EUR, return as-is
  if (fromCurrency === 'EUR') {
    return amount;
  }

  // Check cache first
  const cachedRate = cacheService.getExchangeRateCache(fromCurrency, 'EUR', logger);
  if (cachedRate !== null) {
    return Math.round(amount * cachedRate * 100) / 100;
  }

  // Get rate from static rates
  const rate = STATIC_RATES[fromCurrency];

  if (!rate) {
    logger.warn(
      { fromCurrency, amount },
      'Unknown currency, returning original amount as EUR'
    );
    return amount; // Return original if currency unknown
  }

  // Cache the rate
  cacheService.setExchangeRateCache(fromCurrency, 'EUR', rate, logger);

  // Convert and round to 2 decimal places
  const converted = Math.round(amount * rate * 100) / 100;

  logger.debug(
    {
      amount,
      fromCurrency,
      rate,
      converted,
    },
    'Currency converted to EUR'
  );

  return converted;
}

/**
 * Normalize price object to EUR
 * @param {object} price - Price object with amount and currency
 * @param {object} logger - Logger instance (optional)
 * @returns {Promise<object>} Normalized price in EUR
 */
export async function normalizePrice(price, logger = console) {
  if (!price || !price.amount || !price.currency) {
    logger.warn({ price }, 'Invalid price object');
    return { amount: 0, currency: 'EUR' };
  }

  const amountInEUR = await convertToEUR(price.amount, price.currency, logger);

  return {
    amount: amountInEUR,
    currency: 'EUR',
  };
}

/**
 * Get exchange rate from currency to EUR
 * @param {string} fromCurrency - Source currency code
 * @returns {number} Exchange rate
 */
export function getRate(fromCurrency) {
  return STATIC_RATES[fromCurrency] || 1.0;
}

/**
 * Check if currency is supported
 * @param {string} currency - Currency code
 * @returns {boolean} True if supported
 */
export function isSupportedCurrency(currency) {
  return currency in STATIC_RATES;
}

export default {
  convertToEUR,
  normalizePrice,
  getRate,
  isSupportedCurrency,
};
