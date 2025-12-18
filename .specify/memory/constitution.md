<!--
Sync Impact Report
==================
Version Change: None → 1.0.0
Rationale: Initial constitution creation - establishes foundational governance principles

Modified Principles: N/A (initial creation)

Added Sections:
- Core Principles (5 principles)
- Development Workflow
- Quality Standards
- Governance

Removed Sections: N/A (initial creation)

Templates Status:
✅ spec-template.md - Reviewed, aligns with Specification-First principle
✅ plan-template.md - Reviewed, Constitution Check section present
✅ tasks-template.md - Reviewed, supports TDD workflow and independent testing
⚠️ Command files - Generic guidance used (no agent-specific names)

Follow-up TODOs: None
-->

# Speckit Project Constitution

## Core Principles

### I. Specification-First

Every feature begins with a complete, technology-agnostic specification that defines WHAT users need and WHY.

**Rules**:
- Specifications MUST be written before any technical planning or implementation
- Specifications MUST focus on user needs, business value, and acceptance criteria
- Specifications MUST NOT contain implementation details (languages, frameworks, architectures)
- Specifications MUST define measurable success criteria
- All functional requirements MUST be testable and unambiguous

**Rationale**: Clear specifications prevent scope creep, reduce rework, and ensure alignment between stakeholders and implementation teams. By separating "what" from "how," we enable better decision-making and maintain flexibility in technical approaches.

### II. Plan Before Implement

Technical implementation plans MUST be created and approved before code is written.

**Rules**:
- Plans MUST include technical context, architecture decisions, and research findings
- Plans MUST identify dependencies, constraints, and complexity justifications
- Plans MUST generate design artifacts (data models, contracts, quickstart guides)
- Constitution checks MUST pass before and after design phase
- All "NEEDS CLARIFICATION" items MUST be resolved during planning

**Rationale**: Thoughtful planning reduces technical debt, prevents architectural mistakes, and surfaces complexity early when it's cheaper to address. Planning artifacts serve as implementation blueprints and onboarding documentation.

### III. Test-Driven Development (NON-NEGOTIABLE)

Tests MUST be written and approved before implementation begins. The TDD cycle is strictly enforced.

**Rules**:
- Tests MUST be written first, reviewed, and approved by stakeholders/users
- Tests MUST fail before implementation starts (Red phase)
- Implementation proceeds only after tests fail (Green phase)
- Refactoring happens only after tests pass (Refactor phase)
- Contract tests and integration tests MUST cover all API boundaries and user journeys
- Each user story MUST be independently testable

**Rationale**: TDD ensures code meets requirements, provides living documentation, enables fearless refactoring, and catches regressions early. Mandatory TDD prevents "we'll test it later" technical debt and ensures quality from day one.

### IV. Independent User Stories

Features MUST be broken into independently implementable and testable user stories prioritized by value.

**Rules**:
- Each user story MUST be independently testable and deliverable
- User stories MUST be prioritized (P1, P2, P3, etc.) by business value
- Each story MUST include clear acceptance criteria and independent test scenarios
- Tasks MUST be organized by user story to enable parallel development
- MVP MUST be achievable by completing only the P1 user story
- Dependencies between stories MUST be minimized or eliminated

**Rationale**: Independent user stories enable incremental delivery, parallel team work, and early validation. Users receive value sooner, and teams can pivot based on feedback without abandoning all work.

### V. Simplicity and Justification

Start simple. Additional complexity MUST be explicitly justified and approved.

**Rules**:
- Default to the simplest solution that meets requirements
- All complexity violations (extra abstractions, patterns, projects) MUST be documented in Complexity Tracking section
- Justifications MUST explain why simpler alternatives were insufficient
- YAGNI (You Aren't Gonna Need It) principle applies - build for today's requirements
- Architecture MUST support the current feature, not hypothetical future needs

**Rationale**: Premature optimization and over-engineering create maintenance burdens, slow development, and make systems harder to understand. Complexity should be added incrementally as actual needs emerge with concrete evidence.

## Development Workflow

### Specification Phase (`/speckit.specify`)

1. User provides natural language feature description
2. System generates specification with user scenarios, requirements, and success criteria
3. Specification validated against quality checklist (no implementation details, testable requirements, measurable success criteria)
4. Clarifications resolved (maximum 3) before proceeding
5. **GATE**: Specification quality checklist MUST pass before planning

### Planning Phase (`/speckit.plan`)

1. Technical context gathered (language, dependencies, platform, constraints)
2. Constitution check performed against governance rules
3. Research phase resolves technical unknowns and evaluates alternatives
4. Design artifacts generated (data models, API contracts, quickstart scenarios)
5. Constitution check re-evaluated after design
6. **GATE**: All "NEEDS CLARIFICATION" MUST be resolved; Constitution violations MUST be justified

### Task Generation (`/speckit.tasks`)

1. Tasks generated from design artifacts organized by user story
2. Each user story gets dedicated phase with setup, tests, implementation, integration
3. Tasks include file paths, dependencies, and parallel execution markers
4. Implementation strategy defines MVP scope and incremental delivery plan
5. **GATE**: Tasks MUST follow checklist format; Each user story MUST be independently implementable

### Implementation Phase (`/speckit.implement`)

1. Checklist validation - all checklists MUST be complete (or user explicitly approves proceeding)
2. Setup phase - project structure, dependencies, configuration
3. Foundational phase - blocking infrastructure (MUST complete before user stories)
4. User story phases - TDD cycle for each story in priority order
5. Polish phase - documentation, optimization, security hardening
6. **GATE**: Tests MUST fail before implementation; Tests MUST pass before moving to next phase

## Quality Standards

### Testing Requirements

- **Contract Tests**: Required for all API boundaries and external integrations
- **Integration Tests**: Required for all user journeys and inter-service communication
- **Unit Tests**: Optional but encouraged for complex business logic
- **Test Coverage**: Each user story MUST have passing tests before considered complete
- **Test Independence**: Tests MUST be independently runnable and not rely on execution order

### Documentation Requirements

- **Specifications**: MUST be complete, unambiguous, and free of implementation details
- **Plans**: MUST document all technical decisions with rationale and alternatives considered
- **Quickstart Guides**: MUST provide step-by-step validation scenarios for manual testing
- **Inline Documentation**: ONLY where logic is not self-evident (avoid over-commenting)

### Code Quality

- **Readability**: Code MUST be self-documenting through clear naming and simple structure
- **Security**: MUST validate at system boundaries (user input, external APIs)
- **Error Handling**: MUST provide user-friendly messages at boundaries; trust internal contracts
- **Logging**: MUST log significant events for observability and debugging
- **Consistency**: Follow existing patterns in the codebase; justify deviations

## Governance

### Amendment Process

1. Amendments MUST be documented with clear rationale and impact analysis
2. Version MUST increment according to semantic versioning:
   - **MAJOR**: Backward-incompatible governance changes, principle removals/redefinitions
   - **MINOR**: New principles added, materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
3. Constitution changes MUST propagate to dependent templates (spec, plan, tasks, commands)
4. Sync Impact Report MUST be generated documenting all changes and template updates

### Compliance

- All PRs and code reviews MUST verify compliance with constitution principles
- Violations MUST be justified in Complexity Tracking section or rejected
- Constitution supersedes all other project practices and conventions
- Teams MUST reference this constitution when making architectural or process decisions

### Review Cycle

- Constitution MUST be reviewed after every major project milestone
- Amendments proposed when principles no longer serve project needs
- Review MUST consider: what worked, what didn't, what's missing, what's obsolete

**Version**: 1.0.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-18
