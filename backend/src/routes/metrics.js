import promClient from 'prom-client';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'roadtrip_backend_',
});

// Custom metrics

// HTTP request duration histogram
export const httpRequestDuration = new promClient.Histogram({
  name: 'roadtrip_backend_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 3, 5, 10],
  registers: [register],
});

// HTTP request counter
export const httpRequestTotal = new promClient.Counter({
  name: 'roadtrip_backend_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Provider API duration histogram
export const providerApiDuration = new promClient.Histogram({
  name: 'roadtrip_backend_provider_api_duration_seconds',
  help: 'Duration of provider API calls in seconds',
  labelNames: ['provider', 'status'],
  buckets: [0.5, 1, 2, 3, 4, 5, 10],
  registers: [register],
});

// Provider API status counter
export const providerApiStatus = new promClient.Counter({
  name: 'roadtrip_backend_provider_api_status_total',
  help: 'Total provider API calls by status',
  labelNames: ['provider', 'status'],
  registers: [register],
});

// Cache hit/miss counter
export const cacheHitMiss = new promClient.Counter({
  name: 'roadtrip_backend_cache_operations_total',
  help: 'Total cache operations',
  labelNames: ['operation', 'result'],
  registers: [register],
});

// Search requests counter
export const searchRequestsTotal = new promClient.Counter({
  name: 'roadtrip_backend_search_requests_total',
  help: 'Total search requests',
  labelNames: ['city', 'status'],
  registers: [register],
});

// Rate limit violations counter
export const rateLimitViolations = new promClient.Counter({
  name: 'roadtrip_backend_rate_limit_violations_total',
  help: 'Total rate limit violations',
  labelNames: ['ip'],
  registers: [register],
});

/**
 * Metrics endpoint route
 * GET /metrics - Returns Prometheus metrics
 */
export async function metricsRoutes(app, _options) {
  app.get('/metrics', {
    schema: {
      description: 'Prometheus metrics endpoint',
      tags: ['monitoring'],
      response: {
        200: {
          type: 'string',
          description: 'Prometheus metrics in text format',
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const metrics = await register.metrics();
        reply.type('text/plain; version=0.0.4').send(metrics);
      } catch (error) {
        request.log.error(error, 'Error generating metrics');
        reply.status(500).send({ error: 'Failed to generate metrics' });
      }
    },
  });

  // Add hook to track HTTP requests
  app.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.getResponseTime() / 1000; // Convert to seconds
    const route = request.routeOptions?.url || request.url;
    const method = request.method;
    const statusCode = reply.statusCode;

    // Record duration
    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      responseTime
    );

    // Count request
    httpRequestTotal.inc({
      method,
      route,
      status_code: statusCode,
    });
  });

  app.log.info('Metrics endpoint registered at /metrics');
}

export default metricsRoutes;
export { register };
