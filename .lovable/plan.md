# Pass 8.8.5 — SPR-MOD-005-005 (Inventory Valuation & Replenishment) + 8.8.5-V

> **Sprint 5 scope is fixed by the approved `MOD-005_SPRINT_PLAN.md` (§ "SPR-MOD-005-005 — Inventory Valuation & Replenishment") as "Inventory Valuation & Replenishment".** Traceability / Lot / Serial is not allocated in the approved six-sprint plan. This pass authors Sprint 5 against the approved allocation and does not modify the Sprint Plan.

## Preflight (read-only, verbatim resolution)

Resolve every identifier verbatim from its authoritative source. Only sections and headings are treated as stable references — no line numbers:

- `docs/20-module-prds/inventory/MODULE_PRD.md` (§2, §7, §8, §10, §12, §13)
- `docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md` (§ "SPR-MOD-005-005 — Inventory Valuation & Replenishment"; §4.1/§4.2/§4.3 allocation rows for Sprint 5)
- `SPR-MOD-005-001/002/003/004` (template + governance wording)
- `MOD001/002/003/004` baselines
- `docs/MODULE_CATALOG.md` — every `MOD-NNN` identifier (including Manufacturing) resolves here
- `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md`, `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`

No authoritative document will be modified.

---

## Part A — Author Sprint PRD

Create `docs/30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md` using the identical 18-section template, disclaimer, numbering, governance wording, review gate, references, and traceability conventions established by SPR-MOD-005-001/002/003/004.

**Frontmatter:** `sprint_id: SPR-MOD-005-005`, `parent_module: MOD-005`, `iteration: Sprint 5`, `stage: 2`, `pass: 8.8.5`, `size:` mirrored verbatim from Sprint Plan § SPR-MOD-005-005 "Estimated size", `status: Draft`, `owner: Inventory`, `updated: 2026-07-10`, `document_type: Sprint PRD`. `related_engines` and `related_adrs` resolved verbatim from Sprint 5's entry in the Sprint Plan and cross-checked against ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX. Tags: `[sprint, prd, inventory, valuation, replenishment, mod-005]`.

**§1 Objective & Scope.** Per Sprint Plan § SPR-MOD-005-005 Objective + Boundaries:
- **In Scope:** Valuation Method Configuration per company (FIFO / Moving Average / Standard as commercial classification), Valuation Recalculation on Stock Events, Valuation-Change Events, Reorder Policy Maintenance, Replenishment Suggestion Generation, Low-Stock Detection, Revaluation Request, Numbering, Attachments, Notifications.
- **Out of Scope:** Accounting Voucher Creation, Ledger Posting, Purchase Requisition Creation (Purchase-owned), Transactional Stock-Movement functionality of earlier sprints, Item Master, Warehouse Execution, Sales Order lifecycle, Tax, Payments, Analytics & Reporting (SPR-MOD-005-006), Lot/Serial/Traceability (not allocated in MOD-005 plan).

**§1.1–§1.9 Governance Conventions** (verbatim wording; every `MOD-NNN` reference resolves from `MODULE_CATALOG.md`):
- 1.1 **Inventory Valuation Ownership** — commercial valuation lifecycle (method resolution, recalculation, snapshot, revaluation request) owned by Inventory.
- 1.2 **Replenishment Ownership** — reorder policy maintenance and replenishment suggestion lifecycle owned by Inventory.
- 1.3 **Accounting Boundary** — Inventory SHALL NOT create accounting vouchers, journals, ledger entries, financial costing, or GL reconciliation; accounting effects requested exclusively through approved repository contracts consumed by the Accounting module (as identified in `MODULE_CATALOG.md`).
- 1.4 **Purchase Consumption Boundary** — replenishment suggestions handed off to Purchase; Purchase Requisition and Purchase Order creation and Vendor Billing remain owned by the Purchase module (as identified in `MODULE_CATALOG.md`).
- 1.5 **Sales Consumption Boundary** — Sales demand signals consumed through approved contracts; Sales Order lifecycle remains owned by the Sales module (as identified in `MODULE_CATALOG.md`).
- 1.6 **Warehouse Consumption Boundary** — physical execution consumed through approved repository contracts; not redefined.
- 1.7 **Manufacturing Consumption Boundary** — production demand signals consumed through approved contracts; ownership of the Manufacturing module (as identified in `MODULE_CATALOG.md`) preserved.
- 1.8 **Numbering Boundary** — repository-approved numbering capability.
- 1.9 **No Downstream Ownership Transfer** — Sprint 5 SHALL consume Manufacturing, Warehouse, Purchase, Sales, and Accounting capabilities through approved repository contracts and SHALL NOT redefine or transfer ownership.

