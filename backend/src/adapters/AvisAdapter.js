import { MockProvider } from './MockProvider.js';
import { PROVIDER_NAMES } from '../utils/constants.js';

/**
 * Avis adapter
 * Mock implementation for MVP - can be replaced with real API integration
 */
export class AvisAdapter extends MockProvider {
  constructor(options = {}) {
    super(PROVIDER_NAMES.AVIS, {
      resultsPerCity: 8,
      delayMs: 250,
      ...options,
    });
  }
}

export default AvisAdapter;
