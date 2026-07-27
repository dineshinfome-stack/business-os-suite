# Pass 3.8.5B — Readiness Contract and Certification Completion

Corrective-only. No redesign of readiness, no UI, no hierarchy changes, no edits to applied migrations.

## 1. Scope hygiene
- Restore `.lovable/plan.md` byte-for-byte from `19a4c82be3d0fd1ca2eb5a005bf63162053cf77c` (`git show`), and restore `src/routeTree.gen.ts` if it drifts. Neither may appear in the final semantic diff.

## 2. Database becomes the only required-settings authority
`src/lib/tenant-onboarding/required-settings.registry.ts`:
- Remove the `OnboardingSettingReadinessImpact` type, the `readinessImpact` field from `OnboardingSettingSpec`, all `readinessImpact` values in entries, and `blockingSettingKeys()`.
- Retain ownership, scope, type, validation-source, default-source, requirement, editability, sensitivity and audit metadata; add a header note naming `public.setting_definitions.readiness_impact` as canonical.
- Update `src/lib/tenant-onboarding/index.ts` and any importer of `blockingSettingKeys`.

New assertions in `src/lib/tenant-onboarding/__tests__/architecture.test.ts`:
- No source file under `src/` contains a hardcoded blocking-settings list or the identifier `blockingSettingKeys`.
- No application code derives `required_settings_valid`; it only maps the database envelope.

No migration change is made for this cleanup.

## 3. Canonical readiness check keys
Correct all identifiers to the 14 keys in `docs/60-engineering/PHASE3_GATE38_READINESS_MATRIX.md`:

```text
tenant_exists                 provisioning_completed
lifecycle_permits_onboarding  organization_exists
primary_branch_exists         admin_invitation_valid
admin_invitation_accepted     admin_membership_exists
admin_role_assigned           required_settings_valid
financial_year_present        no_failed_or_blocked_step
no_concurrent_activation      no_data_integrity_conflict
```

- `src/lib/tenant-onboarding/readiness.ts`: replace `READINESS_CHECK_KEYS` with the canonical list in matrix order (this fixes `primary_branch_present` → `primary_branch_exists`, `tenant_lifecycle_eligible` → `lifecycle_permits_onboarding`, `no_pending_deletion`/`default_organization_present`/`organization_profile_complete` → matrix equivalents, `admin_invitation_present` → `admin_invitation_valid`, `admin_membership_active` → `admin_membership_exists`, `onboarding_steps_complete` → `no_failed_or_blocked_step`, and adds `tenant_exists` and `no_data_integrity_conflict`).
- One **new append-only corrective migration** replaces `private.fn_onboarding_evaluate_readiness_json` with the identical logic emitting the canonical `checkKey`, `reasonCode`, `classification` and `deepLink` values from the matrix (reason codes: `tenant_missing`, `provisioning_incomplete`, `lifecycle_state_blocks`, `organization_missing`, `branch_missing`, `invitation_missing`, `invitation_pending_acceptance`, `membership_missing_after_acceptance`, `admin_role_missing`, `required_setting_missing`, `financial_year_required`, `step_not_clear`, `activation_in_flight`, `tenant_reference_mismatch`). The applied migration is not edited.
- Update `src/lib/tenant-onboarding/__tests__/readiness.test.ts` fixtures and ordering assertions.

## 4. Mandatory expectedVersion
- Same corrective migration: `CREATE OR REPLACE public.fn_onboarding_activate_tenant` with `_expected_version integer` (no SQL default) and an explicit `RAISE ... ERRCODE '40001'` when it is NULL, raised **before** any lock, evaluation or write.
- Regenerate `src/integrations/supabase/types.ts` after the migration is applied.
- `schemas.ts`: `activateTenantSchema` requires `expectedVersion` (non-negative integer, not optional) and drops `acknowledgedFingerprint` entirely.
- `command-service.server.ts`: `activateTenantCommand` forwards exactly `_tenant_id`, `_expected_version`, `_acknowledge_warnings`, `_correlation_id`; no `?? null` fallback.
- Tests: omitted / null / stale version rejected; current version succeeds; rejected requests perform no version increment (asserted in both the app tests via RPC-arg inspection and the SQL harness).

## 5. Permission separation
- Persist readiness → `platform.tenant.update` only. Guarded activation → `platform.tenant.activate` only (drop any additional `platform.tenant.update` requirement in the RPC and in the server-function middleware).
- Tests: update-only user cannot activate; activate-authorized user reaches activation; read-only user can neither persist nor activate; unauthorized direct RPC caller receives `42501`.

## 6. `supabase/tests/pass_3_8_5_readiness_certification.sql`
Transactional, fixture-scoped, rolled back. Certifies: exact 14-key parity and ordering; exact classifications; aggregation arithmetic; `financial_year_present = not_applicable`; `not_applicable` excluded from applicable/warning/blocking counts; required settings read from `setting_definitions.readiness_impact` with the three blocking keys classified `block`; no TypeScript-supplied conclusion accepted; missing/null/stale expected version rejected; warning acknowledgement required then honoured; not-ready activation rejected; rejected activation leaves version unchanged; success increments exactly once; already-active replay writes nothing; cross-tenant mismatch blocks; snapshot and audit rows contain no token/secret columns; `PUBLIC` and `anon` hold no EXECUTE; authenticated execution still enforces internal permissions.

## 7. `supabase/tests/pass_3_8_5_activation_concurrency.sh`
Pass 3.8.4 runner style (`\set VERBOSITY sqlstate`, bounded SQLSTATE matching, atomic fixture seed with owned-fixture cleanup). Two concurrent sessions: only one transition; exactly one version increment; loser gets the deterministic conflict result (`40001` / in-flight); no partial readiness, acknowledgement, workflow or lifecycle commit; deterministic retry after authoritative re-read. Validated with `bash -n` regardless of database availability.

## 8. Application tests
Extend `__tests__/commands.test.ts`, `schemas.test.ts`, `readiness.test.ts` and `architecture.test.ts` for: schema requires `expectedVersion`; `P3848`, `P3849`, lifecycle-block (`P384B`) and `40001` mappings; refresh calls the persist RPC and query calls the read-only evaluation RPC; activation forwards only the four permitted arguments; no client fingerprint accepted; activation and refresh middleware permissions; query invalidation after persist and activation; no follow-up lifecycle update after the atomic activation RPC.

## 9. `docs/60-engineering/PHASE3_GATE38_PASS385_COMPLETION_REPORT.md`
Exact changed paths; runtime implementation status; check-key correction; required-settings authority correction; expectedVersion enforcement; permission model; local gate results; each database gate listed separately as `NOT EXECUTED — UNAVAILABLE` when no PostgreSQL session exists; Pass 3.8.5A signup certification status; Pass 3.8.4 SQL/concurrency status; `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` status. Final status: **DEVELOPMENT COMPLETE — CERTIFICATION PENDING**; tenant activation remains **BLOCKED**.

## 10. Gates
`bun run test`, `./node_modules/.bin/tsc --noEmit`, `bun run build`, `bash -n supabase/tests/pass_3_8_5_activation_concurrency.sh`. Database gates attempted only if a privileged session exists; never inferred from authored SQL. Stop after correction, tests and report — no hierarchy UI work.
