## SPR-MOD-001-001 — Sprint Acceptance Review (v1.2)

Formal Acceptance Review before sprint closure. Documentation + verification pass — no feature code, schema, or RBAC changes. This version is intended to double as the reusable Acceptance Review template for future sprints; only sprint-specific details (Sprint ID, AC list, evidence refs, next-sprint recommendation) change per instance.

### 1. Evidence Collection (Acceptance Criteria)

Re-read the Sprint PRD to enumerate the actual AC list, then gather evidence per criterion. Reference implementation artifacts by their real names as found in the repository — do not prescribe function, policy, or route names.

**Evidence discipline**: where direct execution evidence cannot be produced (for example, in environments without a live database or browser), clearly distinguish implementation evidence, automated test evidence, and runtime verification, and do not fabricate runtime results. Missing runtime evidence must be recorded as a gap, not simulated.

- **Migration evidence**: read the applied migration files under `supabase/migrations/` and verify objects exist via `supabase--read_query` (tables, RPCs, permission rows) using the names present in those files.
- **RLS isolation proof**: demonstrate that the implemented tenant RLS policies prevent cross-tenant reads; capture query output showing deny behavior. Reference policies by whatever names the migrations actually created.
- **Lifecycle transition demo**: invoke the implemented tenant activation, suspension, and archival RPCs/server functions (as defined by the implementation) and capture returned payloads, including the idempotency signal for repeat calls.
- **Audit log entries**: query `public.audit_logs` for the resulting tenant lifecycle rows; capture `actor_id`, `new_values`, `occurred_at`.
- **Server-function responses**: capture representative payload shapes for the implemented tenant read/list/mutation functions.
- **UI screenshots**: drive Playwright against the implemented platform tenant list and detail routes at 1280×1800; capture list view, create dialog, detail card with lifecycle badges, and disabled-action states. Store screenshots in the project's agreed evidence/output location and reference them from the Acceptance Review doc.

### 2. Traceability Matrix

Produce SIP-001 … SIP-023 closure table with columns:
- Task
- Status
- Implementation reference (file + symbol/function/component; optional line hint)
- Test reference (file + test name)
- Evidence artifact

Symbol-based references over line numbers so the matrix survives future edits.

### 3. Quality Gate Reverification

Run and record:
- `bunx tsgo --noEmit` — typecheck
- `bunx vitest run` — full suite
- `supabase--linter` — security posture; confirm only known accepted findings remain
- Static review: grep new tenant files for `TODO`, unintended dev feature flags, stray `console.log`
- RLS verification queries (from §1)

### 4. Documentation Updates

- Author `docs/50-audit-reports/SPR_MOD_001_001_ACCEPTANCE_REVIEW.md` containing: AC evidence table, traceability matrix, quality-gate results, rollback assessment, outstanding observations, sign-off block.
- Append **Sprint Outcome** to the SIP (Execution Metadata + Task Status only; substantive content stays immutable per `SIP_LIFECYCLE.md`).
- **Archive the SIP according to `SIP_LIFECYCLE.md`.** If the lifecycle specifies "copy then archive as the immutable record," follow that policy rather than assuming a direct move. Re-read `SIP_LIFECYCLE.md` at review time and apply the archival procedure it prescribes.
- Author a new status report under `docs/04_Program_Status/reports/PROGRAM_STATUS_<ts>.md` per `STATUS_REPORT_TEMPLATE.md` reflecting MOD-001 Sprint 001 = Complete.
- Update `docs/03_Implementation_Master_Plan/CHANGELOG.md` with a sprint-completion entry per the Living-doc protocol.

### 5. Production Readiness

Document in the Acceptance Review:
- **Rollback**: verify and document the rollback characteristics of each migration in this sprint, including any intentionally irreversible data transformations (state the finding based on inspection, don't assume).
- Configuration changes introduced (if any).
- Feature flags introduced (if any); confirm none are unintentionally left enabled.
- Monitoring/audit logging functioning as evidenced in §1.

### 6. Outstanding Observations

Dedicated section in the Acceptance Review with three subsections:
- **Resolved** this sprint
- **Carried Forward** to a future sprint (with target sprint/owner)
- **Accepted Risks** (e.g. R-074) with rationale

### 7. Architecture Board Decision

Explicit decision block: **Approve** / **Approve with Conditions** / **Reject**, plus next-sprint recommendation (SPR-MOD-001-002 — Branches & Financial Years UI) contingent on approval.

### Exit Criteria

The sprint may only be declared Complete when ALL hold:
- All acceptance criteria verified with evidence (or gaps explicitly recorded per §1 discipline)
- All SIP tasks closed in the traceability matrix
- Quality gate passed (typecheck, tests, linter, RLS, static review)
- Required documentation updated (Acceptance Review, SIP archived per `SIP_LIFECYCLE.md`, Program Status, IMP CHANGELOG)
- Architecture Board decision = Approve or Approve with Conditions

### Out of Scope

- Any feature code, schema, or RBAC change.
- Starting SPR-MOD-001-002.
- Remediating R-074 or the accepted C-001/C-002 observations.

### Stop Condition

Stop after:
- Acceptance Review completed
- Documentation updated
- Architecture Board decision recorded

Do not begin SPR-MOD-001-002 until the Acceptance Review has been approved.

### Deliverables

1. `docs/50-audit-reports/SPR_MOD_001_001_ACCEPTANCE_REVIEW.md`
2. SIP archived per `SIP_LIFECYCLE.md` with Sprint Outcome appended
3. New Program Status report under `docs/04_Program_Status/reports/`
4. IMP CHANGELOG entry
5. Playwright screenshots (or explicit gap record) in the agreed evidence location, referenced from the Acceptance Review

### Template Note

Upon approval, this document becomes the standard **Sprint Acceptance Review Template**. Future sprints reuse the structure verbatim; only Sprint ID, AC list, evidence references, and next-sprint recommendation change per instance.
