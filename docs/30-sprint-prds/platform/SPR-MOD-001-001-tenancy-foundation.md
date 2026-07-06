---
title: "SPR-MOD-001-001 — Tenancy Foundation"
summary: "Sprint PRD for the foundational tenancy layer of MOD-001 Platform Administration: tenant lifecycle, tenant identity and metadata, initial organization bootstrap, tenant isolation enforcement, audit integration, tenant-scoped configuration initialization, feature flag initialization, and tenant.* events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Platform"
status: "Draft"
updated: "2026-07-06"
sprint_id: "SPR-MOD-001-001"
parent_module: "MOD-001"
iteration: "Sprint 1"
stage: "2"
pass: "8.2.1"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-051"]
tags: ["sprint", "prd", "platform", "mod-001", "tenancy", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-001 — Tenancy Foundation

> **Stage 2 deliverable.** First authored Sprint PRD under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-001-001` (permanent) |
| Parent Module | `MOD-001` — Platform Administration |
| Parent Sprint Plan | [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | None |
| Downstream Sprints | `SPR-MOD-001-002` … `SPR-MOD-001-006`; every subsequent sprint in every module |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **tenant** as the primary isolation unit of the BusinessOS platform. Deliver tenant lifecycle (create, activate, suspend, archive), stable tenant identity and metadata, initial organization bootstrap, tenant isolation enforcement, audit integration, tenant-scoped configuration initialization, feature flag initialization, and the `tenant.*` event contracts on which every downstream module depends.

### 1.2 In Scope

- Tenant lifecycle transitions: `create`, `activate`, `suspend`, `archive`.
- Tenant identity: stable tenant ID, slug, display name.
- Tenant metadata: region, default locale, timezone, plan tier.
- Initial organization bootstrap: a single seed company, a default branch, and a placeholder default financial year record — created atomically with `tenant.activated`.
- Tenant isolation enforcement per `ADR-011` (consumed, not redefined).
- Audit integration for every tenant lifecycle transition via `ENG-004`.
- Tenant-scoped configuration initialization via `ENG-005` (platform → tenant scope only; module-owned keys are not registered here).
- Feature flag initialization for the new tenant via `ENG-005` (bootstrap of the tenant's flag surface only; module-specific flags are not defined here).
- Events published: `tenant.created`, `tenant.activated`, `tenant.suspended`, `tenant.archived` — delivered via `ENG-024`.

### 1.3 Out of Scope

Reserved for later Platform sprints (see [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md)):

- User management, invitations, and identity federation — `SPR-MOD-001-003`.
- Roles, permissions, and access checks — `SPR-MOD-001-003`.
- Organization / company / branch **hierarchy management** beyond the seed bootstrap — `SPR-MOD-001-002`.
- Configuration hierarchy resolution (org / user scopes) and feature flag administration UI — `SPR-MOD-001-004`.
- Localization pack administration — `SPR-MOD-001-005`.
- Audit review, search, and export surface — `SPR-MOD-001-006`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-001-001`, the following will exist:

- **Business capabilities.**
  - A platform administrator can create, activate, suspend, and archive tenants.
  - Every activated tenant has a bootstrapped seed organization (one company, one default branch, one placeholder financial year record).
  - Tenant context is available on every downstream request path within the Platform layer.
  - Tenant isolation invariants (per `ADR-011`) are enforceable on every tenant-scoped read and write.
- **Published events.** Four `tenant.*` event contracts (see §10) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Configuration artifacts.** Tenant-scoped configuration namespace initialized for each new tenant via `ENG-005`, with no module-specific keys registered (that is deferred to the owning modules).
- **Feature flag artifacts.** Tenant-scoped feature flag namespace initialized for each new tenant via `ENG-005`; no module-specific flags defined here.
- **Audit artifacts.** An audit record exists for every tenant lifecycle transition, produced via `ENG-004`, in a form consumable by the audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-001-001`.
  - `tenant.*` event entries in the event catalog referenced from §10.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-001 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — platform primitives | Tenant entity and lifecycle |
| §2 Business Scope — Tenancy | Tenant lifecycle transitions |
| §5 Master Data — Tenant | Tenant identity, metadata, seed organization bootstrap |
| §6 Transactions — Tenant lifecycle | Create / activate / suspend / archive flows |
| §7 Business Rules — Isolation invariants | Tenant isolation enforcement per `ADR-011` |
| §10 Configuration — Tenant-scoped bootstrap | Tenant-scoped config and flag namespace initialization via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As a platform administrator, I want to create a new tenant with an identity, slug, region, default locale, timezone, and plan tier, so that a customer can be onboarded into BusinessOS.*
- **US-002.** *As a platform administrator, I want tenant creation to atomically bootstrap a seed company, default branch, and placeholder default financial year, so that downstream modules have a valid organization context from the first moment the tenant is active.*
- **US-003.** *As a platform administrator, I want to activate a tenant so that its users and downstream modules can begin operating within it.*
- **US-004.** *As a platform administrator, I want to suspend a tenant so that further activity is blocked while preserving all state.*
- **US-005.** *As a platform administrator, I want to archive a tenant so that it is retired and read-only, while its historical data remains accessible for audit and compliance.*
- **US-006.** *As a downstream module (system persona), I want to receive `tenant.created`, `tenant.activated`, `tenant.suspended`, and `tenant.archived` events, so that I can react to tenant lifecycle transitions in a decoupled way.*
- **US-007.** *As a security reviewer, I want every tenant lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the tenant's history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Tenant creation (US-001, US-002)

- **Given** a valid tenant creation request with identity, slug, region, default locale, timezone, and plan tier,
  **when** a platform admin submits it,
  **then** a tenant record is persisted with a stable, immutable tenant ID, and its slug is unique across the platform.
- **Given** a successful tenant creation,
  **when** the transaction completes,
  **then** exactly one seed company, one default branch, and one placeholder default financial year record are created and associated with the tenant.
- **Given** a duplicate slug or invalid metadata,
  **when** the request is submitted,
  **then** the request is rejected with a deterministic validation outcome and no partial tenant state is left behind.

### 5.2 Tenant activation (US-003)

- **Given** a tenant in `created` state,
  **when** a platform admin activates it,
  **then** the tenant transitions to `active`, its configuration and feature flag namespaces are initialized via `ENG-005`, and a `tenant.activated` event is emitted via `ENG-024`.
- **Given** a tenant already in `active`, `suspended`, or `archived` state,
  **when** activation is attempted,
  **then** the attempt is rejected deterministically without emitting an event.

### 5.3 Tenant suspension (US-004)

- **Given** an `active` tenant,
  **when** a platform admin suspends it,
  **then** the tenant transitions to `suspended`, tenant-scoped writes are blocked in the Platform layer, and a `tenant.suspended` event is emitted via `ENG-024`.

### 5.4 Tenant archival (US-005)

- **Given** a `suspended` or `active` tenant,
  **when** a platform admin archives it,
  **then** the tenant transitions to `archived`, all tenant-scoped writes are blocked, historical reads remain permitted, and a `tenant.archived` event is emitted via `ENG-024`.

### 5.5 Isolation invariants (§1.2 In Scope, `ADR-011`)

- **Given** any tenant-scoped read or write in the Platform layer,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.
- **Given** an attempted cross-tenant access,
  **when** it occurs,
  **then** it is denied and an audit record is produced.

### 5.6 Audit integration (US-007)

- **Given** any tenant lifecycle transition (`create`, `activate`, `suspend`, `archive`),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant ID, transition type, and timestamp.

### 5.7 Events (US-006)

- **Given** a tenant lifecycle transition,
  **when** it completes,
  **then** the corresponding `tenant.*` event is published via `ENG-024` conforming to the contract listed in §10.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-001` — Platform Administration.
- **Module PRD:** [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Tenancy), §5 (Tenant), §6 (Tenant lifecycle), §7 (Isolation invariants), §10 (Tenant-scoped bootstrap), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-001` MODULE_PRD.
- **Upstream sprints:** none. This is the first authored sprint in the repository.
- **Downstream sprints:** every subsequent Platform sprint (`SPR-MOD-001-002` … `SPR-MOD-001-006`) and every sprint in every other module depends on tenant context established here.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. See each engine's specification for capability details.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the platform administrator identity used for lifecycle actions. |
| `ENG-004` Audit | Records every tenant lifecycle transition. |
| `ENG-005` Configuration | Initializes tenant-scoped configuration namespace and feature flag namespace on activation. |
| `ENG-024` Eventing | Publishes `tenant.*` events with the contracts declared in §10. |
| `ENG-002` Authorization | Read-only contextual reference; permission checks are delivered in `SPR-MOD-001-003`, not here. |

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced, not redefined. |
| `ADR-012` Tenant Lifecycle | Authoritative lifecycle state machine; state names and transitions consumed verbatim. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for `tenant.*` events. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Tenant | MOD-001 (this sprint) | Isolation unit; carries identity, metadata, lifecycle state. |
| Seed Company | MOD-001 (bootstrap only) | Placeholder company created atomically at activation. Full company management is `SPR-MOD-001-002`. |
| Default Branch | MOD-001 (bootstrap only) | Placeholder branch under the seed company. Branch management is `SPR-MOD-001-002`. |
| Default Financial Year Placeholder | MOD-001 (bootstrap only) | Placeholder financial-year record so downstream modules have a valid reference at first activation. Full FY management is `SPR-MOD-001-002`. |

### 10.2 Relationships

- A **tenant** owns exactly one seed company at activation.
- A **seed company** owns exactly one default branch at activation.
- A **seed company** owns exactly one placeholder default financial-year record at activation.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-001`.
- The seed company / default branch / placeholder financial year exist **solely to bootstrap the tenant**. Expansion beyond a single seed is owned by `SPR-MOD-001-002`.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `tenant.created` | MOD-001 | SPR-MOD-001-001 | MOD-001 (self), MOD-002 (Accounting), MOD-003 (Sales), all downstream modules | At-least-once, ordered per tenant (per `ADR-051`) |
| `tenant.activated` | MOD-001 | SPR-MOD-001-001 | MOD-001 (self), MOD-002, MOD-003, all downstream modules | At-least-once, ordered per tenant |
| `tenant.suspended` | MOD-001 | SPR-MOD-001-001 | MOD-001 (self), MOD-002, MOD-003, all downstream modules | At-least-once, ordered per tenant |
| `tenant.archived` | MOD-001 | SPR-MOD-001-001 | MOD-001 (self), MOD-002, MOD-003, all downstream modules | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] `tenant.*` events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every tenant-scoped read and write in the Platform layer.
- [ ] Every tenant lifecycle transition produces an audit record via `ENG-004`.
- [ ] Tenant-scoped configuration and feature flag namespaces are initialized on activation via `ENG-005`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-001_SPRINT_PLAN.md` §2 (`SPR-MOD-001-001`):

- A tenant can be created, suspended, and archived through the platform admin surface.
- Tenant context is present on every subsequent request path in the platform layer.
- Every tenant lifecycle transition emits an audit record via `ENG-004`.
- `ADR-011` isolation invariants (row-level scoping or equivalent) are verified against a smoke fixture.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **R1 — Downstream deferrals.** Users, RBAC, organization hierarchy management, configuration hierarchy resolution, localization, and audit UI are deferred to `SPR-MOD-001-002` … `SPR-MOD-001-006`. Assumption: these deferrals hold; this sprint does not silently absorb their scope.
- **R2 — Bootstrap placeholders.** The seed company, default branch, and placeholder financial year are **bootstrap-only records**. Assumption: `SPR-MOD-001-002` upgrades them into fully managed entities; no other module treats them as authoritative catalog data before then.
- **R3 — ADR acceptance.** All referenced ADRs (`ADR-011`, `ADR-012`, `ADR-014`, `ADR-051`) are Accepted at authoring time. If any becomes non-Accepted, this sprint is re-planned.
- **R4 — Event delivery.** `tenant.*` events rely on `ENG-024` delivery guarantees stated in `ADR-051`. Assumption: those guarantees hold; this sprint does not redefine them.
- **R5 — Bootstrap atomicity.** Seed bootstrap MUST be atomic with tenant activation. If atomicity cannot be achieved for a specific implementation path, that path is rejected — the acceptance criterion is not weakened.

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — lifecycle state machine transitions and validation rules.
- **Integration** — audit emission via `ENG-004`, config/flag initialization via `ENG-005`, event publication via `ENG-024`.
- **Contract** — `tenant.*` event contracts against the event catalog.
- **End-to-end (smoke)** — tenant isolation invariants per `ADR-011` verified against a smoke fixture, as required by §13.

Sprint-specific fixtures: a two-tenant smoke fixture used to prove isolation.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider implementing tenant lifecycle as a state machine module whose transitions each emit exactly one audit record and one event, to make §5.6 and §5.7 trivially satisfiable.
- Consider co-locating seed bootstrap with the `activate` transition to guarantee atomicity per R5.
- Consider evaluating tenant isolation invariants at the earliest boundary the platform enforces (query layer or equivalent) so downstream sprints inherit the guarantee without additional code.
- Consider seeding tenant configuration and feature flag namespaces in the same transaction as activation to avoid partial state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-001-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the tenant as the primary isolation unit and deliver its lifecycle, identity, bootstrap, isolation enforcement, audit, config/flag initialization, and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-001` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists user management, RBAC, org hierarchy management, config hierarchy, localization, and audit UI, each linked to its owning sprint (`-002` … `-006`).
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-001-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-001-002 Organization Structure` is the immediate successor per [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) §2–§3 and depends only on `SPR-MOD-001-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
