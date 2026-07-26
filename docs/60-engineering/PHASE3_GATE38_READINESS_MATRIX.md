# Phase 3 — Gate 3.8 Readiness Matrix

**Sprint:** SPR-MOD-001-003 · **Gate:** 3.8 · **Pass:** 3.8.1 (Architecture & Contracts)
**Implementation:** all evaluation logic is owned by **Pass 3.8.5** (G38-POL-009).
Pass 3.8.1 defines the contract; Pass 3.8.2 may expose only
`evaluationStatus: "not_evaluated"`.

Classification vocabulary: `mandatory` · `conditional` · `warning` · `merged` ·
`deferred` · `n/a`.

---

## 1. Classified checks

### 1.1 Identity, classification and authority

| Check Key | Description | Classification | Owning Module | Source of Truth |
|---|---|---|---|---|
| `tenant_exists` | The tenant record exists and is readable | Mandatory | tenants | `tenants` |
| `provisioning_completed` | Provisioning finished successfully | Mandatory | provisioning | `provisioning_jobs` |
| `no_unresolved_rollback` | No provisioning rollback is outstanding | Merged into `provisioning_completed` | provisioning | `provisioning_jobs.state` |
| `lifecycle_permits_onboarding` | Tenant lifecycle state allows onboarding/activation | Mandatory | tenant-lifecycle | `tenants.lifecycle_state` |
| `tenant_not_deleted` | Tenant is not deleted | Merged into `lifecycle_permits_onboarding` | tenant-lifecycle | `tenants.lifecycle_state` |
| `tenant_not_pending_deletion` | Tenant is not scheduled for deletion | Merged into `lifecycle_permits_onboarding` | tenant-lifecycle | `tenants.lifecycle_state`, `deletion_scheduled_at` |
| `organization_exists` | A default organization (company) exists | Mandatory | organizations | `organizations` |
| `organization_valid` | The organization is active and marked default | Merged into `organization_exists` | organizations | `organizations.lifecycle_state`, `is_default` |
| `primary_branch_exists` | A default branch exists for the organization | Mandatory | branches | `branches.is_default` |
| `admin_invitation_valid` | A valid (pending, unexpired) or accepted administrator invitation exists | Mandatory | tenant/invitations | `organization_invitations` |
| `admin_invitation_accepted` | The administrator accepted the invitation | Warning | tenant/invitations | `organization_invitations.accepted_at` |
| `admin_membership_exists` | An active membership exists for the administrator | Conditional (post-acceptance) | tenant/memberships | `organization_members` |
| `admin_role_assigned` | An administrative role is selected (pre) or granted (post) | Conditional (post-acceptance) | rbac | `organization_invitations.role` / `user_roles` |
| `required_settings_valid` | Every blocking registry setting has a valid value | Mandatory | settings | `setting_values` + onboarding registry |
| `financial_year_present` | A financial year exists where required | Conditional | financial-years | `financial_years` |
| `no_failed_or_blocked_step` | No onboarding step is `failed` or `blocked` | Mandatory | tenant-onboarding | `tenant_onboarding_steps` |
| `no_concurrent_activation` | No other activation is in flight | Mandatory (technical guard) | tenant-onboarding | `tenant_onboarding.version` / `state` |
| `no_data_integrity_conflict` | Organization, branch, invitation and workflow all reference the same tenant | Mandatory | tenant-onboarding | cross-table comparison |

### 1.2 Evaluation rules

