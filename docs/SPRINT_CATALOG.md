---
title: "Sprint Catalog"
summary: "Catalog of every Sprint PRD (SPR-MOD-NNN-NNN): stable identifier, iteration label, parent module, status, PRD path, and owner. Ships empty; populated iteratively in Pass 8.x."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["sprint", "catalog", "index"]
document_type: "Governance Guide"
---

# Sprint Catalog

> **Derived document.** Projection of `docs/30-sprint-prds/`. Authoritative sprint scope lives in each `SPR-MOD-NNN-NNN.md`. On any conflict, the Sprint PRD wins and this catalog is corrected in the same change.

## Purpose

The **Sprint Catalog** enumerates every Sprint PRD, keyed by its permanent `SPR-MOD-NNN-NNN` identifier. Rows link to the authoritative Sprint PRD file.

## How to Read

- **Sprint ID** — permanent identifier `SPR-MOD-NNN-NNN`. Never reassigned or reused.
- **Iteration** — human-readable schedule label (e.g. `Sprint 1`, `2026-Q3-S1`). MAY change without touching the Sprint ID.
- **Parent Module** — `MOD-NNN` — <module name>.
- **Status** — `Draft` \| `Planned` \| `In Progress` \| `Done` \| `Superseded`.
- **PRD** — link to the Sprint PRD file.
- **Owner** — sprint-owning team.

## Maintenance Note

This catalog SHOULD be regenerated or reviewed whenever a Sprint PRD is added, renamed, superseded, or transitions status. It MUST NOT become an independent source of truth.

## Catalog

| Sprint ID | Iteration | Parent Module | Status | PRD | Owner |
| --- | --- | --- | --- | --- | --- |
| SPR-MOD-001-001 | Sprint 1 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md`](30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md) | Platform |
| SPR-MOD-001-002 | Sprint 2 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md`](30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md) | Platform |
| SPR-MOD-001-003 | Sprint 3 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-003-users-roles-permissions.md`](30-sprint-prds/platform/SPR-MOD-001-003-users-roles-permissions.md) | Platform |
| SPR-MOD-001-004 | Sprint 4 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md`](30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md) | Platform |
| SPR-MOD-001-005 | Sprint 5 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md`](30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md) | Platform |
| SPR-MOD-001-006 | Sprint 6 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-006-audit-review-platform-administration.md`](30-sprint-prds/platform/SPR-MOD-001-006-audit-review-platform-administration.md) | Platform |
| SPR-MOD-002-001 | Sprint 1 | MOD-002 Accounting | Draft | [`30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md`](30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md) | Accounting |
| SPR-MOD-002-002 | Sprint 2 | MOD-002 Accounting | Draft | [`30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md`](30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md) | Accounting |
| SPR-MOD-002-003 | Sprint 3 | MOD-002 Accounting | Draft | [`30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`](30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md) | Accounting |
| SPR-MOD-002-004 | Sprint 4 | MOD-002 Accounting | Draft | [`30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md`](30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md) | Accounting |
| SPR-MOD-002-005 | Sprint 5 | MOD-002 Accounting | Draft | [`30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md`](30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md) | Accounting |

Sprint PRDs are authored iteratively in Pass 8.x. Each new sprint MUST be registered here and in its module subfolder README under `docs/30-sprint-prds/<module>/README.md`.

## References

- `docs/30-sprint-prds/README.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/99-templates/sprint-prd-template.md`
