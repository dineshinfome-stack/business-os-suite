## Pass 18.0.4 — GT-003 Sprint Authoring for SPR-MOD-016-004 (Knowledge Base, Macros & CSAT)

Author the fourth Service Desk Sprint PRD under Governance Framework v1.0, GT-003 v1.0, and FROZEN Execution Wrapper v1.0. Zero governance evolution, zero implementation, zero architecture redesign, zero scope expansion.

### 1. Preflight (abort on PRECONDITION-FAIL)
- Framework v1.0 Released; GT-003 v1.0 Active; Wrapper v1.0 FROZEN.
- MOD-016 Stage 1 complete; Sprints 001, 002, 003 complete.
- Previous audit `REPOSITORY_AUDIT_20260717T090000Z` = Repository READY.
- `docs/30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md` exists and is approved.
- Sprints 001–003 PRDs exist; no `SPR-MOD-016-004*` file present.
- No open corrective executions; repository integrity intact.

### 2. Authoritative Sources (read-only)
- `docs/20-module-prds/service-desk/MODULE_PRD.md`
- `docs/30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md`
- `SPR-MOD-016-001`, `SPR-MOD-016-002`, `SPR-MOD-016-003`
- Released Governance Framework v1.0 and GT-003 v1.0

Prior Sprint PRDs referenced only for established authorities and structural continuity — never as authority to introduce new scope.

### 3. Sprint 004 Allocation (exact)

**Authorities in scope**
- Knowledge Article Authority (master, categorization, lifecycle Draft→Review→Published→Archived, versioning, Internal vs Customer-visible visibility).
- Macro Authority (definition, template-based execution, audit recording, no ticket history mutation).
- CSAT Survey/Response Authority (survey issuance post eligible ticket closure, single response per survey, score capture, audit trail).

**Engine consumption (from Module PRD §12)**
- Workflow ENG-010, Approval ENG-011, Rules ENG-012, Automation ENG-013.
- Document ENG-007, Attachment ENG-008, Search ENG-020, Localization ENG-006.
- Notification ENG-025 (surveys), Event ENG-024, Audit ENG-004.
- Authorization ENG-002, Permission ENG-003, Identity ENG-001, Configuration ENG-005.

**Business rules (bounded to Sprint 004; from Module PRD §7)**
- Knowledge articles must be reviewed before publish.
- Only Published + Customer-visible articles are exposed externally.
- Macros apply approved templates and cannot mutate historical ticket state.
- CSAT surveys issue only after eligible ticket closure.
- Exactly one CSAT response per eligible survey.
- Full auditability for KB and CSAT records.

**Events published**: `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, `CSATResponseReceived`.
**Events consumed**: `ServiceTicketClosed` (Sprint 002); `SLABreached` (Sprint 003) where allocated by Module PRD.

**Ownership boundaries — recapitulated, not evolved**
- Sprint 001 → Foundation configuration (categories, SLA policy master, business hours, routing, numbering).
- Sprint 002 → Service Ticket transaction and lifecycle.
- Sprint 003 → SLA clock, breach, escalation authorities.
- MOD-001 → Identity/Tenant.
- MOD-006 → Customer master.
- MOD-017 → Analytics read-model-only boundary (Sprint 005 reserves reporting/KPI scope).

### 4. Deliverables

Author `docs/30-sprint-prds/service-desk/sprints/SPR-MOD-016-004_KNOWLEDGE_BASE_MACROS_AND_CSAT.md` using GT-003-approved sections only: Header, Purpose, Scope, Functional Requirements, Business Rules, Master Data, Transactions (if applicable), Events, Integrations, Dependencies, Acceptance Criteria, Traceability, Ownership Boundaries, Non-Goals, References.

Update GT-003-declared registration surfaces only:
- `docs/30-sprint-prds/service-desk/README.md` — Sprint 004 status → Draft-authored with link.
- `docs/SPRINT_CATALOG.md` — register SPR-MOD-016-004.
- `docs/DOCUMENT_INDEX.md` — register new Sprint PRD.
- `docs/_meta.json` — add entry; JSON-valid; no structural changes beyond GT-003 registration.

Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` using released GT-005 Repository Audit specification (dynamic timestamp allocated at execution).

Append GT-003 execution record to `.lovable/plan.md`.

### 5. Validation (dynamic rule binding)
Execute every GT-003 validation via dynamic rule binding; no hard-coded validation IDs or counts. Require:
- Sprint scope matches Sprint Plan allocation exactly.
- KB / Macro / CSAT behaviour derived exclusively from approved Module PRD.
- Sprints 001–003 authorities referenced correctly; no reassignment.
- No orphan requirements; no out-of-scope functionality.
- Event graph consistent with Module PRD.
- Complete bidirectional traceability (Module PRD ↔ Sprint Plan ↔ Sprint PRD ↔ deliverables).
- All GT-003 validations PASS; INFO only where GT-003 permits.
- Repository Audit PASS; Repository READY.

### 6. Rollback
On any post-registration failure, execute the released GT-003 Runtime Rollback: reverse registration surfaces, remove partial Sprint PRD artifacts, restore repository to exact pre-execution state; Wrapper behaviour unchanged.

### 7. Non-Goals
No Sprint Plan / Sprints 001–003 / Module PRD modifications. No Module Baseline. No Publication. No implementation code. No governance / GT / Wrapper evolution. No Sprint 005 analytics or reporting capabilities.

### 8. Execution Record (shape)
```
execution_status: READY_FOR_STAGE_2
template: GT-003
template_version: v1.0
module: MOD-016 Service Desk
sprint: SPR-MOD-016-004
stage: Sprint Authoring
next_template: GT-003
next_target: <resolved dynamically per released GT-003 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
# previous_audit_report_id included only if declared by released GT-003 template
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

### 9. Success Criteria
Sprint PRD authored exclusively from approved sources; scope matches Sprint 004 allocation exactly; ownership recapitulated not evolved; complete bidirectional traceability; registration limited to GT-003 surfaces; all GT-003 validations PASS; Repository Audit PASS; Repository READY; Framework / GT templates / Wrapper unchanged.

### 10. Roadmap
- GT-003 Sprint 004 COMPLETE upon PASS.
- Next: GT-003 Sprint 005 — Service Analytics (dynamically resolved).
- After all MOD-016 sprints: GT-004 Baseline Consolidation → GT-005 Publication.
