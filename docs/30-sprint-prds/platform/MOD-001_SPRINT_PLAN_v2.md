---
title: "MOD-001 Platform Administration — Sprint Plan v2.0 (Dedicated-DB-per-Tenant)"
summary: "Refreshed Stage 1 sprint plan for MOD-001 under ADR-017. Reserves SPR-MOD-001-001 through SPR-MOD-001-010 for authoring under Sprint Plan v2.0. Supersedes MOD-001_SPRINT_PLAN.md. Reservations only; no Sprint PRDs are authored here."
layer: "delivery"
owner: "Engineering"
status: "Certified"
certified_on: "2026-07-25"
publication: "Platform Foundation v1.0"
certificate: "docs/40-module-baselines/MOD001_PLATFORM_FOUNDATION_CERTIFICATE.md"
updated: "2026-07-25"
module_id: "MOD-001"
sprint_prefix: "SPR-MOD-001-"
stage: "1"
version: "2.0"
supersedes: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md"
related_adrs: ["ADR-017", "ADR-011", "ADR-014", "ADR-030", "ADR-032", "ADR-065"]
tags: ["sprint", "planning", "platform", "mod-001", "v2", "dedicated-db"]
document_type: "Module Sprint Plan"
---

# MOD-001 Platform Administration — Sprint Plan v2.0

> **Stage 1 deliverable, refreshed under ADR-017.** Supersedes the v1 sprint plan (`MOD-001_SPRINT_PLAN.md`). Sprint identifiers `SPR-MOD-001-001` through `SPR-MOD-001-010` are **planning reservations** and are **not** authored Sprint PRDs. Authoring is deferred to Plan B (post Architecture Board approval of this baseline family). No code, schema, migration, RBAC, API, or navigation change is authorised by this plan.

## 1. Purpose & Scope

Decompose **MOD-001 Platform Administration** under **ADR-017 — Dedicated Database per Tenant Architecture** into a coherent, dependency-ordered sprint sequence of ten sprints. Every sprint is scoped under the new architecture; no sprint carries shared-database assumptions.

**Traceability**

- Parent Module README — [`../../20-module-prds/platform/README.md`](../../20-module-prds/platform/README.md)
- Parent Module PRD — [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- Governing ADR — [`../../11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`](../../11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md)
- Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md)

## 2. Sprint Sequence

### SPR-MOD-001-001 — Platform & Tenant Provisioning

- **Objective.** Provision a Tenant end-to-end under ADR-017: Tenant record in Platform DB, dedicated database creation, schema bootstrap, tenant registration in connection registry, Workspace bootstrap (logical), default Company creation, default Financial Year, initial Tenant Admin user.
- **In.** Tenant CRUD (Platform DB), database provisioning contract, schema bootstrap sequence, connection registry, Workspace bootstrap (logical), seed Company + Financial Year, Tenant Admin invitation.
- **Out.** Multi-workspace bootstrap, cross-tenant migration, physical Workspace persistence.
- **Size.** Large.
- **Engines.** ENG-001, ENG-002, ENG-004, ENG-024.
- **ADRs.** ADR-017, ADR-011, ADR-030, ADR-032, ADR-014.
- **Upstream.** None.
- **Exit.** A Tenant can be provisioned through the Platform admin surface; its dedicated database exists; its Workspace resolves; a default Company and Financial Year exist inside it; a Tenant Admin can sign in and reach the Workspace.

### SPR-MOD-001-002 — Workspace & Organization Foundation

- **Objective.** Deliver the organisation structure inside a Tenant database: Companies, Branches, Financial Years, and the logical Workspace navigation surface.
- **In.** Company, Branch, Financial Year entities and lifecycles; Workspace navigation contract; ownership rules from ADR-017 §Architectural Invariants.
- **Out.** Users assigned to branches (next sprint), configuration hierarchy, licensing.
- **Size.** Medium.
- **Engines.** ENG-001, ENG-002, ENG-004, ENG-017, ENG-024.
- **ADRs.** ADR-017, ADR-011.
- **Upstream.** SPR-MOD-001-001.
- **Exit.** Company / Branch / Financial Year hierarchy operates inside a Tenant database; Workspace navigation renders every child capability listed in ADR-017; all structural changes are audited to the Tenant audit stream.

