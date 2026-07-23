# SPR-MOD-001-001 — Tenancy Foundation Backend & UI Report

- **Sprint:** SPR-MOD-001-001
- **Module:** MOD-001 Platform Administration
- **Date:** 2026-07-23
- **Status:** IMPLEMENTED (backend + web UI); pending Architecture Board sign-off

## Scope delivered this pass

Building on Migrations A/B/C (schema, RPCs, permissions) previously approved.

### Backend
- `src/lib/tenants/lifecycle.ts` — pure state-machine mirror of `private.fn_assert_lifecycle_transition`.
- `src/lib/tenants/slug.ts` — normalization + format guard matching `private.fn_normalize_slug`.
- `src/lib/tenants/events.ts` — `tenant.*` ADR-051 envelope builders (JSON-safe `data`).
- `src/lib/tenants/audit.ts` — `logTenantEventFn` (RLS-scoped writer).
- `src/lib/tenants/tenants.functions.ts` — `listTenants`, `getTenant`, `createTenant`, `activateTenant`, `suspendTenant`, `archiveTenant`.
- `src/hooks/tenants/useCurrentTenant.ts` — read-only current-tenant hook.

Lifecycle mutations delegate authorization + transition to the DB RPCs (`private.fn_activate_tenant` / `fn_suspend_tenant` / `fn_archive_tenant`), which enforce `platform_admin`, the transition matrix, and idempotency via `SELECT … FOR UPDATE`. Duplicate calls return `already_active|_suspended|_archived: true` and the server function skips both audit + event emission.

### Permissions & navigation
- `src/lib/generated/permission-keys.ts` — added `platform.tenant.{read,create,activate,suspend,archive}`.
- `src/lib/navigation/registry.ts` — new node `administration.platform.tenants` → `/platform/tenants`, gated by `platform.tenant.read`.

### Web UI
- `src/routes/_authenticated/platform/tenants/index.tsx` — DataGrid list with slug link, lifecycle badge, and `<Can>`-gated "New tenant" dialog.
- `src/routes/_authenticated/platform/tenants/$tenantId.tsx` — detail card + lifecycle action buttons; buttons disabled per `canTransition()` and gated by per-action `<Can>`.

### Docs
- `docs/70-events/tenant-events.md` — event catalog + transition matrix.
- `docs/70-api/tenants.md` — API-001 endpoint ↔ server function map.

## Verification matrix

| # | Requirement | Evidence | Result |
|---|---|---|---|
| 1 | Typecheck clean | `bunx tsgo --noEmit` exit 0 | PASS |
| 2 | Lifecycle transition matrix enforced | `src/lib/tenants/__tests__/lifecycle.test.ts` — 7 tests | PASS |
| 3 | Slug normalization mirrors SQL | `src/lib/tenants/__tests__/slug.test.ts` — 4 tests | PASS |
| 4 | RBAC keys registered | grep hit in `permission-keys.ts` | PASS |
| 5 | Nav node gated by `platform.tenant.read` | `registry.ts` L188–201 | PASS |
| 6 | Idempotent activate/suspend/archive paths | `tenants.functions.ts` skips audit + event when `already_*` | PASS |
| 7 | Audit envelope uses `actor_id` + `new_values` | `audit.ts` | PASS |
| 8 | Serializable RPC return shape | `TenantEventData` restricted to JSON primitives | PASS |
| 9 | UI action buttons respect lifecycle | `canTransition(state, target)` disables illegal transitions client-side | PASS |
| 10 | Platform Admin route SSR-safe | Placed under `_authenticated/`; managed layout gates auth | PASS |

## Deferred / accepted

- **R-074** Leaked Password Protection Disabled — accepted risk (documented in `docs/01-master/risk-register.md`).
- Mobile surface (MOB-001 tenant screens) — out of scope for SPR-MOD-001-001.
- Bulk import / SCIM provisioning — out of scope.

## Next

Architecture Board sign-off of tasks SIP-001…SIP-023, then advance to SPR-MOD-001-002 (Branches & Financial Years UI).
