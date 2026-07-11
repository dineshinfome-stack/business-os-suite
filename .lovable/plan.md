# Pass 8.9.1 — MOD-006 Warehouse Module PRD (Stage 1)

Author the authoritative Stage 1 Module PRD for MOD-006 Warehouse, allocate every capability into exactly six Stage 2 Sprints, register in governance, run Stage 1 verification, and execute Repository Audit Spec v1.0. Establishes the canonical Stage 1 template reusable for all remaining modules.

## Part 0 — Preflight (Read-Only)

Open verbatim:
- `docs/MODULE_CATALOG.md`, `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/11-adrs/ADR_INDEX.md`, `docs/02-architecture/event-catalog.md`
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`, `docs/SPRINT_AUTHORING_GUIDE.md`
- Baselines: MOD001–MOD005
- Existing Module PRDs (structural reference: MOD-005 Inventory)
- Existing Sprint Plans (structural reference: MOD-004, MOD-005)

No authoritative document modified during Preflight.

## Normative Source Precedence

When two documents disagree, higher precedence wins:
1. `MODULE_PRD.md` (Business Capabilities section)
2. Capability Allocation Matrix (in `MOD-006_SPRINT_PLAN.md`)
3. `MOD-006_SPRINT_PLAN.md` (non-matrix content)
4. Derived artifacts (Forward Traceability, Reverse Traceability, Cross-Sprint Coverage Report)

Any disagreement discovered during Verification or Audit SHALL be remediated by editing the lower-precedence artifact to conform to the higher one.

## Canonical Ordering Definition

"Canonical order" for engine and ADR identifiers means:
- **Engines:** the order in which identifiers appear in `docs/10-erp-core/ENGINE_CATALOG.md`. If that document does not define an explicit order, canonical order defaults to ascending identifier order (`ENG-001, ENG-002, …`).
- **ADRs:** the order in which identifiers appear in `docs/11-adrs/ADR_INDEX.md`. If that document does not define an explicit order, canonical order defaults to ascending identifier order (`ADR-001, ADR-002, …`).

This pass SHALL NOT modify `ENGINE_CATALOG.md` or `ADR_INDEX.md`. Any repository-wide promotion of this definition is deferred to a future workflow-doc pass.

## Part A — Author `docs/20-module-prds/warehouse/MODULE_PRD.md`

**Frontmatter**
```yaml
module_id: MOD-006
module_name: Warehouse
document_type: Module PRD
stage: 1
pass: 8.9.1
version: v1.0
status: Draft
owner: Warehouse
updated: 2026-07-10
size: XL
related_engines: <verbatim from ENGINE_CATALOG.md, canonical order>
related_adrs:    <Accepted only, verbatim from ADR_INDEX.md, canonical order>
tags: [module, prd, warehouse, mod-006]
```

**Repository-standard Stage 1 Module PRD structure — 23 sections:** Executive Summary, Business Objectives, Module Scope, **Business Capabilities**, Functional Requirements, Non-functional Requirements, User Personas, Business Processes, Governance, Ownership Boundaries, Dependencies, ERP Core Engine Consumption, ADR Consumption, Conceptual Data Model, Events, Security, Reporting, Configuration, Risks, Success Metrics, Traceability, Stage 2 Sprint Allocation, References.

**Warehouse Ownership (exclusive):** warehouse execution, bin management, putaway execution, picking execution, wave execution, dock execution, task execution, warehouse operational control.

**Boundaries (consumed, not redefined):** Inventory transactions/valuation (MOD-005), Purchase commercial (MOD-004), Sales commercial (MOD-003), Manufacturing execution, Financial posting (MOD-002).

**Capability domains:** Warehouse Master, Warehouse Structure (Zones/Aisles/Racks/Bins), Bin Types, Capacity Rules, Putaway Rules, Picking Rules, Wave Planning, Task Management, Receiving Execution, Dispatch Execution, Warehouse Transfers, Cross Dock, Dock Management, Resource Management, Equipment Assignment, Warehouse Scheduling, Exception Handling, Warehouse KPIs, Operational Monitoring, Warehouse Events, Warehouse Configuration.

## Part B — Author `docs/30-sprint-prds/warehouse/MOD-006_SPRINT_PLAN.md`

**Deterministic Capability Coverage:** Every capability defined in the **Business Capabilities** section of `MODULE_PRD.md` SHALL appear exactly once in `MOD-006_SPRINT_PLAN.md`. No Sprint capability SHALL exist unless it originates from `MODULE_PRD.md`.

**Six Sprints:**
- SPR-MOD-006-001 Warehouse Foundation
- SPR-MOD-006-002 Receiving, Putaway & Bin Operations
- SPR-MOD-006-003 Picking, Wave Planning & Dispatch
- SPR-MOD-006-004 Warehouse Transfers & Task Management
- SPR-MOD-006-005 Resource Management & Warehouse Operations
- SPR-MOD-006-006 Warehouse Analytics & Operational Controls (read-model/audit only)

**Required Matrices:**

- **Capability Allocation Matrix (sole normative allocation artifact)** — deterministic table with fixed columns:

  | Module Capability | Originating Sprint | Sprint PRD | Sprint Section | Engine(s) | ADR(s) | Status |

  Rules:
  - **Authority Clause:** The Capability Allocation Matrix is the **sole normative capability allocation artifact for Stage 1**. Forward Traceability, Reverse Traceability, the Cross-Sprint Coverage Report, and Stage 1 verification SHALL be derived from this matrix and SHALL NOT introduce independent mappings.
  - **Uniqueness Rule:** The combination `(Module Capability, Originating Sprint)` SHALL be unique across the matrix.
  - **Completeness Rule:** The number of rows in the Capability Allocation Matrix SHALL equal the number of capabilities defined in the **Business Capabilities** section of `MODULE_PRD.md`.
  - **Origin Rule:** Every Module capability appears exactly once; every Sprint capability traces back to exactly one Module capability.

- **Forward Traceability** (Module Capability → Sprint) — derived from the Capability Allocation Matrix.
- **Reverse Traceability** (Sprint → Module Capability) — derived from the Capability Allocation Matrix.

- **Engine Allocation Matrix** — derived exclusively from `ENGINE_CATALOG.md` and `ENGINE_USAGE_MATRIX.md`. Every Engine SHALL resolve verbatim and SHALL appear only in the Sprint(s) allocated by the Module PRD. Engine identifiers listed in canonical order (as defined above).

- **ADR Allocation Matrix** — Accepted ADRs only, resolved verbatim from `ADR_INDEX.md`. ADR identifiers listed in canonical order (as defined above).

## Part C — Governance Registration (exactly once)

1. `docs/MODULE_CATALOG.md` — add/confirm MOD-006 row
2. `docs/20-module-prds/warehouse/README.md` — register PRD + Sprint Plan
3. `docs/DOCUMENT_INDEX.md` — Draft entries
4. `docs/_meta.json` — nav entries
5. `.lovable/plan.md` — execution record

**Not modified:** Repository Maps, Sprint Catalog, Sprint PRDs, Baselines, other Module PRDs, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`.

