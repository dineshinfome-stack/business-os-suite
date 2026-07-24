# Business OS Enterprise Navigation v2

Replace the current flat Platform sidebar/drawer (`PlatformAllDrawer`, `PlatformSidebar`) with a data-driven, searchable, grouped navigation. Reuses the existing `NAV_REGISTRY`, permission framework, favorites/history hooks — no hardcoded menus, no ServiceNow visual copy. Original Business OS branding retained.

## Scope

- Applies to the **Platform (Super Admin) shell** in this pass (`PlatformShell`). Tenant `AppShell` is untouched.
- All data comes from `NAV_REGISTRY` via `useNavigation()` (permission + feature-flag filtered). `PLATFORM_NAV` static array is deprecated for rendering.
- No backend changes. Favorites/history/expand state reuse existing hooks (`useFavorites`, `useRecentPages`, `useNavPreferences`) and `nav_favorites` / `nav_command_history` tables.

## Component structure

```text
PlatformSidebar (rewritten)
├── SidebarHeader          brand + collapse/pin toggle
├── NavigationSearch       ⌘K opens palette; inline filter for tree
├── NavigationTabs         All · Favorites · Recent
└── NavigationTree         virtualized when > 60 rows
    └── NavigationGroup    collapsible module (▼ Platform, ▼ CRM, …)
        └── NavigationItem title · icon · badge · ★ · ⋮
```

Each `NavigationItem` reads from a `NavItem` (`id`, `title`, `icon`, `route`, `permission`, `feature_flag`, `keywords`, `children`) plus runtime `badge`, `favorite`, `pinned`.

## Feature list

1. **Search** — inline "Search menus… ⌘K" filters the tree by title/module/keywords; ⌘K still opens the full command palette.
2. **Tabs** — `All | Favorites | Recent` (icons + labels). Favorites = pinned + starred; Recent = last 20 from command history.
3. **Collapsible groups** — one per top-level module; expand state persisted via `useNavPreferences` keyed by `nav_id`.
4. **Pin / Favorite** — star toggles favorite; pinned items float to top of All tab and appear in Favorites.
5. **Row context menu (⋮)** — Open · Pin/Unpin · Copy Link · Open in New Tab · Add Shortcut.
6. **Badges** — optional numeric badge per item, sourced from a new `useNavBadges()` hook (initial impl returns empty map; wired for Approvals / Notifications / Tasks later).
7. **Empty state** — "No pages found" with actions: Create command · Search globally · Help.
8. **Keyboard** — ↑/↓ move, →/← expand/collapse, Enter navigates, `/` focuses search, `Esc` closes.
9. **Permission-aware** — filtered by `useNavigation()`; hidden items never render.
10. **Responsive** — desktop pinned (w-72), laptop collapsible mini (w-14, icons only), tablet/mobile overlay drawer via existing pin state.
11. **Performance** — memoized tree; virtualize (`@tanstack/react-virtual`, already available) once flat row count > 60; expand state persisted.

## Theme

Original Business OS tokens — no ServiceNow pink/navy pallette copy:
- Sidebar: `--platform-sidebar-bg` (existing dark), text `--platform-sidebar-fg`.
- Active row: brand primary left bar + subtle tint (`--brand-primary` / existing red), not magenta.
- Rounded 8px rows, soft elevation, modern typography from existing design tokens.
- Light workspace area unchanged.

## Files

**New**
- `src/components/platform/navigation/PlatformSidebarV2.tsx`
- `src/components/platform/navigation/NavigationSearch.tsx`
- `src/components/platform/navigation/NavigationTabs.tsx`
- `src/components/platform/navigation/NavigationTree.tsx`
- `src/components/platform/navigation/NavigationGroup.tsx`
- `src/components/platform/navigation/NavigationItem.tsx`
- `src/components/platform/navigation/NavigationRowMenu.tsx`
- `src/components/platform/navigation/NavigationEmptyState.tsx`
- `src/hooks/navigation/useNavBadges.ts` (stub returning `Map<nav_id, number>`)
- `src/hooks/navigation/usePinnedNav.ts` (thin wrapper over `useFavorites` exposing `pinned` semantics)

**Modified**
- `src/components/platform/PlatformShell.tsx` — mount `PlatformSidebarV2`; retire `PlatformAllDrawer` usage.
- `src/components/platform/PlatformTopBar.tsx` — remove `All/Favorites/History/Workspaces` tabs (moved into sidebar); keep brand, search, utility icons, profile.
- `src/hooks/platform/usePlatformNavState.ts` — simplify to `{ pinned, togglePinned, collapsed, toggleCollapsed }`.
- `src/components/platform/index.ts` — export new sidebar.

**Deprecated (kept as file, not imported)**
- `PlatformAllDrawer.tsx`, `PlatformSimplePopover.tsx`, `nav-items.ts` (`PLATFORM_NAV`).

## Data flow

```text
NAV_REGISTRY ──► useNavigation() ──► tree (perm + flag filtered)
                                    │
useFavorites ─────────────────────► NavigationItem (★ state)
useRecentPages ───────────────────► Recent tab
useNavPreferences ────────────────► expanded groups
useNavBadges ─────────────────────► badge counts
```

## Out of scope (follow-up sprints)

- Populating real badge counts (Approvals/Notifications/Tasks endpoints).
- Applying the same v2 pattern to Tenant `AppShell`.
- Global command palette redesign (kept as-is; ⌘K still works).

## Acceptance

- Sidebar renders grouped modules from `NAV_REGISTRY` with no hardcoded arrays.
- Search filters within ~50ms; empty state shown on no matches.
- Favorites/Recent tabs populate from existing tables.
- Pin/unpin persists across reload; expand state persists per user.
- All rows respect `permission` and `feature_flag` gates.
- Keyboard navigation works end-to-end; a11y roles (`tree`, `treeitem`, `group`) applied.
- Typecheck + build clean; no visual regression on Tenant shell.
