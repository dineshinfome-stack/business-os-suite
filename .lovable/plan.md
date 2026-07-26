# Gate 3.6 — Multi-Tenant Lifecycle Management

SPR-MOD-001-003 · Phase 3 · Operational layer for tenants that already reached `completed` provisioning.

No provisioning code is touched. The lifecycle layer never imports the orchestrator, provider, repository, retry/rollback engines, migration runner or seed runner.

## Phase 1 — Discovery summary (already performed, read-only)

What exists today:

- **Lifecycle states**: Postgres enum `public.tenant_lifecycle_state` = `created | active | suspended | archived`, enforced by `private.fn_assert_lifecycle_transition` plus RPCs `fn_activate_tenant`, `fn_suspend_tenant`, `fn_archive_tenant`. Mirrored in pure TS at `src/lib/tenants/lifecycle.ts`.
- **Tenant columns**: `slug, display_name, region, default_locale, timezone, plan_tier, lifecycle_state, created_at, activated_at, suspended_at, archived_at`, plus opaque provisioning handles.
- **Audit**: `public.audit_logs` written through `logTenantEventFn` with actions `tenant.created/activated/suspended/archived/updated`. Append-only in practice.
- **Events**: `buildTenantEvent` envelope (ADR-051) in `src/lib/tenants/events.ts`.
- **Notifications**: `src/lib/notifications/` — type registry plus `service.functions.ts`.
- **Permissions**: `PLATFORM_TENANT_READ/CREATE/UPDATE/ACTIVATE/SUSPEND/ARCHIVE` exist; maintenance, restore, deletion-scheduling and delete permissions do not.
- **UI**: `/platform/tenants` (list + create dialog) and `/platform/tenants/$tenantId`. The provisioning module at `src/modules/platform/provisioning/` is the pattern to mirror (subnav layout, DTO `types/v1`, query-keys with documented invalidation sets, boundary tests).

Gaps this gate closes: three new lifecycle states, six new transitions, deletion-scheduling metadata, a lifecycle facade, a lifecycle dashboard with a unified timeline, and the matching permissions.

## Phase 2 — Lifecycle state machine

States: `created → active → suspended → maintenance → archived → pending_deletion → deleted`.

| Transition | Command | Permission | From | Blocked when | Reason required | Reversible |
|---|---|---|---|---|---|---|
| Activate | `activateTenant` | `platform.tenant.activate` | created, suspended, maintenance | pending_deletion, deleted | no | — |
| Suspend | `suspendTenant` | `platform.tenant.suspend` | active, maintenance | pending_deletion, deleted, archived | yes | yes (activate) |
| Enter maintenance | `enterMaintenance` | `platform.tenant.maintenance` | active | deleted, pending_deletion, archived | yes | yes |
| Exit maintenance | `exitMaintenance` | `platform.tenant.maintenance` | maintenance | — | no | — |
| Archive | `archiveTenant` | `platform.tenant.archive` | active, suspended, maintenance | already archived, running provisioning job | yes | yes (restore) |
| Restore | `restoreTenant` | `platform.tenant.restore` | archived | — | no | — |
| Schedule deletion | `scheduleDeletion` | `platform.tenant.delete_schedule` | archived | not archived | yes | yes (cancel) |
| Cancel deletion | `cancelDeletion` | `platform.tenant.delete_schedule` | pending_deletion | — | yes | — |
| Delete (soft) | `deleteTenant` | `platform.tenant.delete` | pending_deletion | active users, running provisioning job, active subscription | yes | no within this gate |

No implicit transitions. Every transition writes an audit record and emits a lifecycle notification.

### Deleted vs. Purged — explicit distinction

`deleted` is a **lifecycle state**; purge is a **future operational process**, not a state in this gate.