| Check Key | Evaluation Input | Pass Condition | Warning Condition | Block Condition |
|---|---|---|---|---|
| `tenant_exists` | `tenantId` | Row found | — | Row absent or unreadable |
| `provisioning_completed` | latest job for tenant | `status = provisioned` and no outstanding rollback | Job `in_progress` | `failed`, rolled back, or no job |
| `lifecycle_permits_onboarding` | `lifecycle_state`, `deletion_scheduled_at` | State ∈ `{created, active}` | State = `maintenance` | State ∈ `{suspended, archived, pending_deletion, deleted}` |
| `organization_exists` | organizations for tenant | ≥1 active org with `is_default = true` | Org exists but not default | No active org |
| `primary_branch_exists` | branches for default org | ≥1 active branch with `is_default = true` | Branch exists but not default | No active branch |
| `admin_invitation_valid` | invitations for default org | A `pending` unexpired or `accepted` invitation with an administrative role | Expiry within 48h | None, or only revoked/expired |
| `admin_invitation_accepted` | `accepted_at` | `accepted_at` is set | `accepted_at` null while invitation valid | *(never blocks — G38-POL-003)* |
| `admin_membership_exists` | `organization_members` | Active membership, **or** invitation not yet accepted | Accepted but membership inactive | Accepted **and** no active membership |
| `admin_role_assigned` | invitation role / `user_roles` | Administrative role on the invitation (pre) or an active grant (post) | Accepted but grant not yet materialized | Accepted **and** no administrative grant |
| `required_settings_valid` | registry ∩ `setting_values` | Every `readinessImpact = block` key present and valid | An optional key unset | A blocking key missing or invalid |
| `financial_year_present` | authoritative trigger + `financial_years` | Not required, or required and present | Present but `is_placeholder` | Required and absent |
| `no_failed_or_blocked_step` | `tenant_onboarding_steps` | No step in `failed`/`blocked` | — | Any step `failed` or `blocked` |
| `no_concurrent_activation` | workflow row | No in-flight activation for this tenant | — | Another activation holds the workflow version |
| `no_data_integrity_conflict` | cross-table tenant ids | All references agree | — | Any mismatch |

### 1.3 Operator surface

| Check Key | Operator Explanation (sanitized) | Reason Code | Reason Parameters | Deep Link |
|---|---|---|---|---|
| `tenant_exists` | "The tenant record could not be read." | `tenant_missing` | `tenantId` | `/platform/tenants` |
| `provisioning_completed` | "Provisioning has not completed successfully for this tenant." | `provisioning_incomplete` | `jobState`, `failedStepKey` | `/platform/provisioning` |
| `lifecycle_permits_onboarding` | "The tenant's lifecycle state does not permit activation." | `lifecycle_state_blocks` | `lifecycleState` | `/platform/tenants` |
| `organization_exists` | "No default organization has been created for this tenant." | `organization_missing` | `organizationCount` | `/platform/companies` |
| `primary_branch_exists` | "The default organization has no primary branch." | `branch_missing` | `organizationId` | `/platform/companies` |
| `admin_invitation_valid` | "No valid first-administrator invitation exists." | `invitation_missing` | `invitationStatus` | `/platform/admin/onboarding/:tenantId` |
| `admin_invitation_accepted` | "The administrator has not accepted the invitation yet. Activation may proceed." | `invitation_pending_acceptance` | `expiresAt` | `/platform/admin/onboarding/:tenantId` |
| `admin_membership_exists` | "The invitation was accepted but no active membership was found." | `membership_missing_after_acceptance` | `organizationId` | `/platform/admin/onboarding/:tenantId` |
| `admin_role_assigned` | "The accepted administrator holds no administrative role." | `admin_role_missing` | `invitedRole` | `/platform/admin` |
| `required_settings_valid` | "One or more required settings are missing or invalid." | `required_setting_missing` | `settingKey` | `/platform/admin/settings` |
| `financial_year_present` | "A financial year is required by an enabled module but none exists." | `financial_year_required` | `triggerSource` | `/platform/companies` |
| `no_failed_or_blocked_step` | "An onboarding step is failed or blocked." | `step_not_clear` | `stepKey`, `status` | `/platform/admin/onboarding/:tenantId` |
| `no_concurrent_activation` | "Another activation is already in progress for this tenant." | `activation_in_flight` | `correlationId` | `/platform/admin/onboarding/:tenantId` |
| `no_data_integrity_conflict` | "Onboarding data references more than one tenant." | `tenant_reference_mismatch` | `entity` | `/platform/admin/onboarding/:tenantId` |

### 1.4 Re-evaluation, tests and provenance

