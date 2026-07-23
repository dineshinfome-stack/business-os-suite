# Sprint 0.8 — Notifications Framework (v3, Approved)

## Objective
Deliver a multi-tenant, RBAC-aware notification framework with in-app delivery and a pluggable provider interface for future channels. Infrastructure only — no business modules, no workflow engine, no visual redesign.

## Scope Boundary
- **In:** data model, service, provider interface (InApp only), preferences, notification center panel, bell + badge, toast wrapper, hooks, server functions, audit hooks, RLS, shared enums/constants, type identifier stability contract + namespace convention, tests.
- **Out:** email/SMS/push/WhatsApp/Teams/Slack providers, workflow engine, scheduled/AI notifications, module-specific triggers, redesign of navigation or app shell.

## Database — Migration `012_notifications`

**Table `public.notifications`**
- `id uuid pk`, `organization_id uuid not null`, `recipient_user_id uuid not null`,
- `type text not null`, `category text not null`,
- `title text not null`, `message text`,
- `severity text not null check in (info,success,warning,error)`,
- `status text not null default 'unread' check in (unread,read,archived)`,
- `action_url text`, `action_label text`,
- `metadata jsonb not null default '{}'`, `created_by uuid`,
- `created_at timestamptz`, `read_at timestamptz`, `archived_at timestamptz`, `updated_at timestamptz`.
- Indexes: `(organization_id, recipient_user_id, status, created_at desc)`, `(recipient_user_id, status)`, `(organization_id, type)`.
- `updated_at` trigger via existing shared helper.

**Table `public.notification_preferences`**
- `id`, `organization_id`, `user_id`,
- `channel text check in (in_app,email,sms,push)`,
- `category text` (nullable = global default),
- `enabled boolean default true`, `metadata jsonb`, timestamps.
- Unique `(organization_id, user_id, channel, coalesce(category,''))`.

**RLS** (reuses `private.fn_is_org_member` / `private.fn_current_org_id`):
- SELECT: `recipient_user_id = auth.uid()` AND caller is member of `organization_id`.
- INSERT: `organization_id` in caller's orgs; service role bypasses for system events.
- UPDATE: recipient only, restricted to status/read_at/archived_at.
- Preferences: user owns rows scoped to org.

Grants: `SELECT, INSERT, UPDATE ON ... TO authenticated; ALL TO service_role;` (no anon).

## Shared Enums & Constants (single source of truth)

**`src/lib/notifications/constants.ts`** — Zod enums with inferred TS types:
- `NotificationStatus` = `unread | read | archived`
- `NotificationSeverity` = `info | success | warning | error`
- `NotificationChannel` = `in_app | email | sms | push`
- `NotificationCategory` = registry-driven

All service/UI/API code imports from here; no literal status/severity/channel strings elsewhere.

## Notification Type Registry, Namespace Convention & Stability Contract

**`src/lib/notifications/registry.ts`** — code-only registry of typed identifiers with default category/severity. Every entry carries a `stable: true` flag and inline JSDoc.

**Namespace Convention** (documented in `docs/15-governance/NOTIFICATION_TYPE_CONTRACT.md`):
- Identifiers follow `<namespace>.<action>` — e.g. `task.assigned`, `invoice.overdue`.
- Reserved top-level namespaces registered up front:
  - `task.*` — task lifecycle
  - `project.*` — project lifecycle
  - `invoice.*` — billing/AR
  - `amc.*` — annual maintenance contracts
  - `approval.*` — approval workflow
  - `workflow.*` — automation/engine
  - `security.*` — auth/security events
  - `system.*` — platform/maintenance
- New top-level namespaces require a governance note in the contract doc (additive-only). Sub-namespaces (`task.subtype.action`) allowed without governance.
- Registry validates identifier shape (`^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$`) at registration time.

**Stability Contract**:
- Type identifiers are **immutable public contracts** once shipped.
- Renames require a new identifier + deprecation window; old identifier continues to resolve.
- Referenced by preferences, analytics, automation, mobile — treated like navigation node IDs.
- Adding a type = additive; removing/renaming = breaking, requires migration note.

Initial registered types: `task.assigned`, `task.completed`, `project.updated`, `invoice.overdue`, `amc.expiring`, `approval.pending`, `workflow.failed`, `security.login`, `system.maintenance`.

## Backend