**§2 Sprint Deliverables.** Valuation Method Configuration, Valuation Recalculation, Valuation Snapshot, Revaluation Request, Reorder Policy, Replenishment Suggestion, Low-Stock Detection, Approval, Numbering, Attachments, Notifications, Valuation & Replenishment Events. Forward reference: SPR-MOD-005-006.

**§3 Bidirectional Traceability.** Forward table (Module PRD Capability → Originating Sprint) and Reverse table (Originating Sprint → Module PRD Capability), covering Sprint Plan §4.1 rows *Valuation (FIFO/moving average/standard)* and *Reorder and replenishment*; §4.2 submodule *Valuation*; and the Module PRD sections cited in the Sprint Plan's Sprint 5 entry. Include the following verbatim invariant statements:
1. Every Module capability SHALL map to exactly one originating Sprint allocation.
2. Every Sprint capability SHALL trace back to exactly one approved Module capability.
3. Every Module PRD capability allocated to Sprint 5 SHALL appear exactly once in this Sprint PRD, and every Sprint PRD capability SHALL map back to exactly one originating Module capability.
4. No orphan Sprint capability.
5. No duplicate originating allocation.
6. No unallocated Module capability.

**§4 User Stories.** Personas: Inventory Controller, Inventory Analyst, Inventory Executive, Procurement Coordinator (consumer), Warehouse Coordinator (consumer), Accountant (consumer), Branch Manager, Operations Manager, System Administrator. Each story traces to exactly one Sprint Deliverable.

**§5 Acceptance Criteria.** Given/When/Then across all capabilities with verbatim ownership statements: no accounting voucher/ledger creation; no Purchase Requisition/PO creation; no Sales Order mutation; warehouse execution consumed via contracts. **Completion MAY emit repository-defined events that resolve verbatim from `event-catalog.md`; any name not resolvable verbatim SHALL be deferred as `R-EV-*`; no event identifier SHALL be invented.** Downstream accounting, procurement, and warehouse actions requested through approved contracts.

**§6 Parent Module Reference.** Inventory Module PRD §2 (Valuation; Reorder and replenishment; submodule Valuation), §7 (Physical count differences post to the configured variance account — valuation side), §8 (valuation-change and low-stock published-event rows for Sprint 5, subject to verbatim resolution per §5/§11), §10 (Valuation method per company; Reorder policies).

**§7 Dependencies.** Upstream: MOD001/002/003/004 baselines, SPR-MOD-005-001/002/003/004, MOD-005 Sprint Plan. Verbatim wording: Manufacturing / Warehouse / Purchase / Sales / Accounting are originating suppliers of their respective capabilities; Sprint 5 consumes exclusively through approved repository contracts and SHALL NOT redefine ownership. Downstream: SPR-MOD-005-006.

**§8 ERP Core Engine Consumption.** Verbatim IDs **SHALL resolve verbatim from `ENGINE_CATALOG.md`, SHALL match `ENGINE_USAGE_MATRIX.md`, and SHALL exactly match the Sprint 5 allocation defined in the Sprint Plan's § SPR-MOD-005-005 "Engines consumed" list** (`ENG-002`, `ENG-004`, `ENG-005`, `ENG-012`, `ENG-013`, `ENG-015`, `ENG-016`, `ENG-024`); no placeholder, deprecated, undefined, duplicate, or additional identifiers. One-line usage per engine. Note on `ENG-015` / `ENG-016`: consumed to *request* voucher/posting contracts; Inventory does not itself create accounting journals or ledger entries (governance §1.3).

**§9 ADR Consumption.** Accepted only, verbatim from ADR_INDEX. Sprint Plan § SPR-MOD-005-005 "ADRs consumed": `ADR-011`, `ADR-014`, `ADR-032`. One line each.

**§10 Data Model Impact (conceptual).** Valuation Method, Valuation Policy (per company), Cost Layer (as commercial state supporting FIFO / MA / Standard classification), Valuation Snapshot, Revaluation Request, Reorder Policy, Replenishment Suggestion, Low-Stock Signal, Replenishment Approval, Replenishment Status, Attachment, Notification. No schema.

**§11 Events.** Every published/consumed event name SHALL resolve verbatim in `event-catalog.md`; any name not resolvable verbatim SHALL be deferred as `R-EV-*`. **No event identifiers SHALL be invented.** Event Catalog unchanged.

**§12 DoD / §13 Exit Criteria / §15 Test Strategy / §16 Implementation Notes / §17 Review Gate.** Repository standard wording. §13 Exit Criteria mirror the Sprint Plan's § SPR-MOD-005-005 "Sprint Exit Criteria" verbatim.

