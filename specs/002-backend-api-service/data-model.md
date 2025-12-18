# Data Model: Car Rental Search Backend API Service

**Date**: 2025-12-18
**Feature**: Backend API service data entities and relationships
**Status**: Design Phase

## Overview

This document defines the core data entities used by the backend API service to aggregate rental quotes and route intelligence. The model supports the search functionality defined in the OpenAPI contract (`specs/001-rental-search-homepage/contracts/search-api.yaml`).

---

## Entity Definitions

### 1. SearchRequest

**Purpose**: Represents an incoming search request from the frontend application.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| city | String | Yes | Must be in EU cities list | EU city name for rental pickup |
| pickupDateTime | ISO 8601 DateTime | Yes | Must be in future, UTC format | Rental pickup date and time |
| dropoffDateTime | ISO 8601 DateTime | Yes | Must be after pickupDateTime, UTC format | Rental dropoff date and time |
| requestId | UUID | Auto-generated | N/A | Unique identifier for tracking/logging |
| clientIp | String | Auto-captured | Valid IP address | Client IP for rate limiting |
| timestamp | ISO 8601 DateTime | Auto-generated | N/A | Server timestamp when request received |

**Validation Rules**:
- `city` must be one of 50-100 supported EU cities (validated against constants list)
- `pickupDateTime` must be in the future (not past)
- `dropoffDateTime` must be after `pickupDateTime` (minimum 1 hour gap recommended)
- Both datetimes must be ISO 8601 format in UTC timezone

**State Transitions**:
```
Received → Validated → [Processing] → Completed/Failed
```

**Example**:
```json
{
  "city": "London",
  "pickupDateTime": "2025-12-20T10:00:00Z",
  "dropoffDateTime": "2025-12-21T10:00:00Z",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "clientIp": "192.168.1.100",
  "timestamp": "2025-12-18T15:30:45Z"
}
```

---

### 2. ProviderSearchQuery

**Purpose**: Normalized search query sent to individual rental provider adapters.

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| providerId | String | Yes | Provider identifier (enterprise, hertz, avis) |
| city | String | Yes | Search city |
| pickupDateTime | ISO 8601 DateTime | Yes | Pickup date/time |
| dropoffDateTime | ISO 8601 DateTime | Yes | Dropoff date/time |
| timeout | Integer | Yes | Timeout in milliseconds (5000ms) |
| requestId | UUID | Yes | Parent request ID for tracing |

**Relationships**:
- One SearchRequest → Multiple ProviderSearchQuery (one per provider)

---

### 3. ProviderRawResponse

**Purpose**: Unprocessed response from external rental provider API before normalization.

**Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| providerId | String | Yes | Provider that returned this response |
| statusCode | Integer | Yes | HTTP status code (200, 500, 503, etc.) |
| success | Boolean | Yes | Whether provider call succeeded |
| data | JSON | Conditional | Provider-specific response data (if success) |
| error | JSON | Conditional | Error details (if failure) |
| latency | Integer | Yes | Response time in milliseconds |
| timestamp | ISO 8601 DateTime | Yes | When response was received |
| requestId | UUID | Yes | Parent request ID for correlation |

**State Transitions**:
```
Pending → Success/Timeout/Error
```

---

### 4. RentalResult

**Purpose**: Normalized rental option ready to return to frontend, combining provider data with route intelligence.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | String | Yes | Unique | Result identifier (format: `rental-{uuid}`) |
| provider | String | Yes | Non-empty | Rental provider name |
| price | Price | Yes | Valid price object | Rental price information |
| carModel | CarModel | Yes | Valid car model object | Vehicle details |
| availability | Boolean | Yes | N/A | Current availability status |
| routeInfo | RouteInformation | Yes | Valid route object | Associated driving route data |

**Relationships**:
- One SearchRequest → Multiple RentalResult (0 to N results)
- One RentalResult → One Price
- One RentalResult → One CarModel
- One RentalResult → One RouteInformation