### SPR-MOD-001-003 — Identity & Access

- **Objective.** Deliver user, role, permission, and membership administration inside a Tenant database, plus Super Admin identity inside the Platform database.
- **In.** Tenant users and roles; permission catalog inside Tenant DB; membership resolution; Platform users and Super Admin roles inside Platform DB.
- **Out.** SSO / IdP federation.
- **Size.** Large.
- **Engines.** ENG-001, ENG-002, ENG-003, ENG-004, ENG-024.
- **ADRs.** ADR-017, ADR-030, ADR-032, ADR-014.
- **Upstream.** SPR-MOD-001-002.
- **Exit.** A Tenant Admin can manage users, roles, and permissions inside their Tenant DB; a Platform Super Admin is authenticated only against the Platform DB; every grant/revoke is audited in the correct scope.

### SPR-MOD-001-004 — Configuration

- **Objective.** Implement Tenant / Company / Branch / User configuration inheritance and feature flags per ADR-026 within a Tenant database.
- **In.** Configuration key registration, hierarchical resolution, feature flag CRUD and evaluation, admin surface to view effective config.
- **Out.** Module-specific configuration keys owned by their modules.
- **Size.** Medium.
- **Engines.** ENG-002, ENG-004, ENG-005, ENG-024.
- **ADRs.** ADR-017, ADR-025, ADR-026.
- **Upstream.** SPR-MOD-001-003.
- **Exit.** Configuration keys resolve deterministically through the hierarchy; feature flags evaluate per scope; changes are audited in the Tenant DB.

### SPR-MOD-001-005 — Licensing

- **Objective.** Deliver Tenant-scoped license, subscription, plan limits, renewal, and suspension in the Platform database, with enforcement upstream of every Tenant DB connection.
- **In.** License entity, subscription lifecycle, plan-limit evaluation surface, renewal, suspension, entitlement resolution.
- **Out.** Payment collection, tax computation, invoicing.
- **Size.** Medium.
- **Engines.** ENG-001, ENG-002, ENG-004, ENG-024.
- **ADRs.** ADR-017.
- **Upstream.** SPR-MOD-001-001.
- **Exit.** A Tenant carries an active License in the Platform DB; suspension blocks Tenant DB connections; every licensing event is audited to Platform audit.

### SPR-MOD-001-006 — Localization

- **Objective.** Deliver timezone, currency, fiscal calendar, language, and regional formatting at Tenant and User scope.
- **In.** Locale registration, translation packs, formatting rules, tenant/user locale selection.
- **Out.** Module-specific string catalogs.
- **Size.** Medium.
- **Engines.** ENG-004, ENG-005, ENG-006, ENG-024.
- **ADRs.** ADR-017, ADR-026.
- **Upstream.** SPR-MOD-001-004.
- **Exit.** A Tenant Admin can install/activate a locale pack and assign default locale, timezone, currency, and fiscal calendar; user overrides resolve deterministically; changes audited in Tenant DB.

### SPR-MOD-001-007 — Workspace Services (Logical)

- **Objective.** Deliver Workspace-level branding, dashboard entry, navigation surface, notifications surface, and integrations surface. All logical — no `workspaces` table, no `workspace_id` column.
- **In.** Branding tokens (Tenant-scoped), dashboard shell, navigation registry entry points, notification channel bindings, integration registration surface.
- **Out.** Any persistence that introduces a Workspace identifier.
- **Size.** Medium.
- **Engines.** ENG-005, ENG-006, ENG-024, ENG-025.
- **ADRs.** ADR-017, ADR-025, ADR-026.
- **Upstream.** SPR-MOD-001-004, SPR-MOD-001-006.
- **Exit.** Workspace surface renders branding, dashboard, navigation, notifications, and integrations without introducing any Workspace-persistent identifier.

### SPR-MOD-001-008 — Platform Operations

