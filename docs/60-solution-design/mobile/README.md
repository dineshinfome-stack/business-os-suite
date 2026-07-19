---
title: "MOB Specifications — Family Index"
summary: "Index of Phase 3 MOB specifications. No specifications authored at framework establishment; one MOB spec is planned per Published Module."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-18"
tags: ["solution-design", "mobile", "phase-3", "SD-001"]
document_type: "Family Index"
---

# MOB Specifications — Family Index

Mobile platform specifications for Phase 3 — Solution Design.

## Purpose

Each MOB specification defines mobile workflows, offline behaviour, push notifications, camera, voice, device capabilities, mobile navigation, and synchronisation for its source Published Module. See [`../README.md`](../README.md) §3.2 for the full scope.

## Naming

`MOB-<NNN>` where `<NNN>` matches the source `MOD-<NNN>` in [`docs/MODULE_PUBLICATION_CATALOG.md`](../../MODULE_PUBLICATION_CATALOG.md).

## Coverage Rule

One planned MOB specification per Published Module. Derived dynamically from the Module Publication Catalog; no hard-coded range.

## Traceability

Every MOB specification MUST reference: Published Module, Module PRD, Sprint Plan, Sprint PRDs, Module Baseline. No business requirements may be introduced. See [`../README.md`](../README.md) §6.

## Current Specifications

| Spec ID | Source Module | Lifecycle State | Owner | Updated |
| --- | --- | --- | --- | --- |
| [MOB-001](./MOB-001_PLATFORM_ADMINISTRATION.md) | MOD-001 Platform Administration | Active | Architecture Office | 2026-07-18 |
| [MOB-002](./MOB-002_ACCOUNTING.md) | MOD-002 Accounting | Active | Accounting | 2026-07-19 |
| [MOB-017](./MOB-017_ANALYTICS.md) | MOD-017 Analytics | Active | Insights | 2026-07-18 |
| [MOB-018](./MOB-018_AI_WORKSPACE.md) | MOD-018 AI Workspace | Active | AI Platform | 2026-07-18 |
| [MOB-003](../../46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN.md) | MOD-003 Sales | `MOB003_SOLUTION_DESIGNED` | Sales | 2026-07-19 (authored under the `46-` surface per Pass 38.3.0 direction; see `MOB003_SOLUTION_DESIGN_VERIFICATION_20260719T190000Z` INFO-01) |

## References

- [`../README.md`](../README.md)
- [`../SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
