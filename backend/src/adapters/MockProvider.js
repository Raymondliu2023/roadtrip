import { BaseProvider } from './BaseProvider.js';
import { PROVIDER_NAMES } from '../utils/constants.js';

/**
 * Mock Provider for development and testing
 * Generates realistic rental data without external API calls
 */
export class MockProvider extends BaseProvider {
  constructor(providerName = PROVIDER_NAMES.MOCK, options = {}) {
    super(providerName);
    this.options = {
      resultsPerCity: options.resultsPerCity || 8,
      failureRate: options.failureRate || 0, // 0 = never fail, 1 = always fail
      delayMs: options.delayMs || 200, // Simulate network latency
      ...options,
    };
  }

  /**
   * Search for car rentals (mock implementation)
   * @param {object} searchParams - Search parameters
   * @returns {Promise<Array>} Array of mock rental results
   */
  async search(searchParams) {
    this.validateSearchParams(searchParams);

    // Simulate network delay
    if (this.options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delayMs));
    }

    // Simulate random failures
    if (Math.random() < this.options.failureRate) {
      const error = new Error(`${this.name} provider is temporarily unavailable`);
      error.code = 'PROVIDER_UNAVAILABLE';
      this.setLastError(error);
      this.setAvailability(false);
      throw error;
    }

    // Generate mock results
    const results = [];
    const count = this.options.resultsPerCity;

    const carModels = [
      { name: 'Toyota Corolla', category: 'Economy', passengers: 5, transmission: 'manual' },
      { name: 'Volkswagen Golf', category: 'Compact', passengers: 5, transmission: 'manual' },
      { name: 'Ford Focus', category: 'Compact', passengers: 5, transmission: 'automatic' },
      { name: 'BMW 3 Series', category: 'Luxury', passengers: 5, transmission: 'automatic' },
      { name: 'Mercedes C-Class', category: 'Luxury', passengers: 5, transmission: 'automatic' },
      { name: 'Renault Clio', category: 'Economy', passengers: 5, transmission: 'manual' },
      { name: 'Audi A4', category: 'Luxury', passengers: 5, transmission: 'automatic' },
      { name: 'Nissan Qashqai', category: 'SUV', passengers: 5, transmission: 'automatic' },
    ];

    for (let i = 0; i < count; i++) {
      const carModel = carModels[i % carModels.length];
      const basePrice = this.getBasePrice(carModel.category);
      const priceVariation = (Math.random() - 0.5) * 20; // ±10 EUR
      const finalPrice = Math.round((basePrice + priceVariation) * 100) / 100;

      results.push({
        id: `${this.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        provider: this.name,
        price: {
          amount: finalPrice,
          currency: 'EUR',
        },
        carModel: {
          name: carModel.name,
          category: carModel.category,
          imageUrl: `https://images.unsplash.com/photo-${1492144000000 + i * 100000}?w=400`,
          passengers: carModel.passengers,
          transmission: carModel.transmission,
        },
        availability: Math.random() > 0.1, // 90% available
      });
    }

    this.setAvailability(true);
    return results;
  }

  /**
   * Get base price for car category
   * @param {string} category - Car category
   * @returns {number} Base price in EUR
   */
  getBasePrice(category) {
    const basePrices = {
      Economy: 40,
      Compact: 50,
      'Mid-Size': 65,
      'Full-Size': 75,
      SUV: 85,
      Luxury: 120,
      Van: 90,
    };
    return basePrices[category] || 50;
  }
}

export default MockProvider;
