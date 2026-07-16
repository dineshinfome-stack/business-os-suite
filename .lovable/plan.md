# Pass 13.0.4 — GT-003 for SPR-MOD-011-004 (AMC Analytics & Compliance)

Author the fourth and final MOD-011 AMC Sprint PRD under released GT-003 v1.0 and FROZEN Execution Wrapper v1.0. Zero fabrication; all content resolved from authoritative sources.

## Governance Envelope
- Governance Framework v1.0 — Released
- GT-003 v1.0 — Active
- Execution Wrapper v1.0 — FROZEN
- Previous audit: `REPOSITORY_AUDIT_20260716T003000Z.md` — Repository READY

## Lifecycle

1. **Preconditions** — Verify Framework Released, GT-003 Active, Wrapper FROZEN, Pass 13.0.3 complete, previous audit READY, `SPR-MOD-011-004` enumerated in Sprint Plan, no open corrective executions. Abort on first failure (`PRECONDITION-FAIL`, exit 20).
2. **Snapshot Freeze** — Capture revision, authoritative source digests, GT-003-declared snapshot metadata.
3. **Authoritative Resolution** — Resolve slug, scope, capabilities, entities, engines, ADRs, events (published/consumed), upstream/downstream deps, personas, acceptance/exit criteria from:
   - `docs/20-module-prds/amc/MODULE_PRD.md`
   - `docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`
   - `docs/10-erp-core/ENGINE_CATALOG.md`
   - `docs/ENGINE_USAGE_MATRIX.md`
   - `docs/11-adrs/ADR_INDEX.md`
   - `docs/02-architecture/event-catalog.md`
   - `docs/MODULE_CATALOG.md`
4. **Sprint Authoring** — Create `docs/30-sprint-prds/amc/SPR-MOD-011-004-<slug>.md` using GT-003 canonical structure. Preserve bidirectional traceability, ownership boundaries, source fidelity. Establish AMC read-model boundary; consume AMC-owned events (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) and cross-module events per Module PRD §8; defer cross-module KPI ownership to MOD-017 Analytics.
5. **Transactional Registration** — Update only:
   - `docs/30-sprint-prds/amc/README.md`
   - `docs/SPRINT_CATALOG.md`
   - `docs/DOCUMENT_INDEX.md`
   - `docs/_meta.json`
6. **GT-003 Validation** — Execute every rule declared by GT-003 via dynamic binding. No hard-coded counts. INFO permitted only where GT-003 defines.
7. **GT-005 Repository Audit** — Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`. Require every profile PASS and Repository READY.
8. **Finalization** — Append execution record to `.lovable/plan.md`. Release execution lock.

## Rollback
On failure after Registration, execute Runtime Rollback inherited from FROZEN Wrapper v1.0 to restore pre-execution state.

## Success Criteria
- Sprint PRD authored using GT-003 canonical structure
- Content resolved exclusively from authoritative sources
- Bidirectional traceability preserved
- Registration limited to GT-003-declared surfaces
- All GT-003 validation rules PASS (INFO where permitted)
- GT-005 Audit PASS; Repository READY
- If this sprint completes the approved Sprint Plan, execution handoff resolves to `READY_FOR_BASELINE_CONSOLIDATION`; otherwise follow released GT-003 handoff rules
- Governance Framework, GT templates, Wrapper unchanged

## Non-Goals
No Module PRD/Sprint Plan edits. No GT-004 Baseline. No GT-005 Publication. No governance evolution. No template/Wrapper changes. No implementation code.

## Deliverables
- `docs/30-sprint-prds/amc/SPR-MOD-011-004-<slug>.md`
- Updated GT-003 registration surfaces (4)
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`
- Execution record appended to `.lovable/plan.md`

## Execution Record (shape)
```yaml
execution_status: <resolved by released GT-003 handoff rules>
template: GT-003
template_version: v1.0
module: MOD-011 AMC
sprint_id: SPR-MOD-011-004
next_template: <resolved by released GT-003>
next_target: <resolved dynamically from Sprint Plan and GT-003 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```
Include `previous_audit_report_id` only if declared by GT-003.

## Roadmap
- Pass 13.1.0 — GT-004 Baseline Consolidation (MOD011_AMC_BASELINE_v1) — activates when GT-003 handoff resolves to `READY_FOR_BASELINE_CONSOLIDATION`
- Pass 13.1.1 — GT-005 Publication (MOD011_AMC_BASELINE_v1)
- Pass 14.0.0 — GT-002 Stage 1 for next module (resolved dynamically)
- Optional OR / RR / SR read-only reviews per established cadence
