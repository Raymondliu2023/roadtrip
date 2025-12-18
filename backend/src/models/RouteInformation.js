/**
 * RouteInformation model with itinerary and attractions
 */
export class RouteInformation {
  constructor(data) {
    this.thumbnailUrl = data.thumbnailUrl || '';
    this.estimatedDuration = data.estimatedDuration || { hours: 0, minutes: 0 };
    this.totalDistance = data.totalDistance || { value: 0, unit: 'km' };
    this.attractions = data.attractions || [];
    this.itinerary = data.itinerary || [];
    this.recommendations = data.recommendations || '';
  }

  /**
   * Validate route information
   * @returns {boolean} True if valid
   */
  validate() {
    if (!this.estimatedDuration || typeof this.estimatedDuration.hours !== 'number') {
      return false;
    }

    if (!this.totalDistance || typeof this.totalDistance.value !== 'number') {
      return false;
    }

    if (!Array.isArray(this.attractions)) {
      return false;
    }

    if (!Array.isArray(this.itinerary)) {
      return false;
    }

    return true;
  }

  /**
   * Convert to API response format
   * @returns {object} API-compliant route information
   */
  toApiResponse() {
    return {
      thumbnailUrl: this.thumbnailUrl,
      estimatedDuration: this.estimatedDuration,
      totalDistance: this.totalDistance,
      attractions: this.attractions.map((a) => (a.toApiResponse ? a.toApiResponse() : a)),
      itinerary: this.itinerary,
      recommendations: this.recommendations,
    };
  }

  /**
   * Create RouteInformation from attractions data
   * @param {Array} attractions - Array of Attraction instances
   * @param {object} options - Additional route options
   * @returns {RouteInformation} RouteInformation instance
   */
  static fromAttractions(attractions, options = {}) {
    // Calculate estimated duration based on attractions
    const visitTime = attractions.reduce((total, attr) => {
      const hours = attr.estimatedVisitTime?.hours || 0;
      const minutes = attr.estimatedVisitTime?.minutes || 0;
      return total + hours * 60 + minutes;
    }, 0);

    // Add driving time estimate (rough calculation)
    const drivingTime = attractions.length > 1 ? attractions.length * 30 : 0;
    const totalMinutes = visitTime + drivingTime;

    // Calculate total distance (rough estimate: 50km between attractions)
    const totalDistance = attractions.length > 1 ? (attractions.length - 1) * 50 : 0;

    // Generate simple itinerary
    const itinerary = [
      {
        day: 1,
        stops: [options.startCity || 'Start', ...attractions.map((a) => a.name)],
        description: `Explore ${attractions.map((a) => a.name).join(', ')}`,
      },
    ];

    // Generate recommendations
    const recommendations = `Visit ${attractions.length} attraction${attractions.length > 1 ? 's' : ''} on this route. ${
      attractions.length > 2 ? 'Allocate 2-3 days for a leisurely tour.' : 'Perfect for a day trip.'
    }`;

    return new RouteInformation({
      thumbnailUrl: options.thumbnailUrl || '',
      estimatedDuration: {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
      },
      totalDistance: {
        value: totalDistance + (options.additionalDistance || 0),
        unit: 'km',
      },
      attractions,
      itinerary,
      recommendations,
    });
  }
}

export default RouteInformation;
