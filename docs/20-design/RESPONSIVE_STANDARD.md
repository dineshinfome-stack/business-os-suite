---
title: "Responsive Standard"
summary: "Breakpoints, sidebar collapse behavior, table strategies, and dialog / drawer adaptation across viewports."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "responsive", "breakpoints"]
---

# Responsive Standard

## Breakpoints

| Name | Min width | Primary use |
| ---- | --------- | ----------- |
| `sm` | 640 px    | Phone landscape / small tablet |
| `md` | 768 px    | Tablet portrait |
| `lg` | 1024 px   | Tablet landscape / small laptop |
| `xl` | 1280 px   | Laptop |
| `2xl` | 1536 px  | Desktop |

Operator surfaces are optimized for `lg` and above; parity is maintained down to `md`; below `md`, non-critical density degrades gracefully.

## Sidebar

- ≥ `lg` — expanded, labels visible.
- `md` — collapsible; user preference persisted.
- < `md` — off-canvas drawer, toggled from header.

## Tables

- ≥ `lg` — full column set.
- `md` — non-essential columns collapse into a row-detail expander.
- < `md` — card view keyed on the entity's primary identifier.

## Dialogs / Drawers

- Dialog ≥ `md`, full-screen sheet < `md`.
- Drawer width capped at 480 px on desktop.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
