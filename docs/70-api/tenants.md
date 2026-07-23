---
document: API Surface
module_id: MOD-001
sprint_id: SPR-MOD-001-001
version: 1.0.0
lifecycle_state: Published
---

# Tenants API — Server Function Mapping

The BusinessOS stack uses TanStack `createServerFn` as its RPC surface. The
Sprint API-001 spec endpoints map 1:1 to the functions in
`src/lib/tenants/tenants.functions.ts`.

| API-001 endpoint | Server function | Permission (implicit via RPC role check) |
|---|---|---|
| `GET  /platform/tenants`               | `listTenants`     | `platform.tenant.read` |
| `GET  /platform/tenants/{id}`          | `getTenant`       | `platform.tenant.read` |
| `POST /platform/tenants`               | `createTenant`    | `platform.tenant.create` |
| `POST /platform/tenants/{id}/activate` | `activateTenant`  | `platform.tenant.activate` |
| `POST /platform/tenants/{id}/suspend`  | `suspendTenant`   | `platform.tenant.suspend` |
| `POST /platform/tenants/{id}/archive`  | `archiveTenant`   | `platform.tenant.archive` |

Lifecycle mutations are authorized in the database (`private.fn_is_platform_admin()`
gate inside each RPC). Web UI additionally gates action buttons via `<Can>`.