**Validation Rules**:
- `id` must be globally unique across all searches
- `provider` must be non-empty string
- All nested objects must conform to their respective schemas

**Example**:
```json
{
  "id": "rental-001",
  "provider": "Enterprise",
  "price": { "amount": 45.99, "currency": "EUR" },
  "carModel": {
    "name": "Toyota Corolla",
    "category": "Economy",
    "imageUrl": "https://cdn.example.com/car.jpg",
    "passengers": 5,
    "transmission": "manual"
  },
  "availability": true,
  "routeInfo": { /* RouteInformation object */ }
}
```

---

### 5. Price

**Purpose**: Represents rental pricing information normalized to EUR.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| amount | Float | Yes | Non-negative | Price amount |
| currency | String | Yes | ISO 4217 code | Currency code (always "EUR") |
| originalAmount | Float | Optional | Non-negative | Original amount if currency conversion applied |
| originalCurrency | String | Optional | ISO 4217 code | Original currency before conversion |

**Validation Rules**:
- `amount` must be non-negative (>= 0)
- `currency` must be valid ISO 4217 code
- For backend MVP, all prices normalized to EUR

**Example**:
```json
{
  "amount": 45.99,
  "currency": "EUR",
  "originalAmount": 40.00,
  "originalCurrency": "GBP"
}
```

---

### 6. CarModel

**Purpose**: Vehicle information from rental provider.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | String | Yes | Non-empty | Car model name |
| category | Enum | Yes | Predefined categories | Vehicle category |
| imageUrl | String | Yes | Valid URL or empty string | Car image URL |
| passengers | Integer | Yes | >= 1 | Passenger capacity |
| transmission | Enum | Yes | "manual" or "automatic" | Transmission type |

**Validation Rules**:
- `category` must be one of: `["Economy", "Compact", "Mid-Size", "Full-Size", "SUV", "Luxury", "Van"]`
- `passengers` must be positive integer (>= 1)
- `transmission` must be `"manual"` or `"automatic"`
- `imageUrl` can be empty string if image unavailable (no null values)

---

### 7. RouteInformation

**Purpose**: Aggregated route and attraction data for self-drive tours.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| thumbnailUrl | String | Yes | Valid URL or empty | Route map thumbnail |
| estimatedDuration | Duration | Yes | Valid duration | Total driving time |
| totalDistance | Distance | Yes | Valid distance | Total route distance |
| attractions | Array<Attraction> | Yes | Min 1 item | Points of interest |
| itinerary | Array<ItineraryDay> | Yes | Min 1 item | Day-by-day route |
| recommendations | String | Yes | Non-empty | Self-drive tour tips (markdown) |

**Relationships**:
- One RouteInformation → Multiple Attraction (minimum 1)
- One RouteInformation → Multiple ItineraryDay (minimum 1)

**Validation Rules**:
- `attractions` array must contain at least 1 attraction
- `itinerary` array must contain at least 1 day
- `recommendations` should be markdown-formatted string

---

### 8. Attraction

**Purpose**: Point of interest along a driving route.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | String | Yes | Unique | Attraction identifier |
| name | String | Yes | Non-empty | Attraction name |
| description | String | Yes | Non-empty | Brief description |
| location | Location | Yes | Valid location | Geographic location |
| category | Enum | Yes | Predefined categories | Attraction type |
| thumbnailUrl | String | Yes | Valid URL or empty | Attraction image |
| estimatedVisitTime | Duration | Yes | Valid duration | Recommended visit duration |

**Validation Rules**:
- `category` must be one of: `["Historical", "Nature", "Cultural", "Food", "Entertainment", "Shopping"]`
- `location` must have valid coordinates (lat/lon)

**Data Source**:
- Primary: Google Places API
- Secondary: OpenStreetMap, manual curation
- Cached for 24 hours (infrequently changing data)

