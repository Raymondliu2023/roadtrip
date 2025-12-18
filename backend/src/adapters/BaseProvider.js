/**
 * Base Provider Interface
 * All provider adapters must extend this class and implement the search method
 */
export class BaseProvider {
  constructor(name) {
    if (this.constructor === BaseProvider) {
      throw new Error('BaseProvider is an abstract class and cannot be instantiated directly');
    }
    this.name = name;
    this.isAvailable = true;
    this.lastError = null;
  }

  /**
   * Search for car rentals
   * Must be implemented by subclasses
   * @param {object} searchParams - Search parameters
   * @param {string} searchParams.city - City name
   * @param {string} searchParams.pickupDateTime - ISO 8601 pickup datetime
   * @param {string} searchParams.dropoffDateTime - ISO 8601 dropoff datetime
   * @returns {Promise<Array>} Array of rental results
   * @throws {Error} If not implemented
   */
  async search(searchParams) {
    throw new Error(`search() method must be implemented by ${this.constructor.name}`);
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getName() {
    return this.name;
  }

  /**
   * Check if provider is available
   * @returns {boolean} True if available
   */
  getAvailability() {
    return this.isAvailable;
  }

  /**
   * Set provider availability status
   * @param {boolean} status - Availability status
   */
  setAvailability(status) {
    this.isAvailable = status;
  }

  /**
   * Get last error
   * @returns {Error|null} Last error or null
   */
  getLastError() {
    return this.lastError;
  }

  /**
   * Set last error
   * @param {Error} error - Error object
   */
  setLastError(error) {
    this.lastError = error;
  }

  /**
   * Normalize provider-specific response to common format
   * Should be implemented by subclasses to handle provider-specific data structures
   * @param {object} providerResponse - Raw response from provider
   * @returns {object} Normalized rental result
   */
  normalizeResponse(providerResponse) {
    // Default implementation - subclasses should override
    return providerResponse;
  }

  /**
   * Validate search parameters before sending to provider
   * @param {object} searchParams - Search parameters
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validateSearchParams(searchParams) {
    if (!searchParams.city) {
      throw new Error('City is required');
    }
    if (!searchParams.pickupDateTime) {
      throw new Error('Pickup date/time is required');
    }
    if (!searchParams.dropoffDateTime) {
      throw new Error('Dropoff date/time is required');
    }
    return true;
  }
}

export default BaseProvider;
