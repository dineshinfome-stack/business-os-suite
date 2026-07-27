# Phase 3 · Gate 3.8 — Live Database Certification Report

| Field | Value |
| --- | --- |
| Certified commit | `e1cdb8f55b47d9c8c47e1000de5b36fd970e636f` |
| Executed from | `dcdecc1ffcb74bfee80fbf8c78d8484206d5162d` — byte-identical to the baseline on every runtime path (`git diff --name-only e1cdb8f5 HEAD` = `.lovable/plan.md` only) |
| Environment alias | `CERT-DISPOSABLE-01` (throwaway Supabase project, distinct from the connected live project) |
| PostgreSQL client | `psql (PostgreSQL) 17.9` |
| PostgreSQL server | `17.6` |
| Supabase CLI | `2.110.0` (via `bunx`, no repository dependency change) |
| Shell | `GNU bash 5.3.3(1)` |
| Execution date (UTC) | 2026-07-27 |
| **Verdict** | **CERTIFICATION FAILED — ACTIVATION BLOCKED** |

No credential, token, hash, connection string or customer datum appears in this
report. The certification URL was never printed, logged or committed.

---

## Phase 0 — Disposable-target preflight

| # | Check | Result |
| --- | --- | --- |
| 1 | PostgreSQL connection succeeds | **PASS** — `current_database = postgres`, `current_user = postgres`, `server_version = 17.6` |
| 2 | Project reference differs from the known live reference | **PASS** — compared against a recorded constant; the live project was never queried |
| 3 | `auth.users` exists and contains zero rows | **PASS** — `0` |
| 4 | `public.tenants` / `public.organizations` absent | **PASS** — both `NULL` via `to_regclass` |
| 5 | No Business OS migration versions recorded | **PASS** — `supabase_migrations.schema_migrations` did not exist |
| 6 | No customer / tenant / organization data | **PASS** — `information_schema.tables` count for schema `public` = `0` |
| 7 | Target explicitly disposable | **PASS** — supplied as a throwaway project for this certification |
| 8 | `psql` and `bash` available | **PASS** |
| 9 | Supabase CLI available through `bunx` | **PASS** — `2.110.0`; `package.json` unchanged |
| 10 | `bash -n` on both concurrency runners | **PASS** — `pass_3_8_4_admin_rpc_concurrency.sh`, `pass_3_8_5_activation_concurrency.sh` |

Phase 0 result: **PASS (10 / 10)**.

---

## Phase 1 — Clean migration replay

| Field | Value |
| --- | --- |
| Command | `bunx supabase db push --db-url "$CERT_DB_URL" --include-all --yes` |
| Repository migrations present | 50 |
| First repository migration | `20260721163907_62ef4d36-6a98-4084-9d97-41bee87acfee.sql` |
| Last repository migration | `20260727162823_eaaf747f-4c52-4ba3-9fb6-2d6dbb583817.sql` |
| Replay start (UTC) | `2026-07-27T17:29:22Z` |
| Replay finish (UTC) | `2026-07-27T17:29:51Z` |
| Exit status | `1` |
| Migrations applied | 8 of 50 (`20260721163907` … `20260721164347`) |
| Failing migration | `20260722030037_9db62b70-9aaa-437e-b861-e28fb6f08319.sql`, statement 2 |

Phase 1 result: **FAIL**. Execution stopped here in accordance with the
stop-on-first-failure boundary. No repair was attempted.

### Exact failure

CLI output (verbatim, connection string never emitted):

```text
effect/sql/SqlError: Failed to execute statement
At statement: 2
-- 003 profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  deleted_at timestamptz,
  deleted_by uuid
)
```

Independent reproduction through `psql -v ON_ERROR_STOP=1 -1` (single
transaction, rolled back) surfaced the server error the CLI suppresses:

```text
psql:supabase/migrations/20260722030037_9db62b70-9aaa-437e-b861-e28fb6f08319.sql:30:
ERROR:  relation "profiles" already exists
```

SQLSTATE confirmed on the same target: **`42P07` — `relation "profiles" already exists`**.

### Observed cause (recorded, not repaired)

`public.profiles` is created unconditionally by **two** repository migrations:

| Migration | Statement |
| --- | --- |
| `20260721163958_0dcf4abf-e6db-4b96-a6d8-df7d27f95a1b.sql` | `-- Migration: 003_profiles` … `CREATE TABLE public.profiles (` |
| `20260722030037_9db62b70-9aaa-437e-b861-e28fb6f08319.sql` | `-- 003 profiles` … `CREATE TABLE public.profiles (` |

Neither uses `IF NOT EXISTS` or a guard. The live project never exhibited this
because its history was built incrementally rather than replayed; a clean
chronological replay — the exact property Phase 1 exists to certify — fails
deterministically at the ninth migration. This is a genuine clean-replay defect
in the migration chain, not an environment artifact.

Repair is explicitly out of scope for this execution-only certification.

---

## Phases 2 – 8

| Phase | Scope | Result |
| --- | --- | --- |
| 2 | Pass 3.8.5A signup-trigger certification | **NOT RUN** — blocked by Phase 1 |
| 3 | Pass 3.8.4 administrator RPC SQL certification | **NOT RUN** — blocked by Phase 1 |
| 4 | Pass 3.8.4 concurrency certification | **NOT RUN** — blocked by Phase 1 |
| 5 | Pass 3.8.5 readiness SQL certification | **NOT RUN** — blocked by Phase 1 |
| 6 | Pass 3.8.5 activation concurrency | **NOT RUN** — blocked by Phase 1 |
| 7 | End-to-end disposable onboarding | **NOT RUN** — blocked by Phase 1 |
| 8 | Local regression gates | **NOT RUN** — the certification target never reached a certifiable schema state |

Assertion totals: **n/a** — no SQL harness was invoked.
Concurrency scenarios: **NOT RUN**.
End-to-end onboarding: **NOT RUN**.

---

## Cleanup

- No fixtures, synthetic identities, tenants, organizations, invitations,
  memberships or role grants were created on any database.
- The disposable target retains the 8 migrations applied before the failure plus
  the `supabase_migrations.schema_migrations` bookkeeping row set. The failing
  migration was rolled back by both the CLI and the independent `psql -1`
  reproduction; it is **not** recorded as applied.
- The disposable project should be deleted, and — because its credential was
  transmitted in chat — its database password rotated.
- No statement of any kind was executed against the connected live project.

---

## Dispositions

| Item | Status |
| --- | --- |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` | **OPEN** — closure requires a live Phase 2 pass, which did not run |
| Pass 3.8.4 certification | **NOT CERTIFIED** |
| Pass 3.8.5A certification | **NOT CERTIFIED** |
| Pass 3.8.5 certification | **NOT CERTIFIED** |
| Tenant activation | **BLOCKED** |
| Gate 3.8 | **CERTIFICATION FAILED** |

New blocking defect recorded for the next authorized repair unit:
**duplicate unconditional `CREATE TABLE public.profiles`** in
`20260721163958` and `20260722030037`, failing clean replay with `42P07`.
