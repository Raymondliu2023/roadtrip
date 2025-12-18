# Implementation Plan: Car Rental & Self-Drive Tour Search Homepage

**Branch**: `001-rental-search-homepage` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rental-search-homepage/spec.md`

## Summary

Build a modern car rental search homepage for EU cities with integrated self-drive tour recommendations. The system consists of a web frontend displaying a search interface with smart defaults, result cards with expandable details, and pagination. A backend API provides rental quotes and route information including attractions. Technical approach: Single-page application architecture with component-based UI, RESTful API communication, and progressive enhancement for geolocation.

## Technical Context

**Language/Version**: JavaScript/TypeScript (ES2020+) with Node.js 18+ for any build tooling
**Primary Dependencies**: Modern browser APIs (Fetch, Geolocation), no heavy framework mandated - vanilla JS or lightweight library acceptable
**Storage**: Browser localStorage for UI state (pagination, expanded cards); no persistent server-side storage required for this feature
**Testing**: Jest for unit tests, Playwright or Cypress for integration tests covering user journeys
**Target Platform**: Modern desktop browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) with viewport width >= 1024px
**Project Type**: Web application (frontend + backend API contract definition)
**Performance Goals**: <3s initial page load, <3s search response time, <100ms UI interactions (expand/collapse)
**Constraints**: Desktop-only (no mobile), anonymous access (no authentication), EU market focus
**Scale/Scope**: Support 50-100 major EU cities, handle 10-100 concurrent searches, display up to 1000 results with pagination

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Specification-First ✅ PASS
- Specification completed and validated before planning
- All requirements are technology-agnostic and focus on user needs
- No implementation details leaked into spec.md

### Principle II: Plan Before Implement ✅ PASS
- Technical context defined above
- Research phase (Phase 0) will resolve any technical unknowns
- Design artifacts (data models, API contracts, quickstart) will be generated in Phase 1
- This document serves as the implementation blueprint

### Principle III: Test-Driven Development ✅ PASS
- TDD workflow will be enforced during implementation
- Contract tests defined for API boundaries (Phase 1)
- Integration tests defined for all 3 user stories (Phase 1)
- Tests will be written first, must fail, then implementation proceeds

### Principle IV: Independent User Stories ✅ PASS
- Spec defines 3 independent user stories with clear priorities (P1, P2, P3)
- P1 (Quick Search) is MVP - delivers value independently
- P2 (Detail View) builds on P1 but is independently testable
- P3 (Geolocation) is pure enhancement with graceful degradation
- Each story can be developed, tested, and deployed independently

### Principle V: Simplicity and Justification ✅ PASS
- No unnecessary complexity identified
- Single-page architecture is simplest approach for this use case
- No premature abstractions or frameworks mandated
- Backend API is external dependency, not part of this implementation scope
- *See Complexity Tracking section if violations arise during design*

**Constitution Check Status**: ✅ ALL PRINCIPLES PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-rental-search-homepage/
├── plan.md              # This file
├── research.md          # Phase 0: Technical decisions and alternatives
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Manual testing scenarios
├── contracts/           # Phase 1: API specifications
│   └── search-api.yaml  # OpenAPI spec for search endpoint
└── checklists/
    └── requirements.md  # Spec quality checklist (already created)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── SearchForm.js          # Search interface component
│   │   ├── ResultCard.js          # Individual rental result card
│   │   ├── ResultsList.js         # Container for all result cards
│   │   ├── Pagination.js          # Pagination controls
│   │   └── LoadingSpinner.js      # Loading state indicator
│   ├── services/
│   │   ├── searchService.js       # API communication layer
│   │   ├── geolocationService.js  # Location detection service
│   │   └── storageService.js      # LocalStorage wrapper
│   ├── utils/
│   │   ├── dateHelpers.js         # Date/time formatting utilities
│   │   ├── validation.js          # Form validation logic
│   │   └── constants.js           # EU cities list, defaults
│   ├── styles/
│   │   ├── main.css               # Global styles
│   │   ├── components/            # Component-specific styles
│   │   └── variables.css          # Design tokens
│   ├── index.html                 # Main HTML entry point
│   └── app.js                     # Application initialization
│
└── tests/
    ├── contract/
    │   └── searchApi.contract.test.js   # API contract tests
    ├── integration/
    │   ├── quickSearch.test.js          # P1 user story tests
    │   ├── detailView.test.js           # P2 user story tests
    │   └── geolocation.test.js          # P3 user story tests
    └── unit/
        ├── validation.test.js
        ├── dateHelpers.test.js
        └── components/
            ├── SearchForm.test.js
            ├── ResultCard.test.js
            └── Pagination.test.js
```

