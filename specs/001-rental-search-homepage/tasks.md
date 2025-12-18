# Tasks: Car Rental & Self-Drive Tour Search Homepage

**Input**: Design documents from `/specs/001-rental-search-homepage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are MANDATORY per constitution - TDD is NON-NEGOTIABLE

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/`
- Paths shown below use web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend directory structure: frontend/src/{components,services,utils,styles}, frontend/tests/{contract,integration,unit}
- [x] T002 Initialize package.json with Node.js 18+ and configure npm scripts for development, testing, and building
- [x] T003 [P] Install testing dependencies: Jest for unit tests, Playwright for integration tests, MSW for API mocking
- [x] T004 [P] Create frontend/src/index.html with basic HTML5 structure, meta tags, and links to app.js and main.css
- [x] T005 [P] Create frontend/src/styles/variables.css with design tokens (colors, spacing, typography) for clean, stylish design
- [x] T006 [P] Create frontend/src/styles/main.css with global styles and CSS reset

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create frontend/src/utils/constants.js with EU cities list (50-100 major cities), default times (10:00 AM), and API endpoint configuration
- [x] T008 [P] Create frontend/src/utils/dateHelpers.js with functions: getCurrentDate(), getTomorrowDate(), formatDateTime(date), validateDateRange(pickup, dropoff)
- [x] T009 [P] Create frontend/src/utils/validation.js with functions: validateCity(city), validateDateNotPast(date), validateDropoffAfterPickup(pickup, dropoff)
- [x] T010 [P] Create frontend/src/services/storageService.js with functions: savePaginationState(page), getPaginationState(), saveExpandedCard(id), getExpandedCard(), clearState()
- [x] T011 Create frontend/src/services/searchService.js with POST /search API call using Fetch, error handling (400, 429, 500, 503), and response parsing per contracts/search-api.yaml

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Car Rental Search (Priority: P1) 🎯 MVP

**Goal**: Enable users to search for car rentals and view paginated results

**Independent Test**: Load homepage → Modify search params → Submit → View results with pagination

### Tests for User Story 1 (TDD - WRITE FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US1] Contract test for POST /search endpoint in frontend/tests/contract/searchApi.contract.test.js (validate request/response schemas match contracts/search-api.yaml)
- [x] T013 [P] [US1] Integration test for Scenario 1-2 (homepage load with defaults, city selection) in frontend/tests/integration/quickSearch.test.js
- [x] T014 [P] [US1] Integration test for Scenario 3-4 (date/time modification, search submission) in frontend/tests/integration/quickSearch.test.js
- [x] T015 [P] [US1] Integration test for Scenario 5-6 (results display, pagination) in frontend/tests/integration/quickSearch.test.js
- [x] T016 [P] [US1] Integration test for edge cases (no results, backend error, invalid dates) in frontend/tests/integration/quickSearch.test.js

### Implementation for User Story 1

- [x] T017 [P] [US1] Create frontend/src/components/SearchForm.js with city dropdown, date/time inputs, search button, and default value population logic
- [x] T018 [P] [US1] Create frontend/src/components/LoadingSpinner.js with animated loading indicator
- [x] T019 [US1] Create frontend/src/components/ResultCard.js with collapsed state showing: provider name, price, car image, route thumbnail (depends on T017)
- [x] T020 [US1] Create frontend/src/components/ResultsList.js container that renders array of ResultCard components with max 10 visible
- [x] T021 [US1] Create frontend/src/components/Pagination.js with prev/next buttons, page numbers, and total pages display
- [x] T022 [US1] Wire SearchForm submit event to call searchService.search() and update ResultsList with response data in frontend/src/app.js
- [x] T023 [US1] Implement form validation on submit: check date range validity, city selection, past dates (use validation.js)
- [x] T024 [US1] Implement pagination logic: update storageService on page change, slice results array, re-render ResultsList
- [x] T025 [US1] Add loading state handling: show LoadingSpinner during API call, hide on complete/error
- [x] T026 [US1] Add error handling: display user-friendly messages for no results, backend errors, validation failures per FR-015, FR-016
- [x] T027 [US1] Add image fallback handling: use placeholder images when car/route images fail to load per FR-017
- [x] T028 [US1] Create component-specific styles in frontend/src/styles/components/ for SearchForm, ResultCard, ResultsList, Pagination, LoadingSpinner

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP delivered!)

---

## Phase 4: User Story 2 - View Detailed Rental & Route Information (Priority: P2)

**Goal**: Enable users to expand result cards to view detailed route information

**Independent Test**: Perform search (US1) → Click card → View expanded details with accordion behavior

### Tests for User Story 2 (TDD - WRITE FIRST) ⚠️

- [ ] T029 [P] [US2] Integration test for Scenario 1-2 (card expansion, detail display) in frontend/tests/integration/detailView.test.js
- [ ] T030 [P] [US2] Integration test for Scenario 3-4 (accordion behavior, card collapse) in frontend/tests/integration/detailView.test.js

### Implementation for User Story 2

- [ ] T031 [US2] Enhance frontend/src/components/ResultCard.js with expanded state showing: full itinerary, attraction details, driving times, recommendations
- [ ] T032 [US2] Add click event handler to ResultCard that toggles expanded/collapsed state
- [ ] T033 [US2] Implement accordion behavior in ResultsList: when expanding one card, collapse any previously expanded card per FR-013
- [ ] T034 [US2] Add smooth expand/collapse CSS animations (<100ms per SC-002) in frontend/src/styles/components/ResultCard.css
- [ ] T035 [US2] Store currently expanded card ID in storageService to maintain state across interactions
- [ ] T036 [US2] Add visual distinction for expanded cards (border, shadow, background color change) per design requirements

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Smart Default Location Detection (Priority: P3)

