# Pass 3.8.5A — Signup Trigger Release-Blocker Repair (prerequisite to Pass 3.8.5)

Baseline `59562bcdf1dece3e0e63059f07295b9ce669896a`. Strict lean execution. No readiness evaluator, no activation, no `PHASE3_GATE38_PASS385_COMPLETION_REPORT.md`, no historical migration edits.

## 1. Confirmed defect

Effective `private.fn_handle_new_auth_user()` (body set by `20260722154850`) inserts a profile, then an organization **without `tenant_id`**, then an owner membership. Later migrations made `organizations.tenant_id` NOT NULL with FK to `tenants(id)` and replaced global slug uniqueness with `(tenant_id, slug)`. Every `auth.users` insert therefore aborts (`23502` first, FK secondary). The function's `WHERE slug = v_slug` uniqueness loop is likewise stale.

Canonical ownership (ADR-017, operator-run Gate 3.8, tenant self-service deferred): the auth trigger creates the application **profile only**. Tenant + default organization are platform-provisioned; membership and admin roles belong to invitation acceptance and `fn_onboarding_assign_admin_role`.

## 2. Changed paths — exactly three

```text
supabase/migrations/<new>_pass_3_8_5a_signup_trigger_repair.sql
supabase/tests/pass_3_8_5a_signup_trigger_certification.sql
docs/60-engineering/PHASE3_GATE38_PASS385A_COMPLETION_REPORT.md
```

After implementation, `git diff --name-only 59562bcdf1dece3e0e63059f07295b9ce669896a` must list exactly these three. If Lovable auto-modifies `.lovable/plan.md`, restore it to baseline content before completion. Any other path is a scope failure and a stop condition. No generated Supabase types update — the trigger signature is unchanged.

## 3. Append-only repair migration

Single `CREATE OR REPLACE FUNCTION private.fn_handle_new_auth_user()`:

- `SECURITY DEFINER`, owner `postgres`, `SET search_path = pg_catalog, public`
- `REVOKE ALL … FROM PUBLIC, anon, authenticated`
- existing `trg_auth_users_new_user` binding untouched
- body: one `INSERT INTO public.profiles (id, display_name, avatar_url, created_by, updated_by) … ON CONFLICT (id) DO NOTHING; RETURN NEW;`
- **idempotent create, never overwrite** — a replay must not clobber a user-edited display name or avatar
- display-name fallback `full_name → name → split_part(email,'@',1)`, allowed to resolve to NULL (`profiles.display_name` is nullable); tolerates missing `email`/`avatar_url`
- reads no tenant/organization/membership/role authority from `raw_user_meta_data`
- writes no `tenants`, `organizations`, `organization_members`, `user_roles`

**Header recovery note (roll-forward only):**

```text
Recovery requires a new append-only migration restoring a known-safe,
profile-only trigger implementation. Never restore the tenant-less
organization auto-provisioning body from migration 20260722154850.
```

No self-service tenant provisioning is introduced. Historical migrations stay immutable.

## 4. Certification — `supabase/tests/pass_3_8_5a_signup_trigger_certification.sql`

Definition and privilege assertions (function resolved by namespace `private`, name, zero-argument identity):

1. exactly one enabled `AFTER INSERT` trigger on `auth.users` invokes `private.fn_handle_new_auth_user`
2. owner is `postgres`
3. `prosecdef` is true
4. normalized `proconfig` entry equals `search_path=pg_catalog, public` (normalize whitespace/quoting before comparing; do not assume one raw array rendering)
5. `has_function_privilege('anon', …, 'EXECUTE')` is false and same for `authenticated`; **PUBLIC** is checked by inspecting `pg_proc.proacl` via `aclexplode` for a grant with `grantee = 0` — never `has_function_privilege('public', …)`
6. the function definition carries the approved `ON CONFLICT (id) DO NOTHING` profile policy and no tenant/organization/membership/role write

Behavioural assertions, all **fixture-scoped** (no unrestricted global before/after counts):

