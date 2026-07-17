## Pass 23.0.5 — GT-003 Sprint 004 Authoring: MOD-018 AI Workspace (Copilot Surfaces & Conversations)

Execute GT-003 v1.0 authoring for **SPR-MOD-018-004**, deriving scope exclusively from the approved Module PRD and Sprint Plan §Sprint 004.

### 1. Preflight (verify, read-only)
- `docs/20-module-prds/ai/MODULE_PRD.md` — approved.
- `docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md` — approved.
- Sprint 001, 002, 003 PRDs — exist, approved (dependency/traceability references only).
- `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T020000Z.md` — READY.

### 2. Authoring
Create `docs/30-sprint-prds/ai/sprints/SPR-MOD-018-004_COPILOT_SURFACES_AND_CONVERSATIONS.md` mirroring Sprints 001–003 structure.

**Authorities (Sprint Plan §Sprint 004, verbatim):**
- AI Conversation transaction authority.
- Prompt-to-response business process authority.
- `AIConversationStarted` event publication authority.
- Per-tenant copilot surface enablement (consumed from Sprint 001 configuration; no new authority).

**Business Rules (governance-neutral, from Module PRD §7 subset applicable):**
- Prompts and tool definitions consumed by conversations remain versioned and audited (inherited from 001/003 — restated read-only).
- AI-provider integration occurs exclusively through the `ENG-028` provider abstraction.

**Events published:** `AIConversationStarted`.
**Events consumed:** module domain events as retrieval inputs (per Module PRD §8).

**Configuration:** `Enabled surfaces per tenant` (consumed read-only; owned by Sprint 001).

**Engines consumed (subset from Sprint Plan):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-017`, `ENG-024`, `ENG-028`, plus optional `ENG-025`, `ENG-007`, `ENG-008`.

**ADRs consumed:** `ADR-011`, `ADR-032`, `ADR-014`.

**Upstream sprint dependencies:** SPR-MOD-018-001, -002, -003.

**Sprint Exit Criteria:** verbatim from Sprint Plan §Sprint 004.

**Validations:** dynamic binding to GT-003 v1.0 validation model (no hard-coded VAL-IDs or counts).

### 3. Registration
- `docs/30-sprint-prds/ai/README.md` — mark SPR-MOD-018-004 as Draft.
- `docs/SPRINT_CATALOG.md` — register Sprint 004.
- `docs/DOCUMENT_INDEX.md` — register Sprint 004.
- `docs/_meta.json` — add nav entry; validate JSON.

### 4. Audit & Execution Record
- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T030000Z.md`, referencing `REPOSITORY_AUDIT_20260718T020000Z` as predecessor, with **Repository Audit PASS** in accordance with the released Repository Audit specification.
- Append GT-003 execution record to `.lovable/plan.md` with `execution_status: COMPLETE`, `next_target: MOD-018 Sprint 005`, `handoff_state: READY`.

### 5. Guardrails
- No Sprint 005 leakage (no AI Approval transaction, cost budgets, approval policies, safety governance, or AI reports).
- Governance-neutral wording; no new authorities beyond Sprint Plan §Sprint 004; no implementation, architecture, or governance evolution.

### 6. Rollback
On post-registration failure, execute GT-003 Runtime Rollback: reverse registrations, remove Sprint 004 artifact, restore pre-execution state.

### 7. Completion
Repository READY for **GT-003 Sprint 005 Authoring** (AI Governance, Approval Policies & Operational Controls).