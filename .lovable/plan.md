
# Phase 3 — Gate 3.1: Provisioning Domain Foundation (SPR-MOD-001-002) — Revised

Domain model only. No provider SDKs, no server functions, no routes, no dashboard, no execution.

## Discovery findings (verified)

| Asset | Path | Status |
|---|---|---|
| Lifecycle pattern (`STATES`, `ALLOWED`, `canTransition`, `assertTransition`) | `src/lib/tenants/lifecycle.ts` | Exists — mirror it |
| Event envelope (`version: 1`, `emitted_at`, `tenant_id`, `actor_id`, `correlation_id`, `data`) | `src/lib/tenants/events.ts` | Exists — reuse shape |
| Audit writer (`audit_logs` via caller JWT) | `src/lib/tenants/audit.ts` | Exists — reuse, no new writer |
| Auth / permission middleware | `src/integrations/supabase/auth-middleware.ts`, `authorization.server.ts` | Exists — unused this gate (no server fns) |
| Platform logger / constants | `src/lib/platform/` | Exists |
| Migration conventions | `public.fn_set_updated_at()`, `GRANT`→`ENABLE RLS`→`CREATE POLICY` | Confirmed in existing migrations |
| Platform-admin RLS predicate | `private.fn_has_role(auth.uid(), 'admin')` (used by `tenants_select/update_platform_admin`) | Confirmed — reuse verbatim |
| Slug helpers | `src/lib/tenants/slug.ts` | Exists — reuse, do not re-implement |
| `src/lib/provisioning/` | — | Does not exist yet |
| `tenants.provisioning_status` | enum `tenant_provisioning_status` (`not_started`, `in_progress`, `provisioned`, `failed`) | Exists from Phase 2 — D1 applies |

## New module: `src/lib/provisioning/`

Pure TypeScript, zero I/O, zero timers, zero network.

- **`constants.ts`** — `PROVISIONING_DOMAIN_VERSION = 1`, max attempts, base/max backoff ms, jitter ratio, step timeouts, canonical step ordering (keyed, not indexed).
- **`types.ts`** — `ProvisioningState`, `ProvisioningJob`, `ProvisioningStep`, `StepResult`, `RetryPolicy`, `RollbackPolicy`, `ProviderResource`, `OrphanedResource`, `MigrationRecord`, `SecretReference`, `HealthCheckResult`. `correlation_id` is required (non-optional) on job, step, and event types. `ProviderCapabilities` is **not** declared here (R2).
- **`lifecycle.ts`** — states `pending → validating → queued → provisioning_infrastructure → running_migrations → seeding → creating_admin → verifying → completed`, plus `failed`, `retrying`, `rolled_back`, `cancelled`. Exports `PROVISIONING_STATES`, `ALLOWED_TRANSITIONS`, `canTransition`, `assertTransition` (throws), `isTerminal`, `isFailure`, `nextState`. Same file shape and doc-header style as the tenant lifecycle.
- **`retry.ts`** — pure: transient vs permanent classification, budget check against attempt count, exponential backoff with jitter (deterministic when a jitter source is injected), `shouldRetry`, **`calculateNextDelayMs`** (R7). No timers.
- **`rollback.ts`** — pure: eligibility by state, reverse-order rollback plan from completed steps, orphan classification. No provider calls.
- **`validators.ts`** — tenant exists / active / not archived / no active job / eligible; slug and tenant-code validity (via `src/lib/tenants/slug.ts`); provider config shape; transition validity. Returns typed `ValidationResult` with error codes; never throws.
- **`provider.ts`** — `ProvisioningProvider` interface only (`createProject`, `applyMigrations`, `seedDatabase`, `createAdministrator`, `verifyHealth`, `destroyProject`) **and the sole `ProviderCapabilities` declaration** (R2). Type-only imports; no implementation.
- **`events.ts`** — `provisioning.*` payload builders (`Started`, `StepChanged`, `Completed`, `Failed`, `RolledBack`, `Cancelled`) on the existing envelope shape, `correlation_id` mandatory (R9).
- **`errors.ts`** — **discriminated union** `ProvisioningError = ValidationError | RetryError | RollbackError | MigrationError | ProviderError | SecretsError | AuthorizationError`, each with a literal `kind` and a type guard, plus an exhaustiveness helper (R8). No class inheritance.
- **`status.ts`** (R1) — canonical status mapping: `deriveTenantProvisioningStatus(jobState)`, `isProvisioned`, `isFailed`, `isRunning`, `summarize`. Mirrored exactly by the DB trigger.
- **`index.ts`** — barrel export.

