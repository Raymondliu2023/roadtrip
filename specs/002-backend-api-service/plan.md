# Implementation Plan: Car Rental Search Backend API Service

**Branch**: `002-backend-api-service` | **Date**: 2025-12-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-backend-api-service/spec.md`

## Summary

This backend service provides a RESTful API for searching car rentals across multiple EU cities, aggregating quotes from 3+ rental providers and enriching results with route intelligence (attractions, itineraries, driving recommendations). The service implements the OpenAPI contract defined in `specs/001-rental-search-homepage/contracts/search-api.yaml` to enable seamless integration with the existing vanilla JavaScript frontend.

**Key Capabilities**:
- POST /search endpoint with request validation and error handling
- Concurrent queries to 3+ rental providers (Enterprise, Hertz, Avis) with 5s per-provider timeout
- Route/attraction data integration from Google Places API and Mapbox Directions
- Multi-layer caching (Redis for routes 24h, in-memory for rates 1h, no cache for quotes)
- Graceful degradation on partial provider failures
- IP-based rate limiting (60 requests/minute)
- Comprehensive logging, metrics, and distributed tracing

**Technical Approach**: Node.js 18+ with Fastify 4.x for high-performance JSON API handling, Promise.allSettled() for concurrent provider calls, PostgreSQL with PostGIS for attraction data storage, Redis for distributed caching, and Prometheus/OpenTelemetry for observability.

---

## Technical Context

**Language/Version**: JavaScript (Node.js 18+ LTS with ES modules)
**Primary Dependencies**: Fastify 4.x (web framework), Pino (logging), prom-client (Prometheus metrics)
**Storage**: PostgreSQL 14+ with PostGIS extension (attractions data), Redis 7+ (distributed cache, rate limiting)
**Testing**: Vitest (unit/integration), jest-openapi (contract validation), Supertest (HTTP assertions), Playwright (E2E), k6 (load testing)
**Target Platform**: Linux server / Docker containers (Node.js runtime)
**Project Type**: Web (backend API service, separate from frontend)
**Performance Goals**: <3s response time for 95% of requests, 1000 concurrent requests without degradation, <100ms validation errors
**Constraints**: 10s max total request timeout, 5s per-provider timeout, 60 requests/minute per IP, API contract compatibility with frontend
**Scale/Scope**: 10k users initially, 100k searches/month, 50-100 EU cities supported, 3-5 rental providers

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Before Phase 0)

**I. Specification-First** ✅ PASS
- Complete specification exists ([spec.md](spec.md))
- Technology-agnostic user stories and requirements defined
- Measurable success criteria documented
- No implementation details in specification

**II. Plan Before Implement** ⏳ IN PROGRESS
- Technical planning underway (this document)
- Research phase completed → [research.md](research.md)
- Design artifacts in progress

**III. Test-Driven Development** ⏳ PENDING
- Contract tests will validate OpenAPI schema compliance
- Integration tests will cover all acceptance scenarios
- TDD workflow will be enforced in tasks phase

**IV. Independent User Stories** ✅ PASS
- 3 user stories prioritized (P1, P1, P2)
- US1 (Search) independently testable (send requests, verify responses)
- US2 (Validation) independently testable (send invalid requests, verify errors)
- US3 (Resilience) independently testable (simulate failures, verify graceful degradation)
- No circular dependencies between stories

**V. Simplicity and Justification** ✅ PASS
- Simple architecture: Single backend service, no microservices
- Standard patterns: REST API, promise-based concurrency, adapter pattern
- No premature optimization: Circuit breaker deferred until 10+ providers
- Complexity tracked below if needed

### Post-Design Check (After Phase 1)

**I. Specification-First** ✅ PASS
- Design artifacts align with specification requirements
- Data model entities map to spec entities (SearchRequest, RentalResult, etc.)
- API contract (search-api.yaml) strictly adhered to

**II. Plan Before Implement** ✅ PASS
- Technical context fully defined (no "NEEDS CLARIFICATION" markers)
- Research completed with decisions documented
- Design artifacts complete: [data-model.md](data-model.md), [quickstart.md](quickstart.md), [contracts/](contracts/) (symlinked)
- All dependencies and patterns selected with rationale

**III. Test-Driven Development** ⏳ READY FOR TASKS
- Test strategy defined: Vitest (unit), jest-openapi (contract), Supertest (integration), k6 (load)
- Quickstart manual scenarios prepared
- TDD workflow will be enforced in tasks phase

**IV. Independent User Stories** ✅ PASS
- User stories remain independently testable
- Foundation phase identified (blocks all stories): setup, validation, provider adapters
- Story-specific phases: US1 (search endpoint), US2 (error handling), US3 (resilience)

**V. Simplicity and Justification** ✅ PASS
- No complexity violations identified
- Standard Node.js project structure
- Proven patterns: adapter, promise concurrency, caching layers

**GATE STATUS**: ✅ PASS - Ready to proceed to `/speckit.tasks`

---

## Project Structure

### Documentation (this feature)

```text
specs/002-backend-api-service/
├── spec.md                # Feature specification with user stories
├── plan.md                # This file - technical implementation plan
├── research.md            # Technology decisions and alternatives
├── data-model.md          # Entity definitions and relationships
├── quickstart.md          # Manual test scenarios (13 scenarios)
├── contracts/             # Symlink to ../001-rental-search-homepage/contracts/
│   └── search-api.yaml    # OpenAPI 3.0 specification (shared with frontend)
├── checklists/
│   └── requirements.md    # Spec quality validation checklist
└── tasks.md               # (Created by /speckit.tasks - NOT YET CREATED)
```

### Source Code (repository root)

```text
backend/                    # New backend service directory
├── src/
│   ├── routes/
│   │   └── search.js       # POST /v1/search endpoint handler
│   ├── services/
│   │   ├── providerService.js      # Provider aggregation logic
│   │   ├── routeService.js         # Route/attraction data integration
│   │   ├── cacheService.js         # Redis caching layer
│   │   └── validationService.js    # Request validation
│   ├── adapters/
│   │   ├── BaseProvider.js         # Provider interface
│   │   ├── EnterpriseAdapter.js    # Enterprise provider integration
│   │   ├── HertzAdapter.js         # Hertz provider integration
│   │   ├── AvisAdapter.js          # Avis provider integration
│   │   └── MockProvider.js         # Mock provider for development
│   ├── models/
│   │   ├── SearchRequest.js        # Request validation model
│   │   ├── RentalResult.js         # Response normalization model
│   │   └── Attraction.js           # Attraction entity
│   ├── utils/
│   │   ├── constants.js            # EU cities list, error codes
│   │   ├── currencyConverter.js    # Currency normalization to EUR
│   │   └── timeout.js              # Timeout wrapper utilities
│   ├── middleware/
│   │   ├── rateLimiter.js          # Fastify rate limiting plugin
│   │   ├── cors.js                 # CORS configuration
│   │   └── errorHandler.js         # Global error handling
│   ├── db/
│   │   ├── postgres.js             # PostgreSQL connection
│   │   └── redis.js                # Redis connection
│   ├── app.js                      # Fastify app setup
│   └── server.js                   # Entry point (starts server)
├── tests/
│   ├── contract/
│   │   └── searchApi.contract.test.js   # OpenAPI schema validation
│   ├── integration/
│   │   ├── search.integration.test.js   # Full search flow tests
│   │   ├── validation.integration.test.js  # Error handling tests
│   │   └── resilience.integration.test.js  # Partial failure tests
│   ├── unit/
│   │   ├── services/
│   │   ├── adapters/
│   │   └── utils/
│   └── fixtures/
│       ├── mockProviderResponses.js
│       └── mockAttractionData.js
├── migrations/              # Database migrations (PostGIS setup)
│   └── 001_create_attractions.sql
├── config/
│   ├── default.js          # Default configuration
│   ├── development.js      # Development overrides
│   └── production.js       # Production settings
├── package.json
├── .env.example            # Environment variables template
├── Dockerfile              # Container definition
└── README.md               # Backend service documentation

