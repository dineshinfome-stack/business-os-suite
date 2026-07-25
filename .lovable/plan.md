## Anchor the unpinned sidebar popup to the clicked All/Favorites/Recent tab

Today the unpinned popup always slides in flush against the left viewport edge, regardless of what opened it. Change it so clicking a secondary-header tab (All, Favorites, Recent) opens the sidebar as a dropdown anchored to that button.

### Behavior

- **Pinned:** unchanged — sidebar static, flush left.
- **Unpinned + hover left edge:** unchanged — slides in from left edge (existing edge trigger).
- **Unpinned + click a secondary-header tab:** switch to that tab AND open the sidebar as a dropdown positioned directly under the clicked tab button (aligned to the button's left edge). Same `w-72` width, same translucent + blurred background. Enter animation: slide/fade down from the top instead of from the left.
- Clicking the same tab again (or clicking outside / Escape / route change) closes the popup. Hovering the popup keeps it open; leaving auto-closes (existing behavior).

### Files to change

1. **`src/components/platform/PlatformShell.tsx`**
   - Add `anchorX: number | null` state (null = flush-left slide-in).
   - Provide two open helpers via context/props: `openFromEdge()` (existing hover trigger, sets `anchorX = null`) and `openFromAnchor(x)` (sets `anchorX` to the button's viewport-left).
   - Pass `anchorX` to `PlatformSidebarV2` alongside `mode` / `open`.

2. **`src/hooks/platform/useSecondaryNavTab.tsx`**
   - Extend context with an optional `onTabActivate?(el: HTMLElement)` callback the shell registers, so the header can notify the shell where the click came from without prop drilling. (Or expose a small `usePlatformSidebarPopup` hook from the shell — I'll pick whichever is smaller during implementation; behavior is identical.)

3. **`src/components/platform/PlatformSecondaryHeader.tsx`**
   - On tab click: always `setTab(...)`. Additionally, when the sidebar is unpinned, call the shell's `openFromAnchor(button.getBoundingClientRect().left)`.

4. **`src/components/platform/navigation/PlatformSidebarV2.tsx`**
   - Accept `anchorX?: number | null`.
   - When `mode === "popup"` and `anchorX != null`: render with `left: anchorX` (inline style) instead of `left-0`, keep `top: topOffset`, keep `w-72`, add rounded-b corners + full border for a dropdown look, and swap the enter animation from `slide-in-from-left-4` to `slide-in-from-top-4 fade-in`.
   - When `anchorX == null` (edge hover), keep current flush-left slide-from-left behavior.

### Out of scope

- No change to tenant sidebar variant, registry, permissions, or routing.
- No new dependencies.

### Verification

- Pinned mode unchanged.
- Unpinned + hover left edge: slides in from the left (unchanged).
- Unpinned + click "Favorites": sidebar drops down under the Favorites button, `w-72` wide, translucent/blurred, showing the Favorites tab. Same for All and Recent.
- Popup closes on Escape, outside-click (mouse leave), or route change.
