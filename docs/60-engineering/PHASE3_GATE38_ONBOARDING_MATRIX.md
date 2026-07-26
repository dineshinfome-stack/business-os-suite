# Phase 3 — Gate 3.8 Onboarding Matrix

**Sprint:** SPR-MOD-001-003 · **Gate:** 3.8 · **Pass:** 3.8.1 (Architecture & Contracts)
**Authority:** `PHASE3_GATE38_DISCOVERY.md` (facts), `PHASE3_GATE38_POLICY_DECISIONS.md` (policy)
**Code owner:** `src/lib/tenant-onboarding/contracts.ts` (canonical step registry)

There is deliberately **no separate company step** — `organizations` is the


---

## 1. Step matrix

### 1.1 Ownership and requirement

| Step Key | Display Name | Owning Module | Onboarding Ownership | Source of Truth | Required Status | Permission |
|---|---|---|---|---|---|---|
| `provisioning_verified` | Provisioning verified | provisioning | composed | `provisioning_jobs` / `provisioning_steps` | Mandatory | `PLATFORM_TENANT_READ` |
| `organization_profile` | Organization (company) profile | organizations | coordinated | `organizations` via `public.fn_create_company` | Mandatory | `PLATFORM_COMPANY_CREATE`, `PLATFORM_COMPANY_SET_DEFAULT` |
| `primary_branch` | Primary branch | branches | coordinated | `branches.is_default` | Mandatory | `PLATFORM_BRANCH_CREATE`, `PLATFORM_BRANCH_SET_DEFAULT` |
| `tenant_admin_invitation` | First administrator invitation | tenant/invitations | coordinated | `organization_invitations` | Mandatory | `PLATFORM_INVITATIONS_MANAGE` |
| `tenant_admin_membership` | Administrator membership | tenant/memberships | composed | `organization_members` | Conditional (warning pre-acceptance) | `PLATFORM_MEMBERSHIPS_MANAGE` |
| `roles_assigned` | Administrator role assignment | rbac | coordinated | `organization_invitations.role` (pre-acceptance) / `user_roles` (post-acceptance) | Conditional | `PLATFORM_ROLES_ASSIGN` |
| `required_settings` | Required settings | settings | coordinated | `setting_definitions` / `setting_values` | Mandatory | `PLATFORM_SETTINGS_MANAGE` |
| `financial_year` | Financial year | financial-years | coordinated | `financial_years` | Conditional | `PLATFORM_FINANCIAL_YEAR_CREATE/OPEN/SET_DEFAULT` |
| `readiness_validation` | Readiness validation | tenant-onboarding | owned | `tenant_onboarding_steps` + readiness evaluation | Mandatory | `PLATFORM_TENANT_READ` |
| `activation` | Workspace activation | tenant-onboarding | owned | `tenant_onboarding.state` + tenant lifecycle delegation | Mandatory | `PLATFORM_TENANT_ACTIVATE` |

### 1.2 Contracts, idempotency and concurrency

| Step Key | Read Query | Command | Input Contract | Idempotency Rule | Concurrency Rule |
|---|---|---|---|---|---|
| `provisioning_verified` | `tenantOnboardingKeys.steps` | `verifyProvisioning` | `onboardingDetailQuerySchema` | Pure read; re-running re-reads the job | None (read-only) |
| `organization_profile` | `tenantOnboardingKeys.detail` | `saveOrganizationProfile` | `saveOrganizationProfileSchema` | Create-or-select on unique `(tenant_id, slug)`; existing org is adopted | `expectedVersion` on `tenant_onboarding` |
| `primary_branch` | `tenantOnboardingKeys.detail` | `createOrSelectBranch` | `createOrSelectBranchSchema` | Create-or-select on unique `(organization_id, code)` | `expectedVersion` |
| `tenant_admin_invitation` | `tenantOnboardingKeys.invitation` | `inviteFirstAdministrator` | (Pass 3.8.4) | Reuses an outstanding `pending` invitation; resend = revoke + create | `expectedVersion` |
| `tenant_admin_membership` | `tenantOnboardingKeys.detail` | — (observed) | — | Read of `organization_members`; acceptance is external | None |
| `roles_assigned` | `tenantOnboardingKeys.detail` | `assignRequiredRoles` | `assignRequiredRolesSchema` | Upsert on `(user_id, role_id, organization_id)`; pre-acceptance records intent on the invitation | `expectedVersion` |
| `required_settings` | `tenantOnboardingKeys.detail` | `initializeSettings` | `initializeSettingsSchema` | Upsert on `(definition, scope, organization)` | `expectedVersion` |
| `financial_year` | `tenantOnboardingKeys.detail` | `initializeFinancialYear` | `initializeFinancialYearSchema` | Unique `(organization_id, code)` + date-overlap validation | `expectedVersion` |
| `readiness_validation` | `tenantOnboardingKeys.readiness` | `runReadiness` | `runReadinessSchema` | Re-evaluation always safe; result replaces the previous snapshot | `expectedVersion` on timestamp write |
| `activation` | `tenantOnboardingKeys.detail` | `activateWorkspace` | `activateWorkspaceSchema` | Replay returns the existing result (`idempotentReplay: true`); lifecycle transition is a no-op when the tenant is already `active` | Conditional `UPDATE ... WHERE version = $n` |

