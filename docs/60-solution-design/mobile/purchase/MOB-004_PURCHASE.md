---
title: "MOB-004 — Purchase Mobile Solution Design Specification"
summary: "Mobile solution design for MOD-004 Purchase: approvals, receipt confirmation, supplier lookup."
layer: "design"
owner: "Procurement"
status: "approved"
updated: "2026-07-20"
spec_id: "MOB-004"
module_id: "MOD-004"
platform: "mobile"
depends_on: ["docs/20-module-prds/purchase/MODULE_PRD.md", "docs/60-solution-design/web/purchase/WEB-004_PURCHASE.md"]
tags: ["solution-design", "mobile", "purchase"]
document_type: "Solution Design"
---

# MOB-004 — Purchase Mobile Solution Design Specification

## 1. Purpose

Mobile surface for MOD-004 for on-the-go approvers and buyers.

## 2. Scope

**In scope.** Requisition/PO/Invoice approvals, supplier lookup, GRN confirmation (business document capture; physical unloading remains MOD-019), 3-way match summary view.

**Out of scope.** RFQ authoring, master data creation.

## 3. Screen Inventory

| # | Screen | Action |
| --- | --- | --- |
| 1 | Home / Pending Approvals | List |
| 2 | Approval Detail | Approve / Reject / Comment |
| 3 | Supplier Lookup | Search + detail |
| 4 | PO Lookup | Search + detail |
| 5 | GRN Capture | Confirm receipt against a PO line |
| 6 | Invoice Snapshot | Read-only 3-way match summary |
| 7 | Notifications | Approval + match alerts |

## 4. Interaction Model

Approval-first UX with swipe actions and one-tap approve. Offline queue for approvals per ADR-0009.

## 5. Data Contracts

Same API contracts as WEB-004; mobile is a strict subset.

## 6. Traceability

- PRD: MOD-004 PRD §§2, 5, 6.
- Parity: WEB-004 (superset), API-004 (contract).

## 7. References

- `docs/60-solution-design/web/purchase/WEB-004_PURCHASE.md`
