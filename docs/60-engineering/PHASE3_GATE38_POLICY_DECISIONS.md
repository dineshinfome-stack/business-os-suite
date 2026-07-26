# Phase 3 — Gate 3.8 Policy Decisions
## Tenant Onboarding, Organization Activation & Workspace Bootstrap

**Sprint:** SPR-MOD-001-003
**Gate:** 3.8
**Pass:** 3.8.1 — Architecture and Contracts
**Status:** RATIFIED
**Authority:** `docs/60-engineering/PHASE3_GATE38_DISCOVERY.md` (Pass 3.8.0)

Every decision below is binding on Passes 3.8.2 – 3.8.8. A later pass may not
silently deviate; it must escalate a conflict instead.

---

## G38-POL-001 — Organization and Company Terminology

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Context** | The master specification names a "company bootstrap" step. The repository has no company table. |
| **Decision** | `organizations` **is** the company entity. Gate 3.8 has ONE combined bootstrap concept: *organization/company bootstrap*. |
| **Repository evidence** | `public.fn_create_company` inserts into `organizations`; the enum is `company_lifecycle_state`; `/platform/companies` reads `organizations`; there is no company table, repository, service or DTO anywhere in `src/`. |
| **Alternatives considered** | (a) Introduce a company aggregate over organizations — rejected: duplicate persistence and terminology with no domain benefit. (b) Rename organizations to companies — rejected: breaking change across RLS, RPCs, routes and Gate 3.7 surfaces. |
| **Consequences** | One bootstrap step (`organization_profile`); one organization DTO family; branch belongs to organization; no `primary_company` step key. |
| **Owning module** | `src/lib/organizations` |
| **Implementation impact** | Passes 3.8.3/3.8.6/3.8.7 call `createCompany` / `setDefaultCompany`; new code uses `organization*` identifiers. User-facing labels may read "Company" only where the existing UI already does. |
| **Test impact** | `contracts.test.ts` asserts no step key contains `company` and that the matrix never mentions `primary_company`. |
| **Deferred implications** | None. |

**Terminology mapping:** RPC `fn_create_company` → writes `organizations`; UI label "Company" → domain term `organization`; DTO field `organizationId` is the single identifier — `companyId` must never appear in Gate 3.8 contracts.

---

## G38-POL-002 — Delivery Surface

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Context** | The spec envisages a tenant-facing onboarding wizard. |
| **Decision** | Gate 3.8 is delivered **operator-run inside the Platform Administration shell**. Canonical routes: `/platform/admin/onboarding` and `/platform/admin/onboarding/:tenantId`. Tenant self-service onboarding is **deferred**. |
| **Repository evidence** | Every authenticated route lives under `src/routes/_authenticated/platform/*`; there is no tenant application shell or tenant-authenticated route context. |
| **Alternatives considered** | Build a tenant shell in Gate 3.8 — rejected: an entire authentication/navigation surface outside this gate's scope. |
| **Consequences** | No `/onboarding`, `/tenant/onboarding` or `/app/onboarding` route may be created; Pass 3.8.7 is an operator wizard. |
| **Owning module** | `src/routes/_authenticated/platform/admin` (Pass 3.8.6) |
| **Implementation impact** | Guarded by the existing admin layout guard; sub-navigation follows the Gate 3.7 subnav pattern. |
| **Test impact** | Navigation tests in Pass 3.8.6. |
| **Deferred implications** | Tenant self-service wizard deferred to a later gate together with the tenant shell. |

---

## G38-POL-003 — Invitation Acceptance (and invitation-dependent steps)

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Context** | Activation must not depend on a human accepting an email. |
| **Decision** | A **valid first-administrator invitation must exist** (mandatory readiness requirement). **Acceptance is warning-only**: activation may proceed with acceptance pending, and the readiness result must surface the pending acceptance as a warning. |
| **Repository evidence** | `organization_invitations` records `pending / accepted / revoked / expired`, TTL and `accepted_at`; `acceptInvitation` (in `src/lib/tenant/business-functions.ts`) upserts `organization_members` only at acceptance time — membership therefore cannot exist before acceptance. |
| **Alternatives considered** | Require acceptance before activation — rejected: makes activation depend on email delivery, user availability and timing, which the operator cannot control. |
| **Consequences** | See the binding sub-policy below. |
| **Owning module** | `src/lib/tenant` (invitations & membership) |
| **Implementation impact** | Pass 3.8.4 completes `tenant_admin_invitation` on a valid pending invitation; Pass 3.8.5 emits warnings, never blockers, for pending acceptance. |
| **Test impact** | `contracts.test.ts` asserts membership and role steps are not mandatory. |
| **Deferred implications** | Post-acceptance integrity checks may be evaluated as mandatory once acceptance has occurred. |

