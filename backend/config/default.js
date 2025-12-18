/**
 * Default configuration
 * These values are used when environment variables are not set
 */
export default {
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  database: {
    postgres: {
      host: 'localhost',
      port: 5432,
      user: 'roadtrip_user',
      database: 'roadtrip',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
  },
  rateLimit: {
    max: 60,
    timeWindow: '1 minute',
  },
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  timeouts: {
    providerTimeout: 5000,
    totalRequestTimeout: 10000,
  },
  cache: {
    routeTTL: 86400, // 24 hours in seconds
    rateTTL: 3600, // 1 hour in seconds
  },
  features: {
    useMockProviders: true,
    enableMetrics: true,
    enableTracing: false,
  },
  logging: {
    level: 'info',
  },
};
