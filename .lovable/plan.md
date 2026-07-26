## Gate 3.8 — Tenant Onboarding, Organization Activation & Workspace Bootstrap
### Staged execution plan v2 (master spec = uploaded prompt; execution = 9 controlled passes)

All four corrections and the recommended improvements are incorporated below.

---

### Verified repository facts (checked this turn)

- Tables: `tenants`, `organizations` (has `is_default`, `company_lifecycle_state`, `legal_name`, `slug`, `region`, `timezone`, `default_locale`), `organization_profiles`, `organization_branding`, `branches` (`is_default`, `code`, `branch_lifecycle_state`), `organization_invitations` (`token_hash`, `status`, `expires_at`, `revoked_at`, `accepted_at`, `role`), `organization_members`, `roles` / `permissions` / `role_permissions` / `user_roles`, `setting_definitions` / `setting_values`, `feature_flags`, `financial_years`, `notifications`, `audit_logs`, `provisioning_jobs` / `provisioning_steps`.
- Public RPCs: `fn_create_company`, `fn_activate_company`, `fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company`, plus tenant lifecycle RPCs.
- Services: `src/lib/organizations`, `src/lib/branches`, `src/lib/financial-years`, `src/lib/tenants`, `src/lib/tenant-lifecycle`, `src/lib/notifications`, `src/lib/settings.functions.ts`, `src/lib/settings-validation.ts`, generated `src/lib/generated/permission-keys.ts` (from `docs/15-governance/permission-catalog.manifest.yaml` via `scripts/generate-permissions.ts`).
- Console pattern to mirror: `src/lib/platform-admin/*` + `src/modules/platform/administration/*`.
- No onboarding table, no onboarding permissions, no tenant-facing route tree — all routes live under `/platform/*`.

Strong signal (to be confirmed, not assumed): `organizations` **is** this repository's company entity — `fn_create_company` writes it and `company_lifecycle_state` types it. Hierarchy is therefore **tenant → organization/company → branch**.

**Binding rule:** No separate company abstraction, persistence, service, route, DTO or onboarding step may be introduced unless Pass 3.8.0 proves the repository has a distinct company domain separate from `organizations`.

---

### Governance rules applying to every pass

- **Baselines.** Record at pass start and end: test count, typecheck result, files changed, migrations added, protected files touched, known failures, deferred work.
- **Test integrity.** The Gate 3.7 baseline is 444 passing tests. Existing tests must not be deleted, skipped, weakened or rewritten merely to make Gate 3.8 pass. Legitimate shared-contract updates are allowed only with written justification in the pass inventory.
- **Scope.** Execute only the named pass; repository-first; preserve prior architecture; run pass-specific tests; return a concise inventory; stop for approval.

---

### Pass 3.8.0 — Repository discovery only

Deliverable: `docs/60-engineering/PHASE3_GATE38_DISCOVERY.md`. Documentation-only: no production code, no migrations, no routes, DTOs, permissions or tests. Records the current typecheck, build and test baseline without modifying tests, and cites the exact authoritative file/service behind every conclusion.

Must resolve or explicitly escalate:

1. Is `organizations` the company entity, or does a distinct company domain exist?
2. Must the first-admin invitation be **accepted** before activation, or is pending acceptance a warning?
3. Financial year: mandatory, conditional on an enabled module, or optional?
4. Tenant lifecycle `active` vs onboarding `activated` — does activation delegate to the existing lifecycle RPC?
5. Canonical platform route: `/platform/onboarding` vs `/platform/admin/onboarding`.
6. Is there an approved tenant-authenticated route context and shell? If not, the tenant wizard is delivered by the approved alternative or formally deferred.
7. Which existing permissions cover onboarding; which (if any) genuinely need adding.
8. Repository-standard location for versioned application-layer DTOs.
9. Authoritative source for the activity timeline: `audit_logs`, onboarding step history, notifications, or a composed view.

Also classifies every Gate 3.8 capability as reuse / extend / add / defer. Stops; does not begin 3.8.1.

### Pass 3.8.1 — Architecture and contracts (no UI, no applied migration)

- `PHASE3_GATE38_ONBOARDING_MATRIX.md` and `PHASE3_GATE38_READINESS_MATRIX.md` (the matrix decides which readiness checks are mandatory, warning, conditional or deferred — with justification for anything omitted or merged).
- Pure state machine: `not_started → in_progress → blocked → ready_for_activation → activated | cancelled`, full transition table, invalid transitions rejected, `activated` terminal.
- Step model and step statuses; versioned application DTOs under the repository-standard application-layer contract location, **preferably `src/lib/tenant-onboarding/types/v1/`** — never owned by the Platform UI module unless discovery confirms that convention. Presentation-only types may live in the UI module.
- Zod schemas, canonical query keys, permission plan.
- Migration **design** written into documentation only. No executable SQL is placed in the active migrations directory during this pass.
- Tests: state machine + contract validation.

