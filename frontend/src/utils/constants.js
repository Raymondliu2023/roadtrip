// EU Cities List and Application Constants

export const EU_CITIES = [
  // Major EU Capitals
  'Amsterdam', 'Athens', 'Berlin', 'Brussels', 'Bucharest', 'Budapest',
  'Copenhagen', 'Dublin', 'Helsinki', 'Lisbon', 'Ljubljana', 'London',
  'Luxembourg', 'Madrid', 'Nicosia', 'Paris', 'Prague', 'Riga', 'Rome',
  'Sofia', 'Stockholm', 'Tallinn', 'Valletta', 'Vienna', 'Vilnius', 'Warsaw', 'Zagreb',

  // Major Tourist Destinations
  'Barcelona', 'Bologna', 'Bordeaux', 'Bratislava', 'Bruges', 'Cologne',
  'Cork', 'Dresden', 'Edinburgh', 'Florence', 'Frankfurt', 'Geneva',
  'Granada', 'Hamburg', 'Heidelberg', 'Innsbruck', 'Krakow', 'Leipzig',
  'Lyon', 'Manchester', 'Marseille', 'Milan', 'Munich', 'Naples',
  'Nice', 'Oxford', 'Porto', 'Salzburg', 'Seville', 'Strasbourg',
  'Toledo', 'Venice', 'Verona', 'Zurich'
].sort();

export const DEFAULT_CITY = 'London';

export const DEFAULT_TIMES = {
  PICKUP_HOUR: 10,
  PICKUP_MINUTE: 0,
  DROPOFF_HOUR: 10,
  DROPOFF_MINUTE: 0
};

export const PAGINATION = {
  ITEMS_PER_PAGE: 10
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1',
  ENDPOINTS: {
    SEARCH: '/search'
  },
  TIMEOUT: 30000 // 30 seconds
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_RESULTS: 'No rental cars found for your search criteria. Try adjusting your dates or city.',
  BACKEND_ERROR: 'Unable to connect to rental services. Please try again later.',
  INVALID_DATE_RANGE: 'Drop-off date/time must be after pick-up date/time.',
  PAST_DATE: 'Pick-up date/time cannot be in the past.',
  INVALID_CITY: 'Please select a valid EU city.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.'
};

// Image Placeholders
export const PLACEHOLDERS = {
  CAR_IMAGE: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23e2e8f0" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8"%3ECar Image%3C/text%3E%3C/svg%3E',
  ROUTE_THUMBNAIL: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect fill="%23e2e8f0" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8"%3ERoute Map%3C/text%3E%3C/svg%3E'
};
