# Pass 8.9.6 — SPR-MOD-019-005 Yard, Dock & Load-Out (Stage 2 Sprint PRD)

Reuses the canonical Stage 2 template (Passes 8.9.2–8.9.5) with **Sprint 005 substitutions only**. `MOD-019_SPRINT_PLAN.md` Capability Allocation Matrix is the sole allocation authority. Frozen Governance Specification v1.0 remains authoritative. No governance amendments, no capability movement, no Sprint resequencing.

---

## Part 0 — Preflight (Read-Only)

Read verbatim:
- **Tier A**: `MODULE_IMPLEMENTATION_WORKFLOW.md`, `MODULE_CATALOG.md`, `10-erp-core/ENGINE_CATALOG.md`, `ENGINE_USAGE_MATRIX.md`, `11-adrs/ADR_INDEX.md`, `02-architecture/event-catalog.md`, `SPRINT_AUTHORING_GUIDE.md`
- **Tier B**: `20-module-prds/warehouse/MODULE_PRD.md`, `30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`
- **Reference PRDs**: SPR-MOD-019-001 … -004

Resolve verbatim from Sprint Plan §2.005 / §4.1 row 5: `sprint_name` (Yard, Dock & Load-Out), `owner` (Operations, from Module PRD), `size` (Medium), `related_engines` (ENG-002, ENG-004, ENG-007, ENG-010, ENG-012, ENG-014, ENG-017, ENG-024, ENG-025), `related_adrs` (ADR-011, ADR-014, ADR-032), Sprint 005 capabilities, Exit Criteria.

**Event Resolution Rule.** `related_events` resolves exclusively from Event Catalog; if empty, ONLY Sprint-Plan-allocated `R-EV-*` placeholders may be used. Sprint Plan §2.005 allocates: `OutboundAppointmentScheduled`, `LoadingCompleted`, `DispatchHandoverCompleted` (published) — used verbatim. No invented event IDs.

---

## Part A — Sprint Capability Allocation Gate

Authoritative source: Capability Allocation Matrix in `MOD-019_SPRINT_PLAN.md`. Module PRD used only to validate capability origin.

Produce `| Module Capability | Sprint Allocation | Status | Evidence |` covering Sprint Plan §4.1 row 5 ("Yard, dock, and load-out"), §4.3 transactions (Dock Appointment outbound, Loading Task, Dispatch Handover), §4.4 (Stock-to-Dock — load-out half).

Validate 10 gate conditions:
1. Every Sprint 005 capability originates from Module PRD.
2. Each allocated capability appears exactly once.
3–7. No Sprint 001 / 002 / 003 / 004 / 006 capability present.
8. Engines identical to Sprint Plan.
9. ADRs identical to Sprint Plan.
10. Events resolve from Event Catalog or Sprint-Plan `R-EV-*`.

**Gate FAIL ⇒ Repository Status = NOT READY, STOP.**

---

## Part B — Author Sprint PRD

Create `docs/30-sprint-prds/warehouse/SPR-MOD-019-005-yard-dock-load-out.md` (kebab-case).

### Frontmatter (deterministic resolution)

```yaml
module_id: MOD-019
sprint_id: SPR-MOD-019-005
module_name: Warehouse
sprint_name: Yard, Dock & Load-Out
document_type: Sprint PRD
stage: 2
pass: 8.9.6
version: v1.0
status: Draft
owner: Operations                # verbatim Module PRD
updated: 2026-07-11
size: Medium                     # verbatim Sprint Plan §2.005
related_engines: [ENG-002, ENG-004, ENG-007, ENG-010, ENG-012, ENG-014, ENG-017, ENG-024, ENG-025]
related_adrs: [ADR-011, ADR-014, ADR-032]
related_events: [OutboundAppointmentScheduled, LoadingCompleted, DispatchHandoverCompleted]
tags: [sprint-prd, warehouse, yard, dock, load-out, mod-019]
```

### Canonical 18 Sections

