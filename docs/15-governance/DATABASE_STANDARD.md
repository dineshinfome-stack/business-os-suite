# Database Standard

**Status:** Ratified — Sprint 0.2 (Database Foundation)
**Scope:** Every schema object in `public` created from Sprint 0.2 onward.
**Precedent:** Overrides ad-hoc conventions. Any deviation requires an ADR.

---

## 1. Naming

- All identifiers are `snake_case`.
- **Table names are plural** — `profiles`, `user_roles`, `audit_logs`, `companies`, `branches`.
- **Enum type names are singular** — `app_role`, `document_status`.

### 1.1 Object naming convention

| Object kind          | Pattern                                | Example                          |
| -------------------- | -------------------------------------- | -------------------------------- |
| Function             | `fn_<purpose>`                         | `private.fn_has_role`, `fn_set_updated_at` |
| Trigger              | `trg_<table>_<event>`                  | `trg_profiles_updated_at`        |
| Policy               | `<table>_<audience>_<action>`          | `profiles_owner_select`          |
| Index                | `idx_<table>_<columns>`                | `idx_audit_logs_actor_id`        |
| Unique constraint    | `uq_<table>_<columns>`                 | `uq_user_roles_user_role`        |

---

## 2. Repository Table Standard (all application tables)

Applies to **every** table in `public` — platform tables (`profiles`, `user_roles`, `audit_logs`) and future business tables alike.

```text
id           uuid        PK, DEFAULT gen_random_uuid()
created_at   timestamptz NOT NULL DEFAULT now()
created_by   uuid        NULL  REFERENCES auth.users(id)
updated_at   timestamptz NOT NULL DEFAULT now()
updated_by   uuid        NULL  REFERENCES auth.users(id)
deleted_at   timestamptz NULL
deleted_by   uuid        NULL  REFERENCES auth.users(id)
```

- ID strategy: `gen_random_uuid()` directly (no wrapper helper).
- `updated_at` is maintained by the shared `fn_set_updated_at()` trigger, attached as `trg_<table>_updated_at`.
- `created_by` / `updated_by` are nullable at the DB level; the application layer populates them from Sprint 0.3 onward.
- Soft-delete columns are always present; per-module filtering (`WHERE deleted_at IS NULL`) is enforced by the owning module.

### 2.1 `audit_logs` exception

`audit_logs` carries the soft-delete columns for schema consistency, but it is **append-only**. `deleted_at` / `deleted_by` MUST NOT be written during normal operation. Purging is governed by the future retention/archival strategy, not by soft delete. This exception is documented in `COMMENT ON TABLE public.audit_logs`.

---

## 3. Timestamp semantics

- `created_at` — when the DB row itself was inserted.
- `occurred_at` (audit only) — when the audited real-world event happened.

The two values may coincide. Audit consumers MUST use `occurred_at` for event chronology.

---

## 4. Function volatility

Every new function MUST declare its volatility explicitly. Do not rely on the `VOLATILE` default.

| Volatility  | Use for                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------- |
| `IMMUTABLE` | Pure functions of their arguments (no DB reads, no `now()`, no `random`).                           |
| `STABLE`    | Read-only lookup helpers within a single statement (e.g. `private.fn_has_role`).                    |
| `VOLATILE`  | Only when the function mutates state, calls `now()` outside a `DEFAULT`, or depends on session state. |

Trigger functions that return `NEW` (e.g. `fn_set_updated_at`, `fn_handle_new_auth_user`) are `VOLATILE`.

---

## 5. Index guidance

- **Foreign keys** SHOULD be indexed unless there is a documented reason not to.
- **Columns used in RLS predicates** MUST be reviewed at migration time; if the predicate filters a non-PK column (e.g. `user_id`, `org_id`), add a supporting index.
- **Unique constraints** rely on Postgres's automatic supporting index — do not add a duplicate `idx_*` on the same columns.
- **JSONB audit columns** (`old_values`, `new_values`) are not indexed by default; add GIN indexes only when a concrete query need appears.

---

## 6. Documentation (required)

- `COMMENT ON TABLE` — every table.
- `COMMENT ON FUNCTION` — every function.
- `COMMENT ON TYPE` — every enum type (including `app_role`).
- `COMMENT ON TRIGGER` — when the trigger's purpose is not obvious from its function name.
- `COMMENT ON COLUMN` — every non-obvious column.

---

## 7. Security

- RLS enabled on every `public` table.
- A GRANT block MUST immediately follow every `CREATE TABLE`.
- Default grantees: `authenticated`, `service_role`. Grant `anon` only when a matching anon-scoped policy exists.
- Roles are never stored on `profiles`. Use `user_roles` + `fn_has_role()` (SECURITY DEFINER, `SET search_path = public`).

---

## 8. Audit rows

Audit records carry both **`old_values jsonb`** and **`new_values jsonb`**. Do not compute a `diff` at write time.

---

## 9. Migration file structure

Every migration file begins with the following header comment:

```sql
-- =============================================================================
-- Migration:     <NNN>_<slug>
-- Sprint:        <e.g. 0.2>
-- Purpose:       <one-line description>
-- Dependencies:  <previous migration IDs, or "none">
-- Rollback:      <inline reverse SQL, or reference to a rollback block below>
-- Author:        <name/handle>
-- Date:          <YYYY-MM-DD>
-- =============================================================================
```

The full reverse SQL block appears at the bottom of the file inside a `-- ROLLBACK` comment section. Rollback SQL is **reviewed for completeness only** during routine verification; actual execution is skipped unless a dedicated rollback test environment exists.

Migration body ordering, per table:

1. `CREATE TABLE`
2. `GRANT`
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
4. `CREATE POLICY`
5. `CREATE INDEX`
6. `COMMENT ON ...`

---

## 10. Extensions

Baseline: **`pgcrypto` only** (for `gen_random_uuid()`). Additional extensions are introduced only in the sprint that first requires them, with an ADR.

---

## 11. Auth-schema boundary

Triggers may reference `auth.users` (Supabase-managed) but MUST NOT create, modify, or drop any object inside the `auth` schema. All owned objects live in `public`.

---

## 12. Forward notes (not implemented in Sprint 0.2)

- **Tenant-scoped roles.** Once organizations/companies/branches exist, `user_roles` will likely gain an `org_id` scope. Added in the RBAC sprint (0.5).
- **Data-driven roles.** If business modules require dynamic roles, the `app_role` enum may migrate to a `roles` table + `role_id` FK model.
- **Audit retention / partitioning.** `audit_logs` retention, archival, and partitioning strategy will be defined in a later infrastructure sprint.
