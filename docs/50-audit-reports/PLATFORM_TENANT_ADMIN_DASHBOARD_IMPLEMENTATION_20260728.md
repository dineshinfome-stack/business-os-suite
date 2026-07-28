# Platform Tenant Administration Dashboard — Implementation Report

- Date: 2026-07-28
- Scope: Platform Tenant Administration Dashboard (Platform Owner / Platform Administrator)
- Mode: Lean repository-first product implementation

## 1. Objective

Provide a single unified operational view of every tenant on the platform:
lifecycle state, provisioning status, onboarding progress, activation readiness,
blockers/warnings and structural counts (organizations/branches), with
bookmarkable filters, server-side sorting and pagination.

## 2. Backend composition (authority preserved)

`getTenantDirectory` (`src/lib/platform-admin/query-service.server.ts`) remains
the single composed read model. It was extended with set-based loaders — no
per-tenant queries (no N+1):

| Source | Table | Contribution |
| --- | --- | --- |
| Onboarding workflow | `tenant_onboarding` | state, readiness status/blocking/warning counts, last readiness check, activated_at |
| Workflow steps | `tenant_onboarding_steps` | onboarding progress percent (settled/total canonical steps) |
| Organizations | `organizations` | organization (company) count |
| Branches | `branches` | branch count |
| Invitations | `organization_invitations` | highest-precedence invitation status per tenant |
| Provisioning | `provisioning_jobs` | failure detection, last activity |
| Attention | derived | attention count, highest severity |

Progress uses the same definition as the certified onboarding read model:
`(completed + skipped) / ONBOARDING_STEPS.length`.

New backend query capabilities (`TenantDirectoryQuery`, validated in
`src/lib/platform-admin/queries.functions.ts`):

- filters: `onboardingState`, `readinessStatus`, `invitationStatus`, `blockedOnly`
- sorts: `onboardingProgress`, `readinessBlockers` (in addition to existing)
- response: new `summary` block (total, active, onboarding, activationReady,
  blocked, suspended, provisioningFailures) computed over the whole tenant set,
  never over the visible page.

## 3. DTO changes (additive, v1)

`PlatformTenantOperationsRowDTO` gained: `organizationCount`, `branchCount`,
`onboardingState`, `onboardingProgressPercent`, `readinessStatus`,
`readinessBlockingCount`, `readinessWarningCount`, `lastReadinessCheckedAt`,
`invitationStatus`, `activatedAt`.
`PlatformTenantOperationsPageDTO` gained `summary:
PlatformTenantDirectorySummaryDTO`. Existing consumers
(`TenantOperationsTable`) are unaffected.

## 4. Frontend

- `src/routes/_authenticated/platform/tenants/index.tsx` — dashboard route.
  All view state (`q`, `lifecycle`, `provisioning`, `onboarding`, `readiness`,
  `invitation`, `blocked`, `sortBy`, `sortDir`, `page`, `pageSize`) lives in
  URL search params via `validateSearch`, so every view is bookmarkable and
  shareable. Search is debounced (300 ms) before it reaches the URL/query.
- `TenantAdminSummary.tsx` — seven backend-sourced counters.
- `TenantAdminTable.tsx` — renders the server page verbatim; sorting is
  delegated to the backend, no client-side filtering/sorting/pagination.
- Access control: route data requires `platform.tenant.read` (server-enforced
  by `requirePermission`); the UI additionally renders a denial state when the
  permission is absent, and tenant creation stays behind
  `platform.tenant.create`.

## 5. Verification

- Unit/component tests: **607/607 PASS** (4 new in
  `src/modules/platform/administration/__tests__/tenant-admin-dashboard.test.tsx`).
- Typecheck: clean.
- No migrations were introduced by this change.
