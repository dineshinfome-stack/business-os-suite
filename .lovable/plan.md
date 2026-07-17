## Pass 24.0.1 — GT-004 Module Baseline Consolidation: MOD-018 AI Workspace

Execute GT-004 v1.0 to consolidate the approved MOD-018 Module PRD, Sprint Plan, and Sprint PRDs 001–005 into a single authoritative Module Baseline. No new authorities, rules, engines, ADRs, events, or configuration keys.

### 1. Preflight (read-only)
- Verify approved artifacts exist and are READY:
  - `docs/20-module-prds/ai/MODULE_PRD.md`
  - `docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`
  - `docs/30-sprint-prds/ai/sprints/SPR-MOD-018-001..005*.md`
  - `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T040000Z.md` (READY)
- Verify GT-003 registration surfaces synchronized (`README.md`, `SPRINT_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`).
- Reference approved GT-004 baseline template and previously approved module baselines for structural consistency only. Do not derive requirements, authorities, or allocations from precedent modules.
- Abort on any PRECONDITION-FAIL.

### 2. Baseline Authoring
Create `docs/40-module-baselines/MOD-018_AI_WORKSPACE_BASELINE.md` per the released GT-004 template, consolidating exclusively from the approved Module PRD and Sprint PRDs 001–005:

- Module purpose & scope
- Functional capability inventory
- Authority allocation across Sprints 001–005:
  - S001: Prompt Master, Prompt Version Master, review-and-publish process, enabled-surfaces config
  - S002: Retrieval Corpus Master, retrieval build/refresh process, refresh cadence config
  - S003: Tool Definition Master, AI Tool Call transaction, tool-call-with-approval process
  - S004: AI Conversation transaction, prompt-to-response process, `AIConversationStarted` publication
  - S005: AI Approval transaction, approval-gate rule, Approval Policies/Cost Budgets config, safety governance, `AIApprovalGranted`/`AIApprovalDenied` publications
- Business process allocation
- Business rule inventory
- Event catalog: published and consumed
- Configuration inventory
- Ownership boundaries (MOD-018 vs shared/consumed modules)
- Sprint allocation matrix (authority → sprint)
- Engine allocation matrix — derived exclusively from the approved Module PRD and Sprint PRDs
- ADR allocation matrix — derived exclusively from the approved Module PRD and Sprint PRDs
- External dependencies
- Cross-module dependencies
- Traceability matrix (Module PRD sections ↔ Sprint PRDs, bidirectional)
- Validation summary (dynamic rule binding per GT-004 model)
- References

### 3. Validation (dynamic GT-004 model)
- Every Module PRD authority allocated to exactly one Sprint PRD (or explicitly shared).
- Every Sprint PRD traces back to Module PRD sections.
- No orphan authorities, processes, rules, events, config keys, engines, ADRs.
- No duplicate ownership.
- Sprint allocations complete and internally consistent.
- Bidirectional traceability links.
- No hard-coded validation IDs or counts.

### 4. Registration (GT-004 surfaces only)
- `docs/40-module-baselines/README.md` — add MOD-018 entry.
- `docs/MODULE_BASELINE_CATALOG.md` — register baseline.
- `docs/DOCUMENT_INDEX.md` — add baseline entry.
- `docs/_meta.json` — add navigation entry; validate JSON.

### 5. Audit & Execution Record
- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC>.md`, predecessor `REPOSITORY_AUDIT_20260718T040000Z`, Repository Audit PASS.
- Append GT-004 record to `.lovable/plan.md`:
  ```
  execution_status: COMPLETE
  template: GT-004
  template_version: v1.0
  module: MOD-018 AI Workspace
  stage: Module Baseline Consolidation
  next_template: GT-005
  next_target: MOD-018 Module Publication
  handoff_state: READY
  ```
  Allocate `execution_id`, `audit_report_id`, `repository_revision_after`, `snapshot_digest` per template.

### 6. Guardrails
No governance evolution, implementation guidance, architecture redesign, scope expansion, new authorities, external authority sources, or GT-005 activities. Consolidation only.

### 7. Rollback
On post-registration failure: execute GT-004 Runtime Rollback — reverse `_meta.json`, `MODULE_BASELINE_CATALOG.md`, `DOCUMENT_INDEX.md`, `README.md`, then delete baseline file; restore pre-execution state.

### 8. Completion
MOD-018 Module Baseline established; repository READY; next: GT-005 MOD-018 Module Publication.
