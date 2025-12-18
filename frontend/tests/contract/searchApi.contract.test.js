/**
 * Contract Tests for Search API
 *
 * Validates that the API request/response matches the OpenAPI specification
 * defined in contracts/search-api.yaml
 *
 * These tests MUST fail before implementation (RED phase)
 */

import { jest } from '@jest/globals';
import { search } from '../../src/services/searchService.js';

// Mock fetch globally for contract testing
global.fetch = jest.fn();

describe('Search API Contract Tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /search request matches contract schema', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        results: [],
        totalResults: 0,
        timestamp: '2025-12-18T14:30:00Z'
      })
    });

    const searchParams = {
      city: 'London',
      pickupDateTime: new Date('2025-12-20T10:00:00Z'),
      dropoffDateTime: new Date('2025-12-21T10:00:00Z')
    };

    await search(searchParams);

    // Verify fetch was called with correct structure
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.any(String)
      })
    );

    // Parse and validate request body
    const callArgs = global.fetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);

    expect(requestBody).toMatchObject({
      city: expect.any(String),
      pickupDateTime: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      dropoffDateTime: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    });
  });

  test('POST /search response 200 matches contract schema', async () => {
    const mockResponse = {
      results: [
        {
          id: 'rental-001',
          provider: 'Enterprise',
          price: {
            amount: 45.99,
            currency: 'EUR'
          },
          carModel: {
            name: 'Toyota Corolla',
            category: 'Economy',
            imageUrl: 'https://cdn.example.com/car.jpg',
            passengers: 5,
            transmission: 'manual'
          },
          availability: true,
          routeInfo: {
            thumbnailUrl: 'https://cdn.example.com/route.jpg',
            estimatedDuration: {
              hours: 2,
              minutes: 30
            },
            totalDistance: {
              value: 150,
              unit: 'km'
            },
            attractions: [
              {
                id: 'attr-001',
                name: 'Windsor Castle',
                description: 'Historic castle',
                location: {
                  city: 'Windsor',
                  coordinates: {
                    lat: 51.4834,
                    lon: -0.6044
                  }
                },
                category: 'Historical',
                thumbnailUrl: 'https://cdn.example.com/attraction.jpg',
                estimatedVisitTime: {
                  hours: 2,
                  minutes: 30
                }
              }
            ],
            itinerary: [
              {
                day: 1,
                stops: ['London', 'Windsor', 'Oxford'],
                description: 'Day 1 route'
              }
            ],
            recommendations: 'Best time to visit'
          }
        }
      ],
      totalResults: 1,
      timestamp: '2025-12-18T14:30:00Z'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse
    });

    const result = await search({
      city: 'London',
      pickupDateTime: new Date('2025-12-20T10:00:00Z'),
      dropoffDateTime: new Date('2025-12-21T10:00:00Z')
    });

    // Validate response structure matches contract
    expect(result).toMatchObject({
      success: true,
      results: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          provider: expect.any(String),
          price: expect.objectContaining({
            amount: expect.any(Number),
            currency: expect.any(String)
          }),
          carModel: expect.objectContaining({
            name: expect.any(String),
            category: expect.any(String),
            imageUrl: expect.any(String),
            passengers: expect.any(Number),
            transmission: expect.stringMatching(/^(manual|automatic)$/)
          }),
          availability: expect.any(Boolean),
          routeInfo: expect.objectContaining({
            thumbnailUrl: expect.any(String),
            estimatedDuration: expect.objectContaining({
              hours: expect.any(Number),
              minutes: expect.any(Number)
            }),
            totalDistance: expect.objectContaining({
              value: expect.any(Number),
              unit: expect.stringMatching(/^(km|miles)$/)
            }),
            attractions: expect.any(Array),
            itinerary: expect.any(Array),
            recommendations: expect.any(String)
          })
        })
      ]),
      totalResults: expect.any(Number),
      timestamp: expect.any(String)
    });
  });

  test('POST /search response 400 (validation error) matches contract schema', async () => {
    const mockErrorResponse = {
      error: {
        code: 'INVALID_DATE_RANGE',
        message: 'Drop-off date/time must be after pick-up date/time',
        field: 'dropoffDateTime'
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse
    });

    await expect(search({
      city: 'London',
      pickupDateTime: new Date('2025-12-20T10:00:00Z'),
      dropoffDateTime: new Date('2025-12-19T10:00:00Z')
    })).rejects.toThrow();
  });

  test('POST /search response 503 (service unavailable) matches contract schema', async () => {
    const mockErrorResponse = {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Car rental providers are temporarily unavailable'
      }
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => mockErrorResponse
    });

    await expect(search({
      city: 'Paris',
      pickupDateTime: new Date('2025-12-20T10:00:00Z'),
      dropoffDateTime: new Date('2025-12-21T10:00:00Z')
    })).rejects.toThrow('Unable to connect');
  });

});
