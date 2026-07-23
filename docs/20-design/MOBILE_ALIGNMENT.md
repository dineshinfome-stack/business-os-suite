---
title: "Mobile Alignment"
summary: "Cross-platform interaction parity notes: what the web and mobile experiences share and where they intentionally diverge."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "mobile", "parity"]
---

# Mobile Alignment

## Principle

Mobile is not a shrink of web. Field tasks are first-class on mobile; operator-console tasks are first-class on web. Parity applies to concepts, tokens, and outcomes — not to layouts or gestures.

## Shared

- Semantic design tokens (colors, spacing, radii, typography roles).
- Concept vocabulary from `DOMAIN_MODEL_STANDARD.md`.
- Iconography.
- Auth, tenancy, RBAC, audit contracts.
- API v1 (`INTEGRATION_READINESS_STANDARD.md`).

## Divergent by Design

- Navigation model — tabs on mobile, sidebar on web.
- Data grids — card lists on mobile, dense grids on web.
- Bulk actions — long-press selection on mobile, checkboxes on web.
- Forms — one-field-per-screen on mobile for complex flows; multi-column dense forms on web.

## Cross-Platform Certification

Every module publishes a Cross-Platform Certification (CPC) artifact confirming outcome parity for the module's primary journeys.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
