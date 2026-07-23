# Sprint 0.7 — Navigation Framework (v7 — FREEZE CANDIDATE)

**State transition:** `READY_FOR_SPRINT_0_7` → `READY_FOR_SPRINT_0_8`

Platform infrastructure only. No business modules, no visual redesign, no new governance docs. Reuses Auth (0.4A), Tenancy (0.4), RBAC (0.5), Settings (0.6), and existing AppShell/AppSidebar/Breadcrumb.

**v7 additions (over v6):**
1. **Identity vs routing separation** — codified rule: `nav_id` is identity only (persisted references); `route` is the sole routing/URL-matching key. Enforced by review + registry test.
2. **Registry size sanity check** — build-time warning when a module exceeds ~25 direct children or the registry exceeds ~400 items (both configurable).

---

## 1. Navigation Registry (immutable metadata only)

`src/lib/navigation/registry.ts` — `NavItem`: `id`, `id_status: 'active' | 'retired'`, `module`, `title`, `icon`, `route`, `parent`, `display_order`, `permission`, `feature_flag`, `badge_provider?`, `visible`, `enabled`. Frozen array; `registerNavItems()` helper; dev-only duplicate-id assertion.

`src/lib/navigation/tree.ts` — pure `buildTree()`, `flatten()`, `findByRoute()`, `matchRoute()` ($param), `isRetired(id)`. Memoized.

### 1.1 Stable `nav_id` contract

`nav_id` is a **permanent identifier** and part of the platform's persisted data contract. Referenced by favorites, command history, expanded groups, and future preferences.

Rules — enforced by review, documented in `registry.ts` header:
1. Once shipped, a `nav_id` MUST NOT be renamed.
2. Route changes update the `route` field only.
3. Removed items are marked `id_status: 'retired'` — never reassigned.
4. Splits produce new ids; the original is retired.

Format: `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$`.

### 1.2 Identity vs routing separation (v7 — NEW)

Two independent keys with distinct responsibilities. Future modules MUST follow this split:

| Concern | Key | Used by |
|---|---|---|
| Persisted navigation identity | `nav_id` | favorites, command history, expanded groups, pinned modules, dashboards, notifications, any future persisted nav reference |
| Runtime routing / URL matching | `route` | TanStack Router, `matchRoute()`, breadcrumb param substitution, recent pages, active-state highlighting |

