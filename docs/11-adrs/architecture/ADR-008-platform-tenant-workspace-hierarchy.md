---
title: "ADR-008 — Platform → Tenant → Workspace → Company Hierarchy (SUPERSEDED)"
summary: "Superseded by ADR-009. Workspace has been retired as a domain concept; Tenant is now the sole business container."
layer: "architecture"
owner: "Platform Architecture"
status: "superseded"
updated: "2026-07-24"
version: "1.1"
tags: ["adr", "architecture", "multi-tenant", "hierarchy", "superseded"]
document_type: "ADR"
supersedes: ""
superseded_by: "ADR-009"
---

> **This ADR is superseded by [ADR-009 — Workspace Retirement](./ADR-009-workspace-retirement.md).**
> Workspace has been removed as a domain concept. Read ADR-009 for the current hierarchy (Platform → Tenant → Company → Branch).

# ADR-008 — Platform → Tenant → Workspace → Company Hierarchy



## Status

Accepted — 2026-07-24.

## Context

The Business OS platform has organically accumulated three overlapping terms — **Tenant**, **Workspace**, and **Company/Organization** — used inconsistently across documentation, UI labels, and code. The physical implementation today is:

- `public.tenants` — the tenant isolation boundary (see `TENANCY_STANDARD.md`).
- `public.organizations` — the "company" (a legal entity within a tenant).
- `public.branches`, `public.financial_years` — child entities of a company.

No `workspaces` table exists, and no ADR has previously named where "Workspace" sits in the model. UI and docs use "Workspace" in several senses (the `/workspace` route, the workspace hub, the "AI Workspace" module), which risks a future contributor introducing a separate `workspaces` table or a parallel "workspace configuration" subsystem before it is actually needed.

This ADR fixes the conceptual hierarchy and Workspace's role in it without changing any schema, RLS, API, or route behavior.

## Decision

Adopt the following conceptual hierarchy:

```text
Platform
│
├── Super Admin
│
└── Tenant
     │
     └── Workspace (logical business container)
           │
           ├── Company
           │     ├── Branch
           │     └── Financial Year
           │
           ├── Users
           ├── Roles
           ├── Settings
           ├── AI Workspace
           ├── Modules
           └── Reports
```

**Workspace is a logical construct derived from the Tenant context and associated configuration.** Its physical representation may evolve through a future ADR if the promotion criteria below are met. Until then, Workspace has no table, no independent identifier, and no independent configuration store.

### Terminology mapping

| Concept        | Current Physical Representation                                              |
| -------------- | ---------------------------------------------------------------------------- |
| Platform       | Application                                                                  |
| Tenant         | `public.tenants`                                                             |
| Workspace      | Logical business container derived from Tenant context (1:1 today; no table) |
| Company        | `public.organizations`                                                       |
| Branch         | `public.branches`                                                            |
| Financial Year | `public.financial_years`                                                     |

### Ownership, authentication, and licensing

- **Ownership chain:** Every tenant-scoped record is owned by a Tenant. Companies (`organizations`) belong to exactly one Tenant. Branches and Financial Years belong to exactly one Company. Workspace does not introduce a new ownership link.
- **Authentication flow:** Authentication resolves the caller's Tenant claim, exactly as today. No Workspace claim exists.
- **Licensing scope:** Licenses attach to the Tenant, not to a Company or a Workspace. This is documented here for terminology; no Licensing table is introduced by this ADR.

## Architectural Invariant

- Every Tenant has exactly one logical Workspace.
- A logical Workspace cannot exist without a Tenant.
- A Company belongs to exactly one Tenant. The logical Workspace represents that Tenant's business container and does not introduce an additional ownership boundary.

## Non-Goals

This ADR does not:

- introduce a new persistence model
- modify authentication
- redefine tenant isolation
- change company ownership
- alter existing APIs
- require application code to distinguish Tenant and Workspace separately

## Implementation Guidance

Until a future ADR promotes Workspace to a physical entity:

- Tenant remains the only persistence-level isolation boundary.
- Existing APIs continue to accept Tenant identifiers.
- Workspace terminology may be used in UI, documentation, and application services only as a logical abstraction.
- New persistence models must not introduce workspace identifiers without an approved ADR.
- **Workspace configuration is currently represented by the Tenant's existing configuration and settings. No separate Workspace configuration store or persistence model exists until a future ADR explicitly introduces one.**

**Non-binding future principle:** Any future promotion of Workspace to a physical entity should preserve backward compatibility for existing Tenant-scoped APIs wherever practical.

### Runtime accessor

A thin logical accessor lives at `src/lib/workspace/current-workspace.ts` and exports `getCurrentWorkspace()` returning `{ tenantId, workspaceKey, name }`, where `workspaceKey === tenantId`. Contract:

- `workspaceKey` is an alias of the Tenant identifier for compatibility only. It is **not** a separately persisted identifier and must **never** be stored independently, used as a foreign key, or referenced in a schema column.
- The accessor is a pure read over the existing tenant context. It MUST NOT introduce caching, persistence, network requests, or an alternate context-resolution path.

## Promotion Criteria

Promote Workspace to a physical table via a follow-up ADR only when at least one of the following becomes a firm requirement:

- More than one Workspace per Tenant.
- Workspace-level branding/settings distinct from Tenant.
- Workspace-scoped integrations or feature flags that Tenant/Company cannot express.

## Consequences

- **Positive:** A single, unambiguous conceptual model shared by docs, UI, and code. No schema churn. Future promotion path is explicit and gated.
- **Neutral:** UI, documentation, and application services may use "Workspace" as a logical abstraction, but every backing identifier is still a `tenant_id` or `organization_id`.
- **Negative:** Contributors must resist the temptation to add a `workspaces` table, a `workspace_id` column, or a separate workspace-configuration store before the promotion criteria are met. Enforced in review.

## Alternatives Considered

1. **Merge Tenant and Workspace into a single concept.** Rejected — the two terms already exist across docs and UI; forcing a rename would break persisted vocabulary (module names, route paths, nav_ids) without benefit.
2. **Create a physical `workspaces` table now.** Rejected — no current requirement justifies it; introduces schema churn, migration risk, and a second source of truth for tenant-scoped configuration.
3. **Remove "Workspace" from the vocabulary entirely.** Rejected — the term is embedded in modules (AI Workspace), routes (`/workspace`), and product surface; removing it would be more disruptive than formalizing it.

## References

- `docs/15-governance/TENANCY_STANDARD.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md`
- `src/lib/workspace/current-workspace.ts`
