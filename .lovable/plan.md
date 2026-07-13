# Pass 9.1.1 — Execute GT-003 for SPR-MOD-006-002 (Leads) — v2

## Objective

Invoke the released GT-003 template to author the second CRM Sprint PRD (`SPR-MOD-006-002 Leads`), register it, run GT-003 validation, and emit a GT-005 repository audit. Uses Pass 9.1.0 as the reference execution. This pass also establishes a reusable **GT-003 Execution Wrapper** convention for the remainder of CRM Stage 2 (see §Reusable Execution Wrapper).

## Scope

**In:** GT-003 execution for SPR-MOD-006-002 — Sprint PRD authoring, 5-surface registration, GT-003 validation, GT-005 audit, handoff to SPR-MOD-006-003. Registration of the Execution Wrapper convention in `.lovable/plan.md` (this file) for reuse by Passes 9.1.2..9.1.5.

**Out:** Governance asset edits, Module PRD edits, Sprint Plan edits, other CRM sprints, baseline consolidation, promotion of the Execution Wrapper into `docs/15-governance/` (would require a governance template pass).

## Execution Envelope

```yaml
execution_id: GT003-MOD006-002-YYYYMMDD-001
execution_schema_version: 3
execution_mode: released
parent_result_id: <result_id from GT003-MOD006-001>
lock:
  path: .lovable/locks/<workspace_id>/registration.lock
  ttl_minutes: 30
  token: <UUIDv4>
  stale_reclaim: allowed after TTL expiry with operator override
  lock_release:
    always_on: [success, rollback, abort, precondition_fail]
```

**Preflight Snapshot** — digests frozen over: released GT-003, GT-005, Dependency Matrix, Capabilities Registry, CRM Module PRD, CRM Sprint Plan, `SPR-MOD-006-001-crm-foundation.md` (upstream dependency).

**Snapshot integrity rule:** If any frozen snapshot digest changes between Preflight and Registration commit, abort with `PRECONDITION-FAIL` and restart.

## Preconditions (all PASS required)

1. Governance Framework v1.0 = Released
2. GT-003 = Active; GT-005 = Active
3. Dependency Matrix = Active, acyclic
4. `docs/20-module-prds/crm/MODULE_PRD.md` exists (Stage 1 complete)
5. `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md` exists; SPR-MOD-006-002 reserved and unclaimed; reservation matches Sprint Plan / SPRINT_CATALOG / README exactly
6. **Upstream dependency fully satisfied.** `SPR-MOD-006-001-crm-foundation.md` SHALL:
   - exist at the registered path,
   - have `lifecycle_state = Authored` (or `Released` if the lifecycle enum defines it),
   - have passed GT-003 validation in Pass 9.1.0 (validation record discoverable via `execution_id: GT003-MOD006-001-*`),
   - have no open corrective pass or unresolved audit finding.
   Existence alone is insufficient.
7. No existing file at `docs/30-sprint-prds/crm/SPR-MOD-006-002_*.md`
8. No CRM baseline; no open corrective pass; Repository READY
9. Capabilities Registry ≥ v1.1

## Deliverable 1 — Sprint PRD

Author `docs/30-sprint-prds/crm/SPR-MOD-006-002-leads.md` conforming exactly to GT-003 §7 (canonical 18-section Stage 2 structure).

**Sprint Objective (from Sprint Plan §SPR-MOD-006-002):** Lead capture and qualification — lead master, lead scoring, assignment rule execution, and lead-to-opportunity conversion.

**Ownership & Bounded-Context Rules (derived from Pass 9.1.0 reference):**
- CRM Lead master is owned by MOD-006 (this sprint).
- Commercial Customer master remains owned by MOD-003 Sales — Lead-to-Customer conversion emits an intent event / handoff, it does not create Customer records inside CRM.
- Accounts & Contacts consumed from SPR-MOD-006-001 (upstream); this sprint MUST NOT redefine them.
- Opportunities are downstream (SPR-MOD-006-003) — this sprint emits the CRM Module PRD-defined lead-conversion event and MUST NOT author Opportunity entities.
- CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) is authored in SPR-MOD-006-001; this sprint EXECUTES those configurations, does not redefine them.

