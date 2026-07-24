# Plan — Worksuite-Style Super Admin Shell & Dashboard

Restyle the Super Admin (Platform) surface to match the uploaded Worksuite reference: dark left sidebar with light content area, compact top bar, and a KPI + reports dashboard layout. Scope is presentation-only under the `/platform/*` route tree; no RBAC, routing, or data-model changes.

## 1. Scoped Platform Shell

Create a dedicated `PlatformShell` used only under `_authenticated/platform/*` so the existing tenant AppShell is untouched.

- **Left Sidebar (dark)**
  - Fixed 240px, background `--surface-inverse` (near-black `#1f2933`-ish), light text.
  - Top: square brand tile ("W" mark on Enterprise Red) + product name + user line with green status dot ("● Katelyn Denesik" style, wired to current user).
  - Menu items with lucide icons + label, 44px rows, red left-border + subtle red tint on active. Groups: Dashboard, Packages, Companies, Billing, Admin FAQ, Super Admin, Offline Request, Support Ticket, Front Settings, Settings. (Labels only — each links to existing platform routes; missing ones route to a "Coming soon" placeholder page. No new backend.)
  - Footer: "Mobile App" pill + version string.

- **Top Bar (light, 56px)**
  - Left: page title (e.g. "Super Admin Dashboard") + breadcrumb "Home • Super Admin Dashboard".
  - Right icon buttons: theme, notes, quick-add, notifications (with red dot), power/logout. Uses existing `ProfileMenu`/`HelpMenu` primitives where possible.

- **Content area**: `--surface-2` light gray, 24px padding.

## 2. Enterprise Red Theme Tokens (additive)

Add to `src/styles.css` (no removal of existing tokens):
- `--surface-inverse`, `--surface-inverse-foreground`
- `--nav-item-active-bar` (red 3px)
- `--kpi-value` (red) for dashboard numerics

## 3. Dashboard Rebuild

Rewrite `src/routes/_authenticated/platform/index.tsx` composition to match reference:

- **Row 1 — KPI cards (3-up, then 2-up)**: Total Companies, Active Companies, License Expired, Inactive Companies, Total Packages. White card, small gray label, large red number, muted icon top-right. Reuses existing `StatCard` with a new `variant="kpi"`.
- **Row 2 — Two panels**:
  - *Earnings Reports*: three big totals (Total / This Year / This Month) + month table (Month | Income).
  - *Subscription Overview*: two big totals (Active / New This Month) + month table (Month | Subscriptions).
- **Row 3 — Two panels**: *Top Paying Companies* and *Payment Gateway Breakdown* (empty-state "No record found.").
- All values marked `Sample` badge (per existing convention); no new queries.

## 4. Files

New:
- `src/components/platform/PlatformShell.tsx`
- `src/components/platform/PlatformSidebar.tsx`
- `src/components/platform/PlatformTopBar.tsx`
- `src/components/platform/nav-items.ts` (static menu config)
- `src/components/dashboard/ReportPanel.tsx` (reusable totals+table panel)

Modified:
- `src/routes/_authenticated/platform/route.tsx` (or `index.tsx` layout) — wrap children in `PlatformShell` instead of default `AppShell`.
- `src/routes/_authenticated/platform/index.tsx` — new composition.
- `src/styles.css` — add tokens listed above.
- `src/components/dashboard/StatCard.tsx` — add `kpi` variant.

Untouched: navigation registry, RBAC gates, ADR-009 tenant model, tenant-side AppShell, migrations.

## 5. Out of scope

- No new routes, permissions, or DB tables.
- No changes to tenant-facing shell/nav.
- Placeholder menu links (Packages, Billing, etc.) resolve to a shared "Coming soon" page — no functional modules built in this pass.
- No mobile-specific redesign; desktop parity only.

## 6. Verification

- `tsgo` typecheck clean.
- Playwright screenshot of `/platform` compared to the reference for layout parity.
- Confirm `/tenant/*` routes still render the existing AppShell unchanged.
