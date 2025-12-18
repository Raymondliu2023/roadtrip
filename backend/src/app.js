import Fastify from 'fastify';
import pino from 'pino';
import { randomUUID } from 'crypto';

/**
 * Create and configure Fastify application
 * @param {object} opts - Fastify options
 * @returns {FastifyInstance} Configured Fastify instance
 */
export function createApp(opts = {}) {
  // Configure Pino logger with request ID correlation
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          path: request.routeOptions?.url,
          parameters: request.params,
          headers: {
            host: request.headers.host,
            userAgent: request.headers['user-agent'],
            referer: request.headers.referer,
          },
          remoteAddress: request.ip,
          remotePort: request.socket?.remotePort,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
    },
  });

  // Create Fastify instance with configuration
  const app = Fastify({
    logger,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
    ...opts,
  });

  // Add request ID to response headers
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  // Log request start
  app.addHook('onRequest', async (request, _reply) => {
    request.log.info({ req: request }, 'Incoming request');
  });

  // Log request completion with timing
  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        req: request,
        res: reply,
        responseTime: reply.getResponseTime(),
      },
      'Request completed'
    );
  });

  return app;
}

export default createApp;