- **Objective.** Deliver Platform-level operations for the dedicated-DB-per-Tenant estate: monitoring, provisioning workflows, database lifecycle (upgrade, retire), backup / restore, maintenance windows, health checks.
- **In.** Provisioning workflow orchestration, DB version registry, backup/restore contracts, maintenance-window model, health surface.
- **Out.** Vendor selection, replication topology, DR run-books (deferred to downstream ADRs).
- **Size.** Large.
- **Engines.** ENG-001, ENG-002, ENG-004, ENG-024, ENG-025.
- **ADRs.** ADR-017, ADR-011, ADR-065.
- **Upstream.** SPR-MOD-001-001.
- **Exit.** Platform Operations can list every Tenant DB, its version, its last backup, its health, and can execute provision / upgrade / retire flows; every operation is audited to Platform audit.

### SPR-MOD-001-009 — Audit & Compliance

- **Objective.** Deliver Platform audit (Platform DB), the Platform-owned review surface over Tenant audit (Tenant DBs), security posture reporting, and compliance evidence exports.
- **In.** Platform audit ingestion, review-surface search/filter/export across owned Tenants, retention configuration, integrity guarantees per ADR-036, data-classification tagging per ADR-035.
- **Out.** SIEM export, cross-tenant audit aggregation for tenants not owned by the caller.
- **Size.** Medium.
- **Engines.** ENG-004, ENG-020, ENG-021, ENG-024, ENG-025, ENG-027.
- **ADRs.** ADR-017, ADR-014, ADR-035, ADR-036.
- **Upstream.** SPR-MOD-001-001 … SPR-MOD-001-008.
- **Exit.** Every prior sprint's audit output is visible under the Platform review surface with correct scope; retention is enforced; compliance exports are verifiable.

### SPR-MOD-001-010 — Platform Administration Console

- **Objective.** Deliver the Super Admin surface: Super Admin dashboard, Tenant management, Licensing management, Monitoring, Operations run-books.
- **In.** Super Admin dashboard, Tenant list/detail/lifecycle actions, Licensing management surface, Operations dashboards, Monitoring surface.
- **Out.** External vendor consoles and third-party ops tooling.
- **Size.** Large.
- **Engines.** ENG-001, ENG-002, ENG-003, ENG-004, ENG-020, ENG-021, ENG-024, ENG-027.
- **ADRs.** ADR-017, ADR-030, ADR-032.
- **Upstream.** SPR-MOD-001-005, SPR-MOD-001-008, SPR-MOD-001-009.
- **Exit.** A Super Admin can operate the entire Tenant estate end-to-end from the console; every action is audited to Platform audit; the console never renders Tenant business data outside an audited elevation.

## 3. Sprint Dependency Graph

```text
                       ┌────────────────────────────────────┐
                       │ SPR-MOD-001-001                    │
                       │ Platform & Tenant Provisioning     │
                       └───────────────┬────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
        ┌───────────────────┐ ┌──────────────────┐ ┌──────────────────┐
        │ SPR-002 Workspace │ │ SPR-005 Licensing│ │ SPR-008 Platform │
        │ & Organization    │ │                  │ │ Operations       │
        └─────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                  ▼                    │                    │
        ┌───────────────────┐          │                    │
        │ SPR-003 Identity  │          │                    │
        └─────────┬─────────┘          │                    │
                  ▼                    │                    │
        ┌───────────────────┐          │                    │
        │ SPR-004 Config    │          │                    │
        └─────────┬─────────┘          │                    │
                  ▼                    │                    │
        ┌───────────────────┐          │                    │
        │ SPR-006 Localiz.  │          │                    │
        └─────────┬─────────┘          │                    │
                  ▼                    │                    │
        ┌───────────────────┐          │                    │
        │ SPR-007 Workspace │          │                    │
        │ Services (logical)│          │                    │
        └─────────┬─────────┘          │                    │
                  ▼                    ▼                    ▼
                       ┌────────────────────────────────────┐
                       │ SPR-MOD-001-009 Audit & Compliance │
                       └───────────────┬────────────────────┘
                                       ▼
                       ┌────────────────────────────────────┐
                       │ SPR-MOD-001-010 Admin Console      │
                       └────────────────────────────────────┘
```

## 4. Engine Consumption Map

