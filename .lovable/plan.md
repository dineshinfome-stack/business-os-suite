# Pass 9.1.0 — Execute GT-003 for SPR-MOD-006-001 CRM (Customer Foundation) — v3

## Objective

Invoke released GT-003 to author the first CRM Sprint PRD (`SPR-MOD-006-001 Customer Foundation`), complete registration, GT-003 validation, and a GT-005 audit. First real GT-003 execution against a Business OS module; becomes the reference for SPR-MOD-006-002…006 and all subsequent sprint executions repository-wide.

## Scope

**In:** GT-003 execution — Sprint PRD authoring, registration, GT-003 validation, GT-005 audit, handoff to SPR-MOD-006-002.

**Out:** GT-002 / GT-004 / GT-005 template edits, Governance Framework, Dependency Matrix, Capabilities Registry, CRM Module PRD, CRM Sprint Plan, other CRM sprints, baselines.

## Execution Envelope

```yaml
execution_id: GT003-MOD006-001-YYYYMMDD-001
execution_schema_version: 3
execution_mode: released
parent_result_id: >
  Resolved from the latest successful GT-002 execution for MOD-006
  (Pass 8.11.1). Null if the legacy record predates execution lineage
  and no result_id is discoverable.
lock:
  path: .lovable/locks/<workspace_id>/registration.lock
  ttl_minutes: 30
  token: <UUIDv4>
  stale_reclaim: allowed after TTL expiry with operator override
  lock_release:
    always_on: [success, rollback, abort, precondition_fail]
    verifies: lock_token
```

**Preflight Snapshot** — digests frozen for the pass over: released GT-003, GT-005, Dependency Matrix, Capabilities Registry, CRM Module PRD, CRM Sprint Plan.

**Snapshot integrity rule:** If any frozen snapshot digest changes between Preflight and the Registration commit, abort with `PRECONDITION-FAIL` and restart the execution. Guarantees no torn reads across concurrent governance edits.

## Preconditions (all PASS required)

1. Governance Framework v1.0 = Released
2. GT-003 = Active; GT-005 = Active
3. Dependency Matrix = Active, acyclic
4. `docs/20-module-prds/crm/MODULE_PRD.md` exists (Stage 1 complete)
5. `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md` exists; SPR-MOD-006-001 reserved and unclaimed. **Reservation SHALL match the Sprint Plan exactly** (id, goal, iteration, dependencies) — any drift between Sprint Plan and `SPRINT_CATALOG.md` / module README aborts with `PRECONDITION-FAIL`.
6. No file at `docs/30-sprint-prds/crm/SPR-MOD-006-001_*.md`
7. No CRM baseline
8. No open corrective pass
9. Repository READY
10. Capabilities Registry ≥ v1.1

## Deliverable 1 — Sprint PRD

Author `docs/30-sprint-prds/crm/SPR-MOD-006-001_CUSTOMER_FOUNDATION.md` conforming exactly to GT-003 §7 (canonical 18-section Stage 2 structure).

**Sprint Objective — Customer Foundation:** Customer Master, Categories, Status, Contact Management, Address Management, Customer Groups, Tags, Relationships, Duplicate Detection, Search, Timeline, Notes, Attachments, basic REST APIs, Events, Security, Permissions, Audit Trail.

**Content resolution — all dynamic:**
- Originating capability: resolved from CRM Module PRD Capability Allocation Matrix; exclusivity enforced.
- Engines / ADRs / Events: verbatim subsets of the CRM Module PRD unions.
- Acceptance criteria + deliverables: derived from the objective; each testable.
- Traceability: bidirectional Module PRD ↔ Sprint Plan ↔ Sprint PRD ↔ deliverables for every allocated capability.
- Frontmatter: full GT-003 identity block including `sprint_id`, `module_id: MOD-006`, `governance_specification: v1.0`, `template_ref: GT-003 v1.0`, `derived_from`, `execution_id`.
- Zero unresolved placeholders.

## Deliverable 2 — Registration (transactional)

Update only GT-003-mandated surfaces:
- `docs/30-sprint-prds/crm/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`
- `docs/SPRINT_CATALOG.md`
- `docs/DOCUMENT_TRACEABILITY.md`

All-or-nothing: rollback all registration writes on any failure. No governance-asset edits.

## Deliverable 3 — GT-003 Validation

Execute the complete validation rule set declared by the released GT-003 artifact. Currently resolves to `VAL-001..VAL-012`, `VAL-013A`, `VAL-013B`, `VAL-014`, but binding is to the released template — not to a fixed count.

Emit repository-standard artifacts:
- Verification Metadata header
- Validation Table (Check / Result / Action)
- Verification Summary (Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass)

## Deliverable 4 — GT-005 Repository Audit

Invoke GT-005 with `audit_scope = { governance, repository, registration, traceability, integrity }`. **GT-005 SHALL use its released audit profiles without redefining them in this pass.** Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-timestamp>.md` with `report_sha256` and `audit_summary`. Expected: PASS, Repository READY, Confidence MEDIUM (D3 inherited).

## Execution Outputs

```yaml
execution_status: READY_FOR_NEXT_SPRINT
result_id: <uuid>
execution_manifest_sha256: <sha>   # computed over canonical execution outputs
                                   # excluding runtime timestamps and lock_token
audit_report_id: REPOSITORY_AUDIT_<ts>
audit_report_sha256: <sha>
execution_duration_ms: <int>
repository_revision_after: <rev>   # null ONLY when D3 waiver applies; else MUST be a revision
next_template: GT-003
next_target: SPR-MOD-006-002
handoff_state: READY
```

Record completion in `.lovable/plan.md`.

## Success Criteria

- Sprint PRD authored and GT-003-conformant
- Registration complete on all 5 surfaces (or fully rolled back)
- GT-003 validation: every rule declared by the released template PASS
- GT-005 audit PASS, Repository READY (Confidence MEDIUM)
- Governance assets unchanged
- Sprint traceability complete: every allocated capability linked bidirectionally between Module PRD, Sprint Plan, Sprint PRD, and deliverables
- Preflight snapshot digests unchanged at commit; lock released on every terminal state
- Handoff ready for Pass 9.1.1

## Next Pass

Pass 9.1.1 — Execute GT-003 for SPR-MOD-006-002. Continue sequentially through all CRM sprints, then GT-004 + GT-005 to publish `MOD006_CRM_BASELINE_v1`. CRM then serves as the Business OS reference implementation before resuming MOD-007 HRMS.
