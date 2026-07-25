# Phase 1 — Platform Foundation Implementation (SPR-MOD-001-001)

**Mode:** Implementation. Framework and integration only. No tenant provisioning, no database changes, no business workflows.

## Objective

Establish the Platform module as the integration root for all Platform features by wiring it into the existing Business OS repository. Prepare — but do not build — the surfaces later phases (Tenant Registry, Provisioning, Lifecycle) will consume.

## Governing Standards

- ADR-017 (dedicated-database-per-tenant; Workspace logical only)
- Certified MOD-001 Platform Foundation v1.0
- REUSE_BEFORE_BUILD_STANDARD (Reuse → Extend → Refactor → Defer → Create)
- Phase 0 Reuse Inventory (primary source of truth for existing assets)

## Repository Safety

**Allowed**
- Extend existing files
- Create missing Platform foundation files
- Register navigation, permissions, routes
- Add thin wrappers, shared types, constants

**Not Allowed**
- Delete existing files
- Rename existing modules
- Move existing folders
- Replace authentication, navigation, Supabase client, or dashboard framework

## No Silent Refactors

Any REFACTOR must preserve public behavior. If a refactor would change APIs, routing, contracts, or user-visible behavior, STOP and request approval before proceeding.

## Rollback Expectation

If implementation introduces a build failure, test regression, routing regression, or authentication regression, restore repository stability before continuing. Do not stack additional work on an unstable repository.

## Repository Discovery (mandatory, before any change)

Inventory the following against the Phase 0 Reuse Inventory and confirm the disposition (Reuse/Extend/Refactor/Defer/Create) of each:

- Platform routes: `src/routes/_authenticated/platform/**`
- Platform shell + navigation: `src/components/platform/**`, `src/lib/navigation/**`, `src/hooks/platform/**`
- Dashboard template: `src/dashboard/template/**`
- Auth + RBAC: `src/contexts/auth-context.tsx`, `src/contexts/permissions-context.tsx`, `src/routes/_authenticated.tsx`
- Supabase clients: `src/integrations/supabase/**`
- Shared hooks/services/utils: `src/hooks/**`, `src/services/**`, `src/utils/**`, `src/lib/**`
- Config + feature flags: `src/config/**`, `src/hooks/settings/**`

## Scope

### 1. Platform module boundary
Prefer extending existing folders (`src/routes/_authenticated/platform/**`, `src/components/platform/**`, `src/hooks/platform/**`) over introducing a new `src/modules/platform/` tree. Any new folder requires a written CREATE justification citing the Reuse Inventory.

### 2. Routing
- Verify `/platform/*` routes load under the authenticated + platform-admin gate.
- Add only routes missing for the foundation (placeholders acceptable).
- Explicitly verify: lazy loading (if used), route guards, error boundaries, 404 handling, breadcrumb metadata.
- No route rewrites.

### 3. Layout & shell
Reuse existing app layout, platform shell, sidebar, header, secondary nav, dashboard template. Extension only where a Platform-specific slot is required.

### 4. Navigation
Verify sidebar, secondary nav, breadcrumbs, favorites, recent, search, and command palette surface Platform entries via `src/lib/navigation/registry.ts`. Zero duplicates. No parallel registries.

### 5. Platform services (thin scaffolds, no tenant logic)
- Platform configuration accessor (wraps existing config)
- Feature flag accessor (wraps existing `useFeatureFlag`)
- Platform metadata accessor (module id, version, capability catalog reference)
- Platform logging helper (wraps existing logger)

No tenant CRUD, no provisioning, no new DB calls.

### 6. Shared types
`Platform`, `PlatformStatus`, `PlatformSettings`, `PlatformMetadata`. No `Tenant*` entities in this phase.

### 7. Constants
Centralize Platform route ids, nav ids, permission keys, and feature-flag keys — reusing existing constants where present.

### 8. Error handling
Reuse existing error boundaries, toast, notification, and logging surfaces. Extend only for Platform-specific messaging.

### 9. Auth integration
Verify (do not redesign) that Platform pages consume the existing session, protected-route gate, role checks, and permission checks.

### 10. Authorization
Register Platform permission keys against the existing RBAC/permissions catalog. No second permission system.

### 11. Dashboard integration
Extend `/platform/dashboard` using the existing dashboard template. Placeholder widgets/quick-actions/stats are acceptable and must:
- Clearly indicate "Coming in Phase 2"
- Render disabled actions where relevant
- Never invoke mock provisioning logic
- Never present fake tenant counts or fabricated metrics as real data

### 12. Configuration
Wire Platform module into the existing env/feature-flag/settings framework. No new configuration framework.

## Out of Scope

Tenant CRUD, provisioning, DB creation, Workspace/Company/Branch/Financial-Year creation, licensing, audit engine work, background jobs, edge functions, migrations, schema changes, business workflows, new governance docs.

## Definition of Done

- Build passes
- Lint passes
- Tests pass (existing 49/49 green)
- No duplicate assets introduced
- Reuse Inventory honored
- Navigation updated
- Platform routes operational
- Platform Dashboard operational
- Existing behavior preserved
- Implementation summary published (structure below)

## Implementation Summary (required structure)

- Reused Assets
- Extended Assets
- Created Assets
- CREATE Justifications
- Refactored Assets
- Deferred Items
- Known Limitations
- Next Phase Dependencies

## Stop Rule

When the Platform Foundation is operational and the Definition of Done is met: **STOP.** Do not begin Tenant Registry. Await Phase 2 authorization.

## Execution Steps

1. Review SPR-MOD-001-001 PRD, ADR-017, Phase 0 Reuse Inventory.
2. Repository discovery pass → disposition table (Reuse/Extend/Refactor/Defer/Create).
3. Wire/extend Platform module boundary against existing folders.
4. Verify + extend routing and navigation registry (incl. guards, error boundaries, 404, breadcrumbs).
5. Add thin Platform services, types, constants, config wiring.
6. Extend Platform dashboard with clearly-labeled Phase 2 placeholders.
7. Build, lint, test; scan for duplicates; restore stability immediately on any regression.
8. Publish structured Implementation Summary; STOP.
