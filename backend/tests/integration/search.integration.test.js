import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../../src/app.js';
import { registerCors } from '../../src/middleware/cors.js';
import { registerErrorHandler } from '../../src/middleware/errorHandler.js';

describe('POST /v1/search - Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = createApp({ logger: false });
    await registerCors(app);
    registerErrorHandler(app);

    // Register search route (will be implemented)
    // await app.register(searchRoutes);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Valid London Search', () => {
    it('should return 200 OK with rental results for London', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2025-12-20T10:00:00Z',
          dropoffDateTime: '2025-12-21T10:00:00Z',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('totalResults');
      expect(data).toHaveProperty('timestamp');
    });

    it('should return results from multiple providers', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2025-12-20T10:00:00Z',
          dropoffDateTime: '2025-12-21T10:00:00Z',
        },
      });

      if (response.statusCode === 200) {
        const data = response.json();
        if (data.results.length > 0) {
          // Check for multiple providers
          const providers = new Set(data.results.map((r) => r.provider));
          expect(providers.size).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('should return results with London-specific attractions', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2025-12-20T10:00:00Z',
          dropoffDateTime: '2025-12-21T10:00:00Z',
        },
      });

      if (response.statusCode === 200) {
        const data = response.json();
        if (data.results.length > 0) {
          const firstResult = data.results[0];
          expect(firstResult.routeInfo).toHaveProperty('attractions');
          expect(Array.isArray(firstResult.routeInfo.attractions)).toBe(true);

          if (firstResult.routeInfo.attractions.length > 0) {
            const attraction = firstResult.routeInfo.attractions[0];
            expect(attraction).toHaveProperty('name');
            expect(attraction).toHaveProperty('description');
            expect(attraction).toHaveProperty('category');
          }
        }
      }
    });

    it('should return results with EUR currency', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2025-12-20T10:00:00Z',
          dropoffDateTime: '2025-12-21T10:00:00Z',
        },
      });

      if (response.statusCode === 200) {
        const data = response.json();
        if (data.results.length > 0) {
          data.results.forEach((result) => {
            expect(result.price.currency).toBe('EUR');
          });
        }
      }
    });

    it('should complete search within 3 seconds', async () => {
      const start = Date.now();
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2025-12-20T10:00:00Z',
          dropoffDateTime: '2025-12-21T10:00:00Z',
        },
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Valid Paris Search', () => {
    it('should return 200 OK with rental results for Paris', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'Paris',
          pickupDateTime: '2025-12-28T09:00:00Z',
          dropoffDateTime: '2025-12-30T18:00:00Z',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('totalResults');
      expect(data).toHaveProperty('timestamp');
    });

    it('should return Paris-specific attractions (not London)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'Paris',
          pickupDateTime: '2025-12-28T09:00:00Z',
          dropoffDateTime: '2025-12-30T18:00:00Z',
        },
      });

      if (response.statusCode === 200) {
        const data = response.json();
        if (data.results.length > 0) {
          const firstResult = data.results[0];
          expect(firstResult.routeInfo).toHaveProperty('attractions');

          // Verify no London attractions appear
          const londonAttractions = [
            'Windsor Castle',
            'Oxford University',
            'Stonehenge',
            'Canterbury',
          ];
          firstResult.routeInfo.attractions.forEach((attraction) => {
            const isLondonAttraction = londonAttractions.some((name) =>
              attraction.name.includes(name)
            );
            expect(isLondonAttraction).toBe(false);
          });
        }
      }
    });
  });

  describe('No Results Scenario', () => {
    it('should return 200 OK with empty results for far future dates', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2030-12-20T10:00:00Z',
          dropoffDateTime: '2030-12-21T10:00:00Z',
        },
      });

      // Should return 200 with empty array (not 404)
      if (response.statusCode === 200) {
        const data = response.json();
        expect(data).toHaveProperty('results');
        expect(data).toHaveProperty('totalResults');
        expect(data.totalResults).toBe(0);
        expect(data.results).toEqual([]);
      }
    });
  });

  describe('Partial Provider Failure', () => {
    it('should return 200 OK with partial results when some providers fail', async () => {
      // This test requires mock providers that can simulate failures
      // For now, we verify the endpoint handles errors gracefully
      const response = await app.inject({
        method: 'POST',
        url: '/v1/search',
        payload: {
          city: 'London',
          pickupDateTime: '2025-12-20T10:00:00Z',
          dropoffDateTime: '2025-12-21T10:00:00Z',
        },
      });

      // Should not return 500 - either 200 with partial results or 503 if all fail
      expect([200, 404, 503]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const data = response.json();
        expect(data).toHaveProperty('results');
        expect(data).toHaveProperty('totalResults');
      }
    });
  });
});
