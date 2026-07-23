---
document: EEMP Chapter 06 — Backend Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 06 — Backend Standards

> Orchestration handbook only. This chapter references authoritative Architecture and Governance sources; it does not derive, reinterpret, or expand them (R-20).

## Purpose *(Normative)*

Direct engineers to the authoritative backend architecture and governance sources, and describe how those rules are consumed during implementation. No rules are defined here.

## Scope *(Normative)*

All server-side code executed inside the TanStack Start Worker runtime, all `createServerFn` handlers, all server routes under `src/routes/api/`, and all shared server helpers under `src/lib/**` and `src/integrations/**`.

## Audience *(Informative)*

Backend engineers · Full-stack engineers · Reviewers · AI collaborators · QA.

## Responsibilities *(Normative)*

- Engineers consult the authoritative documents cited below before writing server code.
- Reviewers reject changes that duplicate, reinterpret, or contradict the authoritative sources.
- Chapter owner keeps the Traceability Matrix and Evidence block current.

## Inputs *(Informative)*

Authoritative sources discovered during Repository Discovery:

- `docs/02-architecture/master-architecture.md`
- `docs/02-architecture/api-architecture.md`
- `docs/02-architecture/integration-architecture.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/02-architecture/deployment-architecture.md`
- `docs/02-architecture/domain-driven-design.md`
- `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`
- `docs/15-governance/INTEGRATION_READINESS_STANDARD.md`
- `docs/15-governance/PERFORMANCE_BUDGETS_STANDARD.md`
- `docs/15-governance/PLATFORM_TESTING_STANDARD.md`
- `docs/05-adr/ADR-0001-tech-stack.md`
- `docs/05-adr/ADR-0003-event-bus.md`
- `docs/05-adr/ADR-0005-cqrs-scope.md`
- `docs/05-adr/ADR-0006-clean-architecture-ddd.md`
- `docs/05-adr/ADR-0007-api-style-rest-first.md`

## Outputs *(Informative)*

- A single pointer surface engineers use to locate backend rules.
- Traceability from every backend concern back to its authoritative source.

## Consumption Guidance *(Normative)*

Engineers consume backend standards as follows. The EEMP does not restate the rules; it names the source of truth.

| Concern | Source of Truth | How Engineers Consume |
|---|---|---|
| Runtime & stack | `docs/05-adr/ADR-0001-tech-stack.md` | Use only the sanctioned stack; propose deviations via a new ADR. |
| API style | `docs/05-adr/ADR-0007-api-style-rest-first.md`, `docs/02-architecture/api-architecture.md` | Follow REST-first shape for external APIs; server functions for internal RPC. |
| Server-function authoring | Bundled skill `tanstack-server-functions` (see EEMP Ch. 04) | Apply the canonical `createServerFn` chain; no exceptions. |
| Domain layering | `docs/05-adr/ADR-0006-clean-architecture-ddd.md`, `docs/02-architecture/domain-driven-design.md` | Respect layer boundaries; no ORM leakage into UI. |
| CQRS boundary | `docs/05-adr/ADR-0005-cqrs-scope.md` | Apply only within modules that opt in per ADR-0005. |
| Event bus | `docs/05-arr/ADR-0003-event-bus.md`, `docs/02-architecture/event-catalog.md` — verify path at author time | Publish events registered in the catalog; register new events before use. |
| Integrations | `docs/02-architecture/integration-architecture.md`, `docs/15-governance/INTEGRATION_READINESS_STANDARD.md` | Meet the readiness checklist before enabling any integration. |
| Observability | `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`, `docs/02-architecture/observability-architecture.md` | Emit structured logs and metrics per the standard. |
| Performance | `docs/15-governance/PERFORMANCE_BUDGETS_STANDARD.md` | Verify budgets in DoD. |
| Testing | `docs/15-governance/PLATFORM_TESTING_STANDARD.md` | Follow the coverage bands defined by the standard. |
| Worker runtime constraints | Bundled skill `server-runtime` | Never assume Node-only APIs; use Worker-compatible libraries. |

## Dependencies *(Informative)*

- Chapter 02 (rules R-01…R-23)
- Chapter 04 (Coding Standards) — server-function file placement
- Governance Framework v1.0

## Related Documents *(Informative)*

- [README](README.md), [04_Coding_Standards](04_Coding_Standards.md), [07_Database_Standards](07_Database_Standards.md), [08_Security_Standards](08_Security_Standards.md)

## Cross References *(Informative)*

- **Related Documents:** README, 04_Coding_Standards, 07_Database_Standards, 08_Security_Standards
- **Referenced Standards:** PLATFORM_OBSERVABILITY_STANDARD, INTEGRATION_READINESS_STANDARD, PERFORMANCE_BUDGETS_STANDARD, PLATFORM_TESTING_STANDARD
- **Referenced ADRs:** ADR-0001, ADR-0003, ADR-0005, ADR-0006, ADR-0007
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All backend-touching sprints
- **Referenced Solution Designs:** All API-### solution designs

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/02-architecture/master-architecture.md
Authority:          Master Architecture
Reference:          Backend runtime and layering
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/05-adr/ADR-0001-tech-stack.md, ADR-0006, ADR-0007
Authority:          ADR
Reference:          Stack, DDD, REST-first
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md, PERFORMANCE_BUDGETS_STANDARD.md, INTEGRATION_READINESS_STANDARD.md, PLATFORM_TESTING_STANDARD.md
Authority:          Governance Standards
Reference:          Cross-cutting backend concerns
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Discovery order followed: Master Architecture → Governance → Architecture Docs → Design Docs → ADRs → Module Publications → PRDs → Solution Designs → Sprint PRDs → Existing EEMP.
- Referenced files (verified present at author time): all paths listed under Inputs.
- Skipped: module-specific PRDs and sprint PRDs (aggregated as "All" in the traceability rows below).
- Missing/unverified: `docs/02-architecture/event-catalog.md` path form in the ADR-0003 row is marked for reviewer verification.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 06 Backend | PLATFORM_OBSERVABILITY, INTEGRATION_READINESS, PERFORMANCE_BUDGETS, PLATFORM_TESTING | ADR-0001, ADR-0003, ADR-0005, ADR-0006, ADR-0007 | All (MOD-001…MOD-019) | All API-### | MOD-001 … MOD-019 | All backend-touching sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — orchestration surface for backend standards. |
