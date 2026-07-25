## Goal

Make the Admin Home hero band ("Welcome to Admin Home, Demo!") readable in Light theme: soft grey background with black text, while the current navy gradient stays for Dark theme.

## Current state (verified)

- `src/routes/_authenticated/platform/index.tsx` L152–162 renders the hero using the `sn-hero-band` utility, hardcodes `text-white` on the H1, and uses `--sn-text-onnavy-muted` for the subtitle.
- `src/styles.css` defines a single navy `--sn-hero-gradient` and `sn-hero-band` utility with no light/dark variant, so it's dark in both themes.

## Changes

**1. Introduce theme-aware hero tokens in `src/styles.css`**

Add to `:root` (light defaults):
```
--sn-hero-bg:        #eef0f4;   /* soft neutral grey, matches --platform-secondary-header-bg family */
--sn-hero-fg:        #0f1235;   /* near-black navy — reads as black on grey */
--sn-hero-fg-muted:  #4b5063;
--sn-hero-dot-1:     rgba(15, 18, 53, 0.10);
--sn-hero-dot-accent: rgba(228, 18, 124, 0.22);
```

Add to `.dark` block (preserve current look):
```
--sn-hero-bg:        var(--sn-hero-gradient);  /* keep navy → indigo gradient */
--sn-hero-fg:        var(--sn-text-onnavy);
--sn-hero-fg-muted:  var(--sn-text-onnavy-muted);
--sn-hero-dot-1:     rgba(255,255,255,0.18);
--sn-hero-dot-accent: rgba(228, 18, 124, 0.35);
```

Update the two utilities to consume the tokens:
- `sn-hero-band` → `background: var(--sn-hero-bg); color: var(--sn-hero-fg);`
- `sn-hero-dots` → use `--sn-hero-dot-1` / `--sn-hero-dot-accent` (drop the always-bright cyan/green dots so light theme stays calm; dark theme still gets the pink accent).

**2. Fix the route to stop hardcoding white**

In `src/routes/_authenticated/platform/index.tsx`:
- H1: replace `text-white` with `style={{ color: "var(--sn-hero-fg)" }}`.
- Subtitle: swap `--sn-text-onnavy-muted` for `--sn-hero-fg-muted`.

## Suggestions that fit Light theme (I'll apply as part of #1)

- **Background**: soft neutral grey `#eef0f4` — matches the new secondary header bar so the hero reads as a continuous "admin canvas" rather than a heavy banner.
- **Headline**: near-black navy `#0f1235` instead of pure `#000` — keeps brand affinity and looks less harsh on grey.
- **Subtitle**: cool slate `#4b5063` for hierarchy without losing contrast (AA on the grey background).
- **Accent dots**: drop the neon cyan/green in light mode; keep faint navy + a whisper of brand-red so the band still has texture but doesn't look like a dark-theme leftover.
- **Optional bottom hairline**: add a 1px `--sn-border` divider under the band so it separates cleanly from the "Track what's important" section.

No behavior or copy changes; Dark theme is untouched.
