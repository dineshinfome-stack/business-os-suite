---
title: "ADR-007: Core ERP Module Boundaries"
summary: "Ratifies the current functional boundaries of the Core ERP modules (MOD-002, MOD-003, MOD-004, MOD-005, MOD-019). Inventory owns items/warehouses/bins/ledger/valuation; Warehouse owns physical execution, labor, and equipment; the two integrate via events."
adr_id: "ADR-007"
status: "Accepted"
owner: "Architecture"
category: "Architecture"
created: "2026-07-20"
updated: "2026-07-20"
related_docs:
  - "docs/51-architecture-validation/PHASE4_5_CORE_ERP_DOMAIN_VALIDATION_20260720T040000Z.md"
  - "docs/20-module-prds/inventory/MODULE_PRD.md"
  - "docs/20-module-prds/warehouse/MODULE_PRD.md"
related_engines: ["ENG-015", "ENG-016", "ENG-024"]
affected_documents:
  - "docs/BUSINESS_OS_EXECUTION_ROADMAP.md (sequence update — follow-up)"
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture", "module-boundaries", "core-erp"]
document_type: "Architecture Decision Record"
---

# ADR-007: Core ERP Module Boundaries

## Metadata

- **ADR ID:** ADR-007
- **Title:** Core ERP Module Boundaries
- **Status:** Accepted
- **Date:** 2026-07-20
- **Owner:** Architecture
- **Decision Type:** Architecture
- **Related ADRs:** ADR-001 (Modular Monolith), ADR-002 (DDD), ADR-072 (Module Boundaries — governance)
- **Related Modules:** MOD-002, MOD-003, MOD-004, MOD-005, MOD-019

## Context

Phase 4.5 (Core ERP Domain Architecture Validation) was executed as a one-time architectural checkpoint before Wave 1 Solution Design authoring. The specific concern raised was whether the Inventory (MOD-005) vs. Warehouse (MOD-019) split — declared during Pass 10.1 — remains the correct decomposition, and whether Purchase, Sales, Inventory, and Warehouse capabilities are unambiguously owned.

The validation examined 39 Core ERP capabilities, six master-data groups, and five end-to-end processes (Procure-to-Pay, Order-to-Cash, Inventory Replenishment, Warehouse Operations, Inter-Warehouse Transfer) against the five module PRDs.

## Problem Statement

Before authoring dozens of Solution Design documents for these five modules, ratify (or adjust) the module boundaries and capability ownership so that Wave 1 SD authoring does not require rework of PRDs, Publications, or SDs.

## Decision

The current Core ERP module boundaries are **confirmed as-is**:

1. **MOD-005 Inventory** is the system of record for **Items, Item Categories, Units of Measure, Warehouses, Bins/Locations, Stock Balance, Stock Ledger, and Inventory Valuation**. It owns the logical stock lifecycle: Stock Receipt, Stock Issue, Stock Transfer, Stock Adjustment, and Physical Count transactions.
2. **MOD-019 Warehouse** owns **physical execution** against MOD-005's stock lifecycle: inbound (unloading, putaway), storage (slotting, internal replenishment), outbound (picking, packing, loading, dispatch handover), and yard/dock/labor/equipment operations. Warehouse **zones and areas overlay** MOD-005's warehouse/bin master; they do not redefine it.
3. **MOD-004 Purchase** owns the Procure-to-Pay document lifecycle (Requisition, RFQ, PO, Goods Receipt as a business document, Supplier Invoice, 3-way match, Purchase Return). It emits `GoodsReceived`; MOD-005 emits the corresponding `StockReceived` ledger event.
4. **MOD-003 Sales** owns the Order-to-Cash document lifecycle (Quotation, Sales Order, Delivery document, Invoice, Sales Return, Credit Note). Physical picking/packing/loading is delegated to MOD-019; ledger effects post through MOD-005 and MOD-002.
5. **MOD-002 Accounting** owns Chart of Accounts, GL/journals, AP, AR, Banking, Tax, and Period Close. All operational modules post to MOD-002 exclusively via ENG-016 Posting Engine.

