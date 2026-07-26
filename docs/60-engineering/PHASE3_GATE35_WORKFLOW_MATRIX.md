# Phase 3 — Gate 3.5 Workflow Matrix

**Sprint:** SPR-MOD-001-003
**Gate:** 3.5 — End-to-End Provisioning Workflow
**Status:** Verified
**Scope:** Integration and operational validation only. No architectural change to the Provisioning Domain, Orchestrator, Repository, Provider, Retry Engine, Rollback Engine, Migration Runner, Seed Runner, or Dashboard.

---

## 1. Lifecycle state matrix

| # | State | Status (DTO) | Terminal | Retryable | Step executed on advance | Next state (success) | Next state (failure) |
|---|-------|--------------|----------|-----------|--------------------------|----------------------|----------------------|
| 1 | `pending` | `not_started` | no | no | — (start command) | `validating` | `failed` |
| 2 | `validating` | `in_progress` | no | no | — (transition only) | `queued` | `failed` |
| 3 | `queued` | `in_progress` | no | no | — (transition only) | `provisioning_infrastructure` | `failed` |
| 4 | `provisioning_infrastructure` | `in_progress` | no | no | `create_project` | `running_migrations` | `retrying` |
| 5 | `running_migrations` | `in_progress` | no | no | `apply_migrations` | `seeding` | `retrying` |
| 6 | `seeding` | `in_progress` | no | no | `seed_database` | `creating_admin` | `retrying` |
| 7 | `creating_admin` | `in_progress` | no | no | `create_admin` | `verifying` | `retrying` |
| 8 | `verifying` | `in_progress` | no | no | `verify_health` | `completed` | `retrying` |
| 9 | `retrying` | `in_progress` | no | yes | resumes the failed step | previous step's success target | `failed` (budget exhausted / permanent) |
| 10 | `completed` | `provisioned` | yes | no | none (no-op) | — | — |
| 11 | `failed` | `failed` | yes | yes | none (no-op) | `retrying` via retry, `rolled_back` via rollback | — |
| 12 | `cancelled` | `not_started` | yes | no | none (no-op) | — | — |
| 13 | `rolled_back` | `failed` | yes | no | none (no-op) | — | — |

Transition-only states (`pending`, `validating`, `queued`) record a `skipped` execution outcome and never call the provider.

## 2. Command → orchestrator mapping

| Dashboard action | Facade command | Orchestrator entry point | Precondition | Invalidation set |
|------------------|----------------|--------------------------|--------------|------------------|
| Provision tenant | `startTenantProvisioning` | `start()` | tenant eligible, no active job | summary, lists, queue |
| Retry | `retryProvisioning` | `resumeProvisioning()` | `job.retryable` | detail, lists, summary, queue |
| Resume | `retryProvisioning` | `resumeProvisioning()` | `state === "retrying"` | detail, lists, summary, queue |
| Run next step | `advanceProvisioning` | `executeNextStep()` | `!job.terminal` | detail, lists, summary, queue |
| Cancel | `cancelProvisioning` | `cancel(reason)` | `!job.terminal` (idempotent) | detail, lists, summary, queue |
| Rollback | `rollbackProvisioning` | `rollback()` | job in a terminal failed state | detail, failed, summary |

**Resume vs Retry.** The spec's "Resume" is not a new capability: both surface `resumeProvisioning()`. Retry is offered whenever the job is retryable; Resume is the operator-facing affordance for a job that already sits in `retrying` and needs a manual nudge. No new command, service method, or state was introduced.

## 3. Live state synchronization

| Concern | Behaviour |
|---------|-----------|
| Transport | One SSE stream per open detail view (`/api/provisioning/events/{jobId}`), authenticated |
| Heartbeat | Server-sent, keeps intermediaries from closing idle streams |
| Reconnect | Exponential backoff 1s → 30s |
| Fallback | Polling after 5 consecutive failures (`status: "polling"`) |
| Teardown | Stream closed on unmount, navigation, and on the first terminal snapshot |
| Cache | Snapshots write straight into `provisioningKeys.detail(jobId)` |

## 4. Failure simulation coverage

| Scenario | Expected outcome | Verified in |
|----------|------------------|-------------|
| Provider timeout on `create_project` | `retrying`, advisory delay > 0 | `workflow.e2e.test.ts` |
| Migration failure | `retrying`, step marked failed with sanitized error | `workflow.e2e.test.ts` |
| Seed failure | `retrying`, seeding step retained for resume | `workflow.e2e.test.ts` |
| Admin creation failure | `retrying` | `workflow.e2e.test.ts` |
| Non-retryable error (missing project reference) | `failed`, no retry | `executor.test.ts` |
| Retry budget exhausted | `failed`, reason `permanent` | `executor.test.ts` |
| Rollback after failure | reverse-order actions, `rolled_back` | `executor.test.ts`, `workflow.e2e.test.ts` |
| Rollback of an in-flight job | refused, `rollback_not_eligible` | `executor.test.ts` |
| Duplicate cancel / rollback | idempotent no-op | `workflow-concurrency.test.ts` |

## 5. Operational validation

| Dimension | Result |
|-----------|--------|
| Batch of 10 / 20 jobs | all reach `completed`, one provider call per step per job |
| 50 concurrent jobs | fully independent; no cross-job state leakage |
| Duplicate action prevention | claimed steps reject a second claim while `running`/`succeeded` |
| Correlation | correlation id propagated to provider calls, step writes, transitions, and events |

## 6. Security posture

- Every command is gated on `PLATFORM_TENANT_UPDATE`; the whole subtree is gated on `PLATFORM_TENANT_READ`.
- Error payloads surfaced to operators carry code, kind and message only — no credentials, SQL, or stack traces.
- SSE endpoint requires an authenticated session; job identifiers are validated server-side.
