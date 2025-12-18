// Form Validation Functions

import { EU_CITIES, ERROR_MESSAGES } from './constants.js';
import { validateDateRange, isDateInPast } from './dateHelpers.js';

/**
 * Validate that a city is in the EU cities list
 * @param {string} city - City name to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateCity(city) {
  if (!city || typeof city !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CITY };
  }

  const trimmedCity = city.trim();
  if (trimmedCity === '' || !EU_CITIES.includes(trimmedCity)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CITY };
  }

  return { valid: true, error: null };
}

/**
 * Validate that a date is not in the past
 * @param {Date} date - Date to validate
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateDateNotPast(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return { valid: false, error: 'Invalid date provided' };
  }

  if (isDateInPast(date)) {
    return { valid: false, error: ERROR_MESSAGES.PAST_DATE };
  }

  return { valid: true, error: null };
}

/**
 * Validate that dropoff is after pickup
 * @param {Date} pickupDate - Pickup date/time
 * @param {Date} dropoffDate - Dropoff date/time
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateDropoffAfterPickup(pickupDate, dropoffDate) {
  if (!pickupDate || !dropoffDate) {
    return { valid: false, error: 'Both pickup and dropoff dates are required' };
  }

  if (!(pickupDate instanceof Date) || !(dropoffDate instanceof Date)) {
    return { valid: false, error: 'Invalid date objects provided' };
  }

  if (isNaN(pickupDate) || isNaN(dropoffDate)) {
    return { valid: false, error: 'Invalid date values provided' };
  }

  if (!validateDateRange(pickupDate, dropoffDate)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_DATE_RANGE };
  }

  return { valid: true, error: null };
}

/**
 * Validate entire search form
 * @param {object} formData - Form data to validate
 * @param {string} formData.city - Selected city
 * @param {Date} formData.pickupDate - Pickup date/time
 * @param {Date} formData.dropoffDate - Dropoff date/time
 * @returns {{valid: boolean, errors: object}} Validation result with field-specific errors
 */
export function validateSearchForm(formData) {
  const errors = {};
  let isValid = true;

  // Validate city
  const cityValidation = validateCity(formData.city);
  if (!cityValidation.valid) {
    errors.city = cityValidation.error;
    isValid = false;
  }

  // Validate pickup date is not in past
  const pickupValidation = validateDateNotPast(formData.pickupDate);
  if (!pickupValidation.valid) {
    errors.pickupDate = pickupValidation.error;
    isValid = false;
  }

  // Validate date range (dropoff after pickup)
  const rangeValidation = validateDropoffAfterPickup(formData.pickupDate, formData.dropoffDate);
  if (!rangeValidation.valid) {
    errors.dateRange = rangeValidation.error;
    isValid = false;
  }

  return { valid: isValid, errors };
}
