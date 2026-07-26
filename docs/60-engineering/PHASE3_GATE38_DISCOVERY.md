# Phase 3 — Gate 3.8 Discovery Report
## Tenant Onboarding, Organization Activation & Workspace Bootstrap

**Sprint:** SPR-MOD-001-003
**Gate:** 3.8
**Pass:** 3.8.0 — Repository discovery only
**Status:** COMPLETE — awaiting approval before Pass 3.8.1
**Change footprint of this pass:** this document only. No production code, no
migrations, no routes, no DTOs, no permissions, no tests were created or
modified.

---

## 1. Baseline (measured, not asserted)

| Signal | Command | Result |
|---|---|---|
| Test suite | `vitest run` | **41 files / 444 tests passing** |
| Typecheck | `tsgo --noEmit` | **clean, no diagnostics** |
| Production build | `bun run build` | not executed in this pass (documentation-only); last recorded green at Gate 3.7 |

The 444-test figure is the Gate 3.7 baseline and is the number Gate 3.8 must
protect. Existing tests may not be deleted, skipped or weakened; a legitimate
shared-contract update must be justified in the owning pass inventory.

---

## 2. Authoritative inventory

### 2.1 Schema (from `src/integrations/supabase/types.ts`)

| Table | Gate 3.8 relevance | Key columns |
|---|---|---|
| `tenants` | Onboarding subject | `lifecycle_state`, `provisioning_status`, `dedicated_database_ref`, `activated_at`, `code`, `slug`, `region`, `timezone`, `default_locale`, `primary_contact_email`, `deletion_scheduled_at`, `purge_after` |
| `organizations` | **The company entity** | `tenant_id`, `slug`, `name`, `legal_name`, `is_default`, `lifecycle_state` (`company_lifecycle_state`), `region`, `timezone`, `default_locale`, `metadata` |
| `organization_profiles` | Extended org profile (25 cols) | profile detail surface |
| `organization_branding` | Branding | not in Gate 3.8 scope |
| `branches` | Primary branch | `tenant_id`, `organization_id`, `code`, `name`, `is_default`, `lifecycle_state` (`branch_lifecycle_state`), `timezone`, `address` |
| `organization_invitations` | First-admin invitation | `organization_id`, `email`, `role` (`org_role`), `status`, `token_hash`, `expires_at`, `accepted_at`, `accepted_by`, `revoked_at`, `revoked_by` |
| `organization_members` | Membership | `organization_id`, `user_id`, `role`, `status` (`org_member_status`), `joined_at` |
| `roles`, `permissions`, `role_permissions`, `user_roles` | RBAC | `roles.scope` = `platform | organization`; `user_roles.organization_id` scopes a grant |
| `setting_definitions`, `setting_values` | Settings | scope = `platform | organization`; `is_system`, `is_sensitive` |
| `feature_flags` | Feature controls | `feature_flag_stage` |
| `financial_years` | FY bootstrap | `tenant_id`, `organization_id`, `code`, `start_date`, `end_date`, `is_default`, `is_placeholder`, `lifecycle_state` |
| `audit_logs` | Audit authority | `action`, `entity_type`, `entity_id`, `actor_id`, `occurred_at`, `old_values`, `new_values` |
| `notifications`, `notification_preferences` | Notification authority | registry in `src/lib/notifications/registry.ts` |
| `provisioning_jobs`, `provisioning_steps` | Provisioning verification | job state + step keys |

**There is no onboarding table today.** No `tenant_onboarding`,
`tenant_onboarding_steps`, or equivalent columns on `tenants`.

### 2.2 Application services