**§14 Risk Register.** Status ∈ {Open, Mitigated, Accepted, Deferred, Closed}. Mandatory risks: Accounting dependency (voucher/posting contracts), Purchase dependency (requisition handoff), Sales dependency (demand signal), Warehouse dependency, Manufacturing dependency, Valuation policy governance, Replenishment approval, Numbering dependency, Event Catalog gaps, Cross-module contracts, Authorization.

**§18 References.** Inventory Module PRD, MOD-005 Sprint Plan, SPR-MOD-005-001/002/003/004, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001/002/003/004 Baselines, MODULE_CATALOG.

---

## Part B — Governance Registration (exactly once each; no duplicates)

1. `docs/SPRINT_CATALOG.md` — add SPR-MOD-005-005 (Draft)
2. `docs/30-sprint-prds/inventory/README.md` — register Sprint 5
3. `docs/DOCUMENT_INDEX.md` — new PRD entry
4. `docs/_meta.json` — nav entry
5. `.lovable/plan.md` — execution record

Do NOT modify REPOSITORY_MAP.md, DOCUMENT_TRACEABILITY.md, DOCUMENT_OWNERSHIP_MATRIX.md.

**No duplicate registrations SHALL exist in any governance index.**

---

## Part C — Pass 8.8.5-V Repository Verification

Execute the 10-item checklist:

1. Frontmatter completeness (including `size` matching Sprint Plan § SPR-MOD-005-005 "Estimated size").
2. 18-section structural conformance.
3. **Engine authority** — verbatim IDs SHALL resolve verbatim from `ENGINE_CATALOG.md`, SHALL match `ENGINE_USAGE_MATRIX.md`, and SHALL exactly match the Sprint 5 allocation defined in the Sprint Plan's § SPR-MOD-005-005 (`ENG-002, 004, 005, 012, 013, 015, 016, 024`); no placeholder, deprecated, undefined, duplicate, or additional identifiers.
4. Bidirectional traceability — forward + reverse tables; six verbatim invariants satisfied.
5. ADR authority — Accepted only, verbatim from ADR_INDEX (`ADR-011, ADR-014, ADR-032`).
6. **Event authority** — every referenced event name SHALL resolve verbatim in `event-catalog.md`; any non-resolving name SHALL appear as `R-EV-*`; **no event identifiers SHALL be invented**.
7. **Dependency authority** — every `MOD-NNN` identifier SHALL resolve verbatim from `MODULE_CATALOG.md`; Manufacturing, Warehouse, Purchase, Sales, and Accounting capabilities consumed through approved repository contracts and SHALL NOT redefine or transfer ownership established by their originating modules.
8. **Governance registration** — five files updated exactly once; **no duplicate registrations in any governance index**; REPOSITORY_MAP / TRACEABILITY / OWNERSHIP unchanged.
9. Stage 2 workflow conformance — all Stage 2 Sprint PRD requirements defined by `MODULE_IMPLEMENTATION_WORKFLOW.md` are satisfied.
10. **Capability completeness (fully bidirectional)** — no Sprint capability SHALL appear unless present in Inventory Module PRD; **every Sprint capability SHALL exactly match the originating Sprint 5 allocation defined in `MOD-005_SPRINT_PLAN.md` — no capability may be added, omitted, renamed, merged, or reallocated**; every Module PRD capability allocated to Sprint 5 SHALL appear exactly once in this Sprint PRD, and every Sprint PRD capability SHALL map back to exactly one originating Module capability.

Failure handling: minimum edits to the new Sprint PRD only; re-run until `Failed = 0`. Do NOT modify Module PRD, Sprint Plan, Baselines, prior Sprint PRDs, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, MODULE_CATALOG, Architecture, APIs, Database, Schema, UI, Code.

---

## Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)

1. **Verification Metadata** — Target Artifact, Pass 8.8.5-V, Date 2026-07-10, Verifier, Authoritative Sources Checked
2. **Check / Result / Action Table** — 10 rows
3. **Verification Summary**

```text
Checklist Items: 10
Passed:
Remediated:
Failed:
Outstanding Risks:
Repository Status:
Next Pass:
```

Invariants: `Passed + Remediated + Failed = 10`; `Repository Status = PASS ⇔ Failed = 0`.

---

## Outcome

`SPR-MOD-005-005-inventory-valuation-replenishment.md` becomes the authoritative Sprint PRD for **Inventory Valuation & Replenishment** — matching the approved MOD-005 Sprint Plan's § SPR-MOD-005-005 allocation. Inventory ownership preserved; Manufacturing, Warehouse, Purchase, Sales, and Accounting consumed exclusively through approved repository contracts with no downstream ownership transfer. Repository ready for **Pass 8.8.6 — SPR-MOD-005-006 (Inventory Analytics & Controls)**.
