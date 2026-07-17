## Pass 21.0.1 — GT-003 Sprint Authoring for SPR-MOD-017-001

### Preflight (read-only)
- Confirm `docs/20-module-prds/analytics/MODULE_PRD.md` and `docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md` exist.
- Confirm previous audit `REPOSITORY_AUDIT_20260717T140000Z` = Repository READY.
- Confirm no existing `SPR-MOD-017-001*` file under `docs/30-sprint-prds/analytics/sprints/`.
- Abort on any PRECONDITION-FAIL.

### Authoritative source re-read
- `docs/20-module-prds/analytics/MODULE_PRD.md` — extract Sprint 001 allocation (Data Mart authority, Analytics Foundation Configuration authority, allocated engines, allocated events).
- `docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md` — bind Sprint 001 boundary exactly as approved.
- One prior Sprint 001 PRD (e.g., MOD-016 Sprint 001) as structural template reference only.

### Deliverable — Sprint PRD
Create `docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md` using only GT-003-approved sections:

- **Header** — Sprint ID, module, stage, template, version, status.
- **Purpose** — Establish Data Mart Master Authority and Analytics Foundation Configuration Authority.
- **Scope** — In-scope authorities as allocated; out-of-scope items deferred to Sprints 002–005.
- **Functional Requirements** — Data Mart definition, metadata, source registration, refresh cadence config, retention config, active/inactive lifecycle; analytics configuration; refresh scheduling; environment-level settings; configuration validation.
- **Business Rules** — verbatim from user allocation (unique definition, configurable cadence/retention, active-only refresh, auditable config, read-model only, source data immutable).
- **Master Data** — Data Mart Definition, Data Source Registration, Refresh Configuration, Retention Policy, Analytics Environment Configuration.
- **Transactions** — N/A (read-model only; explicit statement).
- **Events** — Publish: `DataMartCreated`, `DataMartUpdated`, `DataMartRefreshConfigured` (+ Retention/Lifecycle events as allocated by Module PRD). Consume: only upstream platform events allocated.
- **Integrations** — ENG-005, ENG-004, ENG-024, ENG-020, ENG-001, ENG-002, ENG-003 as consumers only.
- **Dependencies** — Platform engines Released; MOD-017 PRD Approved; Sprint Plan Approved.
- **Acceptance Criteria** — one criterion per functional requirement and per business rule.
- **Traceability** — bidirectional matrix (Module PRD ↕ Sprint Plan ↕ Sprint PRD).
- **Ownership Boundaries** — recapitulated per user allocation; no reassignment.
- **Non-Goals** — KPI framework, dashboards, distribution, models, cross-module analytics, transactional authority.
- **References** — Module PRD, Sprint Plan, Governance v1.0, GT-003 v1.0.

### Registration (GT-003 surfaces only)
- `docs/30-sprint-prds/analytics/README.md` — mark SPR-MOD-017-001 status Authored, add link to Sprint PRD.
- `docs/SPRINT_CATALOG.md` — update SPR-MOD-017-001 row (status → Authored, link, timestamp).
- `docs/DOCUMENT_INDEX.md` — register the new Sprint PRD.
- `docs/_meta.json` — add JSON-valid entry for the new Sprint PRD.

### Audit + Execution Record
- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC>.md` per GT-005 spec (20-item checklist, Verification Summary, Repository Status: READY).
- Append GT-003 execution record to `.lovable/plan.md` with `execution_status: READY_FOR_STAGE_2`, `next_target: SPR-MOD-017-002`.

### Non-Goals
No Module PRD or Sprint Plan changes; no Sprint 002–005; no baseline; no implementation; no governance evolution.

### Rollback
On post-registration failure, revert registration edits, remove partial Sprint PRD, restore prior state.
