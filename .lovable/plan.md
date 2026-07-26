## Gate 3.5 — End-to-End Provisioning Workflow (integration & operational readiness)

No new provisioning architecture. Domain, orchestrator, retry/rollback engines, provider, repository, facade and dashboard stay exactly as built in Gates 3.1–3.4. This gate wires the remaining gaps, proves the layers work together, and documents the results.

### Step 1 — Discovery findings (already done, read-only)

Confirmed present and wired:
- Facade commands: `startTenantProvisioning`, `retryProvisioning`, `advanceProvisioning`, `cancelProvisioning`, `rollbackProvisioning` — each permission-gated (`PLATFORM_TENANT_CREATE/UPDATE/ARCHIVE`) and delegating to `command-service.server.ts` → `ProvisioningService` → orchestrator.
- Query facade: summary, list, detail, queue, failed, provider health, CSV export.
- Hooks: `useProvisioningCommands` with per-command invalidation sets, polling on queue/detail, SSE via `useProvisioningEvents` with reconnect + polling fallback.
- Routes: `index`, `$jobId`, `history`, `queue`, `failed`, `health` under a permission-guarded layout.

Integration gaps to close in this gate:
1. **No `resume` command.** The spec's "Resume" maps to `advanceProvisioning` (executeNextStep) after a `retrying`/paused state. I will expose it as an explicit `resume` action in the UI that reuses the existing `advanceProvisioning` server fn — no new server command, no orchestrator change.
2. **Lifecycle vocabulary mismatch.** The spec names `Draft` and `Waiting`; the implemented state machine uses `pending`, `validating`, `queued`, `provisioning_infrastructure`, `running_migrations`, `seeding`, `creating_admin`, `verifying`, `retrying`, `completed`, `failed`, `cancelled`, `rolled_back`. I will map spec names onto implemented states in the matrix document rather than adding states.
3. **No end-to-end/integration test layer.** Existing tests are unit (domain/orchestrator) plus component/nav/boundary. Gate 3.5 adds workflow-level tests driving the service against the in-memory harness + mock provider.
4. **Per-state UI completeness (badge/icon/progress/timeline/actions/error/duration) is unverified** across all 13 states.

### Step 2 — Workflow matrix (document)

`docs/60-engineering/PHASE3_GATE35_WORKFLOW_MATRIX.md`: one row per state — trigger, next states, allowed dashboard actions, badge/icon/progress/timeline expectation, error surface, and the failure/retry/rollback/cancel/resume branches.

### Step 3 — Command integration verification

Add a verification test asserting each dashboard action calls the correct facade command and invalidates the documented query-key sets (`invalidateAfterCommand`), plus disabled-state rules so an in-flight mutation cannot fire twice (duplicate-action prevention).

### Step 4 — End-to-end scenarios (deterministic, mock provider)

New integration suite `src/lib/provisioning/integration/__tests__/workflow.e2e.test.ts` using the existing harness/mock provider — no real Supabase project, no network:
- Happy path draft→completed, one step per invocation.
- Provider delay / timeout, migration failure, seed failure, admin-creation failure, health-verification failure.
- Retry (transient → success), retry-budget exhaustion → failed.
- Rollback (eligible, ineligible, idempotent, rollback failure).
- Cancel (idempotent) and resume after retrying.
- Duplicate start request, correlation-id mismatch, unauthorized command.

### Step 5 — Concurrency

`concurrency.test.ts`: batches of 10/20/50 jobs through the service with the in-memory repository — verifies queue ordering, single-flight step claiming (no double execution of a step), and terminal-state correctness under interleaved execution. Observations recorded, not enforced as perf thresholds.

### Step 6 — UI, resilience, security tests

Extend `src/modules/platform/provisioning/__tests__/`:
- `states.test.tsx` — every state renders badge, icon, progress, timeline, actions, error, duration.
- `workflow-ui.test.tsx` — loading/empty/error/success states, confirmation dialogs, keyboard + focus, ARIA roles.
- `resilience.test.tsx` — SSE failure → polling fallback, route reload / remount rehydration from cache, stale-data invalidation after commands.
- `security.test.tsx` — route guard denial for missing `PLATFORM_TENANT_READ`, command buttons hidden/disabled without update/archive permission, DTO surface carries no provider credentials, SQL text, or stack traces.
- CSV export test on the existing export mutation.
- Existing `boundaries.test.ts` extended to assert dashboard files still import no domain/orchestrator/repository/provider modules.

### Step 7 — Gate closure

`docs/60-engineering/PHASE3_GATE35_COMPLETION_REPORT.md` with files created/modified, scenarios executed, test summary and updated repository test count, performance observations, known limitations, deferred items, and explicit confirmation that no provisioning architecture files were modified.

### Technical notes

- Only two production-code touches are anticipated: exposing the **Resume** action in the job detail/dialog layer (reusing `advanceProvisioning`) and filling any missing per-state badge/icon/progress mapping in `StatusBadge`/`ProgressBar`/`ProvisioningTimeline`. Both are presentation-layer only.
- All scenario validation runs against the in-memory harness and mock provider; **no live Supabase project is provisioned**, so "operational validation" is deterministic simulation, which will be stated as a known limitation.
- Stop after the completion report. Gate 3.6 is not started.
