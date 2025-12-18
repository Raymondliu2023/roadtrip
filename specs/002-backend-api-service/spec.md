# Feature Specification: Car Rental Search Backend API Service

**Feature Branch**: `002-backend-api-service`
**Created**: 2025-12-18
**Status**: Draft
**Input**: Backend service for a modern car rental and self-driving experience platform that exposes APIs to serve trip planning data, rental options, and recommended scenic routes. Designed for scalability with versioned endpoints and integration with external data providers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Rental Quotes with Route Intelligence (Priority: P1)

A frontend application needs to retrieve available car rental options with integrated route recommendations for a specific EU city and date range.

**Why this priority**: This is the core value proposition of the backend service - enabling the frontend to display rental options enriched with self-drive tour data. Without this, the platform has no functionality.

**Independent Test**: Can be tested by sending POST /search requests with various parameters (city, dates) and verifying the response contains rental quotes aggregated from providers along with route/attraction data. Delivers immediate value by providing the data layer for the user-facing application.

**Acceptance Scenarios**:

1. **Given** a frontend sends a valid search request with London, tomorrow's date at 10:00 AM pickup, and day after tomorrow at 10:00 AM dropoff, **When** the backend processes the request, **Then** it returns 200 OK with an array of rental results, each containing provider details, pricing, car model information, and associated route data with attractions
2. **Given** a search request is received, **When** the backend queries rental providers, **Then** it aggregates results from multiple providers (minimum 3) and combines them with route intelligence for the specified city
3. **Given** the backend receives a search for Paris, **When** processing the request, **Then** it returns results with Paris-specific attractions and driving routes appropriate for that region
4. **Given** a search request has pickup/dropoff dates spanning multiple days, **When** generating route information, **Then** the response includes multi-day itineraries with appropriate daily stops and driving distances
5. **Given** no rental providers return results for the search criteria, **When** the backend completes processing, **Then** it returns 200 OK with an empty results array and totalResults of 0
6. **Given** the backend encounters errors from multiple providers but at least one succeeds, **When** processing the search, **Then** it returns partial results from successful providers with appropriate logging of failures

---

### User Story 2 - Request Validation and Error Handling (Priority: P1)

The backend must validate incoming search requests and return clear, actionable error messages when validation fails or services are unavailable.

**Why this priority**: Robust validation prevents invalid data from reaching external services and ensures a good user experience by providing clear feedback. This is critical infrastructure for any API service.

**Independent Test**: Can be tested by sending various invalid requests (past dates, invalid cities, malformed data) and verifying appropriate 400 errors are returned with specific error codes and messages. Delivers value by preventing bad data propagation and improving debuggability.

**Acceptance Scenarios**:

1. **Given** a search request has dropoff date/time before pickup date/time, **When** the backend validates the request, **Then** it returns 400 Bad Request with error code "INVALID_DATE_RANGE" and a clear message explaining the issue
2. **Given** a search request specifies a pickup date/time in the past, **When** validation runs, **Then** it returns 400 with code "PAST_DATETIME" identifying the pickupDateTime field
3. **Given** a search request contains a city not in the supported EU cities list (e.g., "Atlantis"), **When** validation occurs, **Then** it returns 400 with code "INVALID_CITY" and message indicating the city is not supported
4. **Given** a search request is missing required fields (city, pickupDateTime, or dropoffDateTime), **When** received by the backend, **Then** it returns 400 with appropriate error identifying the missing field
5. **Given** a client sends more than the allowed number of requests per minute, **When** the rate limit is exceeded, **Then** the backend returns 429 with code "RATE_LIMIT_EXCEEDED" and retry-after guidance
6. **Given** all external rental provider services are unavailable, **When** attempting to process a search, **Then** the backend returns 503 Service Unavailable with code "SERVICE_UNAVAILABLE"

---

### User Story 3 - External Service Integration and Resilience (Priority: P2)

The backend must integrate with external car rental provider APIs and route/attraction data services with appropriate fallback strategies when services are partially unavailable.

**Why this priority**: After core search functionality, resilience ensures the platform remains functional even when some external dependencies fail. This is critical for production reliability but can be initially implemented with basic error handling.

**Independent Test**: Can be tested by simulating external service failures (timeouts, errors, partial failures) and verifying the backend handles them gracefully without crashing and returns appropriate responses or partial results.

**Acceptance Scenarios**:

1. **Given** one rental provider API times out during a search, **When** the backend processes the request, **Then** it returns results from other providers without failing the entire request
2. **Given** the route/attraction data service is temporarily unavailable, **When** a search is performed, **Then** the backend returns rental results with placeholder route information or cached data if available
3. **Given** external services are slow to respond, **When** processing a search, **Then** the backend enforces timeout limits (5 seconds per provider) to prevent request hanging
4. **Given** external provider APIs return malformed or unexpected data, **When** the backend parses responses, **Then** it validates data structure and excludes invalid results rather than crashing
5. **Given** attraction data for a specific city is missing, **When** generating route information, **Then** the backend returns results with generic route data rather than failing the request

---

### Edge Cases

