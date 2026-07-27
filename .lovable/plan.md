# Gate 3.8 — Live Database Certification (Execution-Only)

## Verified this turn (read-only)

A single read-only probe against `CERT_DB_URL` returned: `auth.users` = **2**, `public.tenants` **present**, `supabase_migrations.schema_migrations` = **42 rows**. The secret still resolves to a non-disposable, already-migrated database. Nothing was written; the URL was not printed or persisted.

If that is still true at execution time, Phase 0 fails and the run stops with `CERTIFICATION NOT EXECUTED — UNSAFE TARGET`, with zero repository changes.

## Baseline handling

- Certify from a clean temporary checkout/worktree at `e1cdb8f55b47d9c8c47e1000de5b36fd970e636f`.
- `b2df7269…` is plan-only and is not the runtime baseline.
- Never certify from the dirty working tree; `.lovable/plan.md` and `src/routeTree.gen.ts` are excluded from the evidence change set.

## Strict boundaries

No functionality, migrations, SQL assertion, runner-logic, or UI changes. No writes or queries against the connected live project. No real tenant activated. Stop on the first migration / functional / permission / security / isolation / concurrency / cleanup failure, preserving the exact assertion text, SQLSTATE and command result, and do not repair it this turn.

## Phase 0 — Disposable-target preflight (hard gate)

Read-only, against `CERT_DB_URL` only:

1. Connection succeeds; capture `current_database`, `current_user`, `server_version`.
2. Project/host reference differs from the known live reference (compared against a recorded constant — the live project is never queried).
3. `auth.users` exists and has **0** rows.
4. `public.tenants` and `public.organizations` are **absent**.
5. No Business OS migration versions recorded.
6. No customer/tenant/organization data.
7. Target explicitly disposable.
8. `psql` and `bash` present, versions captured.
9. `bunx supabase --version` resolves without touching `package.json` or lockfile.
10. `bash -n` clean on both concurrency runners.

Any failure → stop before fixtures or migrations.

## Phase 1 — Clean migration replay

Apply the full chain chronologically to the empty target via the repository-supported `bunx supabase` command. Record: migration count, first and last version, start/finish timestamps, exit status, and all notices/warnings/errors. Every migration must apply exactly once with no manual repair.

## Phase 2 — Pass 3.8.5A signup trigger

Run `pass_3_8_5a_signup_trigger_certification.sql` unchanged with `ON_ERROR_STOP=1`. Requires profile-only signup, null email/phone handling, hostile metadata ignored, no tenant/org/membership/role side effects, definer/owner/search-path/privilege controls, transactional cleanup. `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` closes only on a full live pass.

## Phase 3 — Pass 3.8.4 admin RPC SQL

Run `pass_3_8_4_admin_rpc_certification.sql` unchanged; all assertions and expected SQLSTATEs must pass.

## Phase 4 — Pass 3.8.4 concurrency

Run `pass_3_8_4_admin_rpc_concurrency.sh` unchanged with `DB="$CERT_DB_URL"`. Each two-session scenario: one authoritative winner, deterministic replay/conflict, no duplicate invitation/membership/role, no partial commits, full cleanup.

## Phase 5 — Pass 3.8.5 readiness SQL

Run `pass_3_8_5_readiness_certification.sql` unchanged (only a cosmetic console heading label may be corrected, touching no SQL or runtime logic). Must certify: exact blocking-setting authority, all 14 canonical checks, frozen status vocabulary, read-only evaluation, snapshot persistence, provisioning matrix, active default organization, required-setting validation, invitation/membership/role authority, `not_applicable` exclusion from counts, warning acknowledgement, `P3848` / `P3849` / `P384B` / `40001`, version N→N+1, exactly one activation step and one audit record, no-op replay, missing-tenant public RPC contract, evaluator volatility (`provolatile = 'v'`), strict metadata typing, final `ROLLBACK`.

## Phase 6 — Activation concurrency

Run `pass_3_8_5_activation_concurrency.sh` unchanged. Preflight must show `blocking_count = 0` and overall status `ready` or `ready_with_warnings`. Require two genuinely simultaneous sessions, one lifecycle transition, one version increment, one activation step, one audit record, deterministic loser, no partial commit, deterministic replay, complete cleanup.

## Phase 7 — End-to-end disposable onboarding

Through existing routines only: signup → tenant provisioning → active default organization → default branch → pending owner/admin invitation → readiness with zero blockers → `P3849` without acknowledgement → acceptance → active membership → active role grant → required settings valid → `financial_year_present` stays `not_applicable` unless an authoritative repository source requires it → activation at the exact current version → lifecycle `active`, state `activated`, single version increment, replay writes nothing, cross-tenant references rejected, no token/hash/password/connection-string/sensitive setting in snapshots or audits, all fixtures removed.

## Phase 8 — Local regression gates

`bun run test`, `./node_modules/.bin/tsc --noEmit`, `bun run build`, `bash -n` on both runners — labelled local execution evidence, not independent CI evidence.

## Evidence publication

Create `docs/60-engineering/PHASE3_GATE38_LIVE_DATABASE_CERTIFICATION_REPORT.md` containing: certified commit, safe environment alias, PostgreSQL/CLI versions, replay result, each harness result with assertion totals, each concurrency scenario, end-to-end result, regression gates, cleanup confirmation, finding disposition, activation decision, Gate 3.8 verdict, and exact failures/SQLSTATEs when applicable. No credentials, tokens, hashes, customer data or database URL.

Update **status sections only** in the Pass 3.8.4, 3.8.5A and 3.8.5 completion reports; historical implementation evidence is not rewritten. The evidence change set contains only those four documentation paths.

## Verdict forms

- All phases pass → finding `CLOSED`; 3.8.4 / 3.8.5A / 3.8.5 `PASS`; activation `ELIGIBLE`; Gate 3.8 `CERTIFIED`.
- Any gate fails → activation `BLOCKED`; Gate 3.8 `CERTIFICATION FAILED` (evidence preserved, no repair).
- Target or tooling unavailable → `NOT EXECUTED — UNAVAILABLE`; activation `BLOCKED`; Gate 3.8 `DEVELOPMENT COMPLETE — CERTIFICATION PENDING`.

Stop after certification and evidence publication. Platform Hierarchy UI is not started.