| Sprint | 001 | 002 | 003 | 004 | 005 | 006 | 017 | 020 | 021 | 024 | 025 | 027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-001 | ● | ● |   | ● |   |   |   |   |   | ● |   |   |
| SPR-002 | ● | ● |   | ● |   |   | ● |   |   | ● |   |   |
| SPR-003 | ● | ● | ● | ● |   |   |   |   |   | ● |   |   |
| SPR-004 |   | ● |   | ● | ● |   |   |   |   | ● |   |   |
| SPR-005 | ● | ● |   | ● |   |   |   |   |   | ● |   |   |
| SPR-006 |   |   |   | ● | ● | ● |   |   |   | ● |   |   |
| SPR-007 |   |   |   |   | ● | ● |   |   |   | ● | ● |   |
| SPR-008 | ● | ● |   | ● |   |   |   |   |   | ● | ● |   |
| SPR-009 |   |   |   | ● |   |   |   | ● | ● | ● | ● | ● |
| SPR-010 | ● | ● | ● | ● |   |   |   | ● | ● | ● |   | ● |

## 5. ADR Consumption Map

| Sprint | 017 | 011 | 014 | 025 | 026 | 030 | 032 | 035 | 036 | 065 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-001 | ● | ● | ● |   |   | ● | ● |   |   |   |
| SPR-002 | ● | ● |   |   |   |   |   |   |   |   |
| SPR-003 | ● |   | ● |   |   | ● | ● |   |   |   |
| SPR-004 | ● |   |   | ● | ● |   |   |   |   |   |
| SPR-005 | ● |   |   |   |   |   |   |   |   |   |
| SPR-006 | ● |   |   |   | ● |   |   |   |   |   |
| SPR-007 | ● |   |   | ● | ● |   |   |   |   |   |
| SPR-008 | ● | ● |   |   |   |   |   |   |   | ● |
| SPR-009 | ● |   | ● |   |   |   |   | ● | ● |   |
| SPR-010 | ● |   |   |   |   | ● | ● |   |   |   |

## 6. Risks & Assumptions

- **R1 — Proposed ADRs.** ADR-025, ADR-026, ADR-030, ADR-035, ADR-036, ADR-065 are `Proposed`. Assumption: each is `Accepted` before its consuming sprint enters Stage 2 authoring.
- **R2 — Provisioning vendor / topology.** No cloud vendor, database engine version, or replication topology is named. These are downstream decisions and gate SPR-008.
- **R3 — Connection routing.** The runtime pattern for routing a request to the Tenant database is a Sprint-2 authoring decision, gated by ADR-017 §Architectural Invariants.
- **R4 — Historical migration.** The transition from the pre-ADR-017 shared deployment to per-Tenant databases is a separate programme scoped outside these ten sprints.
- **R5 — License enforcement point.** SPR-005 defines the location of the enforcement point (upstream of Tenant DB connection); the specific runtime hook is a Sprint-authoring decision.

## 7. Module Completion Criteria

MOD-001 v2 is baseline-complete when all of the following are objectively true:

1. Every reserved sprint (`SPR-MOD-001-001` … `SPR-MOD-001-010`) is `Done`.
2. Every Sprint Exit Criterion in §2 is met at authoring time and remains met.
3. The Module PRD version at baseline is recorded and unchanged since Stage 2 began (or all amendments are traced).
4. Every ADR listed in §5 is `Accepted` at baseline time.
5. Downstream modules can consume MOD-001 v2 capabilities without additional coordination with Platform.
6. No sprint has ended with an unresolved architectural exception.

## 8. Non-Goals

- No Sprint PRDs are authored here; identifiers are **reservations**.
- No changes to ERP Core Engines, ADRs beyond ADR-017 registration, Module PRD scope, `SPRINT_CATALOG.md`, code, routes, packages, schemas, APIs, migrations, or UI.
- No commitment on delivery calendar; sizes are planning estimates only.

## 9. References

- [`../../11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`](../../11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md)
- [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md`](../../50-audit-reports/MOD001_V2_ARCHITECTURE_REFRESH_REPORT.md)
- [`./MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) *(superseded)*
