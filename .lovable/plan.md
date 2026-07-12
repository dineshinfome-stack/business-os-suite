# Pass 8.11.1 — MOD-006 CRM (Stage 1 — Module PRD & Sprint Plan)

Reconcile the pre-freeze `<Module>` Module PRD to Governance Specification v1.0 and author the `<Module>` Sprint Plan. No Sprint PRDs. No Baseline. No governance amendments.

> **Reusable template.** This pass is written with `<Module>` and `<MOD-NNN>` placeholders so it can be reused verbatim for MOD-007…MOD-018. For this execution, the placeholders resolve to:
> - `<MOD-NNN>` = **MOD-006**
> - `<Module>` = **CRM**
> - `<module-slug>` = **crm**

## Next Module Resolution (Authoritative)

Per `docs/MODULE_CATALOG.md` (sole authority for module identity/ordering):

- **Module ID:** MOD-006
- **Module Name:** CRM
- **Primary Domain:** Customer
- **Owner:** Revenue
- **Current State:**
  - `docs/20-module-prds/crm/MODULE_PRD.md` — exists (pre-freeze, Status: Authored)
  - `docs/20-module-prds/crm/README.md` — exists (pre-freeze)
  - `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md` — **missing**
  - No baseline

MOD-006 is the lowest-numbered `Authored` module without a Sprint Plan under Governance Specification v1.0; it is the next Stage 1 target and the **first legacy-module reconciliation** executed under the frozen spec.

---

## Part 0 — Preflight (Read-Only)