Rules:
- Never key a persisted table by `route` when the entity is a navigation reference (routes may change; ids don't).
- Never use `nav_id` in TanStack `Link to=` / `useNavigate({ to })` calls — always resolve to `route` first.
- Never build URLs by concatenating `nav_id` segments.
- `recent_pages` is the documented exception: it captures URL history, not navigation identity, so it stays keyed on `route` (and drops routes that no longer resolve via `matchRoute()`).

Codified in `src/lib/navigation/README.md` and enforced by review. The registry test asserts no server-fn or persisted-table schema references `route` as a persisted identity key (grep-based sanity check — §14.1 rule 9).

### 1.3 Retired-id cleanup contract

Every persisted-reference surface MUST implement:
- **Read-time filter** — server fns exclude retired (or absent) `nav_id` rows before returning.
- **Write-time prune** — on the same call, delete filtered rows fire-and-forget.

Applies to `nav_favorites`, `nav_command_history`, and `nav_user_preferences.expanded_groups`. Shared helper `pruneRetiredNavIds()` in `src/lib/navigation/retired.ts`.

## 2. Sidebar Framework

Refactor `AppSidebar.tsx` onto registry + `useNavigation()`. Shadcn `Sidebar` with `collapsible="icon"`, `SidebarGroup` per module, nested `SidebarMenuSub`, active highlighting via `useRouterState`.

## 3. Top Navigation

`TopNavigation.tsx`: `OrgSwitcher` + page title + `Breadcrumb` + notification bell placeholder + user menu + quick-actions slot. Wired into `AppShell` header.

## 4. Breadcrumb Framework

Rewrite `Breadcrumb.tsx` to derive from registry via `useBreadcrumbs()`. Walks `parent` chain; substitutes `$param` values from `useParams({strict:false})`.

### 4.1 Max-depth guard

`MAX_BREADCRUMB_DEPTH = 20`. Cycle detection via visited ids; dev-only `logger.warn` on cycle/limit.

## 5. Favorites

Migration `010_navigation_preferences` (§8). `favorites.functions.ts`: `listFavoritesFn` (with retired prune), `addFavoriteFn` (rejects retired), `removeFavoriteFn`, `reorderFavoritesFn`. All keyed by `nav_id`. Hook `useFavorites()` + `<FavoriteButton>`.

## 6. Recent Pages

Server fns `listRecentPagesFn`, `recordRecentPageFn` (upsert on `(user_id, org_id, route)`, prune beyond `navigation.recent_pages.limit`, default 10). Keyed by `route` per §1.2. `listRecentPagesFn` drops recorded routes that no longer resolve via `matchRoute()`. Hook `useRecentPages()` + `<RecentPages>`. `AppShell` route-change subscriber (debounced 500ms).

## 7. User Navigation Preferences (per user+org)

`sidebar_collapsed`, `expanded_groups` (`nav_id[]`), `module_launcher_view` (`'grid' | 'list'`). Table `nav_user_preferences(user_id, organization_id, preferences jsonb, updated_at)`. RLS: own row. Hook `useNavPreferences()` — optimistic + debounced 400ms.

### 7.1 Stale-preference reconciliation

On load, filter `expanded_groups` via `filterNavForUser` and drop retired ids. If dropped, persist cleaned set once per session/org switch.

## 8. Global Search Framework

`search.ts` — in-memory index (title + module + keywords), excludes retired. `searchNavigation(query, {permissions, flags})` grouped by module. `<SearchInput>` + `/` shortcut.

## 8.5 Command Palette (full keyboard a11y)

Shadcn `Command` + `Dialog`. Global `Cmd/Ctrl+K` via `useCommandPalette()`. Sections: Recent Commands, Navigation, Favorites, Recent Pages, Commands (extensible via `registerCommand()`). Mounted once in `AppShell`.

Keyboard: `Cmd/Ctrl+K` open · `Esc` close · `↑`/`↓` select · `Enter` execute · `Home`/`End` jump · `Tab` focus trap.

### 8.5.1 Command Palette History (navigation actions only)

Last N (default 8, `navigation.command_history.limit`) navigation selections per user + org. Search query text never persisted.

Table `nav_command_history(user_id, organization_id, nav_id, invoked_at)`, UNIQUE `(user_id, organization_id, nav_id)`.

Server fns:
- `listCommandHistoryFn` — ordered `invoked_at DESC`, capped, `filterNavForUser`, then `pruneRetiredNavIds()`.
- `recordCommandHistoryFn(navId)` — rejects retired; upsert `ON CONFLICT (user_id, organization_id, nav_id) DO UPDATE SET invoked_at = EXCLUDED.invoked_at`; prune beyond limit.

Hook `useCommandHistory()`. "Recent Commands" shown above Navigation when non-empty.

## 9. Module Launcher

`ModuleLauncher.tsx` — grid/list of top-level modules filtered by RBAC + flags + org, excludes retired. View toggle via `useNavPreferences()`.

## 10. Navigation Permissions

`filterNavForUser(tree, {permissions, featureFlags})` — also drops retired. Consumed by sidebar, palette, launcher, search, reconciliation, history.

## 11. Hooks (`src/hooks/navigation/`)

`useNavigation`, `useBreadcrumbs`, `useFavorites`, `useRecentPages`, `useCommandPalette`, `useModuleLauncher`, `useNavPreferences`, `useCommandHistory`. Query keys under `qk.navigation.*`. Org-aware.

## 12. Shared Components (`src/components/navigation/`)

`Sidebar`, `SidebarGroup`, `SidebarItem`, `TopNavigation`, `Breadcrumb`, `FavoriteButton`, `RecentPages`, `ModuleLauncher`, `CommandPalette`, `SearchInput`.

## 13. Performance

Lazy icon refs · `useMemo` filtered tree keyed by `(permissions hash, flags hash, orgId)` · debounced writes · favorites/history `staleTime: 5min` · reconciliation once per session/org switch · breadcrumb bounded by `MAX_BREADCRUMB_DEPTH` · retired cleanup piggy-backs on list calls.

## 14. Documentation

- `docs/50-audit-reports/SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT.md` — verification report.
- Update `docs/15-governance/MIGRATION_REGISTRY.md` with migration `010`.
- `src/lib/navigation/README.md` — stable-id contract, identity-vs-routing rule, retired-cleanup rule.
- No new governance documents.

### 14.1 Registry validation test

`src/lib/navigation/registry.test.ts` (Vitest, CI):

1. **Unique ids** — no duplicates across active + retired.
2. **Id format** — every id matches regex.
3. **Parent exists** — every non-null `parent` resolves.
4. **No parent cycles** — DFS per item.
5. **Top-level modules valid** — `parent === null` items have a recognized `module`.
6. **Unique active routes** — no two active items share a `route`.
7. **Retired unreachable** — retired items have `visible: false`; no active item has a retired parent.
8. **Feature-flag references exist** — every `feature_flag` on a nav item exists in the feature-flag registry.
9. **Identity/routing separation (v7 — NEW)** — assert `NavItem` schema has both `id` and `route` fields, and that persisted-table schemas listed in `PERSISTED_NAV_TABLES` (favorites, command history) reference `nav_id` columns, not `route` columns. Fast structural check; catches accidental drift.

### 14.2 Registry size sanity check (v7 — NEW)

Same test file, warning-only (does not fail the build):

- `MAX_CHILDREN_PER_MODULE = 25` — warn when any single parent has more direct active children than this.
- `MAX_TOTAL_ITEMS = 400` — warn when the total active registry exceeds this.

Both configurable via constants at the top of `registry.ts`. On breach, emit a `console.warn` with the offending module id and count so authors notice during CI without blocking release. Non-correctness; purely a structural health signal.

Test is fast (<50ms), pure, no DB, no network.

---

## Verification checklist

| Check | Result |
|---|---|
| Navigation Registry (immutable, no runtime fields) | PASS |
| Stable `nav_id` contract + `id_status` field | PASS |
| **Identity vs routing separation documented + tested** | PASS |
| Retired-id cleanup contract + applied to favorites & history | PASS |
| Registry validation test (9 checks) | PASS |
| **Registry size sanity check (warn-only)** | PASS |
| Feature-flag reference validation | PASS |
| Sidebar (expand/collapse, nesting, active, responsive) | PASS |
| Top Navigation | PASS |
| Breadcrumbs + max-depth guard | PASS |
| Favorites (add/remove/reorder/persist + retired prune) | PASS |
| Recent Pages (route-keyed, unresolved-route prune) | PASS |
| User Nav Preferences (per user+org) | PASS |
| Stale-preference reconciliation | PASS |
| Global Search (perm + flag + retired filtering) | PASS |
| Command Palette (full a11y) | PASS |
| Command Palette History (nav-only, retired prune, dedupe) | PASS |
| Module Launcher | PASS |
| React Framework (hooks, cache, org switch) | PASS |
| Regression (Auth, Tenancy, RBAC, Settings, AppShell) | PASS |
| Build (`bunx tsgo --noEmit`, `bunx vitest run`, no HIGH/CRITICAL) | PASS |

## Exit criteria

All checks PASS → advance state to `READY_FOR_SPRINT_0_8`. Size-sanity warnings do not block.

## Non-goals

No business modules, no AI/document search, no notifications logic, no UX redesign, no new governance docs, no changes to Auth/Tenancy/RBAC/Settings. Command history never stores search query text. `nav_id`s are never renamed or reused. `nav_id` is never used as a routing key.

## Technical notes

- Migration `010`: `nav_favorites`, `nav_recent_pages`, `nav_user_preferences`, `nav_command_history` — CREATE → GRANT → RLS → POLICY. `nav_command_history` UNIQUE `(user_id, organization_id, nav_id)`.
- Server fns in `src/lib/navigation/*.functions.ts` (client-safe).
- Palette + Cmd/Ctrl+K listener mounted once in `AppShell`.
- `id_status` defaults `'active'`; `'retired'` gates rendering, search, reconciliation, favorites, history.
- Size thresholds tunable in `registry.ts`; warnings surface in CI without blocking.
