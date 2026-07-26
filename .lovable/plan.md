## Gate 3.4 — Completion to Report

Finish the remaining Gate 3.4 work, then deliver a **Gate 3.4 Completion Report** in exactly the requested format (Files created / Files modified / New routes / New components / New hooks / Facade files / DTOs / Tests added / Boundary tests / Accessibility tests / Responsive tests / Current repository test count / Known limitations / Deferred items).

Already present and reused as-is: `types/v1` DTOs, `src/lib/provisioning-admin/*` facade (7 queries, 5 commands), query keys + invalidation, hooks, and the base components/routes for `/platform/provisioning` and `/platform/provisioning/$jobId`. No domain, orchestrator, provider, repository, schema, or permission changes.

### Work to complete

**1. Sub-routes** under `src/routes/_authenticated/platform/provisioning/`
- `history.tsx` — full list: server-side search, filters, sort, pagination, CSV export
- `queue.tsx` — active/queued jobs
- `failed.tsx` — failures with retry/rollback entry points
- `health.tsx` — provider health cards

Each with its own `head()` (unique title, description, og/twitter tags). Index page becomes the overview: summary cards, queue preview, recent jobs, provider health, wizard trigger.

**2. Navigation** — extend `src/components/platform/nav-items.ts` with Provisioning children: Tenant Provisioning, Provisioning History, Provider Health, Failed Provisioning, Provisioning Queue; render children in the platform sidebar (adds an optional `children` field if the type lacks one).

**3. Route guards** — shared client gate on the provisioning subtree using `PERMISSIONS.PLATFORM_TENANT_READ`; wizard and mutating actions gated on `PLATFORM_TENANT_CREATE`. No new permission keys; the facade already enforces server-side.

**4. Drawer + dialogs** — `TenantDrawer` (existing `JobDetailPanel` in a sheet, opened from table rows), plus lazily-loaded `RetryDialog`, `RollbackDialog`, `CancelDialog` (reason required), `FailureDialog`. Typed domain errors only.

**5. Live updates** — server route `src/routes/api/provisioning/events/$jobId.ts`: one stream per job, 20s heartbeat, closes on terminal state, caller verified inside the handler. The client hook already implements 1→30s backoff, 5-attempt cap, and polling fallback; it gets enabled against this endpoint. If the bearer token cannot ride on `EventSource` in this auth model, polling remains the path and it is recorded under Known limitations.

**6. Polish** — debounced search, memoized rows, virtualized history table, lazy dialogs, table→card collapse below `md`, ARIA labels and focus trapping on drawer/dialogs.

**7. Tests** in `src/modules/platform/provisioning/__tests__/` — component states, wizard single-submit + navigate, hooks and cache invalidation, dialogs, typed-error rendering, SSE reconnect + polling fallback, CSV 5,000-row limit message, route guards, accessibility (labels/focus), responsive rendering, and a boundary test asserting no dashboard file imports `@supabase/supabase-js`, provider, repository, data client, retry, rollback, migration, or seed modules.

### Verification
`npx tsgo --noEmit`, production build, full Vitest run; the existing 308 tests must remain green. Final response is the completion report only — no engineering narrative — and work stops before Gate 3.5.

### Technical notes
- Dashboard consumes only facade server functions and `types/v1` DTOs.
- CSV stays server-generated with the typed over-limit validation response.
- Status, progress, and timeline remain backend-derived; UI renders only.
