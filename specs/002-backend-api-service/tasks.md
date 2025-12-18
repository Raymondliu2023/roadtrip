# Tasks: Car Rental Search Backend API Service

**Input**: Design documents from `/specs/002-backend-api-service/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/search-api.yaml

**Tests**: Test tasks are included following TDD workflow as specified in the project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`
- Backend service in separate directory from frontend

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend/ directory structure with src/, tests/, config/, migrations/ subdirectories per implementation plan
- [x] T002 Initialize Node.js 18+ project with package.json in backend/
- [x] T003 [P] Install Fastify 4.x, Pino, prom-client, and development dependencies (Vitest, Supertest, jest-openapi) in backend/
- [x] T004 [P] Configure ESLint and Prettier for JavaScript ES modules in backend/.eslintrc.js and backend/.prettierrc
- [x] T005 [P] Create .env.example file in backend/ with required environment variables (PORT, REDIS_URL, POSTGRES_URL, etc.)
- [x] T006 [P] Create backend/README.md with setup instructions and API documentation links
- [x] T007 [P] Configure Vitest for unit and integration tests in backend/vitest.config.js

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Setup PostgreSQL connection pool in backend/src/db/postgres.js with error handling
- [x] T009 [P] Setup Redis client connection in backend/src/db/redis.js with retry logic
- [x] T010 [P] Create database migration 001_create_attractions.sql for attractions table with PostGIS geometry column
- [x] T011 Create Fastify app setup with plugins in backend/src/app.js (no routes yet)
- [x] T012 [P] Configure Pino structured logging with request ID correlation in backend/src/app.js
- [x] T013 [P] Implement CORS middleware in backend/src/middleware/cors.js allowing frontend origins from env config
- [x] T014 [P] Implement global error handler middleware in backend/src/middleware/errorHandler.js
- [x] T015 [P] Create environment configuration loader in backend/config/default.js, development.js, production.js
- [x] T016 Create constants file in backend/src/utils/constants.js with EU cities list (50+ cities) and error codes
- [x] T017 [P] Create BaseProvider abstract class in backend/src/adapters/BaseProvider.js defining provider interface
- [x] T018 [P] Create timeout utility wrapper in backend/src/utils/timeout.js for Promise timeout enforcement
- [x] T019 Create health check endpoint GET /health in backend/src/routes/health.js returning status and timestamp
- [x] T020 Create server entry point in backend/src/server.js that starts Fastify with graceful shutdown
- [x] T021 [P] Setup Prometheus metrics endpoint GET /metrics in backend/src/routes/metrics.js with prom-client

**Checkpoint**: Foundation ready ✅ - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search Rental Quotes with Route Intelligence (Priority: P1) 🎯 MVP

**Goal**: Implement POST /v1/search endpoint that aggregates rental quotes from multiple providers and enriches them with route/attraction data for the specified EU city

**Independent Test**: Send POST /v1/search requests with various cities and dates, verify 200 OK responses with rental results array containing provider data, pricing, car models, and route information with attractions

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T022 [P] [US1] Create contract test for POST /v1/search in backend/tests/contract/searchApi.contract.test.js validating against search-api.yaml
- [ ] T023 [P] [US1] Create integration test for valid London search in backend/tests/integration/search.integration.test.js
- [ ] T024 [P] [US1] Create integration test for valid Paris search in backend/tests/integration/search.integration.test.js
- [ ] T025 [P] [US1] Create integration test for no results scenario in backend/tests/integration/search.integration.test.js
- [ ] T026 [P] [US1] Create integration test for partial provider failure scenario in backend/tests/integration/search.integration.test.js

### Implementation for User Story 1

