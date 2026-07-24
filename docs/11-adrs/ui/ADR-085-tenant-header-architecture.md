# ADR-085 — Tenant Header Architecture

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Architecture Board, Tenant Shell Working Group
- **Supersedes:** —
- **Related:** ADR-084 (Navigation Standards), ADR-009 (Workspace Retirement),
  `docs/03-design/navigation-search-standard.md`,
  `docs/03-design/keyboard-shortcuts.md`

## Context

The tenant shell header previously hard-coded its items (search, favorites,
recent, notifications, help, profile) directly in `AppShell.tsx`. Adding a
new productivity affordance — AI Assistant, Tasks, Announcements — required
editing the shell and risked layout drift between shells.

The Architecture Board approved the "Tenant Shell Header Redesign v2"
proposal on 2026-07-24 with six minor recommendations. This ADR ratifies the
resulting architecture as the standard for both Tenant and future shells.

## Decision

The tenant header is built from four cooperating primitives:

### 1. `HeaderProvider` (context)

Coordinates two concerns for header slot components:

- Single-open popover state (`open`, `close`, `toggle`, `isOpen`, `openId`).
- Sidebar chrome controls (`pinned`, `collapsed`, `togglePinned`,
  `toggleCollapsed`) so slot components like `NavigatorButton` can live in
  the slot registry without prop-drilling shell state.

### 2. `HeaderSlot` registry (`src/lib/header/slot-registry.ts`)

A static registry keyed by stable `id`, with `area` (`start | end`) and
integer `order` (multiples of 10, so new modules can insert between existing
entries). Registrations are idempotent under HMR.

Rendered by `<HeaderSlots area="start" />` / `<HeaderSlots area="end" />`;
AppShell no longer imports slot components directly.

### 3. `NavigationSearchIndex` (`src/lib/navigation/search-index.ts`)

Memoized (WeakMap-cached) index of NAV_REGISTRY tokens. Both the sidebar
filter and the command palette consume the same index. Match precedence is
documented in `navigation-search-standard.md`. Deferred registry fields
(`aliases`, `description`) have typed extension points that require no
call-site changes when enabled.

### 4. Sidebar Footer contract (`SidebarFooter.tsx`)

Named optional slots: `version`, `environment`, `documentation`, `feedback`,
`systemStatus`. `version` + `environment` render by default; the rest stay
reserved so a future module can drop content in without shifting layout.

### 5. Keyboard shortcut contract

`useHeaderShortcuts` claims `Ctrl/⌘+Shift+F` (Favorites) and
`Ctrl/⌘+Shift+R` (Recent). All shortcuts are catalogued in
`docs/03-design/keyboard-shortcuts.md` — including "Planned" ones that
reserve bindings.

## Consequences

**Positive**

- New header items ship as data (`registerHeaderSlot`) instead of shell edits.
- Sidebar and header stay consistent across shells via a single context.
- Search behavior is documented and cached; no per-render tree rebuild.
- Sidebar footer growth (env badges, docs links) is now layout-safe.
- Keyboard shortcut collisions are prevented by a single source of truth.

**Trade-offs**

- Static slot registration relies on import order — the shell must import
  `header-slots.registration` for side effects. This is deliberate and
  matches the NAV_REGISTRY pattern.
- Slot components read shell state through context, which is a small
  coupling that we accept in exchange for the AppShell simplification.

## Non-Goals

- Extending NAV_REGISTRY with `aliases` / `badgeProvider` / `description`
  — deferred to a coordinated schema sprint.
- Group-level `Alt + ←/→` expand/collapse implementation — documented only.
- Any change to the Platform (Super Admin) shell — this ADR governs the
  tenant surface. Platform migration is a separate follow-up.

## Compliance

- **ADR-009 (Workspace Retirement):** preserved. No "workspace" concept
  introduced anywhere in the header or sidebar chrome.
- **ADR-084 (Navigation Standards):** reinforced — the standard now names
  `NavigationSearchIndex` as the canonical search consumer.