**Example**:
```json
{
  "id": "attr-001",
  "name": "Windsor Castle",
  "description": "Historic royal residence, over 900 years old",
  "location": {
    "city": "Windsor",
    "coordinates": { "lat": 51.4834, "lon": -0.6044 }
  },
  "category": "Historical",
  "thumbnailUrl": "https://cdn.example.com/windsor.jpg",
  "estimatedVisitTime": { "hours": 2, "minutes": 30 }
}
```

---

### 9. Location

**Purpose**: Geographic location with coordinates.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| city | String | Yes | Non-empty | City name |
| coordinates | Coordinates | Yes | Valid lat/lon | GPS coordinates |
| address | String | Optional | N/A | Street address (if available) |

---

### 10. Coordinates

**Purpose**: GPS coordinates in WGS84 format.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| lat | Float | Yes | -90 to 90 | Latitude |
| lon | Float | Yes | -180 to 180 | Longitude |

**Validation Rules**:
- `lat` must be between -90 and 90 (inclusive)
- `lon` must be between -180 and 180 (inclusive)

---

### 11. Duration

**Purpose**: Time duration representation.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| hours | Integer | Yes | >= 0 | Hours component |
| minutes | Integer | Yes | 0-59 | Minutes component |

**Validation Rules**:
- `hours` must be non-negative integer
- `minutes` must be between 0 and 59 (inclusive)

---

### 12. Distance

**Purpose**: Distance measurement.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| value | Float | Yes | >= 0 | Distance value |
| unit | Enum | Yes | "km" or "miles" | Distance unit |

**Validation Rules**:
- `value` must be non-negative
- `unit` must be `"km"` or `"miles"`

---

### 13. ItineraryDay

**Purpose**: Daily route plan for multi-day tours.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| day | Integer | Yes | >= 1 | Day number (1-indexed) |
| stops | Array<String> | Yes | Min 1 item | Ordered list of location names |
| description | String | Yes | Non-empty | Daily route description |

**Validation Rules**:
- `day` must be positive integer (1, 2, 3, ...)
- `stops` array must contain at least 1 stop
- Stops should be geographically ordered

**Example**:
```json
{
  "day": 1,
  "stops": ["London", "Windsor Castle", "Oxford"],
  "description": "Depart London, visit historic Windsor Castle, arrive in Oxford for evening"
}
```

---

### 14. ErrorResponse

**Purpose**: Structured error information returned to client.

**Attributes**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| error | ErrorDetails | Yes | Valid error object | Error information |

**ErrorDetails Attributes**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | String | Yes | Machine-readable error code |
| message | String | Yes | Human-readable error message |
| field | String | Optional | Field name that caused error (validation errors) |
| details | JSON | Optional | Additional error context |

**Error Codes**:
- `INVALID_DATE_RANGE`: Dropoff before pickup
- `PAST_DATETIME`: Pickup date in past
- `INVALID_CITY`: Unsupported city
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: All providers down
- `INTERNAL_ERROR`: Unexpected server error

**Example**:
```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Drop-off date/time must be after pick-up date/time",
    "field": "dropoffDateTime"
  }
}
```

---

### 15. CacheEntry

**Purpose**: Cached data for routes and attractions (internal, not exposed via API).

**Attributes**:
| Field | Type | Description |
|-------|------|-------------|
| key | String | Cache key (e.g., `attraction:{city}:{category}`) |
| value | JSON | Cached data |
| ttl | Integer | Time-to-live in seconds |
| createdAt | ISO 8601 DateTime | When entry was created |
| expiresAt | ISO 8601 DateTime | When entry expires |

**Cache Types**:
- **Attractions**: 24-hour TTL, key format: `attraction:{city}:{category}`
- **Routes**: 7-day TTL, key format: `route:{hash(waypoints)}`
- **Exchange Rates**: 1-hour TTL, key format: `rate:{from}:{to}`

**Storage**: Redis for distributed caching across backend instances

---

## Entity Relationships

