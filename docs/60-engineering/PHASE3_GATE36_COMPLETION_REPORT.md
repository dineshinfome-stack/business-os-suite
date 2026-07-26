# Phase 3 — Gate 3.6 · Multi-Tenant Lifecycle Management

**Sprint:** SPR-MOD-001-003
**Status:** Implemented
**Repository state:** `PHASE3_GATE36_LIFECYCLE_READY`
**Tests:** 428 passing (16 new)

## 1. Scope

Operational lifecycle management for already-provisioned tenants. Provisioning
is untouched: no orchestrator, repository, provider, retry, rollback, migration
runner, seed runner or dashboard module was modified.

## 2. State machine

States (7): `created`, `active`, `suspended`, `maintenance`, `archived`,
`pending_deletion`, `deleted`.

```text
created ──▶ active ──▶ suspended ──▶ active
              │  ▲         │
              ▼  │         ▼
        maintenance ──▶ archived ──▶ active (restore)
                             │
                             ▼
                     pending_deletion ──▶ archived (cancel)
                             │
                             ▼
                          deleted   (terminal, soft)
```

`deleted` is a **logical** state. Physical removal (**purge**) is deferred and
out of scope: the row carries `purge_after` for a future purge worker.

The matrix exists in exactly two places and they are kept identical:
`private.fn_assert_lifecycle_transition` (enforcer) and
`src/lib/tenant-lifecycle/lifecycle.ts` (shared UI/server truth).

## 3. Operations

| Operation | From → To | Permission | Reason | Idempotent flag |
|---|---|---|---|---|
| Enter maintenance | active → maintenance | `platform.tenant.maintenance` | required | `already_in_maintenance` |
| Exit maintenance | maintenance → active | `platform.tenant.maintenance` | — | `already_active` |
| Restore | archived → active | `platform.tenant.restore` | — | `already_active` |
| Schedule deletion | archived → pending_deletion | `platform.tenant.delete_schedule` | required | `already_scheduled` |
| Cancel deletion | pending_deletion → archived | `platform.tenant.delete_schedule` | required | `already_cancelled` |
| Delete (soft) | pending_deletion → deleted | `platform.tenant.delete` | required | `already_deleted` |

Deletion pre-conditions enforced in the database: zero active organization
members and zero in-flight provisioning jobs.

## 4. Data model additions

`public.tenants`: `maintenance_started_at`, `maintenance_reason`,
`deletion_scheduled_at`, `deletion_scheduled_by`, `deleted_at`, `deleted_by`,
`deletion_reason`, `purge_after` (+ partial index on `purge_after`).

All changes are additive; no column or constraint was dropped.

## 5. Code map

| Path | Role |
|---|---|
| `src/lib/tenant-lifecycle/lifecycle.ts` | Pure state machine, operation specs, presentation tokens |
| `src/lib/tenant-lifecycle/timeline.ts` | Pure merge of lifecycle audit + provisioning history |
| `src/lib/tenant-lifecycle/lifecycle.functions.ts` | Server functions (RPC wrappers + audit writes) |
| `src/modules/platform/tenant-lifecycle/components/` | `LifecycleActions`, `LifecycleTimeline` |
| `src/routes/_authenticated/platform/tenants/lifecycle.tsx` | Lifecycle console |

## 6. Audit trail

New audit actions on `entity_type = 'tenant'`: `tenant.maintenance_entered`,
`tenant.maintenance_exited`, `tenant.restored`, `tenant.deletion_scheduled`,
`tenant.deletion_cancelled`, `tenant.deleted`. Idempotent no-op calls write no
audit record.

## 7. Architecture integrity

- No file under `src/lib/provisioning/**` or
  `src/modules/platform/provisioning/**` was modified.
- `lifecycle.functions.ts` imports no provisioning module; provisioning history
  is read as plain rows and degrades to an empty list on error, so the timeline
  never fails because of provisioning.
- Authorization is enforced by `private.fn_is_platform_admin()` inside every
  RPC; the UI gating is convenience only.

## 8. Deferred

- Physical purge worker driven by `purge_after`.
- Cross-tenant bulk lifecycle operations.
