---
title: "Design System"
summary: "Brand language: color roles, typography, iconography, elevation, motion, spacing, and grid for Business OS."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "brand", "system"]
---

# Design System

## Color Roles

Semantic roles only. Concrete hex values live in `DESIGN_TOKENS.md`.

- **Surface** — `surface-base`, `surface-raised`, `surface-overlay`, `surface-sunken`.
- **Text** — `text-primary`, `text-secondary`, `text-muted`, `text-inverse`.
- **Border** — `border-subtle`, `border-default`, `border-strong`.
- **Brand** — `brand-primary`, `brand-primary-hover`, `brand-primary-active`.
- **Accent** — `accent-info`, `accent-success`, `accent-warning`, `accent-danger`.
- **Focus** — `focus-ring`.

Both light and dark themes are first-class. No hardcoded hex in components.

## Typography

- **Display** — headings, KPI numbers.
- **Body** — dense operator UI.
- **Mono** — codes, identifiers, tabular numerals.

Concrete family names are chosen at token time; the system MUST avoid the default Inter / Poppins pairing.

## Iconography

- 24 px grid, 1.5 px stroke, rounded joins.
- One consistent library across the entire product.
- Icons never carry meaning without a text label at ≤ md breakpoint.

## Elevation

Six levels, mapped to token shadows. Elevation communicates hierarchy, not decoration.

## Motion

- **Micro** 120 ms, ease-out. Hover, focus.
- **Small** 200 ms, ease-out. Popovers, tooltips.
- **Medium** 260 ms, ease-in-out. Drawers, dialogs.
- **Large** 320 ms, ease-in-out. Route transitions.

Respect `prefers-reduced-motion`.

## Spacing & Grid

- Base unit 4 px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- 12-column responsive grid with 24 px gutters at ≥ lg.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