- What happens when a search request has pickup and dropoff in different cities? (Should this be supported?)
- How does the system handle very long rental periods (e.g., 30+ days)?
- What happens when external provider APIs return conflicting currency codes?
- How does the backend handle search requests for cities where no rental providers have availability?
- What happens if route calculation services cannot find a valid route between city and attractions?
- How does the system handle requests during peak load periods with thousands of concurrent searches?
- What happens when car images or attraction thumbnails referenced by providers return 404?
- How does the backend handle time zone differences between server, client, and rental pickup locations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a POST /search endpoint that accepts search parameters (city, pickupDateTime, dropoffDateTime) in JSON format conforming to the OpenAPI contract defined in specs/001-rental-search-homepage/contracts/search-api.yaml
- **FR-002**: System MUST validate all incoming search requests and reject invalid requests with 400 status codes and structured error responses including error code, message, and affected field
- **FR-003**: System MUST query at least 3 different car rental provider APIs concurrently to aggregate rental quotes for the specified city and date range
- **FR-004**: System MUST retrieve route and attraction data for the specified EU city from a route intelligence service or database
- **FR-005**: System MUST combine rental quotes with relevant route information, matching each rental result with appropriate driving routes and attractions for the pickup city
- **FR-006**: System MUST return responses conforming to the OpenAPI schema with rental results array, total result count, and server timestamp
- **FR-007**: System MUST support EU cities list (minimum 50 major cities) and validate search requests against this list
- **FR-008**: System MUST handle rental provider API failures gracefully by returning partial results from successful providers when some providers fail
- **FR-009**: System MUST enforce request timeout limits (maximum 10 seconds total response time) to prevent hanging requests
- **FR-010**: System MUST implement rate limiting to protect against abuse (maximum 60 requests per minute per IP address)
- **FR-011**: System MUST return 503 Service Unavailable when all external dependencies are down rather than failing with 500 errors
- **FR-012**: System MUST log all search requests with parameters, response times, and external service status for monitoring and debugging
- **FR-013**: System MUST validate date/time formats as ISO 8601 in UTC and ensure dropoff is after pickup
- **FR-014**: System MUST provide versioned API endpoints (e.g., /v1/search) to support future API evolution without breaking existing clients
- **FR-015**: System MUST return car model information including name, category, image URL, passenger capacity, and transmission type for each rental result
- **FR-016**: System MUST include route information with at least one attraction, estimated duration, total distance, multi-day itinerary when applicable, and self-drive recommendations
- **FR-017**: System MUST handle missing or invalid image URLs from external services by returning empty strings rather than failing the request
- **FR-018**: System MUST implement CORS headers to allow frontend applications from approved origins to call the API

### Key Entities

- **Search Request**: Incoming API request containing city (string, EU city name), pickupDateTime (ISO 8601 datetime), dropoffDateTime (ISO 8601 datetime), representing user's rental search parameters
- **Rental Provider Response**: External API response from a car rental provider containing rental quotes, car models, pricing, and availability information that must be normalized to our schema
- **Route Data**: Collection of attractions, itinerary, distance, duration, and recommendations for driving routes near the specified city, sourced from route intelligence service or database
- **Attraction Record**: Point of interest along a route including name, description, location coordinates, category, thumbnail URL, and estimated visit time
- **Aggregated Result**: Combined rental quote and route information ready to be returned to the frontend, containing all data from RentalResult schema
- **Error Response**: Structured error object with machine-readable error code, human-readable message, and optional field reference for validation errors

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Search requests return results within 3 seconds for 95% of requests under normal load conditions
- **SC-002**: The system successfully aggregates results from at least 3 rental providers for 90% of searches
- **SC-003**: API availability remains above 99.5% (measured as successful responses divided by total requests excluding client errors)
- **SC-004**: When one rental provider fails, the system still returns partial results from other providers for 100% of affected requests
- **SC-005**: All validation errors return appropriate 400 responses with specific error codes within 100ms
- **SC-006**: The system handles 1000 concurrent search requests without degradation in response time
- **SC-007**: Route information includes at least 3 attractions for 80% of search results (when attraction data is available for that city)
- **SC-008**: External service timeout enforcement prevents any request from taking longer than 10 seconds total

### Assumptions

1. **Rental Provider APIs**: We assume external car rental provider APIs exist and are accessible, requiring API keys/credentials provided via environment configuration. Initial implementation will integrate with Enterprise, Hertz, and Avis APIs (or use mock adapters if APIs not available).

2. **Route Intelligence Data**: We assume either (a) a third-party route/attraction API is available (e.g., Google Places, TripAdvisor), or (b) we maintain a curated database of attractions and routes for major EU cities. Initial implementation prioritizes London, Paris, Rome, Barcelona, and Berlin.

3. **Currency Normalization**: We assume all rental prices should be returned in EUR (Euros) and the backend is responsible for currency conversion if providers return prices in other currencies.

4. **Authentication**: We assume this backend service does not require user authentication (it's a public search API), but may require API key validation from the frontend to prevent abuse in production.

5. **Data Freshness**: We assume rental availability and pricing data from providers is reasonably current (refreshed within 1 hour), but we do not maintain real-time inventory sync with provider systems.

6. **Image Hosting**: We assume external providers supply car images and attraction thumbnails via URLs, and the backend does not host or cache these images directly.

7. **Caching Strategy**: We assume route/attraction data for cities can be cached aggressively (24-hour TTL) as this data changes infrequently, while rental quotes should not be cached to ensure current pricing and availability.

8. **Geolocation Data**: We assume accurate latitude/longitude coordinates for attractions are available from external data sources or pre-configured in our database.

9. **EU Cities Scope**: We assume "major EU cities" includes all capital cities plus significant tourist destinations (approximately 50-100 cities) with the exact list defined during planning based on rental provider coverage and frontend requirements.

10. **Error Recovery**: We assume when external services fail, the system should prioritize returning partial results over failing completely, with appropriate logging for operations teams to monitor service health.

---

## Implementation Notes

This backend service is designed to work with the frontend specified in `001-rental-search-homepage`. The API contract is defined in `specs/001-rental-search-homepage/contracts/search-api.yaml` and must be strictly adhered to for frontend compatibility.

The backend will be deployed as a separate service from the frontend (frontend: static hosting, backend: Node.js hosting environment) to enable independent scaling and deployment.
