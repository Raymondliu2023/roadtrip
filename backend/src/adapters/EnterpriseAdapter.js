import { MockProvider } from './MockProvider.js';
import { PROVIDER_NAMES } from '../utils/constants.js';

/**
 * Enterprise Rent-A-Car adapter
 * Mock implementation for MVP - can be replaced with real API integration
 */
export class EnterpriseAdapter extends MockProvider {
  constructor(options = {}) {
    super(PROVIDER_NAMES.ENTERPRISE, {
      resultsPerCity: 7,
      delayMs: 180,
      ...options,
    });
  }
}

export default EnterpriseAdapter;
