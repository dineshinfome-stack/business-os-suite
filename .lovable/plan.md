
# SPR-PLT-0005 — Platform Shell & Enterprise Navigation

Governance-first, UI-only sprint. Establishes the permanent Business OS shell inspired by enterprise ERP UX (ServiceNow-class) with an original visual identity. Reuses existing auth, RBAC, tenant model, and `NAV_REGISTRY`; no business logic, no new backend tables.

## Scope guardrails

- No new modules, business logic, backend tables, licensing, billing, or AI features.
- Reuse: `src/router.tsx`, `src/routes/_authenticated.tsx`, `src/contexts/*`, `src/lib/navigation/registry.ts`, permission framework, existing `useNotifications`, `useFavorites`, `useCommandHistory`, `useRecentPages`, tenant hooks.
- No renames of `nav_id` or permission keys (per ADR-009 deferral).
- Presentation-only changes; ADR-009 "Tenant" terminology preserved.

## Phased execution (stop between phases for review)

### Phase 1 — Design tokens & theme system
- Extend `src/styles.css` with a Business OS enterprise palette (original, not ServiceNow): brand primary, accent, surface tiers (`surface-1..4`), elevation shadows, radii scale, dense spacing scale, focus ring, semantic status (info/success/warn/danger).
- Add high-contrast variant on top of existing light/dark via a `.contrast-high` class; wire into `ThemeToggle` (add third option) and `theme-context`.
- Typography: pair a display + text sans (system-safe stack; load via `<link>` in `__root.tsx`).
- Deliver: `docs/20-design/PLATFORM_SHELL_TOKENS.md` documenting tokens.

### Phase 2 — Reusable shell primitives
New folder `src/components/platform-shell/`:
- `PlatformShell.tsx` — grid: TopNav / LeftNav / Main / optional StatusBar. Replaces internals of current `AppShell` (kept as a thin wrapper for back-compat).
- `TopNavigation.tsx` — logo, global search trigger (⌘K), breadcrumbs, tenant selector (uses existing `OrgSwitcher`), favorite-star for current page, quick actions, notifications, help, theme, profile.
- `LeftNavigation.tsx` — modes: `expanded | collapsed | pinned | temporary`. Collapsed uses Radix HoverCard for flyout children. Persist width + mode in `useNavPreferences`.
- `NavigationGroup.tsx`, `NavigationItem.tsx` — data-driven from `NAV_REGISTRY`; badge slot; permission-gated via existing `Can`.
- `StatusBar.tsx` — optional slot.
- `PageHeader.tsx`, `Breadcrumb` (reuse existing), `EmptyState` (reuse), `LoadingState` (reuse).

### Phase 3 — Navigation features (data-driven)
- Favorites row at top of LeftNav (existing `useFavorites`).
- History section grouped Today / Yesterday / Earlier (existing `useRecentPages`).
- Quick Access module: pinned + recent + favorites merged view.
- Group ordering & labels sourced entirely from `NAV_REGISTRY` (no hardcoding). Groups collapsible with persisted state.

### Phase 4 — Global Search & Command Palette
- Upgrade `CommandPalette.tsx`:
  - Sections: Navigate, Actions, Recent, Favorites, Create New, Settings, Search Everything.
  - Category-grouped results using existing `useSearch` + registry entries.
  - Keyboard: `⌘K` / `Ctrl+K`, `/` focuses top-nav search, `?` shows shortcuts modal.
- Add `KeyboardShortcutsDialog.tsx` triggered from profile menu and `?`.

### Phase 5 — Notifications & Profile menu
- Refactor `NotificationBell` → `NotificationPanel` with category tabs (System, Workflow, Approvals, Alerts, AI, Tasks, Messages), unread badge, "mark all read". Backed by existing `useNotifications`.
- `ProfileMenu.tsx` dropdown: Profile, Preferences, Shortcuts, Theme, Language, Notifications, Security, API Tokens (stubs → link to existing `/settings` routes; missing ones render `EmptyState` "Coming soon").

### Phase 6 — Dashboard & widget framework
New `src/components/dashboard/`:
- `Dashboard.tsx` — responsive 12-col grid.
- `WidgetContainer.tsx` with header actions: refresh, fullscreen, settings, export, permission gate. Resize/move stubbed (`data-*` hooks) for future.
- Widget primitives: `StatCard`, `ChartCard` (recharts wrappers: Line/Bar/Pie/Donut/Area), `TableCard`, `ProgressCard`, `TimelineCard`, `ActivityFeedCard`, `CalendarCard`, `QuickLinksCard`.
- Personalization store (`useDashboardLayout`) persists per-user layout in `localStorage` for this sprint (server persistence deferred).
- Rebuild `/dashboard` route as **Super Admin Dashboard**: greeting header, quick actions, and KPI cards wired to **placeholder/derived data only** (counts from existing `listTenants`, session info, etc.). No new backend.

### Phase 7 — Responsive & a11y pass
- LeftNav auto-collapses < md, becomes off-canvas on mobile (`Sheet`).
- WCAG AA audit on new components: focus-visible rings, ARIA on nav/landmarks, `<main>` single per route, 44px tap targets.
- Add `useHydrated` guard around theme + layout reads.

### Phase 8 — Documentation & completion
- `docs/20-design/PLATFORM_SHELL.md` — architecture, component catalog, usage.
- `docs/12-ui-components/` entries for each new primitive.
- `docs/50-audit-reports/SPR_PLT_0005_VALIDATION_REPORT.md` and `SPR_PLT_0005_COMPLETION_REPORT.md`.

## Technical notes

- All colors as semantic tokens in `src/styles.css` via `@theme inline`; zero `bg-[#...]` in components.
- Icons: existing `lucide-react` only.
- Charts: `recharts` (already common in shadcn ecosystem; add if missing).
- Persisted UI prefs reuse `useNavPreferences`; new dashboard layout uses a new `useDashboardLayout` (localStorage this sprint).
- No changes to `NAV_REGISTRY` ids/routes; only additions if new admin nav items needed for the shell demo.
- `AppShell` remains exported as a compatibility wrapper delegating to `PlatformShell` so existing routes render unchanged.

## Out of scope (explicit)

Business modules, licensing, billing, analytics engine, AI features, server-side dashboard persistence, drag-to-resize widgets, permission-key renames.

## Deliverables checklist

Shell + TopNav + LeftNav (4 modes) · Favorites/History/Quick Access · ⌘K palette · Global search categories · Notification panel · Profile menu · Theme system (light/dark/high-contrast) · Dashboard + widget framework + 10 widget types · Super Admin dashboard · Responsive + a11y · Docs + validation + completion reports.
