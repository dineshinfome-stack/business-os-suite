---
title: "Hierarchy Formalization Report — Platform → Tenant → Workspace → Company"
summary: "Records ADR-008 adoption, doc updates, terminology mapping, invariants, non-goals, implementation guidance, and promotion criteria."
layer: "audit"
owner: "Platform Architecture"
status: "final"
updated: "2026-07-24"
version: "1.0"
tags: ["audit", "adr-008", "hierarchy", "workspace", "tenant"]
document_type: "Audit Report"
---

# Hierarchy Formalization Report — 20260724T160647Z

## Scope

Documentation, navigation labels, and a lightweight logical accessor. **No schema
changes, no data migration, no RBAC changes, no route path changes.** Executes
the approved plan under `.lovable/plan.md`.

## Deliverables Landed

| # | Artifact | Path |
| - | -------- | ---- |
| 1 | New ADR | `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md` |
| 2 | Architecture update | `docs/02-architecture/multi-tenant-architecture.md` (Hierarchy section + mermaid) |
| 3 | Governance update | `docs/15-governance/TENANCY_STANDARD.md` (Terminology section + org-scoping clarification) |
| 4 | Glossary update | `docs/glossary.md` (Platform, Tenant, Workspace, Company, Branch, Financial Year) |
| 5 | Glossary Index update | `docs/GLOSSARY_INDEX.md` (Workspace + Platform rows pointing to ADR-008) |
| 6 | Runtime accessor | `src/lib/workspace/current-workspace.ts` (`useCurrentWorkspace`, `getCurrentWorkspace`) |
| 7 | Navigation keywords | `src/lib/navigation/registry.ts` (additive keyword refinements only) |

## Terminology Mapping

| Concept        | Current Physical Representation                                              |
| -------------- | ---------------------------------------------------------------------------- |
| Platform       | Application                                                                  |
| Tenant         | `public.tenants`                                                             |
| Workspace      | Logical business container derived from Tenant context (1:1 today; no table) |
| Company        | `public.organizations`                                                       |
| Branch         | `public.branches`                                                            |
| Financial Year | `public.financial_years`                                                     |

## Architectural Invariant (from ADR-008)

- Every Tenant has exactly one logical Workspace.
- A logical Workspace cannot exist without a Tenant.
- A Company belongs to exactly one Tenant. The logical Workspace represents
  that Tenant's business container and does not introduce an additional
  ownership boundary.

## Non-Goals (from ADR-008)

This ADR does not: introduce a new persistence model, modify authentication,
redefine tenant isolation, change company ownership, alter existing APIs, or
require application code to distinguish Tenant and Workspace separately.

## Implementation Guidance (from ADR-008)

Until a future ADR promotes Workspace to a physical entity:

- Tenant remains the only persistence-level isolation boundary.
- Existing APIs continue to accept Tenant identifiers.
- Workspace terminology may be used in UI, documentation, and application
  services only as a logical abstraction.
- New persistence models must not introduce workspace identifiers without an
  approved ADR.
- **Workspace configuration is currently represented by the Tenant's existing
  configuration and settings. No separate Workspace configuration store or
  persistence model exists until a future ADR explicitly introduces one.**

## Promotion Criteria

Promote Workspace to a physical table via a follow-up ADR only when at least
one of the following becomes a firm requirement:

- More than one Workspace per Tenant.
- Workspace-level branding/settings distinct from Tenant.
- Workspace-scoped integrations or feature flags that Tenant/Company cannot
  express.

## Verification

- ✅ No files added under `supabase/migrations/`.
- ✅ No changes to RLS policies, permission manifest, or route file paths.
- ✅ `src/lib/workspace/current-workspace.ts` imports only from
  `@/hooks/tenants/useCurrentTenant`; no new package dependencies.
- ✅ `rg` sweeps confirm no new `workspaceId` schema column, no FK to a
  `workspaces` table, no persisted `workspace_id` writes, and no new
  "workspace settings" / "workspace configuration" store introduced.
- ✅ Repository-wide references to "Workspace" remain consistent with the
  terminology mapping (logical container; no independent table).
- ✅ Sidebar renders the refined keywords; existing routes, breadcrumbs, and
  command palette behavior unchanged.

## Regression Checklist

| Item | Result |
| ---- | ------ |
| Existing tenant routes | Unchanged |
| Existing company routes | Unchanged |
| Existing `/workspace/*` routes | Unchanged |
| Breadcrumb behavior | Unchanged |
| Command palette behavior | Unchanged |
| Sidebar groups & display_order | Unchanged |
| Permission manifest | Unchanged |
| Auth flow | Unchanged |
| AppShell | Unchanged |
| RLS policies | Unchanged |
| `requireOrgContext` | Unchanged |

## References

- `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md`
- `docs/15-governance/TENANCY_STANDARD.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `src/lib/workspace/current-workspace.ts`
