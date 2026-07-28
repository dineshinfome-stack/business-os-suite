---
title: "Gate 3.8 — Pass 3.8.5 Readiness & Activation Live Certification"
doc_id: "PASS_3_8_5_LIVE_CERTIFICATION_20260728"
version: "1.0"
status: "Active"
type: "certification-report"
owner: "Architecture Office"
last_updated: "2026-07-28"
tags: ["gate-3.8", "pass-3.8.5", "certification", "readiness", "activation"]
---

# Pass 3.8.5 — Live Certification Report (2026-07-28)

Executed against the existing certification target (migration ledger 51). No
migration replay, no migration authoring, no application code change. No
credential, connection string or customer datum appears in this report.

## 1. Execution

| Item | Value |
| --- | --- |
| Target ledger | 51 migrations |
| SQL harness | `supabase/tests/pass_3_8_5_readiness_certification.sql` |
| SQL run (UTC) | 07:40:55 → 07:41:07 |
| SQL exit status | `0` — **99 / 99 assertions PASS** |
| Concurrency harness | `supabase/tests/pass_3_8_5_activation_concurrency.sh` |
| Concurrency run (UTC) | 07:41:10 → 07:41:55 |
| Concurrency exit status | `0` — scenarios A and B PASS |

Scenario A: two sessions activating with the same expected version produced
exactly 1 transition, 1 optimistic-concurrency loser, 1 step row, 1 audit entry,
lifecycle `active`. Scenario B: post-activation replay applied no transition, no
step, no audit entry and no version bump.

## 2. Harness defects repaired (test-only)

Three defects were in the harness, not in the database contract. Only the SQL
harness file was modified.

1. **Temp-schema privilege break.** After `SET LOCAL role = authenticated`, the
   harness could not write its own bookkeeping tables
   (`permission denied for table _p385_ctx`). Repaired by granting this
   session's private `pg_temp` schema to `authenticated` before the role
   transition. No application-schema privilege is touched.
2. **Volatility probe never matched.** I1/I2 compared
   `pg_get_function_identity_arguments` to `'uuid, text'`, but the identity
   string carries parameter names (`_tenant_id uuid, _correlation_id text`), so
   the probe returned `NOT FOUND`. Repaired by matching `proargtypes` instead.
   Both routines are confirmed `VOLATILE`.
3. **E5 RLS visibility false negative (Classification A).** The suspension
   fixture `UPDATE public.tenants` executed as `authenticated` was silently
   filtered to zero rows by RLS, leaving the tenant eligible; the RPC therefore
   raised `P3848` (readiness blocked) instead of `P384B` (lifecycle blocks
   activation). Repaired with the Pass 3.8.4 role-transition model: fixture DML
   runs as the privileged executor via `RESET ROLE`, the RPC is still invoked as
   `authenticated`, and new assertion `E5a` proves the fixture reached
   `suspended` before the probe. `P384B` now observed.

No migration, RPC, policy or application file was changed.

## 3. Residue

Post-run counts on the certification target: `auth.users` 0, `tenants` 0,
`organizations` 0, `tenant_onboarding` 0, `profiles` 0. Migration ledger 51.
Both harnesses roll back their fixtures.

## 4. Status

| Item | State |
| --- | --- |
| Pass 3.8.4 | CERTIFIED |
| Pass 3.8.5A | CERTIFIED |
| Pass 3.8.5 | **CERTIFIED** |
| Fresh 51-migration replay | DEFERRED TO RELEASE-CANDIDATE CI |
| Private SECURITY DEFINER execute-surface finding | OPEN |
| Gate 3.8 development readiness | CONDITIONAL PASS |
| Gate 3.8 production certification | NOT CERTIFIED |
| Tenant activation — development | UNBLOCKED |
| Tenant activation — production release | BLOCKED |

The current 51-migration chain is **not** freshly replay-certified. Replay
verification is owned by release-candidate CI: install Supabase CLI, start a
local disposable stack via Docker, reset and apply the chain from zero, verify
ledger uniqueness and zero demo/tenant residue, publish logs as artifacts, and
fail the release on verification failure.
