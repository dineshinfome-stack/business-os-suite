# ServiceNow-Style Super Admin Theme

Retheme the `/platform/*` shell and dashboard to match the ServiceNow Next Experience look from the references. Scope is presentation only — no changes to routes, RBAC, data, or the tenant (`AppShell`) side.

## Visual direction

- **Top bar (dark navy):** full-width `#1B1F3B`-family navy, white text, holds brand, primary tabs, centered dashboard pill, and right-side utility icons (search, globe, chat, help, notifications, avatar).
- **Primary tabs in top bar:** `All`, `Favorites`, `History`, `Workspaces`, `Admin`. `All` opens the pinnable side drawer; `Favorites` and `History` open popovers; `Admin` is the active section indicator.
- **Centered dashboard pill:** rounded white pill showing current dashboard name + star (favorite toggle).
- **Right utility cluster:** icon buttons for search, locale, chat, help, notifications, plus avatar that opens a profile menu (Profile, Preferences, Keyboard shortcuts, Impersonate user, Elevate role, Log out).
- **Side navigation ("All" drawer):** dark navy panel, pinnable to the left. Contains a Filter input + refresh + pin icon, then a collapsible module list with hover/star affordances. When unpinned it's an overlay; when pinned it pushes content.
- **Content canvas:** white/very-light gray (`#F7F8FA`) with a hero band at the top of dashboards: dark navy gradient + subtle decorative dots/waves, white headline + subtext.
- **Accent color:** ServiceNow magenta/pink `#E4127C` for stars, pinned indicators, and small highlights; ServiceNow green `#62D84E` for brand dot and success. Chart line accent cyan `#00B4D8`.
- **KPI cards:** large, thin-stroke numerals (e.g. `88%`, `14`), light card background, small trend sparkline, muted "No data available" empty state with an illustration slot.

## Color tokens (added under a `.platform` scope so tenant theme is untouched)

```
--sn-navy-900: #0F1235
--sn-navy-800: #1B1F3B
--sn-navy-700: #232852
--sn-navy-hover: #2B2F5A
--sn-navy-active: #E4127C   /* pink accent bar */
--sn-text-onnavy: #FFFFFF
--sn-text-onnavy-muted: #B7BAD0
--sn-canvas: #F7F8FA
--sn-surface: #FFFFFF
--sn-border: #E5E7EF
--sn-text: #1B1F3B
--sn-text-muted: #6B7085
--sn-accent-pink: #E4127C
--sn-accent-green: #62D84E
--sn-accent-cyan: #00B4D8
--sn-hero-gradient: linear-gradient(120deg,#1B1F3B 0%,#2A2F66 60%,#3B2A66 100%)
```

Tokens live in `src/styles.css` under a `.platform-theme` class applied by `PlatformShell` (keeps `/dashboard` tenant theme unchanged).

## File changes

1. **`src/styles.css`**
   - Add ServiceNow token block + `.platform-theme` scope.
   - Add `@utility sn-hero-dots` (radial dots overlay) and `@utility sn-hero-band` (gradient + subtle waves).
   - Refine `--platform-*` tokens to map onto the new palette for backward compatibility.

2. **`src/components/platform/PlatformShell.tsx`**
   - Wrap in `<div className="platform-theme min-h-screen">`.
   - Replace fixed 240px left sidebar layout with: fixed top `PlatformTopBar` (56px) + optional pinned left `PlatformAllDrawer` (280px) + main content that shifts right when pinned.
   - Manage `isPinned` + `activeTab` state (`all` | `favorites` | `history` | `workspaces` | `admin`) via a small local store/hook (`usePlatformNavState`).

3. **`src/components/platform/PlatformTopBar.tsx` (rewrite)**
   - Dark navy bar, height 56px.
   - Left: `ServiceNow`-style wordmark using existing "Business OS" brand + green dot; then tab buttons `All / Favorites / History / Workspaces / Admin`.
   - Center: white rounded "dashboard pill" showing current page title + star toggle.
   - Right: icon buttons — Search (opens command palette), Globe (locale — static for now), Chat, Help, Notifications, Avatar (opens `ProfileMenu`).
   - Tabs are buttons that open the corresponding panels; `Admin` remains a static active indicator for `/platform/*`.

