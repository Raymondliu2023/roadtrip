# Data Model: Car Rental & Self-Drive Tour Search Homepage

**Feature**: 001-rental-search-homepage
**Date**: 2025-12-18
**Purpose**: Define entities, attributes, relationships, and validation rules

## Entity Definitions

### SearchQuery

Represents a user's search parameters for car rental availability.

**Attributes**:
- `city`: String - Selected EU city name (e.g., "London", "Paris")
- `pickupDateTime`: ISO 8601 DateTime string - Pick-up date and time
- `dropoffDateTime`: ISO 8601 DateTime string - Drop-off date and time

**Validation Rules**:
- `city` MUST be non-empty and match one of the predefined EU cities
- `pickupDateTime` MUST be present or future (not past)
- `dropoffDateTime` MUST be after `pickupDateTime`
- Both datetime fields MUST be valid ISO 8601 format

**Example**:
```json
{
  "city": "London",
  "pickupDateTime": "2025-12-20T10:00:00Z",
  "dropoffDateTime": "2025-12-21T10:00:00Z"
}
```

**Relationships**:
- One SearchQuery produces many RentalResults (1:N)

---

### RentalResult

Represents a single car rental option with associated route information.

**Attributes**:
- `id`: String - Unique identifier for this rental result
- `provider`: String - Rental company name (e.g., "Enterprise", "Hertz")
- `price`: Object containing:
  - `amount`: Number - Numeric price value
  - `currency`: String - Currency code (e.g., "EUR")
- `carModel`: Object containing:
  - `name`: String - Car model name (e.g., "Toyota Corolla")
  - `category`: String - Vehicle category (e.g., "Economy", "SUV")
  - `imageUrl`: String - URL to car model image
  - `passengers`: Number - Passenger capacity
  - `transmission`: String - "manual" or "automatic"
- `availability`: Boolean - Whether this rental is currently available
- `routeInfo`: RouteInformation object (nested)

**Validation Rules**:
- `id` MUST be unique within a search result set
- `price.amount` MUST be non-negative
- `carModel.imageUrl` MUST be a valid URL or empty string (for fallback)
- `carModel.passengers` MUST be positive integer

**Example**:
```json
{
  "id": "rental-12345",
  "provider": "Enterprise",
  "price": {
    "amount": 45.99,
    "currency": "EUR"
  },
  "carModel": {
    "name": "Toyota Corolla",
    "category": "Economy",
    "imageUrl": "https://cdn.example.com/cars/toyota-corolla.jpg",
    "passengers": 5,
    "transmission": "manual"
  },
  "availability": true,
  "routeInfo": { /* RouteInformation object */ }
}
```

**Relationships**:
- Each RentalResult belongs to one SearchQuery result set (N:1)
- Each RentalResult has one RouteInformation (1:1)

---

### RouteInformation

Represents driving route details and attractions for a rental period.

**Attributes**:
- `thumbnailUrl`: String - URL to route preview thumbnail image
- `estimatedDuration`: Object containing:
  - `hours`: Number - Estimated driving hours
  - `minutes`: Number - Estimated driving minutes
- `totalDistance`: Object containing:
  - `value`: Number - Distance value
  - `unit`: String - "km" or "miles"
- `attractions`: Array of Attraction objects
- `itinerary`: Array of objects containing:
  - `day`: Number - Day number (1-indexed)
  - `stops`: Array of strings - Location names in order
  - `description`: String - Daily route description
- `recommendations`: String - Self-drive tour recommendations (markdown formatted)

**Validation Rules**:
- `thumbnailUrl` MUST be a valid URL or empty string
- `estimatedDuration.hours` MUST be non-negative integer
- `estimatedDuration.minutes` MUST be 0-59
- `totalDistance.value` MUST be positive number
- `attractions` array MUST contain at least 1 attraction
- `itinerary` array MUST have at least 1 day entry

**Example**:
```json
{
  "thumbnailUrl": "https://cdn.example.com/routes/london-oxford-route.jpg",
  "estimatedDuration": {
    "hours": 2,
    "minutes": 30
  },
  "totalDistance": {
    "value": 150,
    "unit": "km"
  },
  "attractions": [/* Array of Attraction objects */],
  "itinerary": [
    {
      "day": 1,
      "stops": ["London", "Windsor Castle", "Oxford"],
      "description": "Depart London, visit historic Windsor Castle, arrive in Oxford for evening"
    }
  ],
  "recommendations": "**Best Time**: Spring/Fall for mild weather. **Highlights**: Stop at Windsor for 2-3 hours..."
}
```

