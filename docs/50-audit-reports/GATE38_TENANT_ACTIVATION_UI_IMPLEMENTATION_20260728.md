---
title: "Gate 3.8 — Platform Tenant Activation UI Implementation Report"
summary: "Development-mode activation UI built on the certified Pass 3.8.4 / 3.8.5A / 3.8.5 contracts."
status: "implemented"
updated: "2026-07-28"
tags: ["gate-3.8", "mod-001", "tenant-activation", "ui"]
document_type: "Implementation Report"
---

# Gate 3.8 — Platform Tenant Activation UI

Scope: frontend only. No migrations were authored, no SQL or concurrency
harness was rerun, and no migration replay was performed.

## Authority boundary

The database remains the sole authority for the fourteen canonical readiness
checks, their statuses, reason codes, blocking/warning counts, overall status,
workflow version, warning fingerprint and activation eligibility. The UI
renders the evaluator payload verbatim: it never re-sorts, re-counts or
re-derives a verdict, and no second readiness registry was introduced.
`READINESS_CHECK_KEYS` in `src/lib/tenant-onboarding/readiness.ts` remains the
single presentation-order source and is used only by the existing mapper.

## Reused repository components

| Reused | Purpose |
| --- | --- |
| `lib/tenant-onboarding/queries.functions.ts` | Detail, readiness and activity reads |
| `lib/tenant-onboarding/commands.functions.ts` | `refreshTenantOnboardingReadiness`, `activateTenant` |
| `lib/tenant-onboarding/query-keys.ts` | Scoped invalidation sets |
| `lib/tenant-onboarding/types/v1` | Frozen DTO contracts |
| `contexts/permissions-context` | `platform.tenant.activate` gating |
| `modules/platform/provisioning/components/States` | Shared error surface |
| shadcn card / badge / alert / dialog / checkbox / skeleton | UI primitives |
| Composed onboarding activity read model | Audit history (no second store) |

## Changed paths

- `src/modules/platform/tenant-activation/reason-text.ts` (new)
- `src/modules/platform/tenant-activation/hooks/useTenantActivation.ts` (new)
- `src/modules/platform/tenant-activation/components/ReadinessSummary.tsx` (new)
- `src/modules/platform/tenant-activation/components/ReadinessChecklist.tsx` (new)
- `src/modules/platform/tenant-activation/components/ActivationPanel.tsx` (new)
- `src/modules/platform/tenant-activation/components/ActivationAudit.tsx` (new)
- `src/modules/platform/tenant-activation/components/TenantActivationView.tsx` (new)
- `src/modules/platform/tenant-activation/__tests__/tenant-activation.test.tsx` (new)
- `src/routes/_authenticated/platform/tenants/$tenantId.tsx` (Activation tab)

## Behaviour

- **Refresh readiness** calls the certified persist-readiness command only,
  shows pending/error state and invalidates exactly the three tenant-onboarding
  query keys. It never activates.
- **Activate tenant** is rendered only for holders of
  `platform.tenant.activate`, always submits the latest `expectedVersion` from
  the detail read, demands explicit warning acknowledgement when the backend
  reports warnings, and calls only the canonical activation command. The client
  never writes tenant lifecycle state.
- **Errors** are mapped from the sanitized reason codes
  (`readiness_blocked`, `warning_acknowledgement_required`,
  `lifecycle_state_blocks`, `version_conflict`, `permission_denied`). No
  SQLSTATE, token or driver detail reaches the operator.
- **version_conflict** triggers a readiness refresh and an explanatory message;
  there is no automatic retry.
- **Success** shows lifecycle state active plus the activation timestamp,
  refreshes tenant and onboarding reads, disables duplicate activation and
  states that replay is idempotent.

Server-side enforcement is unchanged: the facade middleware and the RPC both
re-check the permission, so UI hiding is defence in depth only.

## Tests executed

`bunx vitest run` — 54 files, **603/603 PASS** (18 new).
`bunx tsgo --noEmit` — clean.
No database certification or migration replay was run.

## Status

| Item | State |
| --- | --- |
| Pass 3.8.4 | CERTIFIED |
| Pass 3.8.5A | CERTIFIED |
| Pass 3.8.5 | CERTIFIED |
| Tenant activation development | UNBLOCKED |
| Tenant activation production release | BLOCKED |
| Fresh migration replay | DEFERRED TO RELEASE-CANDIDATE CI |
| Private SECURITY DEFINER finding | OPEN |

## Remaining production blockers

1. `FINDING-G38-PRIVATE-SECURITY-DEFINER-EXECUTE-SURFACE` — OPEN.
2. Fresh 51-migration replay — deferred to Release Candidate CI.

**PLATFORM TENANT ACTIVATION UI IMPLEMENTED — DEVELOPMENT WORKFLOW READY**
