/**
 * RentalResult model for normalizing provider responses to API schema
 */
export class RentalResult {
  constructor(data) {
    this.id = data.id;
    this.provider = data.provider;
    this.price = data.price;
    this.carModel = data.carModel;
    this.availability = data.availability !== undefined ? data.availability : true;
    this.routeInfo = data.routeInfo;
  }

  /**
   * Validate rental result structure
   * @returns {boolean} True if valid
   */
  validate() {
    if (!this.id || !this.provider || !this.price || !this.carModel) {
      return false;
    }

    if (typeof this.availability !== 'boolean') {
      return false;
    }

    // Validate price structure
    if (!this.price.amount || !this.price.currency) {
      return false;
    }

    // Validate car model structure
    if (
      !this.carModel.name ||
      !this.carModel.category ||
      !this.carModel.passengers ||
      !this.carModel.transmission
    ) {
      return false;
    }

    return true;
  }

  /**
   * Convert to API response format
   * @returns {object} API-compliant rental result
   */
  toApiResponse() {
    return {
      id: this.id,
      provider: this.provider,
      price: {
        amount: this.price.amount,
        currency: this.price.currency,
      },
      carModel: {
        name: this.carModel.name,
        category: this.carModel.category,
        imageUrl: this.carModel.imageUrl || '',
        passengers: this.carModel.passengers,
        transmission: this.carModel.transmission,
      },
      availability: this.availability,
      routeInfo: this.routeInfo
        ? {
            thumbnailUrl: this.routeInfo.thumbnailUrl || '',
            estimatedDuration: this.routeInfo.estimatedDuration || { hours: 0, minutes: 0 },
            totalDistance: this.routeInfo.totalDistance || { value: 0, unit: 'km' },
            attractions: this.routeInfo.attractions || [],
            itinerary: this.routeInfo.itinerary || [],
            recommendations: this.routeInfo.recommendations || '',
          }
        : null,
    };
  }

  /**
   * Create RentalResult from provider response
   * @param {object} providerData - Raw provider data
   * @param {object} routeInfo - Route information
   * @returns {RentalResult} RentalResult instance
   */
  static fromProviderData(providerData, routeInfo = null) {
    return new RentalResult({
      id: providerData.id,
      provider: providerData.provider,
      price: providerData.price,
      carModel: providerData.carModel,
      availability: providerData.availability,
      routeInfo,
    });
  }

  /**
   * Normalize multiple provider results
   * @param {Array} providerResults - Array of provider results
   * @param {object} routeInfo - Shared route information
   * @returns {Array<RentalResult>} Array of normalized results
   */
  static normalizeMultiple(providerResults, routeInfo = null) {
    return providerResults.map((result) => RentalResult.fromProviderData(result, routeInfo));
  }
}

export default RentalResult;
