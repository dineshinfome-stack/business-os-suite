---
title: "MOD-001 Platform Administration — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-001 Platform Administration. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-06"
module_id: "MOD-001"
sprint_prefix: "SPR-MOD-001-"
stage: "1"
pass: "8.2.0"
tags: ["sprint", "planning", "platform", "mod-001", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-001 Platform Administration — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-001 Platform Administration** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## 1. Purpose & Scope

Plan the implementation of MOD-001 Platform Administration by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD and is **not** registered in `SPRINT_CATALOG.md`.

**Traceability:**

- Parent Module README — [`../../20-module-prds/platform/README.md`](../../20-module-prds/platform/README.md)
- Parent Module PRD — [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-001 in `SPRINT_ROADMAP.md` is **6**. This plan aligns with that estimate.

## 2. Sprint Sequence

### SPR-MOD-001-001 — Tenancy Foundation

- **Objective.** Establish the tenant as the primary isolation unit: creation, lifecycle (active / suspended / archived), and multi-tenant isolation guarantees per `ADR-011`.
- **Boundaries.**
  - In: tenant entity and lifecycle, tenant context propagation, tenant-scoped identity bootstrap, tenant admin bootstrap user.
  - Out: full user management, organizational hierarchy, configuration keys, localization packs.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Tenancy), §5 Master Data (Tenant), §6 Transactions (Tenant lifecycle).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-004` Audit.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-030` Authentication Model, `ADR-032` RBAC + ABAC, `ADR-014` Audit Strategy.
- **Upstream sprint dependencies.** None.
- **Sprint Exit Criteria.**
  - A tenant can be created, suspended, and archived through the platform admin surface.
  - Tenant context is present on every subsequent request path in the platform layer.
  - Every tenant lifecycle transition emits an audit record via `ENG-004`.
  - `ADR-011` isolation invariants (row-level scoping or equivalent) are verified against a smoke fixture.

### SPR-MOD-001-002 — Organization Structure

- **Objective.** Model organizations, companies, branches, and financial years within a tenant, with the hierarchy required by downstream modules (Accounting, Sales, Purchase).
- **Boundaries.**
  - In: organization / company / branch entities, hierarchy, financial year definition and activation.
  - Out: users assigned to branches (next sprint), configuration hierarchy, localization.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Org structure), §5 Master Data (Org, Company, Branch, Financial Year), §6 Transactions (structural CRUD).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-004` Audit, `ENG-017` Numbering (for org-scoped code sequences).
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-001-001`.
- **Sprint Exit Criteria.**
  - An organization tree (organization → company → branch) can be created and edited under a tenant.
  - At least one financial year can be defined and activated per company.
  - All structural changes are audited.
  - Downstream references (identifiers, hierarchy) are stable and available for later modules.

### SPR-MOD-001-003 — Users, Roles & Permissions

- **Objective.** Deliver end-to-end user administration: user identities, role definitions, permission grants, RBAC + ABAC checks per `ADR-032`.
- **Boundaries.**
  - In: user CRUD, role CRUD, permission catalog population (platform-scoped), role assignment, permission evaluation surface.
  - Out: SSO / IdP federation (future), organization-scoped delegation flows beyond baseline.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Users & Roles), §5 Master Data (User, Role, Permission), §7 Business Rules (Access Control).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit.
- **ADRs consumed.** `ADR-030`, `ADR-031`, `ADR-032`, `ADR-014`.
- **Upstream sprint dependencies.** `SPR-MOD-001-002`.
- **Sprint Exit Criteria.**
  - A tenant admin can create users, define roles, grant permissions, and revoke access.
  - Permission checks resolve deterministically for both RBAC and ABAC inputs.
  - Every access grant/revoke is audited with actor, subject, and scope.
  - Downstream modules can rely on `ENG-002` / `ENG-003` for authorization decisions.

### SPR-MOD-001-004 — Configuration Hierarchy

