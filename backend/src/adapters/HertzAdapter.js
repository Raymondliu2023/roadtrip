import { MockProvider } from './MockProvider.js';
import { PROVIDER_NAMES } from '../utils/constants.js';

/**
 * Hertz adapter
 * Mock implementation for MVP - can be replaced with real API integration
 */
export class HertzAdapter extends MockProvider {
  constructor(options = {}) {
    super(PROVIDER_NAMES.HERTZ, {
      resultsPerCity: 6,
      delayMs: 220,
      ...options,
    });
  }
}

export default HertzAdapter;
