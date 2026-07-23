---
id: SPRINT_0_7A_SECURITY_DEFINER_HARDENING_REPORT
title: Sprint 0.7A — SECURITY DEFINER Hardening Report
status: PUBLISHED
owner: Platform Security
created: 2026-07-23
scope: Database (SECURITY DEFINER functions & EXECUTE grants)
supersedes_section_of: SPRINT_0_4B_SECURITY_HARDENING_REPORT.md
---

# Sprint 0.7A — SECURITY DEFINER Hardening Report

## 1. Objective

Eliminate Supabase linter warnings **0028** (`anon_security_definer_function_executable`) and **0029** (`authenticated_security_definer_function_executable`) by auditing every `SECURITY DEFINER` function, revoking unnecessary EXECUTE grants, and normalizing `search_path`. No behavioral or schema changes.

## 2. Pre-Remediation Linter State

```
WARN 0028 Public Can Execute SECURITY DEFINER Function
WARN 0029 Signed-In Users Can Execute SECURITY DEFINER Function
WARN      Leaked Password Protection Disabled  (Accepted Risk R-074)
```

## 3. Inventory (13 functions)

| Schema | Function | Kind | Retained? | Rationale |
|---|---|---|---|---|
| public | `rls_auto_enable()` | event_trigger | Yes | Fires on DDL; never called by clients. |
| private | `fn_handle_new_auth_user()` | trigger | Yes | `auth.users` insert trigger. |
| private | `fn_block_setting_definition_identity_change()` | trigger | Yes | Guard. |
| private | `fn_block_system_row_mutation()` | trigger | Yes | Guard. |
| private | `fn_bootstrap_platform_owner(text)` | maintenance | Yes | One-time seed; service_role only. |
| private | `fn_has_role(uuid, app_role)` | RLS helper | Yes | Prevents RLS recursion. |
| private | `fn_is_org_member(uuid, uuid)` | RLS helper | Yes | Same. |
| private | `fn_org_role(uuid, uuid)` | RLS helper | Yes | Same. |
| private | `fn_setting_is_configurable(uuid)` | RLS helper | Yes | Same. |
| private | `fn_user_has_permission(uuid, uuid, text)` | RBAC lookup | Yes | Same. |
| private | `fn_user_has_any(uuid, uuid, text[])` | RBAC lookup | Yes | Same. |
| private | `fn_user_has_all(uuid, uuid, text[])` | RBAC lookup | Yes | Same. |
| private | `fn_user_permissions(uuid, uuid)` | RBAC lookup | Yes | Same. |

All 13 functions are owned by `postgres`. No obsolete or downgradable functions were identified: every retained function is either a trigger (fires without EXECUTE-grant surface) or an RLS-recursion-safe helper that must remain SECURITY DEFINER.

## 4. Actions Applied (migration `011_security_definer_hardening`)

| Function | Action | Result |
|---|---|---|
| `public.rls_auto_enable()` | REVOKE EXECUTE FROM PUBLIC, anon, authenticated, service_role | PASS |
| `private.fn_user_has_permission` | REVOKE EXECUTE FROM PUBLIC | PASS |
| `private.fn_user_has_any` | REVOKE EXECUTE FROM PUBLIC | PASS |
| `private.fn_user_has_all` | REVOKE EXECUTE FROM PUBLIC | PASS |
| `private.fn_user_permissions` | REVOKE EXECUTE FROM PUBLIC | PASS |
| `private.fn_has_role` | `SET search_path = pg_catalog, public` | PASS |
| `private.fn_is_org_member` | `SET search_path = pg_catalog, public` | PASS |
| `private.fn_org_role` | `SET search_path = pg_catalog, public` | PASS |
| `private.fn_handle_new_auth_user` | `SET search_path = pg_catalog, public` | PASS |

Retained grants (least privilege):
- `authenticated` on all RLS/RBAC helpers (required by policies executed under user session).
- `service_role` on `fn_bootstrap_platform_owner` and RBAC helpers.
- `postgres` on all (owner).
- No grants for `anon` on any private function.

## 5. Post-Remediation Linter State

```
WARN Leaked Password Protection Disabled  (Accepted Risk R-074 — unchanged)
```

Warnings 0028 and 0029: **RESOLVED**.

## 6. Regression Evidence

| Check | Result |
|---|---|
| `bunx tsgo --noEmit` | PASS (exit 0) |
| `bunx vitest run` | PASS (2 files, 8 tests) |
| Auth (email/password sign-in) | Unaffected (trigger-only helper) |
| Sidebar / RBAC filtering | Unaffected (`authenticated` grants retained) |
| Org switcher / tenancy | Unaffected (`fn_is_org_member`, `fn_org_role` retained) |
| Settings resolution | Unaffected (`fn_setting_is_configurable` retained) |

## 7. Exit Criteria

- [x] Every SECURITY DEFINER function reviewed and classified.
- [x] Unnecessary EXECUTE grants revoked.
- [x] Retained functions have explicit `search_path`, `postgres` owner, least-privilege grants.
- [x] Linter warnings 0028 & 0029 cleared.
- [x] Typecheck + tests PASS.
- [x] Accepted Risk R-074 (Leaked Password Protection) unchanged and still tracked.

**Verdict:** PASS — supersedes the "Accepted by Design" classification of SECURITY DEFINER warnings in `SPRINT_0_4B_SECURITY_HARDENING_REPORT.md` §Findings.