## Database migration (platform DB only)

- `public.provisioning_jobs` — `id` (uuid PK), `tenant_id` → `public.tenants(id)`, `state` (new enum `provisioning_job_state`), `attempt_count`, **`current_step_key` text** (R3), `correlation_id` (NOT NULL, R9), **`provider_resource_reference` jsonb** (R5), `last_error` jsonb, `started_at`, **`last_transition_at`** (R4), `completed_at`, `created_by`, `updated_by`, `created_at`, `updated_at`.
- `public.provisioning_steps` — `id`, `job_id` → jobs (cascade), `step_key`, `sequence`, `status`, `attempt_count`, `correlation_id` (NOT NULL), `error` jsonb, `started_at`, `completed_at`, **`duration_ms` integer** (R6, set on completion), audit columns.

Per table, in order: `CREATE TABLE` → `GRANT SELECT/INSERT/UPDATE/DELETE TO authenticated` + `GRANT ALL TO service_role` (no `anon`) → `ENABLE ROW LEVEL SECURITY` → policies gated on `private.fn_has_role(auth.uid(), 'admin')` → `fn_set_updated_at` trigger. Indexes on `state`, `tenant_id`, `correlation_id`, plus a partial unique index enforcing at most one non-terminal job per tenant.

**D1 resolution:** `tenants.provisioning_status` becomes derived-only. A `SECURITY DEFINER` trigger on `provisioning_jobs` writes it from job state using the same mapping as `status.ts`, and also maintains `last_transition_at`. No application code writes the column. Documented via `COMMENT ON COLUMN` and in the summary.

## Tests (`src/lib/provisioning/__tests__/`)

Vitest, unit only:
- **Exhaustive state-machine matrix** — every (from, to) pair across all 13 states asserted allowed or rejected; illegal transitions throw.
- Terminal/failure classification for every state.
- Retry classification, budget exhaustion, `calculateNextDelayMs` monotonicity and cap.
- Rollback eligibility and reverse-order plan generation.
- Every validator, success and failure paths.
- `status.ts` mapping covers every job state; helpers agree with the mapping.
- Event builders emit envelope v1 with mandatory `correlation_id`.
- Error union exhaustiveness compiles and every guard is covered.
- Provider interface compile-time conformance via a type-only stub.

## Verification

`bun run build`, `tsgo --noEmit`, `bunx vitest run` (existing 89 tests plus new ones green).

## Repository Integrity Verification (new)

Explicit diff-based checklist in the summary:

✓ `src/lib/tenants/` unchanged ✓ dashboard unchanged ✓ navigation unchanged ✓ routes unchanged ✓ server functions unchanged ✓ auth unchanged ✓ platform foundation unchanged ✓ Phase 2 behavior unchanged (except `provisioning_status` now trigger-derived) ✓ no provider SDK imported ✓ no HTTP client introduced ✓ no queue implementation ✓ no background workers ✓ no new dependencies

## Documentation

`docs/60-engineering/PHASE3_GATE31_ENGINEERING_SUMMARY.md` — files created/modified, reuse matrix, migration summary, ADR-018/ADR-017 compliance, D1 mitigation evidence, repository integrity checklist, **State Machine Coverage Report** (R10: 13 states, allowed transitions, illegal transitions, terminal states, failure states), DoD checklist, known limitations, Gate 3.2 handoff.

## Explicit non-goals

No provider implementation, no Supabase Management API, no server functions, no routes, no dashboard widget, no queues/workers/cron/polling/realtime, no secret store, no infrastructure.

## Stop rule

Stop after verification and publication. Gate 3.2 requires separate authorization.