### 1.3 Completion, blocking and readiness

| Step Key | Completion Condition (authoritative, server-side) | Blocking Conditions | Warning Conditions | Readiness Impact |
|---|---|---|---|---|
| `provisioning_verified` | Provisioning job for the tenant is `provisioned` | Job failed, rolled back, or absent | Job still running | Block |
| `organization_profile` | A non-archived `organizations` row exists for the tenant with `is_default = true` | No organization; organization archived | Organization exists but is not marked default | Block |
| `primary_branch` | A non-archived `branches` row exists for the default organization with `is_default = true` | No branch for the default organization | Branch exists but is not default | Block |
| `tenant_admin_invitation` | A `pending` (unexpired) or `accepted` invitation exists for the default organization with an administrative role | No invitation; only revoked/expired invitations | — | Block |
| `tenant_admin_membership` | An `active` `organization_members` row exists for the invited user | *(none before acceptance — G38-POL-003)* | Invitation accepted but membership inactive; acceptance still pending | Warning |
| `roles_assigned` | Pre-acceptance: the invitation carries an administrative role. Post-acceptance: a matching `user_roles` grant exists | Post-acceptance only: accepted member holds no administrative grant | Pre-acceptance: grant not yet materialized | Warning pre-acceptance, block post-acceptance |
| `required_settings` | Every registry entry with `readinessImpact = "block"` has a valid organization-scoped value | A blocking key is missing or fails validation | An optional key is unset | Block |
| `financial_year` | A financial year exists for the default organization **when required** | Required by an authoritative trigger and absent | Present but `is_placeholder` | Conditional |
| `readiness_validation` | A readiness snapshot exists with `overallStatus ∈ {ready, ready_with_warnings}` | `overallStatus = not_ready` | Warnings present | Block |
| `activation` | `tenant_onboarding.state = activated` | Any blocking readiness check open; concurrent activation in progress | — | Block |

**Completion is always confirmed from authoritative server data.** The UI must
never mark a server-owned step complete from local form submission alone.

### 1.4 Audit, notification, cache and navigation

