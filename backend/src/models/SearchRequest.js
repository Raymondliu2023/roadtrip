import { EU_CITIES, ERROR_CODES } from '../utils/constants.js';

/**
 * SearchRequest model for validating incoming search requests
 */
export class SearchRequest {
  constructor(data) {
    this.city = data.city;
    this.pickupDateTime = data.pickupDateTime;
    this.dropoffDateTime = data.dropoffDateTime;
  }

  /**
   * Validate the search request
   * @returns {object} Validation result { valid: boolean, error: object|null }
   */
  validate() {
    // Check required fields
    if (!this.city) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          message: 'City is required',
          field: 'city',
        },
      };
    }

    if (!this.pickupDateTime) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          message: 'Pickup date/time is required',
          field: 'pickupDateTime',
        },
      };
    }

    if (!this.dropoffDateTime) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          message: 'Dropoff date/time is required',
          field: 'dropoffDateTime',
        },
      };
    }

    // Validate city is in EU cities list
    if (!EU_CITIES.includes(this.city)) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.INVALID_CITY,
          message: `City '${this.city}' is not a supported EU city`,
          field: 'city',
        },
      };
    }

    // Parse and validate dates
    const pickup = new Date(this.pickupDateTime);
    const dropoff = new Date(this.dropoffDateTime);
    const now = new Date();

    // Check valid ISO 8601 format
    if (isNaN(pickup.getTime())) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.INVALID_FORMAT,
          message: 'Pickup date/time must be in ISO 8601 format (UTC)',
          field: 'pickupDateTime',
        },
      };
    }

    if (isNaN(dropoff.getTime())) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.INVALID_FORMAT,
          message: 'Dropoff date/time must be in ISO 8601 format (UTC)',
          field: 'dropoffDateTime',
        },
      };
    }

    // Check pickup is not in the past
    if (pickup < now) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.PAST_DATETIME,
          message: 'Pick-up date/time cannot be in the past',
          field: 'pickupDateTime',
        },
      };
    }

    // Check dropoff is after pickup
    if (dropoff <= pickup) {
      return {
        valid: false,
        error: {
          code: ERROR_CODES.INVALID_DATE_RANGE,
          message: 'Drop-off date/time must be after pick-up date/time',
          field: 'dropoffDateTime',
        },
      };
    }

    return { valid: true, error: null };
  }

  /**
   * Convert to plain object
   * @returns {object} Plain object representation
   */
  toObject() {
    return {
      city: this.city,
      pickupDateTime: this.pickupDateTime,
      dropoffDateTime: this.dropoffDateTime,
    };
  }

  /**
   * Create SearchRequest from request body
   * @param {object} body - Request body
   * @returns {SearchRequest} SearchRequest instance
   */
  static fromRequestBody(body) {
    return new SearchRequest({
      city: body.city,
      pickupDateTime: body.pickupDateTime,
      dropoffDateTime: body.dropoffDateTime,
    });
  }
}

export default SearchRequest;
