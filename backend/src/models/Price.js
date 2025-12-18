import { CURRENCY_CODES } from '../utils/constants.js';

/**
 * Price model with currency validation
 */
export class Price {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  /**
   * Validate price data
   * @returns {boolean} True if valid
   */
  validate() {
    if (typeof this.amount !== 'number' || this.amount < 0) {
      return false;
    }

    if (!CURRENCY_CODES.includes(this.currency)) {
      return false;
    }

    return true;
  }

  /**
   * Convert to API response format
   * @returns {object} API-compliant price
   */
  toApiResponse() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  /**
   * Create Price from object
   * @param {object} data - Price data
   * @returns {Price} Price instance
   */
  static fromObject(data) {
    return new Price(data.amount, data.currency);
  }
}

export default Price;
