# Phase 3 · Gate 3.8 · Pass 3.8.5A — Completion Report

**Unit:** Pass 3.8.5A — Signup Trigger Release-Blocker Repair (prerequisite to Pass 3.8.5)
**Baseline:** `59562bcdf1dece3e0e63059f07295b9ce669896a`
**Finding:** `FINDING-AUTH-SIGNUP-TENANT-FK-20260726`
**Scope discipline:** repair + certification harness + this report. No readiness evaluation, no activation, no `PHASE3_GATE38_PASS385_COMPLETION_REPORT.md`.

---

## 1. Status

```text
Signup blocker repair development ........ COMPLETE
Signup blocker live certification ......... PENDING
Finding ................................... REPAIRED IN CODE —
                                             LIVE VERIFICATION PENDING
Pass 3.8.5 readiness implementation ....... NOT STARTED
Tenant activation readiness ............... BLOCKED
```

---

## 2. Defect

The effective body of `private.fn_handle_new_auth_user()` — set by migration
`20260722154850` — created a profile, then inserted into `public.organizations`
**without `tenant_id`**, then inserted an owner membership.

Subsequent migrations made `public.organizations.tenant_id` `NOT NULL` with a
foreign key to `public.tenants(id)`, and replaced global slug uniqueness with
`(tenant_id, slug)`. Every `auth.users` INSERT therefore aborted
(`23502` not-null first, foreign key secondary), blocking all signup. The
function's `WHERE slug = v_slug` collision loop was additionally stale under the
composite uniqueness rule.

**Ownership decision.** Per ADR-017, the operator-run Gate 3.8 model and the
deferred tenant self-service policy, the auth trigger creates the application
**profile only**. Tenants and default organizations are platform-provisioned;
membership and administrative roles are owned by invitation acceptance and
`public.fn_onboarding_assign_admin_role`.

---

## 3. Changed paths (exact semantic change set)

```text
docs/60-engineering/PHASE3_GATE38_PASS385A_COMPLETION_REPORT.md
supabase/migrations/20260727111510_pass_3_8_5a_signup_trigger_repair.sql
supabase/tests/pass_3_8_5a_signup_trigger_certification.sql
```

No generated Supabase types update: the trigger function signature is unchanged.
`.lovable/plan.md` is not part of the semantic change set. Pass 3.8.4 artefacts
(report, certification SQL, concurrency runner) are untouched.

---

## 4. Repair

Single append-only migration containing one
`CREATE OR REPLACE FUNCTION private.fn_handle_new_auth_user()`:

- `SECURITY DEFINER`, owner `postgres`, `SET search_path = pg_catalog, public`;
- `REVOKE ALL` from `PUBLIC`, `anon`, `authenticated`;
- existing `trg_auth_users_new_user` binding on `auth.users` preserved;
- single `INSERT INTO public.profiles ... ON CONFLICT (id) DO NOTHING`;
- **idempotent create, never overwrite** — a replay cannot clobber a
  user-edited display name or avatar;
- display-name fallback `full_name → name → local part of email`, permitted to
  resolve to `NULL` because `profiles.display_name` is nullable; missing
  `email` and `avatar_url` tolerated;
- no tenant / organization / membership / role authority is read from user
  metadata, and no such row is written.

**Recovery is roll-forward only.** The migration header states: recovery
requires a new append-only migration restoring a known-safe, profile-only
trigger implementation, and the tenant-less organization auto-provisioning body
from migration `20260722154850` must never be restored. Historical migrations
remain immutable.

---

## 5. Certification harness

`supabase/tests/pass_3_8_5a_signup_trigger_certification.sql` — single
transaction, `ROLLBACK` at the end, deterministic `PASS`/`FAIL` rows plus a
non-zero exit on any failure.

