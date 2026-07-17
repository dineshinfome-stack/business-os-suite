## Pass 23.0.3 — GT-003 Sprint 002 Authoring: MOD-018 AI Workspace (Retrieval / RAG)

Author Sprint 002 exclusively from the approved MOD-018 Module PRD and Sprint Plan. Zero governance evolution, zero implementation, zero architecture redesign, zero scope expansion.

### Preflight (read-only)

- `docs/20-module-prds/ai/MODULE_PRD.md` — Approved.
- `docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md` — Approved.
- `docs/30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md` — Approved (dependency reference only).
- `REPOSITORY_AUDIT_20260718T000000Z` — Repository READY.
- No open corrective executions.

Abort on any PRECONDITION-FAIL.

### Sprint 002 Scope (from approved Sprint Plan)

**Objective.** Establish Retrieval Workspaces (RAG) foundation for MOD-018.

**In-scope authorities (verbatim from Sprint Plan allocation):**
- Master Data: **Retrieval Corpus** (lifecycle `Draft → Active → Inactive → Archived`), including corpus source binding and refresh cadence attributes.
- Business Process: **Retrieval build/refresh**.
- Business Rule: **Retrieval corpora respect module-level authorization at query time**, as defined by the approved Module PRD and allocated architecture decisions.
- Configuration: **Retrieval refresh cadence** per tenant.
- Dependency on Sprint 001: Prompts reference retrieval corpora only through published capability contracts — no re-authoring of Prompt authority.
- Engines (as allocated by Sprint Plan / Module PRD § 12): `ENG-001, 002, 003, 004, 005, 006, 020, 024, 028` plus optional `ENG-007, 008, 013`.
- ADRs: `ADR-044` (RAG Architecture — per-tenant vector indexes), plus `ADR-032`, `ADR-014` as inherited.

**Explicitly out-of-scope** (reserved for later sprints):
- Tool Definition, AI Tool Call (Sprint 003).
- AI Conversation, Copilot Surfaces (Sprint 004).
- AI Approval, cost budgets, approval policies, safety governance (Sprint 005).

### Deliverable

Create `docs/30-sprint-prds/ai/sprints/SPR-MOD-018-002.md` using the released GT-003 Sprint PRD template. Mirror the structural pattern of `SPR-MOD-018-001` for repository consistency.

Sections: Metadata frontmatter, Purpose & Scope, Traceability to Module PRD & Sprint Plan (including Sprint 001 dependency reference), Master Data (Retrieval Corpus), Business Processes (Retrieval build/refresh), Business Rules (module-level authorization at query time), Configuration (Retrieval refresh cadence), Events (as allocated by Sprint Plan), Ownership & Dependencies, Engines & ADRs consumed, Validations, Sprint Exit Criteria (verbatim from Sprint Plan), References.

Business Rule wording will use the governance-neutral form: *"Retrieval corpora respect module-level authorization at query time, as defined by the approved Module PRD and allocated architecture decisions."* Delegation details (e.g., ENG-002 at retrieval boundary) will be included only if directly present in the approved Module PRD or Sprint Plan.

### Registration (GT-003 surfaces only)

1. `docs/30-sprint-prds/ai/README.md` — mark SPR-MOD-018-002 status Authored, link to file.
2. `docs/SPRINT_CATALOG.md` — register SPR-MOD-018-002 row.
3. `docs/DOCUMENT_INDEX.md` — add SPR-MOD-018-002 entry.
4. `docs/_meta.json` — add nav entry; validate JSON.

No additional registration surfaces.

### Audit + Execution Record

- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC>.md` using the released Repository Audit specification (dynamic rule binding, target all-PASS).
- Append GT-003 execution record to `.lovable/plan.md`:

```
execution_status: COMPLETE
template: GT-003
template_version: v1.0
module: MOD-018 AI Workspace
stage: Sprint 002 Authoring
next_template: GT-003
next_target: MOD-018 Sprint 003
handoff_state: READY
```

with `execution_id`, `audit_report_id`, `repository_revision_after`, `snapshot_digest` allocated at execution.

### Validation (dynamic rule binding)

Exclusive derivation from approved artifacts; scope matches Sprint 002 allocation exactly; bidirectional traceability complete; every Sprint 002 requirement allocated exactly once; no duplicates; no orphans; no ownership drift (MOD-018 owns only Sprint 002 authorities; MOD-001 retains identity/permissions; platform engines remain platform-owned); no Sprint 003–005 scope leakage; registration limited to GT-003 surfaces; JSON valid; audit PASS; Repository READY. No hard-coded validation IDs or fixed rule counts.

### Rollback

On any post-registration failure, execute released GT-003 Runtime Rollback: reverse registration edits, remove `SPR-MOD-018-002.md` and audit artifact, restore pre-execution state. Execution Wrapper behavior unchanged.

### Next

GT-003 Sprint 003 Authoring for MOD-018 (Tool Calling on Module Capabilities).

---

## Execution Record — Pass 23.0.3

```
execution_status: COMPLETE
template: GT-003
template_version: v1.0
governance_specification: v1.0
execution_wrapper: FROZEN v1.0
module: MOD-018 AI Workspace
stage: Sprint 002 Authoring
sprint_id: SPR-MOD-018-002
target_artifact: docs/30-sprint-prds/ai/sprints/SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md
execution_id: GT003-MOD018-002-20260718T010000Z-001
parent_result_id: GT003-MOD018-001-20260718T000000Z-001
audit_report_id: REPOSITORY_AUDIT_20260718T010000Z
previous_audit_report_id: REPOSITORY_AUDIT_20260718T000000Z
repository_revision_after: <allocated by VCS>
snapshot_digest: sha256:<computed at execution per FROZEN Wrapper v1.0>
handoff_state: READY
next_template: GT-003
next_target: MOD-018 Sprint 003 Authoring (SPR-MOD-018-003 — Tool Calling on Module Capabilities)
```
