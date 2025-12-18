import { EnterpriseAdapter } from '../adapters/EnterpriseAdapter.js';
import { HertzAdapter } from '../adapters/HertzAdapter.js';
import { AvisAdapter } from '../adapters/AvisAdapter.js';
import { withTimeout } from '../utils/timeout.js';
import { TIMEOUTS } from '../utils/constants.js';
import { providerApiDuration, providerApiStatus } from '../routes/metrics.js';

/**
 * Provider Service
 * Aggregates rental quotes from multiple providers concurrently
 */
class ProviderService {
  constructor() {
    this.providers = [];
    this.initialized = false;
  }

  /**
   * Initialize providers
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    // Initialize provider adapters
    this.providers = [
      new EnterpriseAdapter(),
      new HertzAdapter(),
      new AvisAdapter(),
    ];

    this.initialized = true;
  }

  /**
   * Search all providers concurrently using Promise.allSettled()
   * @param {object} searchParams - Search parameters
   * @param {object} logger - Logger instance
   * @returns {Promise<object>} Aggregated results with status
   */
  async searchAll(searchParams, logger) {
    this.initialize();

    logger.info({ searchParams, providerCount: this.providers.length }, 'Starting provider search');

    // Create promises for each provider with timeout
    const providerPromises = this.providers.map(async (provider) => {
      const startTime = Date.now();
      const providerName = provider.getName();

      try {
        logger.debug({ provider: providerName }, 'Querying provider');

        // Apply per-provider timeout
        const results = await withTimeout(
          provider.search(searchParams),
          TIMEOUTS.PROVIDER_TIMEOUT,
          `${providerName} timed out`
        );

        const duration = (Date.now() - startTime) / 1000;

        // Record metrics
        providerApiDuration.observe({ provider: providerName, status: 'success' }, duration);
        providerApiStatus.inc({ provider: providerName, status: 'success' });

        logger.info(
          {
            provider: providerName,
            resultCount: results.length,
            duration,
          },
          'Provider search successful'
        );

        return {
          provider: providerName,
          results,
          status: 'success',
          duration,
        };
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;

        // Record metrics
        providerApiDuration.observe(
          { provider: providerName, status: error.code === 'TIMEOUT' ? 'timeout' : 'error' },
          duration
        );
        providerApiStatus.inc({
          provider: providerName,
          status: error.code === 'TIMEOUT' ? 'timeout' : 'error',
        });

        logger.warn(
          {
            provider: providerName,
            error: error.message,
            code: error.code,
            duration,
          },
          'Provider search failed'
        );

        return {
          provider: providerName,
          results: [],
          status: 'failed',
          error: error.message,
          duration,
        };
      }
    });

    // Execute all provider searches concurrently
    const settledResults = await Promise.allSettled(providerPromises);

    // Process results
    const allResults = [];
    const providerStats = {
      total: this.providers.length,
      successful: 0,
      failed: 0,
      timeout: 0,
    };

    settledResults.forEach((settled) => {
      if (settled.status === 'fulfilled') {
        const providerResult = settled.value;

        if (providerResult.status === 'success') {
          allResults.push(...providerResult.results);
          providerStats.successful++;
        } else {
          providerStats.failed++;
          if (providerResult.error?.includes('timed out')) {
            providerStats.timeout++;
          }
        }
      } else {
        // Promise itself was rejected (shouldn't happen with our error handling)
        providerStats.failed++;
        logger.error({ error: settled.reason }, 'Provider promise rejected unexpectedly');
      }
    });

    logger.info(
      {
        totalResults: allResults.length,
        stats: providerStats,
      },
      'Provider aggregation complete'
    );

    return {
      results: allResults,
      stats: providerStats,
    };
  }

  /**
   * Check if service is available (at least one provider working)
   * @returns {boolean} True if service can provide results
   */
  isAvailable() {
    this.initialize();
    return this.providers.some((p) => p.getAvailability());
  }

  /**
   * Get provider health status
   * @returns {Array} Array of provider health statuses
   */
  getProviderHealth() {
    this.initialize();
    return this.providers.map((provider) => ({
      name: provider.getName(),
      available: provider.getAvailability(),
      lastError: provider.getLastError()?.message || null,
    }));
  }
}

// Singleton instance
const providerService = new ProviderService();

export default providerService;
export { ProviderService };
