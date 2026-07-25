---
title: "Tenancy Standard"
summary: "Multi-tenant isolation rules under ADR-017 (dedicated database per Tenant). Every business table, connection, and server function must obey them."
layer: "governance"
owner: "Platform"
status: "approved"
updated: "2026-07-25"
version: "2.0"
tags: ["governance", "database", "multi-tenant", "adr-017"]
document_type: "Standard"
supersedes: "Tenancy Standard v1.0 (shared-schema posture)"
aligned_to: "ADR-017"
---

# Tenancy Standard v2.0

## Purpose

Establish the tenant-isolation contract for the Business OS platform under **ADR-017 — Dedicated Database per Tenant Architecture**. Every Tenant business table lives in that Tenant's dedicated database; every server function that reads or writes business data MUST resolve a Tenant-scoped connection before it runs. Cross-tenant reads or writes are a P1 security defect and, under ADR-017, structurally impossible for correctly written code paths.

## Terminology (ADR-017, supersedes ADR-009)

The conceptual hierarchy is **Platform → Tenant → [Dedicated Database + Logical Workspace] → Company → Branch / Financial Year**.

- **Tenant** is the persistence and administration boundary. One Tenant = one dedicated database.
- **Workspace** is reintroduced as a **logical, non-persistent container** within a Tenant — no `workspaces` table, no `workspace_id` column, no independent configuration store. It is a naming and navigation construct only.
- **Company** is the primary company-scoping key **within** a Tenant database, still backed by `public.organizations`.

See `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`.

| Concept        | Physical Representation |
| -------------- | --------------------------------- |
| Platform       | Application + Platform database   |
| Tenant         | Dedicated Tenant database (row in Platform `public.tenants` registry) |
| Workspace      | Logical (non-persistent)          |
| Company        | `public.organizations` (in Tenant DB) |
| Branch         | `public.branches` (in Tenant DB)  |
| Financial Year | `public.financial_years` (in Tenant DB) |

> `organization_id` remains the primary **company-scoping** key **within** a Tenant database. It does not define the Tenant isolation boundary; the Tenant database itself does.

## Rules

### R1 — Every business table carries `organization_id`

Inside a Tenant database, every table that stores company-owned business data MUST include:

```sql
organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE
```

Foundation tables that are inherently user-scoped and not company-scoped
(`public.profiles`, `public.user_roles`, `public.audit_logs`) are exempt.

### R2 — Within-Tenant RLS is defense-in-depth

Under ADR-017 the **primary** tenant boundary is the dedicated database, not RLS. Inside a Tenant database, RLS remains the enforcement mechanism for **within-Tenant** scoping (Company, Branch, User, role). Policies MUST use `private.fn_is_org_member(auth.uid(), organization_id)` for read paths and `private.fn_org_role(auth.uid(), organization_id)` for write-permission decisions. RLS in the Platform database follows the historical ADR-011 posture for platform metadata.

### R3 — Server functions resolve org context via `requireOrgContext`

Server functions that touch tenant data MUST use `requireOrgContext` middleware (from `src/integrations/supabase/org-middleware.ts`) instead of accepting `organizationId` as caller-supplied input. Under ADR-017, the middleware chain additionally MUST resolve a **Tenant-scoped database connection** before handler execution; the concrete connection-routing middleware is delivered by the sprint sequence in `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md`.

### R4 — Never accept `organizationId` or `tenantId` from client payloads

Client callers select the current organization via the org-switcher (`setCurrentOrganization` server fn), which writes the cookie server-side after verifying membership. Tenant identity is resolved server-side from the authenticated session and Platform registry, never from the request body.

### R5 — Cascade on organization delete

FKs to `public.organizations(id)` MUST use `ON DELETE CASCADE` so that company deletion removes all owned rows atomically. Soft-delete on the `organizations` row (setting `deleted_at`) is the normal path; hard delete is reserved for company off-boarding within a Tenant. Tenant off-boarding is a separate, higher-privileged operation that drops the entire Tenant database and is scoped to the Platform Admin surface.

### R6 — No cross-Tenant queries (new under ADR-017)

Application code MUST resolve exactly one Tenant-scoped database connection per request. No code path — server function, background job, report, or admin tool — may hold connections to two Tenant databases simultaneously for a business read or write. Cross-tenant platform metrics MUST operate on anonymised or pre-aggregated derivations produced inside each Tenant database and delivered to the Platform layer.

## Enforcement

- Migrations that introduce a business table without `organization_id` + within-Tenant RLS MUST be rejected in review.
- Server functions that touch tenant data without `requireOrgContext` + Tenant-scoped connection resolution MUST be rejected in review.
- Any code that opens a second Tenant DB connection in the same request scope MUST be rejected in review.
- The Wave 0 verification report includes a check that every non-foundation public table has an `organization_id` column and org-scoped policies. The MOD-001 v2 sprint programme adds a per-request connection-routing check.

## Related

- `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`
- `docs/11-adrs/architecture/ADR-009-workspace-retirement.md` (superseded by ADR-017)
- `docs/11-adrs/data/ADR-011-multi-tenant-isolation.md` (Platform database only)
- `docs/15-governance/DATABASE_STANDARD.md`
- `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`
- `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v2.md`
- `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md`

