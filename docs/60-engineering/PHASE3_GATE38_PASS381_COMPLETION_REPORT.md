# Phase 3 — Gate 3.8 · Pass 3.8.1 Completion Report

**Sprint:** SPR-MOD-001-003 · **Gate:** 3.8 · **Pass:** 3.8.1 — Architecture and Contracts
**Report date:** 2026-07-26
**Status:** `Pass 3.8.1 — COMPLETE, EVIDENCE SUPPLIED`
**Next pass:** 3.8.2 (persistence, RLS, read models) — **NOT STARTED**

All evidence below was produced by commands executed in this pass against a
single repository state. Any claim that could not be substantiated by a command
is marked as such.

---

## 1. File inventory

### 1.1 Module source — 6 files (`src/lib/tenant-onboarding/`)

| File | Purpose |
|---|---|
| `contracts.ts` | Canonical step registry: statuses, keys, metadata |
| `state-machine.ts` | Pure workflow transition table and rejection codes |
| `query-keys.ts` | `tenantOnboardingKeys` factory |
| `required-settings.registry.ts` | Allow-listed onboarding settings registry |
| `schemas.ts` | Zod query/command/registry validation schemas |
| `index.ts` | Module barrel |

### 1.2 DTO layer — 16 files

`src/lib/tenant-onboarding/types/index.ts` plus 15 files under
`src/lib/tenant-onboarding/types/v1/`:
`index.ts`, `onboarding-summary.dto.ts`, `onboarding-detail.dto.ts`,
`onboarding-step.dto.ts`, `onboarding-progress.dto.ts`,
`onboarding-readiness.dto.ts`, `onboarding-readiness-check.dto.ts`,
`onboarding-organization.dto.ts`, `onboarding-branch.dto.ts`,
`admin-invitation.dto.ts`, `admin-membership.dto.ts`,
`onboarding-activity.dto.ts`, `onboarding-action-result.dto.ts`,
`onboarding-activation-result.dto.ts`, `onboarding-page.dto.ts`.

### 1.3 Tests — 5 files (`src/lib/tenant-onboarding/__tests__/`)

`contracts.test.ts` (8), `state-machine.test.ts` (8), `query-keys.test.ts` (5),
`schemas.test.ts` (9), `architecture.test.ts` (7) — **37 tests**.

### 1.4 Documents — 3 created

- `docs/60-engineering/PHASE3_GATE38_POLICY_DECISIONS.md`
- `docs/60-engineering/PHASE3_GATE38_ONBOARDING_MATRIX.md`
- `docs/60-engineering/PHASE3_GATE38_READINESS_MATRIX.md`

Plus this report (4th document).

### 1.5 Modified pre-existing files

**None.** No file outside `src/lib/tenant-onboarding/` and
`docs/60-engineering/PHASE3_GATE38_*` was created or edited.

### 1.6 `PHASE3_GATE38_DISCOVERY.md`

**Not modified in Pass 3.8.1.** Verified by
`git log --oneline -- docs/60-engineering/PHASE3_GATE38_DISCOVERY.md`, which
returns exactly one commit (`bae5b2c`, Pass 3.8.0 authoring). Decision
references were placed in the new policy document instead of back-editing
Discovery, preserving Discovery as an immutable Pass 3.8.0 fact record.

**Verification command:** `find src/lib/tenant-onboarding -name '*.ts' | wc -l`
→ `27` (6 module + 16 DTO-layer + 5 test files).

---

## 2. Protected-path diff confirmation

Confirmed **no changes** under any protected path during Pass 3.8.1:

| Protected path | Changed in Pass 3.8.1 |
|---|---|
| `supabase/migrations/**` | No |
| `src/routes/**` | No |
| `src/modules/platform/**` | No |
| provisioning (`src/lib/provisioning*`) | No |
| tenant lifecycle (`src/lib/tenant-lifecycle`) | No |
| organizations / branches | No |
| financial years | No |
| notifications | No |
| settings (`src/lib/platform-admin`, settings registry code) | No |
| permissions (`src/lib/generated/permission-keys.ts`, permission manifest) | No |

