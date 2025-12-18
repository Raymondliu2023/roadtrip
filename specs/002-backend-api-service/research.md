# Technical Research: Car Rental Search Backend API Service

**Date**: 2025-12-18
**Feature**: Backend API service for car rental search with route intelligence
**Research Phase**: Completed

## Overview

This document consolidates research findings for implementing the backend API service that powers the car rental search platform. Research covers technology stack selection, external API integration patterns, and route/attraction data management strategies.

---

## 1. Backend Technology Stack

### Language & Runtime

**Decision: Node.js 18+ LTS**

**Rationale:**
- JavaScript ecosystem alignment with existing vanilla JavaScript frontend (Vite)
- Excellent I/O concurrency for handling 1000+ concurrent requests with multiple external API calls
- Non-blocking event loop architecturally suited for aggregating data from 3+ rental providers
- Vast npm ecosystem (100K+ packages) accelerates feature development
- Production-ready with 2.5+ years LTS support
- Lightweight deployment (Docker, serverless options)

**Alternatives Considered:**
- **Go**: Superior performance and concurrency primitives, but adds language complexity to JavaScript-native team
- **Python + FastAPI**: Clean async syntax, but slower JSON serialization and GIL limitations
- **Rust**: Best performance but steep learning curve and slower development velocity
- **Java/Spring Boot**: Enterprise-grade but heavier infrastructure overhead

---

### Web Framework

**Decision: Fastify 4.x**

**Rationale:**
- **Performance**: 2-3x faster than Express for JSON workloads (critical for <3s 95th percentile latency)
- **Built-in features**: JSON Schema validation (aligns with OpenAPI contract), request/response optimization, Pino logger, hooks system
- **Concurrency**: Streams-first design handles concurrent requests efficiently
- **Production-proven**: Used by Netflix, eBay in high-traffic scenarios
- **Plugin ecosystem**: Mature plugins for rate limiting, CORS, monitoring

**Alternatives Considered:**
- **Express.js**: Most popular but slower, less optimized for high concurrency
- **NestJS**: Powerful TypeScript framework but adds unnecessary complexity (DI, compilation overhead)
- **Koa**: Lightweight and modern but smaller ecosystem
- **Hapi**: Good for APIs but more verbose and slower than Fastify

---

### Testing Strategy

**Decision: Multi-layer testing with Vitest, Supertest, and Playwright**

**Testing Stack:**
- **Contract Tests**: `jest-openapi` to validate responses against OpenAPI schema
- **Integration Tests**: Vitest + Supertest for HTTP endpoint testing
- **Unit Tests**: Vitest + MSW (Mock Service Worker) for service layer
- **E2E Tests**: Playwright (already in frontend) for complete user flows
- **Load Tests**: k6 or Artillery for validating 1000 concurrent request requirement

**Rationale:**
- Vitest is Jest-compatible but faster with better ESM support
- Reuse MSW from frontend package.json for consistency
- Playwright enables shared test infrastructure between frontend/backend
- k6 provides programmable load testing with clear performance metrics

---

### Concurrent External API Calls

**Decision: Promise.allSettled() with timeout wrappers and simple health tracking**

**Architecture:**
```javascript
async function searchRentals(searchQuery) {
  const providers = [
    callWithTimeout(enterpriseAdapter, searchQuery, 5000),
    callWithTimeout(hertzAdapter, searchQuery, 5000),
    callWithTimeout(avisAdapter, searchQuery, 5000)
  ];

  const results = await Promise.allSettled(providers);

  // Return partial results if at least one provider succeeds
  const successfulResults = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  if (successfulResults.length === 0) {
    throw new ServiceUnavailableError('All providers failed');
  }

  return mergeResults(successfulResults);
}
```

**Rationale:**
- `Promise.allSettled()` allows partial success (2 of 3 providers can fail, still return results)
- 5-second timeout per provider, 10-second total budget enforced
- Simple health tracking sufficient for 3 providers (circuit breaker at 10+ providers)
- Testable with mock adapters
- Scales naturally with Node.js non-blocking I/O

**Alternatives Considered:**
- **Message Queue (RabbitMQ/Redis)**: Overkill for synchronous API calls, adds operational complexity
- **Worker Threads**: Unnecessary overhead for I/O-bound operations
- **GraphQL Federation**: Too complex for aggregating similar data structures

