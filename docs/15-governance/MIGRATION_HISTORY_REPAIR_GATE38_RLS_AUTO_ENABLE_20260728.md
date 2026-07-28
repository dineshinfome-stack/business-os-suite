---
title: "Gate 3.8 — rls_auto_enable Portability History Repair"
doc_id: "MIGRATION_HISTORY_REPAIR_GATE38_RLS_AUTO_ENABLE_20260728"
version: "1.0"
status: "IMPLEMENTED — FRESH REPLAY CERTIFICATION PENDING"
type: "governance-migration-authority"
owner: "Architecture Office"
last_updated: "2026-07-28"
tags: ["governance", "migration", "gate-3.8", "history-repair", "portability"]
---

# Gate 3.8 — Controlled One-File `rls_auto_enable` Portability History Repair

**Exception ID:** `MIG-20260728-GATE38-RLS-AUTO-ENABLE-PORTABILITY-HISTORY-REPAIR`

**Status:** IMPLEMENTED — FRESH REPLAY CERTIFICATION PENDING
(Initial status on authorization was: AUTHORIZED — IMPLEMENTATION IN PROGRESS.)

## 1. Explicit approval

The repository owner explicitly approved this controlled historical migration
repair in the authorizing prompt. The approved technical change is limited to
replacing the four unconditional `REVOKE` statements against the
environment-provided function `public.rls_auto_enable()` with a deterministic
existence-guarded `DO` block that:

- revokes the same four privileges when the function exists;
- performs no action when the function is absent;
- never creates the function;
- retains all `private.fn_*` hardening statements unchanged.

Historical fresh-replay semantics are changed intentionally. The intended final
security state must later be proven through a new clean replay and catalog
verification.

## 2. Baseline

| Item | Value |
| --- | --- |
| Starting HEAD | `cdd1ad2bfe0de6511edefb74a287e90ac758fa93` |
| Subject migration | `supabase/migrations/20260723072217_7c5f965e-66e6-42e0-9245-a3b40f732eaf.sql` |
| Subject Git blob (before) | `d40f8cd24610cb1693c2b492b3b2c3c17a5795d6` |
| Protected `src/routeTree.gen.ts` blob | `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` |
| Working tree at preparation | clean (`git status --porcelain=v1` empty) |

## 3. Before evidence (recalculated from the actual file)

| Metric | Value |
| --- | --- |
| Git blob SHA | `d40f8cd24610cb1693c2b492b3b2c3c17a5795d6` |
| SHA-256 | `ba196ea778ee9a4b20a93e1fe11cb3bd95b05fdd6929682b2fa2e3940c6c9f9d` |
| Bytes | 1330 |
| Newline characters | 18 |
| Logical lines | 19 (no trailing newline on final line) |
| `git log --follow` | `89618e5 Changes` (single commit) |

Executable-statement inventory (before):

- 4 unconditional `REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()` (PUBLIC, anon, authenticated, service_role)
- 4 `REVOKE EXECUTE ON FUNCTION private.fn_user_*` / `fn_user_permissions` from PUBLIC
- 4 `ALTER FUNCTION private.fn_* SET search_path = pg_catalog, public`
- 0 `CREATE FUNCTION` statements
- 0 exception handlers

## 4. Failure being repaired

- Previous clean-replay failure: **SQLSTATE 42883 — `undefined_function`**
- Failing migration: `20260723072217_7c5f965e-66e6-42e0-9245-a3b40f732eaf.sql`
- Prior defect `SQLSTATE 42P07` (duplicate `public.profiles`): **RESOLVED** by
  `MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR`; the consolidated
  baseline `20260722030037` now replays cleanly.

### Connected-development metadata evidence

On the connected development project, `public.rls_auto_enable` exists as a
`SECURITY DEFINER` event-trigger function owned by `postgres`, backing the
`ensure_rls` DDL event trigger. It is created by the environment, not by any
migration in this repository.

### Staging and production

**NOT INSPECTED — STATUS UNKNOWN.**

## 5. Rationale

- **Why `rls_auto_enable` is environment-provided:** it is installed by the
  hosting platform's DDL-hardening tooling, attached to an event trigger, and
  absent from every migration file in this repository.
- **Why the repository must not create it:** creating a platform-owned event
  trigger function would fork ownership, risk conflicting with the platform's
  own definition, and could alter DDL behaviour globally on managed projects.
- **Why the whole migration must not be tombstoned:** sections 2 and 3 apply
  required least-privilege revokes and `search_path` normalization to the
  `private.fn_*` RLS helpers. Removing them would regress security posture.
- **Why an append-only migration cannot repair this:** the failure aborts the
  replay at `20260723072217`; no later migration is ever reached. Only the
  failing statement itself can be made portable.

## 6. Repair scope

Exactly one section of one migration file is changed: the section-1
`public.rls_auto_enable()` revokes become a single guarded `DO` block using
`to_regprocedure('public.rls_auto_enable()')`. All bytes from the
`-- 2. private.fn_*` marker onward are preserved byte-for-byte from the
baseline.

### Authorized five-path allowlist

1. `supabase/migrations/20260723072217_7c5f965e-66e6-42e0-9245-a3b40f732eaf.sql`
2. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_RLS_AUTO_ENABLE_20260728.md`
3. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_RLS_AUTO_ENABLE_MANIFEST.json`
4. `docs/15-governance/MIGRATION_REGISTRY.md`
5. `docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_RLS_AUTO_ENABLE_AUDIT_20260728.md`

## 7. Safety

- **Existing environments:** the function exists, the guard evaluates true, and
  the identical four revokes are executed. No behavioural change.
- **Fresh replay:** the function is absent, the guard evaluates false, no object
  is created, and replay proceeds. No catch-all exception handler is used, so
  genuine errors still fail loudly.

## 8. Standing statuses

- Certification: **PENDING** — a new clean replay on a fresh disposable target is required.
- Gate 3.8: **CERTIFICATION FAILED**.
- Tenant activation: **BLOCKED**.
- Signup finding `FINDING-AUTH-SIGNUP-TENANT-FK-20260726`: **OPEN**.
- Database accessed during this repair: **false**. SQL executed: **false**.

## 9. After evidence

| Metric | Value |
| --- | --- |
| Git blob SHA | `6beb4285005aa0aab64c056691d91ff65996591a` |
| SHA-256 | `9114911341a4c91c14171df9ccefa2b39a78d72b1f17a921012c54ef7f9f46b0` |
| Bytes | 1756 |
| Newline characters | 27 |
| Logical lines | 28 |
| Guarded `DO` blocks | 1 |
| Guarded `rls_auto_enable` revokes | 4 |
| Unconditional `rls_auto_enable` revokes | 0 |
| `private.fn_*` revokes retained | 4 |
| `private.fn_*` `ALTER FUNCTION` retained | 4 |
| Function / event-trigger creations added | 0 |
| Exception handlers added | 0 |
| Section-2/3 tail vs baseline | byte-identical (882 bytes) |