**Evidence:** per-commit file listings for every commit belonging to this pass
(`git show --name-only --format= <sha>`) show only
`docs/60-engineering/PHASE3_GATE38_*.md` and `src/lib/tenant-onboarding/**`.
The most recent commits touching `src/routes/**` and `src/modules/platform/**`
(`42476a1`, `3a1040e` and earlier) predate Pass 3.8.1 and belong to Gate 3.7.
`git status --porcelain` after the production build returns empty, so no
untracked or stray modification exists.

---

## 3. Architecture boundary confirmation

| Boundary | Result | Enforcement |
|---|---|---|
| No `*.server.ts` / `*.server.tsx` in the module | Confirmed — glob returns nothing | `architecture.test.ts` › "contains no server files, routes, UI or migrations" |
| No Supabase / database-row imports | Confirmed | `architecture.test.ts` › "imports no database, Supabase, server or UI modules" |
| No server-function framework imports (`@tanstack/react-start`) | Confirmed | same test |
| No React / UI / `@/components` / `@/modules` imports | Confirmed | same test |
| No environment access (`process.env`, `import.meta.env`) | Confirmed | same test |
| No routes added | Confirmed — `src/routes/**` untouched | §2 |
| No UI added (`.tsx`) | Confirmed — 0 `.tsx` files in module | `architecture.test.ts` |
| No SQL in module | Confirmed — 0 `.sql` files | `architecture.test.ts` |
| No role/permission definitions in module | Confirmed | `architecture.test.ts` › "defines no roles, permissions or company abstraction" |
| No secret-bearing DTO fields (token, hash, secret, credentials, raw errors) | Confirmed | `architecture.test.ts` › DTO property scan + invitation/activity assertions |

**Independent grep evidence:**
`rg "supabase|@/integrations|@tanstack/react-start|process\.env|import\.meta\.env|@/components|@/modules" src/lib/tenant-onboarding --glob '!__tests__' | wc -l` → `0`.
The module's only third-party import is `zod` (in `schemas.ts`).

These boundaries are **machine-enforced**: they fail the suite on regression,
not merely asserted in prose.

---

## 4. Contract inventory

### 4.1 Workflow states — 6

`TENANT_ONBOARDING_STATES` in `state-machine.ts`:
`not_started`, `in_progress`, `blocked`, `ready_for_activation`, `activated`
(terminal), `cancelled`.

### 4.2 Transition intents — 8

`ONBOARDING_TRANSITION_INTENTS`: `start`, `block`, `resume`, `mark_ready`,
`invalidate_readiness`, `activate`, `cancel`, `restart`.

### 4.3 Transition table

Complete and exhaustive, keyed by state then intent; any absent
(state, intent) pair yields a typed rejection via
`ONBOARDING_TRANSITION_REJECTION_CODES`: `unknown_state`, `unknown_intent`,
`terminal_state`, `intent_not_allowed_from_state`.
`TERMINAL_ONBOARDING_STATES = { activated }`.
`applyOnboardingTransition` is pure, deterministic and side-effect free —
asserted by 8 tests including determinism and terminal-state rejection.

### 4.4 Step statuses — 6

`ONBOARDING_STEP_STATUSES`: `not_started`, `in_progress`, `completed`,
`blocked`, `failed`, `skipped`. `TERMINAL_STEP_STATUSES = { completed, skipped }`.
`failed` (attempted operation errored) is deliberately distinct from `blocked`
(unmet precondition owned elsewhere).

### 4.5 Canonical step keys — 10

`provisioning_verified`, `organization_profile`, `primary_branch`,
`tenant_admin_invitation`, `tenant_admin_membership`, `roles_assigned`,
`required_settings`, `financial_year`, `readiness_validation`, `activation`.
No company-specific step key exists (G38-POL-001), asserted by
`contracts.test.ts`.

