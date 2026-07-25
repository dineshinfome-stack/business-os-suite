---
title: "ADR-017 — Dedicated Database per Tenant Architecture"
summary: "Adopts one dedicated database per Tenant as the persistence boundary and reintroduces Workspace as a logical (non-persistent) container. Supersedes ADR-009."
layer: "architecture"
owner: "Platform Architecture"
status: "accepted"
updated: "2026-07-25"
version: "1.0"
tags: ["adr", "architecture", "multi-tenant", "database", "workspace", "hierarchy"]
document_type: "ADR"
category: "Data / Architecture"
supersedes: "ADR-009"
superseded_by: ""
related_adrs: ["ADR-008", "ADR-009", "ADR-011", "ADR-014", "ADR-030", "ADR-032"]
---

# ADR-017 — Dedicated Database per Tenant Architecture

## Status

Accepted — 2026-07-25.

Supersedes **ADR-009 — Workspace Retirement** and evolves the isolation posture previously described in **ADR-011 — Multi-Tenant Isolation** (shared-schema, RLS-enforced) for the Platform bounded context.

## Numbering Note

ADR-010 was already assigned to **PostgreSQL as System of Record** at the time this decision was authored. Because ADR identifiers are permanent, this decision is registered as **ADR-017** in the next free slot within the Data / Architecture range while remaining the direct successor to ADR-009 in the Workspace/Tenant hierarchy chain (ADR-008 → ADR-009 → ADR-017).

## Context

The Business OS platform has evolved through three architectural formulations of the Tenant / Workspace / Company relationship:

- **ADR-008** — Introduced *Workspace* as a logical business container inside a Tenant, 1:1 with Tenant, with no persistence.
- **ADR-009** — Retired *Workspace* as a domain concept and made *Tenant* the sole business container above *Company*, on the grounds that Workspace introduced no persistence and no additional invariants.
- **ADR-011** — Established the historical isolation model as **shared schema, tenant-column-scoped, RLS-enforced** across all tenants sharing one database.

Two forces now change the picture:

1. **Regulatory, contractual, and operational requirements** for enterprise tenants (data residency, backup/restore isolation, per-tenant recovery-point objectives, per-tenant compliance boundaries, per-tenant performance envelopes, and per-tenant schema-version drift during phased upgrades) can no longer be satisfied by a single shared database governed only by RLS.
2. **Product terminology and UX** need a stable, non-persistent surface — "Workspace" — under which every business capability visible to a Tenant is organised (Companies, Branches, Financial Years, Users, Roles, Permissions, Settings, AI Workspace, Modules). Retiring the term made the product surface harder to reason about even though the domain model remained coherent.

This ADR therefore replaces the shared-database posture for tenant business data with a **dedicated-database-per-Tenant** posture and **reintroduces Workspace as a logical (non-persistent) container** derived from Tenant context. Workspace remains without a table, without an independent identifier, and without an independent configuration store; it is a naming and navigation construct only.

## Decision

Adopt the following platform architecture as the Business OS baseline.

```text
Platform
└── Super Admin
     │
     ├── Tenant
     │      │
     │      ├── Dedicated Database  (persistence boundary)
     │      │
     │      └── Logical Workspace  (non-persistent)
     │             │
     │             ├── Companies
     │             ├── Branches
     │             ├── Financial Years
     │             ├── Users
     │             ├── Roles
     │             ├── Permissions
     │             ├── Settings
     │             ├── AI Workspace
     │             └── Business Modules
```

### Architectural Invariants

1. Every Tenant owns **exactly one** dedicated database.
2. Every Tenant owns **exactly one** logical Workspace.
3. The **Workspace introduces no persistence boundary** — no `workspaces` table, no `workspace_id` column, no independent configuration store.
4. **Tenant is the persistence boundary.** The dedicated database is the enforcement mechanism.
5. Every **Company belongs to exactly one Tenant**; every **Branch and Financial Year belongs to exactly one Company**.
6. The **Platform database stores platform metadata only** — tenant registry, platform users, licenses, subscriptions, platform audit, provisioning state, connection routing. It stores **no tenant business data**.
7. **Business data exists only inside Tenant databases.** No cross-tenant table joins are possible by construction.

### Platform vs Tenant Database Responsibilities

| Concern | Platform Database | Tenant Database |
| --- | --- | --- |
| Tenant registry (slug, display name, region, lifecycle state) | ✔ | — |
| Tenant → Database routing metadata | ✔ | — |
| Platform users and Super Admin roles | ✔ | — |
| License, subscription, plan limits, entitlements | ✔ | — |
| Platform audit (provisioning, licensing, elevation, cross-tenant admin actions) | ✔ | — |
| Companies, Branches, Financial Years | — | ✔ |
| Tenant users, roles, permission grants | — | ✔ |
| Tenant configuration and feature flags | — | ✔ |
| Tenant audit (business events) | — | ✔ |
| All business module data (Accounting, Sales, Inventory, …) | — | ✔ |

