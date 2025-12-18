# Research: Car Rental & Self-Drive Tour Search Homepage

**Feature**: 001-rental-search-homepage
**Date**: 2025-12-18
**Purpose**: Document technical decisions, evaluate alternatives, and resolve unknowns before design phase

## Research Questions Resolved

### 1. Frontend Architecture Approach

**Decision**: Component-based single-page application with vanilla JavaScript or lightweight framework

**Rationale**:
- Requirements specify single-page behavior (results display below search form on same page)
- Component architecture naturally maps to UI requirements (SearchForm, Result Card, Pagination)
- Vanilla JS acceptable for this scope - avoids framework overhead for relatively simple interactions
- Progressive enhancement aligns with P3 geolocation feature (graceful degradation)

**Alternatives Considered**:
- **Multi-page application with server-side rendering**: Rejected because spec explicitly requires results to display on same page without navigation. Would require full page reloads defeating the "modern" and "eye-catching" design goal.
- **Heavy framework (React/Vue/Angular)**: Not mandated - adds unnecessary complexity and bundle size for this feature scope. Can be adopted later if project scales, but violates Principle V (Simplicity) for current requirements.
- **Web Components**: Considered but adds browser compatibility complexity without significant benefit given desktop-only target and modern browser baseline.

### 2. State Management Strategy

**Decision**: Browser localStorage for UI state, no global state management library

**Rationale**:
- Limited state requirements: current page number, currently expanded card ID
- localStorage persists pagination state across page reloads (quality-of-life improvement)
- No complex state updates or cross-component data flow requiring Redux/MobX
- Keeps implementation simple and aligned with Principle V

**Alternatives Considered**:
- **In-memory only (no persistence)**: Rejected because user loses pagination position on page refresh, degrading UX
- **URL query parameters for state**: Considered for shareability but adds complexity and not required by spec
- **Global state library (Redux/Zustand)**: Overkill for this feature - violates simplicity principle

### 3. Geolocation Implementation (P3 User Story)

**Decision**: Browser Geolocation API with reverse geocoding via third-party service (or fallback)

**Rationale**:
- Geolocation API provides coordinates, needs mapping to city name
- Graceful degradation built-in - if detection fails, falls back to London (per spec)
- P3 priority means this is non-blocking enhancement

**Alternatives Considered**:
- **IP-based geolocation**: Less accurate than GPS/WiFi but doesn't require user permission. Could be fallback if Geolocation API denied.
- **GeoNames API**: Free reverse geocoding service, rate-limited but suitable for low-volume usage
- **No reverse geocoding**: Use coordinates to find nearest city from predefined list. Simpler but less accurate.

**Recommended Approach**: Attempt browser Geolocation API → If successful, map coordinates to nearest EU city from predefined list → If fails/denied, fallback to London. No external reverse geocoding API needed if we use "nearest city" algorithm.

### 4. API Communication Pattern

**Decision**: REST API with JSON payloads, Fetch API for HTTP requests

**Rationale**:
- Spec mentions "backend server" providing data - implies HTTP API
- REST is standard, well-understood, and matches typical car rental/travel APIs
- Fetch API is modern, promise-based, and supported in all target browsers
- JSON is standard for web APIs and easy to work with in JavaScript

**Alternatives Considered**:
- **GraphQL**: Overkill for this feature - single search endpoint with fixed response shape. REST is simpler.
- **WebSockets**: Real-time updates not required by spec. Search is user-initiated, not push-based.
- **XMLHttpRequest**: Legacy API, Fetch is modern replacement with better ergonomics

### 5. Image Loading and Error Handling

**Decision**: Lazy loading with placeholder fallbacks, no CDN optimization in initial implementation

**Rationale**:
- Spec requires graceful handling of image loading failures (FR-017)
- Lazy loading improves initial page load performance (only load visible images)
- Placeholder images maintain layout and visual consistency when images fail
- CDN optimization is backend concern, frontend just consumes URLs

