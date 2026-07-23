---
title: "Performance Budgets Standard"
summary: "Three-tier performance budgets (Target / Warning / Maximum) for dashboards, APIs, tables, JS bundles, and database queries."
document_type: "Governance Standard"
layer: "governance"
owner: "Platform / Performance"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "performance", "budgets"]
---

# Performance Budgets Standard

## Purpose

Give engineers unambiguous, tiered performance targets so that minor deviations are visible but not release-blocking, while regressions past the maximum are automatic release blockers.

## Three-Tier Model

- **Target** — the intended experience. Design and build to this number.
- **Warning** — deviation permitted but tracked. A warning finding is logged during the next Architecture Review Gate.
- **Maximum** — release blocker. Exceeding this number is a HIGH severity finding.

## Budgets

| Surface | Metric | Target | Warning | Maximum |
| ------- | ------ | ------ | ------- | ------- |
| Dashboard first paint | LCP (p75) | 1.5 s | 2.5 s | 4.0 s |
| Dashboard interactive | TTI (p75) | 2.0 s | 3.0 s | 5.0 s |
| API read | Server latency p50 | 100 ms | 250 ms | 500 ms |
| API read | Server latency p95 | 300 ms | 700 ms | 1500 ms |
| API write | Server latency p95 | 500 ms | 1000 ms | 2500 ms |
| Data grid render | 100 rows | 100 ms | 250 ms | 500 ms |
| Data grid render | 1000 rows | 300 ms | 700 ms | 1500 ms |
| JS bundle | Initial route (gzip) | 180 KB | 250 KB | 350 KB |
| JS bundle | Per-lazy-route (gzip) | 60 KB | 100 KB | 150 KB |
| Database query | p95 (single-tenant read) | 20 ms | 100 ms | 300 ms |
| Database query | p95 (report) | 500 ms | 1500 ms | 3000 ms |

## Rules

- Every module PRD MUST declare which surfaces it introduces and confirm the budgets applied.
- Every module verification report MUST include a performance section against this standard.
- Values above are baseline; a module MAY tighten (never loosen) its own budgets in its PRD.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