| Check Key | Re-evaluation Trigger | Test Requirement | Implementation Pass | Decision Reference |
|---|---|---|---|---|
| `tenant_exists` | Tenant delete/restore | Present / absent | 3.8.5 | — |
| `provisioning_completed` | Job state change | provisioned / failed / running / absent | 3.8.5 | — |
| `lifecycle_permits_onboarding` | Lifecycle transition | Each state in the matrix | 3.8.5 | Discovery Q16/Q17 |
| `organization_exists` | Organization create / archive / set-default | Present-default / present-non-default / absent | 3.8.5 | G38-POL-001 |
| `primary_branch_exists` | Branch create / archive / set-default | Present-default / present-non-default / absent | 3.8.5 | G38-POL-001 |
| `admin_invitation_valid` | Invitation create / revoke / expiry | pending / accepted / revoked / expired / none | 3.8.5 | G38-POL-003 |
| `admin_invitation_accepted` | Invitation acceptance | pending ⇒ warning, never blocker | 3.8.5 | G38-POL-003 |
| `admin_membership_exists` | Acceptance, membership change | pre-acceptance pass; post-acceptance missing ⇒ block | 3.8.5 | G38-POL-003 |
| `admin_role_assigned` | Role grant / revoke | pre-acceptance warning; post-acceptance block | 3.8.5 | G38-POL-003, G38-POL-005 |
| `required_settings_valid` | Setting value write | Each blocking key missing / invalid / valid | 3.8.5 | G38-POL-010 |
| `financial_year_present` | FY create/close, module enablement change | required-present / required-absent / not-applicable | 3.8.5 | G38-POL-004 |
| `no_failed_or_blocked_step` | Any step write | failed / blocked / clear | 3.8.5 | — |
| `no_concurrent_activation` | Activation start/finish | Conflicting version ⇒ block | 3.8.5 | Discovery Q15 |
| `no_data_integrity_conflict` | Any bootstrap write | Mismatched tenant reference ⇒ block | 3.8.5 | Discovery Q20 |

---

## 2. Merged and deferred checks — justification

| Candidate | Outcome | Justification |
|---|---|---|
| No unresolved provisioning rollback | **Merged** into `provisioning_completed` | Rollback state lives on the same job row; two checks over one source would double-report a single failure. |
| Tenant not deleted | **Merged** into `lifecycle_permits_onboarding` | `deleted` is one value of `tenants.lifecycle_state`; the single state check covers it with a clearer reason parameter. |
| Tenant not pending deletion | **Merged** into `lifecycle_permits_onboarding` | Same source column; the state matrix already excludes `pending_deletion`. |
| Organization is valid | **Merged** into `organization_exists` | Existence is only meaningful for an active, default organization; a separate check cannot fail independently. |
| Required administrator membership exists | **Conditional, not mandatory** | Membership cannot exist before acceptance (`acceptInvitation` creates it); making it mandatory would silently make acceptance mandatory, contradicting G38-POL-003. |
| Required role assignment exists | **Conditional, not mandatory** | Same dependency: the pre-acceptance authority is `organization_invitations.role`, not `user_roles`. |
| Invitation accepted | **Warning** | Outside operator control and dependent on email delivery and user availability (G38-POL-003). |
| Financial year exists | **Conditional** | No module hard-requires one today; the authoritative trigger is an unresolved prerequisite for Pass 3.8.5 (G38-POL-004). |
| Notification delivery confirmed | **Deferred / n/a** | No per-channel delivery store exists (Gate 3.7 discovery §5); nothing authoritative can be evaluated. |

**No candidate from the master specification is omitted without an entry above.**

---

## 3. Aggregation contract

- `overallStatus = not_ready` when any check evaluates to `blocked`.
- `overallStatus = ready_with_warnings` when no check is `blocked` and at least
  one is `warning`.
- `overallStatus = ready` when every applicable check passes.
- `not_applicable` checks are excluded from both counts.
- Activation requires `overallStatus ∈ {ready, ready_with_warnings}`; when
  warnings are present the operator must acknowledge them
  (`activateWorkspaceSchema.acknowledgeWarnings`).
