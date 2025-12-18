import { ATTRACTION_CATEGORIES } from '../utils/constants.js';

/**
 * Attraction entity model with location and category validation
 */
export class Attraction {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.location = data.location;
    this.category = data.category;
    this.thumbnailUrl = data.thumbnailUrl || '';
    this.estimatedVisitTime = data.estimatedVisitTime || { hours: 1, minutes: 0 };
  }

  /**
   * Validate attraction data
   * @returns {boolean} True if valid
   */
  validate() {
    if (!this.id || !this.name || !this.description) {
      return false;
    }

    if (!this.location || !this.location.city || !this.location.coordinates) {
      return false;
    }

    if (!this.location.coordinates.lat || !this.location.coordinates.lon) {
      return false;
    }

    if (!ATTRACTION_CATEGORIES.includes(this.category)) {
      return false;
    }

    return true;
  }

  /**
   * Convert to API response format
   * @returns {object} API-compliant attraction
   */
  toApiResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      location: {
        city: this.location.city,
        coordinates: {
          lat: this.location.coordinates.lat,
          lon: this.location.coordinates.lon,
        },
      },
      category: this.category,
      thumbnailUrl: this.thumbnailUrl,
      estimatedVisitTime: this.estimatedVisitTime,
    };
  }

  /**
   * Create Attraction from database row
   * @param {object} row - Database row
   * @returns {Attraction} Attraction instance
   */
  static fromDatabaseRow(row) {
    return new Attraction({
      id: row.id,
      name: row.name,
      description: row.description,
      location: {
        city: row.city_code,
        coordinates: {
          // PostGIS returns geometry, we'll need to parse it
          lat: row.latitude || 0,
          lon: row.longitude || 0,
        },
      },
      category: row.category,
      thumbnailUrl: row.thumbnail_url,
      estimatedVisitTime: {
        hours: Math.floor(row.visit_duration_minutes / 60),
        minutes: row.visit_duration_minutes % 60,
      },
    });
  }
}

export default Attraction;
