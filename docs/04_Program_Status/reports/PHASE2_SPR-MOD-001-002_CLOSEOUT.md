---
document: Phase Closeout Report
sprint_id: SPR-MOD-001-002
phase: Phase 2 — Backend Foundation
decision: Approved with Conditions
rating: 10/10 (Architecture Board)
authority: Program Status
---

# SPR-MOD-001-002 — Phase 2 Closeout Report

## 1. Board Decision

Architecture Board reviewed the Phase 2 implementation and issued **APPROVED WITH CONDITIONS** at a 10/10 rating on all five governance criteria (Governance Compliance, Phase Isolation, Verification Coverage, Traceability, Change Control).

| SIP | Status |
|---|---|
| SIP-010 — Company lifecycle / events / audit primitives | ✅ Accepted |
| SIP-011 — Company server functions | ✅ Accepted |
| SIP-012 — Branch primitives + server functions | ✅ Accepted |
| SIP-013 — Financial-Year primitives + server functions | ✅ Accepted |
| SIP-014 — Config namespace initialization via ENG-005 | ⚠️ **Deferred (Architecture Dependency)** |

## 2. SIP-014 Deferral

**Reason.** `ENG-005` (Settings Framework) exposes no namespace-initialization primitive, and the `setting_definitions` catalog contains no `company`- or `branch`-scoped keys. Implementing either requires a schema/catalog change outside Phase 2's no-schema-edit invariant.

**Resolution path.** Raised as an engineering proposal at `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md`. The Architecture Board will decide at intake whether it becomes `SPR-ENG-005-001`, is folded into another workstream, or is deferred further. **No sprint identifier is reserved.**

**Phase 3 impact.** None on organization-structure UI. Any Phase 3 UI element that edits company- or branch-scoped settings is out of scope until the settings enhancement lands.

## 3. Implementation Verification (V1–V5)

Read-only audit conducted against `src/lib/organizations/`, `src/lib/branches/`, and `src/lib/financial-years/`.

### V1 — Lifecycle mutations use only `private.fn_*` RPCs

Method: `rg` for direct `.from("organizations"|"branches"|"financial_years").(update|insert|delete|upsert)` in the three directories.

Result: **PASS — zero hits.** All lifecycle mutations delegate to Phase 1 RPCs (`fn_create_company`, `fn_activate_company`, `fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company`, `fn_create_branch`, `fn_update_branch`, `fn_archive_branch`, `fn_set_default_branch`, `fn_create_financial_year`, `fn_open_financial_year`, `fn_close_financial_year`, `fn_archive_financial_year`, `fn_set_default_financial_year`). Read paths use RLS-scoped `SELECT` only.

### V2 — Permission enforcement uses generated `PERMISSIONS.*` constants only

Method: `rg` for raw permission-key string literals (`"platform.company."`, `"platform.branch."`, `"platform.financial_year."`) in the three directories.

Result: **PASS — zero hits.** Every `requirePermission(...)` call in the 17 server-function handlers references a constant from `src/lib/generated/permission-keys.ts`.

### V3 — Audit payload — structural + behavioral parity with SPR-001 writer

**Structural (a).** All three `audit.ts` files (`src/lib/{organizations,branches,financial-years}/audit.ts`) mirror `src/lib/tenants/audit.ts`:

- Same insertion target (`audit_logs`) and same required columns: `action`, `entity_type`, `entity_id`, `actor_id`, `created_by`, `updated_by`, `new_values`.
- Same middleware chain (`requireSupabaseAuth`) — RLS-scoped under the caller's JWT.
- Same idempotent success shape (`{ ok: true as const }`).
- Payload validated by `zod` before insertion.

**Behavioral (b).** Call-site trace across the 17 handlers confirms:

