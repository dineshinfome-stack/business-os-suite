## Problem

`src/components/platform/PlatformTopBar.tsx` hardcodes `text-white`, `text-white/80`, `text-white/50`, and `hover:bg-white/10`. In dark theme the topbar is navy so white icons are visible; in light theme the topbar background becomes white (`var(--sn-surface)`) so white icons/text disappear.

## Fix

Refactor `PlatformTopBar.tsx` to drive all foreground/hover colors from the same semantic tokens that already switch per theme in `src/styles.css` — no new tokens, no changes elsewhere.

Changes, all inside `PlatformTopBar.tsx`:

1. **IconBtn**: replace `text-white/80 hover:bg-white/10 hover:text-white` with token-based classes:
   - base color: `text-[color:var(--platform-sidebar-muted)]`
   - hover: `hover:bg-[color:var(--platform-sidebar-hover-bg)] hover:text-[color:var(--platform-sidebar-fg)]`

2. **Breadcrumb slash** (`text-white/50`) → `text-[color:var(--platform-sidebar-muted)]`.

3. **Title** (`text-white`) → `text-[color:var(--platform-sidebar-fg)]` (redundant with header inline `color`, but explicit for Tailwind).

4. **Brand "B" square**: keeps `text-white` (sits on solid red `--brand-red` background — correct in both themes).

5. **"business" wordmark** span: currently inherits header `color` (already token-driven) — leave as is.

No token definitions, sidebar, routes, or auth logic are touched. Dark theme visuals remain identical because `--platform-sidebar-fg` / `-muted` / `-hover-bg` already resolve to the on-navy values under `.dark`.

## Verification

- Toggle light/dark from the profile menu on `/platform/tenants` and confirm the header icons, breadcrumb slash, and title are legible in both themes.
- Confirm hover states show a subtle tint (light gray in light, navy hover in dark).