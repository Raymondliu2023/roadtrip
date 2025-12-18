/**
 * Register global error handler
 * @param {FastifyInstance} app - Fastify instance
 */
export function registerErrorHandler(app) {
  app.setErrorHandler((error, request, reply) => {
    // Log error with request context
    request.log.error(
      {
        err: error,
        req: request,
        reqId: request.id,
      },
      'Request error'
    );

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.validation,
          field: error.validation[0]?.params?.missingProperty || error.validation[0]?.instancePath,
        },
      });
    }

    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: error.message || 'Too many requests. Please try again later.',
        },
      });
    }

    // Handle CORS errors
    if (error.message && error.message.includes('CORS')) {
      return reply.status(403).send({
        error: {
          code: 'CORS_ERROR',
          message: 'Origin not allowed by CORS policy',
        },
      });
    }

    // Handle 404 Not Found
    if (error.statusCode === 404) {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
        },
      });
    }

    // Handle specific known errors
    if (error.code) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
        },
      });
    }

    // Handle database errors
    if (error.code && error.code.startsWith('PG')) {
      return reply.status(500).send({
        error: {
          code: 'DATABASE_ERROR',
          message: 'A database error occurred while processing your request',
        },
      });
    }

    // Handle Redis errors
    if (error.message && error.message.includes('Redis')) {
      return reply.status(503).send({
        error: {
          code: 'CACHE_UNAVAILABLE',
          message: 'Cache service is temporarily unavailable',
        },
      });
    }

    // Handle generic errors - don't expose internal details in production
    const statusCode = error.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';

    return reply.status(statusCode).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: isDevelopment
          ? error.message
          : 'An unexpected error occurred while processing your request',
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  });

  // Handle 404 routes not found
  app.setNotFoundHandler((request, reply) => {
    request.log.warn({ req: request }, 'Route not found');
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });

  app.log.info('Error handler middleware registered');
}

export default registerErrorHandler;
