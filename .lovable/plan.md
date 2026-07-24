# Phase 3 — UI & RBAC for SPR-MOD-001-002

Consume Phase 2 server functions in `src/lib/organizations`, `src/lib/branches`, `src/lib/financial-years`. Zero backend/database/test/documentation work.

## Architecture Board Decision — SIP-018

**SIP-018 is deferred to Phase 4 (Testing & Quality Assurance).** Phase 3 scope is limited to **SIP-015, SIP-016, and SIP-017**. This deferment is an approved phase-boundary decision and is **not** a scope deviation.

## Repository Reuse Baseline (from SPR-MOD-001-001)

Reference implementation: `src/routes/_authenticated/platform/tenants/{index,$tenantId}.tsx`. All new UI mirrors these files' structure and imports:

- Routing: TanStack `createFileRoute` under `_authenticated/platform/…`
- Data: `useServerFn` + `useQuery` / `useMutation` + `queryClient.invalidateQueries`
- Tables: `@/components/tables/DataGrid` with `ColumnDef`
- Dialogs: `@/components/ui/dialog`
- Permission gates: `<Can permission={PERMISSIONS.*}>` from `@/components/auth/Can`
- Toasts: `sonner` (respect `already_*` result flags exactly like tenant page)
- Status: local `LifecycleBadge` pattern with same variant mapping
- Loading: inline muted text (same as tenant pages) — no new skeleton components
- Forms: `Input` + `Label` inside `Dialog`; no new form abstractions
- Empty state: `DataGrid` handles empty rendering

No new component library, no new state manager, no new routing pattern.

**Query keys**: inspect the repository for a centralized query-key module (e.g. `src/lib/query-keys.ts`); if a convention exists, extend it. If not, use inline arrays consistent with the tenant page (`["platform","tenant",tenantId,"companies"]` etc.).

## Deliverables

### SIP-015 — Companies tab on Tenant detail

Extend `src/routes/_authenticated/platform/tenants/$tenantId.tsx`:

- Add a Companies section using the tenant page's existing layout conventions (introduce `<Tabs>` from `@/components/ui/tabs` only if the current page has no equivalent grouping; otherwise match its structure).
- DataGrid columns: Name, Slug, Default, Lifecycle, Created.
- Actions gated by `<Can>` with `PERMISSIONS.*` constants:
  - Create → dialog (name, slug) → `createCompany`
  - Row actions: Activate / Deactivate / Archive / Set default → respective server fns
- Query invalidation on mutation success following tenant page pattern.
- Toasts respect `already_active` / `already_archived` / etc. flags returned by Phase 2.

### SIP-016 — Company detail with Branches & Financial Years tabs

New route: `src/routes/_authenticated/platform/companies/$companyId.tsx`

- Header: company name/slug, `LifecycleBadge`, action buttons (Activate/Deactivate/Archive/Set default) gated by `<Can>`, enable/disable driven by `canTransition()` from `src/lib/organizations/lifecycle.ts`.
- **Edit dialog omitted** — `updateCompany` does not exist in `company.functions.ts`; matches PRD note "Edit Company (where supported by PRD)".
- Tabs: `Branches` | `Financial Years`.
  - **Branches**: DataGrid (Name, Code, Default, Lifecycle, Created). Actions: Create (dialog), Update (dialog), Archive, Set default → `branch.functions.ts`. Enable/disable via `canTransition` from `src/lib/branches/lifecycle.ts`.
  - **Financial Years**: DataGrid (Label, Start, End, Default, Lifecycle). Actions: Create (dialog: label, startDate, endDate), Open, Close, Archive, Set default → `financial-year.functions.ts`. Enable/disable via `canTransition` from `src/lib/financial-years/lifecycle.ts`.
- Query keys namespaced under `["platform","company",companyId,…]` (or centralized module if present).
- Link from Companies row (SIP-015) → `/platform/companies/$companyId`.

### SIP-017 — Navigation registration

Extend `src/lib/navigation/registry.ts` under the existing `administration.platform` group (no new top-level module):

- Inspect the existing `listCompanies` / `listBranches` / `listFinancialYears` server-function signatures and implement the navigation pattern that matches them. **Do not introduce additional routes solely to satisfy navigation.**
  - If a signature is cross-tenant (no required tenantId), register a top-level list route.
  - If a signature is tenant/company-scoped, register a nav item that deep-links to the appropriate parent context (Tenant detail Companies tab / Company detail Branches or Financial Years tab) and add discovery keywords for the command palette.
- All new nav items use generated `PermissionKey` constants from `@/lib/generated/permission-keys` — no string literals.
- Follow the stable `nav_id` contract documented at the top of `registry.ts` (permanent ids, no renames).

Any Companies list route required by SIP-017 is created at `src/routes/_authenticated/platform/companies/index.tsx` only if `listCompanies` supports cross-tenant listing.

## Permission & Server Function Contract

- Only imports from `@/lib/generated/permission-keys` (`PERMISSIONS.*`) — no permission string literals.
- Only imports from `company.functions.ts`, `branch.functions.ts`, `financial-year.functions.ts` — no direct `.rpc()`, no direct `supabase.from()` on lifecycle tables, no duplication of lifecycle logic or validation.
- `canTransition()` helpers gate button enablement; server remains authoritative.

## Validation Before Stop

- `bunx tsgo --noEmit` clean.
- Route tree regenerates automatically (no manual edits to `routeTree.gen.ts`).
- `rg` sweeps across new/modified UI files:
  - no `\.rpc\(`
  - no permission string literals matching `platform\.(company|branch|financialyear)\.`
  - no `console.`
  - no `TODO`
- No circular imports.
- All lifecycle actions dispatch through Phase 2 server functions.

## Stop Deliverables

- List of new/modified files and routes.
- SIP task status: SIP-015 ✅, SIP-016 ✅, SIP-017 ✅, SIP-018 ⏸ Deferred to Phase 4 (Board decision).
- Validation summary (tsgo + rg sweeps).
- Repository deviations (if any) with justification.
- Blockers (if any).
- Phase 4 recommendations (vitest coverage for lifecycle machines + FY overlap + default-flag invariant + slug normalization per SIP-018; Playwright flows for company/branch/FY lifecycle transitions).

## Out of Scope (Explicit)

Testing, documentation, Sprint Completion Report, Acceptance Review, Program Status, IMP CHANGELOG, SIP archival, Company/Branch Settings UI, Settings Namespace Bootstrap proposal implementation.

## Stop Condition

Stop immediately after SIP-015, SIP-016, and SIP-017 are complete and validation passes. Await Architecture Board review before proceeding to Phase 4.
