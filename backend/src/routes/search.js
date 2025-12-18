import { SearchRequest } from '../models/SearchRequest.js';
import { RentalResult } from '../models/RentalResult.js';
import providerService from '../services/providerService.js';
import routeService from '../services/routeService.js';
import cacheService from '../services/cacheService.js';
import { normalizePrice } from '../utils/currencyConverter.js';
import { withTimeout } from '../utils/timeout.js';
import { TIMEOUTS, ERROR_CODES } from '../utils/constants.js';
import { searchRequestsTotal, httpRequestDuration } from '../routes/metrics.js';

/**
 * Search routes
 * POST /v1/search - Search for car rentals with route intelligence
 */
export async function searchRoutes(app, _options) {
  app.post('/v1/search', {
    schema: {
      description: 'Search for car rentals with route recommendations',
      tags: ['search'],
      body: {
        type: 'object',
        required: ['city', 'pickupDateTime', 'dropoffDateTime'],
        properties: {
          city: { type: 'string' },
          pickupDateTime: { type: 'string', format: 'date-time' },
          dropoffDateTime: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            results: { type: 'array' },
            totalResults: { type: 'number' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const startTime = Date.now();

      try {
        // Parse and validate search request
        const searchRequest = SearchRequest.fromRequestBody(request.body);
        const validation = searchRequest.validate();

        if (!validation.valid) {
          searchRequestsTotal.inc({ city: request.body.city || 'unknown', status: 'invalid' });
          return reply.status(400).send({ error: validation.error });
        }

        const { city, pickupDateTime, dropoffDateTime } = searchRequest.toObject();

        request.log.info({ city, pickupDateTime, dropoffDateTime }, 'Processing search request');

        // Wrap entire search in total timeout
        const searchResult = await withTimeout(
          performSearch(city, pickupDateTime, dropoffDateTime, request.log),
          TIMEOUTS.TOTAL_REQUEST_TIMEOUT,
          'Total request timeout exceeded'
        );

        // Check if we got any results
        if (searchResult.results.length === 0 && searchResult.allProvidersFailed) {
          searchRequestsTotal.inc({ city, status: 'service_unavailable' });
          return reply.status(503).send({
            error: {
              code: ERROR_CODES.SERVICE_UNAVAILABLE,
              message:
                'Car rental providers are temporarily unavailable. Please try again later.',
            },
          });
        }

        // Success response
        const duration = (Date.now() - startTime) / 1000;
        searchRequestsTotal.inc({ city, status: 'success' });

        request.log.info(
          {
            city,
            totalResults: searchResult.results.length,
            providerStats: searchResult.providerStats,
            duration,
          },
          'Search request completed successfully'
        );

        return reply.status(200).send({
          results: searchResult.results,
          totalResults: searchResult.results.length,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;

        if (error.code === 'TIMEOUT') {
          searchRequestsTotal.inc({ city: request.body.city || 'unknown', status: 'timeout' });
          request.log.error({ error: error.message, duration }, 'Search request timed out');

          return reply.status(503).send({
            error: {
              code: ERROR_CODES.SERVICE_UNAVAILABLE,
              message: 'Request took too long to process. Please try again.',
            },
          });
        }

        searchRequestsTotal.inc({ city: request.body.city || 'unknown', status: 'error' });
        request.log.error({ error: error.message, stack: error.stack, duration }, 'Search failed');

        return reply.status(500).send({
          error: {
            code: ERROR_CODES.INTERNAL_ERROR,
            message: 'An unexpected error occurred while processing your search',
          },
        });
      }
    },
  });

  app.log.info('Search route registered: POST /v1/search');
}

/**
 * Perform search with provider aggregation and route enrichment
 * @param {string} city - City name
 * @param {string} pickupDateTime - Pickup date/time
 * @param {string} dropoffDateTime - Dropoff date/time
 * @param {object} logger - Logger instance
 * @returns {Promise<object>} Search results
 */
async function performSearch(city, pickupDateTime, dropoffDateTime, logger) {
  // 1. Check route cache first
  let routeInfo = await cacheService.getRouteCache(city, logger);

  // 2. Query providers concurrently
  const providerResults = await providerService.searchAll(
    { city, pickupDateTime, dropoffDateTime },
    logger
  );

  // 3. If no route info in cache, fetch from database
  if (!routeInfo && providerResults.results.length > 0) {
    const freshRouteInfo = await routeService.generateRouteInfo(city, logger);
    routeInfo = freshRouteInfo.toApiResponse();

    // Cache route info for future requests
    await cacheService.setRouteCache(city, routeInfo, logger);
  }

  // 4. Normalize currencies to EUR and attach route info
  const normalizedResults = await Promise.all(
    providerResults.results.map(async (result) => {
      // Normalize price to EUR
      const normalizedPrice = await normalizePrice(result.price, logger);

      // Create rental result with route info
      return RentalResult.fromProviderData(
        {
          ...result,
          price: normalizedPrice,
        },
        routeInfo
      ).toApiResponse();
    })
  );

  return {
    results: normalizedResults,
    providerStats: providerResults.stats,
    allProvidersFailed: providerResults.stats.successful === 0,
  };
}

export default searchRoutes;