| Domain | Module | Public surface |
|---|---|---|
| Tenants / registry | `src/lib/tenants/*` | registry, slug, lifecycle, audit, `tenants.functions.ts` |
| Tenant lifecycle | `src/lib/tenant-lifecycle/*` | pure state machine `lifecycle.ts`, `lifecycle.functions.ts`, `timeline.ts` |
| Company (organization) | `src/lib/organizations/company.functions.ts` | `listCompanies`, `createCompany`, `activateCompany`, `deactivateCompany`, `archiveCompany`, `setDefaultCompany` |
| Org context | `src/lib/organizations.functions.ts` | `listMyOrganizations`, `getOrgContext`, `setCurrentOrganization`, `CURRENT_ORG_COOKIE` |
| Branch | `src/lib/branches/branch.functions.ts` | `listBranches`, `createBranch`, `updateBranch`, `archiveBranch`, `setDefaultBranch` |
| Financial year | `src/lib/financial-years/financial-year.functions.ts` | `listFinancialYears`, `createFinancialYear`, `openFinancialYear`, `closeFinancialYear`, `archiveFinancialYear`, `setDefaultFinancialYear` |
| Invitations / membership | `src/lib/tenant/business-functions.ts` | `listInvitations`, `createInvitation`, `revokeInvitation`, `acceptInvitation`, member directory |
| Settings | `src/lib/settings.functions.ts` + `src/lib/settings-validation.ts` | definition-driven, precedence `default → platform → organization`, sensitive redaction |
| Notifications | `src/lib/notifications/registry.ts`, `service.functions.ts` | code-owned registry |
| Provisioning | `src/lib/provisioning/*`, `src/lib/provisioning-admin/*` | orchestrator + admin read/command facades |
| Platform admin | `src/lib/platform-admin/*` | Gate 3.7 facade pattern to mirror |
| AuthZ | `src/lib/authorization.server.ts`, `src/lib/generated/permission-keys.ts` | `requirePermission` middleware, generated catalog |

Database RPCs already exposed in `public` (SECURITY DEFINER wrappers over
`private`): `fn_create_company`, `fn_activate_company`,
`fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company`,
`fn_enter_maintenance`, `fn_exit_maintenance`, `fn_restore_tenant`,
`fn_schedule_tenant_deletion`, `fn_cancel_tenant_deletion`, `fn_delete_tenant`.

### 2.3 Routing and navigation

All authenticated routes live under `src/routes/_authenticated/platform/*`
(`dashboard`, `tenants`, `companies`, `provisioning`, `admin`). Non-platform
routes are public: `index`, `auth`, `auth.callback`, `forgot-password`,
`reset-password`, `docs`, `403`, `500`. Navigation is centralised in
`src/components/platform/nav-items.ts`; section sub-navigation follows
`src/modules/platform/administration/components/subnav.ts`.

**There is no tenant-authenticated route context or tenant application shell.**

---

## 3. Mandatory discovery questions

### Q1 — Does the tenant table already contain onboarding fields?
**No.** `tenants` carries provisioning and lifecycle fields only
(`provisioning_status`, `lifecycle_state`, `activated_at`, deletion fields).
`activated_at` is written by the *lifecycle* transition, not by an onboarding
workflow. → Onboarding workflow state requires **new persistence**.

### Q2 — Does the organization domain support creating a default organization?
**Yes.** `createCompany` → `public.fn_create_company(...)` inserts into
`organizations`, and `setDefaultCompany` → `fn_set_default_company` maintains
the `is_default` marker. Nothing creates an organization automatically during
provisioning — the provisioning step keys are `validate`, `create_project`,
`apply_migrations`, `seed_database`, `create_administrator`, `verify_health`
(`src/lib/provisioning/constants.ts`) and none of them writes `organizations`.

### Q3 — Does the company domain distinguish a primary/default company?
**Yes** — `organizations.is_default` plus the `fn_set_default_company` RPC.

### Q4 — Does the branch domain distinguish a primary/default branch?
**Yes** — `branches.is_default` plus `setDefaultBranch` / `fn`-backed logic,
scoped by `organization_id` and `tenant_id`.

### Q5 — Can company and branch creation go through existing services?
**Yes.** `createCompany` and `createBranch` are permission-gated server
functions that delegate to database functions. Onboarding must call these and
must never write `organizations` / `branches` directly.

### Q6 — Which invitation system fits the first tenant administrator?
`organization_invitations` via `src/lib/tenant/business-functions.ts`. It
already implements: SHA-256 `token_hash` (plaintext token returned once, never
stored), TTL expiry, `pending | accepted | revoked | expired` status, revoke
with actor, and email-match enforcement against the JWT claim on accept.
Roles available are `org_role` = `owner | admin | member`.
**Gap:** there is no `resendInvitation`; resend must be modelled as revoke +
create, or added as an extension inside the existing module (Pass 3.8.4
decision, not an onboarding-local token implementation).

