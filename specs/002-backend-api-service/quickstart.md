# Quickstart Guide: Backend API Service Manual Testing

**Date**: 2025-12-18
**Feature**: Car Rental Search Backend API Service
**Purpose**: Manual test scenarios for validating backend functionality

## Overview

This guide provides step-by-step manual test scenarios to validate the backend API service against the specification requirements. Each scenario maps to user stories and functional requirements defined in [spec.md](spec.md).

---

## Prerequisites

### Environment Setup

```bash
# 1. Start the backend service
cd backend
npm install
npm run dev

# Backend should be running on: http://localhost:3000

# 2. Verify service health
curl http://localhost:3000/health
# Expected: {"status": "ok", "timestamp": "2025-12-18T..."}

# 3. Check API version endpoint
curl http://localhost:3000/v1/
# Expected: {"version": "1.0.0", "api": "car-rental-search"}
```

### Tools Needed

- **curl** or **Postman** for API testing
- **jq** (optional) for JSON formatting: `brew install jq`
- **Text editor** for examining responses
- **Timer/stopwatch** for performance testing

---

## Test Scenarios

### Scenario 1: Valid Search Request (Happy Path)

**User Story**: US1 - Search Rental Quotes with Route Intelligence
**Requirement**: FR-001, FR-003, FR-004, FR-005, FR-006

**Steps**:
```bash
# Send valid search request for London
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2025-12-20T10:00:00Z",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `200 OK`
- Response body contains:
  - `results` array with multiple rental results (ideally 3+ from different providers)
  - Each result has: `id`, `provider`, `price`, `carModel`, `availability`, `routeInfo`
  - `totalResults` integer >= 0
  - `timestamp` in ISO 8601 format
  - Route info includes attractions array with at least 1 attraction
  - Attractions have London-specific places (Windsor Castle, Oxford, etc.)
- Response time: < 3 seconds for 95% of requests

**Validation Checklist**:
- [ ] Status code is 200
- [ ] Results array present
- [ ] At least 3 different providers represented
- [ ] All prices in EUR currency
- [ ] All car models have valid categories (Economy, Compact, etc.)
- [ ] Route info includes 3+ attractions
- [ ] Timestamps are valid ISO 8601
- [ ] Response time < 3 seconds

---

### Scenario 2: Different City Search (Paris)

**User Story**: US1 - Search Rental Quotes with Route Intelligence
**Requirement**: FR-007

**Steps**:
```bash
# Search for rentals in Paris
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "pickupDateTime": "2025-12-28T09:00:00Z",
    "dropoffDateTime": "2025-12-30T18:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `200 OK`
- Results contain Paris-specific attractions (not London attractions)
- Different route information reflecting Paris geography

**Validation Checklist**:
- [ ] Status code is 200
- [ ] Attractions are Paris-specific (e.g., Eiffel Tower, Louvre, Versailles)
- [ ] Route distances reasonable for Paris area
- [ ] No London attractions appear in results

---

### Scenario 3: Invalid Date Range (Dropoff Before Pickup)

**User Story**: US2 - Request Validation and Error Handling
**Requirement**: FR-002, FR-004, FR-013

**Steps**:
```bash
# Send request with dropoff before pickup
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type": application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2025-12-21T10:00:00Z",
    "dropoffDateTime": "2025-12-20T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `400 Bad Request`
- Error response body:
```json
{
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Drop-off date/time must be after pick-up date/time",
    "field": "dropoffDateTime"
  }
}
```

**Validation Checklist**:
- [ ] Status code is 400
- [ ] Error code is `INVALID_DATE_RANGE`
- [ ] Error message is clear and actionable
- [ ] Field `dropoffDateTime` is identified
- [ ] Response time < 100ms (validation only)

---

### Scenario 4: Past Pickup Date

**User Story**: US2 - Request Validation and Error Handling
**Requirement**: FR-002, FR-005, FR-013

**Steps**:
```bash
# Send request with pickup date in the past
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2020-01-01T10:00:00Z",
    "dropoffDateTime": "2020-01-02T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `400 Bad Request`
- Error response:
```json
{
  "error": {
    "code": "PAST_DATETIME",
    "message": "Pick-up date/time cannot be in the past",
    "field": "pickupDateTime"
  }
}
```

**Validation Checklist**:
- [ ] Status code is 400
- [ ] Error code is `PAST_DATETIME`
- [ ] Field `pickupDateTime` identified
- [ ] Response time < 100ms

---