## Declared Files Modified

1. `docs/20-module-prds/warehouse/MODULE_PRD.md`
2. `docs/30-sprint-prds/warehouse/MOD-006_SPRINT_PLAN.md`
3. `docs/MODULE_CATALOG.md`
4. `docs/20-module-prds/warehouse/README.md`
5. `docs/DOCUMENT_INDEX.md`
6. `docs/_meta.json`
7. `.lovable/plan.md`

## Part D — Stage 1 Verification (Pass 8.9.1-V)

**13-item checklist:**
1. Frontmatter completeness
2. Repository-standard Stage 1 Module PRD structure (23 sections)
3. Business capability completeness
4. Exactly six Sprint allocations
5. Capability Allocation Matrix satisfies Authority, Uniqueness `(Module Capability, Originating Sprint)`, Completeness (row count = capability count in **Business Capabilities** section of `MODULE_PRD.md`), and Origin (every Module capability exactly once; every Sprint capability traces to exactly one Module capability); Forward and Reverse Traceability are derived from it
6. Engine identifiers resolved verbatim from `ENGINE_CATALOG.md` and consistent with `ENGINE_USAGE_MATRIX.md`; canonical ordering preserved
7. ADR identifiers Accepted only, verbatim from `ADR_INDEX.md`; canonical ordering preserved
8. Events verbatim from `event-catalog.md` or deferred `R-EV-*`
9. Dependencies verbatim from `MODULE_CATALOG.md`
10. Ownership boundaries — no Inventory / Purchase / Sales / Manufacturing / Accounting ownership redefinition
11. Governance registration completed exactly once each
12. Repository consistency — no duplicate identifiers, no broken references, no orphan capabilities
13. Metadata consistency across `MODULE_CATALOG.md`, `20-module-prds/warehouse/README.md`, `DOCUMENT_INDEX.md`, and `_meta.json` (module_id, module_name, version, status, owner, path identical)

