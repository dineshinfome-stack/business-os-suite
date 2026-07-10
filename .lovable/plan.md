## Pass 8.8.4 — SPR-MOD-005-004 (Inventory Adjustments & Stock Counting) + 8.8.4-V

### Preflight (read-only)
Resolve identifiers verbatim from:
- `docs/20-module-prds/inventory/MODULE_PRD.md` (§2, §12, §13)
- `docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md` (Sprint 4 allocation)
- `SPR-MOD-005-001/002/003` (template + governance wording)
- `MOD001/002/003/004` baselines
- `MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ENGINE_USAGE_MATRIX.md`, `ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md`, `MODULE_IMPLEMENTATION_WORKFLOW.md`

No authoritative document will be modified.

---

### Part A — Author Sprint PRD

Create `docs/30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md` using the identical 18-section template, disclaimer, numbering, governance wording, review gate, references, and traceability conventions established by SPR-MOD-005-001/002/003.

**Frontmatter:** `sprint_id: SPR-MOD-005-004`, `parent_module: MOD-005`, `iteration: Sprint 4`, `stage: 2`, `pass: 8.8.4`, `size: Large`, `status: Draft`, `owner: Inventory`, `updated: 2026-07-10`, `document_type: Sprint PRD`. `related_engines` and `related_adrs` resolved verbatim from Sprint 4 allocation cross-checked against ENGINE_CATALOG, ENGINE_USAGE_MATRIX, ADR_INDEX. Tags: `[sprint, prd, inventory, adjustments, stock-counting, mod-005]`.

**§1 Objective & Scope.** In Scope: Physical Count, Cycle Count, Scheduled Count, Blind Count, Recount, Variance Recording, Variance Review, Stock Adjustment Request, Adjustment Approval, Reconciliation Request, Adjustment Status, Count Status, Adjustment Numbering, Attachments, Notifications, Inventory Adjustment Events. Out of Scope: Item Master, Purchase/Sales/Warehouse/Accounting ownership, Valuation, Costing, Journal Posting, GL, Financial reconciliation, Payments, Lot/Serial, Analytics, Reporting, Dashboards.

**§1.1–§1.8 Governance Conventions** (verbatim wording):
- 1.1 Inventory Adjustment Ownership — commercial adjustment lifecycle
- 1.2 Stock Count Boundary — count execution owned; warehouse execution consumed
- 1.3 Warehouse Consumption Boundary — consumed through approved contracts; not redefined
- 1.4 Accounting Boundary — no journal posting/ledger/valuation/costing/financial reconciliation
- 1.5 Adjustment Approval Boundary — commercial only; financial approval remains Accounting
- 1.6 Inventory Transaction Boundary — inventory state only; no financial ownership
- 1.7 Numbering Boundary — repository-approved numbering capability
- 1.8 Governance Complement — complements MOD001/002/003/004 baselines and SPR-MOD-005-001/002/003 without redefinition

**§2 Sprint Deliverables.** Physical/Cycle/Blind Count, Recount, Inventory Adjustment, Adjustment Approval, Variance Recording, Reconciliation Request, Adjustment Numbering, Attachments, Notifications, Adjustment Events. Forward references: SPR-MOD-005-005/006.

**§3 Bidirectional Traceability.** Forward table (Module Capability → Originating Sprint) and Reverse table (Originating Sprint → Module Capability). Include the following verbatim invariant statements:
1. Every Module capability SHALL map to exactly one originating Sprint allocation.
2. Every Sprint capability SHALL trace back to exactly one approved Module capability.
3. No orphan Sprint capability.
4. No duplicate originating allocation.
5. No unallocated Module capability.

**§4 User Stories.** Personas: Inventory Executive, Warehouse Coordinator, Inventory Auditor, Branch Manager, Inventory Controller, Operations Manager, System Administrator. Each traces to exactly one Sprint Deliverable.

**§5 Acceptance Criteria.** Given/When/Then across all capabilities with verbatim ownership statements (no accounting posting; warehouse execution consumed via contracts; completion MAY emit repository-defined events and SHALL request downstream accounting via contracts).

**§6 Parent Module Reference.** Inventory Module PRD; list fulfilled sections.

**§7 Dependencies.** Upstream: MOD001/002/003/004 baselines, SPR-MOD-005-001/002/003, MOD-005 Sprint Plan. Verbatim wording: Warehouse as originating supplier of warehouse execution; Accounting as originating supplier of accounting; Sprint 4 consumes and does not redefine. Downstream: SPR-MOD-005-005/006.

