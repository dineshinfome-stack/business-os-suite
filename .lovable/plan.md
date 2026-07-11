## Pass 8.9.2 — SPR-MOD-019-001 Warehouse Foundation (Stage 2 Sprint PRD)

Authoring the first Warehouse Sprint PRD under the frozen Governance Spec v1.0. Once approved, this plan doubles as the **canonical Stage 2 Sprint PRD authoring template** for Passes 8.9.3–8.9.7 (only module/sprint identifiers change).

### Authoritative Source Resolution Log

Two precedence decisions applied before authoring. Under D6 (Tier A > Tier B > Tier C), the higher-precedence source wins.

**R1 — Sprint scope aligned to Sprint Plan, not prompt narrative.** The prompt's "Sprint Scope" enumerates *Warehouse Master / Warehouse Structure (Warehouse, Zones, Aisles, Racks, Bins) / Bin Types / Capacity Rules / Putaway Rule Definitions / Picking Rule Definitions*. The authoritative **Capability Allocation Matrix** in `MOD-019_SPRINT_PLAN.md` allocates to Sprint 001 only the Warehouse-owned foundation capabilities (zones/areas overlay, dock, equipment, labor, task-type registry, dock-appointment calendar, ops configuration, numbering-series registration). The prompt items conflict with:
- **MOD-005 Inventory ownership** — Warehouse/Bin/Aisle/Rack master, Bin Types, and Capacity Rules are Inventory-owned per Warehouse Module PRD "Consumed Master Data".
- **Sprint 003 allocation** — Slotting / putaway / picking rule definitions.

**Resolution:** Author Sprint 001 against the Sprint Plan Capability Allocation Matrix. Do not introduce Bin/Aisle/Rack master or Slotting/Putaway/Picking rule definitions.

**R2 — Filename convention.** The prompt specifies `SPR-MOD-019-001_WAREHOUSE_FOUNDATION.md` (SCREAMING_SNAKE). All existing Sprint PRDs and registration entries (`docs/_meta.json`, `docs/DOCUMENT_INDEX.md`, `docs/SPRINT_CATALOG.md`) use kebab-case: `SPR-MOD-<NNN>-<NNN>-<slug>.md`.

**Resolution:** Use `SPR-MOD-019-001-warehouse-foundation.md`.

Both entries recorded verbatim in the Verification Metadata block. Future decisions (R3, R4, …) append here — not "conflicts" but precedence decisions.

### Part 0 — Preflight (read-only)

Open verbatim:

