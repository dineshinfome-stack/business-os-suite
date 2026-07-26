## Gate 3.4 — Platform Provisioning Dashboard (v3)

Presentation layer only. No orchestration, provider, retry, rollback, migration, seed, or database changes.

### Repository facts this plan is built on (verified)

- `src/lib/provisioning/integration/service.ts` exposes only `startProvisioning`, `resumeProvisioning`, `executeNextStep`, `cancelProvisioning`, `rollbackProvisioning`. There is **no** `createProvisioning()` and **no** read/query API.
- The service is constructed per-job by `createProvisioningService(...)` with an injected `dataClient` — it cannot run in the browser.
- No provisioning server-function boundary exists (only `src/lib/tenants/tenants.functions.ts`).
- No provisioning permission keys exist; `src/lib/generated/permission-keys.ts` has `PLATFORM_TENANT_*` only.
- `integration/event-sink.ts` emits through an **optional** transport and defaults to structured logging — **orchestration events are not persisted**. The only durable history is `provisioning_jobs` + `provisioning_steps`.

### Architecture introduced by this gate

```text
Browser (dashboard)
  ↓  DTOs only
provisioning-admin facade  (queries.functions.ts / commands.functions.ts)
  ↓
ProvisioningService → Orchestrator → Repository → Provider → Supabase
```

The facade is a coordinator: it composes service calls and read queries and maps rows to DTOs. No state derivation, no retry/rollback decisions, no step ordering, no provider access from the browser side.

### Decisions locked

1. **Explicit, versioned read DTOs.** `ProvisioningSummaryDTO`, `ProvisioningJobListItemDTO` (+ page envelope), `ProvisioningJobDetailDTO`, `ProvisioningTimelineEntryDTO`, `ProviderHealthDTO`, `ProvisioningQueueDTO`, `ProvisioningFailureDTO` live under `src/modules/platform/provisioning/types/v1/` and are re-exported from a `v1` namespace, so a future mobile/external consumer can pin a version. Internal row shapes (`ProvisioningJobRow`, `ProvisioningStepRow`) never cross the boundary.
2. **Timeline source.** Events are not persisted, so the timeline is derived **server-side** from `provisioning_steps` (claim/outcome timestamps, durations, attempts) plus job transition timestamps, returned as `ProvisioningTimelineEntryDTO[]`. The UI renders the array verbatim. A persisted event log is deferred (DB change → out of scope).
3. **Provider health is indirect.** The facade calls a server-side `ProvisioningQueryService` that reads capabilities through the application layer and combines them with stored job statistics. No live probing; no provider import in the facade or dashboard.
4. **Export: CSV only, synchronous, capped at 5,000 rows** for the current filtered result set, generated server-side. Over the cap the response returns a typed "refine filters" result; background/async export and PDF/Excel are deferred.
5. **CQRS split.** `src/lib/provisioning-admin/queries.functions.ts` and `commands.functions.ts`, with server-only helpers in `*.server.ts`.
6. **SSE lifecycle.** One stream per open job detail view; heartbeat comment every 20s; client reconnect with exponential backoff (1s → max 30s) and a cap of 5 consecutive failures before falling back to polling for the rest of the session; the stream is closed and the transport unwired on unmount/navigation. Terminal job states close the stream server-side.
7. **Cache invalidation.** Every successful command invalidates a documented key set: `start` → summary + list + queue; `retry`/`cancel` → detail(jobId) + list + summary + queue; `rollback` → detail(jobId) + failed + summary. SSE messages patch the detail query directly; polling fallback uses the backend-declared interval.

### Phase 1 — Routes, navigation, shell

