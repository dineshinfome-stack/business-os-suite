## Phase 2 — Gate 4: Dashboard Integration (SPR-MOD-001-001)

Presentation-only. No backend, database, API, or provisioning changes.

### Verified current state
- Placeholder `PlatformFoundationWidget` (id `platform.foundation.placeholder`) is registered in `src/dashboard/template/widgets/PlatformFoundationWidget.tsx` and referenced only by `src/routes/_authenticated/platform/dashboard.tsx` (side-effect import + `widgets: [...]`).
- No Tenant Registry widget exists yet — no duplicate implementation.
- `getTenantRegistryStats()` in `src/lib/tenants/tenants.functions.ts` returns `{ total, byLifecycle: { created, active, suspended, archived }, byProvisioning: { not_started, in_progress, provisioned, failed } }`.
- Reusable assets confirmed: `WidgetCard`, `registerDashboardWidget`, `DashboardWidgets` (permission-filtered), `CardSkeleton`, `NoData`/`EmptyState`, `Alert`, `Badge`, `Button`, `Card` — all re-exported from `@/components/common`.

### 1. New widget — `src/dashboard/template/widgets/TenantRegistryWidget.tsx`
- Title "Tenant Registry", subtitle "Platform-wide tenant overview", rendered inside the existing `WidgetCard`.
- Data via `useServerFn(getTenantRegistryStats)` + a single `useQuery` (`staleTime` set, no polling, no refetch interval, no realtime).
- States:
  - loading → existing `CardSkeleton`
  - error → existing `Alert` with "Unable to load tenant statistics." and a Retry button calling `refetch()`
  - `total === 0` → existing `NoData`/`EmptyState` with "No tenant statistics available."
  - success → stat tiles: Total, Active, Created (draft), Suspended, Archived, Provisioned, In progress, Failed — values rendered exactly as returned; only number formatting is applied.
- Existing `Badge` variants and theme tokens only; no new colors or components.
- Accessibility: section heading provided by `WidgetCard` title, each tile labelled via `aria-label`/`<dl>` semantics, retry is a real focusable `Button`.
- Registration via `registerDashboardWidget({ id: "platform.tenant.registry", ... })` in this same module, matching the existing mechanism, with no widget-specific permission (inherits `platform.dashboard.view` gating of the dashboard route).

### 2. Registration swap (unregister first, delete later)
- `src/routes/_authenticated/platform/dashboard.tsx`: change the side-effect import to the new widget module and set `widgets: ["platform.tenant.registry"]`.
- The Phase 1 placeholder becomes unregistered by virtue of no longer being imported. `PlatformFoundationWidget.tsx` is **not** deleted in this step.

### 3. Tests — `src/dashboard/template/widgets/__tests__/TenantRegistryWidget.test.tsx`
- Unit: renders; loading skeleton; empty state; error state + retry; counts displayed correctly.
- Integration: widget resolves from the registry by id; placeholder id is not registered on the dashboard; single stats call asserted (mocked server fn call count).
- Regression: existing `bun test` suite (80 tests) must stay green.

### 4. Verification
`bun run build`, `tsgo --noEmit`, `bun test` — all must pass before any cleanup.

### 5. Post-validation cleanup (only after step 4 is green)
- Re-run a repository-wide reference scan for `PlatformFoundationWidget` and `platform.foundation.placeholder` across source, tests, stories, exports, and docs.
- If zero live code references remain (documentation-only mentions in `PHASE1_PLATFORM_FOUNDATION_SUMMARY.md` do not block), delete the file and re-run build/typecheck/tests.
- If any live reference remains, retain the file unregistered and record it as a known limitation in the Gate 4 summary.

### 6. Documentation
`docs/60-engineering/PHASE2_GATE4_DASHBOARD_SUMMARY.md` — reused components, new/modified files, registration evidence, reference-scan output for the placeholder, its retained-or-deleted disposition, test/build/typecheck results, explicit confirmation of no backend/DB/API/provisioning change, known limitations (manual refresh only; stats computed by row scan, acceptable at current volume).

### Stop rule
Stop after DoD is met and the summary is published. No Gate 5, provisioning, lifecycle automation, or background work.
