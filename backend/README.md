# Roadtrip Backend API Service

Backend API service for car rental search with integrated route intelligence. Aggregates rental quotes from multiple providers and enriches results with driving route recommendations and attractions.

## Features

- **Multi-Provider Aggregation**: Queries 3+ car rental providers concurrently
- **Route Intelligence**: Integrates attractions and itinerary data for self-drive tours
- **Request Validation**: Comprehensive input validation with clear error messages
- **Rate Limiting**: IP-based protection (60 requests/minute)
- **Resilience**: Graceful degradation on partial provider failures
- **Observability**: Structured logging, Prometheus metrics, distributed tracing
- **Performance**: <3s response time for 95% of requests

## Tech Stack

- **Runtime**: Node.js 18+ LTS
- **Framework**: Fastify 4.x (high-performance web framework)
- **Database**: PostgreSQL 14+ with PostGIS (geo-queries)
- **Cache**: Redis 7+ (distributed caching, rate limiting)
- **Logging**: Pino (structured JSON logs)
- **Metrics**: Prometheus + prom-client
- **Testing**: Vitest, Supertest, jest-openapi

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 14+ with PostGIS extension
- Redis 7+

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database

```bash
# Create database
createdb roadtrip

# Enable PostGIS extension
psql roadtrip -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
psql roadtrip < migrations/001_create_attractions.sql
psql roadtrip < migrations/002_seed_london_attractions.sql
psql roadtrip < migrations/003_seed_paris_attractions.sql
```

### 4. Start Redis

```bash
# Using Homebrew (macOS)
brew services start redis

# Or using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

### 6. Verify Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T..."
}
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

**Database connection failed**:
- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- Ensure PostGIS extension is installed

**Redis connection failed**:
- Verify Redis is running: `redis-cli ping`
- Check Redis URL in `.env`

**Rate limit not working**:
- Ensure Redis is connected (rate limit requires Redis backend)
- Check `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` in `.env`

**All requests return 503**:
- Check if providers are configured (`USE_MOCK_PROVIDERS=true` for development)
- Verify external API keys if using real providers
- Check logs for provider errors

## Contributing

1. Follow TDD workflow: Write tests first
2. Run linter and formatter before committing
3. Ensure all tests pass: `npm test`
4. Update documentation for API changes

## License

MIT
