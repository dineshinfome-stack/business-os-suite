---
title: "SPR-PLT-0001 — Super Admin Portal & Tenant Provisioning: Repository Discovery Report"
sprint_id: "SPR-PLT-0001"
classification: "Platform Experience Sprint (PLT)"
mode: "Repository-first, governance-driven"
status: "Awaiting Architecture Board Review"
owner: "Platform"
created: "2026-07-24"
updated: "2026-07-24"
document_type: "Sprint Discovery Report"
authority: "Architecture Board (pending)"
tags: ["sprint", "discovery", "platform", "super-admin"]
---

# SPR-PLT-0001 — Repository Discovery Report

## 1. Purpose

Establish, through repository-first inspection, what platform capabilities already
exist to support a Super Admin Portal for Business OS, and what genuinely does
not exist. This document is discovery only. It defines no files, no permission
keys, no components, no server functions, and no schema. All such decisions
belong to the Architecture Board and to the follow-on implementation sprints
scoped from the approved Recommended Implementation Sequence (Deliverable 2).

## 2. Scope

In scope:

- Inventory of existing authentication, authorization, routing, shell, UI
  primitives, tenant lifecycle, audit, licensing, and dashboard capabilities.
- Identification of gaps and reuse opportunities.
- Documented risks, dependencies, and out-of-scope items.

Out of scope:

- Any code, migration, permission, schema, or design decision.
- Licensing engine, billing, plan catalog, charting library, platform-wide
  settings editor, or a full audit browser UI.

## 3. Method

Read-only inspection of the repository was performed against:

- Route tree under `src/routes/`, including the `_authenticated` subtree and
  existing platform routes.
- Server foundation under `src/lib/`, `src/integrations/supabase/`, and
  `src/start.ts`.
- Generated permission catalog and the governance manifest.
- Navigation registry and shared shell components.
- Existing tenant, audit, notification, and settings services.
- Applicable ADRs and platform standards.

Findings below record only what was verified during this pass.

## 4. Findings

### D1. Authentication — EXISTS, REUSE

Supabase Auth is the established provider. Login, callback, forgot-password,
and reset-password routes exist. Session handling, bearer attachment, and the
protected subtree gate under `_authenticated` are in place and integration-
managed. **Conclusion:** no authentication work is required; the Super Admin
Portal mounts inside the existing protected subtree.

### D2. Authorization — EXISTS, REUSE

Generated permission keys, server-side `requirePermission`,
`requireAnyPermission`, and `requireAllPermissions` helpers, a client-side
`Can` component, and the governance-owned permission manifest are all present.
Existing platform tenant, company, audit, and settings permission families
cover most Super Admin surfaces. **Conclusion:** reuse in full. Whether
additional platform permissions are required to support Super Admin dashboard
access and tenant provisioning is an assessment to be performed during the
implementation sprint; any proposed names are recommendations for Architecture
Board review. No permission keys are defined in this sprint.

### D3. Routing & Shell — EXISTS, REUSE

A shared application shell exists with sidebar, breadcrumb, command palette,
notification bell, organization switcher, and theme toggle. The navigation
registry already hosts platform tenant and company nodes. **Conclusion:**
extend the existing shell and registry. No parallel admin shell is warranted.

### D4. UI Framework — EXISTS, REUSE (with gap)

DataGrid, Form primitives, EmptyState, Skeletons, ErrorBoundary, and the full
shadcn component set are available. **Gap:** no reusable KPI, stat-tile, or
activity-list primitives; no charting library. Existing dashboard primitives
are insufficient for a platform overview surface; reusable dashboard
presentation components will likely be required.

### D5. Tenant Module — EXISTS, REUSE (with gap)

Tenant lifecycle (draft → active → suspended → archived), CRUD, audit, domain
events, slug helpers, list route, and detail route with a Companies tab all
exist. **Gap:** there is no guided multi-step provisioning experience that
orchestrates tenant creation, primary company creation, and primary admin
invitation as a single flow.

### D6. Licensing — DOES NOT EXIST, GAP

No plans, subscriptions, licenses, quotas, or entitlements exist. Feature flags
exist but are not a licensing model. **Conclusion:** register licensing as the
next available carry-forward identifier per repository convention. A dedicated
future platform sprint should own the licensing engine. This sprint neither
designs nor prescribes it.

### D7. Audit — EXISTS, REUSE (with gap)

Tenant and authentication audit services, an `audit_logs` table, and the
platform audit-view permission are present. **Gap:** no admin-facing audit
browser UI exists; a read-only recent-activity surface may be desirable on the
Super Admin dashboard, subject to Architecture Board decision.

### D8. Dashboard Framework — PARTIAL

The existing dashboard route is a member workspace stub. No shared KPI, stat,
or health-tile primitives exist. **Conclusion:** existing dashboard primitives
are insufficient for a platform overview; reusable presentation components
will likely be required.

### D9. Architecture Constraints

Applicable authorities include ADR-030 (authentication model), ADR-032
(RBAC + ABAC), the TanStack and Supabase integration standards, `_authenticated`
subtree gating rules, the permission manifest as the source of truth,
`createServerFn` for all app-internal server logic (no Edge Functions), and
migrations exclusively via the migration tool.

## 5. Reuse Strategy Summary (D10)

The Super Admin Portal should be composed from existing shell, permissions,
tenant services, audit, forms, and DataGrid. Net-new capabilities anticipated
at a high level: dashboard presentation primitives; a provisioning
orchestration capability that reuses existing tenant, company, and invitation
services; navigation registry entries; and licensing intent capture on the
tenant record, pending assessment of whether existing tenant metadata suffices
or schema evolution is required.

## 6. Out of Scope (D11)

- Licensing enforcement engine.
- Billing and plan catalog.
- Platform-wide settings editor beyond what already exists.
- New charting library.
- A full audit browser UI beyond a recent-activity surface.

## 7. Risks (D12)

- **R1** — Provisioning orchestration must reuse the existing invitation flow;
  platform-initiated admin invites must be verified during the implementation
  sprint.
- **R2** — Dashboard KPIs (active tenants, storage, health) may require new
  aggregate read capabilities and appropriate permission gating.
- **R3** — Without a licensing engine, any provisioning-time plan capture is
  aspirational data with no enforcement.

## 8. Dependencies

- Architecture Board approval of this Discovery Report and the accompanying
  Recommended Implementation Sequence.
- Carry-forward identifier for licensing per repository convention.
- Continued validity of ADR-030, ADR-032, and the permission manifest as the
  governing authorities.

## 9. Stop Condition

This report and the Recommended Implementation Sequence are the sole
deliverables of SPR-PLT-0001. No implementation begins until the Architecture
Board reviews and approves both. After approval, each proposed phase is scoped
and prompted as a separate implementation sprint.
