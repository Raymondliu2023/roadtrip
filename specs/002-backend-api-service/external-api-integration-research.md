# Research: External API Integration Best Practices for Roadtrip Backend

**Date**: 2025-12-18
**Context**: Backend service integrating with 3+ car rental providers and route/attraction data services
**Scope**: Resilient, scalable patterns for production use

---

## 1. Concurrent API Calls with Timeouts and Error Handling

### Decision

**Use `Promise.all()` with timeout wrapper in parallel for multiple providers, enforcing both per-provider (5s) and aggregate (10s) limits**

Implementation pattern:
```javascript
// Per-provider timeout enforcement
function withTimeout(promise, ms, providerName) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${providerName} timeout after ${ms}ms`)), ms)
    )
  ]);
}

// Aggregate timeout with all provider calls
async function searchAllProviders(searchParams) {
  const aggregateTimeout = 10000;
  const perProviderTimeout = 5000;

  const aggregateController = new AbortController();
  const aggregateTimer = setTimeout(() => aggregateController.abort(), aggregateTimeout);

  try {
    const promises = [
      withTimeout(enterpriseProvider.search(searchParams), perProviderTimeout, 'Enterprise'),
      withTimeout(hertzProvider.search(searchParams), perProviderTimeout, 'Hertz'),
      withTimeout(avisProvider.search(searchParams), perProviderTimeout, 'Avis')
    ];

    const results = await Promise.allSettled(promises);
    return results; // Returns both fulfilled and rejected states
  } finally {
    clearTimeout(aggregateTimer);
  }
}
```

### Rationale

- **`Promise.allSettled()` over `Promise.all()`**: Returns state for each provider (fulfilled/rejected) rather than failing on first error. Enables partial success handling.
- **Per-provider timeouts (5s)**: Prevents slow providers from blocking others. 5s balances responsiveness against occasional network jitter.
- **Aggregate timeout (10s)**: Hard limit on total response time. Ensures frontend never hangs waiting for results.
- **`AbortController`**: Native Web API for cancelling in-flight requests. Works with fetch API natively.
- **Explicit state tracking**: `allSettled()` gives status + reason/value for each provider, enabling granular error logging and recovery decisions.

### Alternatives Considered

1. **`Promise.all()` with timeout**
   - Rejected: Fails entire request if any provider times out. Violates requirement for partial success.

2. **Queue-based approach (Bull, RabbitMQ)**
   - Rejected: Overkill for 3 providers. Adds operational complexity without benefit for this scale. Appropriate only if provider count > 10 or call volume > 1000/sec.

3. **Cascade pattern (sequential calls)**
   - Rejected: If Provider A takes 4s, total time becomes 9-12s, risking aggregate timeout. Parallel is better for reliability.

4. **Simple timeout with `Promise.race()`**
   - Possible but verbose. `allSettled()` + explicit timeout wrapper is cleaner and more composable.

---

## 2. Partial Failure Handling: Circuit Breaker vs. Simple Timeout

### Decision

**Implement three-tier approach:**
1. **Immediate layer**: Simple timeout + `allSettled()` for single request resilience
2. **Per-provider layer**: Track failure rate with fallback to mock data when provider becomes unhealthy
3. **No formal circuit breaker initially** - complexity not justified yet for 3 providers

Implementation pattern:
```javascript
class ProviderHealth {
  constructor(name, failureThreshold = 0.5, windowMs = 300000) { // 5-min window
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.windowMs = windowMs;
    this.failures = 0;
    this.successes = 0;
    this.lastReset = Date.now();
  }

  recordSuccess() {
    this.failures = Math.max(0, this.failures - 1);
    this.successes++;
  }

  recordFailure() {
    this.failures++;
  }

  isHealthy() {
    // Reset window if old
    if (Date.now() - this.lastReset > this.windowMs) {
      this.failures = 0;
      this.successes = 0;
      this.lastReset = Date.now();
    }

    const total = this.failures + this.successes;
    if (total < 5) return true; // Need at least 5 samples

    return this.failures / total < this.failureThreshold;
  }

