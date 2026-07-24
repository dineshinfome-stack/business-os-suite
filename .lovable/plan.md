# Enterprise Navigation v2 — Verify Platform, then extend to Tenant

You're on `/dashboard` (Tenant AppShell → `AppSidebar.tsx`), which was intentionally out of scope in the v2 rollout. That's why nothing looks different. `PlatformSidebarV2` is live at `/platform/*` only.

Two passes:

## Pass 1 — Verify Platform v2 (`/platform`)

1. Navigate the running preview to `/platform`; capture screenshots (default, collapsed, search active, empty state, Favorites tab, Recent tab) via Playwright.
2. Audit each acceptance item from `.lovable/plan.md` against the running UI:
   - Data-driven from `NAV_REGISTRY` via `useNavigation()` (no hardcoded arrays)
   - Search filters title/module/keywords; ⌘K still opens command palette; `/` focuses; `Esc` clears
   - Tabs: All · Favorites · Recent (icons + labels)
   - Collapsible groups; expand state persisted via `useNavPreferences`
   - Pin/★ toggles favorite; pinned float to top of All
   - Row context menu (⋮): Open · Pin/Unpin · Copy Link · Open in New Tab · Add Shortcut
   - Badges via `useNavBadges` (stub returns empty; render path present)
   - Empty state with Create command / Search globally / Help
   - Keyboard: ↑/↓ move, →/← expand/collapse, Enter navigates
   - a11y roles `tree` / `treeitem` / `group`
   - Responsive: pinned (w-72), mini-rail (w-14), overlay on tablet/mobile
3. Fix any gap found; do not restyle — only reconcile behavior with spec.
4. Deliverable: `docs/50-audit-reports/PLATFORM_NAV_V2_AUDIT_<ts>.md` with pass/fail per item and screenshots.

## Pass 2 — Extend v2 to Tenant AppShell

Goal: replace `src/components/navigation/AppSidebar.tsx` usage in `AppShell.tsx` with the same v2 component, theme-tokenized so Platform (dark) and Tenant (light) share code.

### Refactor plan
1. **Extract shared sidebar** into `src/components/navigation/EnterpriseSidebar.tsx` (moved from `platform/navigation/PlatformSidebarV2.tsx`). Keep all sub-parts (`NavigationSearch`, `NavigationTabs`, `NavigationTree`, `NavigationGroup`, `NavigationItem`, `NavigationRowMenu`, `NavigationEmptyState`) alongside it.
2. **Token-drive colors.** Replace hardcoded `text-white`, `bg-white/5`, `text-white/60` with semantic tokens:
   - `--sidebar-bg`, `--sidebar-fg`, `--sidebar-fg-muted`, `--sidebar-ring`, `--sidebar-active-bar`, `--sidebar-row-hover`.
   - Platform theme (`.platform-theme`) maps them to the existing dark navy palette (unchanged look).
   - Tenant theme maps them to the existing tenant tokens (light workspace with brand red active bar).
3. **Rewrite `AppShell.tsx`** to mount `<EnterpriseSidebar variant="tenant" pinned collapsed … />` and drop the current `AppSidebar` tree.
4. **Filter registry by shell.** `useNavigation({ shell: "tenant" | "platform" })` — Platform shell shows `super_admin.*` + `administration.*` modules; Tenant shell shows `workspace.*` (labeled Tenant) + tenant-visible modules. Achieved with a lightweight filter, not registry edits.
5. **Persist per-shell state.** Extend `usePlatformNavState` → `useShellNavState(shell)` so tenant pin/collapse/expand are stored under separate keys (`nav_prefs:tenant.*`).
6. **Keep `AppSidebar.tsx` as deprecated file** (not imported) for one release, then remove in a follow-up.
7. Update `PlatformShell.tsx` to consume the shared component via `variant="platform"` — no visual change.

### Files
**New**
- `src/components/navigation/EnterpriseSidebar.tsx` (moved from platform)
- `src/components/navigation/enterprise/*` (moved sub-parts)
- `src/hooks/navigation/useShellNavState.ts`

**Modified**
- `src/styles.css` — add `--sidebar-*` tokens under `:root` (tenant) and `.platform-theme` (platform)
- `src/components/layout/AppShell.tsx` — mount `EnterpriseSidebar variant="tenant"`
- `src/components/platform/PlatformShell.tsx` — mount `EnterpriseSidebar variant="platform"`
- `src/hooks/navigation/useNavigation.ts` — accept optional `shell` filter
- `src/components/platform/index.ts` — re-export shared component

**Deprecated (kept, not imported)**
- `src/components/navigation/AppSidebar.tsx`
- `src/components/platform/navigation/PlatformSidebarV2.tsx` (thin re-export during transition)

### Acceptance
- `/dashboard`, `/tenant`, `/settings` render with the v2 sidebar (search, tabs, groups, pin, badges, context menu, keyboard, empty state).
- `/platform` unchanged visually; still passes Pass 1 audit.
- Tenant sidebar respects tenant permissions via `useNavigation({ shell: "tenant" })`; no super-admin modules leak.
- Pin/expand state persists per shell (tenant vs platform independent).
- Tokens only — zero `text-white` / `bg-black` / hex literals in `EnterpriseSidebar` and children.
- Typecheck + build clean; smoke test passes.

## Technical notes
- No backend / migration changes. Reuses `nav_favorites`, `nav_command_history`, `NAV_REGISTRY`, `useFavorites`, `useRecentPages`, `useNavPreferences`, `useNavBadges`.
- Command palette (⌘K) unchanged.
- Mobile: overlay drawer via existing pin state; existing `use-mobile` hook for breakpoint gate.
- No new deps; virtualization threshold (`@tanstack/react-virtual` at >60 rows) carried over from v2.

## Out of scope
- Real badge counts (Approvals/Notifications/Tasks endpoints)
- Removal of deprecated `AppSidebar.tsx` (next sprint)
- Redesign of the command palette
