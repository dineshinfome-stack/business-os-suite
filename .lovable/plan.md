
# SPR-MOD-001-001 — Tenancy Foundation Implementation Plan (v1.1)

Executes SIP-001 → SIP-023 verbatim to the SIP. No new requirements, no scope expansion. Wave 0 primitives (organizations, RBAC, audit, settings, notifications, navigation) are treated as prerequisites and are **not** re-implemented. **v1.1 incorporates the Architecture Board's implementation clarifications** (idempotency, slug normalization, rollback semantics, transition matrix, RLS edge cases, resilient denial logging, concurrent-activation test, migration numbering, and documentation phrasing).

## Conceptual model (per Sprint PRD / ADR-011 / ADR-012)

`tenant` is introduced as the **platform isolation unit**. The existing `organizations` table becomes the **seed company** created atomically when a tenant activates (per AC-2). Every tenant-scoped row carries `tenant_id`; existing `organizations.tenant_id` back-fills to a synthetic active tenant per current org so Wave 0 tests stay green (R6).

```text
tenant (platform isolation)
 └── organization (seed company, 1..1 at bootstrap; hierarchy managed by SPR-002)
      └── branch (seed default)
           └── financial_year (placeholder)
```

## Explicit lifecycle transition matrix (clarification #5)

```text
From         To            Allowed  Notes
created      active        ✅       Runs atomic bootstrap; emits tenant.activated
active       suspended     ✅       Emits tenant.suspended; blocks tenant-scoped writes
suspended    active        ✅       Re-activation; no new bootstrap (idempotent)
active       archived      ✅       Emits tenant.archived; writes blocked, reads allowed
suspended    archived      ✅       Emits tenant.archived
created      suspended     ❌       Rejected
created      archived      ❌       Rejected
archived     *             ❌       Terminal
same → same                ❌       Rejected (no event emitted)
```

The matrix is encoded in `src/lib/tenants/lifecycle.ts` as a `Record<state, Set<state>>` and in `private.assert_lifecycle_transition(from, to)` for defence in depth.

## Deliverables mapped to SIP tasks

### Database (SIP-001, 002, 004, 007) — clarification #1: symbolic migration ordering

Migration numbers assigned at author-time against then-current repo state. Three migrations, executed in this order:

**A. Tenants schema migration** *(next available number)*
- `public.tenant_lifecycle_state` enum (`created`,`active`,`suspended`,`archived`).
- `public.tenants` (id uuid PK default `gen_random_uuid()`, slug citext UNIQUE NOT NULL, display_name, region, default_locale, timezone, plan_tier, lifecycle_state default `created`, created_by, created_at, updated_at, activated_at, suspended_at, archived_at). Slug immutable via BEFORE UPDATE trigger raising when NEW.slug ≠ OLD.slug; id column has no update path.
- `public.branches` (id, tenant_id FK, organization_id FK, code, name, is_default, timestamps; UNIQUE (organization_id, code); UNIQUE (organization_id) WHERE is_default — supports idempotent bootstrap).
- `public.financial_years` (id, tenant_id FK, organization_id FK, code, start_date, end_date, is_placeholder, timestamps; UNIQUE (organization_id, code)).
- `organizations.tenant_id uuid` column + FK; back-fill wraps each existing org in a synthesized `tenants` row (`lifecycle_state='active'`, slug derived + normalized from org slug with collision suffix). NOT NULL enforced after back-fill.
- GRANTs to `authenticated` + `service_role` per public-schema rule.
- RLS ENABLE + policies on `tenants`, `branches`, `financial_years` using `private.current_tenant_id()`.

