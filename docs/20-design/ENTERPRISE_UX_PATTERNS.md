---
title: "Enterprise UX Patterns"
summary: "Dense-data-entry, keyboard-first, and operator-productivity patterns for Business OS."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "patterns", "enterprise"]
---

# Enterprise UX Patterns

## Keyboard Shortcuts

- Global palette: `⌘K` / `Ctrl+K`.
- Save: `⌘S`.
- New: `N`.
- Search: `/`.
- Close dialog: `Esc`.
- Row selection: `Space`. Range: `Shift+↑/↓`.

Every screen documents its shortcuts on `?`.

## Bulk Actions

- Selection persists across pagination.
- Selection summary sticky at top of grid.
- Destructive bulk actions require confirmation naming the count.

## Multi-Select

- Row-level checkbox in leading column.
- `Select all` selects the current page; `Select all N matching` selects the full result set.

## Inline Editing

- Double-click or `Enter` enters edit mode.
- `Esc` cancels; `Enter` commits; `Tab` commits and moves to next cell.
- Errors surface on the cell, not as a toast.

## Global Search

- Fuzzy match on name, code, number across entities the user can access.
- Results grouped by entity type.
- Keyboard navigable end-to-end.

## Command Palette

- Actions, navigation, and recent items in one surface.
- Actions honor RBAC — filtered before render.

## Breadcrumbs

- Present on every page deeper than one level from a module root.
- Last segment is the current page title, unlinked.

## Sticky Toolbars

- Filter, sort, and bulk toolbars stay visible while scrolling long tables.
- Form save / discard bar sticks to the bottom when unsaved.

## Dense Data Entry

- Row height, cell padding, and font size tuned for hours-per-day use.
- Numeric cells right-aligned with tabular numerals.
- Currency cells align on the decimal.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
