## Pin/Unpin Sidebar Behavior (ServiceNow-style)

Make the pin toggle in the platform sidebar switch between **static** (pinned) and **popup/flyout** (unpinned) modes, matching the reference GIF.

### Behavior

- **Pinned (default):** Sidebar is fixed, always visible, shifts main content right (current behavior).
- **Unpinned:** Sidebar collapses out of layout. A slim edge trigger (menu strip) on the left of the viewport reveals the sidebar as a floating popup on hover/click. Popup auto-hides when the pointer leaves it (or on route change / Esc). Main content spans full width.
- **Popup width:** Identical to the static sidebar (`w-72` / 288px, same `topOffset`, same height).
- **Popup background:** Slightly translucent — same `--nav-bg` with reduced alpha via `color-mix(...)` plus a `backdrop-filter: blur(...)` for the ServiceNow glass feel. Applied only in popup mode; pinned mode stays fully opaque.
- Pin icon inside the sidebar toggles the two modes. Pinned state persists via existing `usePlatformNavState` (already wired to localStorage).

### Files to change

1. **`src/components/platform/PlatformShell.tsx`**
   - When `!pinned`, do not reserve space (already true). Add a hover-trigger strip on the left edge (`fixed left-0 top-24 h-full w-2`) that sets a local `hovering` state; also toggle open on click.
   - Pass a new `mode: "pinned" | "popup"` and `open: boolean` to `PlatformSidebarV2`. In popup mode, only render the sidebar when `open`.
   - Remove the current mobile overlay backdrop coupling; unpinned popup handles its own hover-out to close.

2. **`src/components/platform/navigation/PlatformSidebarV2.tsx`**
   - Accept `mode` + `open` props (keep `pinned` for the icon state).
   - Root `<aside>`: when `mode === "popup"`, apply translucent background + blur + stronger shadow, and mount/unmount based on `open` with a slide-in transition (`-translate-x-full` → `translate-x-0`). Width stays `w-72`.
   - Add `onMouseEnter` / `onMouseLeave` handlers that call back to the shell to keep it open while hovered and close on leave (with small close delay).

3. **`src/styles.css`**
   - Add tokens:
     - `--nav-bg-popup: color-mix(in oklab, var(--nav-bg) 85%, transparent)` (light)
     - Dark override: `color-mix(in oklab, var(--nav-bg) 80%, transparent)`
     - `--nav-popup-blur: 12px`
     - `--nav-popup-shadow`: stronger elevation for the floating panel
   - No other token/theme changes.

### Out of scope

- No changes to registry, permissions, routing, or tenant sidebar variant behavior (tenant shell keeps current pinned-only flow unless the same treatment is requested later).
- No new dependencies.

### Verification

- Pinned: sidebar static, content offset by `pl-72`, opaque bg — unchanged from today.
- Unpinned: content spans full width; hovering the left edge slides the sidebar in as a translucent blurred popup at `w-72`; leaving it hides it; clicking the pin re-pins.
- Works in both light and dark themes.
