
# Pass 3.8.5 — Tenant Readiness Evaluator & Guarded Activation (Revised)

Baseline `19a4c82b`. Backend only. **Final recommendation: ARCHITECTURAL DECISION REQUIRED** — one blocker (D1) must be decided before implementation; everything else below is corrected and implementation-ready.

## 1. Blocker D1 — required-settings database authority (UNRESOLVED)
Discovery result (verified this turn):
- `src/lib/tenant-onboarding/required-settings.registry.ts` holds `readinessImpact: block|warning|none` for 5 keys — 3 `block` (`platform.locale.default_timezone`, `platform.locale.default_language`, `platform.branding.product_name`), 2 `none`.
- `public.setting_definitions` (mig `20260723020152`, cols confirmed: `key, category, scope, data_type, default_value, validation_schema, description, is_system, is_sensitive, deprecated_at`) has **no** `readiness_impact` column and **no** generic metadata jsonb. `rg readiness_impact` over the repo returns nothing.
- No database table, view or routine exposes onboarding readiness impact. `private.fn_setting_is_configurable` is the only settings helper.

⇒ A PostgreSQL evaluator cannot authoritatively evaluate `required_settings_valid` today, and duplicating the key list in SQL would create two drifting authorities.

**Decision required — choose one:**
- **D1-A (recommended).** Add `readiness_impact text NOT NULL DEFAULT 'none' CHECK (readiness_impact IN ('block','warning','none'))` to `public.setting_definitions`, backfill the 3 blocking keys in the same migration, and make the DB the single authority. `required-settings.registry.ts` keeps only non-readiness authoring metadata (owner, editability, audit) and a parity test asserts the TS `readinessImpact` values equal the seeded DB rows — or the field is deleted from TS entirely.
- **D1-B.** Add a dedicated `public.onboarding_required_settings` registry table keyed by `setting_definitions.key`, seeded in-migration; TS generated from it.
- **D1-C.** Defer: evaluate `required_settings_valid` as `not_applicable` in Pass 3.8.5 (same treatment as `financial_year_present`) and resolve the authority in a follow-on pass. This preserves atomicity but weakens the matrix's blocking check.

All other sections below assume D1-A. Nothing is implemented until this is approved.

## 2. Approved & unchanged
Backend-only scope; all 14 checks; `financial_year_present = not_applicable`; three-way aggregation; fresh in-transaction evaluation at activation; expected-version concurrency; no org/branch/FY fabrication; production activation stays BLOCKED while live DB gates are unavailable.

## 3. Correction 1 — frozen v1 status vocabulary
`TenantOnboardingReadinessCheckDTO` keeps its existing v1 literals exactly (`pass | warning | blocked | not_applicable`). No `passed` alias, no v2 DTO. The SQL evaluator emits the v1 literals directly; `mappers.server.ts` validates and passes through.

## 4. Correction 2 — read/write separation
| Operation | Entry point | Permission | Writes |
|---|---|---|---|
| Read readiness | `getOnboardingReadiness` (existing query) → `public.fn_onboarding_evaluate_readiness` (`STABLE`, read-only) | `platform.tenant.read` | none — no snapshot, no audit |
| Explicit refresh/persist | new command `refreshOnboardingReadinessCommand` → `public.fn_onboarding_persist_readiness` | `platform.tenant.update` | snapshot + `audit_logs` |
| Activation | `activateTenantCommand` → `public.fn_onboarding_activate_tenant` | `platform.tenant.activate` (exists) | snapshot + audit + lifecycle |
Page loads, retries and background refetches therefore never write.

## 5. Correction 3 — atomic acknowledgement (no separate RPC)
`fn_onboarding_acknowledge_warnings` is **removed** from this pass. The single guarded RPC signature:
`public.fn_onboarding_activate_tenant(_tenant_id uuid, _expected_version integer, _acknowledge_warnings boolean, _correlation_id text DEFAULT NULL) RETURNS jsonb`
Inside one locked transaction: lock → re-evaluate → compute fingerprint → reject warnings when `_acknowledge_warnings = false` → record acknowledgement (`warnings_acknowledged_at/by`, fingerprint) → transition lifecycle → persist snapshot → bump version → audit. All committed together.

## 6. Correction 4 — fingerprint is database-owned
The fingerprint is computed only by the SQL evaluator: `encode(sha256(convert_to(string_agg(key||':'||status||':'||reason_code, '|' ORDER BY key), 'UTF8')), 'hex')` over warning checks. Returned as an opaque string; TypeScript transports/displays it and never recomputes or submits it. `readiness.ts` keeps only presentation registry + aggregation *mirroring* for unit tests — no activation authority.