4. **`src/components/platform/PlatformAllDrawer.tsx` (new)**
   - Dark navy left panel, 280px, top offset 56px, full height.
   - Header: `Filter` input with icon, refresh icon, pin/unpin icon.
   - List of collapsible modules from `nav-items.ts`, each row: chevron, label, edit + star on hover.
   - Overlay mode when unpinned (auto-close on outside click / route change); pushes content when pinned.
   - Uses `--sn-navy-800` bg, `--sn-text-onnavy` text, pink hover bar `--sn-accent-pink`.

5. **`src/components/platform/PlatformFavoritesPopover.tsx` (new)** and **`PlatformHistoryPopover.tsx` (new)**
   - Small dark navy popovers anchored to their top-bar tabs.
   - Favorites: list from existing `useFavorites` hook.
   - History: list from existing `useRecentPages` / `useCommandHistory` hook, grouped by "Today / Yesterday" with relative timestamps.

6. **`src/components/platform/PlatformProfileMenu.tsx` (adapt existing `ProfileMenu`)**
   - Header block: avatar, display name, role, instance name.
   - Items: Profile, Preferences, Keyboard shortcuts, Impersonate user (disabled/coming soon), Elevate role (disabled/coming soon), Log out.

7. **`src/components/platform/nav-items.ts`**
   - Add grouping metadata (module → sections) so the All drawer can render collapsible groups. No route changes.

8. **`src/routes/_authenticated/platform/index.tsx` (Super Admin Dashboard rewrite)**
   - Hero band: `sn-hero-band` background, white headline "Welcome to Admin Home, {name}!" + subtext, decorative dots overlay.
   - Below hero: "Track what's important to you" section title.
   - Dashboard title row: `Shared admin dashboard ▾` with Edit + refresh + more.
   - KPI grid (4 wide → 2 → 1 responsive):
     - Open incidents (empty state illustration + sparkline placeholder)
     - Open request items (empty state)
     - Problems `14`
     - Hardening compliance score `88%` with descending sparkline
     - Open P1 incidents `0`
     - Aging incidents over 24 hrs `0`
     - Request items over 24 hrs `0`
     - Request items awaiting approval `0`
     - Changes `5`
     - Customer Actions `2`
   - Below KPIs: "Get information about your instance" section placeholder (matching the reference footer).
   - All values marked with `Sample` badge (existing convention).

9. **`src/components/dashboard/StatCard.tsx`**
   - Add `variant="sn"`: white surface, top-left title, top-right kebab + optional info icon, large centered numeral (thin-weight), optional sparkline slot, optional empty-state illustration slot.

10. **`src/components/dashboard/EmptyIllustration.tsx` (new)**
    - Minimal inline SVG matching the "No data available" broken-window icon from the reference.

11. **`src/components/platform/PlatformStatusBar.tsx`**
    - Remove (ServiceNow reference has no bottom status bar) OR hide when `platform-theme` is active. Choose: hide only within Platform shell to keep tenant behavior intact.

## Interaction details

- `All` tab: click toggles the drawer open; pin icon inside drawer toggles pinned state (persisted in localStorage under `platform.nav.pinned`).
- `Favorites` / `History`: click opens popover anchored to tab; closes on outside click / Escape.
- Star in the centered pill toggles favorite for the current route via existing `useFavorites`.
- Search icon opens existing command palette (`useCommandPalette`).
- Keyboard: `⌘K` opens search; `[` toggles pin; `Esc` closes drawer/popover.
- Reduced-motion respected on drawer slide (200ms → 0ms).

## Out of scope

- Tenant shell (`/dashboard`, `/tenant/*`) is untouched.
- No new routes; `Workspaces` tab is a placeholder popover ("No workspaces yet").
- No new backend, RBAC, or data fetches beyond hooks already in use.
- Icons reuse `lucide-react`; no new icon pack.

## Validation

- Typecheck.
- Manual visual pass at `/platform`, `/platform/tenants` in light mode: top bar, pinned + unpinned drawer, popovers, hero, KPI grid, profile menu.
- Confirm `/dashboard` tenant shell unchanged.
- A11y: focus rings on all top-bar buttons, `aria-expanded` on tabs, drawer has `role="dialog"` when floating, `role="complementary"` when pinned.

## Deliverable

Updated Platform shell + Super Admin dashboard matching the ServiceNow references, plus a short completion note. No new audit doc unless requested.
