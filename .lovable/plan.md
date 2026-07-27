## Pass 3.8.5A — Certification Harness Correction (exactly two files)

Correction baseline: `b212b5b33106fd3ecfd4191400af9c740fb43977`. No migration change, no runtime application change.

### 1. `supabase/tests/pass_3_8_5a_signup_trigger_certification.sql`

**a. Third fixture — null-email (phone) signup**
- Add `fixture_user_id_nullemail` (`gen_random_uuid()`) to `_p385a_ctx`, plus an E.164-safe synthetic phone derived from it:
  ```
  '+1999' || substr(translate(replace(fixture_user_id_nullemail::text,'-',''),'abcdef','012345'),1,10)
  ```
- Insert a third `auth.users` row using the same base column shape as the existing fixtures, with:
  `email = NULL`, `phone = synthetic_phone`, `phone_confirmed_at = now()`,
  `raw_app_meta_data = '{"provider":"phone","providers":["phone"]}'::jsonb`,
  `raw_user_meta_data = '{}'::jsonb`,
  `confirmation_token = ''`, `email_change = ''`, `email_change_token_new = ''`, `recovery_token = ''`.
- Explicit recorded assertions: auth insert completed; exactly one profile exists; `display_name IS NULL`; no fixture-owned tenant; no fixture-owned organization; no organization membership; no user role.

**b. Auth fixture compatibility hardening**
- Add `confirmation_token`, `email_change`, `email_change_token_new`, `recovery_token` (each `''`) to **all three** `auth.users` inserts, matching the repository-proven fixture shape.

**c. Side-effect helper**
- Extend `pg_temp.assert_no_side_effects` so all three fixture IDs are included in every applicable predicate.

Unchanged: single transaction, disposable-table double-trigger idempotency method, sentinel preservation, ACL/`aclexplode` privilege checks, terminating `ROLLBACK`.

### 2. `docs/60-engineering/PHASE3_GATE38_PASS385A_COMPLETION_REPORT.md`

- Replace the "`23502` not-null first, foreign key secondary" wording with:
  > The insert fails with SQLSTATE 23502 because `tenant_id` is omitted. The foreign key additionally guarantees that every non-null `tenant_id` references an existing tenant.
- Record the harness additions (null-email/phone fixture, hardened auth column shape, three-ID side-effect helper).
- Keep: database gates **NOT EXECUTED — UNAVAILABLE**; finding **REPAIRED IN CODE — LIVE VERIFICATION PENDING**; Pass 3.8.5 readiness NOT STARTED; activation BLOCKED.
- Keep the explicit distinction that test/typecheck/build results are local Lovable results, with no associated GitHub workflow evidence.

### Gates
- `bun run test`
- `./node_modules/.bin/tsc --noEmit` (repository-pinned compiler; no `tsgo`)
- `bun run build`
- `git diff --name-only b212b5b33106fd3ecfd4191400af9c740fb43977` must list exactly the two paths above; a diff from `59562bcd…` must still show the original three-path Pass 3.8.5A scope including the repair migration.
- Restore `.lovable/plan.md` to baseline content if it is modified automatically.
