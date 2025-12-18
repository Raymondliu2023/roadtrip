/**
 * Integration Tests for User Story 1 - Quick Car Rental Search (P1 MVP)
 *
 * These tests cover:
 * - Scenario 1-2: Homepage load with defaults, city selection
 * - Scenario 3-4: Date/time modification, search submission
 * - Scenario 5-6: Results display, pagination
 * - Edge cases: No results, backend error, invalid dates
 *
 * Tests MUST fail before implementation (RED phase)
 */

import { test, expect } from '@playwright/test';

test.describe('User Story 1 - Quick Car Rental Search', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('Scenario 1: Homepage loads with default search parameters', async ({ page }) => {
    // Verify search form is visible
    await expect(page.locator('[data-testid="search-form"]')).toBeVisible();

    // Verify default city (London)
    const citySelect = page.locator('[data-testid="city-select"]');
    await expect(citySelect).toHaveValue('London');

    // Verify default pickup time is 10:00 AM
    const pickupTime = page.locator('[data-testid="pickup-time"]');
    await expect(pickupTime).toHaveValue('10:00');

    // Verify default dropoff time is 10:00 AM
    const dropoffTime = page.locator('[data-testid="dropoff-time"]');
    await expect(dropoffTime).toHaveValue('10:00');

    // Verify search button is enabled
    await expect(page.locator('[data-testid="search-button"]')).toBeEnabled();

    // Verify no results displayed yet
    await expect(page.locator('[data-testid="results-list"]')).not.toBeVisible();
  });

  test('Scenario 2: User can select different city from dropdown', async ({ page }) => {
    const citySelect = page.locator('[data-testid="city-select"]');

    // Change city to Paris
    await citySelect.selectOption('Paris');

    // Verify city changed
    await expect(citySelect).toHaveValue('Paris');

    // Verify all major EU cities are available
    const options = await citySelect.locator('option').all();
    expect(options.length).toBeGreaterThan(30); // At least 30+ EU cities
  });

  test('Scenario 3-4: User can modify dates/times and submit search', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/v1/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 'rental-001',
              provider: 'Enterprise',
              price: { amount: 45.99, currency: 'EUR' },
              carModel: {
                name: 'Toyota Corolla',
                category: 'Economy',
                imageUrl: 'https://example.com/car.jpg',
                passengers: 5,
                transmission: 'manual'
              },
              availability: true,
              routeInfo: {
                thumbnailUrl: 'https://example.com/route.jpg',
                estimatedDuration: { hours: 2, minutes: 30 },
                totalDistance: { value: 150, unit: 'km' },
                attractions: [],
                itinerary: [],
                recommendations: 'Test recommendations'
              }
            }
          ],
          totalResults: 1,
          timestamp: new Date().toISOString()
        })
      });
    });

    // Modify pickup time to 2:00 PM
    await page.locator('[data-testid="pickup-time"]').fill('14:00');

    // Modify dropoff time to 6:00 PM
    await page.locator('[data-testid="dropoff-time"]').fill('18:00');

    // Click search button
    await page.locator('[data-testid="search-button"]').click();

    // Verify loading indicator appears
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Wait for results to load
    await expect(page.locator('[data-testid="results-list"]')).toBeVisible({ timeout: 5000 });

    // Verify loading indicator disappears
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('Scenario 5: Search results display correctly with card information', async ({ page }) => {
    // Mock API response with 5 results
    await page.route('**/api/v1/search', async (route) => {
      const results = Array.from({ length: 5 }, (_, i) => ({
        id: `rental-00${i + 1}`,
        provider: `Provider ${i + 1}`,
        price: { amount: 40 + i * 5, currency: 'EUR' },
        carModel: {
          name: `Car Model ${i + 1}`,
          category: 'Economy',
          imageUrl: `https://example.com/car${i + 1}.jpg`,
          passengers: 5,
          transmission: 'manual'
        },
        availability: true,
        routeInfo: {
          thumbnailUrl: `https://example.com/route${i + 1}.jpg`,
          estimatedDuration: { hours: 2, minutes: 30 },
          totalDistance: { value: 150, unit: 'km' },
          attractions: [],
          itinerary: [],
          recommendations: 'Test'
        }
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results,
          totalResults: 5,
          timestamp: new Date().toISOString()
        })
      });
    });

    // Submit search
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="results-list"]')).toBeVisible();

    // Verify 5 result cards are displayed
    const cards = page.locator('[data-testid^="result-card-"]');
    await expect(cards).toHaveCount(5);

    // Verify first card shows required information
    const firstCard = cards.first();
    await expect(firstCard.locator('[data-testid="card-provider"]')).toContainText('Provider 1');
    await expect(firstCard.locator('[data-testid="card-price"]')).toContainText('40');
    await expect(firstCard.locator('[data-testid="card-car-image"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="card-route-thumbnail"]')).toBeVisible();
  });

  test('Scenario 6: Pagination appears when more than 10 results', async ({ page }) => {
    // Mock API response with 25 results (3 pages)
    await page.route('**/api/v1/search', async (route) => {
      const results = Array.from({ length: 25 }, (_, i) => ({
        id: `rental-${i.toString().padStart(3, '0')}`,
        provider: `Provider ${i + 1}`,
        price: { amount: 40 + i, currency: 'EUR' },
        carModel: {
          name: `Car ${i + 1}`,
          category: 'Economy',
          imageUrl: 'https://example.com/car.jpg',
          passengers: 5,
          transmission: 'manual'
        },
        availability: true,
        routeInfo: {
          thumbnailUrl: 'https://example.com/route.jpg',
          estimatedDuration: { hours: 2, minutes: 0 },
          totalDistance: { value: 100, unit: 'km' },
          attractions: [],
          itinerary: [],
          recommendations: ''
        }
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results, totalResults: 25, timestamp: new Date().toISOString() })
      });
    });

    // Submit search
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="results-list"]')).toBeVisible();

    // Verify max 10 cards displayed on page 1
    const cards = page.locator('[data-testid^="result-card-"]');
    await expect(cards).toHaveCount(10);

    // Verify pagination controls are visible
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

    // Verify page indicator shows "Page 1 of 3"
    await expect(page.locator('[data-testid="page-info"]')).toContainText('1');
    await expect(page.locator('[data-testid="page-info"]')).toContainText('3');

    // Click next page
    await page.locator('[data-testid="page-next"]').click();

    // Verify page 2 shows next 10 results
    await expect(page.locator('[data-testid="page-info"]')).toContainText('2');
    await expect(cards).toHaveCount(10);

    // Click page 3
    await page.locator('[data-testid="page-next"]').click();

    // Verify page 3 shows remaining 5 results
    await expect(page.locator('[data-testid="page-info"]')).toContainText('3');
    await expect(cards).toHaveCount(5);
  });

  test('Edge Case: No results found shows empty state message', async ({ page }) => {
    // Mock API response with no results
    await page.route('**/api/v1/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [], totalResults: 0, timestamp: new Date().toISOString() })
      });
    });

    await page.locator('[data-testid="search-button"]').click();

    // Verify empty state message is shown
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No rental cars found');
  });

  test('Edge Case: Backend error shows error message', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/v1/search', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Backend unavailable' } })
      });
    });

    await page.locator('[data-testid="search-button"]').click();

    // Verify error message is shown
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Unable to connect');
  });

  test('Edge Case: Invalid date range shows validation error', async ({ page }) => {
    // Set dropoff date before pickup date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    await page.locator('[data-testid="pickup-date"]').fill(formatDate(today));
    await page.locator('[data-testid="dropoff-date"]').fill(formatDate(yesterday));

    // Try to submit
    await page.locator('[data-testid="search-button"]').click();

    // Verify validation error is shown
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('after pick-up');
  });

  test('Edge Case: Image loading failure shows placeholders', async ({ page }) => {
    // Mock API with broken image URLs
    await page.route('**/api/v1/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [{
            id: 'rental-001',
            provider: 'Test Provider',
            price: { amount: 50, currency: 'EUR' },
            carModel: {
              name: 'Test Car',
              category: 'Economy',
              imageUrl: 'https://broken.example.com/car.jpg',
              passengers: 5,
              transmission: 'manual'
            },
            availability: true,
            routeInfo: {
              thumbnailUrl: 'https://broken.example.com/route.jpg',
              estimatedDuration: { hours: 2, minutes: 0 },
              totalDistance: { value: 100, unit: 'km' },
              attractions: [],
              itinerary: [],
              recommendations: ''
            }
          }],
          totalResults: 1,
          timestamp: new Date().toISOString()
        })
      });
    });

    // Block broken image URLs to simulate loading failure
    await page.route('https://broken.example.com/**', (route) => route.abort());

    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('[data-testid="results-list"]')).toBeVisible();

    // Verify placeholder images are shown (not broken)
    const carImage = page.locator('[data-testid="card-car-image"]').first();
    await expect(carImage).toBeVisible();

    const routeThumbnail = page.locator('[data-testid="card-route-thumbnail"]').first();
    await expect(routeThumbnail).toBeVisible();
  });

});
