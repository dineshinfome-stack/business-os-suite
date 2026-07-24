# Formalize Platform → Tenant → Workspace → Company Hierarchy

Adopt the conceptual hierarchy without introducing a `workspaces` table. Workspace stays a **logical construct derived from the Tenant context and associated configuration** — represented through docs, navigation labels, and a thin runtime accessor. Current sprint work (Companies / Branches / Financial Years under `organizations`) stays untouched.

## Scope

Documentation, navigation labels, and a lightweight logical accessor only. No schema changes, no data migration, no RBAC changes, no route path changes.

## Deliverables

### 1. Governance / Architecture docs

- **New ADR:** `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md`
  - Records the 5-level conceptual hierarchy (Platform → Tenant → Workspace → Company → Branch/FY).
  - Decision: Workspace is a **logical construct derived from the Tenant context and associated configuration**. Its physical representation may evolve through a future ADR if promotion criteria are met.
  - Ownership chain, authentication flow, and licensing scope (License attaches to Tenant, not Company).
  - **Architectural Invariant** (verbatim in the ADR):
    - Every Tenant has exactly one logical Workspace.
    - A logical Workspace cannot exist without a Tenant.
    - A Company belongs to exactly one Tenant. The logical Workspace represents that Tenant's business container and does not introduce an additional ownership boundary.
  - **Non-Goals** (verbatim in the ADR). This ADR does not:
    - introduce a new persistence model
    - modify authentication
    - redefine tenant isolation
    - change company ownership
    - alter existing APIs
    - require application code to distinguish Tenant and Workspace separately
  - **Implementation Guidance** (verbatim in the ADR). Until a future ADR promotes Workspace to a physical entity:
    - Tenant remains the only persistence-level isolation boundary.
    - Existing APIs continue to accept Tenant identifiers.
    - Workspace terminology may be used in UI, documentation, and application services only as a logical abstraction.
    - New persistence models must not introduce workspace identifiers without an approved ADR.
    - **Workspace configuration is currently represented by the Tenant's existing configuration and settings. No separate Workspace configuration store or persistence model exists until a future ADR explicitly introduces one.**
  - **Non-binding future principle:** Any future promotion of Workspace to a physical entity should preserve backward compatibility for existing Tenant-scoped APIs wherever practical.
  - Promotion criteria (see below).
- **Update** `docs/02-architecture/multi-tenant-architecture.md` — insert the Workspace layer between Tenant and Company; note it is logical today.
- **Update** `docs/15-governance/TENANCY_STANDARD.md` — add a "Terminology" section (mapping table below). R1–R5 rules unchanged. Include this clarification verbatim:
  > `organization_id` remains the primary **company-scoping** key within a Tenant's logical Workspace. It does not replace or redefine the Tenant isolation boundary.
- **Update** `docs/GLOSSARY_INDEX.md` / `docs/glossary.md` with Platform, Tenant, Workspace, Company, Branch, Financial Year definitions plus the "Workspace is logical" note and the configuration clarification.

**Terminology mapping (included verbatim in TENANCY_STANDARD and the ADR):**

| Concept        | Current Physical Representation                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| Platform       | Application                                                                        |
| Tenant         | `public.tenants`                                                                   |
| Workspace      | Logical business container derived from Tenant context (1:1 today; no table)       |
| Company        | `public.organizations`                                                             |
| Branch         | `public.branches`                                                                  |
| Financial Year | `public.financial_years`                                                           |

### 2. Navigation & labels (presentation-only)

- `docs/_meta.json` and `src/lib/navigation/registry.ts`: refine labels/tooltips so the sidebar reads the conceptual hierarchy (Super Admin → Workspace → Companies → Branches → Financial Years → Users/Roles/Settings/AI/Modules).
- **Explicitly:** Navigation labels reflect the conceptual hierarchy only. Route paths, `nav_id` values, permission gates, ownership, and routing behavior remain unchanged.

### 3. Logical Workspace accessor (thin, no schema)

- Add `src/lib/workspace/current-workspace.ts` exporting `getCurrentWorkspace()` returning:

  ```ts
  { tenantId: string; workspaceKey: string; name: string }
  ```

  where `workspaceKey === tenantId`.

- **Contract (documented in the file header and the ADR):**
  - `workspaceKey` is an alias of the Tenant identifier for compatibility only. It is **not** a separately persisted identifier and must **never** be stored independently, used as a foreign key, or referenced in a schema column.
  - `getCurrentWorkspace()` MUST be a pure accessor over the existing tenant context. It MUST NOT introduce caching, persistence, network requests, or an alternate context-resolution path. It reads from the same source that `useCurrentTenant` / `org-middleware` already use.
  - No new dependencies; no changes to `org-middleware`, RLS, query keys, or the auth flow.

### 4. Sprint report

- `docs/50-audit-reports/HIERARCHY_FORMALIZATION_REPORT_<ts>.md` summarizing the ADR, doc updates, terminology mapping, invariant, non-goals, implementation guidance (including the configuration clarification), and promotion criteria.

## Promotion Criteria (recorded in ADR, not built now)

Promote Workspace to a physical table when any of these becomes a firm requirement:
- More than one Workspace per Tenant
- Workspace-level branding/settings distinct from Tenant
- Workspace-scoped integrations or feature flags that Tenant/Company cannot express

## Explicitly Out of Scope

- No `workspaces` table, migration, or FK rework.
- No separate Workspace configuration store, settings namespace, or subsystem.
- No changes to `organizations`, `organization_members`, RLS, or `requireOrgContext`.
- No RBAC / permission key changes.
- No Licensing table (Tenant-scoped concept documented only).
- No route path changes (`/workspace/*` stays as-is).
- No caching layer, new context provider, or new query keys for the accessor.

## Verification

- No files added under `supabase/migrations/`.
- No changes to RLS policies, permission manifest, or route file paths.
- `getCurrentWorkspace()` imports only from existing tenant/org context modules; no new package dependencies.
- `rg` sweeps confirm: no new `workspaceId` column references, no FK to a `workspaces` table, no persisted `workspace_id` writes, no new "workspace settings" / "workspace configuration" store.
- Repository-wide references to "Workspace" remain consistent with the terminology mapping.
- `tsgo --noEmit` clean; existing tests continue to pass.
- Sidebar renders the refined labels; existing routes, breadcrumbs, and command palette behavior unchanged (regression checklist in the completion report).