### Scenario 5: Invalid City

**User Story**: US2 - Request Validation and Error Handling
**Requirement**: FR-002, FR-007

**Steps**:
```bash
# Send request with unsupported city
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Atlantis",
    "pickupDateTime": "2025-12-20T10:00:00Z",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `400 Bad Request`
- Error response:
```json
{
  "error": {
    "code": "INVALID_CITY",
    "message": "City 'Atlantis' is not a supported EU city",
    "field": "city"
  }
}
```

**Validation Checklist**:
- [ ] Status code is 400
- [ ] Error code is `INVALID_CITY`
- [ ] City name mentioned in error message
- [ ] Field `city` identified

---

### Scenario 6: Missing Required Fields

**User Story**: US2 - Request Validation and Error Handling
**Requirement**: FR-002

**Steps**:
```bash
# Send request missing pickupDateTime
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `400 Bad Request`
- Error indicating missing required field

**Validation Checklist**:
- [ ] Status code is 400
- [ ] Error message indicates missing `pickupDateTime`

---

### Scenario 7: Rate Limiting

**User Story**: US2 - Request Validation and Error Handling
**Requirement**: FR-010

**Steps**:
```bash
# Send 61 requests in quick succession (rate limit is 60/minute)
for i in {1..61}; do
  curl -X POST http://localhost:3000/v1/search \
    -H "Content-Type: application/json" \
    -d '{
      "city": "London",
      "pickupDateTime": "2025-12-20T10:00:00Z",
      "dropoffDateTime": "2025-12-21T10:00:00Z"
    }'
  echo "Request $i"
done
```

**Expected Result**:
- First 60 requests: `200 OK` or `503` (if providers slow)
- 61st request: `429 Too Many Requests`
- Error response:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many search requests. Please try again in 60 seconds."
  }
}
```

**Validation Checklist**:
- [ ] Request #61 returns 429 status
- [ ] Error code is `RATE_LIMIT_EXCEEDED`
- [ ] Retry-After header present (optional)
- [ ] Rate limit resets after 60 seconds

---

### Scenario 8: Partial Provider Failure

**User Story**: US3 - External Service Integration and Resilience
**Requirement**: FR-008

**Steps**:
1. Simulate one provider being down (requires backend configuration to mock provider failure)
2. Send valid search request

```bash
# Requires backend to have mock provider with simulated failure
# Set environment variable: MOCK_HERTZ_FAILURE=true
export MOCK_HERTZ_FAILURE=true
npm run dev

# Then test
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2025-12-20T10:00:00Z",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `200 OK` (not 503, since some providers succeeded)
- Results from successful providers (Enterprise, Avis) present
- No results from failed provider (Hertz)
- Total results < full count

**Validation Checklist**:
- [ ] Status code is 200 (not 503)
- [ ] Partial results returned
- [ ] Only successful providers represented
- [ ] Backend logs show provider failure

---

### Scenario 9: All Providers Down

**User Story**: US3 - External Service Integration and Resilience
**Requirement**: FR-011

**Steps**:
```bash
# Simulate all providers down
export MOCK_ALL_PROVIDERS_DOWN=true
npm run dev

# Test
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2025-12-20T10:00:00Z",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `503 Service Unavailable`
- Error response:
```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Car rental providers are temporarily unavailable. Please try again later."
  }
}
```

**Validation Checklist**:
- [ ] Status code is 503
- [ ] Error code is `SERVICE_UNAVAILABLE`
- [ ] No partial results returned

---

### Scenario 10: Performance Test (Concurrent Requests)

**User Story**: US3 - External Service Integration and Resilience
**Requirement**: FR-009, SC-001, SC-006

**Steps**:
```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Create request body file
cat > search-request.json <<EOF
{
  "city": "London",
  "pickupDateTime": "2025-12-20T10:00:00Z",
  "dropoffDateTime": "2025-12-21T10:00:00Z"
}
EOF

# Run 100 concurrent requests
ab -n 100 -c 100 -p search-request.json -T application/json \
  http://localhost:3000/v1/search
```

**Expected Result**:
- All requests complete successfully (or with expected errors)
- P95 latency < 3 seconds
- No server crashes or timeouts
- Success rate > 95%

**Validation Checklist**:
- [ ] Server remains responsive
- [ ] P95 response time < 3 seconds
- [ ] No 500 Internal Server Errors
- [ ] Success rate >= 95%

---

### Scenario 11: No Results Found

**User Story**: US1 - Search Rental Quotes with Route Intelligence
**Requirement**: FR-015

**Steps**:
```bash
# Search for dates far in future (likely no availability)
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2030-12-20T10:00:00Z",
    "dropoffDateTime": "2030-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- HTTP Status: `200 OK`
