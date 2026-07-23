# Sprint 0.6 — Settings Foundation (v2, Approved with Refinements)

**Repository state (before):** `WAVE_UX_PLANNING_APPROVED_AND_WAVE_0_5_CHARTER_APPROVED`
**Repository state (after, on PASS):** `READY_FOR_SPRINT_0_7`

Platform infrastructure sprint. No business modules. No new governance documents. Reuses Auth (0.4A), Multi-Tenancy (0.4), RBAC (0.5), Audit (0.4A), Organization Context, and existing platform styling.

**v2 changes vs. approved v1:**
- **R1 folded in** — documented `is_system` semantics distinguishing framework-owned from configurable definitions.
- **R2 folded in** — documented future scope expansion path (department → team → user) as an implementation note; no schema change.
- **Observation folded in** — `/settings/platform` explicitly labelled as framework demonstration surface, to be superseded by MOD-001 + Wave UX.

---

## 1. Database — Migration `009_settings_foundation`

Single append-only migration. Every new `public` table follows the mandated 4-step pattern: CREATE → GRANT → ENABLE RLS → CREATE POLICY.

### 1.1 Enums

```sql
CREATE TYPE public.setting_data_type
  AS ENUM ('string','integer','decimal','boolean','enum','json');

CREATE TYPE public.setting_scope
  AS ENUM ('platform','organization');
-- Future values ('department','team','user') will be appended in a later
-- migration when those org units land. See §11 Forward-Compatibility Note.

CREATE TYPE public.feature_flag_stage
  AS ENUM ('off','internal','beta','ga');
```

### 1.2 `setting_definitions`

Canonical registry. Immutable identity.

- `id uuid pk`
- `key text not null unique` — dotted namespace (e.g. `platform.branding.logo_url`)
- `category text not null`
- `scope setting_scope not null`
- `data_type setting_data_type not null`
- `default_value jsonb`
- `validation_schema jsonb` — `{ required, min, max, regex, enum }`
- `description text`
- `is_system boolean not null default false` — see **R1 semantics** below
- `is_sensitive boolean not null default false`
- `deprecated_at timestamptz null`
- `created_at`, `updated_at`

**R1 — `is_system` semantics (documented, enforced):**

| `is_system` | Meaning | Editable via `setSetting`? | Examples |
| ----------- | ------- | -------------------------- | -------- |
| `true` | Framework-owned. Defines platform behaviour or internal switches that administrators MUST NOT edit through the settings API. Value comes only from migrations or a service-role tool. | **No** — server fn rejects with `code: 'system_setting_immutable'`. UI hides these unless the caller is a `platform_owner` with an explicit "system" toggle. | `platform.framework.schema_version`, internal kill switches, framework defaults |
| `false` | Configurable. Administrators can override at their permitted scope. | Yes (subject to RBAC + validation) | `platform.branding.product_name`, `platform.branding.logo_url`, `platform.locale.default_timezone` |

Enforced by `setSetting` and by the write policy on `setting_values` (RLS check calls `private.fn_setting_is_configurable(definition_id)`).

**Constraints:** `key` regex `^[a-z0-9]+(\.[a-z0-9_]+)+$`; trigger blocks `UPDATE` of `key`, `scope`, `data_type`, `is_system` on existing rows.

**RLS:**
- `SELECT` to `authenticated` — all rows.
- No `INSERT/UPDATE/DELETE` for `authenticated`. Mutations are seed-only (migrations) or via `service_role`.

### 1.3 `setting_values`

- `id uuid pk`
- `definition_id uuid not null references setting_definitions(id) on delete cascade`
- `organization_id uuid null references organizations(id) on delete cascade` — NULL = platform-level
- `value jsonb not null`
- `updated_by uuid null references auth.users(id)`
- `updated_at timestamptz`
- **Unique index:** `(definition_id, coalesce(organization_id,'00000000-0000-0000-0000-000000000000'))`.

**RLS:**
- `SELECT`: `organization_id IS NULL OR private.fn_is_org_member(auth.uid(), organization_id)`.
- `INSERT/UPDATE/DELETE`: `private.fn_user_has_permission(...)` AND `private.fn_setting_is_configurable(definition_id)`.

### 1.4 `feature_flags`

- `id uuid pk`
- `key text not null`
- `organization_id uuid null` — NULL = platform default
- `enabled boolean not null default false`
- `description text`
- `rollout_stage feature_flag_stage not null default 'off'`
- `created_at`, `updated_at`
- **Unique index:** `(key, coalesce(organization_id,'00000000-...'))`
- Regex constraint on `key`.

**RLS:** same read/write model as `setting_values`.

### 1.5 Helpers (`private` schema, security-definer)