---

### Rate Limiting

**Decision: Fastify plugin with Redis backend using Token Bucket algorithm**

**Implementation:**
```javascript
fastify.register(require('@fastify/rate-limit'), {
  max: 60,                    // 60 requests
  timeWindow: '1 minute',     // per minute
  redis: redisClient,         // distributed across instances
  keyGenerator: (req) => req.ip  // IP-based limiting
});
```

**Rationale:**
- Token bucket algorithm allows burst traffic up to limit
- Redis enables distributed rate limiting across multiple backend instances
- IP-based tracking per specification (no authentication required)
- Returns 429 with `RATE_LIMIT_EXCEEDED` error code per contract

**Alternatives Considered:**
- **In-memory**: Simpler but doesn't work across multiple server instances
- **Leaky bucket**: More predictable but less user-friendly for burst traffic
- **API keys**: Better for authenticated users but spec uses IP-based limiting

---

### Logging & Monitoring

**Decision: Pino (logging) + Prometheus (metrics) + OpenTelemetry (tracing)**

**Three-tier observability:**

**Logging (Pino)**:
- 5-8x faster than Winston with minimal overhead
- Structured JSON logging by default
- Automatically configured with Fastify
- Log: search requests, provider responses, errors, rate limit violations

**Metrics (Prometheus)**:
- `prom-client` npm package
- Track: HTTP latency histograms, request counts, provider API latency, cache hit ratio, rate limit violations
- Expose /metrics endpoint for Prometheus scraping

**Tracing (OpenTelemetry)**:
- Distributed tracing for entire search request lifecycle
- Span per provider API call
- Visual request flow identification for bottleneck analysis

**Alerting Rules:**
- Response time >3s for P95 → Alert
- Any provider down >2 consecutive failures → Alert
- Error rate >5% → Alert

---

## 2. External API Integration Patterns

### Partial Failure Handling

**Decision: Simple health tracking (not circuit breaker for MVP)**

**Pattern:**
- Track failure count per provider with sliding window
- If provider fails 3+ consecutive times, log warning but continue calling (with timeout)
- Return partial results from successful providers
- Only return 503 when ALL providers fail

**Rationale:**
- Circuit breaker pattern is overkill for 3 providers
- Timeout enforcement (5s per provider) prevents hanging
- Specification requires partial results on provider failure
- Can upgrade to circuit breaker if provider count exceeds 10

**Alternatives Considered:**
- **Circuit Breaker (opossum)**: Better for 10+ providers, but adds complexity for 3 providers
- **Retry Logic**: Could amplify cascading failures, avoided for search operations
- **Fallback to Cache**: Considered but rental quotes must be current (not cached)

---

### Data Normalization

**Decision: Provider adapter pattern with shared validation rules**

**Architecture:**
```
BaseProvider (interface)
  ├── EnterpriseAdapter
  ├── HertzAdapter
  └── AvisAdapter

Each adapter:
  - Implements search(query) → standardized format
  - Handles provider-specific authentication
  - Normalizes currency to EUR
  - Validates response schema
  - Transforms to RentalResult format
```

**Rationale:**
- Each provider isolated, maintainable as count grows
- Shared validation logic prevents duplicate code
- Easy to add mock adapters for testing
- Currency normalization centralized (all providers → EUR)

---

### Caching Strategy

**Decision: Multi-layer cache - Redis (routes 24h) + in-memory (rates 1h) + no cache (quotes)**

**Layer 1: Route/Attraction Data (Redis, 24h TTL)**
```
Key: attraction:{city}:{category}
TTL: 86400 seconds (24 hours)
Size: ~2MB per city compressed
```

**Layer 2: Exchange Rates (In-memory, 1h TTL)**
```
Key: exchange_rate:{from_currency}:{to_currency}
TTL: 3600 seconds (1 hour)
```

**Layer 3: Rental Quotes (No Cache)**
- Must be current for pricing and availability
- Cache causes stale pricing issues

**Rationale:**
- Route data changes infrequently (safe 24h cache)
- Exchange rates update daily (1h cache balances freshness/performance)
- Rental quotes must be real-time per specification
- Reduces API costs by 95% (Mapbox/Google Places)

**Cost Impact:**
- Without caching: 100k+ API requests/month (exceeds free tiers)
- With caching: ~5k API requests/month (well within free tiers)
- **Savings: $200-500/month**