### 4.6 DTO family (v1)

15 files, namespace pinned by `TENANT_ONBOARDING_DTO_VERSION = "v1"`.

### 4.7 Schemas

`schemas.ts`: primitives (`tenantIdSchema`, `organizationIdSchema`,
`correlationIdSchema`, `versionSchema`), enums derived from the registry,
`onboardingPaginationSchema`, `onboardingListFilterSchema` (with date-range
refinement), `onboardingDetailQuerySchema`, and command schemas —
`startOnboardingSchema`, `resumeOnboardingSchema`,
`saveOrganizationProfileSchema`, `createOrSelectBranchSchema`,
`assignRequiredRolesSchema`, `initializeSettingsSchema`,
`initializeFinancialYearSchema`, `runReadinessSchema`,
`activateWorkspaceSchema`, `cancelOnboardingSchema`,
`restartOnboardingSchema`, plus `onboardingSettingSpecSchema`. All objects are
`.strict()`; unknown keys are rejected.

### 4.8 Query keys

`tenantOnboardingKeys`: `all`, `platformLists`, `platformList(filters)`,
`details`, `detail`, `steps`, `progress`, `blockers`, `readiness`, `activity`,
`invitation`. Filter normalization is deterministic (5 tests).

### 4.9 Required-settings registry

5 allow-listed entries, every key verified against `public.setting_definitions`
during this pass; sensitive and system-owned keys explicitly excluded.

---

## 5. Policy decisions ratified (G38-POL-001 … 010)

| ID | Decision |
|---|---|
| 001 | `organizations` **is** the company entity; one combined organization/company bootstrap step |
| 002 | Operator-run inside the Platform Administration shell; tenant self-service deferred |
| 003 | Valid invitation mandatory; acceptance warning-only; membership/roles non-blocking pre-acceptance |
| 004 | Financial year conditional; authoritative trigger source unresolved (prerequisite for 3.8.5) |
| 005 | Roles globally seeded; onboarding assigns only, never defines |
| 006 | Permission reuse only — zero new permissions in Gate 3.8 |
| 007 | Versioned DTOs owned by `src/lib/tenant-onboarding/types/v1/` |
| 008 | Activity timeline is a sanitized composed read over `audit_logs` + step rows; no duplicate event table |
| 009 | Readiness evaluation owned exclusively by Pass 3.8.5 |
| 010 | Allow-listed, repository-owned required-settings registry |

---

## 6. Readiness classification — all 18 candidates

| # | Check | Classification |
|---|---|---|
| 1 | `tenant_exists` | Mandatory |
| 2 | `provisioning_completed` | Mandatory |
| 3 | `no_unresolved_rollback` | Merged → `provisioning_completed` |
| 4 | `lifecycle_permits_onboarding` | Mandatory |
| 5 | `tenant_not_deleted` | Merged → `lifecycle_permits_onboarding` |
| 6 | `tenant_not_pending_deletion` | Merged → `lifecycle_permits_onboarding` |
| 7 | `organization_exists` | Mandatory |
| 8 | `organization_valid` | Merged → `organization_exists` |
| 9 | `primary_branch_exists` | Mandatory |
| 10 | `admin_invitation_valid` | Mandatory |
| 11 | `admin_invitation_accepted` | Warning |
| 12 | `admin_membership_exists` | Conditional (post-acceptance) |
| 13 | `admin_role_assigned` | Conditional (post-acceptance) |
| 14 | `required_settings_valid` | Mandatory |
| 15 | `financial_year_present` | Conditional |
| 16 | `no_failed_or_blocked_step` | Mandatory |
| 17 | `no_concurrent_activation` | Mandatory (technical guard) |
| 18 | `no_data_integrity_conflict` | Mandatory |

Deferred/`n/a`: notification delivery confirmation (no per-channel delivery
store exists). Every merge and deferral carries a written justification in the
readiness matrix §2.