- `private.fn_user_has_permission(_user_id uuid, _org_id uuid, _permission text) returns boolean`
- `private.fn_setting_is_configurable(_definition_id uuid) returns boolean` — returns `NOT is_system`.

Grants: `USAGE` on `private` and `EXECUTE` on helpers granted to `authenticated`, per Sprint 0.4A pattern.

### 1.6 Seed (same migration)

Framework-owned (`is_system=true`):
- `platform.framework.schema_version` (string)
- `platform.framework.audit_redaction_enabled` (boolean, default `true`)

Configurable (`is_system=false`):
- `platform.branding.product_name` (string)
- `platform.branding.logo_url` (string)
- `platform.branding.support_email` (string, regex)
- `platform.locale.default_language` (enum)
- `platform.locale.default_timezone` (string)
- `platform.security.session_timeout_minutes` (integer, min 5, max 1440)
- `platform.security.smtp_password` (string, `is_sensitive=true`)
- `platform.ai.provider_token` (string, `is_sensitive=true`)

One feature flag: `platform.ui.command_palette_enabled` (off).

### 1.7 Registry entry

Append `009` to `docs/15-governance/MIGRATION_REGISTRY.md`. No new standards.

---

## 2. Resolution Engine — `src/lib/settings.functions.ts`

Server functions under `requireSupabaseAuth`:

```ts
resolveSetting({ key, organizationId? })
getSetting({ key, scope, organizationId? })
getSettings({ keys[], organizationId? })
getEffectiveSettings({ category?, organizationId? })
setSetting({ key, scope, organizationId?, value })     // rejects is_system=true
resetSetting({ key, scope, organizationId? })
```

**Precedence (single SQL pass, `DISTINCT ON`):**

```
System default (setting_definitions.default_value)
  ↑
Platform value (setting_values where organization_id IS NULL)
  ↑
Organization value (setting_values where organization_id = :org)
```

Structured so a future migration can insert `department`, `team`, `user` layers between `organization` and the caller without rewriting the resolver — see §11.

**Batching:** `getSettings` / `getEffectiveSettings` execute one query. No N+1.

**Tenant safety:** explicit `organizationId` requires `platform.settings.manage`; otherwise `getOrgContext()` is used.

Feature-flag equivalent lives in `src/lib/feature-flags.functions.ts`: `resolveFlag`, `listFlags`, `setFlag`.

---

## 3. Validation — `src/lib/settings-validation.ts`

Shared client + server module.

- Reads `data_type` + `validation_schema` from the definition.
- Supports `required`, `min`, `max`, `regex`, `enum`.
- Coerces per `data_type`.
- Zod schema built dynamically.
- Server function rejects invalid values before write; client hook exposes `validate()` for UI feedback.
- Rejection returns `{ code: 'validation_failed', field, message }`.

---

## 4. RBAC Integration

Append to `permission-catalog.manifest.yaml`:

- `settings.view`
- `settings.update`
- `settings.security` — mutate `is_sensitive=true` values
- `platform.settings.manage` — mutate `scope=platform` values or cross-tenant

Regenerate `src/lib/generated/permission-keys.ts`. Seed grants:

- `platform_owner` → all four
- `org_admin` → `settings.view`, `settings.update`
- `member` → `settings.view`

Authorization via existing `authorizeOrThrow(context, 'settings.update', orgId)`.

---

## 5. React Framework — `src/hooks/settings/`

- `useSetting(key)` — typed via generated union
- `useSettings(keys[])` — batch
- `useUpdateSetting()` — optimistic invalidation
- `useResetSetting()`
- `useFeatureFlag(key)`

**Cache keys** in `src/lib/query-keys.ts`:

```
['settings', orgId, key]
['settings', orgId, 'effective', category]
['feature-flags', orgId, key]
```

Org switch → invalidate the `settings` and `feature-flags` cache families. Loading/error via existing `<QueryLoading>` / `<QueryError>` conventions.

---

## 6. Shared UI Components — `src/components/settings/`

Reusable primitives only:

- `SettingsSection`, `SettingsGroup`, `SettingsCard`, `SettingsTabs`
- `SettingsField` — bound to a `SettingDefinition`; delegates by `data_type` to shadcn `Input` / `Switch` / `Select` / `Textarea` / `NumberInput`
- `SensitiveField` — masked input, "Rotate" action, never renders stored value

Consumes existing semantic tokens. No visual redesign.

### `/settings/platform` — Framework Demonstration Surface

Explicitly a **framework demonstration** page, not the production admin UI:

- Header banner: "Framework demonstration — the production administration experience will land with MOD-001 and Wave UX."
- Documented as such in `SPRINT_0_6_SETTINGS_FOUNDATION_REPORT.md` under a "Demonstration Surface" section.
- To be **replaced** (not extended) when MOD-001 Platform Administration is implemented.
- Route lives outside any module namespace to make the replacement boundary obvious.
- Gated by `platform.settings.manage` OR `settings.update`.