| Step Key | Audit Event | Notification | Cache Invalidation | Deep Link | Known Limitation | Pass Owner |
|---|---|---|---|---|---|---|
| `provisioning_verified` | `onboarding.step.verified` | — | `steps`, `detail`, `progress` | `/platform/provisioning` | — | 3.8.3 |
| `organization_profile` | `onboarding.organization.saved` | — | `detail`, `steps`, `progress`, `blockers`, `readiness` | `/platform/companies` | — | 3.8.3 |
| `primary_branch` | `onboarding.branch.saved` | — | `detail`, `steps`, `progress`, `blockers`, `readiness` | `/platform/companies` | — | 3.8.3 |
| `tenant_admin_invitation` | `onboarding.invitation.created` | `invitation.sent` | `invitation`, `detail`, `steps`, `readiness` | `/platform/admin/onboarding/:tenantId` | No `resendInvitation` exists; resend = revoke + create | 3.8.4 |
| `tenant_admin_membership` | `onboarding.membership.observed` | — | `detail`, `readiness` | `/platform/admin/onboarding/:tenantId` | Acceptance is asynchronous and outside operator control | 3.8.4 |
| `roles_assigned` | `onboarding.roles.assigned` | — | `detail`, `steps`, `readiness` | `/platform/admin` | Pre-acceptance grants cannot be materialized | 3.8.4 |
| `required_settings` | `onboarding.settings.initialized` | — | `detail`, `steps`, `readiness` | `/platform/admin/settings` | Registry limited to keys that exist today | 3.8.3 |
| `financial_year` | `onboarding.financial_year.initialized` | — | `detail`, `steps`, `readiness` | `/platform/companies` | Authoritative trigger unresolved (G38-POL-004) | 3.8.3 |
| `readiness_validation` | `onboarding.readiness.evaluated` | — | `readiness`, `blockers`, `detail` | `/platform/admin/onboarding/:tenantId` | — | 3.8.5 |
| `activation` | `onboarding.activated` | `tenant.activated` | `all` | `/platform/tenants` | — | 3.8.5 |

### 1.5 Future-pass assignment

| Scope | Pass |
|---|---|
| Workflow persistence, RLS and read models | 3.8.2 |
| Bootstrap commands (organization, branch, roles, settings, financial year) | 3.8.3 |
| First administrator invitation | 3.8.4 |
| Readiness and activation engine | 3.8.5 |
| Platform console | 3.8.6 |
| Operator-run wizard | 3.8.7 |

---

## 2. Query keys and invalidation sets

Defined in `src/lib/tenant-onboarding/query-keys.ts`.

| Key | Purpose |
|---|---|
| `tenantOnboardingKeys.all` | Root namespace |
| `platformLists()` / `platformList(filters)` | Operator list, normalized filters |
| `details()` / `detail(tenantId)` | Workflow detail |
| `steps` · `progress` · `blockers` · `readiness` · `activity` · `invitation` | Tenant-scoped sub-reads |

| Command | Invalidates |
|---|---|
| start / resume / restart / cancel | `platformLists()`, `detail`, `steps`, `progress` |
| bootstrap commands (organization, branch, roles, settings, FY) | `detail`, `steps`, `progress`, `blockers`, `readiness` |
| invite / revoke / resend administrator | `invitation`, `detail`, `steps`, `readiness` |
| run readiness | `readiness`, `blockers`, `detail` |
| activate | `all` |

---

## 3. Migration design (DOCUMENTED ONLY — no executable SQL in this pass)

Pass 3.8.2 implements the following. No domain data is duplicated; both tables
hold **workflow metadata only**.

### 3.1 `public.tenant_onboarding`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | PK, `gen_random_uuid()` |
| `tenant_id` | `uuid` | no | FK → `tenants(id)` `ON DELETE CASCADE`; **UNIQUE** (one workflow per tenant) |
| `state` | `text` | no | CHECK ∈ the six workflow states; default `not_started` |
| `version` | `integer` | no | default `0`; optimistic concurrency |
| `started_at` | `timestamptz` | yes | |
| `started_by` | `uuid` | yes | FK → `auth.users(id)` `ON DELETE SET NULL` |
| `blocked_at` | `timestamptz` | yes | |
| `blocked_reason_code` | `text` | yes | stable machine code |
| `blocked_reason_summary` | `text` | yes | sanitized; never a raw error |
| `ready_at` | `timestamptz` | yes | |
| `activated_at` | `timestamptz` | yes | |
| `activated_by` | `uuid` | yes | |
| `cancelled_at` | `timestamptz` | yes | |
| `cancelled_by` | `uuid` | yes | |
| `cancellation_reason` | `text` | yes | operator-entered, length-bounded |
| `last_readiness_checked_at` | `timestamptz` | yes | |
| `last_correlation_id` | `text` | yes | |
| `created_at` / `updated_at` | `timestamptz` | no | `now()`; `updated_at` trigger |

- **Constraints:** `UNIQUE (tenant_id)`; state CHECK; timestamp consistency
  CHECK (`activated_at` non-null only when `state = 'activated'`).