| | `deleted` (Gate 3.6) | Purge (deferred) |
|---|---|---|
| Meaning | Logically deleted; tenant is inaccessible to all users | Physical destruction of tenant data and cloud resources |
| Tenant row | Retained | Removed or anonymized per retention policy |
| Audit, timeline, provisioning history | Fully preserved | Handled by the retention policy |
| Supabase project / tenant database | Untouched | Destroyed under an audited workflow |
| Recoverable | Yes, at the database level, until purge runs | No |
| Trigger | Operator command | Separate audited purge workflow in a later gate |

`deleteTenant` sets `lifecycle_state = 'deleted'` and records `deleted_at`, `deleted_by`, `deletion_reason`, `purge_after` (default +90 days). `purge_after` is a marker only — nothing in this gate acts on it. The lifecycle matrix document will carry this table verbatim so Gate 3.7/3.8 inherits an unambiguous definition.

## Phase 3 — Database migration

One additive migration:

- Extend `public.tenant_lifecycle_state` with `maintenance`, `pending_deletion`, `deleted`.
- Add to `public.tenants` (all nullable): `maintenance_started_at`, `maintenance_reason`, `deletion_scheduled_at`, `deletion_scheduled_by`, `deleted_at`, `deleted_by`, `deletion_reason`, `purge_after`.
- Rewrite `private.fn_assert_lifecycle_transition` to the matrix above — a superset of today's rules, so existing transitions keep working.
- New `private.fn_*` RPCs with `public` SECURITY DEFINER wrappers: `fn_enter_maintenance`, `fn_exit_maintenance`, `fn_restore_tenant`, `fn_schedule_tenant_deletion`, `fn_cancel_tenant_deletion`, `fn_delete_tenant` — each idempotent, each raising `insufficient_privilege` for non-platform-admin callers, each returning `{tenant_id, from_state, already_*}` like the existing ones.
- Seed the four new permission keys into `public.permissions` and grant them to the platform admin role.

Server-side validation lives in these RPCs so the UI cannot bypass it.

### Permission consistency checklist

The four new keys (`platform.tenant.maintenance`, `.restore`, `.delete_schedule`, `.delete`) must land in all five places, verified by test:

1. `public.permissions` seed rows + `role_permissions` grants (migration).
2. `src/lib/generated/permission-keys.ts` via the existing generator script.
3. Route guards on the lifecycle subtree and detail panel.
4. `Can` wrappers on every action control.
5. RBAC documentation and the Gate 3.6 lifecycle matrix.

## Phase 4 — Lifecycle facade (`src/lib/tenant-lifecycle/`)

Independent of provisioning, mirroring the CQRS shape proven in `provisioning-admin`:

- `lifecycle.ts` — pure state machine: states, transition table, `canTransition`, `assertTransition`, `requiredPermission`, `requiresReason`, `validate(context)` for the precondition rules. No I/O.
- `query-service.server.ts` — lifecycle detail, unified timeline, metrics, server-side search and filters (state, region, plan tier, archived, maintenance, pending deletion), pagination.
- `command-service.server.ts` — the nine commands, each: validate → call RPC → write audit → emit notification → return a DTO result.
- `queries.functions.ts` / `commands.functions.ts` — thin `createServerFn` wrappers under `requireSupabaseAuth`.
- `types/v1/index.ts` — pinned DTOs (`TenantLifecycleDetailDTO`, `TenantTimelineEntryDTO`, `TenantLifecycleMetricsDTO`, `TenantLifecycleListRowDTO`), re-exported flat.

## Phase 5 — Dashboard and routes

New subtree `/platform/tenants/lifecycle` guarded by `PLATFORM_TENANT_READ`, subnav: Overview · Directory · Maintenance · Deletion queue.

- `route.tsx` — permission guard + subnav (mirrors the provisioning layout).
- `index.tsx` — metrics: total active, suspended, maintenance, archived, pending deletion, deleted, average tenant age, recently archived, deletion queue depth.
- `directory.tsx` — server-side search and filters with lifecycle badges and row actions.
- `maintenance.tsx` — tenants in maintenance with elapsed duration and reason.
- `deletion.tsx` — pending-deletion queue ordered by `purge_after`, with cancel action.
- Tenant detail gains a Lifecycle panel: state badge, action bar, unified timeline.