**Goal**: Intelligently default to user's current EU city with graceful fallback to London

**Independent Test**: Access from different locations → Verify default city changes or falls back to London

### Tests for User Story 3 (TDD - WRITE FIRST) ⚠️

- [ ] T037 [P] [US3] Integration test for Scenario 1-2 (EU city detection, non-EU fallback) in frontend/tests/integration/geolocation.test.js
- [ ] T038 [P] [US3] Integration test for Scenario 3-4 (detection failure fallback, city dropdown availability) in frontend/tests/integration/geolocation.test.js

### Implementation for User Story 3

- [ ] T039 [US3] Create frontend/src/services/geolocationService.js with Browser Geolocation API integration and error handling
- [ ] T040 [US3] Implement getNearestEUCity(coordinates) function that maps lat/lon to nearest city from constants.js EU cities list
- [ ] T041 [US3] Add geolocation detection on app initialization in frontend/src/app.js before rendering SearchForm
- [ ] T042 [US3] Implement fallback logic: if geolocation denied/fails/non-EU → default to "London" without errors
- [ ] T043 [US3] Update SearchForm to accept detected city as initial prop while keeping all cities in dropdown
- [ ] T044 [US3] Add geolocation permission handling UI (optional prompt explanation if needed for UX)

**Checkpoint**: All user stories should now be independently functional with geolocation enhancement

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Create unit tests for frontend/src/utils/validation.js functions in frontend/tests/unit/validation.test.js
- [ ] T046 [P] Create unit tests for frontend/src/utils/dateHelpers.js functions in frontend/tests/unit/dateHelpers.test.js
- [ ] T047 [P] Create unit tests for frontend/src/components/SearchForm.js rendering and interaction in frontend/tests/unit/components/SearchForm.test.js
- [ ] T048 [P] Create unit tests for frontend/src/components/ResultCard.js expand/collapse logic in frontend/tests/unit/components/ResultCard.test.js
- [ ] T049 [P] Create unit tests for frontend/src/components/Pagination.js navigation logic in frontend/tests/unit/components/Pagination.test.js
- [ ] T050 [P] Optimize CSS: ensure clean, stylish, eye-catching design meets SC-008 (80% favorable rating)
- [ ] T051 [P] Performance optimization: ensure page load <3s (SC-001, SC-002), interactions <100ms
- [ ] T052 [P] Browser compatibility testing: verify on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ per quickstart.md
- [ ] T053 Validate all 12 quickstart.md test scenarios pass manually
- [ ] T054 Security review: validate user input at boundaries (city selection, date inputs), sanitize display of backend data
- [ ] T055 Accessibility improvements: keyboard navigation (Tab, Enter), ARIA labels where appropriate (quality enhancement, not specified)
- [ ] T056 Final code cleanup: remove console.logs, ensure consistent formatting, verify no linting errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 ResultCard but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 SearchForm but independently testable

### Within Each User Story

- **TDD Flow (CRITICAL)**:
  1. Contract tests MUST be written first (T012)
  2. Integration tests MUST be written second (T013-T016 for US1, etc.)
  3. Run tests → Verify they FAIL (RED phase)
  4. Implement components/services (T017-T028 for US1, etc.)
  5. Run tests → Verify they PASS (GREEN phase)
  6. Refactor as needed while keeping tests green
- **Within implementation**: utilities/services before components, components before wiring, styling last

### Parallel Opportunities

- **Setup (Phase 1)**: T003, T004, T005, T006 can run in parallel
- **Foundational (Phase 2)**: T008, T009, T010 can run in parallel after T007
- **US1 Tests**: T012, T013, T014, T015, T016 can be written in parallel
- **US1 Implementation**: T017, T018 can run in parallel; T019 depends on T017
- **US2 Tests**: T029, T030 can be written in parallel
- **US3 Tests**: T037, T038 can be written in parallel
- **Polish**: T045-T052 can mostly run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Tests first → Implementation)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md Scenarios 1-6, 8-12
5. Deploy/demo if ready (MVP delivered!)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (TDD) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (TDD) → Test independently → Deploy/Demo
4. Add User Story 3 (TDD) → Test independently → Deploy/Demo
5. Polish phase → Final production-ready quality
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (tests + implementation)
   - Developer B: User Story 2 (tests + implementation)
   - Developer C: User Story 3 (tests + implementation)
3. Stories complete and integrate independently
4. Team completes Polish phase together

---

## Test-Driven Development (TDD) Checklist

Per Constitution Principle III (NON-NEGOTIABLE):

- [ ] Contract tests written BEFORE any implementation (T012)
- [ ] Integration tests written BEFORE components (T013-T016, T029-T030, T037-T038)
- [ ] All tests initially FAIL (RED phase verified)
- [ ] Implementation proceeds only after tests fail
- [ ] Tests PASS after implementation (GREEN phase)
- [ ] Unit tests cover complex utility logic (T045-T049)
- [ ] All tests are independently runnable
- [ ] Each user story has passing integration tests before considered complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD is MANDATORY**: Tests first → Fail → Implement → Pass → Refactor
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Ready for Implementation

Run `/speckit.implement` to execute these tasks in TDD workflow following the constitution principles.

**Total Tasks**: 56 tasks across 6 phases
**MVP Scope**: Phases 1-3 (T001-T028) = 28 tasks
**Full Feature**: All phases (T001-T056) = 56 tasks
