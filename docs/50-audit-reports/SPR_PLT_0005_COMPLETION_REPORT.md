---
title: "SPR-PLT-0005 Completion Report"
sprint: "SPR-PLT-0005"
status: "Complete"
report_type: "Sprint Completion"
version: "1.0.0"
completed_at: "2026-07-24"
---

# SPR-PLT-0005 — Platform Shell & Enterprise Navigation · Completion Report

## Objective

Establish the permanent Business OS presentation foundation: a reusable
application shell, enterprise theme tokens, data-driven navigation,
Super Admin dashboard, and widget framework. Presentation-only sprint —
no schema changes, no server functions, no permission-key changes.

## Delivered

### Shell (Phase 1)

- `src/components/layout/AppShell.tsx` — top nav + sidebar + main + status bar
  composition; `<main id="main" role="main">` + semantic landmarks.
- `src/components/platform/ProfileMenu.tsx` — avatar-anchored dropdown with
  profile, preferences, shortcuts, theme (light / dark / system), sign out.
- `src/components/platform/HelpMenu.tsx` — docs, palette, contact support.
- `src/components/platform/SearchTrigger.tsx` — top-nav search pill (⌘K).
- `src/components/platform/StatusBar.tsx` — app version + tenant + health.

### Theme (Phase 1)

- `src/styles.css`: added `--surface-1..3`, `--elevation-1..3`,
  `--nav-width-expanded/collapsed`, `--topbar-height`, mapped to
  `bg-surface-*` and `shadow-elevation-*` Tailwind utilities. Dark-mode
  values declared under `.dark`.

### Navigation (Phase 2)

- Reuses existing `AppSidebar` (already data-driven from `NAV_REGISTRY`
  with permission + feature-flag filtering, favorites, recent pages,
  collapsed/expanded modes).
- No `nav_id` changes; no permission-key changes.

### Dashboard & Widget Framework (Phase 3)

- `src/components/dashboard/Dashboard.tsx` — `Dashboard`, `DashboardRow`,
  `DashboardSection`.
- `src/components/dashboard/WidgetCard.tsx` — generic titled container.
- `src/components/dashboard/widgets/StatCard.tsx` — KPI card.
- `src/components/dashboard/widgets/ActivityFeedWidget.tsx`.
- `src/components/dashboard/widgets/ProgressWidget.tsx`.
- `src/components/dashboard/widgets/TableWidget.tsx`.
- Barrel: `src/components/dashboard/index.ts`.

### Super Admin Dashboard (Phase 3)

- `src/routes/_authenticated/platform/index.tsx` rewritten:
  - Header with role badge, title, "Manage tenants" primary action.
  - Overview section with 4 KPI cards (Active tenants, Active users,
    Uptime, Incidents) — all marked `Sample`.
  - Recent tenants table + platform activity feed.
  - Capacity progress widget + quick-actions grid (Tenants,
    Licensing, Audit, Users).
  - Preserved `platform.settings.manage` RBAC gate.

### Search & Palette (Phase 4)

- Command palette continues to serve `⌘K` / `Ctrl+K` globally; new
  `SearchTrigger` component surfaces it in the top nav.

### Documentation (Phase 5)

- `docs/12-ui-components/platform-shell.md` — component guide.
- This completion report.

## Guardrails Verified

| Guardrail                                | Status |
| ---------------------------------------- | ------ |
| No new permission keys                   | ✅     |
| No `nav_id` changes                      | ✅     |
| No route renames                         | ✅     |
| No schema / migration changes            | ✅     |
| No server-function changes               | ✅     |
| No hex literals in new components        | ✅     |
| Widgets marked `Sample` until wired      | ✅     |
| RBAC gate on Super Admin dashboard       | ✅     |

## Out of Scope (deferred)

- Live data pipelines for Super Admin KPIs (owning modules).
- Licensing UI and models.
- Chart widget wired to a specific charting library (uses recharts
  `ChartCard` pattern in a later sprint).
- Full high-contrast theme variant.

## Traceability

| Requirement                       | Artifact                                                  |
| --------------------------------- | --------------------------------------------------------- |
| Reusable shell                    | `src/components/layout/AppShell.tsx`                      |
| Top navigation with profile menu  | `src/components/platform/*`                               |
| Left navigation (data-driven)     | `src/components/navigation/AppSidebar.tsx` (reused)       |
| Global search (⌘K)                | `SearchTrigger` + existing `CommandPalette`               |
| Notification panel                | Existing `NotificationBell` (composed in shell)           |
| Super Admin dashboard             | `src/routes/_authenticated/platform/index.tsx`            |
| Widget framework                  | `src/components/dashboard/**`                             |
| Enterprise theme tokens           | `src/styles.css` (SPR-PLT-0005 additions)                 |
| Component documentation           | `docs/12-ui-components/platform-shell.md`                 |

## Status

**COMPLETE** — Platform Shell established. Downstream module sprints may
now compose `Dashboard` + widget primitives without further shell work.
