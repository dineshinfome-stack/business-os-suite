## Anchor Favorites/Recent popups to the "All" button position

Right now clicking All, Favorites, or Recent opens the unpinned sidebar dropdown under whichever button was clicked, so Favorites and Recent slide out mid-page. Change it so all three tabs open the popup at the same left position — aligned to the "All" button — while still switching the active tab.

### Change

**`src/components/platform/PlatformSecondaryHeader.tsx`**
- Add a ref to the "All" `TabButton`.
- In the click handler, always call `setTab(t)`, and when unpinned call `openFromAnchor(allButtonRef.current)` regardless of which tab was clicked (All / Favorites / Recent).
- Remove the per-button `e.currentTarget` anchor.

### Out of scope

- No change to pinned mode, edge-hover trigger, popup width, styling, or close behavior.
- No change to `PlatformShell`, `PlatformSidebarV2`, or the popup context — `openFromAnchor(el)` already accepts any element.

### Verification

- Unpinned + click All → dropdown opens under All (unchanged).
- Unpinned + click Favorites → dropdown opens under All's left edge, showing the Favorites pane.
- Unpinned + click Recent → same left position, showing the Recent pane.
- Pinned mode and left-edge hover trigger unchanged.
