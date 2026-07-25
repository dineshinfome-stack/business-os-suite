## Problem

In the light theme, the sidebar Filter input's text/placeholder ("Filter") is invisible because `NavigationSearch` renders it with `color: var(--nav-fg-strong)`, and `.enterprise-sidebar[data-variant="platform"]` in `src/styles.css` hardcodes `--nav-fg-strong: #ffffff` regardless of theme. In light mode the platform sidebar background is white, so white-on-white hides the placeholder and typed text.

## Fix

Single-file change in `src/styles.css`, scoped to the platform sidebar variant tokens:

1. In the base `.enterprise-sidebar[data-variant="platform"]` block (line 228), change `--nav-fg-strong: #ffffff` to `--nav-fg-strong: var(--platform-sidebar-fg)`. `--platform-sidebar-fg` already resolves to a dark ink in light mode and to the on-navy foreground in `.dark`, so this fixes light theme without regressing dark.
2. In the dark override `.dark .enterprise-sidebar[data-variant="platform"]` block (line 313), explicitly re-set `--nav-fg-strong: #ffffff` to keep dark-theme visuals byte-identical to today.

No other tokens, components, or routes are touched. The generic (non-platform) sidebar variant already resolves `--nav-fg-strong` via `var(--foreground)` and is unaffected.

## Verification

- On `/platform/dashboard` in light theme, the sidebar Filter input shows the "Filter" placeholder and typed characters in dark ink.
- Toggle to dark theme via the profile menu: the Filter input text remains white on navy, unchanged from current behavior.