- **Concurrency:** every mutating statement uses
  `UPDATE ... WHERE id = $1 AND version = $2` and increments `version`; zero
  affected rows ⇒ typed conflict result. This mirrors the tenant-lifecycle
  "database is the enforcer" pattern.
- **Indexes:** `UNIQUE (tenant_id)`, `(state)`, `(updated_at DESC)`.
- **RLS:** enabled. Platform-scope read/write only, matched to the reused
  permissions (tenant read / update / activate) via the existing role-check
  function; no anon access.
- **Grants:** `GRANT SELECT, INSERT, UPDATE ON public.tenant_onboarding TO authenticated;`
  `GRANT ALL ... TO service_role;` — no `anon` grant, no `DELETE` (workflows
  are cancelled, not deleted).
- **Retention:** retained for the tenant's lifetime; removed by tenant cascade.

### 3.2 `public.tenant_onboarding_steps`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` | no | PK |
| `tenant_onboarding_id` | `uuid` | no | FK → `tenant_onboarding(id)` `ON DELETE CASCADE` |
| `tenant_id` | `uuid` | no | denormalized for RLS; parent-consistency CHECK via trigger or composite FK |
| `step_key` | `text` | no | CHECK ∈ the ten registry keys |
| `status` | `text` | no | CHECK ∈ the six step statuses; default `not_started` |
| `attempt_count` | `integer` | no | default `0` |
| `started_at` / `completed_at` / `blocked_at` | `timestamptz` | yes | |
| `failure_code` | `text` | yes | stable machine code |
| `failure_summary` | `text` | yes | sanitized |
| `correlation_id` | `text` | yes | |
| `updated_by` | `uuid` | yes | |
| `version` | `integer` | no | default `0` |
| `created_at` / `updated_at` | `timestamptz` | no | |

- **Constraints:** `UNIQUE (tenant_id, step_key)`; parent consistency enforced
  through a composite FK `(tenant_onboarding_id, tenant_id)` against a matching
  unique key on the parent.
- **Seeding:** step rows are **created lazily** on first attempt. Progress is
  computed against the canonical registry, so absent rows read as
  `not_started` and the registry stays the single source of truth.
- **Indexes:** `UNIQUE (tenant_id, step_key)`, `(tenant_onboarding_id)`,
  `(status)`.
- **RLS / grants:** identical posture to the parent table.
- **Retention:** cascade-deleted with the parent workflow.

### 3.3 Explicit non-fields

Neither table stores: organization name, branch name, invitation token or
token hash, invitation email payload, role definitions, setting values,
financial-year dates, provider credentials, provisioning payloads, raw errors
or stack traces. Those remain in their authoritative domains.

---

## 4. Required-settings registry

Executable registry: `src/lib/tenant-onboarding/required-settings.registry.ts`.
Every key below was verified to exist in `public.setting_definitions`.

| Key | Owner | Scope | Type | Requirement | Editable | Sensitivity | Readiness Impact | Audit | Source of Truth |
|---|---|---|---|---|---|---|---|---|---|
| `platform.locale.default_timezone` | settings/locale | organization | string | required | yes | non-sensitive | block | yes | `setting_values` |
| `platform.locale.default_language` | settings/locale | organization | enum | required | yes | non-sensitive | block | yes | `setting_values` |
| `platform.branding.product_name` | settings/branding | organization | string | required | yes | non-sensitive | block | yes | `setting_values` |
| `platform.branding.support_email` | settings/branding | organization | string | optional | yes | non-sensitive | none | yes | `setting_values` |
| `platform.security.session_timeout_minutes` | settings/security | organization | integer | optional | yes | non-sensitive | none | yes | `setting_values` |

**Excluded — sensitive:** `platform.ai.provider_token`,
`platform.security.smtp_password` (never written or read by onboarding).
**Excluded — system-owned:** `platform.framework.*`, `workspace.*`
(`is_system = true`; not operator-editable during onboarding).

**Proposed for a later pass (do NOT add until the definition exists):**
`base_currency`, `date_format`, `number_format`,
`financial_year_start_month`, `week_start_day`. None exists in
`setting_definitions` today; adding any of them requires a settings migration
owned by the settings module, not by onboarding.
