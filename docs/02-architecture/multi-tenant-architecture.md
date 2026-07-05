---
title: "Multi-Tenant Architecture"
summary: "Tenant definition, hierarchy, isolation strategy, row-level security philosophy, tenant lifecycle, cross-tenant operations, and data residency for the BusinessOS platform."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "multi-tenant", "pass-4b"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-architecture"
referenced_by: []
---

# Multi-Tenant Architecture

> Part of **Pass 4B — Data Foundation (Data Constitution)**. Defines *what a tenant is* in BusinessOS, how data is scoped to tenants, how tenants are isolated, and how tenant lifecycles are managed. Concrete RLS policies, DDL, and infrastructure choices are out of scope.

## Overview

BusinessOS is a single-platform, multi-tenant ERP. Every business decision — from schema shape to caching to backup — is made under the assumption that many independent tenants share the same runtime and data layer, and that each tenant's data is invisible and inaccessible to every other tenant unless an explicit, audited cross-tenant contract exists.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## What is a Tenant

A **tenant** is the top-level unit of ownership, isolation, billing, and administration in BusinessOS. A tenant represents a single customer of the platform — typically a business, group, or enterprise — and owns all users, organisations, companies, branches, configuration, transactional data, and derived analytical data created under it.

Key properties of a tenant:

- **Uniquely identified** — every tenant carries a stable, immutable identifier that appears on every tenant-scoped record.
- **Independently governed** — administrators, roles, and policies inside one tenant have no reach into another tenant.
- **Billing anchor** — commercial contracts, subscriptions, quotas, and metering attach to the tenant.
- **Lifecycle anchor** — provisioning, suspension, export, and deletion operate at the tenant granularity.
- **Data-residency anchor** — a tenant is the smallest unit that can be pinned to a specific geographic region.

## Tenant / Organization / Company / Branch Hierarchy

A tenant is not a flat container. Business entities inside a tenant form a hierarchy that mirrors real enterprise structure without collapsing tenants and organisations into the same concept.

```mermaid
flowchart TD
  T[Tenant]
  T --> O1[Organization]
  T --> O2[Organization]
  O1 --> C1[Company]
  O1 --> C2[Company]
  O2 --> C3[Company]
  C1 --> B1[Branch]
  C1 --> B2[Branch]
  C2 --> B3[Branch]
  C3 --> B4[Branch]
  C3 --> B5[Branch]

  classDef tenant fill:#0f172a,stroke:#94a3b8,color:#fff;
  classDef org fill:#1e293b,stroke:#64748b,color:#fff;
  classDef company fill:#334155,stroke:#94a3b8,color:#fff;
  classDef branch fill:#475569,stroke:#cbd5e1,color:#fff;
  class T tenant;
  class O1,O2 org;
  class C1,C2,C3 company;
  class B1,B2,B3,B4,B5 branch;
```

- **Tenant** — the isolation and commercial boundary. Everything below inherits its tenant identifier.
- **Organization** — an optional grouping layer for enterprises with multiple legal groups, holding structures, or brands under one tenant.
- **Company** — a legal entity. Accounting books, statutory filings, tax registrations, and fiscal years attach here.
- **Branch** — an operating location of a company. Inventory, sales, service, and payroll operations attach here.

A tenant with a single company and single branch is the common small-business shape; the hierarchy scales up without schema changes.

## Tenant-Scoped vs Globally Shared Data

Every entity in BusinessOS belongs to exactly one of these categories.

**Tenant-scoped data** — carries a mandatory tenant identifier; visible only within its tenant.
- All transactional data (vouchers, orders, ledgers, payroll runs, service tickets)
- All master data (customers, vendors, items, employees, warehouses)
- All configuration (charts of accounts, workflows, roles, permissions)
- All derived data (analytics rollups, notifications, documents)

**Globally shared data** — no tenant identifier; identical for every tenant.
- Reference data (countries, states, currencies, languages, units of measure, tax categories)
- Platform metadata (feature catalog, module registry, plan definitions)
- System catalogs (integration adapters, event type definitions)

Globally shared data is **read-only from a tenant's perspective**; only platform administrators can mutate it, and mutations follow a governed process (see Reference Data).

## Isolation Strategy

Isolation is enforced in layers so that a single failed layer cannot compromise the tenancy invariant.

1. **Identity layer** — every authenticated request carries a resolved tenant claim; there is no anonymous access to tenant data.
2. **Application layer** — every domain service accepts tenant scope as an explicit input and refuses ambiguous scope.
3. **Data layer** — every tenant-scoped query is filtered by tenant identifier via row-level security policies enforced by the database, not by application code.
4. **Cache layer** — cache keys embed tenant identifier; there is no shared-key path that could leak cross-tenant.
5. **Transport layer** — outbound integrations resolve tenant-specific credentials; a tenant cannot use another tenant's integration credentials.

