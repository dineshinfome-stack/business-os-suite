
# Phase 2 — Tenant Registry Implementation (SPR-MOD-001-001) — v6

**Mode:** Implementation. Metadata registry only — no provisioning, no dedicated-database creation, no infrastructure orchestration.

**Governing standards:** ADR-017 · MOD-001 v1.0 Certification · REUSE_BEFORE_BUILD_STANDARD · TENANCY_STANDARD v2.0 · DATABASE_STANDARD · Phase 0 Reuse Inventory · Phase 1 Foundation Summary.

**Source-of-truth precedence.** Where this prompt names a concrete field, lifecycle state, permission, index, or event, the **certified PRD** (`docs/30-sprint-prds/platform/SPR-MOD-001-001_v2.md`) and the corresponding Solution Design in the repository override this prompt on any discrepancy. This prompt does not define the data model.

## Execution gates (sequential — do not skip)

Implementation proceeds strictly in this order. Each gate must be green before the next begins.

- **Gate 0 — Discovery.** Reuse inventory + pre-implementation permission check complete.
- **Gate 1 — Migration.** Schema migration authored, applied, and verified. Must pass:
  - Migration Rules + Migration Verification (clean DB, populated DB, idempotency, automated RLS/GRANT/index inspection).
  - Existing Tenant APIs pass backward-compatibility tests (integration suite + response-shape snapshot diff) **against the migrated schema, with no code changes to the API layer.**
  - `bun run build` · `tsgo --noEmit` · `bun test` green.
  - **Halt condition:** any failure ⇒ revert migration, restore Phase 1 state, stop and report.
- **Gate 2 — Backend.** `updateTenant`, `searchTenants`, `getTenantRegistryStats` + validators + full server test matrix. Build/type/test green.
- **Gate 3 — UI.** List/create/detail extensions wired to the Gate 2 backend.
- **Gate 4 — Dashboard.** Placeholder retired; Tenant Registry widget wired to `getTenantRegistryStats`.
- **Gate 5 — Definition of Done.** Verification table + summary document published.

UI and dashboard work MUST NOT begin until Gate 1 is green.

## Discovery — assets to reuse (do not replace)

- `src/lib/tenants/tenants.functions.ts` — `listTenants`, `getTenant`, `createTenant`, `activateTenant`, `suspendTenant`, `archiveTenant` (all `requireSupabaseAuth`, lifecycle RPCs in `private`).
- `src/lib/tenants/{slug,lifecycle,events,audit}.ts` — validators, state machine, event builder, `logTenantEventFn`.
- `src/routes/_authenticated/platform/tenants/index.tsx` (+ detail route if present).
- `src/lib/generated/permission-keys.ts` — `platform.tenant.{read,create,activate,suspend,archive}`.
- `public.tenants` (existing columns + lifecycle enum).
- `src/dashboard/template/*` — registry + Phase 1 placeholder widget.
- Shared UI: `DataGrid`, `Dialog`, `Input`, `Label`, `Badge`, `Can`, `toast`, `useAuth`.

**Pre-implementation permission check.** Before adding a new permission key, grep `docs/15-governance/permission-catalog.manifest.yaml` and `src/lib/generated/permission-keys.ts` for an existing equivalent (e.g. `platform.tenant.edit`, `platform.tenant.manage`). Reuse the existing key if one exists; only add `platform.tenant.update` when none is present.

## Scope

### 1. Schema extension (migration) — **Gate 1**

Extend `public.tenants` with the metadata fields defined in the **certified Solution Design and PRD**. Do not introduce fields absent from those artifacts.

**Migration Rules (mandatory):**
- Backward compatible; new columns nullable or defaulted.
- Idempotent (`IF NOT EXISTS`, guarded `DO` blocks).
- Preserve existing data, RLS policies, and GRANTs (re-issue GRANTs per DATABASE_STANDARD; never widen).
- No destructive operations, no column drops, no data rewrites, no policy relaxation.
- Lifecycle model unchanged unless the certified PRD/SD already extends it.

**Migration Verification (mandatory, evidence in summary):**
- Runs cleanly on an empty database.
- Runs cleanly on the current populated database.
- Repeated execution is safe.
- Existing tenant rows unchanged except for the new nullable/defaulted columns.
- RLS + GRANTs post-migration match pre-migration state via **automated schema inspection** (queries against `pg_policies`, `information_schema.table_privileges`, `pg_indexes`).
- Existing Tenant API integration tests + response-shape snapshot diff pass **without code changes to the API layer.**

### 2. Domain & validation — **Gate 2**

