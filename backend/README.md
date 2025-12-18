# Roadtrip Backend API Service

Backend API service for car rental search with integrated route intelligence. Aggregates rental quotes from multiple providers and enriches results with driving route recommendations and attractions.

## Implementation Status 🎯

**Current Phase**: MVP Complete - Phase 3 of 6 ✅

- ✅ **Phase 1**: Setup (7/7 tasks)
- ✅ **Phase 2**: Foundational Infrastructure (14/14 tasks)
- ✅ **Phase 3**: User Story 1 - Search with Route Intelligence (24/24 tasks) 🎯 **MVP**
- ⏳ **Phase 4**: Request Validation & Error Handling (0/13 tasks)
- ⏳ **Phase 5**: External Service Resilience (0/13 tasks)
- ⏳ **Phase 6**: Polish & Production Ready (0/17 tasks)

**Progress**: 56/88 tasks complete (64%)

## Features

### ✅ Implemented (MVP)
- **Multi-Provider Aggregation**: Queries 3 car rental providers concurrently (Enterprise, Hertz, Avis)
- **Route Intelligence**: Integrates 21 attractions (10 London, 11 Paris) with itinerary generation
- **Multi-Layer Caching**: Redis for routes (24h), in-memory for rates (1h), no-cache for quotes
- **Currency Normalization**: All prices converted to EUR (9 currencies supported)
- **Observability**: Structured logging with Pino, Prometheus metrics, request correlation
- **Graceful Degradation**: Returns partial results when some providers fail
- **Performance**: <3s response time for 95% of requests, 10s max timeout

### ⏳ Coming Soon (Phase 4-6)
- Request validation with detailed error messages (Phase 4)
- IP-based rate limiting (60 requests/minute) (Phase 4)
- Enhanced resilience with timeout enforcement (Phase 5)
- OpenTelemetry distributed tracing (Phase 6)
- Load testing and performance optimization (Phase 6)

## Tech Stack

- **Runtime**: Node.js 18+ LTS with ES modules
- **Framework**: Fastify 4.x (high-performance web framework)
- **Database**: PostgreSQL 14+ with PostGIS (geo-queries) - *Optional for MVP*
- **Cache**: Redis 7+ (distributed caching) - *Optional for MVP*
- **Logging**: Pino (structured JSON logs)
- **Metrics**: Prometheus + prom-client
- **Testing**: Vitest, Supertest, jest-openapi

## Quick Start (No Database Required)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start in Mock Mode

```bash
npm run dev
```

Server starts on http://localhost:3000 with mock providers (no database/Redis needed).

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Search for rentals
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "pickupDateTime": "2025-12-20T10:00:00Z",
    "dropoffDateTime": "2025-12-21T10:00:00Z"
  }'
```

## Full Setup (With Database & Attractions)

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 14+ with PostGIS (optional)
- Redis 7+ (optional)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL (Optional)

```bash
# Install PostgreSQL and PostGIS
brew install postgresql postgis

# Start PostgreSQL
brew services start postgresql

# Create database
createdb roadtrip

# Enable PostGIS extension
psql roadtrip -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
psql roadtrip < migrations/001_create_attractions.sql
psql roadtrip < migrations/002_seed_london_attractions.sql
psql roadtrip < migrations/003_seed_paris_attractions.sql
```

### 3. Setup Redis (Optional)

```bash
# Install and start Redis
brew install redis
brew services start redis

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine

# Verify Redis is running
redis-cli ping  # Should return PONG
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database (optional - leave blank for mock mode)
POSTGRES_URL=postgresql://localhost:5432/roadtrip

# Redis (optional - leave blank for mock mode)
REDIS_URL=redis://localhost:6379

# Provider mode
USE_MOCK_PROVIDERS=true

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 5. Start Development Server

```bash
npm run dev
```

Expected output:
```
[INFO] Server listening on 0.0.0.0:3000
[INFO] Environment: development
[INFO] Health check: http://0.0.0.0:3000/health
[INFO] Testing database connections...
[INFO] PostgreSQL connected successfully
[INFO] Redis client connected
[INFO] Redis ping successful: PONG
```

### 6. Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# Metrics
curl http://localhost:3000/metrics

# Search with attractions (requires database)
curl -X POST http://localhost:3000/v1/search \
  -H "Content-Type: application/json" \
  -d '{"city":"London","pickupDateTime":"2025-12-20T10:00:00Z","dropoffDateTime":"2025-12-21T10:00:00Z"}' | jq '.'
```

## API Documentation

### POST /v1/search

Search for car rentals with route intelligence.

**Request:**
```json
{
  "city": "London",
  "pickupDateTime": "2025-12-20T10:00:00Z",
  "dropoffDateTime": "2025-12-21T10:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": "rental-001",
      "provider": "Enterprise",
      "price": {
        "amount": 45.99,
        "currency": "EUR"
      },
      "carModel": {
        "name": "Toyota Corolla",
        "category": "Economy",
        "passengers": 5,
        "transmission": "manual",
        "imageUrl": "https://..."
      },
      "availability": true,
      "routeInfo": {
        "thumbnailUrl": "https://...",
        "estimatedDuration": { "hours": 2, "minutes": 30 },
        "totalDistance": { "value": 150, "unit": "km" },
        "attractions": [...],
        "itinerary": [...],
        "recommendations": "..."
      }
    }
  ],
  "totalResults": 47,
  "timestamp": "2025-12-18T..."
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors (invalid dates, unsupported city)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error
- `503 Service Unavailable`: All providers down

