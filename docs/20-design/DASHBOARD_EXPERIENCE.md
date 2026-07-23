---
title: "Dashboard Experience"
summary: "KPI cards, chart usage, widgets, activity feeds, notification surfaces, and workspace customization rules for the dashboard system."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "dashboard", "kpi"]
---

# Dashboard Experience

## Composition

The default dashboard is a persona-tuned composition of:

1. **KPI row** — 4 to 6 KPI cards. Number + trend + link to underlying report.
2. **Chart row** — 1 to 3 charts. Time series preferred over categorical for operator dashboards.
3. **Activity + shortcuts row** — activity feed + primary actions specific to the persona.
4. **Alerts strip** — dismissible, deduplicated, RBAC-filtered.

## KPI Cards

- Number is the largest element.
- Trend is a directional arrow + delta over the compared period.
- Every KPI links to the report or list that produced it.
- No KPI without a data-refresh timestamp.

## Charts

- Line for time series. Bar for categorical comparison. Area for stacked composition. Sparkline inside KPI cards.
- Legends optional when three or fewer series.
- Tooltips are the primary data-read surface.

## Widgets

- Widgets are opt-in per persona.
- Every widget declares its permission requirements; hidden if the user lacks them.

## Activity Feeds

- Reverse-chronological.
- Grouped by entity when three or more events on the same entity in an hour.

## Notification Surfaces

- Header bell for user notifications.
- Alerts strip for tenant-wide operational alerts.
- Toast only for immediate feedback on user-initiated actions.

## Customization

- Widget add / remove / reorder is a per-user preference within the persona's allowed set.
- Persona templates are administered at the organization level.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