```
SearchRequest (1)
  ├─→ ProviderSearchQuery (N, one per provider)
  │   └─→ ProviderRawResponse (1)
  └─→ RentalResult (N)
       ├─→ Price (1)
       ├─→ CarModel (1)
       └─→ RouteInformation (1)
            ├─→ Attraction (N, min 1)
            │    └─→ Location (1)
            │         └─→ Coordinates (1)
            ├─→ Duration (1)
            ├─→ Distance (1)
            └─→ ItineraryDay (N, min 1)
```

---

## Data Flow

### 1. Search Request Flow

```
1. Frontend → POST /search (SearchRequest)
2. Backend validates SearchRequest
3. Backend creates ProviderSearchQuery for each provider
4. Backend calls providers concurrently (Promise.allSettled)
5. Backend receives ProviderRawResponse from each provider
6. Backend normalizes to RentalResult (currency conversion, schema mapping)
7. Backend enriches with RouteInformation (from cache or external APIs)
8. Backend returns SearchResponse with array of RentalResult
```

### 2. Provider Integration Flow

```
ProviderSearchQuery → ProviderAdapter.search()
  ├─→ HTTP call to provider API (timeout: 5s)
  ├─→ Response received (ProviderRawResponse)
  ├─→ Schema validation
  ├─→ Currency normalization (to EUR)
  └─→ Transform to RentalResult format
```

### 3. Route Data Flow

```
RentalResult.routeInfo needs population:
  1. Check Redis cache for `attraction:{city}:{category}`
  2. If cache miss: Query Google Places API
  3. Normalize to Attraction entities
  4. Calculate route using Mapbox Directions API
  5. Check cache for `route:{hash(waypoints)}`
  6. If cache miss: Calculate and store (7-day TTL)
  7. Combine attractions + route into RouteInformation
  8. Cache attraction data (24-hour TTL)
```

---

## Database Schema (PostgreSQL)

### Attractions Table

```sql
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_code VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL,  -- PostGIS
    category VARCHAR(50) NOT NULL CHECK (category IN ('Historical', 'Nature', 'Cultural', 'Food', 'Entertainment', 'Shopping')),
    rating FLOAT CHECK (rating >= 0 AND rating <= 5),
    visit_duration_minutes INT NOT NULL CHECK (visit_duration_minutes >= 0),
    photo_urls TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attractions_city_code ON attractions(city_code);
CREATE INDEX idx_attractions_category ON attractions(category);
CREATE INDEX idx_attractions_location ON attractions USING GIST(location);
CREATE INDEX idx_attractions_rating ON attractions(rating DESC);
```

### Request Logs Table (Optional - for monitoring)

```sql
CREATE TABLE request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    city VARCHAR(100) NOT NULL,
    pickup_datetime TIMESTAMP NOT NULL,
    dropoff_datetime TIMESTAMP NOT NULL,
    client_ip VARCHAR(45) NOT NULL,
    response_time_ms INT NOT NULL,
    result_count INT NOT NULL,
    provider_statuses JSONB,  -- {enterprise: "success", hertz: "timeout", avis: "success"}
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_request_logs_created_at ON request_logs(created_at DESC);
CREATE INDEX idx_request_logs_client_ip ON request_logs(client_ip);
```

---

## Validation Summary

| Entity | Key Validations |
|--------|----------------|
| SearchRequest | City in EU list, pickup < dropoff, both in future |
| RentalResult | All nested objects valid, id unique, provider non-empty |
| Price | Amount non-negative, currency valid ISO 4217 |
| CarModel | Category in enum, passengers >= 1, transmission in enum |
| Attraction | Category in enum, location valid coordinates |
| Coordinates | Lat -90 to 90, lon -180 to 180 |
| Duration | Hours >= 0, minutes 0-59 |
| Distance | Value >= 0, unit in enum |

---

## State Machines

### SearchRequest States
```
Received → Validated → Processing → [Completed | Failed]
                ↓
             [ValidationError] → Failed
```

### ProviderRawResponse States
```
Pending → [Success | Timeout | Error]
```

---

**Data Model Status**: Complete ✅
**Next Step**: Create quickstart.md with manual test scenarios