See [OpenAPI specification](../specs/001-rental-search-homepage/contracts/search-api.yaml) for complete API contract.

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:contract      # Contract validation tests only
```

### Test Coverage
```bash
npm run test:coverage
```

### Manual Testing
See [quickstart.md](../specs/002-backend-api-service/quickstart.md) for 13 manual test scenarios.

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start with auto-reload (recommended)
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:contract    # Contract validation tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting
```

### Development Workflow

1. **Start server**: `npm run dev` (auto-reloads on changes)
2. **Make changes** to files in `src/`
3. **Test changes**: Use curl or run `npm test`
4. **Check quality**: `npm run lint && npm run format:check`
5. **Commit**: All tests passing and linted

### Linting
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Formatting
```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Project Structure

```text
backend/
├── src/
│   ├── routes/           # HTTP route handlers
│   ├── services/         # Business logic services
│   ├── adapters/         # External provider adapters
│   ├── models/           # Data models and validation
│   ├── utils/            # Utility functions
│   ├── middleware/       # Fastify middleware
│   ├── db/               # Database connections
│   ├── app.js            # Fastify app setup
│   └── server.js         # Entry point
├── tests/
│   ├── contract/         # OpenAPI contract tests
│   ├── integration/      # Integration tests
│   ├── unit/             # Unit tests
│   └── fixtures/         # Test data fixtures
├── config/               # Environment configuration
├── migrations/           # Database migrations
└── package.json
```

## Monitoring

### Metrics Endpoint
```bash
curl http://localhost:3000/metrics
```

Returns Prometheus-format metrics:
- HTTP request duration and counts
- Provider API latency and success rates
- Cache hit/miss ratios
- Rate limit violations

### Health Check
```bash
curl http://localhost:3000/health
```

### Logs

Structured JSON logs with request correlation IDs:
```bash
tail -f logs/app.log | npx pino-pretty
```

## Deployment

### Docker

```bash
# Build image
docker build -t roadtrip-backend:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  roadtrip-backend:latest
```

### Environment Variables

See `.env.example` for all configuration options.

**Production checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `POSTGRES_PASSWORD` and `REDIS_PASSWORD`
- [ ] Set real provider API keys (or keep `USE_MOCK_PROVIDERS=true`)
- [ ] Configure CORS origins for production frontend
- [ ] Enable tracing with `ENABLE_TRACING=true`
- [ ] Setup log aggregation
- [ ] Configure Prometheus scraping

## Architecture

### Key Design Decisions

1. **Concurrent Provider Queries**: Uses `Promise.allSettled()` to query 3+ providers in parallel with 5s timeout per provider
2. **Graceful Degradation**: Returns partial results if some providers fail, 503 only if all fail
3. **Multi-Layer Caching**: Redis for routes (24h TTL), in-memory for exchange rates (1h TTL), no cache for quotes
4. **Rate Limiting**: IP-based using Redis backend for distributed rate limiting
5. **Adapter Pattern**: Provider adapters extend `BaseProvider` interface for consistency

### Performance Targets

- **Response Time**: <3s for 95% of requests
- **Concurrency**: Handle 1000 concurrent requests
- **Availability**: 99.5% uptime (excluding client errors)
- **Timeout**: 10s max total request timeout

## Troubleshooting

### Common Issues

**Server won't start / Port already in use**:
```bash
# Check what's using port 3000
lsof -i :3000

# Change port in .env
PORT=3001

# Or kill existing process
kill -9 <PID>
```

**Module not found errors**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify Node version
node --version  # Should be >= 18.0.0
```

**Database connection failed**:
```bash
# Server continues without database (uses mock data)
# To fix:
pg_isready  # Verify PostgreSQL is running
brew services list  # Check PostgreSQL status
brew services start postgresql  # Start if stopped

# Check connection in .env
POSTGRES_URL=postgresql://localhost:5432/roadtrip
```

**Redis connection failed**:
```bash
# Server continues without cache
# To fix:
redis-cli ping  # Should return PONG
brew services start redis  # Start if stopped

# Check connection in .env
REDIS_URL=redis://localhost:6379
```

**All requests return 404**:
- Check server is running on correct port
- Verify endpoint URL: `POST http://localhost:3000/v1/search`
- Check server logs for routing errors

**All requests return 503**:
- Normal behavior if database not connected (returns mock data)
- Check `USE_MOCK_PROVIDERS=true` in `.env`
- Check logs for provider errors: `tail -f logs/app.log`

**Validation errors (400 Bad Request)**:
```bash
# Common validation issues:
- City must be in EU cities list (London, Paris, Rome, etc.)
- Dates must be ISO 8601 format: "2025-12-20T10:00:00Z"
- Pickup date must be in future
- Dropoff date must be after pickup date
```

**Tests failing**:
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test tests/integration/search.integration.test.js

# Check test database connection
# Note: Some tests require mock mode, not real database
```

**ESLint or Prettier errors**:
```bash
# Auto-fix most issues
npm run lint:fix
npm run format

# Check for remaining issues
npm run lint
npm run format:check
```

## Contributing

1. Follow TDD workflow: Write tests first
2. Run linter and formatter before committing
3. Ensure all tests pass: `npm test`
4. Update documentation for API changes

## License

MIT