- **Required fields always populated.** `action`, `entity_type`, `entity_id`, `actor_id`, `created_by`, `updated_by` are never undefined at insertion; `actor_id`/`created_by`/`updated_by` derive from `context.userId` (guaranteed by `requireSupabaseAuth`); `entity_id` derives from either the RPC return (`newId`) or validated Zod input.
- **`correlationId` propagation.** Every server-fn input schema includes an optional `correlationId`; every call site forwards it to `logXxxEventFn({ data: { correlationId: data.correlationId, ... } })`; the audit writer persists it as `new_values.correlation_id` (null-safe).
- **`entity_type` literals.** Companies use `"company"`, branches use `"branch"`, financial years use `"financial_year"` (underscored) — matches the entity naming convention used elsewhere in the repository.
- **`from_state` / `to_state` provenance.** For lifecycle-transition writes, `from_state` is read from the RPC return (`rpcResult.from_state`) — never from client input. `to_state` is a compile-time constant per handler (`"active"`, `"inactive"`, `"archived"`, `"open"`, `"closed"`).

Result: **PASS.**

### V4 — Event names match PRD §11 exactly

Method: cross-check every `buildXxxEvent("...")` literal and every `logXxxEventFn({ action: "..." })` literal against the PRD §11 event catalog (`docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md` lines 291–298).

| PRD §11 canonical name | Emitted from |
|---|---|
| `company.created` | `createCompany` |
| `company.updated` | `activateCompany`, `deactivateCompany`, `setDefaultCompany` |
| `company.archived` | `archiveCompany` |
| `branch.created` | `createBranch` |
| `branch.updated` | `updateBranch`, `archiveBranch` (per PRD §5.2 + §11), `setDefaultBranch` |
| `financialyear.created` | `createFinancialYear` |
| `financialyear.opened` | `openFinancialYear` |
| `financialyear.closed` | `closeFinancialYear` |

Spelling and casing match exactly (all-lowercase, dot-separated, `financialyear` as one token — not `financial_year` — per PRD).

Note: audit `action` values include additional non-emitted operational tags (`company.activated`, `company.deactivated`, `company.set_default`, `branch.archived`, `branch.set_default`, `financialyear.archived`, `financialyear.set_default`) used only inside `audit_logs` for operator traceability. These are **not** emitted as domain events; the emitted event set is exactly PRD §11.

Result: **PASS.**

### V5 — Events emitted *after* successful RPC completion

Method: read every handler in `company.functions.ts`, `branch.functions.ts`, `financial-year.functions.ts`.

Result: **PASS.** For every mutation:

1. `supabase.rpc(...)` is awaited.
2. `if (error) throw error;` runs immediately after — any RPC failure short-circuits the handler.
3. Only then does `await logXxxEventFn(...)` run, followed by `buildXxxEvent(...)` in the return.
4. Idempotent no-op branches (`already_active`, `already_inactive`, `already_archived`, `already_default`, `already_open`, `already_closed`) **skip both** the audit call and return `event: null` — no duplicate audit rows on retry, no duplicate emitted events.

## 4. Defects Found and Fixed

None. All V1–V5 checks passed on first inspection; no code changes required.

## 5. Deliverables Produced This Closeout

1. `docs/05_Sprint_Implementation_Plans/active/SIP-SPR-MOD-001-002.md` — updated execution metadata; SIP-014 row and Deferred Items section reflect Board decision.
2. `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md` — engineering proposal (no sprint ID reserved).
3. `docs/04_Program_Status/reports/PHASE2_SPR-MOD-001-002_CLOSEOUT.md` — this report.

No source code was modified during closeout.

## 6. Phase 3 Authorization

Phase 3 (UI & RBAC) may be authorized on acceptance of this closeout. Recommended entry point: the frontend tasks defined in the SIP (SIP-015 through SIP-017), with SIP-014-derived settings-editing UI explicitly excluded until the settings namespace enhancement lands.

## 7. Change Log

| Timestamp | Change | Author |
|---|---|---|
| Phase 2 closeout | Initial report. | Program Delivery |