- **Objective.** Implement the configuration hierarchy (`ADR-026`) and feature flag surface (`ADR-025`) at platform, tenant, organization, and user scopes.
- **Boundaries.**
  - In: configuration key registration, hierarchical resolution, feature flag CRUD and evaluation, admin surface to view effective config.
  - Out: module-specific configuration keys (owned by their modules), remote config providers beyond baseline.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Configuration), §10 Configuration, §12 ERP Core Engine Consumption.
- **Engines consumed.** `ENG-005` Configuration, `ENG-002` Authorization, `ENG-004` Audit.
- **ADRs consumed.** `ADR-025` Feature Flags, `ADR-026` Configuration Hierarchy, `ADR-004` Plugin Extension Model.
- **Upstream sprint dependencies.** `SPR-MOD-001-003`.
- **Sprint Exit Criteria.**
  - Configuration keys resolve deterministically through the hierarchy (platform → tenant → org → user).
  - Feature flags can be toggled and evaluated per scope.
  - All changes are audited.
  - Downstream modules can register their own keys through the documented extension surface.

### SPR-MOD-001-005 — Localization Packs

- **Objective.** Deliver locale, currency, number/date formatting, and translation pack administration (`ENG-006`) at platform and tenant scopes.
- **Boundaries.**
  - In: locale registration, translation packs, formatting rules, tenant/user locale selection.
  - Out: module-specific string catalogs (owned by their modules), external translation providers beyond baseline.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Localization), §10 Configuration (locale defaults), §12 ERP Core Engine Consumption.
- **Engines consumed.** `ENG-006` Localization, `ENG-005` Configuration, `ENG-018` Currency (locale ↔ currency defaults), `ENG-004` Audit.
- **ADRs consumed.** `ADR-026` Configuration Hierarchy.
- **Upstream sprint dependencies.** `SPR-MOD-001-004`.
- **Sprint Exit Criteria.**
  - A tenant admin can install / update a locale pack and assign default locale and currency at tenant scope.
  - Users can select an allowed locale; the platform resolves formatting deterministically.
  - Locale changes are audited and observable in downstream modules through `ENG-006`.

### SPR-MOD-001-006 — Audit Review Surface

- **Objective.** Deliver the platform-level audit review surface (search, filter, export) over `ENG-004`, closing the loop on the previous five sprints.
- **Boundaries.**
  - In: audit read models, search & filter UI, export, retention policy configuration.
  - Out: SIEM export (future), cross-tenant audit aggregation (out of scope for MOD-001).