- [ ] T027 [P] [US1] Create SearchRequest validation model in backend/src/models/SearchRequest.js with ISO 8601 datetime and city validation
- [ ] T028 [P] [US1] Create RentalResult normalization model in backend/src/models/RentalResult.js mapping provider responses to API schema
- [ ] T029 [P] [US1] Create Attraction entity model in backend/src/models/Attraction.js with location and category validation
- [ ] T030 [P] [US1] Create Price model in backend/src/models/Price.js with currency validation
- [ ] T031 [P] [US1] Create CarModel model in backend/src/models/CarModel.js with category enum validation
- [ ] T032 [P] [US1] Create RouteInformation model in backend/src/models/RouteInformation.js with itinerary and attractions
- [ ] T033 [P] [US1] Create MockProvider adapter in backend/src/adapters/MockProvider.js extending BaseProvider with realistic mock data
- [ ] T034 [P] [US1] Create EnterpriseAdapter in backend/src/adapters/EnterpriseAdapter.js extending BaseProvider (mock implementation for MVP)
- [ ] T035 [P] [US1] Create HertzAdapter in backend/src/adapters/HertzAdapter.js extending BaseProvider (mock implementation for MVP)
- [ ] T036 [P] [US1] Create AvisAdapter in backend/src/adapters/AvisAdapter.js extending BaseProvider (mock implementation for MVP)
- [ ] T037 [US1] Implement providerService in backend/src/services/providerService.js using Promise.allSettled() for concurrent queries with 5s timeout per provider
- [ ] T038 [US1] Implement routeService in backend/src/services/routeService.js to fetch attractions from PostgreSQL and generate route data
- [ ] T039 [US1] Implement cacheService in backend/src/services/cacheService.js with Redis for 24h route caching and in-memory 1h rate caching
- [ ] T040 [US1] Create currency converter utility in backend/src/utils/currencyConverter.js to normalize prices to EUR
- [ ] T041 [US1] Implement POST /v1/search route handler in backend/src/routes/search.js integrating providerService and routeService
- [ ] T042 [US1] Add logging for search operations in backend/src/routes/search.js with provider latencies and result counts
- [ ] T043 [US1] Add Prometheus metrics for search endpoint in backend/src/routes/search.js (request duration, provider status)
- [ ] T044 [US1] Seed attractions database with London data using migration 002_seed_london_attractions.sql (10-15 attractions)
- [ ] T045 [US1] Seed attractions database with Paris data using migration 003_seed_paris_attractions.sql (10-15 attractions)

**Checkpoint**: At this point, User Story 1 should be fully functional - can search rentals for London/Paris and get results with route data

---

## Phase 4: User Story 2 - Request Validation and Error Handling (Priority: P1)

**Goal**: Implement comprehensive request validation with clear error responses and rate limiting to protect the API

**Independent Test**: Send invalid requests (past dates, invalid cities, malformed data, rate limit violations) and verify appropriate 400/429 error responses with specific error codes and field references

### Tests for User Story 2

- [ ] T046 [P] [US2] Create integration test for invalid date range validation in backend/tests/integration/validation.integration.test.js
- [ ] T047 [P] [US2] Create integration test for past pickup date validation in backend/tests/integration/validation.integration.test.js
- [ ] T048 [P] [US2] Create integration test for invalid city validation in backend/tests/integration/validation.integration.test.js
- [ ] T049 [P] [US2] Create integration test for missing required fields validation in backend/tests/integration/validation.integration.test.js
- [ ] T050 [P] [US2] Create integration test for rate limiting (61 requests) in backend/tests/integration/validation.integration.test.js

### Implementation for User Story 2

- [ ] T051 [P] [US2] Create ErrorResponse model in backend/src/models/ErrorResponse.js with code, message, and optional field
- [ ] T052 [US2] Implement validationService in backend/src/services/validationService.js with methods for date range, city, and required field validation
- [ ] T053 [US2] Implement rate limiter middleware in backend/src/middleware/rateLimiter.js using Fastify rate limit plugin with Redis backend (60 req/min per IP)
- [ ] T054 [US2] Add validation logic to POST /v1/search route handler in backend/src/routes/search.js calling validationService
- [ ] T055 [US2] Update error handler middleware in backend/src/middleware/errorHandler.js to return structured ErrorResponse format
- [ ] T056 [US2] Add validation error response logic returning 400 with specific error codes (INVALID_DATE_RANGE, PAST_DATETIME, INVALID_CITY)
- [ ] T057 [US2] Add rate limit error response logic returning 429 with RATE_LIMIT_EXCEEDED code
- [ ] T058 [US2] Add 503 Service Unavailable handling when all providers fail in backend/src/routes/search.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - can perform valid searches and receive clear errors for invalid requests

---

## Phase 5: User Story 3 - External Service Integration and Resilience (Priority: P2)

**Goal**: Enhance external service integration with proper timeout enforcement, graceful degradation, and resilience patterns

**Independent Test**: Simulate external service failures (timeouts, errors, partial failures) and verify backend handles them gracefully, returning partial results or appropriate errors without crashing

### Tests for User Story 3

- [ ] T059 [P] [US3] Create integration test for single provider timeout in backend/tests/integration/resilience.integration.test.js
- [ ] T060 [P] [US3] Create integration test for multiple provider failures with partial results in backend/tests/integration/resilience.integration.test.js
- [ ] T061 [P] [US3] Create integration test for all providers down returning 503 in backend/tests/integration/resilience.integration.test.js
- [ ] T062 [P] [US3] Create integration test for route service unavailable with fallback in backend/tests/integration/resilience.integration.test.js
- [ ] T063 [P] [US3] Create integration test for 10s total timeout enforcement in backend/tests/integration/resilience.integration.test.js

