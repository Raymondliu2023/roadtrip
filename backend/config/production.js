/**
 * Production environment configuration
 * Overrides default config for production deployment
 */
export default {
  logging: {
    level: 'warn',
  },
  features: {
    useMockProviders: false, // Use real providers in production
    enableMetrics: true,
    enableTracing: true,
  },
  database: {
    postgres: {
      max: 50, // Larger pool for production
      idleTimeoutMillis: 60000,
    },
  },
  rateLimit: {
    max: 60,
    timeWindow: '1 minute',
  },
};