Add `src/lib/tenants/registry.ts` — Zod validators for the certified create/update payload. Reuse `normalizeSlug`/`isValidSlug`. No parallel validation stack.

### 3. Server functions (extend the existing module) — **Gate 2**

Extend `src/lib/tenants/tenants.functions.ts`:

- `updateTenant` — patch registry metadata; no lifecycle change.
- `searchTenants` — server-side filter + pagination.
- `getTenantRegistryStats` — counts per lifecycle_state.

**Reuse rules:** reuse `requireSupabaseAuth`, existing permission enforcement, `logTenantEventFn`, existing transaction/RPC patterns, validators, and error-shaping helpers. No duplicated auth, authorization, audit, transactions, mapping, or error handling.

### 4. Search behavior (specified) — **Gate 2**

- Exact match on tenant code (case-insensitive).
- Partial match on display name and slug (case-insensitive, prefix + substring).
- Filter by `lifecycle_state` and `provisioning_status` per certified model.
- Deterministic default sort (`created_at desc, id desc`); stable pagination.
- **Collation.** Reuse the existing repository/database collation conventions (`citext`/`ILIKE`/`lower()` as already used by existing tenant queries). No new collation strategy.

**Performance:**
- Reuse existing indexes where available.
- Add new indexes only when the certified SD requires them; declare them in the Gate 1 migration.
- Avoid full-table scans on search paths that are indexed by the certified SD.
- **Index usage verification.** For each new SD-declared index, capture an `EXPLAIN` plan showing the index is used.
  - `EXPLAIN ANALYZE` may only be run against **development or seed datasets.** Never production. Plain `EXPLAIN` is sufficient elsewhere.

### 5. Audit — **Gate 2**

Reuse `logTenantEventFn` with action names defined by the certified PRD (`tenant.updated`, etc.). **Preserve the existing event schema and correlation identifiers** — no new event envelope, no renamed fields, no removed correlation IDs. Downstream audit consumers must remain functional.

### 6. UI — extend existing pages — **Gate 3**

- `platform/tenants/index.tsx`: expand create dialog to certified metadata; add filter/search bar; add columns for surfaced fields; wire pagination.
- Tenant detail page: **extend if present; otherwise add minimal route consistent with existing conventions.** Metadata Edit form + Archive confirmation. Existing lifecycle actions untouched.
- Reuse only existing shared components. No new shared components.

### 7. Dashboard integration — **Gate 4**

Replace the **Phase 1 placeholder widget** on `/platform/dashboard` with a Tenant Registry widget rendering live counts from `getTenantRegistryStats`. Register via the existing widget registry — no module-scope side effects in the route file (Phase 1 fix stands).

### 8. Navigation

`administration.platform.tenants` already exists — **no changes**. No duplicates.

### 9. RBAC — **Gate 2**

If (and only if) no equivalent exists, add `platform.tenant.update` to `docs/15-governance/permission-catalog.manifest.yaml` and regenerate `src/lib/generated/permission-keys.ts` via `bun run generate:permissions`.

## Ownership boundary (documented in code + summary)

- **Tenant Registry (this phase) OWNS:** metadata, status flags, contacts, references, opaque `dedicated_database_ref`, opaque `subscription_ref`.
- **Provisioning Engine (Phase 3) OWNS:** dedicated database creation, secrets, Supabase project APIs, provisioning jobs, workers, infrastructure secrets.
- Registry code MUST NOT call any infrastructure API, spawn jobs, or write outside the Platform database. Provisioning-adjacent TODOs use the `PHASE-3-PROVISIONING` comment tag — never a feature flag.

## Repository safety

**Allowed:** extend existing tenant module, add one migration, add one widget, add one permission (only if none exists), add registry validators + tests.
**Not allowed:** delete/rename files; refactor auth/RBAC/navigation/dashboard shell; introduce provisioning code (even behind feature flags); module-scope side effects in route files; new shared components; parallel service/hook/validation stacks.
**No silent refactors:** if routing/contracts/permission model must change, STOP and request approval.
**Rollback:** if any gate fails — revert to Phase 1 state.

## Testing (mandatory coverage)

Under `src/lib/tenants/__tests__/`:

- **Unit** — validators (code, email, domain, phone, slug edges).
- **Integration** — `updateTenant`, `searchTenants`, `getTenantRegistryStats` happy paths.
- **Permission** — unauthenticated + missing permission → 401/403; each action checks its declared permission.
- **Validation** — rejects malformed metadata; enforces uniqueness where declared.
- **Search** — exact code, partial name/slug, case-insensitivity, filter combinations.
- **Pagination** — deterministic order, stable across pages, correct total.
- **Archive** — transitions honored; idempotent; no regression on already-archived tenants.
- **Stats** — counts equal ground-truth query on seed data.
- **Backward compatibility** — pre-existing `listTenants`/`getTenant`/`createTenant`/`activateTenant`/`suspendTenant`/`archiveTenant` shapes and behavior unchanged after migration. Evidence: existing integration tests remain green **plus** a response-shape snapshot per API captured before/after and diffed in the summary. This suite runs at Gate 1.