### Implementation for User Story 3

- [ ] T064 [US3] Add configurable delay/failure simulation to MockProvider in backend/src/adapters/MockProvider.js for testing resilience
- [ ] T065 [US3] Implement 5s timeout per provider in providerService in backend/src/services/providerService.js using timeout utility
- [ ] T066 [US3] Implement 10s total request timeout in backend/src/routes/search.js wrapping entire search operation
- [ ] T067 [US3] Add provider health tracking in providerService in backend/src/services/providerService.js logging success/failure rates
- [ ] T068 [US3] Add graceful fallback for route service failures in routeService in backend/src/services/routeService.js returning cached or placeholder data
- [ ] T069 [US3] Add response validation for provider data in providerService in backend/src/services/providerService.js to filter malformed results
- [ ] T070 [US3] Add comprehensive error logging with provider names and error details in backend/src/services/providerService.js
- [ ] T071 [US3] Add Prometheus metrics for provider health (success rate, timeout rate, error rate) in backend/src/services/providerService.js

**Checkpoint**: All user stories should now be independently functional with production-grade resilience

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T072 [P] Add unit tests for validationService in backend/tests/unit/services/validationService.test.js
- [ ] T073 [P] Add unit tests for currencyConverter in backend/tests/unit/utils/currencyConverter.test.js
- [ ] T074 [P] Add unit tests for timeout utility in backend/tests/unit/utils/timeout.test.js
- [ ] T075 [P] Add unit tests for SearchRequest model in backend/tests/unit/models/SearchRequest.test.js
- [ ] T076 [P] Add unit tests for RentalResult model in backend/tests/unit/models/RentalResult.test.js
- [ ] T077 [P] Create test fixtures for mock provider responses in backend/tests/fixtures/mockProviderResponses.js
- [ ] T078 [P] Create test fixtures for mock attraction data in backend/tests/fixtures/mockAttractionData.js
- [ ] T079 [P] Add OpenTelemetry distributed tracing setup in backend/src/app.js with trace context propagation
- [ ] T080 [P] Create Grafana dashboard configuration in backend/config/grafana-dashboard.json with key metrics
- [ ] T081 [P] Create Dockerfile for backend service in backend/Dockerfile with Node.js 18+ base image
- [ ] T082 [P] Add Docker Compose configuration in backend/docker-compose.yml for local development (backend, PostgreSQL, Redis)
- [ ] T083 [P] Seed attractions database with additional EU cities (Rome, Barcelona, Berlin) using migrations
- [ ] T084 [P] Update backend/README.md with deployment instructions and architecture diagram
- [ ] T085 Run all 13 quickstart.md manual test scenarios and verify all pass
- [ ] T086 Run load test with k6 (100 concurrent requests) and verify P95 latency < 3s
- [ ] T087 Security audit: Review for SQL injection, XSS, rate limit bypass vulnerabilities
- [ ] T088 Code cleanup: Remove dead code, unused imports, and add JSDoc comments to public APIs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - May integrate with US1 but independently testable
  - US3 (Phase 5): Depends on US1 completion (enhances provider integration from US1)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Implements core search functionality
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) OR in parallel with US1 - Adds validation layer
- **User Story 3 (P2)**: Should start after US1 complete - Enhances resilience of US1 provider integration

**Note**: US1 and US2 could theoretically be developed in parallel by different developers since they touch different concerns (search logic vs. validation), but US2 integrates into US1's route handler, so sequential may be simpler.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services (services depend on models)
- Services before route handlers (routes depend on services)
- Core implementation before logging/metrics
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks except T001-T002 can run in parallel
- T003-T007 can all run in parallel after project initialized

**Phase 2 (Foundational)**: Many tasks can run in parallel
- T008-T010 (database connections and migrations) can run in parallel
- T012-T014 (middleware) can run in parallel after T011
- T015-T018 (utilities and config) can run in parallel
- T019-T021 (health/metrics endpoints) can run in parallel after T011

**Phase 3 (US1)**: High parallelization opportunities
- All 5 tests (T022-T026) can run in parallel
- All 6 models (T027-T032) can run in parallel
- All 4 provider adapters (T033-T036) can run in parallel
- T044-T045 (database seeding) can run in parallel

**Phase 4 (US2)**: Tests can run in parallel
- All 5 tests (T046-T050) can run in parallel
- T051-T053 (models and services) can run in parallel

**Phase 5 (US3)**: Tests can run in parallel
- All 5 tests (T059-T063) can run in parallel
- T064-T065 can run in parallel (different services)

**Phase 6 (Polish)**: Most tasks are parallelizable
- All unit tests (T072-T076) can run in parallel
- Test fixtures (T077-T078) can run in parallel
- Infrastructure tasks (T079-T084) can run in parallel