### 6.1 Invariants preserved in BOTH matrices

| Invariant | Onboarding matrix | Readiness matrix |
|---|---|---|
| Valid invitation required | `tenant_admin_invitation` = Mandatory, blocks when absent | `admin_invitation_valid` = Mandatory |
| Acceptance warning-only | Membership row lists *no* blocking condition pre-acceptance | `admin_invitation_accepted` = Warning, "never blocks" |
| Membership non-blocking before acceptance | `tenant_admin_membership` = Conditional, readiness impact Warning | Pass condition includes "invitation not yet accepted" |
| Invitation role ≠ effective member RBAC | Source of truth split: `organization_invitations.role` (pre) / `user_roles` (post) | Same split, plus explicit concept separation in G38-POL-003 |
| Financial year conditional | `financial_year` = Conditional, may be `skipped` with reason | `financial_year_present` = Conditional, `not_applicable` when no trigger |

---

## 7. Permissions

**Zero permissions added.** No permission constant, manifest row, generated key
or migration was created. `src/lib/generated/permission-keys.ts` is unchanged.

Reused: `PLATFORM_TENANT_READ`, `PLATFORM_TENANT_UPDATE`,
`PLATFORM_TENANT_ACTIVATE`, `PLATFORM_COMPANY_CREATE`,
`PLATFORM_COMPANY_SET_DEFAULT`, `PLATFORM_BRANCH_CREATE`,
`PLATFORM_BRANCH_SET_DEFAULT`, `PLATFORM_INVITATIONS_MANAGE`,
`PLATFORM_INVITATIONS_VIEW`, `PLATFORM_ROLES_ASSIGN`,
`PLATFORM_MEMBERSHIPS_MANAGE`, `PLATFORM_SETTINGS_MANAGE`,
`PLATFORM_FINANCIAL_YEAR_CREATE / _OPEN / _SET_DEFAULT`.

**Documented semantic gaps (not implemented):** the repository cannot express
"view the onboarding workflow" or "activate a workspace" independently of
tenant read/activate. Accepted because the operator populations are identical;
the remediation path (manifest entry + `gen:permissions` + grants + guards +
tests + migration) is recorded in G38-POL-006.

---

## 8. Non-implementation confirmation

Pass 3.8.1 delivered **contracts only**. Explicitly absent:

- no executable migration or SQL anywhere (migration design is documented prose
  in the onboarding matrix §3);
- no `tenant_onboarding` / `tenant_onboarding_steps` table created;
- no service, repository, data client or server facade;
- no server function, server route or API handler;
- no route file, page, component or hook;
- no notification, audit-write or provisioning call.

---

## 9. Test integrity

| Metric | Value |
|---|---|
| Baseline before Pass 3.8.1 | 444 tests / 41 files |
| Added in Pass 3.8.1 | 37 tests / 5 files |
| Current total | **481 tests / 46 files, all passing** |

- **No pre-existing test deleted.** File count moved 41 → 46, entirely from the
  5 new onboarding test files; no pre-existing test file appears in any Pass
  3.8.1 commit.
- **No test skipped or weakened.** Repository-wide search for
  `.skip(`, `.only(`, `.todo(`, `xit(`, `xdescribe(` across all
  `*.test.ts*` files returns **0** matches.
- **Pre-existing tests modified:** **none.** The only pre-existing test file
  touched recently (`src/modules/platform/administration/__tests__/administration.test.ts`,
  commit `3a1040e`) belongs to Gate 3.7 and predates this pass.
- Arithmetic check: 444 + 37 = 481 ✔.

---

## 10. Build, typecheck and test results

All three run against the same repository state, after the pass's final edit.

| Gate | Command | Result |
|---|---|---|
| Production build | `npm run build` | **✓ built in 2.02s**; nitro output generated (`dist/server/wrangler.json`, `dist/client/_headers`, `dist/nitro.json`); exit 0; no error or warning attributable to Pass 3.8.1 |
| Typecheck | `bunx tsgo --noEmit` | **Clean**, exit 0, no diagnostics |
| Tests | `bunx vitest run` | **Test Files 46 passed (46) · Tests 481 passed (481)** |

