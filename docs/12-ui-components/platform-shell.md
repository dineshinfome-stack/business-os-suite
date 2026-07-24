---
title: "Platform Shell & Enterprise Navigation"
summary: "Reusable Business OS application shell: top navigation, collapsible sidebar, dashboard grid, and widget framework."
document_type: "UI Component Guide"
layer: "design"
owner: "Platform"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-24"
sprint: "SPR-PLT-0005"
tags: ["ui", "shell", "navigation", "dashboard"]
---

# Platform Shell & Enterprise Navigation

Foundational UI primitives that every Business OS module composes.

## Composition

```
<AppShell>
  ├─ <AppSidebar/>              — data-driven from NAV_REGISTRY
  ├─ <header> (top navigation)
  │    ├─ <SidebarTrigger/>
  │    ├─ <Breadcrumb/>
  │    ├─ <SearchTrigger/>      — ⌘K / Ctrl+K
  │    ├─ <OrgSwitcher/>        — tenant selector
  │    ├─ <NotificationBell/>
  │    ├─ <HelpMenu/>
  │    └─ <ProfileMenu/>        — profile, prefs, theme, sign out
  ├─ <main>{children}</main>
  └─ <StatusBar/>
```

All chrome comes from `AppShell`. Route content composes `Dashboard` +
widget primitives when it needs a KPI/widget layout.

## Widget framework

Import from `@/components/dashboard`:

| Primitive               | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| `Dashboard`             | Responsive 12-col grid host for widget cards.          |
| `DashboardRow`          | 3-column row for asymmetric widget compositions.       |
| `DashboardSection`      | Titled grouping with optional description + actions.   |
| `WidgetCard`            | Generic titled card container.                         |
| `StatCard`              | KPI card: label, big number, trend, optional hint.     |
| `ActivityFeedWidget`    | Chronological list of activity items.                  |
| `ProgressWidget`        | Progress bar rows.                                     |
| `TableWidget`           | Compact tabular widget.                                |

Every widget:

- Is presentational; consumers pass data via props.
- Uses semantic tokens only — no hex, no arbitrary Tailwind colors.
- Renders empty state when given zero items.
- Marks placeholder metrics with `sample` badge until wired.

## Theme tokens (SPR-PLT-0005 additions)

Added to `src/styles.css`:

| Token                     | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `--surface-1..3`          | Elevated surface backgrounds.              |
| `--elevation-1..3`        | Shadow scale for cards / popovers.         |
| `--nav-width-expanded`    | Expanded sidebar width (16rem).            |
| `--nav-width-collapsed`   | Collapsed sidebar width (3.5rem).          |
| `--topbar-height`         | Top navigation height (3.5rem).            |

Semantic Tailwind classes: `bg-surface-1`, `bg-surface-2`, `bg-surface-3`,
`shadow-elevation-1..3`. Dark-mode values are declared under `.dark`.

## Keyboard

| Shortcut        | Action                         |
| --------------- | ------------------------------ |
| `⌘K` / `Ctrl+K` | Open command palette / search  |
| `Esc`           | Close palette / dialogs        |
| `Tab` / `Shift+Tab` | Traverse focusable elements |

## Accessibility

- `<header role="banner">`, `<main role="main">`, `<footer role="contentinfo">`.
- Icon-only buttons carry `aria-label`.
- Sidebar navigation is fully keyboard-navigable via shadcn `Sidebar` primitives.
- Focus indicators use the `ring` design token.

## Governance

- No hardcoded colors in components.
- Widgets have no data dependencies; live data is added in the owning module.
- `NAV_REGISTRY` is the single source of truth for navigation.