### Binding sub-policy — invitation-dependent steps

When a valid first-administrator invitation exists but has **not** yet been accepted:

- `tenant_admin_invitation` **may be completed**.
- Pending acceptance produces a **readiness warning only**.
- `tenant_admin_membership` **must not block activation**; it is classified
  *conditional/warning* until acceptance occurs.
- `roles_assigned` **must not require** a persisted membership or `user_roles`
  record before acceptance.
- The **role selected on the valid invitation** satisfies the pre-acceptance
  onboarding requirement (`organization_invitations.role`).
- **After acceptance**, membership existence and the effective RBAC grant are
  evaluated as **mandatory post-acceptance integrity checks**.
- Readiness matrix and onboarding matrix use the same classification and the
  same source-of-truth rules.

**Concept separation:** *role selected on an invitation*
(`organization_invitations.role`, an intent) ≠ *role granted to an accepted
organization member* (`organization_members.role` + `user_roles`, a fact).

---

## G38-POL-004 — Financial Year

| Field | Value |
|---|---|
| **Status** | Ratified (trigger source: **unresolved — implementation prerequisite for Pass 3.8.5**) |
| **Context** | The spec lists financial-year initialization as an onboarding step. |
| **Decision** | Financial-year initialization is **conditional**. It is mandatory only when an enabled module, active capability or authoritative organization policy requires it. |
| **Repository evidence** | `financial_years` is organization-scoped and supports `is_placeholder`; no module currently hard-requires an open financial year; no accounting module is enabled in this repository state. |
| **Alternatives considered** | Always mandatory — rejected: hard-codes accounting assumptions into a platform workflow. Always optional — rejected: accounting modules will need it. |
| **Consequences** | The step may legitimately be `skipped` with a recorded reason; the readiness check is `conditional` and is `not_applicable` when no dependent module is enabled. |
| **Owning module** | `src/lib/financial-years` |
| **Implementation impact** | **Prerequisite for Pass 3.8.5:** an authoritative trigger source must be identified before readiness evaluation ships. Candidates (none yet ratified): a `feature_flags` entry for the accounting module, or a module-enablement table introduced by MOD-002. Pass 3.8.5 must not invent one. |
| **Test impact** | Readiness tests must cover: required-and-present, required-and-absent, and not-applicable. |
| **Deferred implications** | Until the trigger exists, the check evaluates to `not_applicable`. |

---

## G38-POL-005 — Roles

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Decision** | Roles are **globally seeded**. Onboarding **assigns** existing roles and never creates or redefines a role or permission. |
| **Repository evidence** | `roles` + `role_permissions` are seeded by migration with `scope ∈ {platform, organization}`; there is no per-tenant role seeding path; `user_roles` carries the organization scoping. |
| **Alternatives considered** | Per-tenant role seeding at onboarding — rejected: no repository support and a privilege-escalation surface. |
| **Consequences** | `roles_assigned` is an assignment-only step. |
| **Owning module** | RBAC (`roles`, `user_roles`) |
| **Test impact** | `architecture.test.ts` asserts no role/permission definitions inside the onboarding module. |

---

## G38-POL-006 — Permission Strategy

| Field | Value |
|---|---|
| **Status** | Ratified — **reuse only, zero new permissions in Gate 3.8** |
| **Decision** | Reuse existing permission keys wherever semantics match. No permission constants, manifest rows or generated keys are added in Pass 3.8.1. |
| **Repository evidence** | `src/lib/generated/permission-keys.ts` already covers every read and every bootstrap write (see Discovery Q18). |
| **Consequences** | Onboarding introduces no migration, manifest change or `gen:permissions` run. |
| **Test impact** | None in this pass; route/server guards are tested in Passes 3.8.3–3.8.6. |

### Permission plan

