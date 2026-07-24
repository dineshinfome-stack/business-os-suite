# SPR-PLT-0005 — Platform Shell & Enterprise Navigation

Foundational UI sprint. Establishes the permanent Business OS shell, theme, navigation, dashboard, and widget framework. Reuses existing routing, auth, RBAC, tenant, and navigation-registry primitives. No business-module logic.

## Scope

In:
- Reusable `PlatformShell` (top nav + collapsible left nav + main + status bar)
- Enterprise theme tokens (Business OS palette; light/dark/high-contrast)
- Navigation: expanded / collapsed (with hover flyouts) / pinned; favorites, history, quick access, group ordering — driven by existing `NAV_REGISTRY`
- Global search dialog + command palette (extend existing `useCommandPalette` + `GlobalSearch`)
- Notification panel (extend existing `NotificationBell`)
- Profile menu (profile, prefs, shortcuts, theme, language, logout)
- Super Admin dashboard scaffolding: header, KPI card grid, widget framework
- Widget framework: `WidgetContainer`, `WidgetHeader`, `WidgetCard` + widget types (StatCard, ChartCard placeholder, Table, Activity, Timeline, Progress) — presentational only, no data pipelines
- Breadcrumbs, PageHeader, EmptyState, LoadingState primitives (reuse where present)
- Responsive behavior (desktop → mobile off-canvas)
- A11y: keyboard, ARIA, focus, WCAG AA
- Component documentation + validation & completion reports

Out (per prompt): CRM/Accounting/Inventory/etc., licensing, billing, analytics engine, AI features, business dashboards with live data.

## Reuse (do not duplicate)

- Routing: TanStack Router, `_authenticated` layout gate
- Shell frame: `src/components/layout/AppShell.tsx` (evolve, don't replace file surface — keep `AppShell` export)
- Sidebar primitive: `src/components/ui/sidebar.tsx` (shadcn)
- Nav data: `src/lib/navigation/registry.ts` + `useNavigation()` (already permission/flag-filtered)
- Command palette: `src/hooks/navigation/useCommandPalette.tsx` + `CommandPalette.tsx`
- Search: `src/components/search/*`, `useSearch`
- Notifications: `src/components/notifications/*`
- Theme: `src/contexts/theme-context.tsx`, `src/styles.css`
- Favorites / recent / prefs: `src/hooks/navigation/useFavorites`, `useRecentPages`, `useNavPreferences`, `useCommandHistory`
- Org/Tenant selector: existing `OrgSwitcher`
- RBAC: `usePermissions`, `<Can>`

## Architecture

Presentation-only sprint. No DB migrations, no server functions, no permission-key changes, no `nav_id` rename. All work under `src/components/platform/**`, `src/components/dashboard/**`, plus targeted edits to `AppShell`, theme tokens, and Super Admin index route.

### New component surface

```
src/components/platform/
  PlatformShell.tsx         # composes TopNavigation + AppSidebar + main + StatusBar
  TopNavigation.tsx         # logo, search trigger, ⌘K, notifications, help, theme, tenant, profile
  StatusBar.tsx
  ProfileMenu.tsx
  HelpMenu.tsx
  QuickActions.tsx
src/components/navigation/
  AppSidebar.tsx            # evolve: pinned/collapsed modes, favorites section, history section, flyouts
  NavGroup.tsx / NavItem.tsx / NavFlyout.tsx
  FavoritesSection.tsx
  HistorySection.tsx
src/components/dashboard/
  Dashboard.tsx             # grid host
  WidgetContainer.tsx
  WidgetHeader.tsx
  WidgetCard.tsx
  widgets/
    StatCard.tsx
    ChartCard.tsx           # thin wrapper around recharts (already present)
    TableWidget.tsx
    ActivityFeedWidget.tsx
    TimelineWidget.tsx
    ProgressWidget.tsx
src/components/common/
  PageHeader.tsx            # (reuse PageContainer if exists)
  Breadcrumb.tsx            # already exists — extend if needed
```

### Routes

- `src/routes/_authenticated/platform/index.tsx` → replace static landing with Super Admin Dashboard using new framework (KPI cards + sample widgets, no live data yet — stub values marked as `Sample`).

### Theme

Extend `src/styles.css` with Business OS enterprise tokens:
- Original palette (not ServiceNow): deep slate/graphite surfaces + refined enterprise-red accent already in project
- Add: `--surface-1..3`, `--elevation-*`, `--radius-enterprise`, `--nav-width-expanded`, `--nav-width-collapsed`, high-contrast variant tokens
- Keep existing enterprise-red primary; no ServiceNow colors

### Sidebar behavior

- Modes: `expanded` | `collapsed` | `pinned` — persisted via existing `useNavPreferences`
- Collapsed: icons only; hover opens flyout submenu (Radix `HoverCard`)
- Favorites at top (from `useFavorites`)
- History grouped Today/Yesterday/Earlier (from `useRecentPages`)
- Data-driven from `useNavigation()` — no hardcoded menu

## Phased execution (stop points optional)

Phase 1 — Theme + shell frame
- Extend `styles.css` tokens
- Create `PlatformShell`, `TopNavigation`, `StatusBar`, `ProfileMenu`, `HelpMenu`
- Rewire `AppShell` to compose these (keep same export contract)

Phase 2 — Navigation
- Evolve `AppSidebar` with modes, flyouts, favorites, history sections
- `NavGroup` / `NavItem` primitives sourced from `useNavigation()`
- Persist mode via `useNavPreferences`

Phase 3 — Dashboard & widget framework
- `Dashboard`, `WidgetContainer/Header/Card`
- Widget set (StatCard, ChartCard, Table, Activity, Timeline, Progress)
- Update `/platform` index to render Super Admin dashboard with sample KPIs (clearly labelled `Sample`)

Phase 4 — Search & palette polish
- Extend `CommandPalette` sections: Navigate / Actions / Recent / Favorites / Settings / Create New
- Ensure ⌘K + `/` shortcuts, results grouped by category

Phase 5 — Docs & reports
- `docs/12-ui-components/platform-shell.md` component docs
- `docs/50-audit-reports/SPR_PLT_0005_VALIDATION_REPORT.md`
- `docs/50-audit-reports/SPR_PLT_0005_COMPLETION_REPORT.md`

## Guardrails

- No new permission keys, no `nav_id` changes, no route renames
- No business logic; widgets render sample/empty states only
- Typecheck must stay clean; a11y (keyboard + ARIA) verified on shell + sidebar + palette
- All colors via semantic tokens; no hex literals in components

## Deliverables

Shell, theme, navigation, dashboard + widget framework, search/palette polish, notification panel & profile menu wiring, component docs, validation + completion reports.
