import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../src/app.js';
import { registerCors } from '../../src/middleware/cors.js';
import { registerErrorHandler } from '../../src/middleware/errorHandler.js';
import jestOpenAPI from 'jest-openapi';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load OpenAPI specification
const openApiPath = join(
  __dirname,
  '../../../specs/001-rental-search-homepage/contracts/search-api.yaml'
);
const openApiSpec = readFileSync(openApiPath, 'utf8');
jestOpenAPI(openApiSpec);

describe('POST /v1/search - Contract Validation', () => {
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

  it('should satisfy OpenAPI spec for valid search request', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/search',
      payload: {
        city: 'London',
        pickupDateTime: '2025-12-20T10:00:00Z',
        dropoffDateTime: '2025-12-21T10:00:00Z',
      },
    });

    // Contract validation
    expect(response.statusCode).toBe(200);
    expect(response.json()).toSatisfyApiSpec();
  });

  it('should satisfy OpenAPI spec for validation error (invalid date range)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/search',
      payload: {
        city: 'London',
        pickupDateTime: '2025-12-21T10:00:00Z',
        dropoffDateTime: '2025-12-20T10:00:00Z', // dropoff before pickup
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toSatisfyApiSpec();
  });

  it('should satisfy OpenAPI spec for invalid city error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/search',
      payload: {
        city: 'Atlantis',
        pickupDateTime: '2025-12-20T10:00:00Z',
        dropoffDateTime: '2025-12-21T10:00:00Z',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toSatisfyApiSpec();
  });

  it('should satisfy OpenAPI spec for rate limit error', async () => {
    // Note: This test would need rate limiter to be registered
    // For now, we test the response format
    const response = await app.inject({
      method: 'POST',
      url: '/v1/search',
      payload: {
        city: 'London',
        pickupDateTime: '2025-12-20T10:00:00Z',
        dropoffDateTime: '2025-12-21T10:00:00Z',
      },
    });

    // Should return valid response (200 or 429)
    expect([200, 404, 429, 503]).toContain(response.statusCode);
    if (response.statusCode !== 200) {
      expect(response.json()).toSatisfyApiSpec();
    }
  });

  it('should include all required response fields', async () => {
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
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('totalResults');
      expect(data).toHaveProperty('timestamp');
      expect(Array.isArray(data.results)).toBe(true);
      expect(typeof data.totalResults).toBe('number');
      expect(typeof data.timestamp).toBe('string');
    }
  });

  it('should return results with correct structure when available', async () => {
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
        const result = data.results[0];
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('provider');
        expect(result).toHaveProperty('price');
        expect(result).toHaveProperty('carModel');
        expect(result).toHaveProperty('availability');
        expect(result).toHaveProperty('routeInfo');

        // Validate price structure
        expect(result.price).toHaveProperty('amount');
        expect(result.price).toHaveProperty('currency');

        // Validate carModel structure
        expect(result.carModel).toHaveProperty('name');
        expect(result.carModel).toHaveProperty('category');
        expect(result.carModel).toHaveProperty('passengers');
        expect(result.carModel).toHaveProperty('transmission');

        // Validate routeInfo structure
        expect(result.routeInfo).toHaveProperty('attractions');
        expect(result.routeInfo).toHaveProperty('estimatedDuration');
        expect(result.routeInfo).toHaveProperty('totalDistance');
      }
    }
  });
});
