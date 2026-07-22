# Wave 0 — Engineering Foundation (Phase 5 Kickoff) — v2

Establish shared platform infrastructure only. No business modules. Builds on Sprints 0.1–0.3 already in place.

## Current baseline (verified)

- Auth: email/password + Google OAuth, AuthContext, protected `_authenticated` layout, password reset, audit logging (`logAuthEvent`).
- DB: `profiles`, `user_roles`, `audit_logs`, `private.fn_has_role`, `fn_set_updated_at`, RLS + grants per DATABASE_STANDARD.
- UI: AppShell, sidebar, theme, shadcn wrappers, Form/DataGrid frameworks.
- Governance: DATABASE_STANDARD, PLATFORM_OBSERVABILITY_STANDARD.

## Sub-sprint sequence

Each sub-sprint runs Plan → Implement → Verify. Reports land in `docs/50-audit-reports/`.

### Sprint 0.4 — Multi-Tenancy Foundation
- Migration `006_organizations`: `organizations`, `organization_members(org_id, user_id, role, status)`, standard audit cols, RLS via `private.fn_is_org_member`, `private.fn_org_role`.
- Auto-create personal org on signup (extend `private.fn_handle_new_auth_user`).
- Server: `OrgContext`, `requireOrgContext` wrapping `requireSupabaseAuth`, org-switcher server fn.
- Client: `OrgProvider`, header org switcher.
- Governance: `docs/15-governance/TENANCY_STANDARD.md` — every business table MUST carry `organization_id` + org-scoped RLS.

### Sprint 0.5 — RBAC Foundation
- Migration `007_rbac`: `permissions(code, description)`, `role_permissions(role, permission_code)`; seed `platform.admin`, `org.manage`, `users.manage`, `audit.read`, `settings.manage`.
- `private.fn_has_permission(uid, org_id, perm_code)`.
- Server: `requirePermission(code)` middleware factory; typed permission constants.
- Client: `usePermission(code)` hook, `<Can permission=…>` gate.
- Owner/Admin/Member defaults on `organization_members`.

### Sprint 0.6 — Settings Foundation
- Migration `008_settings`: `application_settings(key, value jsonb, scope [global|org], org_id nullable)`, RLS by scope.
- Server fns: `getSetting`, `setSetting` (permission-gated).
- Seed locale, currency, timezone, date/number defaults.
- Client: `SettingsProvider` (org overrides global); wire `formatCurrency`/`formatDate`/`formatNumber` in `src/utils/`.

### Sprint 0.7 — Audit Framework (generalize)
- Extend `logAuthEventFn` pattern into generic `logAuditEvent(action, entityType, entityId, oldValues, newValues)`.
- SQL helper `private.fn_write_audit(...)` + documented trigger template in DATABASE_STANDARD.
- Client: `useAuditLog` hook; admin viewer at `/_authenticated/admin/audit` (perm `audit.read`).

### Sprint 0.8 — Notifications Foundation
- Migration `009_notifications`: `notifications(id, user_id, org_id, type, title, body, data jsonb, read_at, created_at)`, RLS `user_id = auth.uid()`.
- Server fns: `createNotification`, `markRead`, `listNotifications`.
- Enable `supabase_realtime` publication on notifications.
- Client: `NotificationBell` header component, dropdown list, unread badge, toast bridge via `notify`.

### Sprint 0.9 — File Storage Foundation
- Buckets: `avatars` (public), `org-files` (private) via storage tool.
- RLS on `storage.objects`: avatars readable public / writable by owner; org-files scoped by `organization_id` path prefix + membership check.
- Reusable `src/services/storage.ts`: `upload`, `download`, `remove`, `getSignedUrl`, `getPublicUrl`.
- Wire avatar upload into profile settings.

### Sprint 0.10 — Platform Admin Shell
- Admin section under `/_authenticated/admin/*` (permission-gated): Organizations, Members, Roles/Permissions, Settings, Audit, Notifications preview.
- Reusable primitives audit + add: `Modal`/`Dialog`, `ConfirmDialog`, `PageHeader`, `Breadcrumb` polish.
- `requirePermission` client-side `beforeLoad` mirroring server middleware.

### Sprint 0.11 — Wave 0 Verification & Closeout
- Read-only `docs/50-audit-reports/WAVE_0_ENGINEERING_FOUNDATION_VERIFICATION_REPORT.md` using Check → Evidence → Result.
- Sections: Auth, Tenancy, RBAC, Settings, Audit, Notifications, Storage, UI, DB integrity, Security (RLS coverage, grants, private-schema isolation), Toolchain.
- Verdict + Repository Baseline snapshot. On PASS → declare `WAVE_0_ENGINEERING_FOUNDATION_COMPLETE`.

### Sprint 0.12 — CI/CD & Quality Gates (new)
- GitHub Actions workflows: lint, typecheck (`tsgo --noEmit`), Vitest, Playwright smoke, build.
- Supabase migration validation step (dry-run + drift check).
- Preview deployment hook.
- Branch protection guidance + release tagging convention documented in `docs/15-governance/CICD_STANDARD.md`.
- Verification report `docs/50-audit-reports/SPRINT_0_12_CICD_VERIFICATION_REPORT.md`.

## Governance refinement (per review)

**Verification vs navigation registration are separate steps.**
- Every sub-sprint produces its verification report immediately.
- `docs/_meta.json` is updated ONLY after a sprint reaches **Verified** status and its documentation is stable. Failed / in-progress sprints do not appear in navigation.

## Out of scope

All ERP business modules (MOD-002 … MOD-019), business workflows, dashboards, analytics, AI Workspace.

## Technical notes

- Stack unchanged: TanStack Start v1, Tailwind v4, shadcn/ui, self-managed Supabase, Vitest/Playwright.
- All SQL follows DATABASE_STANDARD: plural tables, standard audit cols, soft-delete, `updated_at` trigger, RLS + explicit GRANTs, security-definer helpers in `private` schema only.
- All server fns use `requireSupabaseAuth` (+ new `requireOrgContext` / `requirePermission`). `supabaseAdmin` only inside handlers.

## Post-Wave-0

On Sprint 0.12 PASS → authorize **MOD-001 Platform Administration** implementation using the approved Publication and Web/Mobile/API Solution Designs.