**Relationships**:
- Each RouteInformation belongs to one RentalResult (1:1)
- Each RouteInformation has many Attractions (1:N)

---

### Attraction

Represents a point of interest along a driving route.

**Attributes**:
- `id`: String - Unique attraction identifier
- `name`: String - Attraction name
- `description`: String - Brief description of the attraction
- `location`: Object containing:
  - `city`: String - City name
  - `coordinates`: Object with `lat` (Number) and `lon` (Number)
- `category`: String - Attraction type (e.g., "Historical", "Nature", "Cultural", "Food")
- `thumbnailUrl`: String - URL to attraction thumbnail image
- `estimatedVisitTime`: Object containing:
  - `hours`: Number - Recommended visit hours
  - `minutes`: Number - Recommended visit minutes

**Validation Rules**:
- `name` MUST be non-empty string
- `location.coordinates.lat` MUST be -90 to 90
- `location.coordinates.lon` MUST be -180 to 180
- `thumbnailUrl` MUST be valid URL or empty string
- `estimatedVisitTime.minutes` MUST be 0-59

**Example**:
```json
{
  "id": "attraction-789",
  "name": "Windsor Castle",
  "description": "Historic royal residence and fortress, over 900 years old",
  "location": {
    "city": "Windsor",
    "coordinates": {
      "lat": 51.4834,
      "lon": -0.6044
    }
  },
  "category": "Historical",
  "thumbnailUrl": "https://cdn.example.com/attractions/windsor-castle.jpg",
  "estimatedVisitTime": {
    "hours": 2,
    "minutes": 30
  }
}
```

**Relationships**:
- Each Attraction can belong to many RouteInformation objects (N:M)
- Attractions are referenced within itinerary stops

---

### PaginationState

Represents the current pagination state for search results display.

**Attributes**:
- `currentPage`: Number - Current page number (1-indexed)
- `pageSize`: Number - Results per page (fixed at 10 per spec)
- `totalResults`: Number - Total number of results across all pages
- `totalPages`: Number - Total number of pages (calculated)

**Validation Rules**:
- `currentPage` MUST be >= 1 and <= `totalPages`
- `pageSize` MUST be exactly 10 (per spec FR-008)
- `totalResults` MUST be non-negative integer
- `totalPages` = ceil(`totalResults` / `pageSize`)

**Example**:
```json
{
  "currentPage": 2,
  "pageSize": 10,
  "totalResults": 47,
  "totalPages": 5
}
```

**State Transitions**:
- Initial state: `currentPage = 1` when search completes
- Next page: `currentPage = currentPage + 1` (max: `totalPages`)
- Previous page: `currentPage = currentPage - 1` (min: 1)
- Jump to page: `currentPage = selectedPage` (within bounds)

**Relationships**:
- PaginationState applies to one search result set (1:1 with SearchQuery response)

---

## Entity Relationship Diagram (Text Format)

```
SearchQuery (1) ----< (N) RentalResult
                            |
                            | (1:1)
                            |
                        RouteInformation
                            |
                            | (1:N)
                            |
                         Attraction

PaginationState (1:1) SearchQuery Result Set
```

## Data Flow

1. **User Input → SearchQuery**: User fills form → JavaScript creates SearchQuery object → Validates locally
2. **SearchQuery → API Request**: Send SearchQuery as JSON to backend `/api/search` endpoint
3. **API Response → RentalResult[]**: Backend returns array of RentalResult objects with nested RouteInformation and Attractions
4. **RentalResult[] → UI State**: Store results in memory, initialize PaginationState
5. **PaginationState → Display**: Slice RentalResult array based on current page, render 10 cards
6. **User Interaction → State Update**: Click pagination → Update PaginationState → Re-render cards

## Validation Summary

| Entity | Client-Side Validation | Server-Side Validation |
|--------|----------------------|----------------------|
| SearchQuery | Date comparison, city from list, non-empty fields | Same + rate limiting, city existence |
| RentalResult | Image URL format | Business logic, availability |
| RouteInformation | URL format, duration bounds | Route calculation correctness |
| Attraction | Coordinate bounds | Geographic data integrity |
| PaginationState | Page bounds | N/A (client-only) |

## Assumptions

1. All image URLs are provided by backend - frontend does not upload or generate images
2. Currency is always EUR for EU rentals - no multi-currency conversion needed in frontend
3. Coordinates use WGS84 datum (standard GPS coordinates)
4. ISO 8601 datetime format with timezone (typically UTC for API communication)
5. Backend handles all route calculations - frontend displays pre-computed data