## 7. Correction 5 — precise concurrency mechanism
- Read-only evaluation: `pg_try_advisory_xact_lock(hashtextextended(tenant_id::text, 0))`. `false` ⇒ `no_concurrent_activation` = `blocked` / reason `activation_in_flight`. Never waits.
- Activation: `pg_advisory_xact_lock(...)` (blocking) → `SELECT ... FROM tenant_onboarding WHERE tenant_id = ... FOR UPDATE` → compare `_expected_version` → `40001` on mismatch.
No persisted `activating` state is introduced (the state machine has no such state).

## 8. Correction 6 — version type alignment
`public.tenant_onboarding.version` is `integer`. Therefore `_expected_version integer`, `readiness_observed_workflow_version integer`, and the activation result `version` are all `integer`. The contract version is a separate, explicitly named `readiness_contract_version text` (rule-set identity, e.g. `"3.8.5"`); the ambiguous `readiness_snapshot_version` is dropped.

## 9. Correction 7 — canonical lifecycle writer
`private.fn_assert_lifecycle_transition` is a **validator**, not a writer. No canonical tenant-activation writer usable by Gate 3.8 exists: `private.fn_activate_tenant` (mig `20260723172710`) also fabricates organization, default branch and a placeholder financial year — which Gate 3.8 assigns to Pass 3.8.3 — and its `public` wrapper is missing (`src/lib/tenants/tenants.functions.ts:125` calls a non-existent RPC).
⇒ `public.fn_onboarding_activate_tenant` is **explicitly designated the canonical activation writer** for onboarding-driven activation. It calls the existing transition validator, then writes `tenants.lifecycle_state = 'active'` and `activated_at`, sets `tenant_onboarding.state = 'activated'`, `activated_at`, `activated_by`, records the `activation` step via `public.fn_onboarding_record_step`, and writes the audit row via the existing audit helper — all in the one guarded routine. Follow-on: deprecate `private.fn_activate_tenant` seeding and repair the dead call site.

## 10. Correction 8 — lean persistence
Reuse `ready_at`, `activated_at`, `last_readiness_checked_at`, `last_correlation_id`, `version`. Add to `public.tenant_onboarding` only:
`readiness_snapshot jsonb`, `readiness_status text CHECK (readiness_status IN ('not_ready','ready_with_warnings','ready'))`, `readiness_blocking_count integer NOT NULL DEFAULT 0 CHECK (>= 0)`, `readiness_warning_count integer …`, `readiness_applicable_count integer …`, `readiness_workflow_version integer`, `readiness_contract_version text`, `readiness_evaluated_by uuid`, `readiness_fingerprint text`, `warnings_acknowledged_at timestamptz`, `warnings_acknowledged_by uuid`. Replace-in-place; no history table.

## 11. Readiness-check source map (unchanged from prior plan)
tenants · provisioning_jobs (latest, incl. `rolled_back`) · tenants.lifecycle_state/deletion_scheduled_at · organizations (default, active) · branches (default, active) · organization_invitations (status/expiry/role) · accepted_at (warning) · organization_members (blocking post-acceptance) · user_roles vs invitation role (blocking post-acceptance) · setting_definitions.readiness_impact ∩ setting_values (D1-A) · financial_years → `not_applicable` · tenant_onboarding_steps.status · advisory try-lock · cross-table `tenant_id` equality.

## 12. Aggregation
Any `blocked` → `not_ready`; else any `warning` → `ready_with_warnings`; else `ready`. `not_applicable` excluded from all three counts. Emitted by SQL; mirrored by `readiness.ts` for unit tests only.

## 13. Activation outcomes
`activated`, `already_active` (idempotent replay, no writes, no version bump), `not_ready`, `warning_acknowledgement_required`, `version_conflict`, `activation_in_flight`, `lifecycle_state_blocks`, `permission_denied`, `tenant_missing`, `tenant_reference_mismatch`.

## 14. SQLSTATE / typed-error mapping
Reuse `42501 → permission_denied`, `P0002 → tenant_missing`, `40001 → version_conflict`. New, non-overlapping with 3.8.4 invitation codes: `P3848 → not_ready`, `P3849 → warning_acknowledgement_required`, `P384A → activation_in_flight`, `P384B → lifecycle_state_blocks`, `P384C → tenant_reference_mismatch`. Added to `SQLSTATE_REASONS` + `SAFE_MESSAGES`; classification is SQLSTATE-only, never message text.

## 15. Security model
All three RPCs `SECURITY DEFINER`, `SET search_path = pg_catalog, public, private`, `REVOKE ALL FROM PUBLIC, anon`, `GRANT EXECUTE TO authenticated`, permission asserted in-routine via `private.fn_user_has_permission` **and** in `requirePermission` middleware. Tenant ID is the only client-supplied reference; org/branch/invitation/membership ids are resolved server-side. Snapshots and audit rows carry keys, statuses, reason codes and bounded scalar params only — no tokens, hashes, emails or setting values.

