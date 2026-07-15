## Pass 11.0.6 — GT-003 for SPR-MOD-009-006 (FROZEN Wrapper v1.0)

Author Manufacturing Sprint 6 PRD (final MOD-009 Stage 2 sprint) using released GT-003 under FROZEN Wrapper v1.0. Zero fabrication — all sprint facts resolve verbatim from authoritative sources.

### Execution Variables
- template: GT-003 (Active), Wrapper v1.0 FROZEN
- module: MOD-009 Manufacturing
- sprint_id: SPR-MOD-009-006
- sprint_target: `docs/30-sprint-prds/manufacturing/SPR-MOD-009-006-<slug>.md` (slug resolved from Sprint Plan)
- audit: `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC>.md`

### Lifecycle (FROZEN Wrapper v1.0)

1. **Preconditions** — verify Governance v1.0 Released, GT-003 Active, Wrapper v1.0 FROZEN, Pass 11.0.5 complete, latest successful GT-003 audit READY, `SPR-MOD-009-006` enumerated in Sprint Plan, no open correctives. Abort with `PRECONDITION-FAIL` (exit 20) on first failure.
2. **Snapshot Freeze** — capture revision id + authoritative-source digests.
3. **Authoritative Resolution** — resolve slug, scope, capabilities, entities, engines, ADRs, published/consumed events, upstream/downstream deps, personas, acceptance & exit criteria exclusively from:
   - `docs/20-module-prds/manufacturing/MODULE_PRD.md`
   - `docs/30-sprint-prds/manufacturing/MOD-009_SPRINT_PLAN.md`
   - `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`
   - `docs/11-adrs/ADR_INDEX.md`, `docs/02-architecture/event-catalog.md`
   - `docs/MODULE_CATALOG.md`
4. **Sprint Authoring** — author Sprint PRD in released GT-003 canonical structure. Preserve Sprint↔Sprint Plan and Sprint↔Module PRD traceability, authoritative identifiers, ownership boundaries, dependency isolation.
5. **Transactional Registration** — update only GT-003 registration surfaces:
   - `docs/30-sprint-prds/manufacturing/README.md`
   - `docs/SPRINT_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json`
6. **GT-003 Validation** — execute every validation rule declared by the released GT-003 template via dynamic rule binding.
7. **GT-005 Repository Audit** — emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC>.md`; require all profiles PASS + Repository READY.
8. **Finalization** — append execution record to `.lovable/plan.md`; release lock.

### Rollback
On failure after Registration, apply Runtime Rollback inherited from FROZEN Wrapper v1.0. No wrapper behavior modified.

### Success Criteria
- Sprint PRD in released GT-003 canonical structure
- Sprint-specific content resolved exclusively from authoritative sources
- Bidirectional traceability preserved
- Registration on GT-003 surfaces only
- Every validation rule declared by the released GT-003 template executes; all required validations PASS (INFO where permitted)
- GT-005 audit PASS, Repository READY
- MOD-009 Manufacturing Stage 2 complete (6/6)
- Governance/templates/wrapper unchanged

### Non-Goals
No governance evolution, no template/wrapper edits, no Module PRD or Sprint Plan edits, no GT-004/GT-005 publication, no implementation code.

### Execution Record (shape)
```yaml
execution_status: READY_FOR_BASELINE_CONSOLIDATION
next_template: GT-004
next_target: MOD009_MANUFACTURING_BASELINE_v1
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```
Include `previous_audit_report_id` (resolved to the latest successful GT-003 audit) only if defined by the released GT-003 template.

### Roadmap
11.1.0 GT-004 Baseline (`MOD009_MANUFACTURING_BASELINE_v1`) → 11.1.1 GT-005 Publication. Optional OR/RR/SR reviews per cadence.