7. inserting a disposable `auth.users` row creates exactly one `profiles` row with `id = fixture_user_id`
8. missing optional metadata (`full_name`, `name`, `avatar_url`, `email`) does not fail signup
9. hostile `tenant_id` / `organization_id` / `role` / platform-role metadata is ignored
10. `SELECT count(*) FROM tenants WHERE created_by = fixture_user_id` = 0
11. `organizations WHERE created_by = fixture_user_id` = 0
12. `organization_members WHERE user_id = fixture_user_id` = 0
13. `user_roles WHERE user_id = fixture_user_id` = 0
14. optional integrity preflight only: no `organizations` row with `tenant_id IS NULL` (supplementary, never a substitute for the fixture predicates)

Conflict / idempotency fixture sequence (corrected — a profile cannot pre-exist without its `auth.users` row):

1. insert the disposable `auth.users` fixture row
2. let the real trigger create the profile
3. `UPDATE public.profiles SET display_name = '<sentinel>', avatar_url = '<sentinel>' WHERE id = fixture_user_id`
4. create a disposable table `(id uuid, email text, raw_user_meta_data jsonb)` — **no primary key**, duplicate ids must be allowed
5. attach `private.fn_handle_new_auth_user()` as an `AFTER INSERT … FOR EACH ROW` trigger on it
6. insert two rows carrying the same `fixture_user_id`
7. assert exactly one profile row for that id, sentinel `display_name` and `avatar_url` unchanged, and assertions 10–13 still hold
8. drop the disposable trigger and table

Fixtures are cleaned or transactionally rolled back; deterministic PASS/FAIL output lines.

## 5. Gates

Local: `bun run test`; `./node_modules/.bin/tsc --noEmit`; `bun run build`; `bash -n supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh`.

Live (only if a PostgreSQL connection exists): clean migration replay; Pass 3.8.5A certification; `pass_3_8_4_admin_rpc_certification.sql`; the three-scenario `pass_3_8_4_admin_rpc_concurrency.sh` unmodified. Otherwise each database gate is reported `NOT EXECUTED — UNAVAILABLE`. No PASS inferred from authored SQL, from GitHub contents, or from prior discovery reads.

## 6. Finding status rule

`FINDING-AUTH-SIGNUP-TENANT-FK-20260726` closes only after the repair is applied to a live disposable/staging database, a real `auth.users` insert succeeds, the profile exists, no tenant/organization/membership/role row is created for the fixture user, and the harness passes. Otherwise:

```text
Signup blocker repair development ........ COMPLETE
Signup blocker live certification ......... PENDING
Finding ................................... REPAIRED IN CODE — LIVE VERIFICATION PENDING
Pass 3.8.5 readiness implementation ....... NOT STARTED
Tenant activation readiness ............... BLOCKED
```

## 7. Completion report

Only `docs/60-engineering/PHASE3_GATE38_PASS385A_COMPLETION_REPORT.md`: Pass 3.8.5A status block above; exact changed paths; local gate results; each database gate reported separately; finding status; explicit note that Pass 3.8.5 readiness evaluation and activation remain NOT STARTED; explicit note that the financial-year requirement source remains unresolved and must evaluate `not_applicable` in the later readiness implementation. Pass 3.8.4 report and scripts are not touched.

## 8. Rollback and failure safety

Single `CREATE OR REPLACE`, revertible only by a further append-only migration (roll-forward). Trigger binding, ownership and grants preserved, so no auth-path outage window. Narrowing removes writes only; no backfill possible or needed (tenant-less organizations cannot exist under NOT NULL). Harness touches disposable fixtures exclusively.

## 9. Stop conditions

Halt and report instead of improvising if: migration replay fails; the function cannot be replaced without dropping dependents; any Pass 3.8.4 concurrency scenario regresses; the semantic diff would include a fourth path; or evidence emerges that self-service tenant signup is a hard requirement (architectural decision, not a repair).

## 10. Execution order

1. Author the append-only repair migration (with roll-forward header note).
2. Author the certification harness.
3. Run local gates.
4. Attempt live gates; record honest per-gate status.
5. Author the Pass 3.8.5A completion report, verify the three-path diff, and stop.

## 11. Deferred to the real Pass 3.8.5

Readiness evaluator (tenant/provisioning state, lifecycle eligibility, default organization and branch, invitation/membership/role, required settings, financial year `not_applicable`, failed/blocked steps, cross-table tenant integrity), readiness snapshot persistence, readiness command/server facade, activation restricted to `ready` / `ready_with_warnings` with explicit warning acknowledgement, optimistic activation concurrency, lifecycle delegation.

**READY TO EXECUTE as Pass 3.8.5A.**
