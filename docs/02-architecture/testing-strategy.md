---
title: "Testing Strategy"
summary: "How BusinessOS validates correctness, contracts, performance, security, and accessibility across the testing pyramid."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "quality"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/api-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/ai-architecture.md"
  - "docs/02-architecture/devops-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
referenced_by: []
document_type: "Architecture"
---

# Testing Strategy

*Part of Pass 4D — the final architecture documentation layer before ERP
Core Engines (shared reusable platform capabilities).*

## Overview

Testing Strategy defines **what BusinessOS tests, at which layer, with what
guarantees.** It is vendor-neutral: no specific test framework, runner,
harness, or tool is prescribed.

Specific frameworks, runtime versions, vendors, and implementation choices
are intentionally deferred to ADRs and implementation documentation.

## Testing Philosophy

- **TP-01 · Trust is Earned by Evidence.** Every claim of correctness is
  backed by an executable test.
- **TP-02 · Fast Feedback Wins.** The cheapest test that catches a defect
  runs first and runs most often.
- **TP-03 · Tests are Code.** They are versioned, reviewed, and maintained
  with the same rigor as production code.
- **TP-04 · Behaviour Over Implementation.** Tests target observable
  behaviour, not internal structure.
- **TP-05 · Deterministic by Default.** Flaky tests are treated as
  incidents.
- **TP-06 · Tests are Design Feedback.** Hard-to-test code is a design
  signal.
- **TP-07 · Coverage Alone Proves Nothing.** Meaningful assertions matter
  more than line coverage.

## Testing Pyramid

BusinessOS follows a **pyramid** with a **contract band** between
integration and E2E:

- **Unit** — the broad base, fastest, most numerous.
- **Integration** — component interactions with real dependencies where
  practical.
- **Contract** — provider/consumer contract verification between services.
- **End-to-End** — the narrow top, workflow-level, few and precious.

Performance, security, and accessibility testing overlay all layers.

## Unit Testing

- Scope: a single unit of behaviour, no I/O, no network, no shared state.
- Speed: milliseconds; entire suite runs in minutes.
- Determinism: no randomness, no wall-clock dependence unless the unit
  under test *is* time.
- Focus: domain logic, invariants, edge cases, and error paths.

## Integration Testing

- Scope: multiple units, real adapters, real data stores where possible in
  ephemeral form.
- Boundaries: external systems are simulated with high-fidelity fakes; only
  the boundary itself is faked.
- Isolation: each test owns its data; no cross-test coupling.
- Focus: adapter correctness, transactional behaviour, and error
  propagation.

## Contract Testing

- Every producer/consumer pair between services defines a **contract**.
- Providers verify they satisfy the contract.
- Consumers verify against the contract, not against a live provider.
- Contracts are versioned and follow the API Lifecycle Governance defined
  in API Architecture.
- Event contracts follow the Event Catalog and Integration Architecture.

## End-to-End Testing

- Scope: whole user journeys spanning multiple services and UI surfaces.
- Volume: few, high-value flows only (critical business paths).
- Environment: production-parity, seeded with governed test data.
- Focus: workflow correctness, permission enforcement, and irreversible-
  action confirmations.

## Performance Testing

- **Load** — sustained expected volume; SLO conformance.
- **Stress** — beyond expected volume; failure-mode observation.
- **Soak** — long-duration; leak and drift detection.
- **Spike** — sudden bursts; autoscaling and shedding behaviour.
- Targets are drawn from Quality Attributes; deviations are treated as
  regressions.

## Security Testing

- **Static analysis** of source and dependencies (per Security
  Architecture).
- **Dynamic analysis** of running systems.
- **Authorization tests** — every endpoint verified against RBAC/ABAC and
  tenant isolation.
- **Secret scanning** on every change.
- **Threat-driven tests** derived from the platform threat model.
- **AI safety tests** — prompt injection, tool-scope boundaries, refusal
  contract, and hallucination guards (per AI Architecture).

## Accessibility Testing

- Automated checks for standards conformance on every build.
- Keyboard-only path exercised for every critical flow.
- Screen-reader semantics verified for primary journeys.
- Color-contrast and motion-sensitivity checks are gate conditions.
- Manual audits on a documented cadence for critical modules.

## Regression Strategy

- Every defect ships with a failing test first, then a fix.
- Cross-module regressions are prevented by contract tests.
- A regression suite runs on every promotion candidate.
- Flaky-test remediation is prioritized over new feature testing.

## Test Data Principles

- **Governed and Classified.** Test data inherits classification from its
  source and is protected accordingly.
- **Synthetic Preferred.** Real production data is not used in test
  environments; representative synthetic data is generated.
- **Tenant-Aware.** Test data respects multi-tenant boundaries.
- **Reproducible.** Test datasets are versioned and seedable.
- **Retention-Bounded.** Test data expires; no long-lived personal data.

## Test Environment Strategy

- Ephemeral environments preferred for isolated suites.
- A shared integration environment exists for cross-team scenarios.
- Performance and DR exercises use dedicated environments to avoid noise.
- Test environments never carry higher-classification data than they are
  authorized for.

## Quality Gates

Gates that must pass before promotion:

- All unit and integration suites green.
- Contract tests green for both roles.
- Static analysis and security scans within accepted thresholds.
- Accessibility checks within accepted thresholds.
- Performance suite within SLO envelope for changed capabilities.
- No new flaky tests introduced.
- Coverage floor per capability tier upheld (defined in Quality
  Attributes).

## Testing Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Coverage floors per capability tier | Depends on tier definitions in Quality Attributes | With Quality Attributes ratification | Platform |
| Test-data generation approach | Depends on domain models finalized in Pass 5 | With Pass 5 kickoff | Data |
| Contract-test tooling family | Depends on chosen inter-service transport | With ADR on transport | Platform |
| E2E scope catalogue | Requires Module PRDs to enumerate critical journeys | Rolling, per module | Product + QA |

ADR placeholders: **ADR-TST-001 · Coverage Floors**, **ADR-TST-002 · Test
Data Governance**, **ADR-TST-003 · Contract-Test Approach**.

## Conforms to Canon

- No release without evidence (Canon: Quality).
- Multi-tenant isolation is verifiable (Canon: Tenant Isolation).
- AI actions are testable and bounded (Canon: AI as Scoped Principal).
- Accessibility is a requirement, not an aspiration (Canon:
  Accessibility).

## References

- `docs/02-architecture/api-architecture.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/ai-architecture.md`
- `docs/02-architecture/devops-architecture.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/02-architecture/quality-attributes.md`
