---
document: Event Catalog Entry
module_id: MOD-001
sprint_id: SPR-MOD-001-001
version: 1.0.0
lifecycle_state: Published
---

# `tenant.*` Events

Registered per SIP-016. Envelope conforms to ADR-051.

| Event | When | Emitted by |
|---|---|---|
| `tenant.created` | New tenant row inserted in `created` state | `createTenant` |
| `tenant.activated` | Tenant transitions `created → active` (one-shot; idempotent retry emits nothing) | `activateTenant` |
| `tenant.suspended` | Tenant transitions `active → suspended` | `suspendTenant` |
| `tenant.archived` | Tenant transitions `active|suspended → archived` | `archiveTenant` |

## Envelope

```json
{
  "event": "tenant.activated",
  "version": 1,
  "emitted_at": "2026-07-23T17:00:00.000Z",
  "tenant_id": "…uuid…",
  "actor_id": "…uuid…",
  "correlation_id": "…optional…",
  "data": {
    "from_state": "created",
    "to_state": "active",
    "organization_id": "…uuid…",
    "branch_id": "…uuid…",
    "financial_year_id": "…uuid…"
  }
}
```

## Transition matrix

| From | To | Allowed |
|---|---|---|
| created | active | ✅ |
| active | suspended | ✅ |
| suspended | active | ✅ |
| active | archived | ✅ |
| suspended | archived | ✅ |
| archived | * | ❌ (terminal) |
| same → same | | ❌ (no-op) |

Anything else is rejected by `private.fn_assert_lifecycle_transition` with
`check_violation` and no event is emitted.
