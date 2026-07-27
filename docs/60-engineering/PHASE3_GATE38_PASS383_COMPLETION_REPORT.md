# Phase 3 · Gate 3.8 — Pass 3.8.3 Completion Report

- Sprint: SPR-MOD-001-003
- Pass: 3.8.3 — Tenant onboarding bootstrap commands
- Execution model: lean repository-first (single pass, no Commit A/B/C subworkflow)
- Date (UTC): 2026-07-27
- Status: **COMPLETE — QUALITY GATES PASS**

---

## 1. Authorization and baseline

Pass 3.8.2 is CLOSED and accepted at `573f7a5a78f5957d0ff65d596350766a06a2360e`.
Pass 3.8.3 was authorized to start under the lean execution model.

Finding `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` remains **OPEN** as a release
blocker. It is out of scope for this pass, is unaffected by the changes below,
and is restated in §7 so it is not lost.

---

## 2. Scope delivered

Pass 3.8.3 adds the **write side** of tenant onboarding: workflow start,
provisioning verification, and the four bootstrap steps that Gate 3.8 assigns
to this pass.

| Step key | Command | Ownership model |
| --- | --- | --- |
| — (workflow) | `startTenantOnboarding` | Onboarding-owned workflow row |
| `provisioning_verified` | `verifyTenantProvisioning` | **Observed** — provisioning owns truth |
| `organization_profile` | `saveOnboardingOrganizationProfile` | Delegated to `fn_create_company` |
| `primary_branch` | `saveOnboardingPrimaryBranch` | Delegated to `fn_create_branch` / `fn_set_default_branch` |
| `required_settings` | `initializeOnboardingSettings` | Delegated to settings tables under registry allow-list |
| `financial_year` | `initializeOnboardingFinancialYear` | Delegated to `fn_create_financial_year` |

Explicitly **not** in this pass: tenant-admin invitation and membership, role
assignment, readiness evaluation, and activation. Those remain assigned to
Pass 3.8.4 / 3.8.5.

---

## 3. Changes

### 3.1 Database

One migration adds two permission-gated `SECURITY DEFINER` routines:

- `public.fn_onboarding_start(_tenant_id, _correlation_id)`
- `public.fn_onboarding_record_step(_tenant_id, _step_key, _status, _failure_code, _failure_summary, _correlation_id, _expected_version)`

Both raise SQLSTATE `42501` when the caller lacks `platform.tenant.update`, via
`private.fn_user_has_permission`. Authorization is **procedural denial**: an
unauthorized caller receives an exception, never an empty or partial result, so
"denied" and "no-op" can never be confused.

The onboarding tables remain `SELECT`-only for `authenticated`. No new table
was created, and the Pass 3.8.2 RLS posture is unchanged — all workflow writes
funnel through the two routines above.

### 3.2 Application

| Path | Change |
| --- | --- |
| `src/lib/tenant-onboarding/server/command-service.server.ts` | New. Write-side coordination service. |
| `src/lib/tenant-onboarding/commands.functions.ts` | New. Permission-gated server-function facade. |
| `src/lib/tenant-onboarding/types/v1/onboarding-bootstrap-result.dto.ts` | New. Additive `OnboardingBootstrapResultDTO`. |
| `src/lib/tenant-onboarding/types/v1/index.ts` | Export of the new DTO. |
| `src/lib/tenant-onboarding/__tests__/architecture.test.ts` | Boundary allow-list widened from 3 to 5 server files; the write-free rule is now scoped to the read layer only. |
| `src/lib/tenant-onboarding/__tests__/commands.test.ts` | New. 13 command assertions. |

No pre-existing schema, contract, or read-layer behaviour was modified. No UI
was added in this pass.

---

## 4. Design decisions

**Onboarding never owns domain data.** Every domain write is delegated to the
existing owning routine. Onboarding writes only its own workflow and step rows.
This keeps the module a coordinator and prevents a second source of truth for
organizations, branches, settings, or financial years.

**`provisioning_verified` is observed, not performed.** The command reads the
latest `provisioning_jobs` row and records `completed` as a verified step and
anything else as `blocked` with `provisioning_incomplete` / `provisioning_missing`.
Onboarding never mutates provisioning state.

**Settings writes are allow-listed twice.** The Zod schema restricts keys to the
repository-owned onboarding settings registry (G38-POL-010), and the service
re-checks the key set before any statement runs. Definitions flagged
`is_system` are refused. Values are validated through the existing
`validateSettingValue`, so onboarding does not fork settings validation.
Sensitive values are never echoed into audit metadata.

**Failures are recorded, not thrown.** A domain failure is classified into a
stable machine code, recorded as a `failed` step on the workflow, and returned
as a typed rejection. Raw driver messages, SQL fragments, and stack traces never
cross the transport boundary — asserted by test.

**Audit is observational.** Audit writes are best-effort and can never fail a
command that already succeeded, which avoids a successful domain write being
reported as a failure.

**Terminology.** `organizationId` throughout, per G38-POL-001. `companyId` does
not appear in any Pass 3.8.3 contract.

---

## 5. Authorization matrix

All keys are pre-existing; Pass 3.8.3 introduced no new permission key.

| Command | Required permissions (all) |
| --- | --- |
| `startTenantOnboarding` | `platform.tenant.update` |
| `verifyTenantProvisioning` | `platform.tenant.update` |
| `saveOnboardingOrganizationProfile` | `platform.tenant.update`, `platform.company.create` |
| `saveOnboardingPrimaryBranch` | `platform.tenant.update`, `platform.branch.create` |
| `initializeOnboardingSettings` | `platform.tenant.update`, `platform.settings.manage` |
| `initializeOnboardingFinancialYear` | `platform.tenant.update`, `platform.financial_year.create` |

Enforcement is layered: transport middleware (`requireAllPermissions`), then an
independent database re-check inside each routine. Every statement runs on the
caller-scoped client — the service-role client is not imported by this module,
which the architecture test enforces.

---

## 6. Quality gates

| Gate | Result |
| --- | --- |
| Full test suite | **PASS** — 525/525 across 50 files (was 512; +13) |
| Typecheck (`tsc --noEmit`) | **PASS** — 0 diagnostics |
| Production build | **PASS** |
| Boundary / isolation tests | **PASS** — server allow-list, no service-role client, no `process.env` |
| RBAC tests | **PASS** — denial mapping and sanitized messaging asserted |
| Unrelated changes | **NONE** — 6 paths touched, all in scope |

---

## 7. Open finding carried forward

`FINDING-AUTH-SIGNUP-TENANT-FK-20260726` — the signup trigger
`private.fn_handle_new_auth_user` violates the `NOT NULL` constraint on
`tenant_id`. Severity: **release blocker**. Status: **OPEN**, unchanged by this
pass, tracked separately.

---

## 8. Follow-on eligibility

Pass 3.8.3 is complete. Pass 3.8.4 (tenant-admin invitation, membership, role
assignment) is eligible to start. Readiness evaluation and activation remain
with Pass 3.8.5, and the queue's `blockerCount`, `invitationStatus`, and
`readinessStatus` projections stay at their Pass 3.8.2 constants until then.
