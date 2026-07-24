---
title: "ARCH-009 — Workspace Retirement Completion Report"
summary: "Records execution of ADR-009: Workspace retired as a domain concept; Tenant is now the single business container across code, routes, navigation, and Tier A documentation."
layer: "audit-report"
owner: "Platform Architecture"
status: "final"
updated: "2026-07-24"
version: "1.0"
tags: ["arch-009", "adr-009", "workspace-retirement", "tenant", "governance"]
document_type: "Audit Report"
---

# ARCH-009 — Workspace Retirement Completion Report

## Result: SHIPPED
- ADR-009 accepted; ADR-008 superseded.
- Typecheck: clean.
- User-facing routes: `/tenant` and `/tenant/accept` live; `/workspace` and `/workspace/accept` redirect (replace, preserves `?token=`).

## Phase execution

### Phase 2 — Architecture refactor
- Authored `docs/11-adrs/architecture/ADR-009-workspace-retirement.md`.
- Superseded `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md` (status → `superseded`, `superseded_by: ADR-009`, banner added).
- Updated Tier A docs:
  - `docs/15-governance/TENANCY_STANDARD.md` (hierarchy + terminology table)
  - `docs/02-architecture/multi-tenant-architecture.md` (heading, prose, Mermaid diagram)
  - `docs/glossary.md` (Platform, Tenant, Workspace entries)
  - `docs/GLOSSARY_INDEX.md` (ADR references)

### Phase 3 — Code refactor
- Moved `src/lib/workspace/` → `src/lib/tenant/` with descriptive filenames:
  - `functions.ts` → `business-functions.ts`
  - `types.ts` → `business-types.ts`
  - `query-keys.ts` → `query-keys.ts` (root key: `"workspace"` → `"tenant"`; export: `workspaceKeys` → `tenantKeys`)
- Deleted unused accessor `src/lib/workspace/current-workspace.ts` (0 consumers verified).
- Updated copy strings in `src/components/navigation/CommandPalette.tsx`, `src/lib/notifications/registry.ts`, `src/contexts/org-context.tsx`, `src/routes/_authenticated/settings.tsx`, `src/routes/_authenticated/dashboard.tsx`.

### Phase 4 — Route refactor
- New routes: `src/routes/_authenticated/tenant.tsx`, `src/routes/_authenticated/tenant.accept.tsx`.
- Old routes converted to redirect shims:
  - `src/routes/_authenticated/workspace.tsx` → `redirect({ to: "/tenant", replace: true })`
  - `src/routes/_authenticated/workspace.accept.tsx` → `redirect({ to: "/tenant/accept", search: { token }, replace: true })`
- Shim removal review scheduled: **2027-01-24** (per ADR-009).

### Phase 5 — Navigation & UI
- `src/lib/navigation/registry.ts`:
  - Top-level title: "Business" → "Tenant".
  - Hub title: "Business Profile" → "Tenant".
  - Routes: `/workspace` → `/tenant` for `workspace.hub`, `workspace.team`, `workspace.invitations`.
  - Keywords enriched with `tenant`.
- **`nav_id` values NOT renamed** (`workspace.*` preserved). Stable persisted contract per ADR-009 §Design Constraints.
- **Permission keys NOT renamed** (`workspace.*` preserved). Deferred to SPR-PLT-0004 per ADR-009 §Deferred Work.

### Phase 6 — Documentation refactor
- Tier A (live architecture/governance/glossary): swept.
- Tier B (module publications, standards): no direct "Workspace" hierarchy references detected in this sweep beyond the retired accessor. Rolling sweep will address any drift.
- Tier C (historical audit reports under `docs/50-audit-reports/`, MOD-018 "AI Workspace" product name): **preserved verbatim** per ADR-009.

## Verification
- `bunx tsgo --noEmit`: clean.
- Grep for `@/lib/workspace`: only remaining occurrences are the redirect-shim files' own comments and the auto-generated `src/routeTree.gen.ts`.
- Redirect shims verified structurally (route declarations + `beforeLoad` redirects).

## Deferred (not executed this pass)
- **SPR-PLT-0004 (tentative)** — Rename `workspace.*` permission keys and `nav_id` prefixes to `tenant.*` with a data-migration plan for `role_permissions`, `nav_user_preferences`, `nav_favorites`, and `nav_recent_pages`.
- Retirement of `/workspace` and `/workspace/accept` redirect shims (review 2027-01-24).

## References
- ADR-009 — `docs/11-adrs/architecture/ADR-009-workspace-retirement.md`
- ADR-008 (superseded) — `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md`
- Predecessor sprint report — `docs/50-audit-reports/SPR_PLT_0002_PRESENTATION_SIMPLIFICATION_REPORT.md`