### Authentication Flow

```text
Platform Login
      │
      ▼
Tenant Resolution   (Platform DB: identify tenant from credential / route / claim)
      │
      ▼
Dedicated Database Connection   (route to that tenant's DB using registry metadata)
      │
      ▼
Workspace                    (logical container — no DB call)
      │
      ▼
Company                      (Tenant DB)
      │
      ▼
Modules                      (Tenant DB)
```

Super Admins authenticate against the Platform database and do not connect to a Tenant database except through an explicit, audited, time-bounded elevation.

### Licensing Model

- **Licenses attach to the Tenant.**
- Licenses do **not** attach to a Company, a Branch, or a Workspace.
- License records live in the Platform database.
- License enforcement points evaluate the Tenant claim before any Tenant database connection is made.

## Migration / Transition Posture

This ADR ratifies the architecture. It does **not** author:

- migration scripts,
- provisioning tooling,
- connection routing code,
- backup topology,
- license enforcement code,
- schema changes to existing tables,
- data movement plans.

Each of those is scoped to the sprint sequence published in **MOD-001 Sprint Plan v2.0** and gated behind separate Architecture Board approvals per phase.

Until the first Tenant is provisioned onto its own database under this ADR, the historical shared-schema deployment remains operational. The transition is a controlled multi-sprint programme; nothing in this ADR obliges an immediate cutover.

## Promotion Criteria (Workspace → Physical)

Workspace remains logical. Promotion to a physical entity requires a follow-up ADR **and** at least one of:

- more than one Workspace per Tenant becomes a firm requirement;
- Workspace-level branding or settings genuinely distinct from Tenant become a firm requirement;
- Workspace-scoped integrations or feature flags that Tenant/Company cannot express become a firm requirement.

Absent one of those, Workspace stays logical.

## Non-Goals

- No `workspaces` table is introduced by this ADR.
- No schema migration is authorised by this ADR.
- No changes to authentication, RBAC, RLS, API, navigation, or source code are authorised by this ADR.
- No vendor, cloud region, database engine version, or replication topology is named. Those belong to downstream ADRs and provisioning documentation.

## Consequences

**Positive**

- Data residency and per-tenant compliance boundaries become enforceable at the database level, not the row level.
- Backup, restore, and disaster recovery operate at the tenant granularity.
- Per-tenant schema-version drift is possible during phased upgrades.
- Cross-tenant data leakage through an application bug becomes impossible by construction — there is no shared table to leak from.
- Workspace is restored as a stable, non-persistent product surface without adding a persistence concept.

**Neutral**

- Application code that previously assumed a single database connection must resolve a Tenant-scoped connection. This is a routine per-request concern and is scoped to a later sprint.
- ADR-011 remains part of the historical record; the Platform database itself continues to use a single-schema deployment and the ADR-011 posture still applies to Platform metadata tables.

**Negative**

- Provisioning cost per Tenant increases (one database per Tenant).
- Platform operations (monitoring, backup, upgrades, cost accounting) must be tenant-aware.
- Cross-tenant reporting for platform metrics must operate on anonymised or pre-aggregated derivations produced inside each Tenant database and delivered to the Platform layer.

## Alternatives Considered

1. **Keep the shared-schema, RLS-enforced model (ADR-011 as-is).** Rejected — cannot satisfy per-tenant residency, per-tenant DR, or per-tenant schema drift; leaves cross-tenant leakage as a code-review concern rather than an architectural impossibility.
2. **Dedicated schema per Tenant inside one database.** Rejected — retains a single point of failure and a single backup/restore boundary; does not satisfy residency; complicates per-tenant upgrades only marginally less than dedicated databases.
3. **Retain ADR-009 (no Workspace).** Rejected — the product surface benefits from a stable non-persistent Workspace concept; removing it made the UX and navigation harder to reason about even though the domain model was coherent.
4. **Reintroduce Workspace as a physical entity now.** Rejected — no current requirement in the Promotion Criteria is met; adding a `workspaces` table would create a second source of truth for Tenant-scoped configuration.

## References

- `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md`
- `docs/11-adrs/architecture/ADR-009-workspace-retirement.md`
- `docs/11-adrs/data/ADR-011-multi-tenant-isolation.md`
- `docs/11-adrs/data/ADR-014-audit-strategy.md`
- `docs/11-adrs/security/ADR-030-authentication-model.md`
- `docs/11-adrs/security/ADR-032-rbac-abac.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `docs/15-governance/TENANCY_STANDARD.md`
- `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`
- `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md`
