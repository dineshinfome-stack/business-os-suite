---
title: "MOB-005 — Inventory Mobile Solution Design Specification"
summary: "Mobile solution design for MOD-005 Inventory: floor-facing screens for stock lookups, transactions, and physical counts."
layer: "design"
owner: "Supply Chain"
status: "approved"
updated: "2026-07-20"
spec_id: "MOB-005"
module_id: "MOD-005"
platform: "mobile"
depends_on: ["docs/20-module-prds/inventory/MODULE_PRD.md", "docs/60-solution-design/web/inventory/WEB-005_INVENTORY.md"]
tags: ["solution-design", "mobile", "inventory"]
document_type: "Solution Design"
---

# MOB-005 — Inventory Mobile Solution Design Specification

## 1. Purpose

Floor-facing mobile surface for MOD-005 Inventory. Optimised for barcode scanning, offline capture (queued), and rapid one-handed operation. Not a replacement for the Web SD — mobile carries the subset needed by field roles.

## 2. Scope

**In scope.** Item lookup, stock lookup by bin/item, stock receipt/issue/transfer capture, adjustment capture, physical count sessions, reservation view.

**Out of scope.** Item master creation, warehouse/bin master creation, valuation dashboards (web-only).

## 3. Personas

Stores Officer, Inventory Controller (field).

## 4. Screen Inventory

| # | Screen | Primary Action |
| --- | --- | --- |
| 1 | Home / Recent | Quick actions + recent transactions |
| 2 | Item Lookup (scan or search) | Show current stock across warehouses |
| 3 | Bin Lookup | Show contents of a bin |
| 4 | Stock Receipt Capture | Scan item, enter qty, submit |
| 5 | Stock Issue Capture | Scan item, enter qty, submit |
| 6 | Stock Transfer Capture | Scan from-bin, to-bin, item, qty |
| 7 | Adjustment Capture | Scan item, delta qty, reason |
| 8 | Physical Count Session | Session list → count entry per bin |
| 9 | Reservation Viewer | Read-only reservations for scanned item |
| 10 | Sync Queue | Offline queue status and retry |

## 5. Interaction Model

- Primary input: camera (barcode/QR) and numeric pad.
- Offline-first per ADR-0009: queued transactions submit when connectivity returns; conflict surfaces per event replay outcome.
- Approval-gated actions (adjustments over threshold) render an approval-request submit path, not a local commit.

## 6. Data Contracts

- Consumes: same as WEB-005.
- Produces: identical transactional payloads to WEB-005; the API is the single contract.

## 7. Business Rules Surfaced in UI

Same as WEB-005 §7; presented as inline banners and confirmation dialogs.

## 8. Traceability

- PRD: MOD-005 PRD §§2, 5, 6, 8.
- Baseline: `MOD005_INVENTORY_BASELINE_v1`.
- ADRs: ADR-007, ADR-0009 (Offline).
- Parity: WEB-005 (superset), API-005 (single contract).

## 9. References

- `docs/20-module-prds/inventory/MODULE_PRD.md`
- `docs/60-solution-design/web/inventory/WEB-005_INVENTORY.md`