**Structure Decision**: Web application structure selected because the feature requires both a frontend (user interface) and backend API contract definition. Frontend is organized by component architecture with clear separation of concerns: components (UI), services (external communication), utils (business logic), and styles (presentation). Tests mirror the source structure and align with TDD requirements (contract, integration, unit).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No complexity violations identified. Current architecture is the simplest approach to meet requirements.*

---

## Phase 0: Research (COMPLETE)

**Artifact**: [research.md](./research.md)

**Summary**: All technical unknowns resolved through research and alternatives evaluation.

**Key Decisions**:
- Component-based SPA with vanilla JavaScript (simplicity over framework overhead)
- Browser localStorage for UI state persistence
- REST API with Fetch for HTTP communication
- Native HTML5 date/time inputs (no custom library needed)
- Client-side pagination with server-provided totals
- Jest + Playwright + MSW for testing (meets TDD requirements)
- Browser Geolocation API with nearest-city fallback for P3 feature

**Alternatives Documented**: 8 decision areas evaluated with rationale for chosen approach

---

## Phase 1: Design (COMPLETE)

**Artifacts Generated**:
1. **[data-model.md](./data-model.md)** - 5 entities defined with validation rules and relationships
2. **[contracts/search-api.yaml](./contracts/search-api.yaml)** - OpenAPI 3.0 specification for backend search endpoint
3. **[quickstart.md](./quickstart.md)** - 12 manual test scenarios covering all user stories and edge cases

**Entities**: SearchQuery, RentalResult, RouteInformation, Attraction, PaginationState

**API Contract**: POST /search endpoint with comprehensive request/response schemas, error handling, and examples

**Testing Coverage**:
- P1 (Quick Search): Scenarios 1-4, 8-12 (MVP core functionality)
- P2 (Detail View): Scenarios 5-6 (card expansion and accordion)
- P3 (Geolocation): Scenario 7 (smart defaults with fallback)

---

## Constitution Check (POST-DESIGN)

*Re-evaluation after Phase 1 design completion*

### Principle I: Specification-First ✅ PASS (UNCHANGED)
- Specification remains technology-agnostic
- Design artifacts document HOW without changing WHAT
- No scope creep introduced during planning

### Principle II: Plan Before Implement ✅ PASS (COMPLETE)
- Technical context defined and validated
- All research completed with documented alternatives
- Design artifacts generated (data models, API contracts, quickstart)
- Implementation blueprint complete and ready for task generation

### Principle III: Test-Driven Development ✅ PASS (READY)
- Contract tests defined in quickstart.md (Scenario 3-4 + API contract validation)
- Integration tests mapped to user stories (Scenarios 1-12 cover P1, P2, P3)
- Test-first workflow documented: contract tests → integration tests → implementation
- TDD will be enforced during `/speckit.implement` phase

### Principle IV: Independent User Stories ✅ PASS (UNCHANGED)
- User stories remain independently testable
- Quickstart scenarios validate independent testing capability
- No inter-story dependencies introduced during design

### Principle V: Simplicity and Justification ✅ PASS (VALIDATED)
- Design validates initial simplicity assessment
- Vanilla JS approach confirmed as sufficient (no framework needed)
- No architectural complexity added beyond requirements
- All decisions documented with simpler alternatives considered and rejected with justification

**Final Constitution Check Status**: ✅ ALL PRINCIPLES PASS

---

## Next Steps

The implementation plan is **COMPLETE** and ready for task generation.

### Ready for `/speckit.tasks`

Run `/speckit.tasks` to generate the task breakdown file (`tasks.md`) with:
- Phase 1: Setup (project structure, dependencies, configuration)
- Phase 2: Foundational (shared utilities, services, constants)
- Phase 3: P1 User Story (Quick Search - MVP)
- Phase 4: P2 User Story (Detail View)
- Phase 5: P3 User Story (Geolocation)
- Phase 6: Polish (documentation, optimization, final validation)

Each phase will include:
- Contract tests (written first, must fail)
- Integration tests (for user story validation)
- Implementation tasks (components, services, utilities)
- Clear file paths and dependency markers ([P] for parallel execution)

### Implementation Readiness Checklist

- [x] Specification complete and validated
- [x] Technical context defined
- [x] Research completed with alternatives documented
- [x] Data model defined with validation rules
- [x] API contract specified (OpenAPI 3.0)
- [x] Manual testing scenarios documented
- [x] Constitution check passed (pre and post-design)
- [x] Project structure defined
- [x] No complexity violations identified
- [x] Tasks generated (`/speckit.tasks` - COMPLETE)
- [ ] Implementation executed (`/speckit.implement` - next step)

**Planning Phase Complete** ✅
**Tasks Generated** ✅