---

## Parallel Example: User Story 1 - Search Implementation

```bash
# Write all tests for User Story 1 together (TDD - tests first):
Task: "Create contract test for POST /v1/search in backend/tests/contract/searchApi.contract.test.js"
Task: "Create integration test for valid London search in backend/tests/integration/search.integration.test.js"
Task: "Create integration test for valid Paris search in backend/tests/integration/search.integration.test.js"
Task: "Create integration test for no results scenario in backend/tests/integration/search.integration.test.js"
Task: "Create integration test for partial provider failure in backend/tests/integration/search.integration.test.js"

# Verify all tests FAIL (no implementation yet)

# Then create all data models together:
Task: "Create SearchRequest model in backend/src/models/SearchRequest.js"
Task: "Create RentalResult model in backend/src/models/RentalResult.js"
Task: "Create Attraction model in backend/src/models/Attraction.js"
Task: "Create Price model in backend/src/models/Price.js"
Task: "Create CarModel model in backend/src/models/CarModel.js"
Task: "Create RouteInformation model in backend/src/models/RouteInformation.js"

# Then create all provider adapters together:
Task: "Create MockProvider adapter in backend/src/adapters/MockProvider.js"
Task: "Create EnterpriseAdapter in backend/src/adapters/EnterpriseAdapter.js"
Task: "Create HertzAdapter in backend/src/adapters/HertzAdapter.js"
Task: "Create AvisAdapter in backend/src/adapters/AvisAdapter.js"

# Seed database in parallel:
Task: "Seed London attractions using migration 002_seed_london_attractions.sql"
Task: "Seed Paris attractions using migration 003_seed_paris_attractions.sql"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

**Recommended approach for fastest time-to-value**:

1. **Complete Phase 1**: Setup (~1 day)
   - Initialize Node.js project
   - Install dependencies
   - Configure tooling

2. **Complete Phase 2**: Foundational (~2-3 days) **CRITICAL - BLOCKS ALL STORIES**
   - Database connections (PostgreSQL + Redis)
   - Fastify app setup
   - Middleware (CORS, error handling, logging)
   - Base utilities and constants
   - Health check endpoint

3. **Complete Phase 3**: User Story 1 (~3-4 days)
   - TDD: Write tests first (all fail)
   - Models and adapters
   - Services (provider, route, cache)
   - POST /v1/search endpoint
   - Database seeding
   - **STOP and VALIDATE**: Test independently with quickstart scenarios 1-2

4. **Complete Phase 4**: User Story 2 (~2 days)
   - TDD: Write validation tests first
   - Validation service
   - Rate limiting
   - Error responses
   - **STOP and VALIDATE**: Test independently with quickstart scenarios 3-7

5. **Deploy MVP**: User Stories 1 + 2 provide complete searchable API with validation

### Incremental Delivery

1. **Foundation Ready** (Phases 1-2) → Infrastructure complete
2. **MVP: Search + Validation** (Phases 1-4) → Deployable API service
3. **Production Ready** (Phases 1-5) → Add resilience (US3)
4. **Polished** (Phases 1-6) → Production-grade with monitoring, tests, documentation

### Parallel Team Strategy

With 2-3 developers:

1. **All developers together**: Complete Setup + Foundational (Phases 1-2)
2. **After Foundational done**:
   - Developer A: User Story 1 (search functionality)
   - Developer B: User Story 2 (validation and rate limiting)
   - Developer C: Start on User Story 3 tests
3. **Integration point**: Merge US1 + US2 → Test together → Deploy MVP
4. **Continue**: Complete US3 → Full production ready

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **TDD workflow**: Tests MUST be written first and FAIL before implementation
- **Independent stories**: Each user story should be independently completable and testable
- **Commit frequently**: After each task or logical group of [P] tasks
- **Stop at checkpoints**: Validate each story independently before proceeding
- **MVP scope**: User Stories 1 + 2 provide complete, deployable search API
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 14 tasks (BLOCKS all stories)
- **Phase 3 (US1)**: 24 tasks (5 tests + 19 implementation)
- **Phase 4 (US2)**: 13 tasks (5 tests + 8 implementation)
- **Phase 5 (US3)**: 13 tasks (5 tests + 8 implementation)
- **Phase 6 (Polish)**: 17 tasks

**Total**: 88 tasks

**Parallel opportunities**: ~40 tasks marked [P] can run concurrently

**MVP scope** (Phases 1-4): 58 tasks → Complete searchable API with validation
**Production scope** (Phases 1-5): 71 tasks → Adds resilience and failover
**Full scope** (Phases 1-6): 88 tasks → Production-grade with monitoring and documentation