| Section | Assertions |
| --- | --- |
| A — definition & privileges | exactly one zero-argument `private.fn_handle_new_auth_user`; exactly one enabled `AFTER INSERT … FOR EACH ROW` trigger on `auth.users` bound to it; owner `postgres`; `prosecdef`; normalized `proconfig` equals `pg_catalog,public`; `anon` and `authenticated` hold no `EXECUTE`; **PUBLIC** checked via `pg_proc.proacl` + `aclexplode` (`grantee = 0`), never `has_function_privilege('public', …)`; body carries the approved conflict policy and no tenant/organization/membership/role write |
| B — real signup | disposable `auth.users` insert creates exactly one profile; hostile `tenant_id` / `organization_id` / `role` / `platform_role` metadata ignored; signup with empty metadata succeeds |
| C — absence | fixture-scoped only: `tenants.created_by`, `organizations.created_by`, `organization_members.user_id`, `user_roles.user_id` all yield zero rows for the fixture user. A global `organizations.tenant_id IS NULL` check is included strictly as a supplementary integrity preflight, never as a substitute |
| D — idempotency | corrected fixture sequence: insert the real `auth.users` row → let the real trigger create the profile → update it to sentinel user-edited values → attach the function to a disposable table `(id uuid, email text, raw_user_meta_data jsonb)` **with no primary key** → fire twice with the same auth-user id → assert exactly one profile, sentinel `display_name` and `avatar_url` unchanged, and section-C absence assertions still hold |

A second `INSERT … ON CONFLICT DO NOTHING` against `auth.users` is explicitly
**not** used as idempotency evidence: the conflicting insert does not re-fire
the trigger.

---

## 6. Gate results

### Local gates

| Gate | Result |
| --- | --- |
| `bun run test` | 553 / 553 passed (51 files) — local Lovable execution |
| `./node_modules/.bin/tsc --noEmit` | PASS — no diagnostics |
| `bun run build` | PASS |
| `bash -n supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh` | PASS — syntax only |

### Database gates

| Gate | Result |
| --- | --- |
| Clean migration replay from empty database | NOT EXECUTED — UNAVAILABLE |
| Pass 3.8.5A signup-trigger certification harness | NOT EXECUTED — UNAVAILABLE |
| Pass 3.8.4 admin RPC SQL certification | NOT EXECUTED — UNAVAILABLE |
| Pass 3.8.4 three-scenario concurrency runner | NOT EXECUTED — UNAVAILABLE |

No direct PostgreSQL session (`psql`) is available in this environment; the
harness requires `auth.users` INSERT privileges, which the read-only query
facility does not provide. No database gate result is inferred from authored
SQL, from repository contents, or from prior discovery reads.

**Applied-migration observation (not a certification).** The repair migration
was applied through the managed migration facility, and a read-only catalog
query subsequently returned the profile-only body with owner `postgres`,
`prosecdef = true`, `proconfig = {search_path=pg_catalog, public}` and
`proacl = {postgres=X/postgres}`. This is discovery evidence about the
development project only. It is **not** the certification harness and does not
close the finding.

---

## 7. Finding status

`FINDING-AUTH-SIGNUP-TENANT-FK-20260726` remains **REPAIRED IN CODE — LIVE
VERIFICATION PENDING**.

Closure requires, on a live disposable or staging database:

1. the repair migration applied;
2. a real `auth.users` insert that succeeds;
3. the corresponding profile present;
4. no tenant, organization, membership or role row created for the fixture user;
5. the Pass 3.8.5A certification harness passing in full.

---

## 8. Explicitly not started

- **Pass 3.8.5 readiness evaluation** — NOT STARTED. Tenant and provisioning
  state, lifecycle eligibility, default organization and branch, administrator
  invitation / membership / role, required settings, failed and blocked steps,
  concurrent activation and cross-table tenant integrity all remain unowned by
  any implemented code.
- **Tenant activation** — NOT STARTED, and BLOCKED behind the readiness
  evaluator. Activation must accept only `ready` or `ready_with_warnings` with
  explicit warning acknowledgement, under optimistic concurrency.
- **Financial-year requirement source** — still unresolved. Pass 3.8.5A does not
  invent one. The later readiness implementation must evaluate the financial
  year check as `not_applicable` until an authoritative trigger exists.

---

## 9. Next unit

Plan and execute the remaining Pass 3.8.5: readiness evaluator, readiness
snapshot persistence, readiness command/server facade, activation with warning
acknowledgement and optimistic concurrency, and lifecycle delegation.
