## Pass 23.0.6 — GT-003 Sprint 005 Authoring: MOD-018 AI Workspace (Governance: Human-Approval Gates, Cost & Safety)

Execute GT-003 v1.0 authoring for **SPR-MOD-018-005**, deriving scope exclusively from the approved Module PRD and Sprint Plan §Sprint 005.

### 1. Preflight (verify, read-only)
- `docs/20-module-prds/ai/MODULE_PRD.md` — approved.
- `docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md` — approved.
- Sprint 001–004 PRDs — exist, approved (dependency/traceability references only).
- `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T030000Z.md` — READY.
- No open corrective executions.
- Abort on any PRECONDITION-FAIL.

### 2. Authoring
Create `docs/30-sprint-prds/ai/sprints/SPR-MOD-018-005_GOVERNANCE_HUMAN_APPROVAL_COST_AND_SAFETY.md` mirroring the structure of Sprints 001–004.

**Authorities (Sprint Plan §Sprint 005, verbatim):**
- AI Approval transaction authority.
- Human-approval-gate business process authority (built on `ENG-011` per `ADR-042`).
- Cost governance authority (per-tenant quotas, rate limits, attribution per `ADR-045`).
- Safety governance authority (derived from the approved Module PRD and Sprint Plan allocations).
- `AIApprovalGranted` and `AIApprovalDenied` event publication authority.

**Business Rules (governance-neutral, from Module PRD §7):**
- AI-initiated state changes must pass an approval gate unless explicitly whitelisted (enforcement authority).
- Prompts and tool definitions consumed remain versioned and audited (restated read-only from Sprints 001/003).
- AI-provider integration occurs exclusively through the `ENG-028` provider abstraction.

**Events published:** `AIApprovalGranted`, `AIApprovalDenied`.
**Events consumed:** `AIToolCallRequested` (from Sprint 003) as approval trigger input; module domain events as governance inputs (per Module PRD §8).

**Configuration (subset from Module PRD §10):** `Cost budgets`, `Approval policies` (owned by Sprint 005). `Enabled surfaces per tenant` and `Retrieval refresh cadence` referenced read-only from Sprints 001/002.

**Engines consumed (subset from Sprint Plan):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-011`, `ENG-024`, `ENG-028`, plus optional `ENG-013`, `ENG-025` as allocated.

**ADRs consumed:** `ADR-042` (Human Approval Boundary), `ADR-045` (AI Cost Governance), `ADR-032`, `ADR-014`.

**Upstream sprint dependencies:** SPR-MOD-018-001 through -004.

**Sprint Exit Criteria:** verbatim from Sprint Plan §Sprint 005.

**Validations:** dynamic binding to GT-003 v1.0 validation model (no hard-coded VAL-IDs or counts).

### 3. Registration
- `docs/30-sprint-prds/ai/README.md` — mark SPR-MOD-018-005 as Draft.
- `docs/SPRINT_CATALOG.md` — register Sprint 005.
- `docs/DOCUMENT_INDEX.md` — register Sprint 005.
- `docs/_meta.json` — add nav entry; validate JSON.

### 4. Audit & Execution Record
- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T040000Z.md`, referencing `REPOSITORY_AUDIT_20260718T030000Z` as predecessor, with **Repository Audit PASS** per the released Repository Audit specification.
- Append GT-003 execution record to `.lovable/plan.md` with `execution_status: COMPLETE`, `next_template: GT-004`, `next_target: MOD-018 Module Baseline`, `handoff_state: READY`.

### 5. Guardrails
- No new authorities beyond Sprint Plan §Sprint 005; governance-neutral wording; no additional sources of authority outside the approved governance chain; no implementation, architecture, or governance evolution.
- No GT-004/GT-005 activities.

### 6. Rollback
On post-registration failure, execute GT-003 Runtime Rollback: reverse registrations, remove Sprint 005 artifact, restore pre-execution state.

### 7. Completion
All five MOD-018 Sprint PRDs complete. Repository READY for **GT-004 MOD-018 Module Baseline Consolidation**.
