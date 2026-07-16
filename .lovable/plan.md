
# Pass 15.0.0 — GT-002 Stage 1 Authoring for the Next Business OS Module

Execute the released GT-002 v1.0 lifecycle to author Stage 1 artifacts (Module PRD + Sprint Plan) for the next unpublished Business OS module, resolved dynamically from authoritative repository sources. Zero fabrication. No governance evolution.

## Governance Envelope
- Governance Framework v1.0 — Released
- GT-001..GT-005 — Active
- Execution Wrapper v1.0 — FROZEN
- Previous audit: `REPOSITORY_AUDIT_20260716T018000Z.md` — Repository READY

## Target Resolution (Dynamic)

Resolve from authoritative sources:
- `docs/MODULE_CATALOG.md`
- `docs/40-module-baselines/` (published baselines)
- `docs/20-module-prds/` (module PRDs)
- `docs/30-sprint-prds/` (sprint plans)

Determine at execution time:
- Target module (next unpublished MOD-NNN in catalog order)
- Module folder
- Execution mode (greenfield vs legacy-reconciliation) per released GT-002

Repository survey indicates the next unpublished module is **MOD-013 Assets** (folder `assets/`), but final resolution is performed by the released GT-002 lifecycle at execution time and is not hard-coded here.

## Lifecycle

1. **Preconditions** — Governance Released; GT-002/004/005 Active; Wrapper FROZEN; prior audit READY; no open corrective executions. Abort with `PRECONDITION-FAIL` (exit 20) on first failure.
2. **Repository Snapshot** — capture revision, source digests, snapshot metadata per GT-002.
3. **Dependency Resolution** — dynamically from Governance Template Dependency Matrix, Capabilities Registry, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, Module Catalog. No hard-coded identifiers.
4. **Module PRD Authoring** — author/reconcile `docs/20-module-prds/<module_folder>/MODULE_PRD.md` using GT-002 canonical structure. Legacy path via GT-001 where defined; otherwise greenfield. Resolve capabilities, entities, business rules, engines, ADRs, events, personas, ownership boundaries, dependencies, related modules, requirement IDs, traceability strictly from authoritative sources.
5. **Sprint Plan Authoring** — author `docs/30-sprint-prds/<module_folder>/<MOD-NNN>_SPRINT_PLAN.md` with deterministic sprint decomposition, capability allocation, dependency ordering, ownership boundaries, completion criteria, bidirectional Capability ↔ Sprint traceability.
6. **Registration** — update only GT-002-declared surfaces: `docs/20-module-prds/README.md`, `docs/30-sprint-prds/<module_folder>/README.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`.
7. **GT-002 Validation** — execute every rule via dynamic binding; all required PASS (INFO where permitted).
8. **GT-005 Repository Audit** — emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`; every profile PASS; Repository READY.
9. **Execution Finalization** — append record to `.lovable/plan.md`; release execution lock.

## Rollback
On post-Registration failure, execute GT-002 Runtime Rollback; restore registration surfaces in reverse order; restore repository to pre-execution state. Wrapper unchanged.

## Success Criteria
- Module PRD + Sprint Plan authored using released GT-002 canonical structure
- Content exclusively from authoritative repository sources
- Registration limited to GT-002-declared surfaces
- Every GT-002 validation PASS (INFO where permitted)
- GT-005 Repository Audit PASS; Repository READY
- Governance Framework, GT templates, and Wrapper unchanged

## Non-Goals
No GT-003 Sprint PRDs, no GT-004 Baseline, no GT-005 Publication, no governance/template/Wrapper edits, no implementation code.

## Deliverables
- `docs/20-module-prds/<module_folder>/MODULE_PRD.md`
- `docs/30-sprint-prds/<module_folder>/<MOD-NNN>_SPRINT_PLAN.md`
- Updated GT-002 registration surfaces
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`
- Execution record appended to `.lovable/plan.md`

## Execution Record (shape)

```yaml
execution_status: READY_FOR_SPRINT_AUTHORING
template: GT-002
template_version: v1.0
mode: <resolved by released GT-002>
target_module: <resolved dynamically from authoritative repository sources>
next_template: GT-003
next_target: <resolved dynamically according to the released GT-002 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

Include `previous_audit_report_id` only if declared by the released GT-002 template.

## Roadmap
- Pass 15.0.1 — GT-003 for Sprint 001 of the resolved module
- Remaining GT-003 Sprint PRDs
- Pass 15.1.0 — GT-004 Baseline Consolidation
- Pass 15.1.1 — GT-005 Publication
- Optional OR / RR / SR read-only reviews per established cadence