**Additional decision (implementation sequencing).** The Wave 1 Solution Design authoring order is corrected to reflect the declared `depends_on` DAG:

```text
MOD-001 Platform → MOD-002 Accounting → MOD-005 Inventory → { MOD-004 Purchase, MOD-003 Sales } → MOD-019 Warehouse
```

This corrects the previously implied order that placed Sales and Purchase ahead of Inventory. Sales and Purchase both declare `depends_on: MOD-005 Inventory` (Item Master, Stock Balance) and must be authored after MOD-005.

## Alternatives Considered

1. **Fold MOD-019 back into MOD-005.** Rejected. Physical execution (labor, equipment, dock scheduling, slotting) has distinct personas (Warehouse Operator, Dock Supervisor, Yard Coordinator), distinct external integrations (WCS, RFID, telematics), and distinct KPIs (labor productivity, dock utilization). Combining would violate Single Responsibility and produce a module with two disjoint personas.
2. **Move Item Master to MOD-019.** Rejected. Item is used by Sales, Purchase, Manufacturing, POS, and Accounting valuation — none of which depend on Warehouse. Item ownership must live upstream of all consumers.
3. **Split Sales' Delivery document from MOD-003.** Rejected. The Delivery document is the sales-side contractual artifact; picking/packing/loading are the physical execution. The document/execution split is the correct seam and is already the pattern used for Purchase's Goods Receipt.

## Trade-offs

- **Two-module handoff (Inventory ↔ Warehouse) requires event contracts** (`PutawayCompleted`, `PickCompleted`, `StockReceived`, `StockIssued`). Slightly higher integration surface than a monolithic warehouse-inventory module — accepted because it preserves clean personas and enables independent scale of physical execution.
- **Sequencing correction** delays Sales/Purchase SD authoring by one wave slot. Accepted because it prevents contract rework once MOD-005's item and stock APIs stabilize.

## Consequences

- No PRD, Publication, or Baseline is modified by this ADR.
- The Wave 1 SD authoring queue is updated to the corrected sequence (follow-up editorial change to `BUSINESS_OS_EXECUTION_ROADMAP.md`).
- Cross-module dependency linter (ADR-072) MUST enforce: MOD-019 may not write to MOD-005's stock ledger directly — only via published events / MOD-005 APIs.
- Cross-module dependency linter MUST enforce: MOD-002 is not imported directly by MOD-003/004/005/019 for posting; posting flows only through ENG-016.

## Migration Strategy

No migration required — this ADR ratifies the existing declared architecture.

## Backward Compatibility

None affected. No shipped module exists whose contracts change.

## Risks

- **Risk:** Sales or Purchase teams later attempt to embed physical execution logic. **Mitigation:** dependency linter + PR review checklist; escalate to ADR supersession if a real need emerges.
- **Risk:** Inventory or Warehouse duplicate Item/Bin state locally for performance. **Mitigation:** allowed as read-model caches only; write-of-record must remain MOD-005.

## Rejected Options

See Alternatives Considered.

## Implementation Notes

Boundaries are enforced by:

- Module PRD `depends_on` graph (already declared correctly).
- Cross-module dependency linter per ADR-072.
- Event-only integration between MOD-019 and MOD-005 for ledger effects.
- ENG-016 Posting Engine as the single seam to MOD-002.

## Future Review Trigger

Re-open this ADR if any of the following occurs:

- A new module (e.g., 3PL orchestration, e-commerce fulfilment) needs to write to the stock ledger.
- Warehouse execution needs to own item-level attributes beyond zone/slot overlay.
- The declared `depends_on` DAG changes shape (new upstream/downstream edges).

## References

- `docs/51-architecture-validation/PHASE4_5_CORE_ERP_DOMAIN_VALIDATION_20260720T040000Z.md`
- `docs/20-module-prds/inventory/MODULE_PRD.md`
- `docs/20-module-prds/warehouse/MODULE_PRD.md`
- `docs/20-module-prds/sales/MODULE_PRD.md`
- `docs/20-module-prds/purchase/MODULE_PRD.md`
- `docs/20-module-prds/accounting/MODULE_PRD.md`
- `docs/11-adrs/engineering/ADR-072-module-boundaries.md`