- **Estimated size.** Small.
- **Module PRD sections covered.** §2 Business Scope (Audit Review), §9 Reports & Analytics (Audit), §11 Non-functional (Retention).
- **Engines consumed.** `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-027` Export.
- **ADRs consumed.** `ADR-014` Audit Strategy, `ADR-035` Data Classification, `ADR-036` Audit Integrity.
- **Upstream sprint dependencies.** `SPR-MOD-001-001` … `SPR-MOD-001-005` (consumes audit records produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Platform admins can query and filter audit events across tenants they own.
  - Audit export produces a verifiable artifact consistent with `ADR-036`.
  - Retention policy is configurable and enforced.
  - Every prior sprint's audit output is visible in the review surface.

## 3. Sprint Dependency Graph

```text
SPR-MOD-001-001 (Tenancy)
        │
        ▼
SPR-MOD-001-002 (Organization Structure)
        │
        ▼
SPR-MOD-001-003 (Users, Roles & Permissions)
        │
        ▼
SPR-MOD-001-004 (Configuration Hierarchy)
        │
        ▼
SPR-MOD-001-005 (Localization Packs)
        │
        ▼
SPR-MOD-001-006 (Audit Review Surface)  ← consumes audit from all above
```

The sequence is strictly linear: each sprint depends on the immediately preceding one, and the final sprint consumes audit output from all five predecessors.

## 4. Engine Consumption Map

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-017 | ENG-018 | ENG-020 | ENG-021 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-001-001 | ● | ● |   | ● |   |   |   |   |   |   |   |
| SPR-MOD-001-002 | ● | ● |   | ● |   |   | ● |   |   |   |   |
| SPR-MOD-001-003 | ● | ● | ● | ● |   |   |   |   |   |   |   |
| SPR-MOD-001-004 |   | ● |   | ● | ● |   |   |   |   |   |   |
| SPR-MOD-001-005 |   |   |   | ● | ● | ● |   | ● |   |   |   |
| SPR-MOD-001-006 |   | ● |   | ● |   |   |   |   | ● | ● | ● |

## 5. ADR Consumption Map

| Sprint | ADR-011 | ADR-014 | ADR-025 | ADR-026 | ADR-030 | ADR-031 | ADR-032 | ADR-035 | ADR-036 | ADR-004 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-001-001 | ● | ● |   |   | ● |   | ● |   |   |   |
| SPR-MOD-001-002 | ● |   |   |   |   |   | ● |   |   |   |
| SPR-MOD-001-003 |   | ● |   |   | ● | ● | ● |   |   |   |
| SPR-MOD-001-004 |   |   | ● | ● |   |   |   |   |   | ● |
| SPR-MOD-001-005 |   |   |   | ● |   |   |   |   |   |   |
| SPR-MOD-001-006 |   | ● |   |   |   |   |   | ● | ● |   |

`ADR-025` and `ADR-026` are currently `Proposed`. If they remain `Proposed` when Stage 2 begins, they are treated as pending decisions in the Module PRD's decisions register and must be `Accepted` before their consuming sprint enters `In Progress`.

## 6. Cross-Sprint Dependency Matrix

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Tenant context propagation | SPR-MOD-001-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes tenant scope. |
| Audit event emission | SPR-MOD-001-001 | 002, 003, 004, 005, 006 | Every sprint emits events; SPR-006 consumes them all. |
| Permission catalog schema | SPR-MOD-001-003 | 004, 005, 006 | Later sprints register their own permission keys against this catalog. |
| Configuration key registration API | SPR-MOD-001-004 | 005 | Localization defaults registered against this API. |
| Feature flag surface | SPR-MOD-001-004 | 005, 006 | Optional gating for locale rollouts and audit UI. |
| Locale defaults | SPR-MOD-001-005 | 006 | Audit review UI honors user locale. |

## 7. Risks & Assumptions

- **R1 — Proposed ADRs.** `ADR-025` (Feature Flags) and `ADR-026` (Configuration Hierarchy) are `Proposed`. Assumption: they will be `Accepted` before SPR-MOD-001-004 enters Stage 2 authoring. Mitigation: if not, defer the flag portion of SPR-004 and re-plan.
- **R2 — Configuration hierarchy scope creep.** Module-specific configuration keys must remain in their owning modules. Assumption: only *platform-scoped* keys land in SPR-MOD-001-004; other modules register additional keys during their own passes.
- **R3 — SSO / IdP federation.** Explicitly out of scope for MOD-001; will be scheduled as a later Sprint PRD against MOD-001 in a subsequent planning revision, not folded into SPR-MOD-001-003.
- **R4 — Cross-tenant admin flows.** Audit review (SPR-MOD-001-006) is scoped to a platform admin's owned tenants. Cross-tenant aggregation, if required, is deferred.
- **R5 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md` §3, no horizontal-only sprints are required for MOD-001 beyond the sequence above; all sprints are vertical slices.

## 8. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-001 is baseline-ready when all of the following are objectively true:

1. Every reserved sprint (`SPR-MOD-001-001` … `SPR-MOD-001-006`) has status `Done`.
2. Every Sprint Exit Criterion in §2 is met at authoring time and remains met.
3. The Module PRD version at baseline is recorded and unchanged since Stage 2 began (or all amendments are traced).
4. All engines and ADRs listed in §4 and §5 are `Accepted` at baseline time.
5. Downstream modules (Accounting, Purchase, Sales, CRM, …) can consume Platform capabilities without further coordination with the Platform sprint sequence.
6. No sprint has ended with an unresolved architectural exception.

Failure to meet any criterion blocks the Stage 3 pass (`Pass 8.2.Z`).

## 9. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes and Estimated Sprint Count remain planning estimates, not implementation commitments.

## 10. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
