## Goal

Make the pinned (static) sidebar look and behave exactly like the "All" header popover, and only show it when pinned. When unpinned, the sidebar disappears and users navigate via the "All" popover instead.

## Current behavior

- `AppShell` always renders `<PlatformSidebarV2>`; when unpinned it collapses/overlays but is still mounted.
- The pinned sidebar has its own chrome: `SidebarHeader` (brand + tenant identity), `NavigationSearch`, `NavigationTree`, `SidebarFooter` (version/environment). This chrome is heavier than the "All" popover.
- The "All" popover (`AllPopover.tsx`) renders just: `NavigationSearch` (with refresh + pin toggle actions) + `NavigationTree` inside a scroll container.

## Changes

1. **AppShell (`src/components/layout/AppShell.tsx`)**
   - Only mount `<PlatformSidebarV2>` when `pinned === true`. Remove the mobile-overlay backdrop tied to unpinned state (no sidebar to dismiss).
   - Keep `contentShift` logic: shift content right only when pinned.

2. **PlatformSidebarV2 (tenant variant)**
   - Replace the internal `SidebarHeader` + `SidebarFooter` chrome with the same layout the "All" popover uses:
     - Top: `NavigationSearch` with the same actions block as `AllPopover` (refresh + pin/unpin toggle). Pin toggle here will unpin (which unmounts the sidebar; user can reopen via "All").
     - Body: `NavigationTree` in a scroll container, same props as `AllPopover`.
   - Drop the collapsed-rail mode for the tenant variant (the popover has no collapsed state; keeping them visually identical means always-expanded). Sidebar width fixed at the expanded width (`pl-72`).
   - Platform variant untouched.

3. **Header "All" button**
   - No change to `AllPopover` itself, but its pin action already calls `header.sidebar.togglePinned()` — pinning from the popover will now mount the static sidebar with identical content, matching the requested toggle behavior.

4. **Cleanup**
   - `SidebarHeader.tsx` / `SidebarFooter.tsx` become unused for the tenant variant. Leave the files in place if the platform variant still uses them; otherwise mark unused imports removed in `PlatformSidebarV2`.

## Out of scope

- Platform (super admin) shell sidebar.
- Any change to Favorites / History popovers.
- Keyboard shortcut contract.

## Verification

- Typecheck.
- Manually confirm: unpinned = no sidebar, "All" popover works; click pin inside "All" or sidebar → sidebar mounts with identical search + tree; click unpin → sidebar unmounts.
