## Tenant Shell Header — Board Recommendations Follow-Up

The Architecture Board approved the v2 header architecture and asked for six minor enhancements. Scope stays presentation-only: no routing, RBAC, data model, or NAV_REGISTRY schema changes (deferred, per Board Rec 7 of the prior review).

### 1. Header Slot Registry (Rec 1)

Evolve `HeaderProvider` from an ad-hoc popover coordinator into a **slot registry** so future modules can contribute header items without editing `AppShell`.

- New `src/lib/header/slot-registry.ts` — typed slot list with `id`, `area` (`"start" | "end"`), `order`, `element`.
- Extend `src/contexts/header-context.tsx` with `registerSlot / unregisterSlot / getSlots(area)` on top of existing popover open/close state.
- Add `<HeaderSlots area="end" />` renderer used by `AppShell`.
- Migrate the current end-area items (SearchTrigger, Favorites, Recent, AI, Notifications, Help, Profile) to declarative registrations with stable `order` values (10, 20, 30, 40, 50, 60, 70). Navigator + Logo stay in the `start` area.
- `AppShell` becomes structural only; no per-item JSX.

### 2. NavigationSearchIndex with caching (Rec 2 + Rec 6)

Rename `src/lib/navigation/index.ts` → `src/lib/navigation/search-index.ts` and expose `NavigationSearchIndex` as the primary export.

- `buildNavigationSearchIndex(registry)` computes a normalized token index **once per registry identity** (memoized by registry reference via `WeakMap`).
- `filterNavigationTree(tree, query)` and `searchNavigation(query)` become thin consumers of the cached index.
- New `useNavigationSearchIndex()` hook returns the memoized index for both sidebar filter and the future command palette.
- Update `PlatformSidebarV2` to consume the hook instead of calling the filter function on every render.

### 3. Search matching precedence (Rec 3)

Document the intended order in `docs/standards/NAVIGATION_SEARCH_STANDARD.md` (new):

1. Exact title match
2. Alias match (schema deferred; contract documented)
3. Keyword match
4. Module match
5. Description match (future)

Implement tiers 1, 3, 4 today inside the cached index scorer; alias/description remain no-ops with typed extension points so wiring them later needs zero call-site changes.

### 4. Sidebar Footer contract (Rec 4)

Formalize `src/components/platform/navigation/SidebarFooter.tsx` into a contract:

- Named optional slots: `version`, `environment`, `documentation`, `feedback`, `systemStatus`.
- Defaults: `version` (from `APP_VERSION` constant) + `environment` (from `import.meta.env.MODE`) render today; the rest are `null` placeholders.
- Reserve grid layout so appearing/disappearing slots don't jump the sidebar.

### 5. Keyboard shortcuts documentation (Rec 5)

Add `docs/standards/KEYBOARD_SHORTCUTS.md` listing:

- `⌘K / Ctrl+K` — command palette (implemented)
- `/` — focus sidebar search (already implemented; document it)
- `Alt+←/→` — expand/collapse current group (planned)
- `Ctrl+Shift+F` — Favorites popover (planned)
- `Ctrl+Shift+R` — Recent popover (planned)
- `Esc` — clear search / close popover (implemented)

Wire the two "planned" popover shortcuts through `HeaderProvider.open(id)` since the plumbing already exists — trivial, low risk, keeps the doc in sync with reality. Group-expand shortcut remains documented-only this pass.

### 6. Governance

- Update the ADR trail: add `docs/adr/ADR-010-tenant-header-architecture.md` capturing HeaderProvider, Slot Registry, NavigationSearchIndex, and Sidebar Footer contract as the ratified pattern.
- Cross-link ADR-010 from ADR-009 (single Tenant concept) so future readers land on the header story from the tenancy story.

---

### Files touched

**New**

- `src/lib/header/slot-registry.ts`
- `src/lib/navigation/search-index.ts` (replaces `index.ts`)
- `src/hooks/navigation/useNavigationSearchIndex.ts`
- `docs/standards/NAVIGATION_SEARCH_STANDARD.md`
- `docs/standards/KEYBOARD_SHORTCUTS.md`
- `docs/adr/ADR-010-tenant-header-architecture.md`

**Edited**

- `src/contexts/header-context.tsx` — add slot registry APIs
- `src/components/layout/AppShell.tsx` — replace hardcoded items with `<HeaderSlots />`
- `src/components/platform/header/*.tsx` — self-register into slot registry via a small `useHeaderSlot` hook
- `src/components/platform/navigation/PlatformSidebarV2.tsx` — consume `useNavigationSearchIndex()`
- `src/components/platform/navigation/SidebarFooter.tsx` — formal slot contract
- `docs/adr/ADR-009-*.md` — add cross-link to ADR-010

**Deleted**

- `src/lib/navigation/index.ts` (renamed)

### Non-goals (explicitly out of scope)

- NAV_REGISTRY schema changes (aliases, badgeProvider) — deferred per Board Rec 7 of prior review.
- Alt+←/→ group expand/collapse implementation — documented only.
- Any Platform (Super Admin) shell changes — the tenant work does not touch the platform variant.
