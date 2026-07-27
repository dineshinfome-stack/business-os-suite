## Scope

Exactly two changed paths:

```text
supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh
docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md
```

No application runtime code, no migrations, no Pass 3.8.5.

## 1. SQLSTATE verbosity and bounded matching

- Each racing session sets `\set VERBOSITY sqlstate` (replacing `verbose`) before `BEGIN`.
- The stderr assertion no longer searches for the literal `SQLSTATE: P3843` / `SQLSTATE: P3847` prefix, which does not exist under this mode. It matches the bare five-character code as a bounded token:

```bash
grep -Eq "(^|[^0-9A-Za-z])${expect_state}([^0-9A-Za-z]|\$)" "${f}.err"
```

- `REPLAY` keeps its separate branch, matched on `created=false` in stdout, not on stderr.

## 2. Atomic scenario fixtures

`new_fixture` wraps the tenant and organization inserts in one `BEGIN; … COMMIT;` block so both rows exist or neither does — no orphan tenant can be left behind by a subshell that exits before `FIXTURES+=` runs in the parent shell.

## 3. Shared caller fixture: precheck, atomic seed, single ownership flag

- Parent shell declares `OWN_CALLER=0` before seeding.
- A precheck query fails the run when either already exists:
  - a row in `auth.users` for `USER_OK`;
  - a row in `public.user_roles` for `USER_OK`.
  The failure message says a prior run left fixtures behind and they must be removed manually. The script never adopts or deletes a pre-existing fixture.
- The synthetic auth user and the `platform_owner` grant are inserted in one atomic seed transaction, with `ON CONFLICT DO NOTHING` removed from **both** inserts, so a race that slips past the precheck raises a unique violation instead of silently succeeding.
- `OWN_CALLER=1` is set only after the whole seed command returns success.
- The `EXIT` trap deletes the synthetic role grant and auth user only when `OWN_CALLER -eq 1`. Scenario tenants/organizations/onboarding rows and temp files are still cleaned unconditionally, since they are always created by this run.

## 4. Retained unchanged

- Parent-shell `FIXTURES+=("$pair")` tracking after the `new_fixture` command substitution.
- `make_hash()` producing six distinct deterministic 64-char lowercase hex token hashes (one per session per scenario).
- Three isolated scenarios, each on its own disposable tenant + default organization from empty state: A (replay), B (`P3843`), C (`P3847`), each asserting one creation, one pending invitation, exactly one invitation step row and a recorded version.
- `EXIT`-trap cleanup on success and failure.
- SQL and concurrency certification reported as UNAVAILABLE when no DB connection string is present.

## 5. Completion report update (mandatory)

Section 8 of `PHASE3_GATE38_PASS384_COMPLETION_REPORT.md` currently states `\set VERBOSITY verbose` and unconditional shared-fixture cleanup; both become inaccurate. Rewrite it to state:

- `\set VERBOSITY sqlstate`;
- bounded five-character SQLSTATE-code matching from stderr;
- shared-caller collision precheck that aborts before ownership is claimed;
- cleanup of the synthetic caller only when created by the current execution;
- transactional scenario tenant + organization creation;
- SQL and concurrency certification remain **NOT EXECUTED — UNAVAILABLE**.

Retained statuses left intact: Pass 3.8.4 development COMPLETE, production database certification PENDING, `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` OPEN — release blocker, Pass 3.8.5 ELIGIBLE — NOT STARTED.

## 6. Verification

```text
bash -n supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh
bun run test
./node_modules/.bin/tsc --noEmit
bun run build
```

Each result reported verbatim. No PASS will be claimed for the SQL or concurrency certifications without a live database connection.