Emit Verification Metadata + Check/Result/Action table + Verification Summary.
Invariant: `Passed + Remediated + Failed = Checks`. Any Fail → minimum edits under Normative Source Precedence (edit lower-precedence artifact to conform to higher); re-run until `Failed = 0`.

### Cross-Sprint Coverage Gate (Stage 1)

After Part D checks, execute the Stage 1 equivalent of the Stage 3 coverage gate.

**Required Artifact — Cross-Sprint Coverage Report.** Derived directly from the Capability Allocation Matrix plus repository evidence. Fixed columns, aligned with Repository Audit Spec v1.0 evidence standard (path + section/line **and** exact matching text):

| Module Capability | Originating Sprint | Sprint PRD | Evidence (path + section/line + exact quote) | Status |

Gate criteria:
- 100% Module capabilities allocated (row count equals **Business Capabilities** section count)
- No duplicate originating allocations
- No orphan Sprint capability
- No unallocated Module capability

Any FAIL → STOP; do not proceed to Repository Audit until coverage = PASS.

## Part E — Repository Audit (Spec v1.0)

Apply Access Guard Clause per `MODULE_IMPLEMENTATION_WORKFLOW.md`.

**Audit Metadata:** Repository Audit Specification Version 1.0, UTC timestamp, Auditor, Tool Versions, Repository revision identifier via the available change-tracking mechanism (e.g., Git commit ID or equivalent immutable revision identifier). If unavailable, revision field = "Unavailable" and Confidence SHALL NOT exceed MEDIUM. Change Tracking Mechanism, Declared Files Modified, Actual Change Set, Mandatory Read Set opened, SHA-256 artifact hashes.

**Severity Policy:** per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` (Repository Audit Spec v1.0) — Critical (blocks progression), Major (governance violation, blocks READY), Minor (documentation quality; caps Confidence at MEDIUM), Informational.

**Evidence Table (5 cols):** Check | PASS/FAIL | Severity | Repository Evidence (path + line range/heading + exact quote) | Required Fix.

**Coverage:** Stage 1 Verification, Metadata Consistency, Repository Consistency, Capability Allocation Integrity (Authority, Uniqueness, Completeness, Origin), Engine Authority, ADR Authority, Event Authority, Ownership Boundary Validation, Authoritative Source Integrity, Cross-reference Validation, Normative Source Precedence, Artifact Integrity.

**Final Report:** Passed / Remediated / Failed (Critical/Major/Minor) / Repository Status / Confidence / Revision / SHA-256.

**Invariants:**
- `Passed + Remediated + Failed = Checks`
- `READY ⇔ Critical = 0 ∧ Major = 0`
- `Proceed ⇔ READY ∧ HIGH`

## Closing Artifacts

Append to `.lovable/plan.md`: Stage 1 Verification, Capability Allocation Matrix, Cross-Sprint Coverage Report, Verification Metadata, Repository Audit, Final Report. Mirror summary in chat.

## Outcome

Proceed to **Pass 8.9.2 — SPR-MOD-006-001 (Warehouse Foundation)** only when:
- Capability Allocation Matrix satisfies Authority, Uniqueness, Completeness, Origin
- No orphan Sprint capability
- No duplicate originating allocation
- Stage 1 Verification = PASS
- Repository Audit = READY
- Confidence = HIGH
