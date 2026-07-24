# SPR-PLT-0001 — Phase A: Platform Shell & Navigation

Scoped strictly to shell + navigation. No dashboard logic, no server reads, no provisioning, no licensing.

## Repository Verification (pre-flight)

Confirmed present and reusable:
- Auth gate: `src/routes/_authenticated/` (integration-managed)
- Shell: `src/components/layout/AppShell.tsx`
- Registry-driven sidebar: `src/components/navigation/AppSidebar.tsx`
- Breadcrumbs: `src/components/navigation/Breadcrumb.tsx`
- Command palette: `src/components/navigation/CommandPalette.tsx`
- Authorization gate: `src/components/auth/Can.tsx`
- Navigation registry: `src/lib/navigation/registry.ts`
- Permission manifest with `PLATFORM_*` keys already generated
- Existing platform routes: `_authenticated/platform/tenants`, `_authenticated/platform/companies`

If any of the above has drifted at implementation time, stop and report.

## Scope (what will be built)

1. **Navigation Registry — Super Admin group**
   - Add a new top-level module group (label: "Super Admin") and one child leaf "Platform Administration" pointing at the new route.
   - Reuse existing `NavItem` shape and an existing lucide icon.
   - Gate with the most appropriate existing `PLATFORM_*` permission already defined by repository governance. If multiple candidates exist, prefer the one identified by the Architecture Board during sprint scoping. Do not introduce new permission keys.
   - Additive-only; no renames, no changes to existing entries.

2. **Protected Super Admin Route**
   - Determine the landing route using the repository's existing routing conventions. If `/platform` is already the parent route, implement the landing page as its index; otherwise extend the existing hierarchy without changing existing URLs.
   - Renders inside the existing AppShell via `<Outlet />`; uses existing page layout conventions.
   - Content: page title, short description, and a set of placeholder `Card`s naming the future phases (Dashboard, Tenant Provisioning, Licensing, Audit, User Management) — static text only, no queries, no server functions.
   - Wrapped in `<Can permission={...}>` for defense-in-depth (nav already gates).

3. **Breadcrumb Integration**
   - Rely on existing registry-driven breadcrumb resolution — no changes to `Breadcrumb.tsx`. Verify the crumb renders as "Super Admin › Platform Administration".

4. **Command Palette Discoverability**
   - Confirm palette pulls from `NAV_REGISTRY`; if so, new entries surface automatically. No new command system, no code changes to `CommandPalette.tsx` unless it doesn't already ingest the registry (verify at build time).

## Out of Scope (explicit)

Dashboard widgets, KPIs, charts, tenant/company/invitation flows, licensing, billing, audit browser, user management, reports, analytics, storage monitoring, new permission keys, new palette infrastructure.

## Validation

- `tsgo --noEmit` clean
- `rg` sweeps: no `console.*`, no `TODO`, no raw permission literals, no duplicate `nav_id`
- Manual: sidebar hidden without permission; visible + navigable with it; palette finds "Super Admin" and "Platform Administration"

## Regression Checklist

Verify every item unchanged after implementation:
- Existing tenant routes
- Existing company routes
- Existing breadcrumb behavior
- Existing command palette behavior
- Existing sidebar groups
- Existing permission manifest (unless Board-approved additions)
- Existing auth flow
- Existing AppShell

## Deliverables

- Updated `src/lib/navigation/registry.ts` (additive)
- New route file under `src/routes/_authenticated/platform/` following existing conventions
- Sprint completion report at `docs/50-audit-reports/SPR_PLT_0001_PHASE_A_COMPLETION_REPORT.md` covering Repository Reuse, Files Modified, Validation, Regression Checklist results, and Repository Deviations

## Stop Condition

Stop after navigation renders under authorization, protected route mounts inside AppShell, breadcrumbs + palette verified, regression checklist passes, and validation is clean. Do not begin Phase B.

## Technical Notes

- Registry entry ids follow the additive-only stable-id contract; use a `platform.*` namespace consistent with sibling module groups.
- Placeholder cards are pure JSX; no data fetching primitives introduced.
