## Pass 21.0 — GT-002 Sprint Planning for MOD-017 Analytics

Author the Sprint Plan for MOD-017 Analytics under Governance Framework v1.0, GT-002 v1.0, and FROZEN Execution Wrapper v1.0. Zero governance evolution, zero implementation, zero scope expansion.

### 1. Preflight (abort on PRECONDITION-FAIL)
- Governance Framework v1.0 = Released
- GT-002 v1.0 = Active
- Execution Wrapper v1.0 = FROZEN
- MOD-016 lifecycle COMPLETE through GT-005 (audit `REPOSITORY_AUDIT_20260717T130000Z` = READY)
- Approved `docs/20-module-prds/analytics/MODULE_PRD.md` exists
- No existing `docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`
- No open corrective executions
- Repository integrity intact

### 2. Authoritative Sources (read-only)
- `docs/20-module-prds/analytics/MODULE_PRD.md`
- Released Governance Framework v1.0
- Released GT-002 v1.0

No Sprint PRDs, Baselines, or other modules constitute planning authority.

### 3. Sprint Breakdown (derived from Module PRD §2 submodules KPIs, Dashboards, Marts, Distribution, Models; capabilities §2; entities §5; transactions §6; rules §7)

| Sprint | Title | Scope Anchor in Module PRD |
|---|---|---|
| SPR-MOD-017-001 | Analytics Foundation & Data Marts | Marts submodule; §5 Data Mart master; §10 retention & refresh cadence configuration; ENG-005 Configuration; §11 NFRs baseline |
| SPR-MOD-017-002 | KPI Framework & Metric Catalog | KPIs submodule; §5 KPI master (versioned catalog); §7 single-catalog + classification rules; §9 KPI trends; ADR-032 sensitive-KPI access |
| SPR-MOD-017-003 | Dashboards & Visualization | Dashboards submodule; §5 Dashboard master; §6 Dashboard View transaction; §7 freshness declaration; ENG-022 Dashboard Engine |
| SPR-MOD-017-004 | Scheduled Distribution, Reporting & Export | Distribution submodule; §5 Distribution List master; §6 Report Run transaction; §8 ReportPublished/DashboardShared events; ENG-027 Export |
| SPR-MOD-017-005 | Analytical Models, Cross-Module Analytics & Compliance | Models submodule; §6 Model Run transaction; §8 ModelRunCompleted, event-consumption of all module domain events; §9 Executive Overview, Anomaly Highlights; §11 compliance/retention |

All capabilities in §2, all masters in §5, all transactions in §6, all events in §8, all reports in §9, and all configuration keys in §10 are allocated exactly once. No overlap, no orphan requirement.

### 4. Deliverable
Create `docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md` using only released GT-002 sections:
Header · Purpose · Scope · Sprint Breakdown · Sprint Objectives · Authority Allocation · Dependencies · Traceability · Ownership Boundaries · Non-Goals · References.

**Ownership Boundaries (recapitulated, not evolved).**
- MOD-017 owns KPI catalog, Dashboard master, Data Mart master, Distribution List master, and Report/Dashboard/Model Run transactions.
- Ledger posting → ENG-016 (owned by MOD-002).
- Numbering → ENG-017; Audit → ENG-004; Workflow → ENG-010; Approval → ENG-011; Rules → ENG-012; Config → ENG-005; Authorization/Permissions → ENG-002/003 per ADR-032.
- Domain masters (Customer, Vendor, Item, Employee, Asset, etc.) remain owned by their source modules; MOD-017 consumes read-only via marts.
- Analytics is read-model-only w.r.t. source-module transactional truth.

### 5. Registration (GT-002 surfaces only)
- `docs/30-sprint-prds/analytics/README.md`
- `docs/SPRINT_CATALOG.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json` (JSON-valid, GT-002 registration entries only)

Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` per released GT-005 Repository Audit spec. Append GT-002 execution record to `.lovable/plan.md`.

### 6. Validation (dynamic rule binding)
- Sprint Plan derived exclusively from approved Module PRD
- Complete allocation, no duplication, no orphan requirement
- No scope expansion, no governance evolution
- Clear ownership boundaries
- Bidirectional traceability Module PRD ↕ Sprint Plan
- Registration limited to GT-002 surfaces
- All GT-002 validations PASS; INFO only where permitted
- Repository Audit PASS; Repository READY
- No hard-coded validation identifiers or counts

### 7. Rollback
On any post-registration failure, execute released GT-002 Runtime Rollback: reverse registration updates, remove partial artifacts, restore repository to pre-execution state, preserve Wrapper unchanged.

### 8. Non-Goals
No Module PRD modification, Sprint PRD authoring, Baseline creation, Publication, implementation, governance evolution, GT/Wrapper evolution, or cross-module ownership change.

### 9. Execution Record (shape)
```text
execution_status: READY_FOR_STAGE_1
template: GT-002
template_version: v1.0
module: MOD-017 Analytics
stage: Sprint Planning
next_template: GT-003
next_target: <resolved dynamically per released GT-003 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```
(`previous_audit_report_id` included only if declared by released GT-002 template.)

### 10. Success Criteria
Plan authored from approved PRD; complete non-overlapping allocation; ownership boundaries clear; bidirectional traceability; registration limited to GT-002 surfaces; all validations PASS; Repository Audit PASS; Repository READY; Governance/GT/Wrapper unchanged.

### 11. Roadmap
GT-002 MOD-017 Sprint Planning COMPLETE upon PASS → GT-003 Sprint Authoring (dynamic per approved Sprint Plan) → GT-004 Baseline Consolidation → GT-005 Publication.