## 16. Exact changed paths
Extend: `types/v1/onboarding-readiness.dto.ts`, `onboarding-readiness-check.dto.ts`, `onboarding-activation-result.dto.ts`, `types/v1/index.ts`, `schemas.ts`, `query-keys.ts`, `queries.functions.ts`, `commands.functions.ts`, `server/query-service.server.ts`, `server/command-service.server.ts`, `server/mappers.server.ts`, `index.ts`, `required-settings.registry.ts` (D1-A trim), and tests `commands.test.ts` / `read-models.test.ts` / `schemas.test.ts` / `architecture.test.ts`.
New (justified): `src/lib/tenant-onboarding/readiness.ts` + `__tests__/readiness.test.ts`; one migration `<ts>_pass_3_8_5_readiness_activation.sql`; `supabase/tests/pass_3_8_5_readiness_certification.sql`; `supabase/tests/pass_3_8_5_activation_concurrency.sh` (clone of the 3.8.4 runner); `docs/60-engineering/PHASE3_GATE38_PASS385_COMPLETION_REPORT.md`.
Conditional: **`src/integrations/supabase/types.ts`** — regenerated after migration approval, since new columns and three new public RPCs change the generated contract.

## 17. Migration strategy
Single additive migration: `setting_definitions.readiness_impact` + backfill (D1-A) → `tenant_onboarding` readiness columns with CHECK constraints → `private.fn_onboarding_evaluate_readiness_json(_tenant_id, _correlation_id)` (one CTE statement, one snapshot, no writes) → the three public RPCs + grants/revokes. Replay-safe: all columns nullable or defaulted, all functions `CREATE OR REPLACE`.

## 18. Database certification matrix
`pass_3_8_5_readiness_certification.sql` (transactional, fixture-scoped) covers the full brief: provisioning/lifecycle/org/branch/invitation/membership/role/settings/step/mismatch matrices, `financial_year_present = not_applicable`, all three aggregation outcomes, `not_applicable` count exclusion, and activation cases — ready activates, warnings require acknowledgement, acknowledged warnings activate, not-ready rejected, stale version rejected, no version bump on rejection, exactly-once bump on success, idempotent replay, unauthorized caller rejected, foreign-tenant references rejected, lifecycle validator invoked, snapshot/audit secret hygiene, read-only RPC performs zero writes.
`pass_3_8_5_activation_concurrency.sh` (two sessions): only one transition, loser gets deterministic `40001`/`P384A`, version increments once, no partial state, retry after re-read succeeds.

## 19. Application test matrix
DTO/check mapping to v1 literals; aggregation and exclusions; fingerprint treated as opaque (never recomputed); SQLSTATE classification for all new codes; acknowledgement forwarding; activation request shape; expected-version forwarding; rejection of any client-supplied readiness field; single lifecycle write; no post-RPC follow-up write; query invalidation after refresh/activate; permission middleware per operation; bounded reason params; purity/architecture tests. ~+40 over 553.

## 20. Quality gates
Local: `bun run test`, `./node_modules/.bin/tsc --noEmit`, `bun run build`, `bash -n supabase/tests/pass_3_8_5_activation_concurrency.sh`. Database: clean replay, 3.8.5 readiness SQL, live activation concurrency, 3.8.5A signup, 3.8.4 SQL + concurrency, end-to-end onboarding→activation. Without a Postgres connection each is reported **NOT EXECUTED — UNAVAILABLE**; no PASS inferred from authored SQL.

## 21. Rollback & failure safety
Each command is one transaction; any `RAISE` rolls back snapshot, version, acknowledgement and lifecycle together. Columns are additive; down path is `DROP FUNCTION` + optional `DROP COLUMN`. No write occurs before readiness passes.

## 22. Decision matrix
```text
Readiness matrix coverage ............... PASS
Backend-only scope ...................... PASS
Financial-year handling ................. PASS
Activation gating concept ............... PASS
Required-settings DB authority .......... UNRESOLVED — BLOCKER (D1)
Read-query/write separation ............. CORRECTED (§4)
Warning acknowledgement atomicity ....... CORRECTED (§5)
Fingerprint authority ................... CORRECTED (§6)
Concurrency mechanism ................... CLARIFIED (§7)
Version type alignment .................. CORRECTED (§8)
Lifecycle writer designation ............ CORRECTED (§9)
Snapshot column minimisation ............ CORRECTED (§10)
Generated types path .................... INCLUDED (§16)
Pinned gates ............................ CORRECTED (§20)
Final recommendation .................... ARCHITECTURAL DECISION REQUIRED
```

## 23. Execution order (after D1 approval)
1 migration (incl. D1 authority) → 2 regenerate Supabase types → 3 `readiness.ts` + tests → 4 read-only query path → 5 refresh + activation commands and error map → 6 schemas/DTOs/query keys → 7 app tests → 8 SQL harness → 9 concurrency runner → 10 local gates → 11 completion report (expected: DEVELOPMENT COMPLETE — CERTIFICATION PENDING).

**Approve D1-A, D1-B or D1-C and I will implement.**