- Five Platform nav entries in `src/components/platform/nav-items.ts`: Tenant Provisioning, Provisioning History, Provider Health, Failed Provisioning, Provisioning Queue.
- Routes under `src/routes/_authenticated/platform/provisioning/` (`index`, `history`, `health`, `failed`, `queue`, `$jobId`), guarded on existing `PERMISSIONS.PLATFORM_TENANT_READ` / `PLATFORM_TENANT_CREATE`; unauthorized users redirect. Dedicated `platform.provisioning.*` keys would need a permission migration — deferred, so future RBAC is a route-level change only.
- Shell: header → summary cards → queue → recent provisioning → provider status → activity timeline → drawer → dialogs. Desktop-first; tables collapse to cards, no horizontal scroll.

### Phase 2 — Read-only dashboard

`queries.functions.ts`: `getProvisioningSummary`, `listProvisioningJobs` (server-side search/filter/sort/pagination), `getProvisioningJob` (detail + steps + timeline), `listFailedProvisioning`, `getProvisioningQueue`, `getProviderHealth`, `exportProvisioningJobsCsv`.

Hooks (`useProvisioningDashboard`, `useProvisioningStatus`, `useProviderHealth`, `useProvisioningEvents`, `useProvisioningFilters`) wrap these with TanStack Query; routes prime the cache via `ensureQueryData`, components read with `useSuspenseQuery`.

Components: `SummaryCards`, `ProvisioningTable`, `ProviderHealthCard`, `ProvisioningTimeline`, `StatusBadge`, `ProgressBar`, `SearchBar`, `FilterPanel`, `EmptyState`, `LoadingState`, `ErrorState`. Every surface ships loading / empty / error / success.

### Phase 3 — Wizard

Five steps (Tenant → Organization → Provider → Review → Submit). Provider select disabled while Supabase is the only provider. Submit calls `startTenantProvisioning` once, which delegates to `ProvisioningService.startProvisioning()`, then navigates to `/platform/provisioning/$jobId`.

### Phase 4 — Details drawer & live updates

- `TenantDrawer`: tenant info, state, current/completed/pending steps, correlation ID, provider, region, created/updated, retry count, typed error, rollback status, timeline. Read-only apart from actions.
- SSE route `src/routes/api/provisioning/events/$jobId.ts` wires an `EventTransport` into the sink for the active job, following the lifecycle rules above; polling is the fallback.
- Errors render from the existing typed error model only — no stack traces, HTTP bodies, SQL, or provider exceptions.

### Phase 5 — Actions

`commands.functions.ts`: `startTenantProvisioning`, `retryProvisioning` (resume / executeNextStep), `rollbackProvisioning`, `cancelProvisioning`. Plus Refresh and the CSV export query. Each destructive action sits behind a confirmation dialog (`RetryDialog`, `RollbackDialog`, cancel and create confirmations, `FailureDialog` for detail). No Delete.

### Phase 6 — Search, filters, performance

Debounced server-side search (tenant, company, provisioning ID, correlation ID, provider, status); server-side filters (status, provider, region, created date, requested by, retryable, rollback state); virtualized rows, lazily imported dialogs, memoized cells, code-split routes.

### Phase 7 — Tests

Component, hook, wizard-flow, route-guard/permission, accessibility (keyboard, ARIA, focus trap, contrast), responsive rendering, event-update (including SSE reconnect → polling fallback), cache-invalidation, dialog, and error-display tests — plus a boundary test extending the existing `boundaries.test.ts` pattern asserting `src/modules/platform/provisioning/**` imports only the facade, DTOs, and view models: never `@supabase/supabase-js`, provider, repository, data-client, retry, rollback, migration, or seed modules. Close with typecheck, production build, and the full suite (existing 308 green plus new UI tests).

### Files touched outside the new module

`src/components/platform/nav-items.ts`, the platform route tree, and the new `src/lib/provisioning-admin/` facade. Orchestrator, provider, repository, domain, retry, rollback, migration and seed files remain untouched.

### Known limitations to report at gate close

No persisted event log (timeline is step-derived); provider health statistics are historical, not probed; CSV export only, capped at 5,000 rows; provisioning permissions ride on `PLATFORM_TENANT_*` until an RBAC migration lands.