### Q7 — Does invitation acceptance create membership automatically?
**Yes.** `acceptInvitation` upserts `organization_members`
(`onConflict: organization_id,user_id`, `status: active`, `joined_at`) and then
flips the invitation to `accepted`. Membership detection can therefore read the
authoritative `organization_members` row.

### Q8 — How are tenant-level roles created and assigned?
`roles` is a **global catalogue** with `scope ∈ {platform, organization}`;
`user_roles` carries the scoping (`organization_id`, `role_id`, optional
`expires_at`, soft-delete columns). Membership role (`organization_members.role`)
and RBAC grant (`user_roles`) are separate concerns.
→ Onboarding **assigns**; it must not create role records.

### Q9 — Are default roles seeded globally, per tenant, or per organization?
**Globally**, by migration, into `roles` + `role_permissions`. There is no
per-tenant role seeding path. This makes the spec's "Roles and Permissions
Bootstrap" step an *assignment-only* step.

### Q10 — Which settings are mandatory before activation?
**Unresolved by the repository — escalated.** `setting_definitions` is
data-driven and no definition is flagged "required for activation". The
authoritative-by-construction candidates that already exist as columns rather
than settings are timezone, locale and region (on both `tenants` and
`organizations`). Pass 3.8.1 must define a governed *onboarding required
settings registry* in the onboarding matrix, referencing only keys that exist
in `setting_definitions`, and must reject unknown keys server-side.

### Q11 — Is a financial year mandatory?
**Not universally.** `financial_years` is organization-scoped and supports
`is_placeholder`, which shows the domain already tolerates a non-substantive
year. No module currently hard-requires an open FY. Recommendation:
**conditional** — required only when an authoritative rule (enabled accounting
module / feature flag) demands it, otherwise `skipped` with justification
recorded in the readiness matrix.

### Q12 — Can readiness be derived from current tables?
**Mostly yes.** Tenant existence, provisioning success, lifecycle state,
organization/company presence and default flag, branch presence and default
flag, invitation status, membership, role grants, settings values and financial
years are all queryable today. What cannot be derived is *workflow* state:
which steps were attempted, failure codes, blockers, activation decision.

### Q13 — Which onboarding fields genuinely need new persistence?
Only workflow metadata: `tenant_onboarding` (state, version, timestamps,
actor IDs, blocked reason code + sanitized summary, last readiness timestamp,
correlation ID) and `tenant_onboarding_steps` (step key, status, attempt count,
timestamps, failure code, sanitized failure summary, correlation, updated_by).
No domain data is copied.

### Q14 — Which actions can be safely retried?
All bootstrap steps, provided each is "create-or-select": company creation is
protected by unique slug per tenant, branch by unique code per organization,
invitation by reuse of an outstanding `pending` row, settings by upsert on
`(definition, scope, org)`, financial year by
`(organization_id, code)` / date-overlap validation. Activation must be
idempotent and return the existing result.

### Q15 — Which operations need transactions or locks?
Activation and state transitions. The repository has no advisory-lock helper;
the established substitute is the DB-side transition assertion used by tenant
lifecycle. Gate 3.8 should use an **optimistic `version` column** with a
conditional `UPDATE ... WHERE version = $n`, matching the existing
"database is the enforcer, TS mirrors the matrix" pattern.

### Q16 / Q17 — Tenant activation vs onboarding activation
`tenant_lifecycle_state` is `created → active → …` and is enforced by
`private.fn_assert_lifecycle_transition`, mirrored in
`src/lib/tenant-lifecycle/lifecycle.ts`. `active` means the tenant is
**operationally permitted**, not that a workspace has been bootstrapped.
Recommendation: onboarding `activated` is a **separate workflow terminal
state** that, on success, *delegates* the `created → active` transition to the
existing lifecycle command when the tenant is still `created`, and is a no-op
against lifecycle when the tenant is already `active`. Gate 3.8 adds **no new
lifecycle state**.