**`src/lib/notifications/types.ts`** — Zod schemas for Notification, Preference; re-exports enums from `constants.ts`.

**`src/lib/notifications/providers/`**
- `provider.interface.ts` — `NotificationProvider { id: NotificationChannel; send(notification): Promise<void> }`.
- `in-app.provider.ts` — persists row via admin client.
- `index.ts` — provider registry; only InApp registered.

**`src/lib/notifications/service.server.ts`** — `NotificationService`: `create`, `markRead`, `markUnread`, `archive`, `markAllRead`, `getUnreadCount`, `list({limit,cursor,status})`. Emits audit entries for created/read/archived.

**`src/lib/notifications/*.functions.ts`** — server functions wrapped with `requireSupabaseAuth`:
- `createNotificationFn` (requires `notifications:create` or system caller)
- `listNotificationsFn`, `getUnreadCountFn`
- `markReadFn`, `markAllReadFn`, `archiveNotificationFn`
- `getPreferencesFn`, `updatePreferenceFn`

All enforce `organization_id = current org` and `recipient_user_id = auth.uid()` for mutations.

## RBAC
Add to `permission-catalog.manifest.yaml`:
- `notifications:read.own` — all authenticated members
- `notifications:create` — system callers / privileged roles
- `notifications:manage` — admin bulk ops

Regenerate `src/lib/generated/permission-keys.ts`.

## Frontend

**Hooks (`src/hooks/notifications/`)**
- `useNotifications({status})` — TanStack Query, paginated.
- `useUnreadNotifications()` — count with refresh on window focus (realtime seam for future).
- `useNotificationPreferences()`.

**Components (`src/components/notifications/`)**
- `NotificationBell.tsx` — icon + `NotificationBadge`.
- `NotificationBadge.tsx` — unread count pill.
- `NotificationCenter.tsx` — Popover/Sheet panel with list, empty state, mark-all-read, per-item actions.
- `NotificationItem.tsx` — severity styling via existing design tokens.
- `ToastProvider` — wrapper around `sonner` in `src/lib/notify.ts`; severities align with `NotificationSeverity`.

**App Shell integration**
- Mount `<NotificationBell />` in existing `AppShell` header slot (no layout redesign).
- Add `/settings/notifications` at `src/routes/_authenticated/settings.notifications.tsx`.

## Audit
Reuse `logAuditEventFn` — actions: `notification.created`, `notification.read`, `notification.archived`, `notification.preference_updated`.

## Testing (`bunx vitest run` + `bunx tsgo --noEmit`)
- Unit: registry (including namespace shape validation), service methods, provider interface contract, preference resolution.
- Integration (mocked supabase): org isolation, RBAC filtering, unread count accuracy, mark-all-read scoping, audit emission.
- Component: NotificationCenter empty/populated states; mark-read updates cache; NotificationBell unread count.
- Typecheck + full test suite PASS; zero regressions in Sprints 0.2–0.7A.

## Deliverables
- Migration `012_notifications.sql`.
- `src/lib/notifications/**`, `src/hooks/notifications/**`, `src/components/notifications/**`, `src/routes/_authenticated/settings.notifications.tsx`, updated `AppShell`.
- `docs/15-governance/NOTIFICATION_TYPE_CONTRACT.md` (namespace convention + stability contract).
- `docs/50-audit-reports/SPRINT_0_8_NOTIFICATIONS_REPORT.md` covering schema/RLS, provider, service, RBAC/tenancy, preferences, audit, enum centralization, namespace convention & stability contract, typecheck/test results, non-goal confirmation, R-074 carried forward.

## Exit Criteria
- Migration applied; RLS + grants verified.
- All server fns, hooks, components delivered; NotificationBell mounted.
- Shared enums are single source of truth.
- Namespace convention + stability contract published; registry enforces identifier shape.
- Tests + typecheck PASS; zero regressions.
- Repository advances to `READY_FOR_SPRINT_0_9`.

## Technical Details
- Follow `server-side-modern`: `.functions.ts` client-safe; admin client imported inside handler for system-caller inserts.
- No Supabase Realtime this sprint (documented follow-up); unread count refresh via focus + mutation invalidation.
- Registry code-only; DB stores raw `type` string, validated against registry at service boundary with soft-fail for forward-compat.
- Preferences resolution: missing row ⇒ `in_app` enabled, other channels disabled.