**Alternatives Considered**:
- **Eager loading all images**: Poor performance, violates SC-002 (3s load time)
- **Progressive image loading (blur-up)**: Nice-to-have but adds complexity, not required
- **No placeholders**: Layout shifts when images fail, poor UX

### 6. Date/Time Input Approach

**Decision**: Native HTML5 date/time inputs with manual validation fallback

**Rationale**:
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+) support `<input type="date">` and `<input type="time">`
- Native inputs provide localized formatting automatically (addresses Assumption #2 in spec)
- Validation requirements (FR-004, FR-005) can be implemented with JavaScript alongside native validation
- Simpler than custom datepicker libraries

**Alternatives Considered**:
- **Custom datepicker library (Flatpickr, react-datepicker)**: Adds dependency and bundle size. Native inputs sufficient for desktop use case.
- **Text inputs with manual parsing**: Error-prone, poor UX, no localization support

### 7. Pagination Implementation

**Decision**: Client-side pagination with server-provided total count

**Rationale**:
- Spec specifies maximum 10 cards per page (FR-008)
- API returns full result set (or paginated on backend), frontend handles display pagination
- Simple implementation: slice array based on current page number
- Page state persisted in localStorage for UX

**Alternatives Considered**:
- **Server-side pagination**: Requires additional API requests when changing pages. Acceptable if result sets are very large (>1000 items) but spec assumes manageable sizes.
- **Infinite scroll**: Not specified, pagination explicitly mentioned. Infinite scroll changes UX significantly.

### 8. Testing Strategy

**Decision**: Contract tests for API, integration tests for user stories, selective unit tests

**Rationale**:
- Constitution Principle III mandates contract and integration tests
- API contract tests ensure frontend/backend agreement on data shapes
- Integration tests validate each user story end-to-end (P1, P2, P3)
- Unit tests for utility functions (validation, date formatting) and complex components
- Avoid over-testing simple components (violates simplicity principle)

**Tools Selected**:
- **Jest**: Unit testing, well-supported, fast, good mocking capabilities
- **Playwright**: Cross-browser integration testing, modern, headless and headed modes
- **MSW (Mock Service Worker)**: API mocking for contract tests, realistic HTTP mocking

**Alternatives Considered**:
- **Cypress**: Popular but Playwright has better multi-browser support and faster execution
- **Testing Library**: Complementary to Jest for React-style testing, but may not be needed for vanilla JS

## Technical Decisions Summary

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| Frontend Architecture | Component-based SPA | Matches single-page requirement, clean separation of concerns |
| Framework | Vanilla JS (or lightweight) | Simplicity, no unnecessary dependencies |
| State Management | localStorage for UI state | Simple, persistent, no library needed |
| Geolocation | Browser API + nearest city | No external dependencies, graceful fallback |
| API Communication | REST + Fetch + JSON | Standard, simple, well-supported |
| Image Handling | Lazy load + placeholders | Performance + graceful degradation |
| Date/Time Inputs | Native HTML5 inputs | Localized, validated, no dependencies |
| Pagination | Client-side with slice | Simple, fast UI, state persisted |
| Testing | Jest + Playwright + MSW | Meets TDD requirements, modern tooling |

## Dependencies and Constraints

### Required Browser APIs
- Fetch API (HTTP requests)
- Geolocation API (P3 feature only)
- localStorage (state persistence)
- HTML5 form inputs (date, time)

### Assumptions Validated
- Modern desktop browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) all support required APIs
- No polyfills needed for target platform
- JavaScript enabled (reasonable assumption for modern web applications)

### External Dependencies
- Backend API endpoint (must be available, outside this feature's implementation scope)
- EU cities list (static data, can be hardcoded or loaded from JSON file)
- Car model images and attraction thumbnails (provided by backend API per Assumption #5)

## Next Steps

Phase 1 will generate:
1. **data-model.md**: Entity definitions for SearchQuery, RentalResult, RouteInformation, Attraction, PaginationState
2. **contracts/search-api.yaml**: OpenAPI specification for backend search endpoint
3. **quickstart.md**: Manual testing scenarios for all 3 user stories
