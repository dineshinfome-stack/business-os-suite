---
title: "Tenancy Standard"
summary: "Multi-tenant data isolation rules that every business table and server function must follow."
layer: "governance"
owner: "Platform"
status: "approved"
updated: "2026-07-22"
version: "1.0"
tags: ["governance", "database", "multi-tenant"]
document_type: "Standard"
supersedes: ""
---

# Tenancy Standard v1.0

## Purpose

Establish the tenant-isolation contract for the Business OS platform. Every
business table and every server function that reads or writes business data
MUST enforce organization scoping. Cross-tenant reads or writes are a P1
security defect.

## Model

- **Tenant unit:** `public.organizations` row (one organization = one tenant).
- **Membership:** `public.organization_members(organization_id, user_id, role, status)`.
- **Roles:** `owner | admin | member` (`public.org_role`).
- **Statuses:** `active | invited | suspended` (`public.org_member_status`).
- **Personal org:** auto-provisioned on signup by `private.fn_handle_new_auth_user`.

## Rules

### R1 — Every business table carries `organization_id`

Every table that stores tenant-owned business data MUST include:

```sql
organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE
```

Foundation tables that are inherently user-scoped and not tenant-scoped
(`public.profiles`, `public.user_roles`, `public.audit_logs`) are exempt.

### R2 — Org-scoped RLS on every business table

RLS policies MUST use `private.fn_is_org_member(auth.uid(), organization_id)`
for read paths and `private.fn_org_role(auth.uid(), organization_id)` for
write-permission decisions. Direct `auth.uid()`-only checks are not
sufficient — they leak cross-tenant data to any authenticated user.

### R3 — Server functions resolve org context via `requireOrgContext`

Server functions that touch tenant data MUST use `requireOrgContext`
middleware (from `src/integrations/supabase/org-middleware.ts`) instead of
accepting `organizationId` as caller-supplied input. The middleware
resolves the current org from the `current_org_id` cookie and verifies
active membership before any handler runs. This makes tenant scoping
tamper-proof from the client.

### R4 — Never accept `organizationId` from client payloads

Client callers select the current organization via the org-switcher
(`setCurrentOrganization` server fn), which writes the cookie server-side
after verifying membership. Handlers read from `context.organizationId` —
never from the request body.

### R5 — Cascade on organization delete

FKs to `public.organizations(id)` MUST use `ON DELETE CASCADE` so that
tenant deletion removes all owned rows atomically. Soft-delete on the
`organizations` row (setting `deleted_at`) is the normal path; hard delete
is reserved for tenant off-boarding.

## Enforcement

- Migrations that introduce a business table without `organization_id` +
  org-scoped RLS MUST be rejected in review.
- Server functions that touch tenant tables without `requireOrgContext`
  MUST be rejected in review.
- The Wave 0 verification report includes a check that every non-foundation
  public table has an `organization_id` column and org-scoped policies.

## Related

- `docs/15-governance/DATABASE_STANDARD.md`
- `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`
- Migration `006` — Organizations & Membership
