# Pass 3.8.2 — Queue Certification Runbook

Authority: `MIG-20260726-GATE38-PASS382-HISTORY-REPAIR`
Approval / reaffirmation commit: `303d2f7bc2158b04e88811ad5a3fcda39262b92d`
Approver: Dino Loy (GitHub: dineshinfome-stack)

## What lives here

| File | Role |
| --- | --- |
| `pass_3_8_2_queue_certification.sql` | Deterministic certification harness for `public.fn_tenant_onboarding_queue` (16 numbered assertions). |
| `pass_3_8_2_queue_certification_postcheck.sql` | Mandatory fresh-session residue postcheck. Read-only. |

Both files live **outside `supabase/migrations/`**, so migration discovery never
finds them, they are never applied, and they never appear in
`supabase_migrations.schema_migrations`. They replace the environment-dependent
harness that formerly occupied
`supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql`,
which is now a comment-only tombstone.

## Guarantees

- One explicit transaction, always terminated by an explicit `ROLLBACK`.
- Deterministic synthetic identities only
  (`a5170000-0000-4000-8000-00000000000{1,2}`,
  `@certification.invalid` e-mails, `cert3820-*` tenant slugs). No live user or
  live tenant is ever read as a fixture, impersonated, or modified.
- The RBAC catalog (`permissions`, `roles`, `role_permissions`) is **read only**;
  the harness aborts rather than seeding or repairing it.
- Any failed assertion raises and aborts the whole transaction, so a failure
  leaves exactly as little behind as a success.

## Execution sequence

Set `DB` to the target connection string (a non-production database unless the
Architecture Office directs otherwise).

Never inline a database URL, password or any credential into these commands —
export `DB` from your own secret store.

```bash
set -u
set -o pipefail
set +e

# 1. Certification run — expect sixteen numbered PASS markers, then ROLLBACK
psql "$DB" \
  -f supabase/tests/pass_3_8_2_queue_certification.sql \
  2>&1 | tee /tmp/pass382-cert.log
HARNESS_EXIT=${PIPESTATUS[0]}

# 2. MANDATORY fresh-session residue postcheck — runs no matter what step 1 did
psql "$DB" \
  -f supabase/tests/pass_3_8_2_queue_certification_postcheck.sql \
  2>&1 | tee /tmp/pass382-postcheck.log
POSTCHECK_EXIT=${PIPESTATUS[0]}

set -e

test "$HARNESS_EXIT" -eq 0
test "$POSTCHECK_EXIT" -eq 0
test "$(
  grep -Eo 'PASS382-CERT-[0-9]{3} PASS' /tmp/pass382-cert.log |
  sort -u |
  wc -l
)" -eq 16
test "$(
  grep -Fc 'PASS382-POSTCHECK PASS' /tmp/pass382-postcheck.log
)" -eq 1
```

`set -o pipefail` plus `${PIPESTATUS[0]}` is required: without them the pipeline
reports `tee`'s status and a failed `psql` run looks successful. `set +e` around
both invocations is what guarantees step 2 still runs when step 1 fails.

Step 2 is mandatory **after every run — success, failure, or forced failure**.
A rollback claim is only credible when an independent session confirms it.

### Expected success output

```text
PASS382-CERT-001 PASS
PASS382-CERT-002 PASS
PASS382-CERT-003 PASS
PASS382-CERT-004 PASS
PASS382-CERT-005 PASS
PASS382-CERT-006 PASS
PASS382-CERT-007 PASS
PASS382-CERT-008 PASS
PASS382-CERT-009 PASS
PASS382-CERT-010 PASS
PASS382-CERT-011 PASS
PASS382-CERT-012 PASS
PASS382-CERT-013 PASS
PASS382-CERT-016 PASS
PASS382-CERT-014 PASS
PASS382-CERT-015 PASS
PASS382-SUPPLEMENTAL-ACL PASS
ROLLBACK
```

Markers are emitted as `NOTICE`s on stderr — always capture with `2>&1`.
`CERT-016` is emitted before `CERT-014`/`CERT-015` because it must run while the
authorized synthetic claims are still active; all sixteen must be present.
`PASS382-SUPPLEMENTAL-ACL PASS` is deliberately **not** numbered: it is an extra
invocation-denial proof, not a seventeenth certified assertion.

