# Gate 3.8 — Tenant Update Permission Seed Repair

**Finding identifier:** FINDING-G38-TENANT-UPDATE-PERMISSION-SEED
**Date (UTC):** 2026-07-28
**Status:** IMPLEMENTED — TARGETED LIVE MIGRATION AND RECERTIFICATION PENDING

---

## 1. Baseline

| Item | Value |
|---|---|
| Starting HEAD | `a262f8ed343e5439ba0a1e8a827a5eecdf2c7c34` |
| Content-equivalent certified baseline | `40ea9e283e64819d0fd75c2bfd3c9484c6a74bf0` |
| Comparison `40ea9e28..a262f8ed` | zero changed files |
| Working tree at start | clean |
| Migration count at start | 50 |
| routeTree blob | `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` (protected) |

### Exact two-path allowlist

1. `supabase/migrations/20260728053000_gate38_tenant_update_permission_seed.sql`
2. `docs/50-audit-reports/GATE38_TENANT_UPDATE_PERMISSION_SEED_REPAIR_20260728.md`

No other path changed.

---

## 2. Defect evidence

**Pass 3.8.4 precondition failure.** The Administrator RPC live certification
harness aborted at its precondition with:

```
ERROR: PASS384-CERT precondition: platform.tenant.update permission missing
```

**Missing database permission.** On a clean 50-migration replay, no row exists
in `public.permissions` with key `platform.tenant.update`, and therefore no
role-permission binding can exist for it.

**Permission manifest already correct.** `docs/15-governance/permission-catalog.manifest.yaml`
(blob `7e20f469bd2097f1d540747736e2675bdb03dc66`) contains exactly one
`platform.tenant.update` entry.

**Generated TypeScript catalog already correct.** `src/lib/generated/permission-keys.ts`
(blob `bd41426d63eb05a752950eabc8831d332dab275e`) contains exactly one
`PLATFORM_TENANT_UPDATE: "platform.tenant.update"`.

**Historical migration omission.** `supabase/migrations/20260723172755_eb813b30-492b-46f4-91bc-9c9df33beb2f.sql`
(blob `2347ca8dde6f04b2c149f82c98ae40944b5b5396`) seeds the tenant permission
family but omits the `platform.tenant.update` row.

**Runtime dependency.** Both the application onboarding command facades and the
database onboarding routines authorize against this key via
`private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update')`
and via the required-permission arrays in the onboarding SECURITY DEFINER
routines. With the row absent, the authorization path is unsatisfiable.

---

## 3. Repair

**New append-only migration:**
`supabase/migrations/20260728053000_gate38_tenant_update_permission_seed.sql`

### Exact permission row

| Column | Value |
|---|---|
| key | `platform.tenant.update` |
| module | `platform` |
| resource | `tenant` |
| action | `update` |
| name | `Update tenant` |
| description | `Update tenant registry metadata (non-lifecycle)` |
| system_permission | `true` |

Inserted with `ON CONFLICT (key) DO NOTHING`.

### Exact system-role grants

Idempotent `INSERT ... SELECT` into `public.role_permissions` with
`ON CONFLICT DO NOTHING`, restricted to `scope = 'platform'` and:

- `platform_owner`
- `platform_admin`

No organization-scoped or custom role receives this permission automatically.

### Validation-block behavior

A deterministic `DO` block raises an exception unless all of the following
hold:

1. Exactly one permission row exists for `platform.tenant.update`.
2. Exactly two required platform roles exist (`platform_owner`, `platform_admin`).
3. Exactly two required role-permission bindings exist — counted only for those
   two platform roles, so future custom-role grants do not cause a false
   failure.
4. The permission row has `module = platform`, `resource = tenant`,
   `action = update`, `system_permission = true`.

### Prohibited SQL

The migration contains no `DELETE`, `UPDATE`, `ALTER TABLE`, `DROP`,
`TRUNCATE`, `CREATE OR REPLACE FUNCTION`, user/tenant fixtures, credentials,
project references, or unrelated permission changes.

---

## 4. Protection results

| Protected artifact | Result |
|---|---|
| Historical migration `20260723172755` | unchanged — `2347ca8dde6f04b2c149f82c98ae40944b5b5396` |
| `docs/15-governance/permission-catalog.manifest.yaml` | unchanged — `7e20f469bd2097f1d540747736e2675bdb03dc66` |
| `src/lib/generated/permission-keys.ts` | unchanged — `bd41426d63eb05a752950eabc8831d332dab275e` |
| `supabase/tests/pass_3_8_4_admin_rpc_certification.sql` | unchanged — `30fe1ed8fd648f53e0ad74c402a1f63628fc06da` |
| `supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh` | unchanged — `d5e5cff401194d848acb0fa46b7210c601d5585a` |
| `src/routeTree.gen.ts` | unchanged — `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` |
| `.lovable/plan.md` | unchanged |
| package / lockfile | unchanged |

---

## 5. Execution constraints

- **No database was accessed.** `CERT_DB_URL` was not used; the Supabase CLI
  was not linked.
- **No SQL was executed** against any database.
- Migrations were not applied or replayed.
- The build, development server and route generator were not invoked.

---

## 6. Pending work

- Targeted application of this migration to the existing disposable
  certification target — **PENDING**.
- A later fresh 51-migration clean replay and residue certification —
  **PENDING**.

---

## 7. Gate statuses (unchanged by this repair)

| Item | Status |
|---|---|
| Pass 3.8.4 | NOT CERTIFIED |
| Gate 3.8 | CERTIFICATION FAILED |
| Tenant activation | BLOCKED |
| `FINDING-G38-PRIVATE-SECURITY-DEFINER-EXECUTE-SURFACE` | OPEN |

---

**Verdict:** IMPLEMENTED — TARGETED LIVE MIGRATION AND RECERTIFICATION PENDING
