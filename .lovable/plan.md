## Goal

Add a secondary header bar directly below the `PlatformTopBar` that hosts the three navigation triggers — **All**, **Favorites**, **Recent** — matching the uploaded reference. The bar is theme-aware:

- **Light theme:** light grey background
- **Dark theme:** blue (navy, matching current platform sidebar/topbar)

## Scope

Platform shell only (`/platform/*`). No changes to the Tenant shell, business logic, data, or routing.

## Changes

### 1. New component: `src/components/platform/PlatformSecondaryHeader.tsx`

- Fixed bar under the topbar (`top-14`, height ~40px, `z-30`).
- Left cluster: three pill/text buttons — `All` (LayoutGrid icon), `Favorites` (Star icon), `Recent` (Clock icon, active/red state as in image).
- `All` toggles sidebar pin (reuse `usePlatformNavState` via a passed prop, or lift through `PlatformShell`).
- `Favorites` / `Recent` open placeholder popovers (or wire to existing favorites/recent registries if present — behavior parity with tenant `NavigatorButton`/tabs is out of scope for this pass; buttons render and are clickable, active state visible).
- Uses semantic tokens: `bg-[color:var(--platform-secondary-header-bg)]`, foreground via existing sidebar tokens. Active state uses `--brand-red`.

### 2. Tokens in `src/styles.css`

Add:
- `:root` → `--platform-secondary-header-bg: <light grey, e.g. oklch matching #f1f2f5>`
- `.dark` → `--platform-secondary-header-bg: <navy, matches current topbar>`

### 3. `PlatformShell.tsx`

- Render `<PlatformSecondaryHeader />` right after `<PlatformTopBar />`.
- Bump main content top padding from `pt-14` to `pt-[92px]` (14 topbar + ~40 secondary).
- Adjust sidebar `top` offset if the sidebar starts at `top-14` today, so it starts below the secondary header too (verify in `PlatformSidebarV2`).

## Out of scope

- Wiring Favorites/Recent popover contents (kept as visual triggers unless already available as reusable components — will reuse if trivial, otherwise stub).
- Tenant shell changes.
- Any change to nav registry, search, or business logic.

## Technical notes

- All colors via CSS variables — no hardcoded `bg-white` / `bg-slate-*`.
- Component is presentational; state (pin toggle) comes through the existing `usePlatformNavState` hook already used by `PlatformShell`.
