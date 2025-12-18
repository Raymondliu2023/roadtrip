import { CAR_CATEGORIES, TRANSMISSION_TYPES } from '../utils/constants.js';

/**
 * CarModel model with category enum validation
 */
export class CarModel {
  constructor(data) {
    this.name = data.name;
    this.category = data.category;
    this.imageUrl = data.imageUrl || '';
    this.passengers = data.passengers;
    this.transmission = data.transmission;
  }

  /**
   * Validate car model data
   * @returns {boolean} True if valid
   */
  validate() {
    if (!this.name || !this.category) {
      return false;
    }

    if (!CAR_CATEGORIES.includes(this.category)) {
      return false;
    }

    if (typeof this.passengers !== 'number' || this.passengers < 1) {
      return false;
    }

    if (!TRANSMISSION_TYPES.includes(this.transmission)) {
      return false;
    }

    return true;
  }

  /**
   * Convert to API response format
   * @returns {object} API-compliant car model
   */
  toApiResponse() {
    return {
      name: this.name,
      category: this.category,
      imageUrl: this.imageUrl,
      passengers: this.passengers,
      transmission: this.transmission,
    };
  }

  /**
   * Create CarModel from object
   * @param {object} data - Car model data
   * @returns {CarModel} CarModel instance
   */
  static fromObject(data) {
    return new CarModel(data);
  }
}

export default CarModel;