---

### Mock Provider Pattern

**Decision: Full provider adapters with environment variable switching**

**Implementation:**
```javascript
// ProviderFactory
const getProvider = (name) => {
  if (process.env.USE_MOCK_PROVIDERS === 'true') {
    return new MockProvider(name);
  }
  return new RealProvider(name);
};

// MockProvider implements same interface as RealProvider
class MockProvider {
  async search(query) {
    // Return realistic mock data matching RentalResult schema
    return generateMockRentalResults(query);
  }
}
```

**Rationale:**
- Same code path tested in development and production
- Easy to switch between mock and real providers
- Mock data matches OpenAPI contract exactly
- Enables frontend development without real provider APIs

---

## 3. Route & Attraction Data Management

### Attraction Data Sources

**Decision: Google Places API (primary) with OpenStreetMap fallback**

**Primary: Google Places API**
- 200M+ places globally with comprehensive EU coverage
- Rich metadata: name, description, category, ratings, photos, coordinates
- Pricing: $7 per 1000 requests (Places Nearby), $17 per 1000 (Place Details)
- Free credit: $200/month (~40k requests included)

**Secondary: OpenStreetMap + Overpass API**
- Free and unlimited
- Used for data enrichment and local attractions
- Lower data consistency, requires manual curation

**Alternatives Considered:**
- **TripAdvisor API**: Deprecated endpoints, poor API availability
- **Wikidata SPARQL**: Complex queries, slower response times
- **GetYourGuide/Viator**: Limited free access, requires partnership

**MVP Approach:**
- Manual curation of 10-15 top attractions per city (5 cities = 50-75 total)
- Google Places API for bulk data seeding (20-30 per category per city)
- Human review layer for quality assurance

---

### Route Calculation

**Decision: Mapbox Directions API with OSRM fallback**