### Q18 — Which permissions already suit onboarding?
Already present in `src/lib/generated/permission-keys.ts`:
`PLATFORM_DASHBOARD_VIEW`, `PLATFORM_TENANT_READ/CREATE/UPDATE/ACTIVATE`,
`PLATFORM_COMPANY_READ/CREATE/ACTIVATE/SET_DEFAULT`,
`PLATFORM_BRANCH_READ/CREATE/SET_DEFAULT`,
`PLATFORM_FINANCIAL_YEAR_READ/CREATE/OPEN/SET_DEFAULT`,
`PLATFORM_SETTINGS_MANAGE`, `PLATFORM_ROLES_ASSIGN`,
`PLATFORM_MEMBERSHIPS_MANAGE`, `PLATFORM_INVITATIONS_VIEW/MANAGE`,
`PLATFORM_AUDIT_VIEW`, `PLATFORM_POLICIES_VIEW`.
**Assessment:** reads and every bootstrap write are already covered.
The only semantics not expressible today are *"view the onboarding workflow"*
and *"activate a workspace"* as distinct from tenant activation. Pass 3.8.1
must decide between reusing `PLATFORM_TENANT_READ` + `PLATFORM_TENANT_ACTIVATE`
(zero new permissions — preferred) or adding
`platform.onboarding.view` / `platform.onboarding.manage` /
`platform.onboarding.activate`. Any addition must flow through
`docs/15-governance/permission-catalog.manifest.yaml` +
`bun run gen:permissions`, with role grants, route guards, server guards and
tests updated in the same change.

### Q19 — Can platform operators act on behalf of a tenant?
**Yes, structurally.** Platform-scope permissions gate the existing tenant,
company, branch and financial-year commands, and those commands take explicit
tenant/organization identifiers. There is no impersonation mechanism, and none
should be added.

### Q20 — How is cross-tenant authorization enforced?
Two layers: RLS on every table (organization/tenant scoping, with `user_roles`
+ `has_role`-style checks) and `requirePermission` middleware on server
functions. Onboarding must inherit both and must additionally validate that the
requested `tenantId` matches the workflow row.

---

## 4. Blocker resolution (the nine from the approved plan)

| # | Blocker | Finding | Status |
|---|---|---|---|
| 1 | Is `organizations` the company entity? | **Yes.** `fn_create_company` writes `organizations`; the type is `company_lifecycle_state`; the UI route is `/platform/companies` over the same table. There is **no** distinct company domain. | **RESOLVED** — organization and company are one concept; a single bootstrap step. |
| 2 | Invitation acceptance before activation? | Acceptance is asynchronous and outside operator control; the invitation domain records status authoritatively. | **RECOMMENDATION** — invitation must **exist and be valid** (blocking); acceptance + membership is a **warning**, and a platform operator holding the activation permission may activate with it pending. To be ratified in the readiness matrix. |
| 3 | Financial year mandatory? | `is_placeholder` exists; no module hard-requires an open FY. | **RECOMMENDATION** — **conditional**; `skipped` with reason when no authoritative rule applies. |
| 4 | Lifecycle `active` vs onboarding `activated` | Distinct concerns; see Q16/Q17. | **RESOLVED** — separate onboarding terminal state that delegates the lifecycle transition; no new lifecycle state. |
| 5 | Canonical platform route | Gate 3.7 established `/platform/admin` as the operations control plane with an eight-item subnav and a single guarded layout. | **RESOLVED** — `/platform/admin/onboarding` (+ `/$tenantId`, `/$tenantId/readiness`, `/$tenantId/activity`). One canonical tree; no `/platform/onboarding`. |
| 6 | Tenant-authenticated shell? | **Does not exist.** Every authenticated route is under `_authenticated/platform`. | **RESOLVED** — Pass 3.8.7 must **not** create a tenant shell. Deliver the wizard as an operator-run wizard inside `/platform/admin/onboarding/$tenantId`, and formally defer the tenant-facing self-service wizard to a later gate. |
| 7 | Permissions | See Q18. | **RECOMMENDATION** — reuse existing keys; add none unless Pass 3.8.1 proves a gap. |
| 8 | DTO location | Application contracts today sit beside their service (`src/lib/platform-admin/*`) while Gate 3.7 placed DTOs in the UI module (`src/modules/platform/administration/types/v1/`). That UI placement is a Gate 3.7 artefact, not a documented standard. | **RESOLVED** — Gate 3.8 application DTOs live in **`src/lib/tenant-onboarding/types/v1/`**; the UI module holds presentation-only types. |
| 9 | Activity timeline authority | `audit_logs` is the audit authority and already carries actor, action, entity and `occurred_at`; onboarding step rows carry workflow attempts; `notifications` carries operator messaging. | **RESOLVED** — **composed read** over `audit_logs` (filtered by onboarding actions/entities) + `tenant_onboarding_steps`. **No new event-history table.** |