## Definition of Done

- All 5 gates green in order.
- Migration applied per Migration Rules; Migration Verification executed with automated-inspection evidence recorded (Gate 1).
- `updateTenant`, `searchTenants`, `getTenantRegistryStats` implemented, permission-gated, audited with preserved event schema (Gate 2).
- Tenant list supports specified search + filter + pagination; create dialog captures certified metadata; detail page supports edit + archive (Gate 3).
- Dashboard widget shows live registry counts, Phase 1 placeholder retired (Gate 4).
- Permission reused or (if absent) `platform.tenant.update` generated and enforced.
- **Existing Tenant APIs behave backward compatibly** (evidence per §Testing).
- `bun run build` · `tsgo --noEmit` · `bun test` all green.
- No duplicate services/pages/hooks/validators introduced.
- `docs/60-engineering/PHASE2_TENANT_REGISTRY_SUMMARY.md` published — Reused / Extended / Created / CREATE justifications / Refactored / Deferred / Known Limitations / Phase 3 dependencies / Ownership boundary — including the verification table below and inspection/EXPLAIN/snapshot evidence.

### Required verification table in the summary

| Gate | Verification | Result | Evidence |
|---|---|---|---|
| 1 | Migration — clean DB | PASS/FAIL | Applied successfully |
| 1 | Migration — populated DB | PASS/FAIL | Applied without data change to existing rows |
| 1 | Migration — idempotency | PASS/FAIL | Re-applied safely |
| 1 | RLS + GRANTs preserved | PASS/FAIL | Automated inspection diff (`pg_policies`, `information_schema.table_privileges`) |
| 1 | Backward compatibility (post-migration, pre-backend) | PASS/FAIL | Existing tenant API integration tests + response-shape snapshot diff, no API code changes |
| 1 | Build / Type / Test after migration | PASS/FAIL | `bun run build` · `tsgo --noEmit` · `bun test` |
| 2 | Index usage | PASS/FAIL | `EXPLAIN` output per new SD-declared index (dev/seed only for `ANALYZE`) |
| 2 | Backend test matrix | PASS/FAIL | `bun test` (counts + new suite names) |
| 3 | UI reuse | PASS/FAIL | No new shared components; existing dialogs/grid reused |
| 4 | Dashboard widget live | PASS/FAIL | Placeholder retired; counts from `getTenantRegistryStats` |
| 5 | Reuse-Before-Build | PASS/FAIL | No duplicate implementations |
| 5 | Ownership boundary | PASS/FAIL | No infrastructure calls in registry code |
| 5 | Final Build / Type / Test | PASS/FAIL | All green |

## Stop Rule

When DoD is met: **STOP.** No Provisioning Engine, no dedicated DB creation, no lifecycle automation. **No Provisioning-Engine code, even behind feature flags.** Await Phase 3 authorization.

## Technical section

**Files changed / created:**

- `supabase/migrations/<ts>_tenant_registry_metadata.sql` *(new — Gate 1)*.
- `src/lib/tenants/registry.ts` *(new — Gate 2)*.
- `src/lib/tenants/tenants.functions.ts` — add `updateTenant`, `searchTenants`, `getTenantRegistryStats` *(Gate 2)*.
- `src/lib/tenants/__tests__/*.test.ts` *(new — Gate 1 backward-compat snapshot suite; Gate 2 full matrix)*.
- `src/routes/_authenticated/platform/tenants/index.tsx` — expanded dialog, filter/search, pagination *(Gate 3)*.
- Tenant detail route — extend if present; otherwise add per existing conventions *(Gate 3)*.
- New Tenant Registry widget under `src/dashboard/template/widgets/`, replacing the Phase 1 placeholder *(Gate 4)*.
- `docs/15-governance/permission-catalog.manifest.yaml` — only if no equivalent exists; regenerate `src/lib/generated/permission-keys.ts` *(Gate 2)*.
- `docs/60-engineering/PHASE2_TENANT_REGISTRY_SUMMARY.md` *(new — Gate 5)*.

**Not touched:** auth context, RBAC middleware, navigation registry, Supabase clients, dashboard template shell, Phase 1 foundation (`src/lib/platform/*`), lifecycle RPCs, event schema.
