# Phase 3 — Gate 3.3: Supabase Provider Implementation

Add the first concrete `ProvisioningProvider` under `src/lib/provisioning/providers/supabase/`. The orchestrator, integration layer, and application service are **not** modified.

## Runtime-driven design decisions

The app runs on a Cloudflare Worker runtime, where raw Postgres TCP drivers (`pg`) are unusable. Therefore:

- **SqlExecutor port** — all SQL (migrations, seed, verification) goes through an injected `SqlExecutor`. The default implementation uses the Supabase Management API SQL endpoint (`POST /v1/projects/{ref}/database/query`). A `pg`/Neon/RDS-proxy executor can be swapped in later without touching provider logic.
  - **Boundary:** the executor only executes SQL statements handed to it and returns typed rows or a typed error. It contains no sequencing, no ordering, no checksum handling, and no business logic — those live in the migration/seed runners.
- **MigrationSource port** — no filesystem reads. The provider receives ordered `{ version, name, sql, checksum }` records and returns the existing domain `MigrationRecord` shape.
- **SecretResolver port** — resolves credentials **per provisioning request** (not a global/singleton), so multi-tenant credentials and rotation work without re-wiring.
- Tenant administrator creation uses the new project's **Auth Admin API**, not SQL against `auth.users`.

## Provider invariants

- **The provider is stateless.** It caches no project status and no execution progress; every method is a pure operation over injected inputs. All provisioning state lives in the orchestrator.
- Credentials, clock, `fetch`, `AbortSignal`, and logger are injected via `ProviderDeps`. No `process.env`, no globals, no hardcoded tokens.
- Every log line goes through the platform logger with `correlationId`, `tenantId`, `projectId`, `operation`. No `console.log`.
- No raw HTTP or JSON leaves the provider; all failures become typed provider errors carrying `retryable`.

## Provider capabilities

Extend the existing `ProviderCapabilities` with explicit feature flags so future providers with narrower support plug in unchanged:

```
key: "supabase"
supportsMigrations, supportsSeeding, supportsDestroy, supportsHealthCheck   (existing)
supportsRollback, supportsSqlExecution, supportsAdminCreation               (added)
regions
```

Adding optional fields keeps the existing interface backward-compatible.

## Behavioural contracts to make explicit

- **Duplicate project creation.** `createProject()` first looks up an existing project for the request's slug/correlation tag. If one exists and is owned by the same tenant, it returns that project's typed `ProjectInfo` (idempotent success) rather than creating a second one; if a name collision exists under a different tenant tag it fails with a typed non-retryable `ProjectCreationError`. It never makes an orchestration decision.
- **Polling cancellation.** `waitUntilReady()` accepts the injected `AbortSignal`. When the signal aborts mid-poll it returns a typed cancellation result immediately, aborting the in-flight request instead of waiting for the current backoff cycle to elapse. Timeout still produces a distinct typed `ProjectTimeoutError`.
- **Rate limiting.** The HTTP client honours `Retry-After` when present and otherwise defers to the existing retry policy.

## Files to create

```
src/lib/provisioning/providers/supabase/
  types.ts            config, ProjectInfo, DatabaseConnection, SqlExecutor,
                      MigrationSource, SecretResolver, ProviderDeps
  errors.ts           Authentication/ProjectCreation/ProjectTimeout/Cancellation/
                      Migration/Seed/Health/Rollback errors, each mapped onto the
                      existing ProvisioningError union
  client.ts           typed HTTP client: injected credentials + fetch + signal,
                      status classification (401/403 non-retryable; 429/5xx/network
                      retryable), Retry-After support
  management-api.ts   createProject, getProject, listProjects, deleteProject,
                      getConnectionConfig, runQuery
  project.ts          createProject() (idempotent lookup-then-create) +
                      waitUntilReady() (bounded polling, backoff reused from
                      ../../retry.ts, abort-aware)
  database.ts         getDatabaseConnection() → { host, port, database, username,
                      password, sslMode }
  migration.ts        applyMigrations(): ordered, stop-on-first-failure; applied
                      identity is version + checksum together, so a changed body
                      under the same version surfaces a MigrationError instead of
                      silently skipping
  seed.ts             seedDatabase(): baseline seed, verifies required records,
                      idempotent
  admin.ts            createAdministrator(): Auth Admin user create + role rows,
                      verifies success, returns { userId }
  health.ts           verifyHealth(): project reachable, `SELECT 1` through the
                      configured SqlExecutor, migrations complete, seed verified,
                      administrator exists → domain HealthCheckResult
  rollback.ts         destroyProject(): delete, verify deletion, classify orphans
  provider.ts         createSupabaseProvider(deps) implementing ProvisioningProvider
                      with the capability flags above
  index.ts            public exports
```

Also updated: `src/lib/provisioning/provider.ts` — additive optional capability flags only.

## Implementation order

Types & errors → HTTP client → Management API → project lifecycle → database connection → SqlExecutor integration → migration runner → seed runner → administrator → health → rollback → provider assembly → integration tests.

## Tests

`providers/supabase/__tests__/` with a scripted mock fetch, mock SQL executor, and deterministic clock:

- authentication and error classification (retryable vs non-retryable, Retry-After handling)
- project creation; duplicate-request idempotency and cross-tenant collision failure
- readiness polling success; readiness timeout; cancellation mid-poll returns immediately
- database connection retrieval
- migration ordering; failure stops the run; idempotent re-run; same-version-different-checksum rejection
- seed success and idempotency
- administrator creation and verification
- health verification including the `SELECT 1` path, plus partial-failure cases
- rollback: delete, verified deletion, orphan classification
- capability flags reported accurately
- `boundaries.test.ts` mirroring existing guards: no orchestrator/integration/repository/app-client imports, no env reads, no console, no module-level mutable state, SqlExecutor implementations free of sequencing logic

Integration tests wire the provider into the existing `createProvisioningService` factory with mocked API responses: successful provisioning path, rollback path, timeout path, cancellation path, duplicate provisioning request — confirming orchestrator and service behaviour is unchanged.

## Verification

Typecheck, production build, full Vitest suite (existing 279 stay green), all boundary guards, provider tests, integration tests.

## Deliverable

Concise completion summary in chat only: files created/modified, provider capabilities, tests added, total repository test count, boundary guard status, known limitations, Gate 3.4 readiness. No engineering report documents. Then stop.

**Known limitations to record:** SQL runs over the Management API query endpoint rather than a pooled Postgres connection; migration/seed SQL is injected, not authored here; verification is entirely mock-based with no real cloud calls.