frontend/                   # Existing frontend (already implemented)
├── src/
│   └── [existing frontend files]
└── [existing structure]
```

**Structure Decision**: Web application with separate backend and frontend directories. Backend is a new Node.js service that will be deployed independently from the existing frontend (frontend: static hosting, backend: Node.js hosting or containers). This separation enables independent scaling and deployment, aligns with modern cloud architecture patterns, and maintains clear separation of concerns.

---

## Complexity Tracking

> **No complexity violations identified** - Standard single backend service with proven patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Design Artifacts Summary

### 1. Research Decisions ([research.md](research.md))

| Area | Decision | Cost Impact |
|------|----------|-------------|
| Runtime | Node.js 18+ LTS | $0 (open source) |
| Framework | Fastify 4.x | $0 (open source) |
| Concurrency | Promise.allSettled() | $0 (built-in) |
| Rate Limiting | Fastify plugin + Redis | $15-50/mo (Redis) |
| Attractions Data | Google Places API | Free tier covers MVP |
| Route Calculation | Mapbox Directions | Free tier (100k/mo) |
| Storage | PostgreSQL + PostGIS + Redis | $30-50/mo (MVP) |
| Caching | Redis (routes 24h) + in-memory (rates 1h) | Saves $200-500/mo in API costs |

**Total MVP Cost**: $30-50/month
**Total Production Cost** (10k users): $720-1000/month

### 2. Data Model ([data-model.md](data-model.md))

**15 entities defined** with validation rules, relationships, and state transitions:
- SearchRequest, ProviderSearchQuery, ProviderRawResponse
- RentalResult, Price, CarModel
- RouteInformation, Attraction, Location, Coordinates
- Duration, Distance, ItineraryDay
- ErrorResponse, CacheEntry

**Database Schema**: PostgreSQL with PostGIS for geo-queries

### 3. API Contract ([contracts/search-api.yaml](contracts/search-api.yaml))

**Shared contract with frontend** (symlinked from frontend spec):
- POST /v1/search endpoint
- Request/response schemas with examples
- Error response formats (400, 429, 500, 503)
- Ensures frontend-backend compatibility

### 4. Test Scenarios ([quickstart.md](quickstart.md))

**13 manual test scenarios** covering:
- Valid searches (London, Paris)
- Validation errors (invalid date range, past dates, invalid city)
- Rate limiting
- Partial/complete provider failures
- Performance testing (concurrent requests)
- CORS, timeouts, no results handling

---

## Implementation Phases (Preview)

### Phase 0: Foundational Setup (Week 1)
- Project initialization (package.json, directory structure)
- Fastify app setup with Pino logging
- PostgreSQL and Redis connections
- Environment configuration
- Basic health check endpoint

### Phase 1: Core Search (Week 2)
- POST /v1/search endpoint (US1)
- Request validation (US2)
- Mock provider adapters
- Provider adapter interface (BaseProvider)
- Promise.allSettled() concurrency
- Basic error responses

### Phase 2: Robustness (Week 3)
- Rate limiting with Redis (US2)
- CORS middleware (FR-018)
- Contract validation tests (jest-openapi)
- Integration tests (Vitest + Supertest)
- Health tracking for providers (US3)

### Phase 3: Data Integration (Week 4)
- PostgreSQL + PostGIS setup
- Google Places API integration
- Mapbox Directions API integration
- Redis caching layer (routes, rates)
- Route data enrichment

### Phase 4: Production Ready (Week 5)
- Prometheus metrics (/metrics endpoint)
- OpenTelemetry tracing setup
- Real provider adapters (or keep mocks)
- Load testing with k6
- Grafana dashboard
- Deployment automation (Docker)

**Note**: Detailed task breakdown will be created in `/speckit.tasks` phase

---

## Next Steps

1. **Constitution Validation**: ✅ Complete - All gates pass
2. **Agent Context Update**: Run `.specify/scripts/bash/update-agent-context.sh claude`
3. **Task Generation**: Execute `/speckit.tasks` to break down into TDD workflow tasks
4. **Implementation**: Execute `/speckit.implement` following TDD cycle

---

**Planning Status**: Complete ✅
**Ready for**: `/speckit.tasks` command to generate implementation task breakdown