1. **Executive Summary** — Sprint purpose.
2. **Sprint Scope**
   - **Included**: Yard Management, Dock Management, Dock Scheduling/Assignment, Vehicle Arrival/Check-In, Dock Queue Management, Dock Loading, Load Verification, Truck/Shipment Loading, Load-Out Confirmation, Vehicle Departure, Yard Exceptions.
   - **Excluded**: Foundation, Receiving, Putaway, Storage & Slotting, Wave/Picking/Packing, Analytics, Labor, Equipment, Inventory Ledger/Valuation, Warehouse/Bin Master ownership, Financial Posting.
3. **Business Capabilities** — Sprint 005 only, verbatim from Sprint Plan.
4. **Functional Requirements** — Yard Registration, Vehicle Arrival, Dock Appointment/Assignment, Queue Management, Dock Loading, Load Validation, Shipment Loading, Vehicle Departure, Exception Handling.
5. **Business Processes** — Vehicle Arrival → Yard Entry → Dock Assignment → Queue Processing → Dock Loading → Load Verification → Shipment Release → Vehicle Exit.
6. **Governance** — Yard/Dock/Loading lifecycles, operational governance, configuration inheritance, audit. Governance registrations recorded exactly once.
7. **Ownership Boundaries**
   - Warehouse owns: Yard Operations, Dock Operations, **Yard Scheduling** (dock, gate, appointment, trailer, carrier, vehicle), Vehicle Movement, Dock Assignment, Truck/Shipment Loading, Load-Out Confirmation.
   - Consumes read-only: Warehouse/Bin/Item Master, Inventory Availability, Shipment Requests, Tenant/Company/Branch/Users.
   - Does NOT own: Inventory Ledger/Valuation, Warehouse/Bin Master, Accounting, Financial Posting, Sales Commercial Process.
   - **Invariant**: Warehouse SHALL NEVER directly mutate inventory balances or valuation; changes flow only through approved MOD-005 contracts.
8. **Dependencies** — MOD-001, MOD-003, MOD-005; SPR-MOD-019-001/002/003/004.
9. **ERP Core Engine Consumption** — Verbatim engines with Purpose / Reason / Consumption Boundary.
10. **ADR Consumption** — Accepted ADRs only (ADR-011, ADR-014, ADR-032), verbatim.
11. **Data Model** — Yard, Dock, Dock Appointment (outbound), Dock Assignment, Vehicle, Yard Queue, Load Plan, Truck Load, Shipment Load, Load Verification, Loading Task, Dispatch Handover, Departure Confirmation, Yard Exception Record. No schemas.
12. **Events** — Published verbatim from Sprint Plan §2.005: `OutboundAppointmentScheduled`, `LoadingCompleted`, `DispatchHandoverCompleted`. No invented IDs.
13. **Integration Contracts** — **Consume read-only** Warehouse Master, Inventory Availability, Shipment Requests, MDM, and Warehouse Configuration; **publish outbound** dock, loading, and departure status via approved integration contracts (arrival acknowledgement, dock assignment, appointment status update, loading confirmation, departure confirmation). Warehouse SHALL NOT directly update Inventory Ledger or Sales Commercial state.
14. **Security** — Verbatim ADR-011 tenant scoping; platform baseline.
15. **Authorization** — ENG-002 + ENG-003 under ADR-032 (RBAC + ABAC).
16. **Operational Constraints** — Verbatim Module PRD §11; no additions.
17. **Implementation Readiness** — Sprint Exit Criteria verbatim from Sprint Plan §2.005.
18. **References** — Tier A authoritative sources only.

### Ownership Conventions Established

- Yard Operations Ownership
- Dock Operations Ownership
- **Yard Scheduling Ownership** (encompasses dock, gate, appointment, trailer, carrier, vehicle)
- Load-Out Ownership
- Inventory Ledger Boundary
- Sales Commercial Boundary

---

## Part C — Governance Registration

