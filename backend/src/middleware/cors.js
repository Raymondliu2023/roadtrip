import fastifyCors from '@fastify/cors';

/**
 * Register CORS middleware with configuration
 * @param {FastifyInstance} app - Fastify instance
 * @returns {Promise<void>}
 */
export async function registerCors(app) {
  // Parse allowed origins from environment variable
  const originsEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = originsEnv.split(',').map((origin) => origin.trim());

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is in allowed list or is localhost in development
      const isDevelopment = process.env.NODE_ENV === 'development';
      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        (isDevelopment && origin.includes('localhost'));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
      }
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 86400, // 24 hours
  };

  await app.register(fastifyCors, corsOptions);

  app.log.info({ allowedOrigins }, 'CORS middleware registered');
}

export default registerCors;