**Content resolution — all dynamic (no prompt invention):**
- Originating capability: resolved from CRM Module PRD Capability Allocation Matrix (row "Lead capture and qualification" → SPR-MOD-006-002); exclusivity enforced.
- Engines / ADRs: verbatim subsets of the CRM Module PRD unions relevant to Leads.
- **Events: resolved verbatim from the CRM Module PRD Event Catalog (and, transitively, the repository Event Catalog).** The emitted lead-conversion event name and every produced/consumed event SHALL be quoted verbatim from those sources. No event name may be invented by this execution pass; if the required conversion event is not registered, abort with `PRECONDITION-FAIL` and refer the gap upstream to the Module PRD rather than fabricating an event.
- Acceptance criteria + deliverables: derived from the Sprint Plan Exit Criteria; each testable.
- Traceability: bidirectional Module PRD ↔ Sprint Plan ↔ Sprint PRD ↔ deliverables for every allocated capability, including upstream link to SPR-MOD-006-001 and downstream link to SPR-MOD-006-003.
- Frontmatter: full GT-003 identity block including `sprint_id: SPR-MOD-006-002`, `module_id: MOD-006`, `governance_specification: v1.0`, `template_ref: GT-003 v1.0`, `derived_from`, `execution_id`, `depends_on: [SPR-MOD-006-001]`.
- Zero unresolved placeholders.

## Deliverable 2 — Registration (transactional, 5 surfaces)

- `docs/30-sprint-prds/crm/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`
- `docs/SPRINT_CATALOG.md`
- `docs/DOCUMENT_TRACEABILITY.md`

All-or-nothing: rollback all writes on any failure. No governance-asset edits.

## Deliverable 3 — GT-003 Validation

Execute the complete validation rule set declared by the released GT-003 artifact. Emit repository-standard artifacts:
- Verification Metadata header
- Validation Table (Check / Result / Action)
- Verification Summary (Checklist Items, Passed, Remediated, Failed, Outstanding Risks, Repository Status, Next Pass)

## Deliverable 4 — GT-005 Repository Audit

Invoke GT-005 with `audit_scope = { governance, repository, registration, traceability, integrity }`. Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-timestamp>.md` with `report_sha256` and `audit_summary`. Expected: PASS, Repository READY, Confidence MEDIUM (D3 inherited).

## Reusable Execution Wrapper (for Passes 9.1.2..9.1.5)

To eliminate bespoke prompts per sprint, subsequent CRM Stage 2 executions invoke the same envelope with only these sprint-specific inputs:

```yaml
gt003_execution_wrapper:
  sprint_id: SPR-MOD-006-XXX          # required
  objective: <verbatim from Sprint Plan §sprint_id>
  upstream_dependencies: [<sprint_ids>]   # verbatim from Sprint Plan
  bounded_context_rules:
    owns: [<entities owned by this sprint>]
    consumes_from: {<sprint_id>: [<entities>]}
    forbidden_to_author: [<entities owned elsewhere>]
    configuration_source: <sprint_id_or_module>
  expected_outputs:
    sprint_prd_path: docs/30-sprint-prds/crm/<slug>.md
    downstream_handoff: SPR-MOD-006-<next>
```

All other fields (Execution Envelope, Preflight Snapshot, Preconditions, Registration surfaces, Validation, Audit, Success Criteria) inherit unchanged from this plan. Wrapper does NOT become a governance template in this pass — that would require a separate governance authoring pass.

## Execution Outputs

```yaml
execution_status: READY_FOR_NEXT_SPRINT
result_id: <uuid>
execution_manifest_sha256: <sha>
audit_report_id: REPOSITORY_AUDIT_<ts>
audit_report_sha256: <sha>
execution_duration_ms: <int>
repository_revision_after: <rev>   # null ONLY when D3 waiver applies
next_template: GT-003
next_target: SPR-MOD-006-003
handoff_state: READY
```

Record completion in `.lovable/plan.md`.

## Success Criteria

- Sprint PRD authored and GT-003-conformant, with entity ownership respecting MOD-003 Customer master authority and SPR-MOD-006-001 configuration authority
- Every event named in the Sprint PRD resolves verbatim to the CRM Module PRD Event Catalog
- Upstream sprint verified in Authored/Released state with clean validation and no open findings
- Registration complete on all 5 surfaces (or fully rolled back)
- GT-003 validation: every rule declared by the released template PASS
- GT-005 audit PASS, Repository READY (Confidence MEDIUM)
- Governance assets unchanged
- Bidirectional traceability complete
- Execution Wrapper recorded for reuse by 9.1.2..9.1.5
- Handoff ready for Pass 9.1.2 (SPR-MOD-006-003 Opportunities)

## Next Pass

Pass 9.1.2 — Execute GT-003 for SPR-MOD-006-003 (Opportunities) via the Execution Wrapper. Continue sequentially through SPR-MOD-006-004..006, then GT-004 + GT-005 to publish `MOD006_CRM_BASELINE_v1`.
