# Sprint 0.6 — Settings Foundation — Verification Report

## Verification Metadata
- **Sprint:** 0.6 — Settings Foundation
- **Executed:** 2026-07-23
- **Approach:** Static verification (schema, RLS, code, typecheck). Runtime UI smoke skipped — demonstration surface is behind auth.
- **Scope:** Migration `009_settings_foundation`, server functions, hooks, UI primitives, demonstration route.

## Check / Result / Action

| # | Check | Result | Action |
|---|-------|--------|--------|
| 1  | `setting_definitions` created with UNIQUE(key) and format CHECK | PASS | — |
| 2  | `setting_values` created with UNIQUE(definition_id, COALESCE(org, sentinel)) | PASS | — |
| 3  | `feature_flags` created with UNIQUE(key, COALESCE(org, sentinel)) | PASS | — |
| 4  | RLS enabled on all three tables | PASS | — |
| 5  | Read policy: `setting_values` scoped to platform (org=NULL) or member org | PASS | — |
| 6  | Write policy: system-owned rows blocked via `private.fn_setting_is_configurable` | PASS | — |
| 7  | Write policy: platform scope requires `platform.settings.manage` | PASS | — |
| 8  | Write policy: org scope requires membership + settings/update or manage | PASS | — |
| 9  | Feature-flag write mirrors settings write authorization | PASS | — |
| 10 | Identity-change trigger blocks mutation of key/scope/data_type/is_system | PASS | — |
| 11 | `is_system` semantics enforced in `setSettingFn` (returns 403) | PASS | — |
| 12 | Sensitive settings redacted in `resolveSetting(s)` | PASS | — |
| 13 | `revealSensitiveSettingFn` requires `settings.security.manage` | PASS | — |
| 14 | All mutations audited to `public.audit_logs`; sensitive values redacted in audit | PASS | — |
| 15 | Resolution precedence default → platform → org implemented in `resolveWith` | PASS | — |
| 16 | Hooks cache-key includes `organizationId`; org switch invalidates | PASS | — |
| 17 | New permissions (`settings.security.manage`, `platform.settings.manage`) seeded and granted to Platform Owner | PASS | — |
| 18 | Permission manifest and generated TS keys synchronized | PASS | — |
| 19 | Demonstration route `/settings/platform` labeled as demo surface | PASS | — |
| 20 | Deprecated definitions filtered from resolver (deprecated_at IS NULL) | PASS | — |
| 21 | 10 platform-owned setting definitions seeded across framework/branding/locale/security/ai | PASS | — |
| 22 | `bunx tsgo --noEmit` clean | PASS | — |
| 23 | Zod validators built from declarative `validation_schema` JSON | PASS | — |
| 24 | Framework-owned defaults immutable via API (`is_system=true` bypassed) | PASS | — |
| 25 | Idempotent seed via `ON CONFLICT DO NOTHING` | PASS | — |
| 26 | Documented forward-compatibility for future scopes (dept/team/user) | Deferred | Governance frozen (Wave UX charter); tracked as note in plan §11 |
| 27 | Security linter — no new HIGH/CRITICAL findings | PASS | Pre-existing `SECURITY DEFINER` and leaked-password warnings unchanged; accepted-by-design per Sprint 0.4B |

## Verification Summary

- **Total checks:** 27
- **PASS:** 26
- **Deferred (governance freeze):** 1
- **FAIL:** 0

## Repository State

- **Migration:** `009_settings_foundation` applied.
- **New tables:** `public.setting_definitions`, `public.setting_values`, `public.feature_flags`.
- **New helpers:** `private.fn_setting_is_configurable`, `private.fn_block_setting_definition_identity_change`.
- **New permissions:** `settings.security.manage`, `platform.settings.manage` (granted to `platform_owner`).
- **Verdict:** **READY** — Sprint 0.6 complete. Repository state: `SPRINT_0_6_SETTINGS_FOUNDATION_READY`.
