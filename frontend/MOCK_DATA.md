# Mock Data Service Documentation

## Overview

The MVP includes a comprehensive mock data service that provides realistic rental results and route information for any EU city, with special focus on London attractions. This allows the application to be **fully functional and demo-ready** without requiring a backend API.

## Features

### Realistic Rental Data
- **25 rental results** per search with varied characteristics
- **6 major providers**: Enterprise, Hertz, Avis, Budget, Europcar, Sixt
- **10 car models** across categories:
  - Mini: Fiat 500
  - Economy: Toyota Corolla, Renault Clio
  - Compact: VW Golf, Ford Focus, Peugeot 308
  - Premium: BMW 3 Series, Audi A4
  - Luxury: Mercedes C-Class
  - SUV: Nissan Qashqai
- **Dynamic pricing**: €40-140 based on car category with random variations
- **90% availability rate** for realistic scenarios

### Authentic London Attractions

The mock data includes 6 real attractions near London:

1. **Windsor Castle** - Historic royal castle (2.5 hours visit)
2. **Oxford University** - World-famous university city (3 hours visit)
3. **Stonehenge** - Prehistoric monument (2 hours visit)
4. **Bath Roman Baths** - Ancient Roman thermal baths (2 hours visit)
5. **Canterbury Cathedral** - Medieval UNESCO site (1.5 hours visit)
6. **Cotswolds Villages** - Picturesque countryside (4 hours visit)

Each attraction includes:
- Name and description
- GPS coordinates
- Category (Historical, Educational, Religious, Natural)
- Estimated visit time
- Thumbnail image URL (using Unsplash)

### Multi-Day Itineraries

Four sample itinerary templates:

**3-Day Heritage Tour:**
- Day 1: London → Windsor → Oxford
- Day 2: Oxford → Cotswolds → Bath
- Day 3: Bath → Stonehenge → London

**Day Trip Options:**
- Canterbury & Brighton seaside
- Windsor, Stonehenge, Bath highlights
- Oxford & Cotswolds escape

### Realistic User Experience

- **Simulated network delay**: 200-800ms random delay
- **Varied results**: Each search generates different combinations
- **Distance calculations**: 100-400km based on attractions
- **Duration estimates**: Realistic driving times
- **Personalized recommendations**: 8 different recommendation phrases

## Configuration

### Enable/Disable Mock Mode

Mock mode is controlled by environment variable:

```bash
# .env file
VITE_USE_MOCK_DATA=true   # Use mock data (default)
VITE_USE_MOCK_DATA=false  # Use real backend API
```

### How It Works

1. **searchService.js** checks `isMockModeEnabled()`
2. If enabled, calls `mockSearch()` instead of real API
3. `mockSearch()` generates 25 results using `generateMockResults()`
4. Results include 2-4 random attractions per rental
5. Simulated delay makes it feel like a real API call

## Code Structure

### mockDataService.js

```javascript
// Main functions
export function generateMockResults(city, count)
export async function mockSearch(searchParams)
export function isMockModeEnabled()

// Internal data
const providers = [...]      // 6 rental companies
const carModels = [...]      // 10 car models with details
const londonAttractions = [...] // 6 authentic attractions
const itineraries = [...]    // 4 sample itineraries
const recommendations = [...] // 8 recommendation phrases
```

### Integration with searchService.js

```javascript
import { mockSearch, isMockModeEnabled } from './mockDataService.js';

export async function search(searchParams) {
  // Use mock data in development mode
  if (isMockModeEnabled()) {
    return await mockSearch(searchParams);
  }

  // Otherwise, call real API
  // ...
}
```

## Data Schema

Mock data follows the exact same schema as the real API contract (search-api.yaml):

```javascript
{
  success: true,
  results: [
    {
      id: "rental-001",
      provider: "Enterprise",
      price: { amount: 45.99, currency: "EUR" },
      carModel: {
        name: "Toyota Corolla",
        category: "Economy",
        imageUrl: "https://...",
        passengers: 5,
        transmission: "manual"
      },
      availability: true,
      routeInfo: {
        thumbnailUrl: "https://...",
        estimatedDuration: { hours: 2, minutes: 30 },
        totalDistance: { value: 150, unit: "km" },
        attractions: [...],
        itinerary: [...],
        recommendations: "..."
      }
    }
  ],
  totalResults: 25,
  timestamp: "2025-12-18T..."
}
```

## Testing with Mock Data

### Manual Testing

1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Select any city from dropdown
4. Click "Search for Car Rentals"
5. View 25 realistic results with pagination
6. Observe loading spinner (200-800ms delay)

### Switching Between Mock and Real API

**Development (mock data):**
```bash
# .env
VITE_USE_MOCK_DATA=true
npm run dev
```

**Production (real API):**
```bash
# .env
VITE_USE_MOCK_DATA=false
npm run build
```

## Extending Mock Data

### Add More Cities

Currently, the same attraction set is used for all cities. To add city-specific attractions:

```javascript
const parisAttractions = [
  {
    id: 'attr-paris-001',
    name: 'Versailles Palace',
    // ...
  }
];

export function generateMockResults(city, count) {
  const attractions = city === 'Paris' ? parisAttractions : londonAttractions;
  // ...
}
```

### Add More Car Models

```javascript
const carModels = [
  // Existing models...
  {
    name: 'Tesla Model 3',
    category: 'Electric',
    passengers: 5,
    transmission: 'automatic'
  },
];
```

### Customize Pricing

```javascript
const basePrice = carModel.category === 'Electric' ? 90 :
                  carModel.category === 'Luxury' ? 120 :
                  carModel.category === 'Premium' ? 80 :
                  // ...
```

## Benefits for MVP

1. **Immediate Functionality**: App works out-of-the-box without backend
2. **Demo-Ready**: Can showcase to stakeholders immediately
3. **Testing**: Developers can test UI/UX without API dependencies
4. **Consistent Data**: Same data structure as real API contract
5. **Easy Transition**: Simply set `VITE_USE_MOCK_DATA=false` when backend is ready

## Limitations

- Same attraction set for all cities (London-focused)
- No persistence across sessions
- Cannot simulate all API error scenarios
- Fixed result count (always 25)

## Future Enhancements

When Phase 4 (Detail View) is implemented:
- Expand attractions array with more detailed information
- Add more itinerary variations
- Include attraction opening hours and admission prices

When backend is ready:
- Set `VITE_USE_MOCK_DATA=false`
- Update `API_CONFIG.BASE_URL` in constants.js
- Keep mock data for testing and development

---

**The mock data service makes the MVP fully functional and demo-ready from day one!** 🚀
