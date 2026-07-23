---
title: "Layout Standard"
summary: "Canonical layouts for login, dashboard, module pages, forms, detail pages, tables, and reports."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "layout"]
---

# Layout Standard

## Global Chrome

```text
┌─────────────────────────────────────────────────────────┐
│ Header (org switcher, global search, user menu)         │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Route Content                               │
│          │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

## Layouts

- **Login / Auth** — centered card, brand mark, minimal chrome.
- **Dashboard** — 12-column grid, KPI row, chart row, activity + shortcuts row.
- **Module list page** — filter panel (collapsible left), data grid (main), bulk toolbar (sticky top).
- **Module detail page** — header (identity + status + primary actions), tabs (Overview, Related, Activity, Audit), right rail (metadata).
- **Form page** — single column ≤ md, two columns ≥ lg. Sections separated by rules, not cards.
- **Report page** — parameter bar (top), result table (main), export toolbar.

## Rules

- Sidebar collapses to icon-only at ≤ md.
- Sticky headers on tables and forms with unsaved changes.
- Primary action button lives top-right on every detail page.
- Breadcrumbs are mandatory beyond depth 1.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
