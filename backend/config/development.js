/**
 * Development environment configuration
 * Overrides default config for local development
 */
export default {
  logging: {
    level: 'debug',
  },
  features: {
    useMockProviders: true,
    enableMetrics: true,
    enableTracing: false,
  },
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  },
};