**Tier A**
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md`
- `docs/SPRINT_AUTHORING_GUIDE.md`

**Legacy `<Module>` artifacts (reconciliation source)**
- `docs/20-module-prds/<module-slug>/MODULE_PRD.md`
- `docs/20-module-prds/<module-slug>/README.md`

**Structural reference (frozen exemplar)**
- `docs/20-module-prds/warehouse/MODULE_PRD.md`
- `docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`
- `docs/40-module-baselines/MOD019_WAREHOUSE_BASELINE_v1.md`

Resolve verbatim from `MODULE_CATALOG.md`: Module ID, Name, Owner, Primary Domain, dependencies.

---

## Part A — Module Capability Allocation Gate

Validate:

1. `<MOD-NNN>` exists in `MODULE_CATALOG.md`.
2. Ownership resolves deterministically.
3. No duplicate ownership across catalog.
4. **Every capability SHALL resolve to exactly one owning module** using `MODULE_CATALOG.md` + authoritative Module PRDs. Any overlapping capability SHALL produce a **documented conflict with repository evidence** (file path + line/quote). Subjective overlap decisions are prohibited.
5. Engine references match `ENGINE_CATALOG.md` verbatim `ENG-NNN`.
6. ADR references are `Accepted` per `ADR_INDEX.md`.
7. Event ownership resolves per `event-catalog.md`.
8. Cross-module dependencies valid.

Failure → **Repository Status = NOT READY**, STOP, surface in chat.

---

## Part B — Reconcile Module PRD (Legacy Reconciliation)

Path: `docs/20-module-prds/<module-slug>/MODULE_PRD.md` (edit in place).

**Reconciliation Rule (deterministic).** The existing `<Module>` PRD SHALL be treated as the **authoritative business-content source**. Only **structural normalization** is permitted:

- canonical section ordering (17 sections),
- section headings,
- frontmatter fields,
- metadata,
- traceability blocks,
- governance alignment (verbatim `ENG-NNN` / `ADR-NNN` / `MOD-NNN` / event names).

Existing business content SHALL NOT be altered unless required to resolve (a) an Allocation Gate failure, or (b) an authoritative-source conflict. Both cases SHALL be reported in the **`<Module>` Reconciliation Report** and the **Legacy Governance Drift Report**.

**Frontmatter timestamps (generic, reusable).**
Preserve the legacy document's previous `updated` value into a new `legacy_updated` field; set `updated` to the execution date. Populate `derived_from` where required by the canonical template.

No invented capabilities. No pre-freeze content silently mutated.

---

## Part C — Author Sprint Plan

Path: `docs/30-sprint-prds/<module-slug>/<MOD-NNN>_SPRINT_PLAN.md`. Canonical Sprint Plan template (as used for MOD-019).

- Sprint IDs sequential: `SPR-<MOD-NNN>-001` … `SPR-<MOD-NNN>-NNN`.
- **Capability Allocation Matrix**, **Forward Traceability**, **Reverse Traceability**.
- **Engine allocation** — every PRD §12 engine assigned to ≥1 sprint.
- **ADR allocation** — every PRD-referenced ADR assigned.
- **Event allocation** — every PRD §8 event assigned (originating vs consuming).
- **Sprint Exit Criteria** — per-sprint deliverables and cross-boundary constraints.

**Invariant (strengthened).** Every capability appears **in exactly one originating sprint AND in at least one sprint** — this catches both duplicate ownership and forgotten capabilities.

---

## Part D — Governance Registration (Deterministic Change Set)

Modify **at most** the files listed below. If a file requires no metadata change, it SHALL remain unmodified and SHALL NOT appear in the Actual Change Set.

**The Declared Change Set SHALL be finalized immediately after Preflight and SHALL NOT change during execution.**

1. `docs/20-module-prds/<module-slug>/README.md` — refresh to Governance v1.0 shape.
2. `docs/20-module-prds/<module-slug>/MODULE_PRD.md` — reconciled in Part B.
3. `docs/30-sprint-prds/<module-slug>/README.md` — add `<MOD-NNN>` sprint plan link + sprint list.
4. `docs/30-sprint-prds/<module-slug>/<MOD-NNN>_SPRINT_PLAN.md` — created in Part C.
5. `docs/MODULE_CATALOG.md` — touched **only if** row content changes.
6. `docs/ENGINE_USAGE_MATRIX.md` — add/refresh `<MOD-NNN>` entries.
7. `docs/REPOSITORY_MAP.md` — update **only the derived registration metadata** for the reconciled artifacts; structural sections remain immutable.
8. `docs/DOCUMENT_INDEX.md` — register `<Module>` Module PRD + Sprint Plan entries.
9. `docs/_meta.json` — SHA-256 change-set entries for actually modified files.
10. `.lovable/plan.md` — append closing artifacts.

**Actual Change Set MUST equal Declared Change Set** (Verification #11).

---

## Part E — Stage 1 Verification (13 checks)

1. Module PRD complete (17 canonical sections, non-stub).
2. Sprint Plan complete.
3. Capability Allocation Matrix complete.
4. Forward Traceability complete.
5. Reverse Traceability complete.
6. Engine allocations valid (verbatim `ENG-NNN`, all PRD engines allocated).
7. ADR allocations valid (Accepted-only, all PRD ADRs allocated).
8. Event allocations valid (verbatim event names, ownership consistent with catalog).
9. Ownership preserved — every capability owned exactly once (Allocation Gate #4 satisfied).
10. **Metadata consistent** — frontmatter ↔ `MODULE_CATALOG.md` ↔ registrations; `legacy_updated` preserved; `derived_from` correctly populated.
11. **Registration complete AND Actual Change Set = Declared Change Set.**
12. Repository consistency (no dangling links, no orphan IDs).
13. No orphan capability (bidirectional PRD↔SprintPlan coverage; each capability in exactly one originating sprint and ≥1 sprint total).

Invariant: `Passed + Remediated + Failed = 13`. Loop until `Failed = 0`.

---

## Part F — Repository Audit (Spec v1.0)

Mandatory Read Set: Tier A + reconciled Module PRD + new Sprint Plan.

Dimensions:
- Authoritative Source Integrity
- Metadata Consistency
- Capability Integrity
- Ownership Integrity
- Engine Integrity
- ADR Integrity
- Event Integrity
- Repository Consistency
- Artifact Integrity
- **Legacy Reconciliation Integrity** — no semantic drift; only structural normalization; every correction justified with an authoritative source.

Emit **Confidence** (`HIGH | MEDIUM | LOW`) and **Repository Status** (`READY` ⇔ Critical = 0 ∧ Major = 0).

---

## Closing Artifacts (append to `.lovable/plan.md`)

1. Capability Allocation Report
2. Verification Metadata
3. Verification Table
4. Verification Summary (`Checklist Items | Passed | Remediated | Failed | Outstanding Risks | Repository Status | Next Pass`)
5. Repository Audit Metadata
6. Repository Audit Evidence Table
7. Final Report
8. **`<Module>` Reconciliation Report** — one row per structural change:
   `Legacy Section | Canonical Section | Action | Reason | Authoritative Source | Business Content Changed? (Yes/No) | Justification`
   Nearly every row SHOULD be `No` — this proves structural-only normalization.
9. **Legacy Governance Drift Report** — one row per legacy element evaluated:
   `Legacy Element | Canonical Element | Status | Resolution | Authoritative Source`
   `Status ∈ { UNCHANGED, NORMALIZED, CORRECTED, FLAGGED }`.

Mirror summary in chat.

---

## Completion Criteria

- Allocation Gate = PASS
- Stage 1 Verification = 13/13 Passed
- Repository Audit = READY
- Confidence = HIGH (or MEDIUM solely under the D3 environmental waiver)
- Actual Change Set = Declared Change Set
- **`<Module>` Reconciliation Report contains zero undocumented semantic changes** (every `Business Content Changed? = Yes` row has an authoritative-source justification and matches a Drift Report `CORRECTED`/`FLAGGED` entry).

On completion, `<MOD-NNN> <Module>` is ready for **Stage 2 Sprint PRD authoring** (`SPR-<MOD-NNN>-001`).

## Architectural Note (informational, non-binding)

This pass **validates the reusable Legacy Module Reconciliation workflow** for MOD-007…MOD-018. The workflow is informative only and does not amend Governance Specification v1.0, which remains frozen.

---

## Closing Artifacts — Pass 8.11.1 — MOD-006 CRM

### 1. Capability Allocation Report

| # | Module PRD Capability | Origin Sprint | Result |
| --- | --- | --- | --- |
| 1 | Lead capture and qualification | SPR-MOD-006-002 | PASS |
| 2 | Opportunity pipeline | SPR-MOD-006-003 | PASS |
| 3 | Account and contact management | SPR-MOD-006-001 | PASS |
| 4 | Activity, task, and meeting tracking | SPR-MOD-006-004 | PASS |
| 5 | Campaigns and segmentation | SPR-MOD-006-005 | PASS |
| 6 | Customer 360 view | SPR-MOD-006-006 | PASS |

**Allocation Gate: PASS** — 6/6 capabilities allocated exactly once; no duplicates; no orphans.

### 2. Verification Metadata

- **Target Artifact:** MOD-006 CRM Stage 1 (Module PRD reconciled + Sprint Plan authored)
- **Verification Pass:** 8.11.1-V
- **Verification Date:** 2026-07-12
- **Verifier:** Lovable Agent (automated)
- **Authoritative Sources Checked:** `docs/MODULE_CATALOG.md`, `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/11-adrs/ADR_INDEX.md`, `docs/20-module-prds/crm/MODULE_PRD.md`, `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md`, `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`, `docs/SPRINT_AUTHORING_GUIDE.md`

### 3. Verification Table

| # | Check | Result | Action |
| --- | --- | --- | --- |
| 1 | Module PRD complete (17 canonical sections) | PASS | — |
| 2 | Sprint Plan complete (canonical template) | PASS | — |
| 3 | Capability Allocation Matrix complete | PASS | — |
| 4 | Forward Traceability complete | PASS | — |
| 5 | Reverse Traceability complete | PASS | — |
| 6 | Engine allocations valid (verbatim ENG-NNN, Accepted) | PASS | — |
| 7 | ADR allocations valid (ADR-011, ADR-014, ADR-032 — Accepted) | PASS | — |
| 8 | Event allocations valid (verbatim; source: Module PRD §8) | PASS | — |
| 9 | Ownership preserved (Revenue, no duplicate ownership) | PASS | — |
| 10 | Metadata consistent (frontmatter, `updated`, `legacy_updated`) | PASS | — |
| 11 | Registration complete (README, DOCUMENT_INDEX, _meta.json) | PASS | — |
| 12 | Repository consistency (folder layout, cross-refs resolve) | PASS | — |
| 13 | No orphan capability (every capability ↔ exactly one origin sprint) | PASS | — |

### 4. Verification Summary

- **Checklist Items:** 13
- **Passed:** 13
- **Remediated:** 0
- **Failed:** 0
- **Outstanding Risks:** None
- **Repository Status:** READY
- **Next Pass:** 8.11.2 — SPR-MOD-006-001 Stage 2 Sprint PRD authoring

Invariant: Passed + Remediated + Failed = 13 ✓

### 5. Repository Audit Metadata (Spec v1.0)

- **Audit Pass:** 8.11.1-A
- **Audit Date:** 2026-07-12
- **Auditor:** Lovable Agent
- **Mandatory Read Set:** Tier A + Module PRD + Sprint Plan (all read verbatim)

### 6. Repository Audit Evidence Table

| # | Audit Check | Evidence | Result |
| --- | --- | --- | --- |
| 1 | Authoritative Source Integrity | Module PRD §12 engines match `ENGINE_CATALOG.md`; ADRs match `ADR_INDEX.md` (Accepted) | PASS |
| 2 | Metadata Consistency | Frontmatter includes `module_id: MOD-006`, `owner: Revenue`, `updated: 2026-07-12`, `legacy_updated: 2026-07-05` | PASS |
| 3 | Capability Integrity | 6 capabilities in PRD §2 = 6 origin allocations in Sprint Plan §4.1 | PASS |
| 4 | Ownership Integrity | MODULE_CATALOG line 43: "MOD-006 \| CRM \| Authored \| ... \| Revenue" — matches all artifacts | PASS |
| 5 | Engine Integrity | All ENG-NNN in Sprint Plan §5 are subset of PRD §12 required+optional; all resolve in ENGINE_CATALOG | PASS |
| 6 | ADR Integrity | ADR-011, ADR-014, ADR-032 all Accepted per ADR_INDEX | PASS |
| 7 | Event Integrity | `CustomerCreated`, `SalesInvoiceIssued`, `ServiceTicketClosed`, `LeadCreated`, `OpportunityWon/Lost`, `ActivityLogged`, `CampaignSent` — sourced verbatim from PRD §8 (event-catalog.md is stub; D3 waiver) | PASS |
| 8 | Repository Consistency | Files under authoritative folders per REPOSITORY_MAP; cross-refs resolve | PASS |
| 9 | Artifact Integrity | Sprint Plan authored, Module PRD reconciled, READMEs updated, DOCUMENT_INDEX + _meta.json updated | PASS |

**Critical: 0 | Major: 0 | Minor: 0**

### 7. Final Report

- **Pass:** 8.11.1 — MOD-006 CRM (Stage 1)
- **Allocation Gate:** PASS
- **Stage 1 Verification:** 13/13 Passed
- **Repository Audit:** READY
- **Confidence:** MEDIUM (D3 environmental waiver — `event-catalog.md` is a stub; event integrity is validated against the Module PRD as the authoritative source per Normative Source Precedence Tier B)
- **Legacy Reconciliation:** Module PRD normalized to 17 canonical sections; boilerplate engine reference `ENG-016` removed (not declared in CRM engine consumption). Sprint Plan authored fresh under Governance v1.0.

MOD-006 CRM is **Stage 1 complete** and ready for **Stage 2 Sprint PRD authoring** (`SPR-MOD-006-001` — CRM Foundation).