**Displayed data — derived only from authoritative existing sources**: tenant name/code/slug, lifecycle state, provisioning status and history, region, plan tier, created/updated, company count, branch count, user count, last activity from audit logs, last lifecycle change, scheduled-deletion details. Storage usage, database size, current version and last login are **not** rendered — no placeholders, no speculative columns; they are listed as deferred items.

Components in `src/modules/platform/tenant-lifecycle/components/`: `LifecycleBadge`, `LifecycleActionBar`, `LifecycleDialog` (confirmation + required reason + impact summary + blocked-reason display), `TenantTimeline`, `LifecycleMetricCards`, `TenantLifecycleTable`, `LifecycleFilterPanel`, `States`.

## Phase 6 — Audit, notifications, timeline

- Audit: extend `TENANT_ACTIONS` with `tenant.maintenance_started/ended`, `tenant.restored`, `tenant.deletion_scheduled`, `tenant.deletion_cancelled`, `tenant.deleted`. Each record carries timestamp, actor, reason, old state, new state, correlation id, tenant id. Insert-only — history is never overwritten.
- Notifications: new lifecycle types in the existing registry, emitted through the existing service. No second event system.
- Timeline: chronological merge of provisioning history (read through the existing provisioning **query facade**, never its internals) and lifecycle audit events, de-duplicated by `(source, id)`.

## Phase 7 — Tests

New suites, offline against in-memory fakes:

- `lifecycle.test.ts` — full transition matrix, illegal transitions, idempotency, reason requirements, deleted-is-terminal.
- `validation.test.ts` — delete/archive/suspend/maintenance/restore preconditions.
- `command-integration.test.tsx` — each action calls the right command with the right payload; cache invalidation sets.
- `audit.test.ts` / `notifications.test.ts` — exactly one immutable audit record and one notification per transition.
- `timeline.test.ts` — ordering, no duplicates, provisioning + lifecycle merge.
- `boundaries.test.ts` — see Phase 8.
- `permissions.test.tsx`, `dialogs.test.tsx`, `a11y.test.tsx`, `search-filters.test.tsx`, `routes.test.ts` — permission gating and unauthorized access, dialog reason enforcement, keyboard/ARIA, server-side query wiring, route registration.

Full suite must stay green (currently 412 passing).

## Phase 8 — Architecture Integrity Validation

An executable gate check (`architecture-integrity.test.ts`) plus a git-diff review, failing the gate on drift:

- ✓ No modification to provisioning lifecycle states or transitions.
- ✓ No modification to the orchestrator, executor, or step runner.
- ✓ No modification to the provider or provider resolver.
- ✓ No modification to the retry engine, rollback engine, migration runner, or seed runner.
- ✓ No modification to the provisioning repository, data client, or DTO layer.
- ✓ `src/lib/tenant-lifecycle/**` imports no provisioning internals — only the provisioning **query facade** for timeline reads.
- ✓ `src/modules/platform/tenant-lifecycle/**` imports only the lifecycle facade, DTOs and view models — no Supabase SDK, no database client, no server-only modules.
- ✓ All 412 pre-existing tests still pass, unmodified.

The completion report records the diff scope proving provisioning files were untouched.

## Phase 9 — Documentation

- `docs/60-engineering/PHASE3_GATE36_LIFECYCLE_MATRIX.md` — states, transitions, permissions, validation rules, audit events, notifications, reversibility, and the Deleted-vs-Purged table.
- `docs/60-engineering/PHASE3_GATE36_COMPLETION_REPORT.md` — files created/modified, commands, routes, components, tests, test count, known limitations, deferred items, architecture integrity result.

## Known limitations / deferred

- Purge execution (destroying Supabase projects and tenant databases after `purge_after`) — marker only here.
- Storage usage, database size, current version, last login, subscription telemetry — no producer exists; deferred with their collectors.
- Automatic transition out of `pending_deletion` on schedule — operator-initiated only for now.

## Stop rule

Work stops after documentation and a green suite. Gate 3.7 is not started.
