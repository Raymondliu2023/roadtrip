/**
 * Application constants
 */

// Supported EU cities (50+ major cities)
export const EU_CITIES = [
  // UK
  'London',
  'Edinburgh',
  'Manchester',
  'Birmingham',
  'Liverpool',
  'Glasgow',
  'Bristol',
  'Leeds',
  'Oxford',
  'Cambridge',
  // France
  'Paris',
  'Lyon',
  'Marseille',
  'Nice',
  'Bordeaux',
  'Strasbourg',
  'Toulouse',
  'Lille',
  'Cannes',
  'Nantes',
  // Germany
  'Berlin',
  'Munich',
  'Hamburg',
  'Frankfurt',
  'Cologne',
  'Stuttgart',
  'Düsseldorf',
  'Dortmund',
  'Dresden',
  'Leipzig',
  // Italy
  'Rome',
  'Milan',
  'Venice',
  'Florence',
  'Naples',
  'Turin',
  'Bologna',
  'Verona',
  'Pisa',
  'Genoa',
  // Spain
  'Barcelona',
  'Madrid',
  'Valencia',
  'Seville',
  'Bilbao',
  'Málaga',
  'Granada',
  'Zaragoza',
  'Palma',
  'Alicante',
  // Netherlands
  'Amsterdam',
  'Rotterdam',
  'The Hague',
  'Utrecht',
  'Eindhoven',
  'Groningen',
  // Belgium
  'Brussels',
  'Antwerp',
  'Ghent',
  'Bruges',
  // Austria
  'Vienna',
  'Salzburg',
  'Innsbruck',
  // Switzerland
  'Zurich',
  'Geneva',
  'Bern',
  'Lucerne',
  // Portugal
  'Lisbon',
  'Porto',
  'Faro',
  // Greece
  'Athens',
  'Thessaloniki',
  'Heraklion',
  // Ireland
  'Dublin',
  'Cork',
  'Galway',
  // Czech Republic
  'Prague',
  'Brno',
  // Poland
  'Warsaw',
  'Krakow',
  'Gdansk',
  // Denmark
  'Copenhagen',
  'Aarhus',
  // Sweden
  'Stockholm',
  'Gothenburg',
  'Malmö',
  // Finland
  'Helsinki',
  'Tampere',
  // Norway
  'Oslo',
  'Bergen',
];

// Error codes for API responses
export const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  PAST_DATETIME: 'PAST_DATETIME',
  INVALID_CITY: 'INVALID_CITY',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_UNAVAILABLE: 'CACHE_UNAVAILABLE',

  // Service unavailable (503)
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  PROVIDERS_UNAVAILABLE: 'PROVIDERS_UNAVAILABLE',

  // Not found (404)
  NOT_FOUND: 'NOT_FOUND',

  // CORS (403)
  CORS_ERROR: 'CORS_ERROR',
};

// Car model categories
export const CAR_CATEGORIES = [
  'Economy',
  'Compact',
  'Mid-Size',
  'Full-Size',
  'SUV',
  'Luxury',
  'Van',
];

// Transmission types
export const TRANSMISSION_TYPES = ['manual', 'automatic'];

// Attraction categories
export const ATTRACTION_CATEGORIES = [
  'Historical',
  'Nature',
  'Cultural',
  'Food',
  'Entertainment',
  'Shopping',
];

// Distance units
export const DISTANCE_UNITS = ['km', 'miles'];

// Currency codes
export const CURRENCY_CODES = ['EUR', 'GBP', 'USD', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK'];

// Provider names
export const PROVIDER_NAMES = {
  ENTERPRISE: 'Enterprise',
  HERTZ: 'Hertz',
  AVIS: 'Avis',
  BUDGET: 'Budget',
  EUROPCAR: 'Europcar',
  SIXT: 'Sixt',
  MOCK: 'Mock Provider',
};

// Default timeouts (milliseconds)
export const TIMEOUTS = {
  PROVIDER_TIMEOUT: parseInt(process.env.PROVIDER_TIMEOUT || '5000', 10),
  TOTAL_REQUEST_TIMEOUT: parseInt(process.env.TOTAL_REQUEST_TIMEOUT || '10000', 10),
};

// Cache TTLs (seconds)
export const CACHE_TTL = {
  ROUTE_CACHE: parseInt(process.env.ROUTE_CACHE_TTL || '86400', 10), // 24 hours
  RATE_CACHE: parseInt(process.env.RATE_CACHE_TTL || '3600', 10), // 1 hour
};

// Rate limiting
export const RATE_LIMIT = {
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  TIME_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // milliseconds
};

export default {
  EU_CITIES,
  ERROR_CODES,
  CAR_CATEGORIES,
  TRANSMISSION_TYPES,
  ATTRACTION_CATEGORIES,
  DISTANCE_UNITS,
  CURRENCY_CODES,
  PROVIDER_NAMES,
  TIMEOUTS,
  CACHE_TTL,
  RATE_LIMIT,
};
