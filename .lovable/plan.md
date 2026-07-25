# SPR-MOD-001-003 (v2) — Identity & Access Foundation + Enterprise Dashboard Template

Repository-first. Existing primitives (auth, RBAC engine, permission catalog, audit, invitations, nav registry, tenant/company/branch, `src/components/dashboard/{Dashboard,WidgetCard,StatCard,ActivityFeedWidget,TableWidget,ProgressWidget}`) are reused, not re-implemented. Two deliverables are interleaved: (A) a shared **Dashboard Template** framework, and (B) the **Identity & Access** admin surface built on top of it.

---

## Phase 0 — Repository Discovery Report (mandatory, no code)
Deliverable: `docs/50-audit-reports/SPR-MOD-001-003_DISCOVERY_20260725.md`. Confirmed already present and MUST be reused (not duplicated):
- Auth: `src/lib/auth.functions.ts`, `auth-context.tsx`, `/login`, `/reset-password`, `/auth/callback`, `logAuthEvent`.
- RBAC engine: `authorization.functions.ts`, `authorization.server.ts` (`requirePermission/Any/All`), `permissions-context.tsx`, `<Can />`.
- Permission catalog: `docs/15-governance/permission-catalog.manifest.yaml` → generated `src/lib/generated/permission-keys.ts`; DB seed in migration `008_rbac_foundation` (roles, permissions, role_permissions, user_roles, `fn_user_permissions`).
- Membership: `organization_members`, `tenants`, `branches`, `financial_years`, `organization_invitations` + accept routes.
- Audit: `audit_logs` + `logAuthEventFn`.
- Navigation: `NAV_REGISTRY` in `src/lib/navigation/registry.ts`, sidebar/header shells.
- Dashboard primitives already present: `Dashboard`, `DashboardRow`, `DashboardSection`, `WidgetCard`, `StatCard`, `ActivityFeedWidget`, `TableWidget`, `ProgressWidget`.
- Current tenant dashboard: `src/routes/_authenticated/dashboard.tsx` (hardcoded Quick actions / Recent activity / Notifications trio).

Stop and publish the discovery report if drift is found (e.g. a competing dashboard framework, a duplicate roles table).

---

## Phase 1 — Data & permission catalog additions (single migration)
Migration `20260725_identity_access_foundation.sql`:
1. Extend `public.user_profiles` (all nullable, backfilled): `job_title`, `department`, `timezone`, `locale`, `mobile`, `status` (`active|suspended|archived`, default `active`), `locked_until`, `must_reset_password`, `last_login_at`, `mfa_enabled`, `default_tenant_id`, `default_company_id`, `default_branch_id`.
2. New `public.user_branch_memberships (id, user_id, tenant_id, company_id, branch_id, is_default, created_at, deleted_at)` — unique `(user_id, branch_id)`; GRANT to `authenticated`/`service_role`; RLS via `has_role`/branch-scoped policies.
3. Additive columns on `roles`: `category`, `is_system` (default false), nullable `tenant_id`/`company_id`/`branch_id` for scope. Existing seeded system roles untouched.
4. Append new permission keys to the YAML manifest and mirror as `INSERT ... ON CONFLICT DO NOTHING`:
   - `platform.dashboard.view`
   - `platform.identity.dashboard.view`
   - `platform.users.suspend|activate|archive|restore|reset_password|force_reset|lock|unlock|invite`
   - `platform.roles.create|update|clone|archive|delete`
   - `platform.permissions.view`
   - `platform.memberships.manage`
   - `platform.policies.view|manage`
   - `platform.invitations.view|manage`
5. Regenerate `permission-keys.ts` via `bun run gen:permissions`.
6. Extend `AuthAuditAction` union in `src/lib/auth-audit.ts` with past-tense identity actions (`user_created`, `user_suspended`, `role_assigned`, `permission_granted`, `membership_added`, etc.). No changes to existing action names.

