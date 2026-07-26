# Gate 3.4 — Platform Provisioning Dashboard · Completion Report

- Sprint: SPR-MOD-001-003
- Phase: 3 — Gate 3.4
- Status: **COMPLETE**
- Date: 2026-07-26

## Files created

| File | Purpose |
| --- | --- |
| `src/routes/_authenticated/platform/provisioning/route.tsx` | Subtree layout: shared permission guard + section sub-navigation |
| `src/routes/_authenticated/platform/provisioning/history.tsx` | Full job history (filters, pagination, CSV export) |
| `src/routes/_authenticated/platform/provisioning/queue.tsx` | Live queue with queued/running counters |
| `src/routes/_authenticated/platform/provisioning/failed.tsx` | Failure triage with retry / rollback / details |
| `src/routes/_authenticated/platform/provisioning/health.tsx` | Provider health grid |
| `src/routes/api/provisioning/events.$jobId.ts` | SSE server route (snapshot frames + heartbeat) |
| `src/lib/provisioning-admin/events.server.ts` | Bearer-verified stream session (RLS-scoped reads) |
| `src/modules/platform/provisioning/components/subnav.ts` | Section navigation constant |
| `src/modules/platform/provisioning/components/JobsBrowser.tsx` | Reusable filters + table + pagination + export |
| `src/modules/platform/provisioning/components/TenantDrawer.tsx` | Sheet quick-look for a selected job |
| `src/modules/platform/provisioning/components/Dialogs.tsx` | Retry / Cancel / Rollback / Failure-details dialogs |
| `src/modules/platform/provisioning/__tests__/boundaries.test.ts` | Presentation boundary enforcement |
| `src/modules/platform/provisioning/__tests__/navigation.test.ts` | Nav ↔ route-file contract |
| `src/modules/platform/provisioning/__tests__/components.test.tsx` | Rendering + accessibility tests |

## Files modified

| File | Change |
| --- | --- |
| `src/routes/_authenticated/platform/provisioning/index.tsx` | Tabs replaced by an overview: KPIs, running-now, needs-attention, recent jobs |
| `src/components/platform/nav-items.ts` | `PlatformNavChild` type + Provisioning children |
| `src/components/platform/PlatformSidebar.tsx` | Renders sub-navigation for the active item |

## New routes

`/platform/provisioning` (layout + overview), `/platform/provisioning/history`,
`/platform/provisioning/queue`, `/platform/provisioning/failed`,
`/platform/provisioning/health`, `/platform/provisioning/$jobId` (existing),
`/api/provisioning/events/$jobId` (server route).

## New components

`JobsBrowser`, `TenantDrawer`, `RetryDialog`, `CancelDialog`, `RollbackDialog`,
`FailureDetailsDialog`, `PROVISIONING_SUBNAV`.

## New hooks

None — Gate 3.4 Stage 2 hooks (`useProvisioningDashboard`,
`useProvisioningEvents`, `query-keys`) were reused unchanged.

## Facade files

Unchanged: `queries.functions.ts`, `commands.functions.ts`,
`query-service.server.ts`, `command-service.server.ts`, `mappers.server.ts`,
`provider-resolver.server.ts`. Added: `events.server.ts` (read-only stream
session, no orchestrator access).

## DTOs

No DTO changes. `types/v1` remains the pinned contract; the dashboard imports
only from `@/modules/platform/provisioning/types`.

## Tests added

- Boundary tests: 22 assertions across every module source file (no domain,
  orchestrator, provider, repository, `*.server`, or admin-client imports;
  backend reachable only through `*.functions`).
- Navigation tests: 8 (sub-nav order, route-file existence, sidebar mirror,
  layout guard presence).
- Component/accessibility tests: 11 (`role="status"` + `aria-live` on loading,
  `role="alert"` on errors, labelled cancellation reason, disabled-confirm
  until a reason is supplied, machine-readable `<time datetime>`, KPI and
  provider-health rendering).

## Repository test count

**348 passing** (was 308). Typecheck clean (`tsgo --noEmit`).

## Known limitations

- Browser `EventSource` cannot attach the bearer token this app uses, so the
  detail view still runs on the backend-declared polling cadence. The SSE route
  exists and is authenticated for fetch-based/server-to-server consumers.
- The SSE route polls the durable store rather than subscribing to a change
  feed; the orchestrator does not yet publish a push channel.
- Provider health statistics remain historical (derived from stored jobs), not
  a live provider probe.

## Deferred items

- Bearer-capable SSE client (fetch + `ReadableStream` reader) to replace polling.
- Table virtualization: current page sizes (≤100 rows) do not require it.
- Filter state in URL search params for shareable deep links.