**§8 ERP Core Engine Consumption.** Verbatim IDs SHALL resolve from `ENGINE_CATALOG.md`, SHALL match `ENGINE_USAGE_MATRIX.md`, and SHALL exactly match the Sprint 4 allocation in `MOD-005_SPRINT_PLAN.md`; no placeholder, deprecated, undefined, duplicate, or additional identifiers. One-line usage per engine.

**§9 ADR Consumption.** Accepted only, verbatim from ADR_INDEX, one-line each.

**§10 Data Model Impact (conceptual).** Inventory Adjustment, Inventory Adjustment Line, Physical Count, Cycle Count, Blind Count, Recount, Inventory Variance, Adjustment Approval, Adjustment Status, Count Status, Adjustment Attachment, Adjustment Notification. No schema.

**§11 Events.** Verbatim from event-catalog.md; unknowns deferred as `R-EV-*`. No invented events. Event Catalog unchanged.

**§12 DoD / §13 Exit Criteria / §15 Test Strategy / §16 Implementation Notes / §17 Review Gate.** Repository standard wording.

**§14 Risk Register.** Status ∈ {Open, Mitigated, Accepted, Deferred, Closed}. Mandatory risks: Warehouse dependency, Accounting dependency, Inventory adjustment approval, Stock count accuracy, Variance approval, Numbering dependency, Event Catalog gaps, Cross-module contracts, Authorization, Reconciliation dependency. Numbering engine cited by verbatim ID only if allocated in Sprint 4; otherwise reference the repository-approved numbering engine.

**§18 References.** Inventory Module PRD, MOD-005 Sprint Plan, SPR-MOD-005-001/002/003, ERP Core Engines, Accepted ADRs, Event Catalog, MOD001/002/003/004 Baselines, MODULE_CATALOG.

---

### Part B — Governance Registration (exactly once each)

1. `docs/SPRINT_CATALOG.md` — add SPR-MOD-005-004 (Draft)
2. `docs/30-sprint-prds/inventory/README.md` — register Sprint 4
3. `docs/DOCUMENT_INDEX.md` — new PRD entry
4. `docs/_meta.json` — nav entry
5. `.lovable/plan.md` — execution record

Do NOT modify REPOSITORY_MAP.md, DOCUMENT_TRACEABILITY.md, DOCUMENT_OWNERSHIP_MATRIX.md.

---

### Part C — Pass 8.8.4-V Repository Verification

Execute 10-item checklist:
1. Frontmatter completeness
2. 18-section structural conformance
3. Engine authority (verbatim vs ENGINE_CATALOG + ENGINE_USAGE_MATRIX + Sprint 4 allocation; no placeholder/deprecated/undefined/duplicate/additional)
4. Bidirectional traceability (forward+reverse; five verbatim invariants satisfied)
5. ADR authority (Accepted only, verbatim from ADR_INDEX)
6. Event authority (verbatim from event-catalog.md or `R-EV-*`; no invented)
7. Dependency authority — module IDs resolve verbatim from MODULE_CATALOG.md; Warehouse and Accounting capabilities consumed through approved repository contracts and SHALL NOT redefine ownership established by their originating modules
8. Governance registration — five files updated exactly once; no modification to REPOSITORY_MAP/TRACEABILITY/OWNERSHIP
9. Stage 2 workflow conformance — All Stage 2 Sprint PRD requirements defined by `MODULE_IMPLEMENTATION_WORKFLOW.md` are satisfied.
10. Capability completeness (bidirectional) — No Sprint capability unless present in Inventory Module PRD; every Module PRD capability allocated exactly once to an originating Sprint in MOD-005_SPRINT_PLAN.md; no extras, no omissions, no duplicate originating allocations

Failure handling: minimum edits to the new Sprint PRD only; re-run until `Failed = 0`. Do NOT modify Module PRD, Sprint Plan, Baselines, prior Sprint PRDs, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, MODULE_CATALOG, Architecture, APIs, Database, Schema, UI, Code.

---

### Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)

1. **Verification Metadata** — Target Artifact, Pass 8.8.4-V, Date 2026-07-10, Verifier, Authoritative Sources Checked
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

### Outcome

`SPR-MOD-005-004-inventory-adjustments-stock-counting.md` becomes the authoritative Sprint PRD for Inventory Adjustments & Stock Counting. Inventory ownership preserved; Warehouse and Accounting consumed exclusively through approved repository contracts. Repository ready for **Pass 8.8.5 — SPR-MOD-005-005 (Inventory Traceability & Lot/Serial Control)**.