- Response body:
```json
{
  "results": [],
  "totalResults": 0,
  "timestamp": "2025-12-18T..."
}
```

**Validation Checklist**:
- [ ] Status code is 200 (not 404)
- [ ] Empty results array
- [ ] `totalResults` is 0
- [ ] Timestamp present

---

### Scenario 12: CORS Headers

**User Story**: US1 (integration with frontend)
**Requirement**: FR-018

**Steps**:
```bash
# Test CORS preflight request
curl -X OPTIONS http://localhost:3000/v1/search \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected Result**:
- HTTP Status: `204 No Content` or `200 OK`
- Response headers include:
  - `Access-Control-Allow-Origin: http://localhost:5173` (or `*` for development)
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`

**Validation Checklist**:
- [ ] CORS headers present
- [ ] Frontend origin allowed
- [ ] POST method allowed

---

### Scenario 13: Request Timeout Enforcement

**User Story**: US3 - External Service Integration and Resilience
**Requirement**: FR-009, SC-008

**Steps**:
```bash
# Simulate slow provider (requires backend mock configuration)
export MOCK_SLOW_PROVIDER=true
export MOCK_PROVIDER_DELAY=12000  # 12 seconds

npm run dev

# Test - should timeout at 10 seconds
time curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2025-12-20T10:00:00Z",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }' | jq '.'
```

**Expected Result**:
- Request completes in <= 10 seconds (enforced timeout)
- Either returns partial results (from faster providers) or 503 if all slow

**Validation Checklist**:
- [ ] Total request time <= 10 seconds
- [ ] Timeout properly enforced
- [ ] Backend logs show timeout event

---

## Success Criteria Verification

### SC-001: Response Time < 3s for 95% of Requests

**Test**:
```bash
# Run 100 requests and measure P95 latency
for i in {1..100}; do
  curl -X POST http://localhost:3000/v1/search \
    -H "Content-Type: application/json" \
    -d '{
      "city": "London",
      "pickupDateTime": "2025-12-20T10:00:00Z",
      "dropoffDateTime": "2025-12-21T10:00:00Z"
    }' -w "%{time_total}\n" -o /dev/null -s
done | sort -n | tail -10
```

**Pass Criteria**: 95th percentile (95th value when sorted) < 3.0 seconds

---

### SC-002: Aggregates from 3+ Providers for 90% of Searches

**Test**: Review results from Scenario 1-2, count unique providers

**Pass Criteria**: At least 90% of successful searches return results from 3+ different providers

---

### SC-007: 3+ Attractions for 80% of Results

**Test**: Review route info from multiple searches, count attractions per result

**Pass Criteria**: At least 80% of rental results include 3+ attractions in routeInfo

---

## Logs & Monitoring Verification

### Check Structured Logs

```bash
# View backend logs
tail -f backend/logs/app.log | jq '.'

# Look for:
# - Request ID correlation
# - Provider latency metrics
# - Cache hit/miss rates
# - Error details
```

### Check Metrics Endpoint

```bash
# View Prometheus metrics
curl http://localhost:3000/metrics

# Look for:
# - http_request_duration_seconds
# - provider_api_duration_seconds
# - cache_hit_ratio
# - rate_limit_violations_total
```

---

## Troubleshooting

### Issue: All requests return 503

**Possible Causes**:
- Redis not running (cache unavailable)
- Mock providers not configured
- External APIs down (Google Places, Mapbox)

**Debug Steps**:
1. Check Redis: `redis-cli ping` (should return `PONG`)
2. Check backend logs for provider errors
3. Verify environment variables are set

### Issue: Response time > 3 seconds

**Possible Causes**:
- Provider APIs slow
- Cache not working
- Too many concurrent database queries

**Debug Steps**:
1. Check provider latency in logs
2. Verify cache hit ratio in metrics
3. Review database query performance

### Issue: Rate limiting not working

**Possible Causes**:
- Redis not configured
- Multiple backend instances not sharing state

**Debug Steps**:
1. Verify Redis connection
2. Check rate limit configuration in code

---

**Quickstart Guide Status**: Complete ✅
**Total Scenarios**: 13 manual test scenarios
**Coverage**: All 3 user stories, 18 functional requirements, 8 success criteria

