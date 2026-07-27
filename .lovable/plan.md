# Gate 3.8 — Live Database Certification Execution

Execution-only. No new functionality, no migrations, no harness edits, no UI, no `.lovable/plan.md` changes.

## Verified current state

- `psql` and `bash` are available in the execution environment; the Supabase CLI is **not** installed (`which supabase` empty) — it will be run transiently via `bunx supabase`, with no change to `package.json`.
- No `DB`, `DATABASE_URL` or `PGHOST` is set; the only configured secret is `LOVABLE_API_KEY`. `CERT_DB_URL` does **not** exist yet.
- All five certification artifacts exist under `supabase/tests/`: `pass_3_8_4_admin_rpc_certification.sql`, `pass_3_8_4_admin_rpc_concurrency.sh`, `pass_3_8_5a_signup_trigger_certification.sql`, `pass_3_8_5_readiness_certification.sql`, `pass_3_8_5_activation_concurrency.sh`.

## Step 0 — Secret intake

Request `CERT_DB_URL` (direct connection or session-mode pooler for a brand-new throwaway Supabase/Postgres project, no customer data). It is used only for Gate 3.8 certification and is never printed, logged, committed, or written to any report. If the secret is not reachable from the execution environment, stop with `LIVE DATABASE CERTIFICATION BLOCKED — CONNECTION UNAVAILABLE` and change nothing.

## Step 1 — Preflight (Phase 0)

Confirm HEAD `e1cdb8f55b47d9c8c47e1000de5b36fd970e636f`, clean tree, presence of the five artifacts and the six listed migrations, tool versions (`psql`, `bunx supabase`, `bash`), and `bash -n` on both runners. Connect and capture `current_database()`, `current_user`, `server_version`, `now()`; confirm the target is empty and is not the connected production project. Record only a safe alias.

If `bunx supabase` (or any repository-supported replay command) is unavailable, stop with `LIVE DATABASE CERTIFICATION BLOCKED — REQUIRED CLI UNAVAILABLE`.

## Step 2 — Certification sequence

Executed in order, halting on the first failure and preserving exact SQLSTATE/assertion/command output:

1. Phase 1 — clean migration replay of the full chain onto the empty database; record count, first/last identifiers, timestamps, exit status, notices.
2. Phase 2 — `pass_3_8_5a_signup_trigger_certification.sql` plus the live disposable `auth.users` insert checks (profile-only, no tenant/org/membership/role, hostile metadata ignored, definer/owner/search-path/grants).
3. Phase 3 — `pass_3_8_4_admin_rpc_certification.sql`, unchanged.
4. Phase 4 — `pass_3_8_4_admin_rpc_concurrency.sh`, unchanged, two live sessions.
5. Phase 5 — `pass_3_8_5_readiness_certification.sql`, unchanged except a cosmetic console heading label if and only if no assertion or runtime logic is touched.
6. Phase 6 — `pass_3_8_5_activation_concurrency.sh`, live two-session activation race.
7. Phase 7 — end-to-end disposable onboarding run through the existing RPCs: signup → tenant → default organization/branch → pending admin invitation → readiness → `P3849` without acknowledgement → acceptance → membership/role → activation at exact version → lifecycle `active`, state `activated`, single version increment, no-op replay, no cross-tenant reference, no secret material in snapshots/audit; then full fixture removal.
8. Phase 8 — local regression gates: `bun run test`, `tsc --noEmit`, `bun run build`, labelled local (not CI) evidence.

## Step 3 — Evidence publication

Create `docs/60-engineering/PHASE3_GATE38_LIVE_DATABASE_CERTIFICATION_REPORT.md` with the required fields (commit, environment alias, timestamps, versions, every gate result, cleanup, finding status, activation and Gate 3.8 decisions, exact failures/SQLSTATEs). No connection strings, keys, tokens, hashes or customer data.

Update **status sections only** of:
- `docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md`
- `docs/60-engineering/PHASE3_GATE38_PASS385A_COMPLETION_REPORT.md`
- `docs/60-engineering/PHASE3_GATE38_PASS385_COMPLETION_REPORT.md`

`FINDING-AUTH-SIGNUP-TENANT-FK-20260726` is closed only if Phase 2 passes live in full.

## Verdict

`GATE 3.8 CERTIFIED — TENANT ACTIVATION ELIGIBLE` only when every gate passes; otherwise `CERTIFICATION FAILED — ACTIVATION BLOCKED` (evidence preserved, no repair this turn) or `CERTIFICATION NOT EXECUTED — CONNECTION UNAVAILABLE`. Final response is the gate table, assertion totals, concurrency results, end-to-end result, finding status, cleanup confirmation, changed doc paths, verdict, next authorized activity. Platform Hierarchy UI is not started.