**Primary: Mapbox Directions API**
- Free tier: 100,000 requests/month (10x Google's free tier)
- Pricing: $0.50 per 1,000 requests (vs Google's $5.00)
- Supports up to 25 waypoints per request
- Good EU coverage and performance

**Rationale:**
- 10x more generous free tier than Google
- 10x cheaper after free tier ($0.50 vs $5.00 per 1k)
- Sufficient accuracy for tourist routing
- Multi-waypoint support for multi-day itineraries

**Alternatives Considered:**
- **Google Directions**: More expensive ($5/1k), smaller free tier
- **OSRM (self-hosted)**: Unlimited but requires server maintenance (~$100/mo)
- **HERE Maps**: Mid-range pricing, enterprise features

**Route Optimization:**
- Simple nearest-neighbor algorithm (no full TSP solver)
- Pre-compute common city loops (top 10 museums, historical sites, etc.)
- Cache routes for 7 days (routes don't change)

---

### Data Storage

**Decision: Hybrid - PostgreSQL with PostGIS + Static JSON on CDN**

**Primary: PostgreSQL with PostGIS extension**
```sql
CREATE TABLE attractions (
    id UUID PRIMARY KEY,
    city_code VARCHAR(10),
    name VARCHAR(255),
    description TEXT,
    location GEOMETRY(POINT, 4326),
    category VARCHAR(100),
    rating FLOAT,
    visit_duration_minutes INT,
    photo_urls TEXT[],
    metadata JSONB
);

CREATE INDEX idx_attractions_city_location
    ON attractions(city_code, location);
```

**Secondary: Static JSON files on CDN**
- Pre-computed top 20 attractions per city
- 3 popular itineraries per city (Museums, Historical, Food & Culture)
- Deployed to CDN for instant loading

**Rationale:**
- PostGIS enables efficient geo-proximity queries
- JSONB allows flexible schema evolution
- Static JSON enables fast initial loads and offline capability
- Split prevents database bloat

**Alternatives Considered:**
- **MongoDB**: No native geo-queries (slower), overkill for MVP
- **Static JSON only**: Not scalable beyond demo
- **Firebase/Firestore**: Quick setup but expensive per read
- **DynamoDB**: AWS-native but expensive for query patterns

---

### Data Population Strategy

**Decision: Manual curation + Google Places API seeding**

**Process:**
1. **Week 1**: Manual tier-1 curation
   - Hand-select 10-15 must-see attractions per city
   - Cities: London (10), Paris (12), Rome (15), Barcelona (12), Berlin (10) ≈ 60 total
   - Verify hours, estimate visit times, curate descriptions

2. **Week 2**: Google Places API bulk seeding
   - Query: `tourist_attraction`, `museum`, `park` within city bounds
   - Filter: rating ≥ 4.0, review_count ≥ 100
   - Limit: top 20-30 per category per city

3. **Ongoing**: Manual review layer
   - Ensure diverse categories
   - Verify accuracy against travel guides
   - Prevent "tourist trap" inflation

**Quality Targets:**
- Minimum: 3 attractions per city (per specification)
- Target: 15-20 attractions per city for variety

---

## Cost Analysis (Monthly)

### MVP Costs (Development)
| Component | Cost |
|-----------|------|
| Mapbox API | Free (100k requests included) |
| Google Places API | Free ($200 credit included) |
| Redis (small instance) | $15 |
| PostgreSQL (small instance) | $15 |
| CDN (Cloudflare) | Free |
| **Total MVP** | **$30/month** |

### Production Costs (10k users, 100k searches/month)
| Component | Cost |
|-----------|------|
| Mapbox API | $500 (post free-tier) |
| Google Places API | $50 (minimal use with caching) |
| Redis (medium instance) | $50-100 |
| PostgreSQL | $100-300 |
| CDN | $20-50 |
| **Total Production** | **$720-1000/month** |

---

## Implementation Timeline

### Phase 1 (Week 1-2): MVP Foundation
- Fastify setup with /search endpoint
- Promise.allSettled() concurrent provider calls
- Mock provider adapters
- Basic Pino logging
- Vitest unit tests

### Phase 2 (Week 3): Robustness
- Rate limiting with Redis
- Contract validation with jest-openapi
- Integration tests with Supertest
- CORS setup
- Health tracking for providers

### Phase 3 (Week 4): Data Integration
- PostgreSQL with PostGIS setup
- Google Places API integration
- Mapbox Directions integration
- Route caching layer
- Manual attraction curation

### Phase 4 (Week 5): Production Ready
- Prometheus metrics
- OpenTelemetry tracing
- Load testing with k6
- Monitoring dashboard (Grafana)
- E2E tests with Playwright
- Deployment automation

---

## Key Decisions Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| **Runtime** | Node.js 18+ LTS | JavaScript alignment, I/O concurrency, ecosystem |
| **Framework** | Fastify 4.x | 2-3x faster than Express, built-in validation |
| **Concurrency** | Promise.allSettled() | Partial success pattern, simple timeout enforcement |
| **Rate Limiting** | Fastify plugin + Redis | IP-based, distributed, token bucket |
| **Logging** | Pino + Prometheus + OpenTelemetry | Fast logging, metrics, distributed tracing |
| **Partial Failures** | Simple health tracking | Sufficient for 3 providers, scalable |
| **Caching** | Redis (routes 24h) + in-memory (rates 1h) | Balance freshness/performance, cost savings |
| **Mocking** | Full adapters with env switch | Same code path dev/prod |
| **Attractions** | Google Places API | Comprehensive data, reasonable cost |
| **Routes** | Mapbox Directions | 10x cheaper than Google, sufficient accuracy |
| **Storage** | PostgreSQL + PostGIS + CDN | Geo-queries + fast static data |
| **Data Population** | Manual + API seeding | Quality + scale balance |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Places API costs exceed budget | High | Aggressive caching (24h), manual curation reduces API calls |
| Provider API unavailable | High | Partial results pattern, health tracking, timeout enforcement |
| Response time >3s | High | Fastify performance, caching, concurrent API calls, load testing |
| Route calculation expensive | Medium | Pre-compute common loops, 7-day cache, nearest-neighbor optimization |
| Data quality inconsistent | Medium | Manual curation layer, Google Places filtering (rating ≥ 4.0) |
| Redis single point of failure | Low | Use Redis Cluster in production, graceful degradation to no-cache |

---

## Next Steps

1. **Phase 1 (Plan)**: Create data-model.md, API contracts, quickstart scenarios
2. **Phase 2 (Tasks)**: Break down into TDD workflow tasks
3. **Phase 3 (Implement)**: Execute implementation following TDD cycle

---

**Research Status**: Complete ✅
**Ready for**: Design artifacts (data-model.md, contracts/, quickstart.md)