Isolation model: **shared schema, tenant-column-scoped, RLS-enforced**. Dedicated schemas or dedicated databases per tenant are reserved for high-tier customers with regulatory or contractual demands and are handled as a deployment topology variant.

## Row-Level Security Strategy

Row-level security (RLS) is the enforcement mechanism that makes the tenancy invariant a data-layer fact rather than a coding convention.

- **Every tenant-scoped table has an RLS policy** that filters rows by the caller's resolved tenant identifier.
- **The tenant claim is set once per request** in the database session/context by the trusted request pipeline; domain code cannot forge it.
- **Bypass is a privileged, audited action** — only platform-level roles used by controlled infrastructure operations may bypass RLS, and every bypass is logged.
- **RLS is defence in depth**, not a substitute for correct application-layer scoping.
- **Global tables have no RLS** and are read-only for tenant sessions.
- Concrete policy DDL, role names, and enforcement mechanics live in downstream ADRs and implementation documents.

## Cross-Tenant Operations

Cross-tenant access is a deliberate, narrow, and audited concept — not a convenience.

**Legitimate cross-tenant scenarios:**
- Platform administration and support (with explicit, time-bounded elevation and audit trail).
- Aggregated platform metrics computed over anonymised or pre-aggregated derivations.
- Marketplace or partner scenarios where two tenants have signed a mutual data-sharing contract; sharing occurs through explicit exported artifacts, not shared tables.
- Tenant migration and merge operations.

**Rules for cross-tenant operations:**
- Never through direct table joins.
- Always through explicit APIs or event exports with a documented contract.
- Always with an audit record naming actor, purpose, scope, and time window.
- Never as an implicit side effect of feature code.

## Tenant Lifecycle

Every tenant progresses through an explicit lifecycle. Each transition is event-generating, audited, and reversible where the business rules permit.

```text
requested → provisioning → active → suspended → deactivated → exported → archived → purged
```

- **Requested** — a tenant is proposed (self-serve signup, sales-led onboarding, migration import).
- **Provisioning** — infrastructure, default configuration, seed reference data, and initial administrator are prepared.
- **Active** — full read/write; billed; monitored.
- **Suspended** — read-only or gated access, typically for payment issues or policy holds; reversible.
- **Deactivated** — administrator-initiated deactivation; no user access; data retained for the contractual grace window.
- **Exported** — a full, portable export of the tenant's data is produced and delivered per contract.
- **Archived** — hot storage removed; data retained in cold form for the statutory retention window; restore possible with defined RTO.
- **Purged** — controlled, logged, non-reversible destruction after all retention obligations are met; only anonymised metadata survives for platform accounting.

## Data Residency

- **A tenant is pinned to a residency zone at provisioning time.**
- **All primary storage, backups, and analytical derivations for that tenant remain within its zone**, subject to documented exceptions (e.g. anti-abuse services).
- **Zone changes are migration events**, not runtime toggles.
- **Cross-zone platform operations** (billing, support tooling, aggregated metrics) either operate on anonymised derivations or are executed inside the tenant's zone.
- Concrete zone list, replication rules, and legal mappings live in commercial and compliance documentation.

## Tenancy Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Concrete RLS policy patterns and DDL | Coupled to database engine choice | Pass 4C / ADR | Platform |
| Dedicated-schema and dedicated-database tiers | Depends on enterprise contracts | Commercial pass | Product + Platform |
| Session/claim propagation mechanism | Coupled to auth architecture | Pass 4C / Security | Security |
| Tenant-migration tooling and cutover procedure | Depends on operational scale | Post-pilot | Platform |
| Cross-tenant marketplace contract shape | Depends on partner scenarios | Later pass | Product |
| Data-residency zone catalog | Depends on target markets | Commercial pass | Product |
| Grace-window durations per lifecycle stage | Commercial/legal decision | Commercial pass | Product + Legal |

## Conforms to Canon

- **Canon: Tenancy is a first-class invariant** — every non-global record is tenant-scoped and RLS-enforced.
- **Canon: No shared mutable global state per tenant** — globals are governed reference data; tenants cannot mutate them.
- **Canon: Auditability** — every cross-tenant or privileged bypass is logged with actor, purpose, and time.
- **Canon: Vendor Neutrality** — no database, IAM provider, or infrastructure vendor is named.
- **Canon: Deferred Decisions Are Named** — every open topic appears in *Tenancy Decisions Pending* with an ADR pointer.

## References

- Master Architecture — platform layers and boundaries.
- Domain-Driven Design — bounded contexts and cross-domain contracts.
- Domain Map — Foundation domain (Tenant, Organization, Company, Branch) and consumers.
- Database Architecture — data principles and lifecycle.
- Database Standards — tenant column conventions and audit fields.
- Data Dictionary — canonical Tenant/Organization/Company/Branch definitions.
- Reference Data — globally shared, tenant-read-only catalogs.
