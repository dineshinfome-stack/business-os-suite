---
id: ROLE_MODEL
title: Role Model
version: 1.0
status: PUBLISHED
sprint: 0.5
last_updated: 2026-07-22
---

# Role Model

Wave 0 system roles. `rank` is presentation/tiebreak only — there is **no implicit inheritance**. Effective permissions are exactly the union of `role_permissions` rows for the roles a user holds.

| Key | Name | Scope | Rank | Default bindings |
|---|---|---|---|---|
| `platform_owner` | Platform Owner | platform | 10 | all permissions |
| `platform_admin` | Platform Admin | platform | 20 | all except `platform.users.delete` |
| `org_owner` | Organization Owner | organization | 30 | `platform.roles.view`, `platform.roles.assign`, `settings.general.view`, `settings.general.update`, `audit.logs.view` |
| `administrator` | Administrator | organization | 40 | same as `org_owner` |
| `manager` | Manager | organization | 50 | `settings.general.view`, `audit.logs.view` |
| `supervisor` | Supervisor | organization | 60 | `settings.general.view` |
| `employee` | Employee | organization | 70 | `settings.general.view` |
| `read_only` | Read Only | organization | 80 | `settings.general.view` |

## Scope rules

- **platform** roles: `user_roles.organization_id` MUST be `NULL`. Grants apply everywhere.
- **organization** roles: `user_roles.organization_id` MUST reference the org the grant applies to. Grants do not leak to other orgs.

## Assignment

- All grants are timestamped (`granted_at`) and optionally scoped by `expires_at`.
- Grants are performed by server functions guarded by `requirePermission('platform.roles.assign')`.
- `platform_owner` is bootstrapped deterministically — see RBAC_STANDARD §6.