No breaking rename of any permission namespace (deferred to SPR-PLT-0004).

---

## Phase 2 — Reusable identity services (server functions only)
All under `.middleware([requireSupabaseAuth])` + `requirePermission(...)`; no module-scope `client.server` imports; `supabaseAdmin` loaded inside handlers only for Auth Admin API (invite, reset, lock).
- `src/lib/identity/users.functions.ts` — list/get/update/suspend/activate/archive/restore/lock/unlock/forceReset/resetPassword.
- `src/lib/identity/invitations.functions.ts` — thin extension of `organization_invitations` (list/invite/resend/cancel across tenant).
- `src/lib/identity/roles.functions.ts` — CRUD + clone + archive + list-users-for-role over `roles`/`role_permissions`.
- `src/lib/identity/memberships.functions.ts` — tenant/company/branch membership ops over `organization_members` + `user_branch_memberships`.
- `src/lib/identity/policies.functions.ts` — read-only scoped view over role→permission grants (no new engine).
- Reuse existing `listEffectivePermissions` for the "effective permissions" preview.

Every mutation calls `logAuthEventFn` with a new action key.

---

## Phase 3.0 — Enterprise Dashboard Template Foundation (NEW, blocks Phase 3.1)
New folder `src/dashboard/template/` (kept separate from `src/components/dashboard/`, which becomes the low-level widget primitives layer the template composes). No visual redesign — pure refactor + generalization.

Files:
- `types.ts` — `DashboardContext = "platform"|"tenant"|"company"|"branch"|"module"`; `DashboardConfig`, `DashboardWidgetDescriptor`, `DashboardSectionDescriptor`, `QuickAction`, `WidgetRegistryEntry`.
- `DashboardTemplate.tsx` — top-level orchestrator: `<DashboardTemplate context config />`. Reads config, resolves widgets from a registry, applies permission gates via `<Can />`, renders `DashboardLayout`.
- `DashboardLayout.tsx` — page skeleton: uses existing `PageContainer` + `DashboardSection` + `DashboardRow` + `Dashboard` grid.
- `DashboardHeader.tsx` — title, description, primary actions slot.
- `DashboardBreadcrumb.tsx` — thin wrapper over existing breadcrumb slot.
- `DashboardQuickActions.tsx` — renders configured `QuickAction[]` with permission gating.
- `DashboardRecentActivity.tsx` — wraps `ActivityFeedWidget` with data source hook.
- `DashboardNotifications.tsx` — wraps existing `NotificationBell`/inbox data.
- `DashboardWidgets.tsx` — resolves `config.widgets: string[]` against a `widgetRegistry`, filters by permission, renders in grid.
- `DashboardGrid.tsx` — thin re-export of existing `Dashboard`/`DashboardRow` for template consumers (single import surface).
- `DashboardEmptyState.tsx` — reused `EmptyState` styled for zero-widget/zero-permission cases.
- `hooks/useDashboard.ts` — resolves current context (tenant/company/branch from `org-context`) and merges config with permission set.
- `widgets/` — thin adapters over `src/components/dashboard/widgets/*` so template widgets have a stable descriptor identity (`stat`, `activity`, `notification`, `chart`, `table`). No visual change.
- `index.ts` — public exports.

Widget registry pattern (declarative, extendable per module):
```ts
export const dashboardWidgetRegistry = {
  "identity.total_users": { component: TotalUsersWidget, permission: PERMISSIONS.PLATFORM_USERS_VIEW },
  "identity.pending_invitations": { component: PendingInvitationsWidget, permission: PERMISSIONS.PLATFORM_INVITATIONS_VIEW },
  // ...
};
```

Refactor `src/routes/_authenticated/dashboard.tsx` to render:
```tsx
<DashboardTemplate context="tenant" config={tenantDashboardConfig} />
```
Behavior/visuals unchanged; the existing Quick actions / Recent activity / Notifications trio is expressed as `tenantDashboardConfig` slots. Verified by side-by-side screenshot equivalence.

