// Search API Service - Communicates with backend search endpoint

import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';
import { formatDateTime } from '../utils/dateHelpers.js';

/**
 * Perform car rental search with given parameters
 * @param {object} searchParams - Search parameters
 * @param {string} searchParams.city - EU city name
 * @param {Date} searchParams.pickupDateTime - Pickup date and time
 * @param {Date} searchParams.dropoffDateTime - Dropoff date and time
 * @returns {Promise<object>} Search results with rental options and route information
 * @throws {Error} If API call fails or returns error
 */
export async function search(searchParams) {
  const { city, pickupDateTime, dropoffDateTime } = searchParams;

  // Prepare request body according to API contract
  const requestBody = {
    city,
    pickupDateTime: formatDateTime(pickupDateTime),
    dropoffDateTime: formatDateTime(dropoffDateTime)
  };

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle different HTTP status codes
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        results: data.results || [],
        totalResults: data.totalResults || 0,
        timestamp: data.timestamp
      };
    }

    // Handle error responses
    const errorData = await response.json().catch(() => ({}));
    const error = errorData.error || {};

    switch (response.status) {
      case 400:
        // Validation error
        throw new Error(error.message || ERROR_MESSAGES.INVALID_DATE_RANGE);
      case 429:
        // Rate limit exceeded
        throw new Error(error.message || 'Too many requests. Please try again later.');
      case 500:
        // Internal server error
        throw new Error(ERROR_MESSAGES.BACKEND_ERROR);
      case 503:
        // Service unavailable
        throw new Error(ERROR_MESSAGES.BACKEND_ERROR);
      default:
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  } catch (error) {
    // Handle network errors
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Re-throw application errors
    throw error;
  }
}

/**
 * Check if error is a network connectivity issue
 * @param {Error} error - Error object to check
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  return error.message === ERROR_MESSAGES.NETWORK_ERROR ||
         error.message === ERROR_MESSAGES.BACKEND_ERROR ||
         error.message.includes('timed out');
}

/**
 * Check if error is a validation error
 * @param {Error} error - Error object to check
 * @returns {boolean} True if validation error
 */
export function isValidationError(error) {
  return error.message === ERROR_MESSAGES.INVALID_DATE_RANGE ||
         error.message === ERROR_MESSAGES.PAST_DATE ||
         error.message === ERROR_MESSAGES.INVALID_CITY;
}