Modify exactly once:
1. `docs/30-sprint-prds/warehouse/SPR-MOD-019-005-yard-dock-load-out.md` (create)
2. `docs/30-sprint-prds/warehouse/README.md` (flip row from Reserved → Draft/link)
3. `docs/SPRINT_CATALOG.md` (append row per SPRINT_AUTHORING_GUIDE)
4. `docs/DOCUMENT_INDEX.md` (append row after 019-004)
5. `docs/_meta.json` (append sidebar entry after 019-004)
6. `.lovable/plan.md` (append execution artifacts)

Must NOT modify: MODULE_PRD, Sprint Plan, MODULE_CATALOG, MODULE_IMPLEMENTATION_WORKFLOW, ENGINE_CATALOG, ADR_INDEX, Event Catalog, Module Baselines.

---

## Part D — Stage 2 Verification (Pass 8.9.6-V)

15-item checklist; invariant `Passed + Remediated + Failed = 15`:

1. Frontmatter complete
2. 18 canonical sections
3. Capability completeness
4. No capability outside Sprint 005
5. Engines identical to Sprint Plan
6. ADRs Accepted only
7. Events identical
8. Ownership preserved
9. Dependencies resolve from Module Catalog
10. Registrations exactly once
11. Repository consistency
12. Metadata consistency
13. Bidirectional capability completeness
14. Cross-Sprint Leakage (no Sprint 001–004 or 006 capability)
15. Ownership Preservation vs Module PRD

Loop until Failed = 0.

---

## Part E — Repository Audit (Spec v1.0)

**Mandatory Read Set**: MODULE_IMPLEMENTATION_WORKFLOW, MODULE_PRD, Sprint Plan, SPR-001..004, ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX, Event Catalog, SPRINT_AUTHORING_GUIDE, warehouse/README, DOCUMENT_INDEX, _meta.json, SPRINT_CATALOG.

**Metadata**: Spec v1.0, UTC timestamp, Auditor, Tool Versions, Repository Revision Identifier (D3 waiver if unavailable), Declared Files Modified, Actual Change Set, SHA-256 hashes.

**Determinism Invariant**: Declared Change Set = Actual Change Set (deviation = Major Finding).

**Semantic Invariants (7)**: no capability added / removed / renamed / merged / split; no ownership transferred; no capability reallocated across Sprint boundaries.

Evidence table `| Check | PASS/FAIL | Severity | Repository Evidence | Required Fix |` covering Stage 2 Verification, Capability Allocation Integrity, Engine/ADR/Event Authority, Ownership Boundary, Cross-Sprint Leakage, Semantic Invariants, Repository/Metadata Consistency, Cross-Reference Validation, Artifact Integrity.

Confidence enum: HIGH | MEDIUM | LOW. Repository Status: `READY ⇔ Critical = 0 ∧ Major = 0`.

---

## Refinements Incorporated

- **§7**: "Vehicle Scheduling Ownership" → **"Yard Scheduling Ownership"** (encompasses dock, gate, appointment, trailer, carrier, vehicle).
- **§13**: Recast from purely read-only to **consume read-only + publish outbound** (arrival ack, dock assignment, appointment status, loading confirmation, departure confirmation), preserving the Inventory Ledger and Sales Commercial invariants.

---

## Closing Artifacts (append to `.lovable/plan.md`)

1. Authoritative Source Resolution Log
2. Sprint Capability Allocation Report
3. Verification Metadata
4. Verification Table
5. Verification Summary
6. Repository Audit Metadata
7. Repository Audit Evidence Table
8. Sprint PRD Semantic Invariants
9. Final Report

Mirror summary in chat.

---

## Outcome

Pass 8.9.6 completes only when Allocation Gate = PASS, Verification = 15/15 Passed, Repository Audit = READY, and Confidence = HIGH (or MEDIUM under D3 environmental waiver only).

**Next Pass**: 8.9.7 — SPR-MOD-019-006 Warehouse Labor, Equipment & Analytics (final Warehouse sprint).
