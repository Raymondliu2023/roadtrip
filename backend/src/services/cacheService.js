import { get, set, del } from '../db/redis.js';
import { CACHE_TTL } from '../utils/constants.js';
import { cacheHitMiss } from '../routes/metrics.js';

/**
 * Cache Service
 * Multi-layer caching: Redis (routes 24h) + in-memory (rates 1h) + no-cache (quotes)
 */
class CacheService {
  constructor() {
    // In-memory cache for exchange rates (short TTL)
    this.memoryCache = new Map();
    this.memoryCacheTTL = CACHE_TTL.RATE_CACHE * 1000; // Convert to milliseconds
  }

  /**
   * Get route information from cache (Redis, 24h TTL)
   * @param {string} city - City name
   * @param {object} logger - Logger instance
   * @returns {Promise<object|null>} Cached route info or null
   */
  async getRouteCache(city, logger) {
    try {
      const key = `route:${city}`;
      const cached = await get(key);

      if (cached) {
        cacheHitMiss.inc({ operation: 'route', result: 'hit' });
        logger.debug({ city, key }, 'Route cache HIT');
        return JSON.parse(cached);
      }

      cacheHitMiss.inc({ operation: 'route', result: 'miss' });
      logger.debug({ city, key }, 'Route cache MISS');
      return null;
    } catch (error) {
      logger.error({ error: error.message, city }, 'Route cache read error');
      return null;
    }
  }

  /**
   * Set route information in cache (Redis, 24h TTL)
   * @param {string} city - City name
   * @param {object} routeInfo - Route information
   * @param {object} logger - Logger instance
   * @returns {Promise<boolean>} True if cached successfully
   */
  async setRouteCache(city, routeInfo, logger) {
    try {
      const key = `route:${city}`;
      await set(key, JSON.stringify(routeInfo), CACHE_TTL.ROUTE_CACHE);
      logger.debug({ city, key, ttl: CACHE_TTL.ROUTE_CACHE }, 'Route cached');
      return true;
    } catch (error) {
      logger.error({ error: error.message, city }, 'Route cache write error');
      return false;
    }
  }

  /**
   * Get exchange rate from in-memory cache (1h TTL)
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @param {object} logger - Logger instance
   * @returns {number|null} Exchange rate or null
   */
  getExchangeRateCache(fromCurrency, toCurrency, logger) {
    const key = `rate:${fromCurrency}:${toCurrency}`;
    const cached = this.memoryCache.get(key);

    if (cached && Date.now() - cached.timestamp < this.memoryCacheTTL) {
      cacheHitMiss.inc({ operation: 'rate', result: 'hit' });
      logger.debug({ fromCurrency, toCurrency }, 'Exchange rate cache HIT');
      return cached.value;
    }

    if (cached) {
      // Expired entry
      this.memoryCache.delete(key);
    }

    cacheHitMiss.inc({ operation: 'rate', result: 'miss' });
    logger.debug({ fromCurrency, toCurrency }, 'Exchange rate cache MISS');
    return null;
  }

  /**
   * Set exchange rate in in-memory cache (1h TTL)
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @param {number} rate - Exchange rate
   * @param {object} logger - Logger instance
   */
  setExchangeRateCache(fromCurrency, toCurrency, rate, logger) {
    const key = `rate:${fromCurrency}:${toCurrency}`;
    this.memoryCache.set(key, {
      value: rate,
      timestamp: Date.now(),
    });
    logger.debug({ fromCurrency, toCurrency, rate }, 'Exchange rate cached');
  }

  /**
   * Clear expired in-memory cache entries
   * @param {object} logger - Logger instance
   */
  clearExpiredMemoryCache(logger) {
    const now = Date.now();
    let cleared = 0;

    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp >= this.memoryCacheTTL) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.debug({ cleared }, 'Cleared expired memory cache entries');
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        ttl: this.memoryCacheTTL / 1000,
      },
      redisCache: {
        routeTTL: CACHE_TTL.ROUTE_CACHE,
      },
    };
  }

  /**
   * Clear all caches (for testing)
   * @param {object} logger - Logger instance
   * @returns {Promise<void>}
   */
  async clearAll(logger) {
    this.memoryCache.clear();
    logger.info('All caches cleared');
  }
}

// Singleton instance
const cacheService = new CacheService();

// Periodically clean up expired memory cache entries (every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      cacheService.clearExpiredMemoryCache({ debug: () => {} });
    },
    10 * 60 * 1000
  );
}

export default cacheService;
export { CacheService };