The postcheck session prints `PASS382-POSTCHECK PASS` exactly once.

### Failure-path drill

```bash
set -u
set -o pipefail
set +e

PGOPTIONS="-c pass382.force_failure=on" \
psql "$DB" \
  -f supabase/tests/pass_3_8_2_queue_certification.sql \
  2>&1 | tee /tmp/pass382-forced.log
FORCED_EXIT=${PIPESTATUS[0]}

# Runs regardless of the forced failure above
psql "$DB" \
  -f supabase/tests/pass_3_8_2_queue_certification_postcheck.sql \
  2>&1 | tee /tmp/pass382-forced-postcheck.log
FORCED_POSTCHECK_EXIT=${PIPESTATUS[0]}

set -e

test "$FORCED_EXIT" -ne 0
test "$FORCED_POSTCHECK_EXIT" -eq 0
test "$(
  grep -Fc 'PASS382-POSTCHECK PASS' /tmp/pass382-forced-postcheck.log
)" -eq 1
test "$(
  grep -Eo 'PASS382-CERT-[0-9]{3} PASS' /tmp/pass382-forced.log |
  sort -u |
  wc -l
)" -ne 16
```

A forced-failure run must never be reported as a 16/16 certification: the last
assertion above exists precisely to block that claim.

The forced failure raises **after** the synthetic identities, role assignment
and 1,205 tenant fixtures exist, so the postcheck proves the abort path cleans
up as completely as the success path.


## Assertion index

| ID | Certifies |
| --- | --- |
| 001 | Full paginated sweep at `pageSize=100`: every page reports the same exact total and echoes `page` / `page_size`. |
| 002 | Ascending sweep returns every eligible tenant exactly once — no duplicates, no omissions. |
| 003 | Descending sweep has the same completeness property. |
| 004 | Repeating an identical request returns byte-identical rows in the same order. |
| 005 | Out-of-range page returns `[]` and still reports the exact total. |
| 006 | Filter matching nothing returns `[]` with `total_count = 0`. |
| 007 | Search matches a tenant beyond ordinal 1000 (no hidden 1000-row ceiling). |
| 008 | Whitespace-only search is normalized to "no filter". |
| 009 | `createdFrom` total equals an independently computed SQL count. |
| 010 | Pass-3.8.2 constants: `hasBlockers`, `invitationStatus`, `readinessStatus` behave as specified. |
| 011 | Tenants without a workflow report `onboarding = null` and `current_step_key = null` — nothing is fabricated. |
| 012 | Contract violations raise `22023`: `page=0`, `pageSize=0`, `pageSize=101`, bad `sortBy`, bad `sortDir`, bad `state`, bad `currentStep`, inverted date range. |
| 013 | Canonical permission path (`role_id`, no legacy enum role) grants access. |
| 014 | An authenticated identity **without** `platform.tenant.read` is denied with `42501` and receives no envelope. |
| 015 | An anonymous caller is denied with `42501`. |
| 016 | Row level security lets the permission holder see the fixtures and read the onboarding tables. |

A supplemental ACL check additionally asserts that `anon` and `service_role`
hold no `EXECUTE` privilege on the queue routine and that `PUBLIC` holds none.

## Preconditions the harness enforces before doing anything

1. Exactly one active `platform.tenant.read` permission.
2. Exactly one `platform_owner` platform role, linked to that permission.
3. `private.fn_user_has_permission` present.
4. Exactly one `public.fn_tenant_onboarding_queue` with the approved
   twelve-argument signature, `SECURITY INVOKER`, executable by `authenticated`
   and by no other role.
5. No pre-existing synthetic identity or `cert3820-*` fixture (collision guard).

If any precondition fails the harness raises immediately and creates nothing.

## Notes for operators

- The harness suppresses triggers (`session_replication_role = replica`) for the
  single `auth.users` insert, because the platform's new-user trigger would
  provision a workspace organization for a synthetic identity. It is restored to
  `origin` immediately afterwards; both settings are `SET LOCAL` and disappear
  with the rollback. The postcheck asserts no leakage.
- Never edit the tombstone migration to "re-add" verification. Certification
  belongs in this directory, permanently outside migration history.