  getStatus() {
    return {
      name: this.name,
      healthy: this.isHealthy(),
      failureRate: (this.failures / (this.failures + this.successes)) || 0,
      successCount: this.successes,
      failureCount: this.failures
    };
  }
}

// Usage in search
async function searchWithHealthTracking(searchParams) {
  const results = await Promise.allSettled([
    withTimeout(enterpriseProvider.search(searchParams), 5000, 'Enterprise'),
    withTimeout(hertzProvider.search(searchParams), 5000, 'Hertz'),
    withTimeout(avisProvider.search(searchParams), 5000, 'Avis')
  ]);

  results.forEach((result, idx) => {
    const providers = [enterpriseHealth, hertzHealth, avisHealth];
    if (result.status === 'fulfilled') {
      providers[idx].recordSuccess();
    } else {
      providers[idx].recordFailure();
    }
  });

  // Return results, excluding unhealthy providers or using cached/mock data
  return aggregateResults(results);
}
```

### Rationale

- **Simplicity over complexity**: Circuit breaker pattern (Open/Half-Open/Closed states) is valuable at scale (>100 providers, >100k req/sec) but adds complexity here. Simple health tracking is 80% as effective with 20% the code.
- **Per-provider health state**: Decouples provider performance. If Enterprise times out 60% of the time, we still get Hertz + Avis results.
- **Failure rate tracking**: Distinguishes between transient failures (network blip) and systematic failures (service down). Responds appropriately to each.
- **Fallback to cache/mock**: When provider is unhealthy, return cached results or mock data instead of failing request. Graceful degradation.

### Alternatives Considered

1. **Formal circuit breaker (Netflix Hystrix pattern)**
   - Pros: Industry standard, predictable state transitions, good for large distributed systems
   - Cons: Requires state management (Open/Closed/Half-Open), state propagation complexity, testing overhead
   - Verdict: Use when provider count > 10 or requests > 1000/sec

2. **Bulkhead pattern (isolated thread pools per provider)**
   - Pros: Prevents one slow provider from starving others
   - Cons: In Node.js (single-threaded), less relevant; `Promise.allSettled()` already provides isolation
   - Verdict: Not needed for this architecture

3. **Exponential backoff with jitter**
   - Useful for retrying transient failures
   - Should be combined with health tracking, not replace it
   - Verdict: Use for retry logic, separate from failure tracking

4. **All-or-nothing aggregation (fail if any provider fails)**
   - Rejected: Violates FR-008 requirement for partial results

---

## 3. Data Normalization Strategy for Provider Responses

### Decision

**Implement provider-specific adapter pattern with shared normalization layer**

Structure:
```
providers/
├── base-provider.js          # Abstract interface
├── enterprise-adapter.js
├── hertz-adapter.js
├── avis-adapter.js
└── normalizer.js             # Shared transformation rules
```

Implementation:
```javascript
// Base adapter (interface)
class BaseProvider {
  async search(params) {
    throw new Error('Subclass must implement search()');
  }

  normalize(rawResponse) {
    throw new Error('Subclass must implement normalize()');
  }
}

// Provider-specific adapter
class EnterpriseAdapter extends BaseProvider {
  async search({ city, pickupDateTime, dropoffDateTime }) {
    // Maps our schema to Enterprise API schema
    const response = await fetch('https://api.enterprise.com/quotes', {
      body: JSON.stringify({
        location: this.mapCityToCode(city), // "London" -> "LHR"
        startDate: pickupDateTime,
        endDate: dropoffDateTime
      })
    });

    const raw = await response.json();
    return this.normalize(raw);
  }

  normalize(raw) {
    // Transforms Enterprise response to our canonical RentalResult schema
    return raw.quotes.map(q => ({
      id: `enterprise-${q.quoteId}`,
      provider: 'Enterprise',
      price: {
        amount: Normalizer.convertCurrency(q.costUSD, 'USD', 'EUR'),
        currency: 'EUR'
      },
      carModel: {
        name: q.vehicleType, // "Compact SUV" -> extract
        category: Normalizer.mapVehicleCategory(q.vehicleType),
        imageUrl: q.imageUrl || '',
        passengers: Normalizer.getPassengerCount(q.vehicleType),
        transmission: q.transmission || 'unknown'
      },
      availability: q.available === true
    }));
  }
}