| Capability | Permission (reused) | Semantic reason |
|---|---|---|
| List onboarding workflows | `PLATFORM_TENANT_READ` | The workflow is tenant-scoped metadata about a tenant record. |
| View onboarding detail / steps / activity | `PLATFORM_TENANT_READ` | Same subject; no side effects. |
| Start / resume / cancel / restart onboarding | `PLATFORM_TENANT_UPDATE` | Mutates tenant-scoped workflow state without changing lifecycle. |
| Bootstrap organization (company) | `PLATFORM_COMPANY_CREATE` (+ `PLATFORM_COMPANY_SET_DEFAULT`) | Delegates to the existing guarded company commands. |
| Bootstrap primary branch | `PLATFORM_BRANCH_CREATE` (+ `PLATFORM_BRANCH_SET_DEFAULT`) | Delegates to the existing guarded branch commands. |
| Invite first administrator | `PLATFORM_INVITATIONS_MANAGE` | Existing invitation-management semantics. |
| Read invitation status | `PLATFORM_INVITATIONS_VIEW` | Read-only. |
| Assign administrator roles | `PLATFORM_ROLES_ASSIGN` (+ `PLATFORM_MEMBERSHIPS_MANAGE`) | Assignment-only per G38-POL-005. |
| Initialize required settings | `PLATFORM_SETTINGS_MANAGE` | Existing settings-write semantics. |
| Initialize financial year | `PLATFORM_FINANCIAL_YEAR_CREATE` / `_OPEN` / `_SET_DEFAULT` | Existing FY commands. |
| Run readiness | `PLATFORM_TENANT_READ` | Evaluation is read-only apart from a timestamp on the workflow row, which the caller already owns via `PLATFORM_TENANT_UPDATE` when persisted. |
| Activate workspace | `PLATFORM_TENANT_ACTIVATE` | Activation delegates the `created → active` lifecycle transition. |

**Semantic gaps identified (documented, NOT implemented):** the repository
cannot today express *"view the onboarding workflow"* or *"activate a
workspace"* as distinct from tenant read/activate. This is accepted: the
operator population for both is identical, so reuse is correct. Should the
populations ever diverge, `platform.onboarding.view` / `.manage` / `.activate`
would be added through `docs/15-governance/permission-catalog.manifest.yaml`
plus `bun run gen:permissions`, with role grants, route guards, server guards,
tests and a migration in one change.

---

## G38-POL-007 — DTO Ownership

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Decision** | Versioned application DTOs live at **`src/lib/tenant-onboarding/types/v1/`**. UI modules may own presentation-only types but never application contracts. |
| **Repository evidence** | Application contracts sit beside their service (`src/lib/platform-admin/*`); the Gate 3.7 placement inside `src/modules/platform/administration/types/v1/` is an artefact, not a documented standard. |
| **Consequences** | The Pass 3.8.6/3.8.7 UI imports from the application layer, never the reverse. |
| **Test impact** | `architecture.test.ts` forbids `@/modules` and `@/components` imports inside the module. |

---

## G38-POL-008 — Activity Timeline

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Decision** | The onboarding activity timeline is a **sanitized composed read** over `audit_logs` (filtered to onboarding actions/entities) and `tenant_onboarding_steps`, discriminated by `source`. **No duplicate event-history table.** |
| **Repository evidence** | `audit_logs` is the audit authority and already carries actor, action, entity and `occurred_at`. |
| **Consequences** | `TenantOnboardingActivityDTO` exposes no `old_values` / `new_values`; Pass 3.8.2 adds no event table. |

---

## G38-POL-009 — Readiness Ownership

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Decision** | Readiness **evaluation** belongs exclusively to **Pass 3.8.5**. Pass 3.8.1 defines the contract; Pass 3.8.2 may expose only `evaluationStatus: "not_evaluated"`. |
| **Consequences** | `TenantOnboardingReadinessDTO.overallStatus` is `null` until evaluated. |
| **Test impact** | Readiness DTO supports `not_evaluated` by construction. |

---

## G38-POL-010 — Required Settings Registry

| Field | Value |
|---|---|
| **Status** | Ratified |
| **Decision** | An **allow-listed, repository-owned** onboarding settings registry governs which setting keys onboarding may write. Unknown keys are rejected by the Pass 3.8.3 command layer. |
| **Repository evidence** | `setting_definitions` is data-driven and flags no key as "required for activation"; every registry entry in `required-settings.registry.ts` was verified to exist in `public.setting_definitions` during this pass. |
| **Consequences** | See the registry table in `PHASE3_GATE38_ONBOARDING_MATRIX.md` §4, including proposed-but-not-added keys. |
| **Test impact** | `schemas.test.ts` rejects unknown setting keys and validates every registry entry. |

---

## Manual verification checklist (Pass 3.8.1)

- [x] Every workflow state in this document exists in `state-machine.ts`.
- [x] Every step key in `contracts.ts` appears in the onboarding matrix.
- [x] Every readiness candidate is classified in the readiness matrix.
- [x] Every policy decision has a stable `G38-POL-NNN` ID.
- [x] No separate company abstraction appears in any Gate 3.8 contract.
