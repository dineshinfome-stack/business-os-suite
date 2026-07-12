---
title: "Module Baselines — Layer README"
summary: "Frozen Module Baselines produced at Stage 3 of the module implementation workflow. One versioned baseline per module (MOD-001 … MOD-018)."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-10"
tags: ["baseline", "module", "governance", "stage-3"]
document_type: "Layer Guide"
---

# Module Baselines

> **Authoritative and versioned.** Each Module Baseline in this folder freezes a module for downstream consumption at the moment its Sprint PRD family (Stage 2) is complete. Baselines are reference consolidations only — they do not introduce new requirements, engines, ADRs, or Sprint PRDs. Future changes to a module require a new versioned baseline revision (e.g. `_v2`) rather than in-place edits.

## Purpose

Module Baselines are the output of **Stage 3** of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md). They:

- Certify that every Sprint PRD reserved in the module's Stage 1 plan is `Done`.
- Consolidate the Sprint PRDs delivered, the ERP Core Engines consumed, and the Accepted ADRs consumed.
- Freeze the module so downstream modules may depend on its capabilities.
- Establish versioned governance analogous to a published API or database schema version.

## Naming Convention

`MOD<NNN>_<MODULE>_BASELINE_v<version>.md`

- `MOD<NNN>` — the module identifier (permanent).
- `<MODULE>` — short module name in SCREAMING_SNAKE case (e.g. `PLATFORM`, `ACCOUNTING`).
- `v<version>` — integer version starting at `v1`. New versions replace older ones by supersession, never by editing.

## Content Contract

Every baseline mirrors the same section order (see [`MOD001_PLATFORM_BASELINE_v1`](./MOD001_PLATFORM_BASELINE_v1.md) for the canonical shape):

1. Purpose
2. Module Scope
3. Implemented Sprint Summary
4. Capability Coverage (Module PRD → Sprint PRDs)
5. ERP Core Engine Consumption — **derived** from the union of `related_engines` and body citations across the module's Sprint PRDs. No engine may be added or omitted.
6. ADR Consumption — **derived** identically from `related_adrs`.
7. Governance Conventions Established (reference only)
8. Module Completion & Freeze Statement
9. Deferred Items
10. Downstream Dependencies
11. References

## Current Baselines

| Baseline | Module | Version | Status |
| --- | --- | --- | --- |
| [`MOD001_PLATFORM_BASELINE_v1`](./MOD001_PLATFORM_BASELINE_v1.md) | MOD-001 Platform Administration | 1.0 | Baseline |
| [`MOD002_ACCOUNTING_BASELINE_v1`](./MOD002_ACCOUNTING_BASELINE_v1.md) | MOD-002 Accounting | 1.0 | Baseline |
| [`MOD003_SALES_BASELINE_v1`](./MOD003_SALES_BASELINE_v1.md) | MOD-003 Sales | 1.0 | Baseline |
| [`MOD004_PURCHASE_BASELINE_v1`](./MOD004_PURCHASE_BASELINE_v1.md) | MOD-004 Purchase | 1.0 | Baseline |
| [`MOD005_INVENTORY_BASELINE_v1`](./MOD005_INVENTORY_BASELINE_v1.md) | MOD-005 Inventory | 1.0 | Baseline |
| [`MOD019_WAREHOUSE_BASELINE_v1`](./MOD019_WAREHOUSE_BASELINE_v1.md) | MOD-019 Warehouse | 1.0 | Baseline |

The full index across all modules lives in [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md).

## References

- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md)
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md)
- [`docs/SPRINT_CATALOG.md`](../SPRINT_CATALOG.md)
- [`docs/DOCUMENT_OWNERSHIP_MATRIX.md`](../DOCUMENT_OWNERSHIP_MATRIX.md)