// Shared normalization rules
class Normalizer {
  static convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    // Use cached exchange rates (updated hourly)
    const rates = this.getExchangeRates();
    const eurAmount = amount / rates[fromCurrency];
    return eurAmount * rates[toCurrency];
  }

  static mapVehicleCategory(vehicleType) {
    const mapping = {
      'Economy': 'Economy',
      'Compact': 'Compact',
      'Sedan': 'Compact',
      'SUV': 'SUV',
      'Premium Sedan': 'Premium',
      'Luxury': 'Luxury'
    };
    return mapping[vehicleType] || 'Economy';
  }

  static getPassengerCount(vehicleType) {
    // Rules based on vehicle type
    return vehicleType.includes('SUV') ? 5 : 5; // Simplification
  }
}

// Usage
const enterpriseResults = await enterpriseAdapter.search(searchParams);
// All results conform to canonical RentalResult schema
```

### Rationale

- **Adapter pattern**: Each provider gets its own adapter handling provider-specific quirks (auth, schema mapping, retry logic). Keeps code organized as provider count grows.
- **Canonical schema at API boundary**: All external APIs are normalized to our `RentalResult` schema immediately. Prevents schema variation throughout the system.
- **Centralized normalization rules**: Currency conversion, vehicle category mapping, etc. are in one place for consistency and easy testing.
- **Testability**: Mock adapters are trivial to create for testing. Provider changes isolated to adapter layer.

### Alternatives Considered

1. **No normalization, use provider schema directly**
   - Rejected: Creates tight coupling. Changing provider APIs cascades through codebase. Violates separation of concerns.

2. **GraphQL federation (separate graphs per provider)**
   - Pros: Handles varying schemas elegantly
   - Cons: Operational overhead, not worth complexity for 3 providers
   - Verdict: Consider when provider count > 20 or schemas significantly different

3. **Shared normalization without adapters (direct transformation)**
   - Could work but less maintainable as provider count grows. Adapter pattern scales better.

4. **Nested conditional logic (if Enterprise then... else if Hertz...)**
   - Rejected: Anti-pattern. Grows linearly with provider count. Unmaintainable.

---

## 4. Caching Strategy and Tools

### Decision

**Multi-tier caching approach:**
1. **Route/Attraction data**: Redis with 24-hour TTL (immutable reference data)
2. **Exchange rates**: In-memory cache with 1-hour TTL (lightweight, infrequently changes)
3. **Rental quotes**: No caching (must be current for pricing/availability)
4. **Fallback**: Local JSON files for bootstrap/failure scenarios

Implementation:
```javascript
// Redis cache for route data (24h TTL)
class RouteCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.ttl = 86400; // 24 hours
  }

  async get(city) {
    const key = `route:${city.toLowerCase()}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(city, routeData) {
    const key = `route:${city.toLowerCase()}`;
    await this.redis.setex(key, this.ttl, JSON.stringify(routeData));
  }

  async invalidate(city) {
    const key = `route:${city.toLowerCase()}`;
    await this.redis.del(key);
  }
}

// In-memory cache for exchange rates (1h TTL)
class ExchangeRateCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 3600000; // 1 hour in ms
  }

  async get() {
    const cached = this.cache.get('rates');
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    return null;
  }

  async set(rates) {
    this.cache.set('rates', {
      data: rates,
      timestamp: Date.now()
    });
  }

  async refresh(fetchFn) {
    const rates = await fetchFn();
    this.set(rates);
    return rates;
  }
}

// Usage in search
async function search(searchParams) {
  // Check route cache first
  let routeData = await routeCache.get(searchParams.city);
  if (!routeData) {
    routeData = await routeService.fetchRouteData(searchParams.city);
    await routeCache.set(searchParams.city, routeData);
  }

  // Get current exchange rates (may use cache)
  let rates = await exchangeRateCache.get();
  if (!rates) {
    rates = await exchangeService.fetchRates();
    await exchangeRateCache.set(rates);
  }

  // DO NOT cache rental quotes - always fetch fresh
  const rentalResults = await searchAllProviders(searchParams);

  // Combine and return
  return combineResults(rentalResults, routeData, rates);
}
```

### Rationale

- **Redis for route data**: Route/attraction data is reference data (changes rarely). 24h TTL balances freshness against load reduction. Redis is persistent across restarts unlike in-memory.
- **In-memory for exchange rates**: Small dataset, simple, eliminates Redis round-trip latency for high-volume data.
- **No rental quote caching**: Violates FR-005 requirement "current pricing and availability". Users expect real-time prices. Caching here would be user-hostile.
- **Graceful degradation**: If route service is down, use cached data. If exchange rates are stale, fall back to last-known rates rather than failing.

### Alternatives Considered

1. **Redis for everything (centralized cache)**
   - Pros: Consistent, distributed, simple
   - Cons: Network latency for every exchange rate lookup (could be on every request)
   - Verdict: Use if exchange rates accessed per-rental (avoid N+1), but current design needs only once per search

2. **SQLite/file-based cache**
   - Pros: Zero external dependencies, persistence
   - Cons: Slower than in-memory/Redis, single-process bottleneck
   - Verdict: Use as fallback only, not primary

3. **No caching at all**
   - Pros: Simpler code
   - Cons: Violates FR-004 "route data caching for 24h". 50+ cities * 3 searches/minute = 2500 route fetches/minute. Unsustainable without caching.
   - Verdict: Rejected

4. **Cache-aside pattern only (no TTL eviction)**
   - Rejected: Redis cache requires TTL. Without it, stale data indefinitely.

5. **Write-through caching (always update cache on fetch)**
   - Already implemented above - every route fetch updates cache

---

## 5. Mock Provider Pattern for Development/Testing

### Decision

**Implement mock providers as full adapters inheriting from `BaseProvider`, switchable via environment configuration**

Structure:
```javascript
// Mock adapter - same interface as real adapters
class MockEnterpriseAdapter extends BaseProvider {
  async search({ city, pickupDateTime, dropoffDateTime }) {
    // Simulate network delay (200-500ms)
    await new Promise(r => setTimeout(r, Math.random() * 300 + 200));

    // 90% success rate, 10% timeout
    if (Math.random() > 0.9) {
      throw new Error('Simulated timeout');
    }

    return this.normalize(this.generateMockResponse(city));
  }

  normalize(raw) {
    // Same normalization as real adapter
    return raw.quotes.map(q => ({...}));
  }

  generateMockResponse(city) {
    const prices = [40, 45, 55, 60, 75, 85, 95, 120];
    const models = ['Corolla', 'Golf', 'Focus', 'Qashqai'];

    return {
      quotes: prices.map((price, i) => ({
        quoteId: `mock-enterprise-${i}`,
        costUSD: price * 1.1, // Mock slight USD markup
        vehicleType: models[i % models.length],
        imageUrl: '',
        available: Math.random() > 0.1,
        transmission: 'automatic'
      }))
    };
  }
}

// Factory pattern for provider selection
class ProviderFactory {
  static create(name) {
    if (process.env.USE_MOCK_PROVIDERS === 'true') {
      return new MockEnterpriseAdapter(); // etc.
    }

    switch(name) {
      case 'enterprise': return new EnterpriseAdapter();
      case 'hertz': return new HertzAdapter();
      case 'avis': return new AvisAdapter();
      default: throw new Error(`Unknown provider: ${name}`);
    }
  }
}

// Environment config
// .env file:
// USE_MOCK_PROVIDERS=true       # Development
// USE_MOCK_PROVIDERS=false      # Production
```

### Rationale

- **Same adapter interface**: Mock adapters inherit from `BaseProvider`, guaranteeing they match real adapter behavior. No separate test paths.
- **Realistic simulation**: Mock providers should introduce realistic delays, occasional failures (10% timeout rate), varied prices. Prevents tests passing that fail in production.
- **Deterministic in tests**: Seed random number generator for reproducible test results.
- **Single point of control**: `USE_MOCK_PROVIDERS` env var switches all providers at once. No need to mock individual providers in tests.
- **Configuration-driven**: Environment variable makes it easy to test against mocks in CI/staging without code changes.

### Alternatives Considered

1. **Stub/spy in test files**
   - Pros: Precise control per test
   - Cons: Duplicate mock logic across tests, inconsistent mocks
   - Verdict: Use for specific test cases, but primary development uses full mock adapters

2. **Separate mock service (different endpoint)**
   - Rejected: Requires branching logic in business logic layer. Keeps mocks separate from real code path. Mocks should be drop-in replacements.

3. **Mock with hardcoded test data (no randomization)**
   - Rejected: Doesn't catch issues with real data variety (currency variations, missing fields, etc.)

4. **Recorded HTTP cassettes (VCR pattern)**
   - Pros: Captures real provider responses
   - Cons: Heavy setup, cassettes become stale, hard to simulate failures
   - Verdict: Use as supplementary testing tool, not primary development approach

---

## 6. Error Aggregation and Logging

### Decision

**Structured logging with error context aggregation to support observability**

Implementation:
```javascript
// Logging middleware/service
class SearchLogger {
  constructor(loggerClient) {
    this.logger = loggerClient; // e.g., Winston, Pino, structured logging service
  }

  async logSearch(searchParams, requestId) {
    const startTime = Date.now();
    const context = {
      requestId,
      city: searchParams.city,
      timestamp: new Date().toISOString(),
      providers: {}
    };

    try {
      const results = await Promise.allSettled([
        this.executeProvider('Enterprise', enterpriseAdapter.search(searchParams), context),
        this.executeProvider('Hertz', hertzAdapter.search(searchParams), context),
        this.executeProvider('Avis', avisAdapter.search(searchParams), context)
      ]);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;

      this.logger.info('Search completed', {
        requestId,
        city: searchParams.city,
        successCount,
        failureCount,
        totalTime: Date.now() - startTime,
        providers: context.providers,
        aggregateStatus: failureCount > 0 ? 'partial_failure' : 'success'
      });

      return results;
    } catch (error) {
      this.logger.error('Search failed', {
        requestId,
        city: searchParams.city,
        error: error.message,
        stack: error.stack,
        totalTime: Date.now() - startTime,
        providers: context.providers
      });
      throw error;
    }
  }

  async executeProvider(name, promise, context) {
    const startTime = Date.now();
    try {
      const result = await promise;
      const duration = Date.now() - startTime;

      context.providers[name] = {
        status: 'success',
        duration,
        resultCount: result.length,
        timestamp: new Date().toISOString()
      };

      this.logger.debug(`Provider ${name} succeeded`, {
        provider: name,
        duration,
        resultCount: result.length
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      context.providers[name] = {
        status: 'failure',
        duration,
        error: error.message,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      };

      this.logger.warn(`Provider ${name} failed`, {
        provider: name,
        duration,
        error: error.message,
        errorType: error.constructor.name
      });

      return null; // Converted to Promise.allSettled rejection
    }
  }
}

// Usage in endpoint
app.post('/api/v1/search', async (req, res) => {
  const requestId = req.headers['x-request-id'] || generateId();

  try {
    const results = await searchLogger.logSearch(req.body, requestId);
    const aggregated = aggregateResults(results);

    res.json({
      success: true,
      results: aggregated.results,
      totalResults: aggregated.total,
      timestamp: new Date().toISOString(),
      requestId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      requestId
    });
  }
});
```

### Rationale

- **Structured logging**: JSON logs with consistent fields enable machine parsing, aggregation in log management platforms (DataDog, CloudWatch, Splunk).
- **Request IDs**: Trace single user request through multiple provider calls. Essential for debugging.
- **Per-provider context**: Which providers succeeded/failed, duration, error reason. Enables post-incident analysis.
- **Aggregation at logging layer**: Separates observability from business logic. Can be swapped (e.g., from console to Datadog) without changing search code.
- **Different log levels**: `info` for successes, `warn` for partial failures, `error` for complete failures. Allows log filtering in alerting.

### Alternatives Considered

1. **Console.log for development, nothing for production**
   - Rejected: No production observability. When issues occur, no data to debug.

2. **Custom log file parsing**
   - Pros: No external dependency
   - Cons: Doesn't scale, hard to query retrospectively, no real-time alerting
   - Verdict: Use as fallback only

3. **Datadog/APM vendor from start**
   - Pros: Rich observability
   - Cons: Cost, external dependency, overkill for MVP
   - Verdict: Start with structured logging to stdout, wire to Datadog later

4. **Minimal logging (only errors)**
   - Rejected: Partial failures (2 out of 3 providers succeed) are not errors in return code but critical for operations. Need to track these.

5. **Async logging (fire-and-forget)**
   - Possible but risky. If logging crashes, could crash search. Use if proven necessary for performance.

---

## Implementation Roadmap

### Phase 1: MVP (Week 1-2)
- Implement base provider adapter pattern
- Mock adapters for all 3 providers
- Simple timeout + allSettled concurrency
- Redis caching for route data
- Basic structured logging to stdout

### Phase 2: Production Hardening (Week 3-4)
- Real provider adapters (Enterprise, Hertz, Avis)
- Health tracking for providers
- Fallback to cached/mock data when provider unhealthy
- Exchange rate caching
- Wire logging to CloudWatch/DataDog

### Phase 3: Optimization (Week 5+)
- Circuit breaker if failures spike
- Retry logic with exponential backoff
- Provider-specific timeout tuning
- Cache warm-up on deployment
- Performance metrics dashboard

---

## Decision Summary Table

| Area | Decision | Rationale | Complexity |
|------|----------|-----------|-----------|
| **Concurrency** | Promise.allSettled() + per/aggregate timeouts | Partial success, controlled timeouts | Low |
| **Partial Failures** | Simple health tracking (no circuit breaker) | Sufficient for 3 providers, less complex | Low |
| **Normalization** | Provider adapters + shared rules | Maintainable, testable as provider count grows | Medium |
| **Caching** | Redis (routes) + in-memory (rates) + no quotes | Balance freshness, performance, requirements | Medium |
| **Mocking** | Full mock adapters, environment-switchable | Realistic testing, code path parity | Low |
| **Logging** | Structured JSON with per-provider context | Observability, debugging, alerting | Medium |

---

## Code Patterns Quick Reference

### Basic Provider Adapter
```javascript
class BaseProvider {
  async search(params) { throw new Error('Implement'); }
  normalize(raw) { throw new Error('Implement'); }
}

class EnterpriseAdapter extends BaseProvider {
  async search(params) {
    const raw = await fetch('...').then(r => r.json());
    return this.normalize(raw);
  }
  normalize(raw) { /* transform to RentalResult[] */ }
}
```

### Concurrent Search with Timeouts
```javascript
const results = await Promise.allSettled([
  withTimeout(p1.search(params), 5000, 'P1'),
  withTimeout(p2.search(params), 5000, 'P2'),
  withTimeout(p3.search(params), 5000, 'P3')
]);
```

### Route Caching
```javascript
let routes = await cache.get(city);
if (!routes) {
  routes = await service.fetch(city);
  await cache.set(city, routes);
}
```

### Health Tracking
```javascript
health.recordSuccess() // Clear failures
health.recordFailure() // Increment failures
if (health.isHealthy()) { /* use provider */ }
```

### Error Aggregation
```javascript
logger.info('Search completed', {
  requestId, city, successCount, failureCount,
  providers: { Enterprise: {...}, Hertz: {...}, Avis: {...} }
});
```
