# Pass 9.1.5 — Execute GT-003 for SPR-MOD-006-006 (v2)

Final CRM Stage 2 sprint. Inherits the GT-003 Execution Wrapper established in Pass 9.1.1 and continued through 9.1.4.

## Execution Wrapper

```yaml
execution_id: GT003-MOD006-006-20260714-001
parent_result_id: GT003-MOD006-005-20260714-001
execution_schema_version: 3
execution_mode: released
lock:
  inherit: true
```

## Step 1 — Preconditions (abort on first failure)

Read-only verification, no writes:

- Governance Framework v1.0 = Released; GT-003, GT-005 = Active.
- Dependency Matrix v1.0.2 unchanged.
- `docs/20-module-prds/crm/MODULE_PRD.md` unchanged since Pass 9.1.4.
- `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md` unchanged since Pass 9.1.4.
- SPR-MOD-006-001 … 005 present, validated, no open corrective execution.
- SPR-MOD-006-006 is Reserved/Planned across all registration surfaces.
- Repository status = READY.

On any failure → `PRECONDITION-FAIL`, no artifacts written, upstream remediation requested.

## Step 2 — Authoritative Resolution (zero fabrication)

Resolve slug, objective, capabilities, engines, ADRs, published/consumed events, acceptance criteria, deliverables, dependencies, APIs, integrations, and traceability dynamically from the **canonical repository paths** (matching those used and validated in Passes 9.1.0–9.1.4):

- CRM Module PRD — `docs/20-module-prds/crm/MODULE_PRD.md` (entity + event allocation, engine/ADR bindings)
- CRM Sprint Plan — `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md` (SPR-MOD-006-006 row)
- Engine Catalog — `docs/10-erp-core/ENGINE_CATALOG.md`
- Engine Usage Matrix — `docs/ENGINE_USAGE_MATRIX.md`
- ADR Index — `docs/11-adrs/ADR_INDEX.md`
- Repository Event Catalog — `docs/02-architecture/event-catalog.md`

Every event name resolved verbatim. Missing authoritative reference → `PRECONDITION-FAIL`, no substitutes.

## Step 3 — Bounded Context Enforcement

- Author only entities allocated to SPR-MOD-006-006 by the CRM Module PRD.
- Consume upstream sprint outputs (S1 Foundation, S2 Leads, S3 Opportunities, S4 Activities, S5 Campaigns) without redefinition.
- Do not redefine entities owned by Customer Master, Sales, Accounting, Inventory, Projects, HRMS unless explicitly allocated.

## Step 4 — Deliverable 1: Sprint PRD

Create:

```
docs/30-sprint-prds/crm/SPR-MOD-006-006-<slug>.md
```

Slug resolved verbatim from CRM Sprint Plan. Structure bound dynamically to released GT-003 v1.0 18-section canonical structure.

## Step 5 — Deliverable 2: Transactional Registration

Update in a single transaction (rollback on any failure):

1. `docs/30-sprint-prds/crm/README.md` — flip Sprint 6 row Planned → Authored (Draft).
2. `docs/SPRINT_CATALOG.md` — append Sprint 6 row.
3. `docs/DOCUMENT_INDEX.md` — append Sprint 6 entry.
4. `docs/_meta.json` — append Sprint 6 sidebar entry.

`docs/DOCUMENT_TRACEABILITY.md` remains Present but N/A per current governance (consistent with Passes 9.1.0–9.1.4).

## Step 6 — Deliverable 3: GT-003 Validation

Execute the complete validation rule set declared by released GT-003 v1.0. Bind identifiers and count dynamically — no hardcoded values. Expected: every declared rule PASS, Repository READY.

## Step 7 — Deliverable 4: GT-005 Repository Audit

Execute released GT-005 unmodified. Emit:

```
docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md
```

Expected: every declared audit rule PASS, Repository READY, Confidence MEDIUM (D3 inherited).

## Step 8 — Execution Record & Handoff

Append execution record to `.lovable/plan.md`:

```yaml
execution_status: READY_FOR_GT004
next_template: GT-004
next_target: MOD-006
handoff_state: READY
handoff_contract:
  upstream_pass: 9.1.5
  upstream_sprint: SPR-MOD-006-006
  downstream_requires:
    - All CRM Sprint PRDs authored
    - Sprint registrations complete
    - GT-003 validation PASS
    - GT-005 audit PASS
    - Repository READY
```

## Success Criteria

- Sprint PRD conforms to released GT-003.
- Scope matches CRM Sprint Plan; no fabricated capabilities/events/engines/ADRs/APIs.
- Ownership boundaries preserved across CRM sprints and cross-module.
- Transactional registration completed on all 4 applicable surfaces.
- Every declared GT-003 validation rule PASS.
- Every declared GT-005 audit rule PASS.
- Repository READY.
- **CRM Stage 2 complete and `READY_FOR_GT004` handoff satisfied.**
- Governance Framework unchanged.

## Roadmap

- **Pass 9.2.0** — GT-004 for MOD-006 (CRM Baseline Consolidation).
- **Pass 9.2.1** — GT-005 Repository Audit + publish `MOD006_CRM_BASELINE_v1`.
- **Pass 9.3.0** — Resume with MOD-007 HRMS Stage 2 (GT-003).

## Technical Notes

- No governance assets modified during this pass.
- Authoritative reads occur before any write; writes performed transactionally with rollback on validation or audit failure.
- Timestamps use UTC ISO-8601 compact form for audit filenames.
- Canonical source paths in Step 2 match Passes 9.1.0–9.1.4 (`docs/10-erp-core/`, `docs/11-adrs/`, `docs/02-architecture/`), preventing preflight path drift.