---

## Phase 3.1 — Platform Dashboard (built on the template, seeded with Identity metrics)
New route `src/routes/_authenticated/platform/dashboard.tsx` gated by `platform.dashboard.view`:
```tsx
<DashboardTemplate context="platform" config={platformDashboardConfig} />
```
`platformDashboardConfig.widgets` (initial): `identity.total_users`, `identity.active_users`, `identity.suspended_users`, `identity.pending_invitations`, `identity.total_roles`, `identity.locked_accounts`, `identity.recent_activity`. Widget components query the Phase 2 identity server fns; empty states via `DashboardEmptyState`.

Register in `NAV_REGISTRY` under `platform` module.

---

## Phase 3.2 — Identity & Access admin pages
All routes under `src/routes/_authenticated/platform/identity/*`, all registered in `NAV_REGISTRY` under a new module group `platform_identity` with per-page permission gates from Phase 1. No hardcoded menus.

- `/platform/identity` — Identity Dashboard via `<DashboardTemplate context="module" config={identityDashboardConfig} />` (subset: users KPIs, invitations, role distribution, recent identity audit).
- `/platform/identity/users` — DataGrid (server-side pagination/filter/sort/search); row + bulk actions (suspend/activate/archive/restore/reset/lock/unlock/invite).
- `/platform/identity/users/$userId` — profile + tabs: Memberships (tenant/company/branch), Roles, Effective Permissions (tree, inherited badges), Audit.
- `/platform/identity/roles` — list + create/edit/clone/archive drawer + permission tree assignment.
- `/platform/identity/roles/$roleId` — role detail + assigned users.
- `/platform/identity/permissions` — read-only permission browser (categorized from generated manifest).
- `/platform/identity/invitations` — list + resend/cancel/invite.
- `/platform/identity/policies` — read-only scope view of role grants.
- `/platform/identity/audit` — filtered `audit_logs` view for identity actions.

Shared components in `src/components/identity/`: `PermissionTree`, `RoleAssignmentPanel`, `MembershipEditor`, `UserStatusBadge`, `InvitationStatusBadge`. All built from existing shadcn primitives + design tokens; dark mode & a11y inherited.

---

## Phase 4 — Guards, docs, standards
- Route `beforeLoad` uses `requirePermission` via server fns; UI gates via `<Can />` and `usePermission`.
- Fill `docs/04-domains/foundation/users.md` and `roles-permissions.md` (data model, permissions matrix, workflows).
- Author `docs/20-design/DASHBOARD_TEMPLATE_STANDARD.md` codifying the template contract, config schema, and widget-registry rules (referenced by future module dashboards).
- ADR: `docs/11-adrs/platform/ADR-0XX-enterprise-dashboard-template.md` recording the "single template, config-driven" decision.
- Publish validation and completion reports under `docs/50-audit-reports/` and status entry under `docs/04_Program_Status/reports/`.

---

## Phase 5 — Validation
- `bun run gen:permissions`; `tsgo` clean.
- Vitest unit coverage: dashboard template config resolution + permission gating; identity service permission checks; membership defaulting; invitation state machine.
- Playwright smoke: (a) tenant dashboard visually equivalent post-refactor; (b) platform dashboard renders with widget permission gating; (c) super-admin creates user → invites → assigns role → suspends → audit entry visible.
- Supabase linter clean; RLS validated on new tables.
- Discovery, validation, completion reports published.

---

## Out of scope (unchanged)
Auth redesign, OAuth/SSO/MFA implementation, licensing/billing, downstream business modules, permission-namespace renaming (SPR-PLT-0004), visual redesign of the existing tenant dashboard.

## Stop condition
Discovery → migration + services → Dashboard Template refactor (tenant parity proven) → Platform Dashboard → Identity admin pages → validation + completion. No downstream sprint starts until this sprint is approved.