**Tier A (repository-wide governance):**
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md`
- `docs/SPRINT_AUTHORING_GUIDE.md`

**Tier B (module authority):**
- `docs/20-module-prds/warehouse/MODULE_PRD.md`
- `docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`

**Reference Sprint PRD (structural template):**
- `docs/30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md`

**SPRINT_CATALOG registration rule check:** open `docs/SPRINT_AUTHORING_GUIDE.md` and determine whether Stage 2 sprint registration requires a row in `docs/SPRINT_CATALOG.md`. Encode the result deterministically as follows (settled before Part C runs):

- If required → `docs/SPRINT_CATALOG.md` is **included** in the declared change set for this pass.
- If not required → the declared change set records **"intentionally excluded — SPRINT_AUTHORING_GUIDE does not require Stage 2 SPRINT_CATALOG registration"**.

No writes in Part 0.

### Part A — Sprint Capability Allocation Gate

Emit the **Sprint Capability Allocation Report** with fixed schema `Module Capability | Sprint Allocation | Status`, populated exclusively from `MOD-019_SPRINT_PLAN.md` Capability Allocation Matrix rows tagged `SPR-MOD-019-001`. Verify:

- Every Sprint 001 capability originates from Module PRD (quoted evidence from Module PRD Business Capabilities / Consumed Master Data / Numbering sections).
- Every allocated item appears exactly once.
- No capability from Sprints 002–006 present.
- No orphan / no duplicate originating allocation.
- Engine and ADR sets align with the SPR-MOD-019-001 subsection of the Sprint Plan.
- Events resolve from `event-catalog.md`; otherwise deferred as `R-EV-*` placeholders.

Gate failure ⇒ Repository Status `NOT READY`; STOP without authoring.

### Part B — Author Sprint PRD

Create `docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md`.

**Frontmatter fields:** `module_id`, `module_name`, `sprint_id`, `sprint_name`, `document_type`, `stage: 2`, `pass: 8.9.2`, `version: v1.0`, `status: Draft`, `updated: 2026-07-11`, `size` (from Sprint Plan SPR-MOD-019-001 subsection), `related_engines`, `related_adrs`, `related_events`.

**`owner` field** — SHALL match the `owner` field defined in `docs/20-module-prds/warehouse/MODULE_PRD.md` verbatim. No independent owner may be introduced at the Sprint PRD level. If the Module PRD owner and the Warehouse Sprint README owner (`Operations`) disagree, the Module PRD wins under D6 Tier B; the disagreement is recorded as R3 in the Authoritative Source Resolution Log and the README correction deferred to a follow-up remediation ticket.

**Related Engines** — SHALL be resolved verbatim from the SPR-MOD-019-001 subsection of the Capability Allocation Matrix in `MOD-019_SPRINT_PLAN.md`. No engine identifier may be added, removed, or reordered.

**Related ADRs** — SHALL be resolved verbatim from the SPR-MOD-019-001 subsection of the Capability Allocation Matrix in `MOD-019_SPRINT_PLAN.md`. Only Accepted ADRs; no additions, removals, or reordering.

**Related Events** — SHALL be resolved verbatim from the Sprint Plan and `event-catalog.md`. Any event not yet present in the Event Catalog is deferred as `R-EV-*`; no event identifier may be invented.

**18-section body** (frozen Sprint PRD standard):

1. Executive Summary
2. Sprint Scope (in / out, aligned with Sprint Plan boundaries)
3. Business Capabilities (Warehouse operations configuration only)
4. Functional Requirements (CRUD + lifecycle for each Sprint-1-allocated master entity; configuration resolution via ENG-005 if allocated; numbering series registration via ENG-017 if allocated)
5. Business Processes (foundation config workflows; no execution processes)
6. Governance (tenant / company / warehouse hierarchy; ADR-011 multi-tenant; ADR-032 RBAC+ABAC; ADR-014 audit — each cited only if resolved into the ADR set)
7. Ownership Boundaries (Warehouse owns: zones/areas/dock/equipment/labor/task-type-registry/dock-appointment-calendar/ops-config/numbering-series-registrations. Consumes read-only from MOD-005: item master, warehouse master, bin master. Consumes from MOD-001: tenant, company, branch, user. Does NOT own warehouse/bin master.)
8. Dependencies (upstream frozen baselines: MOD-001, MOD-005; no prior Warehouse sprints)
9. ERP Core Engine Consumption (per-engine reason paragraphs matching the resolved engine list)
10. ADR Consumption (per-ADR relevance paragraph matching the resolved ADR list)
11. Data Model (business entities; no schema)
12. Events (published: as resolved; deferred `R-EV-*` if not in Event Catalog)
13. Integration Contracts (read-only consumption of MOD-005 warehouse/bin master and MOD-001 tenant/company/branch/user via approved APIs)
14. Security (per ADR-011)
15. Authorization (per ADR-032 via ENG-002/ENG-003)
16. Operational Constraints (from Module PRD)
17. Implementation Readiness (Sprint Exit Criteria section of the Sprint Plan for SPR-MOD-019-001, verbatim)
18. References

Governance boundaries: Warehouse zones/areas overlay — never redefine — MOD-005 warehouse/bin master. No stock ledger writes. No accounting posting. No numbering algorithm invention.

### Part C — Governance Registration (each exactly once)

**Declared Files Modified** (finalized after Part 0's SPRINT_AUTHORING_GUIDE check):

1. `docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md` (new)
2. `docs/30-sprint-prds/warehouse/README.md` (Sprint 001 row: Reserved → Draft, link to PRD)
3. `docs/DOCUMENT_INDEX.md` (add entry)
4. `docs/_meta.json` (add sidebar link)
5. `docs/SPRINT_CATALOG.md` (add Draft row) — **included if** Part 0 determines Stage 2 registration is required; **otherwise explicitly excluded** with the reason recorded in the change set declaration
6. `.lovable/plan.md` (append execution record)

Must NOT modify (Tier A/B authoritative sources): `MODULE_PRD.md`, `MOD-019_SPRINT_PLAN.md`, `MODULE_CATALOG.md`, any Module Baseline, `MODULE_IMPLEMENTATION_WORKFLOW.md` (frozen), `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`, `ENGINE_USAGE_MATRIX.md`.

### Part D — Stage 2 Verification (Pass 8.9.2-V)

13-item checklist (Check / Result / Action table):

1. Frontmatter complete; `owner` matches Module PRD verbatim
2. 18 canonical sections present
3. Capability completeness — every Sprint capability originates from Module PRD
4. No capability outside Sprint 001 allocation
5. Engines resolved verbatim from Sprint Plan (identical set and order)
6. ADRs Accepted only, resolved verbatim from Sprint Plan
7. Events verbatim from Event Catalog or deferred `R-EV-*`
8. Ownership boundaries preserved (no MOD-005 territory absorbed)
9. Dependencies resolve from `MODULE_CATALOG.md`
10. Governance registrations completed exactly once each (matching the deterministic declared change set)
11. Repository consistency (no duplicate IDs, no broken references)
12. Metadata consistency (README ↔ DOCUMENT_INDEX ↔ _meta.json ↔ frontmatter; SPRINT_CATALOG row if the deterministic rule required it)
13. Bidirectional capability completeness (Module PRD → Sprint AND Sprint → Module PRD)

Invariant: `Passed + Remediated + Failed = 13`. Loop with minimal edits to the Sprint PRD only until `Failed = 0`.

### Part E — Repository Audit (Spec v1.0, frozen)

**Mandatory Read Set:**
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `docs/20-module-prds/warehouse/MODULE_PRD.md`
- `docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/02-architecture/event-catalog.md`
- `docs/SPRINT_AUTHORING_GUIDE.md`
- `docs/30-sprint-prds/warehouse/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`
- `docs/SPRINT_CATALOG.md` (always in read set so Metadata Consistency can verify inclusion-or-intentional-exclusion)

Rationale: this pass modifies README, DOCUMENT_INDEX, and _meta.json (and conditionally SPRINT_CATALOG), so the audit MUST read them to verify Metadata Consistency.

**Audit Metadata Header:** Specification Version, UTC Timestamp, Auditor, Tool Versions, Repository Revision Identifier (or "Unavailable" + D3 environmental waiver reason quoted), Change Tracking Mechanism, Declared Files Modified (with SPRINT_CATALOG inclusion decision explicit), Actual Change Set (must equal declared), SHA-256 Artifact Hashes per file.

**Evidence Table** (fixed schema): `Check | PASS/FAIL | Severity | Repository Evidence (path + section + exact quote) | Required Fix`.

**Coverage areas:** Stage 2 Verification; Capability Allocation Integrity; Engine Authority; ADR Authority; Event Authority; Ownership Boundary Validation; Repository Consistency; Metadata Consistency (owner-field match + change-set determinism); Cross-reference Validation; Artifact Integrity.

**Confidence (D2 closed enum):** `HIGH | MEDIUM | LOW`. `MEDIUM` permitted only under D3 environmental waiver.

**Repository Status:** `READY ⇔ Critical = 0 ∧ Major = 0`.

### Closing Artifacts (appended to `.lovable/plan.md` and mirrored in chat)

1. Authoritative Source Resolution Log (R1, R2, R3 if triggered, …)
2. Sprint Capability Allocation Report
3. Verification Metadata header
4. Check / Result / Action table (13 rows)
5. Verification Summary (Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass)
6. Repository Audit Metadata Header + Evidence Table + Confidence + Repository Status
7. Final Report

### Outcome

Pass 8.9.2 complete when:
- Capability Allocation Gate = PASS
- Stage 2 Verification = 13/13 Passed
- Repository Audit = READY + HIGH (or READY + MEDIUM under D3 waiver)
- Zero orphan capabilities, zero duplicate originating allocations, zero capabilities outside Sprint 001 scope

**Next Pass:** 8.9.3 — SPR-MOD-019-002 Inbound Execution (reuses this plan as the canonical Stage 2 template with module/sprint substitutions).
