// Date and Time Utility Functions

import { DEFAULT_TIMES } from './constants.js';

/**
 * Get current date with time set to default pickup time (10:00 AM)
 * @returns {Date} Current date with 10:00 AM time
 */
export function getCurrentDate() {
  const now = new Date();
  now.setHours(DEFAULT_TIMES.PICKUP_HOUR, DEFAULT_TIMES.PICKUP_MINUTE, 0, 0);
  return now;
}

/**
 * Get tomorrow's date with time set to default dropoff time (10:00 AM)
 * @returns {Date} Tomorrow's date with 10:00 AM time
 */
export function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(DEFAULT_TIMES.DROPOFF_HOUR, DEFAULT_TIMES.DROPOFF_MINUTE, 0, 0);
  return tomorrow;
}

/**
 * Format a Date object to ISO 8601 datetime string for API
 * @param {Date} date - Date object to format
 * @returns {string} ISO 8601 formatted string (e.g., "2025-12-20T10:00:00Z")
 */
export function formatDateTime(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date provided to formatDateTime');
  }
  return date.toISOString();
}

/**
 * Format a Date object to HTML5 date input format (YYYY-MM-DD)
 * @param {Date} date - Date object to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to HTML5 time input format (HH:mm)
 * @param {Date} date - Date object to format
 * @returns {string} Time string in HH:mm format
 */
export function formatTimeForInput(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Combine separate date and time strings into a single Date object
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:mm format
 * @returns {Date} Combined Date object
 */
export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    throw new Error('Both date and time are required');
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Validate that dropoff date/time is after pickup date/time
 * @param {Date} pickupDate - Pickup date/time
 * @param {Date} dropoffDate - Dropoff date/time
 * @returns {boolean} True if valid range, false otherwise
 */
export function validateDateRange(pickupDate, dropoffDate) {
  if (!(pickupDate instanceof Date) || !(dropoffDate instanceof Date)) {
    return false;
  }
  if (isNaN(pickupDate) || isNaN(dropoffDate)) {
    return false;
  }
  return dropoffDate > pickupDate;
}

/**
 * Check if a date is in the past (before current moment)
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in the past, false otherwise
 */
export function isDateInPast(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return false;
  }
  return date < new Date();
}

/**
 * Format a date for display to users (human-readable)
 * @param {Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-GB')
 * @returns {string} Formatted date string
 */
export function formatDateForDisplay(date, locale = 'en-GB') {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