Two items (2 and 3) plus the settings registry (Q10) remain *policy* decisions
rather than repository facts. They are carried into
`PHASE3_GATE38_READINESS_MATRIX.md` in Pass 3.8.1 for explicit ratification.

---

## 5. Capability classification

| Capability | Classification | Authority |
|---|---|---|
| Tenant existence / metadata reads | Reuse | `src/lib/tenants/registry.ts`, `tenants.functions.ts` |
| Provisioning verification | Reuse (read-only) | `src/lib/provisioning-admin/query-service.server.ts` |
| Tenant lifecycle transition at activation | Reuse (delegate) | `src/lib/tenant-lifecycle/*` |
| Organization/company bootstrap | Reuse | `createCompany`, `setDefaultCompany` |
| Primary branch bootstrap | Reuse | `createBranch`, `setDefaultBranch` |
| First-admin invitation | Reuse | `createInvitation`, `revokeInvitation`, `acceptInvitation` |
| Invitation resend | Extend (inside the invitation module) | no `resend` exists today |
| Membership detection | Reuse | `organization_members` |
| Role assignment | Reuse | `user_roles` + RBAC helpers |
| Role creation | **Defer / not applicable** | roles are globally seeded by migration |
| Required settings | Extend | governed onboarding registry over `setting_definitions` |
| Financial-year bootstrap | Reuse (conditional) | `createFinancialYear`, `openFinancialYear`, `setDefaultFinancialYear` |
| Audit writes | Reuse | `audit_logs` + existing audit helpers |
| Notifications | Reuse | `src/lib/notifications/registry.ts` |
| Onboarding workflow + step persistence | **Add** | no equivalent exists |
| Onboarding state machine | **Add** (pure, mirrors DB checks) | pattern from `tenant-lifecycle/lifecycle.ts` |
| Readiness engine | **Add** (pure) | pattern from `platform-admin/attention.ts` |
| Onboarding query/command facades | **Add** | pattern from `src/lib/platform-admin/*` |
| Platform onboarding console | **Add** | pattern from `src/modules/platform/administration/*` |
| Tenant self-service wizard | **Defer** | no tenant application shell exists |
| Onboarding permissions | Reuse preferred; Add only if 3.8.1 proves a gap | generated catalog |
| Provisioning engine, providers, retry/rollback | **Untouched** | protected subsystems |

---

## 6. Known limitations recorded at discovery

- Invitation acceptance is asynchronous and cannot be forced by the platform.
- No `resendInvitation` exists; resend must be added to the invitation module
  or expressed as revoke + create.
- No advisory-lock helper exists; concurrency will use optimistic versioning.
- Provider telemetry is historical only (Gate 3.7 limitation, inherited).
- No tenant application shell, therefore no tenant self-service wizard in this
  gate.
- No billing, metering, data import or module configuration in Gate 3.8.

---

## 7. Pass 3.8.0 inventory

| Item | Value |
|---|---|
| Files created | `docs/60-engineering/PHASE3_GATE38_DISCOVERY.md` |
| Files modified | none |
| Migrations added | none |
| Production code changed | none |
| Protected files touched | none |
| Tests added / changed | none |
| Test count (start / end) | 444 / 444 |
| Typecheck (start / end) | clean / clean |
| Known failures | none |
| Deferred work | Tenant self-service wizard; policy ratification for invitation acceptance, financial-year conditionality and the required-settings registry (Pass 3.8.1) |

**Stop.** Pass 3.8.1 has not been started.
