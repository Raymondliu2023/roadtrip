/**
 * Health check endpoint
 * GET /health - Returns service health status
 */

export async function healthRoutes(app, _options) {
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      };

      request.log.debug(healthData, 'Health check');

      return reply.status(200).send(healthData);
    },
  });
}

export default healthRoutes;
