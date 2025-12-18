import { createApp } from './app.js';
import { registerCors } from './middleware/cors.js';
import { registerErrorHandler } from './middleware/errorHandler.js';
import { healthRoutes } from './routes/health.js';
import { metricsRoutes } from './routes/metrics.js';
import { testConnection as testPostgres, closePool as closePostgres } from './db/postgres.js';
import {
  connect as connectRedis,
  testConnection as testRedis,
  disconnect as disconnectRedis,
} from './db/redis.js';

/**
 * Start the server
 */
async function start() {
  const app = createApp();

  try {
    // Register CORS middleware
    await registerCors(app);

    // Register error handler
    registerErrorHandler(app);

    // Register health check route
    await app.register(healthRoutes);

    // Register metrics route
    await app.register(metricsRoutes);

    // Test database connections
    app.log.info('Testing database connections...');
    const postgresConnected = await testPostgres();
    if (!postgresConnected) {
      app.log.warn('PostgreSQL connection failed - continuing without database');
    }

    const redisConnected = await connectRedis();
    if (redisConnected) {
      await testRedis();
    } else {
      app.log.warn('Redis connection failed - continuing without cache');
    }

    // Start server
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    app.log.info(`Server listening on ${host}:${port}`);
    app.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    app.log.info(`Health check: http://${host}:${port}/health`);
  } catch (error) {
    app.log.error(error, 'Error starting server');
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close database connections
    await closePostgres();
    await disconnectRedis();

    console.log('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
start();