**B. Tenancy helpers migration** *(next available number)*
- `private.normalize_slug(text) → citext` — trim, lowercase, replace non-alphanumerics with `-`, collapse repeats, strip leading/trailing `-`. Used by validation **before** uniqueness check (clarification #3).
- `private.current_tenant_id() → uuid` SECURITY DEFINER. **Edge-case contract (clarification #6):** returns NULL when the caller has no active organization membership. Does **not** raise. RLS policies treat NULL as "no tenant" → row is invisible (deny by default). Platform-admin surfaces bypass via `private.is_platform_admin()`.
- `private.is_platform_admin() → boolean` — reuses existing `has_role(auth.uid(),'platform_admin')`.
- `private.assert_tenant_active(tenant uuid)` — raises `insufficient_privilege` when not `active` (backs AC 5.3/5.4 write-block).
- `private.assert_lifecycle_transition(from state, to state)` — raises on disallowed transitions per matrix above.
- `private.log_cross_tenant_denial(...)` — **resilient logging (clarification #7):** wrapped in `BEGIN … EXCEPTION WHEN OTHERS THEN PERFORM pg_notify('audit_fallback', …) END;` so an audit failure never masks the original authorization error; uses SECURITY DEFINER on a dedicated write-only path, so it cannot recurse into a policy denial on `audit_logs`.
- `private.activate_tenant(p_tenant uuid) → jsonb` — **idempotent, atomic bootstrap (clarifications #2, #4):**
  - Runs inside a single transaction; on any error the whole transaction ROLLBACKs (no partial state).
  - `SELECT … FOR UPDATE` on the tenant row → serializes concurrent activations (clarification: concurrent-activation test).
  - If already `active`: returns existing seed org/branch/FY ids; emits no new event; no duplicate rows.
  - If `created`: asserts transition, inserts seed `organizations`+`branches`+`financial_years` with `ON CONFLICT DO NOTHING` on the natural keys above, flips state to `active`, sets `activated_at`, initializes `setting_values` and `feature_flags` namespaces (INSERT … ON CONFLICT DO NOTHING).
  - Returns `{tenant_id, organization_id, branch_id, financial_year_id, already_active: bool}`.
- Analogous `private.suspend_tenant`, `private.archive_tenant` RPCs — guard via matrix, update state + `*_at`, return prior state.

**C. Tenant permissions migration** *(next available number)*
- Insert `platform.tenant.read|create|activate|suspend|archive` into `permissions`.
- Grant to `platform_admin` role via `role_permissions`.

### Backend — lifecycle & bootstrap (SIP-003, 004, 005, 006, 009–015)
- `src/lib/tenants/lifecycle.ts` — transition matrix + `canTransition(from,to)` guard (pure).
- `src/lib/tenants/slug.ts` — `normalizeSlug()` mirroring `private.normalize_slug` (clarification #3); validation calls normalize → Zod format check → DB uniqueness.
- `src/lib/tenants/events.ts` — `tenant.*` event payload builders conforming to ADR-051 envelope; publish via existing notifications/eventing surface, channel `tenant`.
- `src/lib/tenants/tenants.functions.ts` (createServerFn, `.middleware([requireSupabaseAuth])`, platform-admin gate):
  - `createTenant` — normalizes slug, Zod-validates metadata, inserts tenant in `created`, audits, emits `tenant.created`.
  - `activateTenant` — invokes `private.activate_tenant` RPC. On `already_active=true`, does **not** re-emit `tenant.activated` and does **not** re-audit as a fresh transition (idempotent retry semantics, clarification #2); returns the existing bootstrap ids.
  - `suspendTenant`, `archiveTenant` — RPC-backed; audit + event only on real state change.
  - `listTenants`, `getTenant` — platform-admin only.
- Audit via `src/lib/tenants/audit.ts` → `logTenantEventFn` writing `audit_logs` with `entity='tenant'`, capturing actor, tenant_id, transition, from_state, to_state, timestamp, correlation_id.
- Event catalog: `docs/70-events/tenant-events.md` (SIP-016).

### API surface (SIP-017)
Server functions are the API on this stack. No new `/api/*` routes. Add `docs/70-api/tenants.md` mapping API-001 endpoints ↔ server functions.

### RBAC + Navigation
- Extend permission catalog with `platform.tenant.*`.
- Grants added in permissions migration C.
- Add "Platform Admin → Tenants" node to `src/lib/navigation/registry.ts`, gated by `platform.tenant.read`.

### Web UI (SIP-018)
- `src/routes/_authenticated/platform.tenants.tsx` — DataGrid of tenants, lifecycle badge, row actions (Create / Activate / Suspend / Archive) via shadcn Dialog + `<Can>` gates. Action buttons disabled for disallowed transitions per matrix; UI reads `canTransition` from shared `lifecycle.ts` so client and server share one source of truth.
- `src/routes/_authenticated/platform.tenants.$tenantId.tsx` — detail (metadata, bootstrap ids, lifecycle history from audit).
- Loader → `listTenants` via `queryOptions` + `useSuspenseQuery`.

### Mobile (SIP-019)
Read-only per SIP scope. Add `src/hooks/tenants/useCurrentTenant.ts` exposing tenant metadata derived from active org.

### Tenant context propagation (SIP-020)
Extend the org context provider to expose `tenantId` alongside `orgId`; add `tenant_id` field to `src/lib/correlation.ts` so every structured log line and audit row carries it.

### Observability (SIP-021)
Structured log fields `{ tenant_id, transition, actor_id, correlation_id }` on every lifecycle handler using existing `logger.ts`.

### Tests (SIP-022) — clarification: concurrent-activation scenario added
- `src/lib/tenants/__tests__/lifecycle.test.ts` — transition matrix (allowed + rejected cases).
- `src/lib/tenants/__tests__/slug.test.ts` — normalization + collision behavior.
- `src/lib/tenants/__tests__/validators.test.ts` — Zod metadata.
- `src/lib/tenants/__tests__/events.test.ts` — envelope conformance.
- `src/lib/tenants/__tests__/bootstrap.integration.test.ts` — single-transaction bootstrap + rollback on injected failure (no partial rows).
- `src/lib/tenants/__tests__/idempotency.integration.test.ts` — activate twice sequentially → one event, one bootstrap, existing ids returned.
- `src/lib/tenants/__tests__/concurrency.integration.test.ts` — two `activateTenant` calls fired in parallel against the same tenant → exactly one performs bootstrap, other returns `already_active` with identical ids; no duplicate org/branch/FY rows.
- `src/lib/tenants/__tests__/isolation.smoke.test.ts` — RLS fixture: two tenants, cross-read denied, denial audit row exists; audit failure injection verifies original 403 is preserved (clarification #7).

### Documentation (SIP-023) — clarification #8
- Update `docs/SPRINT_CATALOG.md`: SPR-MOD-001-001 → **Implementation Complete (Pending Review & Quality Gate)**.
- Update `docs/30-sprint-prds/platform/README.md` with the same phrasing.
- Author `docs/50-audit-reports/SPRINT_MOD_001_001_TENANCY_FOUNDATION_REPORT.md` with 23-row task matrix, AC verification, idempotency + concurrency evidence, and quality-gate results.

## Sequencing

1. Migration A (schema) → B (helpers + RPCs) → C (permissions).
2. `src/lib/tenants/*` (pure logic + server fns).
3. RBAC + navigation registration.
4. Web routes + UI.
5. Tests + docs + report.

## Out of scope (mirrors SIP §11)
Users, RBAC admin UI, org hierarchy management, config resolution UI, localization, audit review surface.

## Verification gates
- `bunx tsgo --noEmit` clean.
- `bunx vitest run` green including new idempotency, concurrency, and isolation smoke tests.
- Supabase linter clean on new migrations.
- All 7 acceptance criteria (§5.1–§5.7) demonstrated in the completion report.