---

## 11. Generated-file diff review

- Immediately after the production build, `git status --porcelain` reported
  `M src/routeTree.gen.ts` — the build regenerated the route tree, removing 10
  lines of formatting-level output.
- `git diff HEAD -- src/routeTree.gen.ts` re-run moments later returned **empty**,
  and `git status --porcelain` returned **empty**: the dev-server route
  generator restored the file to its committed content.
- **Net effect: no change retained.** The final repository state has
  `src/routeTree.gen.ts` identical to the committed version. This is expected —
  Pass 3.8.1 added no route file, so the route tree has no reason to change.
- No other generated artifact changed. `dist/` and `.wrangler/` are build
  outputs and are not tracked.

---

## 12. Known limitations and deferred items

1. **Financial-year trigger source unresolved.** No authoritative signal exists
   today for "an enabled module requires a financial year". This is a **blocking
   prerequisite for Pass 3.8.5**; until it is ratified the check evaluates to
   `not_applicable`. Pass 3.8.5 must not invent a trigger.
2. **Tenant self-service onboarding deferred.** Gate 3.8 is operator-run; a
   tenant application shell does not exist and is out of scope.
3. **No invitation resend primitive.** Resend must be modelled as
   revoke + create in Pass 3.8.4.
4. **Notification delivery confirmation not evaluable.** No per-channel delivery
   store exists, so no readiness check can assert delivery.
5. **Settings registry limited to existing definitions.** `base_currency`,
   `date_format`, `number_format`, `financial_year_start_month` and
   `week_start_day` are proposed but absent from `setting_definitions`; adding
   them requires a settings-module migration, not an onboarding change.
6. **Readiness snapshot semantics unimplemented.** Only the contract exists;
   persistence and evaluation are Pass 3.8.5.
7. **Post-acceptance integrity checks** (membership and effective RBAC grant)
   are specified but cannot be exercised end-to-end until invitation acceptance
   is wired in Pass 3.8.4.

---

## 13. Gate status

**`Pass 3.8.1 — COMPLETE, EVIDENCE SUPPLIED`**

Production build passing, typecheck clean, 481/481 tests passing, protected
paths untouched, generated files unchanged, architecture boundaries
machine-enforced, and every required inventory supplied above.

**Pass 3.8.2 has not been started.** No persistence, RLS, grant or read-model
work was performed in this pass.

---

## 14. Amendment — contract co-location closure

**Date:** 2026-07-26 · **Reason:** closure of the spec-mandated DTO inventory
(the one remaining verification item raised at Pass 3.8.1 validation).

Both spec-named contracts are reachable from the public module barrel:

| Spec name | Repository declaration | File |
|---|---|---|
| `TenantOnboardingBlockerDTO` | declared under that exact name | `types/v1/onboarding-progress.dto.ts` (co-located with the progress contract) |
| `TenantOnboardingFilterDTO` | **type-only alias** of the canonical `OnboardingListFilterDTO` | `types/v1/onboarding-page.dto.ts` (co-located with the pagination contract) |

Actions taken:

1. `PHASE3_GATE38_ONBOARDING_MATRIX.md` records the co-location decision.
2. A **type-only** `export type TenantOnboardingFilterDTO = OnboardingListFilterDTO;`
   alias was added — no duplicate interface, no runtime artifact.
3. `__tests__/contract-colocation.test.ts` adds 4 tests: mutual type-identity
   of alias and canonical declaration, barrel reachability of both spec-named
   contracts, absence of any runtime export for the alias, and single-sourcing
   of `onboardingListFilterSchema`.
4. Test count: 481 → 485; typecheck clean.

**`Pass 3.8.1 — COMPLETE AND CLOSED`**
