import { query } from '../db/postgres.js';
import { Attraction } from '../models/Attraction.js';
import { RouteInformation } from '../models/RouteInformation.js';

/**
 * Route Service
 * Fetches attractions from PostgreSQL and generates route information
 */
class RouteService {
  /**
   * Get attractions for a city
   * @param {string} city - City name
   * @param {number} limit - Maximum number of attractions to return
   * @param {object} logger - Logger instance
   * @returns {Promise<Array<Attraction>>} Array of attractions
   */
  async getAttractionsByCity(city, limit = 5, logger) {
    try {
      // Convert city name to city code (simplified - in production would use a mapping)
      const cityCode = this.getCityCode(city);

      logger.debug({ city, cityCode, limit }, 'Fetching attractions from database');

      const sql = `
        SELECT
          id,
          city_code,
          name,
          description,
          ST_Y(location::geometry) as latitude,
          ST_X(location::geometry) as longitude,
          category,
          rating,
          visit_duration_minutes,
          thumbnail_url
        FROM attractions
        WHERE city_code = $1
        ORDER BY rating DESC NULLS LAST, visit_duration_minutes ASC
        LIMIT $2
      `;

      const result = await query(sql, [cityCode, limit]);

      if (result.rows.length === 0) {
        logger.warn({ city, cityCode }, 'No attractions found for city');
        return [];
      }

      const attractions = result.rows.map((row) => Attraction.fromDatabaseRow(row));

      logger.info(
        { city, attractionCount: attractions.length },
        'Attractions fetched successfully'
      );

      return attractions;
    } catch (error) {
      logger.error({ error: error.message, city }, 'Failed to fetch attractions');
      // Return empty array on error (graceful degradation)
      return [];
    }
  }

  /**
   * Generate route information for a city
   * @param {string} city - City name
   * @param {object} logger - Logger instance
   * @returns {Promise<RouteInformation>} Route information with attractions
   */
  async generateRouteInfo(city, logger) {
    try {
      const attractions = await this.getAttractionsByCity(city, 5, logger);

      if (attractions.length === 0) {
        // Return minimal route info if no attractions found
        logger.warn({ city }, 'Generating placeholder route info (no attractions)');
        return RouteInformation.fromAttractions([], { startCity: city });
      }

      // Generate route information from attractions
      const routeInfo = RouteInformation.fromAttractions(attractions, {
        startCity: city,
        thumbnailUrl: attractions[0]?.thumbnailUrl || '',
        additionalDistance: 50, // Add base distance for city travel
      });

      logger.info(
        {
          city,
          attractionCount: attractions.length,
          estimatedHours: routeInfo.estimatedDuration.hours,
          totalDistanceKm: routeInfo.totalDistance.value,
        },
        'Route information generated'
      );

      return routeInfo;
    } catch (error) {
      logger.error({ error: error.message, city }, 'Failed to generate route info');
      // Return minimal route info on error
      return RouteInformation.fromAttractions([], { startCity: city });
    }
  }

  /**
   * Convert city name to city code
   * @param {string} city - City name
   * @returns {string} City code
   */
  getCityCode(city) {
    // Simplified mapping - in production would use a complete lookup table
    const cityCodeMap = {
      London: 'LON',
      Paris: 'PAR',
      Rome: 'ROM',
      Berlin: 'BER',
      Madrid: 'MAD',
      Barcelona: 'BCN',
      Amsterdam: 'AMS',
      Vienna: 'VIE',
      Prague: 'PRG',
      Lisbon: 'LIS',
    };

    return cityCodeMap[city] || city.substring(0, 3).toUpperCase();
  }

  /**
   * Batch generate route info for multiple results
   * @param {Array} results - Array of rental results
   * @param {string} city - City name
   * @param {object} logger - Logger instance
   * @returns {Promise<Array>} Results with route info attached
   */
  async enrichResultsWithRouteInfo(results, city, logger) {
    try {
      // Generate route info once for the city (shared across all results)
      const routeInfo = await this.generateRouteInfo(city, logger);

      // Attach route info to each result
      return results.map((result) => ({
        ...result,
        routeInfo: routeInfo.toApiResponse(),
      }));
    } catch (error) {
      logger.error({ error: error.message, city }, 'Failed to enrich results with route info');
      // Return results without route info on error
      return results.map((result) => ({
        ...result,
        routeInfo: null,
      }));
    }
  }
}

// Singleton instance
const routeService = new RouteService();

export default routeService;
export { RouteService };
