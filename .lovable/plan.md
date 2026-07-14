# Pass 10.0.0 v2 — Execute GT-002 for MOD-008 Payroll (Stage 1 Authoring)

Execute the released **GT-002** template to author Stage 1 governance artifacts for **MOD-008 Payroll** under the unchanged Governance Framework v1.0. No governance evolution, no template changes, no wrapper changes.

## Execution Variables

- template: GT-002 (Released, Active)
- module_id: MOD-008
- module_name: Payroll
- module_prd_target: `docs/20-module-prds/payroll/MODULE_PRD.md` (legacy PRD present — reconcile in-place per GT-002 legacy mode; delegate legacy normalization to GT-001 where required)
- sprint_plan_target: `docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md`
- audit_report: `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`

All module facts (capabilities, entities, engines, ADRs, events, personas, sprint decomposition) resolve verbatim at execution time from authoritative sources. **Zero fabrication.**

## Lifecycle (per released GT-002)

1. **Preflight** — verify Governance Framework v1.0 Released; GT-002/003/004/005 Active and unchanged; GT-003 Wrapper v1.0 FROZEN; MOD-006 and MOD-007 PUBLISHED; RR-001 completed; no open corrective executions; MOD-008 registered in `docs/MODULE_CATALOG.md`; repository READY. Abort on first failure (`PRECONDITION-FAIL`, exit 20).
2. **Dependency Resolution** — resolve GT-002 dependencies dynamically via the Governance Template Dependency Matrix and Capabilities Registry.
3. **Module Authoring** — reconcile/normalize `docs/20-module-prds/payroll/MODULE_PRD.md` to the released GT-002 canonical structure; preserve legacy provenance via `legacy_updated`; resolve engines from Engine Catalog + Engine Usage Matrix, ADRs from ADR Index, events from Event Catalog, dependencies from Module Catalog.
4. **Sprint Planning** — author `docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md` with deterministic sprint decomposition, capability allocation, and dependency sequencing. Ensure bidirectional traceability (every PRD capability → ≥1 sprint; every sprint → ≥1 PRD capability).
5. **Registration** — update only the registration surfaces declared by the released GT-002 template.
6. **GT-002 Validation** — execute every validation rule declared by the released GT-002 template.
7. **GT-005 Repository Audit** — emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`; all profiles must PASS; repository finishes READY.
8. **Completion** — append Execution Record to `.lovable/plan.md`.

## Authoritative Sources (read-only)

Governance Framework v1.0, GT-002 released template, Dependency Matrix, Capabilities Registry, Engine Catalog, Engine Usage Matrix, ADR Index, Event Catalog, Module Catalog, published CRM Baseline, published HRMS Baseline. Missing dependency → `PRECONDITION-FAIL`.

## Execution Record (target)

```yaml
execution_status: READY_FOR_SPRINT_AUTHORING
next_template: GT-003
next_target: MOD-008 Sprint 001
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

## Success Criteria

- Module PRD authored in released GT-002 canonical structure.
- Sprint Plan authored with bidirectional capability↔sprint traceability.
- Registration completed across GT-002-declared surfaces.
- Every GT-002 validation rule PASS (INFO allowed where the template permits).
- GT-005 audit PASS; repository READY.
- Governance Framework, GT templates, and Wrapper v1.0 unchanged.

## Non-Goals

No GT-003/GT-004/GT-005 authoring, no Sprint PRDs, no baseline, no publication, no governance/template/wrapper changes, no implementation code.

## Roadmap

- Pass 10.0.1 — GT-003 for SPR-MOD-008-001
- Pass 10.0.2..10.0.6 — remaining Payroll Sprint PRDs
- Pass 10.1.0 — GT-004 Baseline Consolidation (`MOD008_PAYROLL_BASELINE_v1`)
- Pass 10.1.1 — GT-005 Publication