---

## 7. Sensitive Settings

When `is_sensitive=true`:

- `setSetting` writes normally.
- All read helpers return `{ __redacted: true, hasValue: boolean }`.
- `revealSensitiveSetting({ key, organizationId })` — gated by `settings.security`; returns plaintext for the immediate response only; never cached client-side.
- Audit records store `{ redacted: true }` in place of `old_values` / `new_values`.

---

## 8. Audit Integration

New whitelisted `SettingsAuditAction` union in `src/lib/settings-audit.ts`:

- `setting_updated`
- `setting_reset`
- `feature_flag_enabled`
- `feature_flag_disabled`

Emitted through the existing audit pipeline (minimal generalisation of `logAuthEventFn` into a generic `logAuditEventFn` if not already generic). Redaction is enforced in the helper, not at call sites.

---

## 9. Performance

- Single query per resolution call (window function + precedence order).
- Batch API is the default UI path.
- Indexes on `(definition_id, organization_id)` and `(key, organization_id)`.
- React Query `staleTime` 60 s on effective-settings; mutations invalidate targeted keys.

---

## 10. Verification — `docs/50-audit-reports/SPRINT_0_6_SETTINGS_FOUNDATION_REPORT.md`

Verification Metadata + Check / Result / Action table + Verification Summary.

| # | Check |
| - | ----- |
| 1 | Migration 009 applied; three tables + three enums present |
| 2 | GRANTs + RLS + policies present on all three tables |
| 3 | Unique index enforces no duplicate configuration |
| 4 | Append-only trigger blocks mutation of `key`, `scope`, `data_type`, `is_system` |
| 5 | Seed rows present (2 system + 6 configurable + 2 sensitive + 1 flag) |
| 6 | `resolveSetting` returns default when no overrides |
| 7 | `resolveSetting` returns platform value over default |
| 8 | `resolveSetting` returns organization value over platform |
| 9 | Validation rejects invalid enum |
| 10 | Validation rejects regex mismatch |
| 11 | Validation rejects out-of-range numeric |
| 12 | Validation rejects malformed JSON |
| 13 | Validation rejects missing required |
| 14 | Authorized user (`settings.update`) can update configurable setting |
| 15 | Unauthorized user receives authorization failure |
| 16 | `setSetting` on `is_system=true` rejected with `system_setting_immutable` |
| 17 | Server-side enforcement cannot be bypassed via direct client call |
| 18 | Feature flag: platform default resolves |
| 19 | Feature flag: org override wins |
| 20 | Sensitive setting never returned in plaintext from read paths |
| 21 | Sensitive setting reveal requires `settings.security` |
| 22 | Audit log for sensitive update contains `{ redacted: true }` |
| 23 | Audit records emitted for all four events |
| 24 | React hooks: resolution, loading, error states behave |
| 25 | Cache invalidates on org switch |
| 26 | `/settings/platform` labelled as framework demonstration surface |
| 27 | Regression: auth, tenancy, RBAC, org switching, audit still pass |
| 28 | `bunx tsgo --noEmit` exits 0 |
| 29 | Supabase linter: no new HIGH/CRITICAL findings |

Verification Summary reports totals for PASS / WARN / FAIL / documented deviations.

---

## 11. Forward-Compatibility Note (R2, documented not implemented)

Recorded in the sprint report and inline in `src/lib/settings.functions.ts` header comment:

```
Future scope expansion (NOT in Sprint 0.6):

  platform
    ↓
  organization
    ↓
  department       ← added when org units land
    ↓
  team             ← added when team model lands
    ↓
  user             ← added when user preferences land

Resolution engine is designed so new scopes are appended to the precedence
chain without rewriting call sites. Adding a scope requires:
  1. Append value to public.setting_scope enum.
  2. Add a scoping column to setting_values (nullable) + partial unique index.
  3. Extend the resolver's ORDER BY chain.
  4. Extend RLS to include the new scope's ownership check.
No consumer API changes required.
```

---

## Exit Criteria

Advance to `READY_FOR_SPRINT_0_7` when checks 1–29 return PASS with zero FAIL and zero un-mitigated WARN.

## Explicit Non-Goals

- No business module (Accounting / CRM / HRMS / Inventory / …).
- No user-preference layer.
- No department / team scopes (documented only, per §11).
- No new governance documents.
- No visual redesign.
- No changes to auth / tenancy / RBAC / audit contracts.
- `/settings/platform` is a demonstration surface, not the production admin UI.

## Technical Notes

- Migration authored via `supabase--migration`; migration files are never hand-edited.
- Server functions in `.functions.ts` (client-safe module path), never under `src/server/`.
- No new secrets required.
- Feature flags surfaced via server-fn only; no direct Data API read from the browser.
