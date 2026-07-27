# Gate 3.8 — Live Database Certification (new disposable target)

## Step 0 — Store the new secret correctly

The supplied connection string points at a different project reference than the live one — good. Two handling details:

- The password contains a literal `@`, which makes the URI ambiguous. It will be percent-encoded (`%40`) before storage so `psql` and the Supabase CLI parse the host correctly.
- The value is written with `set_secret` (overwrites `CERT_DB_URL`), never printed, logged, committed or included in any report or command echo.
- Because the credential was pasted in chat, the database password should be rotated after certification, and the project deleted.

## Baseline handling

- Certify from a clean temporary checkout/worktree at `e1cdb8f55b47d9c8c47e1000de5b36fd970e636f`.
- `b2df7269…` is plan-only, not the runtime baseline.
- Not certified from the dirty working tree; `.lovable/plan.md` and `src/routeTree.gen.ts` never enter the evidence change set.

## Strict boundaries

No functionality, migration, SQL-assertion, runner-logic or UI changes. No reads or writes against the connected live project. No real tenant activated. Stop on the first migration / functional / permission / security / isolation / concurrency / cleanup failure, preserving the exact assertion text, SQLSTATE and command result, and do not repair it in that turn.

## Phase 0 — Disposable-target preflight (hard gate)

Read-only against `CERT_DB_URL` only:

1. Connection succeeds; capture `current_database`, `current_user`, `server_version`.
2. Project reference differs from the recorded live constant (the live project is never queried).
3. `auth.users` exists with **0** rows.
4. `public.tenants` and `public.organizations` absent.
5. No Business OS migration versions in `supabase_migrations.schema_migrations`.
6. No customer / tenant / organization data.
7. Target explicitly disposable.
8. `psql` and `bash` present; versions captured.
9. `bunx supabase --version` resolves without modifying `package.json` or the lockfile.
10. `bash -n` clean on both concurrency runners.

Any failure → stop before fixtures or migrations, return `CERTIFICATION NOT EXECUTED — UNSAFE TARGET`, make no repository changes.

## Phase 1 — Clean migration replay

Apply the complete repository migration chain chronologically to the empty target via the repository-supported `bunx supabase` command. Record migration count, first and last version, start/finish timestamps, exit status, and all notices/warnings/errors. Every migration applies exactly once with no manual repair.

## Phase 2 — Pass 3.8.5A signup trigger

`psql -v ON_ERROR_STOP=1 -f supabase/tests/pass_3_8_5a_signup_trigger_certification.sql`, unchanged. Profile-only signup, null email/phone, hostile metadata ignored, no tenant/org/membership/role side effects, owner + `SECURITY DEFINER` + search path + privilege controls, transactional cleanup. `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` closes only on a full live pass.

## Phase 3 — Pass 3.8.4 admin RPC SQL

`pass_3_8_4_admin_rpc_certification.sql`, unchanged; all assertions and expected SQLSTATEs.

## Phase 4 — Pass 3.8.4 concurrency

`DB="$CERT_DB_URL" bash supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh`, unchanged. Per scenario: one authoritative winner, deterministic replay or conflict, no duplicate invitation/membership/role state, no partial commits, complete cleanup.

## Phase 5 — Pass 3.8.5 readiness SQL

`pass_3_8_5_readiness_certification.sql`, unchanged apart from a purely cosmetic console heading label. Certifies: exact blocking-setting authority, all 14 canonical checks, frozen status vocabulary, read-only evaluation, snapshot persistence, provisioning matrix, active default organization, required-setting validation, invitation/membership/role authority, `not_applicable` count exclusion, warning acknowledgement, `P3848` / `P3849` / `P384B` / `40001`, version N→N+1, exactly one activation step and one audit record, no-op replay, missing-tenant public RPC contract, evaluator volatility (`provolatile = 'v'`), strict validation-schema typing, final `ROLLBACK`.

## Phase 6 — Activation concurrency

`DB="$CERT_DB_URL" bash supabase/tests/pass_3_8_5_activation_concurrency.sh`, unchanged. Preflight must prove `blocking_count = 0` and overall status `ready` or `ready_with_warnings`. Require two genuinely simultaneous sessions, one lifecycle transition, one workflow-version increment, one activation step, one activation audit record, deterministic loser, no partial commit, deterministic replay, complete cleanup.

## Phase 7 — End-to-end disposable onboarding

Through existing routines only: profile-only signup → tenant provisioning → active default organization → default branch → pending owner/admin invitation → readiness with zero blockers → `P3849` without acknowledgement → acceptance → active administrator membership → active role grant → required settings valid → `financial_year_present` stays `not_applicable` unless an authoritative repository source requires otherwise → activation at the exact current workflow version → tenant lifecycle `active` → onboarding state `activated` → version increments exactly once → replay performs no second write → cross-tenant references rejected → no token, hash, password, connection string or sensitive setting in snapshots or audits → every fixture removed. No real tenant activated.

## Phase 8 — Local regression gates

`bun run test`, `./node_modules/.bin/tsc --noEmit`, `bun run build`, `bash -n` on both runners. Labelled local execution evidence, not independent CI evidence.

## Evidence publication

Create `docs/60-engineering/PHASE3_GATE38_LIVE_DATABASE_CERTIFICATION_REPORT.md` with: certified commit, safe environment alias, PostgreSQL and CLI versions, migration replay result, each SQL harness result and assertion total, each concurrency scenario, end-to-end result, regression gates, cleanup confirmation, finding disposition, activation decision, Gate 3.8 verdict, and exact failures/SQLSTATEs where applicable. No credentials, tokens, hashes, customer data or the database URL.

Update **status sections only** in:
- `docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md`
- `docs/60-engineering/PHASE3_GATE38_PASS385A_COMPLETION_REPORT.md`
- `docs/60-engineering/PHASE3_GATE38_PASS385_COMPLETION_REPORT.md`

Historical implementation evidence is not rewritten. The evidence change set contains only those four documentation paths.

## Final verdict forms

- All phases pass → finding `CLOSED`; 3.8.4 / 3.8.5A / 3.8.5 `PASS`; tenant activation `ELIGIBLE`; Gate 3.8 `CERTIFIED`.
- Any gate fails → tenant activation `BLOCKED`; Gate 3.8 `CERTIFICATION FAILED` (evidence preserved, no repair).
- Target or tooling unavailable → `NOT EXECUTED — UNAVAILABLE`; activation `BLOCKED`; Gate 3.8 `DEVELOPMENT COMPLETE — CERTIFICATION PENDING`.

Stop after certification and evidence publication. Platform Hierarchy UI work is not started.
