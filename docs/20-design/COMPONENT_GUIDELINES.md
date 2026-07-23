---
title: "Component Guidelines"
summary: "Component-first catalog for Business OS: purpose, anatomy, states, do and don't for every core UI component."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "components", "shadcn"]
---

# Component Guidelines

## Catalog

Every component below MUST document purpose, anatomy, states (default, hover, active, focus, disabled, loading, error), and do / don't.

- Button (primary, secondary, tertiary, destructive, ghost, icon)
- Input (text, number, mask, currency)
- Select (single, multi, async)
- Table / DataGrid
- Card
- Dialog
- Drawer
- Sidebar
- Header
- Tabs
- Badge
- Alert
- Toast
- Empty State
- Loading State
- Chart (line, bar, area, sparkline)
- KPI Card
- Timeline
- Activity Feed

## Rules

- Components live under `src/components/**` and consume semantic tokens only.
- Every component has a keyboard interaction spec.
- Every component has a light and dark rendering documented.
- No component ships without at least one storybook / preview example (UX-2 deliverable).

## Do / Don't (Global)

**Do**

- Prefer composition over configuration.
- Provide loading and empty states for every data-bound component.
- Preserve tab order.

**Don't**

- Nest interactive controls (button-in-button, link-in-link).
- Use color as the sole differentiator of state.
- Reinvent primitives already in shadcn/ui.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