### Pass 3.8.2 — Persistence, RLS and read models (no readiness business rules)

- Migration: `tenant_onboarding` (unique `tenant_id`, state check, `version` optimistic guard) and `tenant_onboarding_steps` (unique `(tenant_id, step_key)`, status and step-key checks), indexes, GRANTs, RLS with tenant isolation.
- Permission rows added **only** if 3.8.0/3.8.1 concluded existing semantics are insufficient — and then synchronized in one change across the permission manifest, generated constants, role grants, route guards, server guards and tests.
- Read layer: `query-service.server.ts`, `mappers.server.ts` (sanitized DTOs — no tokens, no raw errors), `queries.functions.ts` facade — platform queue with server-side search/filter/pagination, detail, steps, progress, persisted blockers, activity timeline (sourced from the authority named in 3.8.0; no duplicate event-history table).
- Readiness: DTO and query contract only, returning `evaluationStatus: not_evaluated`. Authoritative readiness evaluation belongs exclusively to Pass 3.8.5.
- Tests: RLS, sanitization, query mapping, regression, typecheck.

### Pass 3.8.3 — Bootstrap commands

- Organization/company bootstrap according to the hierarchy confirmed in Pass 3.8.0 (one concept unless discovery proved otherwise).
- Primary branch bootstrap.
- Role initialization.
- Settings initialization.
- Financial-year initialization according to the approved readiness policy.

Every command delegates to the existing application service or RPC; onboarding never writes domain tables directly. Proves idempotency (retry returns the existing record) and concurrency safety (version-conflict rejection) before continuing. Start and resume commands land here too.

### Pass 3.8.4 — First administrator invitation

Reuses `organization_invitations` and `organization_members`: create, reuse an outstanding valid invitation, resend, revoke, expiry handling, acceptance and membership detection, initial role assignment through RBAC, audit and notification wiring. Tests assert no token in any DTO or log, no platform-role leakage into tenant scope, and no cross-tenant invitation.

### Pass 3.8.5 — Readiness and activation

- `readiness-service.server.ts` — pure and deterministic. Implements every mandatory check approved in `PHASE3_GATE38_READINESS_MATRIX.md`; the master spec's 17 checks are candidates, not automatically mandatory.
- Result: overall status (`not_ready | ready_with_warnings | ready`), timestamp, tenant, workflow version, per-check results with sanitized explanations and deep links, blocking/warning counts, correlation ID.
- Activation: recomputes readiness first, is idempotent (repeat returns the existing result), rejects cancelled workflows, delegates to tenant lifecycle where 3.8.0 says it should, audits and de-duplicates notifications. Cancellation with reason, and explicit restart.

### Pass 3.8.6 — Platform console

Queue with filters and server-side pagination, detail header, step list, blockers panel, readiness panel, activity timeline, start/resume/cancel/activate dialogs, deep links to provisioning and lifecycle, navigation entry — reusing existing shell, table, badge and dialog primitives. No duplicated provisioning or lifecycle actions.

### Pass 3.8.7 — Tenant wizard (conditional)

Executes only if Pass 3.8.0 confirms an approved tenant-authenticated route context and shell. If no safe tenant application shell exists, this pass implements only the approved alternative (e.g. an operator-run wizard inside `/platform`) or formally defers the tenant-facing wizard. Creating a new tenant shell is out of scope for Gate 3.8.

Content when it runs: resumable steps, server-owned progress, per-step validation and retry, review and readiness, completion summary, accessibility (keyboard, focus trap, ARIA live regions, no colour-only status) and responsive layout.

### Pass 3.8.8 — Verification and certification

Typecheck, production build, migration validation, RLS tests, full suite (no weakened or removed existing tests), architecture-integrity test (onboarding UI must not import the Supabase SDK, repositories or `*.server.ts`; provisioning, lifecycle, retry and rollback engines untouched), accessibility tests, protected-file diff review, then `PHASE3_GATE38_COMPLETION_REPORT.md`. Stops before Gate 3.9.

---

## Next action — Execute Pass 3.8.0 only

Produce `docs/60-engineering/PHASE3_GATE38_DISCOVERY.md`. Documentation-only: no production code, no migrations, no routes, DTOs, permissions or tests. Confirm whether `organizations` is the repository's company entity, resolve or escalate all nine blockers, classify every capability as reuse/extend/add/defer, record the typecheck/build/test baseline without modifying tests, cite authoritative files for each conclusion, return a concise inventory, and stop. Do not begin Pass 3.8.1.
