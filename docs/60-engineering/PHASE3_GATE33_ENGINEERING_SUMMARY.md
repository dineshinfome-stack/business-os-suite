# Phase 3 — Gate 3.3 Engineering Summary

**Sprint:** SPR-MOD-001-003
**Gate:** 3.3 — Supabase Provider Implementation
**Status:** COMPLETE
**Repository state:** `PHASE3_GATE33_FROZEN`

---

## 1. Objective

Implement the first concrete `ProvisioningProvider` (Supabase) without weakening
the orchestration architecture established in Gates 3.1–3.2.2. The orchestrator
continues to depend only on the `ProvisioningProvider` interface; nothing
vendor-specific leaked upward.

---

## 2. Runtime constraint and its architectural consequence

The platform runs on Cloudflare Workers, which have no raw TCP sockets, so the
`pg` driver cannot be used at runtime. Database work therefore goes through an
injected `SqlExecutor` port, whose default implementation calls the Supabase
Management API SQL endpoint. A `pg`-based executor can replace it in any Node
runtime with **zero changes** to the migration or seed runners.

---

## 3. Modules delivered

| Module | Responsibility |
| --- | --- |
| `types.ts` | Ports and typed models (`SqlExecutor`, `MigrationSource`, `SeedSource`, `SecretResolver`, `AuthAdminApi`, clock, fetch) |
| `errors.ts` | Maps every failure onto the existing `ProvisioningError` union; HTTP status → retry classification |
| `logger.ts` | Platform Logger adapter carrying correlationId / tenantId / projectId / operation |
| `client.ts` | Typed Management API HTTP client with `Retry-After` capture and abort awareness |
| `management-api.ts` | Project, API key, connection and SQL operations returning typed models |
| `sql-executor.ts` | `SqlExecutor` implementation over the Management API SQL endpoint |
| `project.ts` | Idempotent find-or-create plus bounded, abort-aware readiness polling |
| `migration.ts` | Version + checksum migration runner with a ledger table |
| `seed.ts` | Verification-query-driven idempotent seeding |
| `admin.ts` | Auth Admin API administrator creation (adopt-if-exists) |
| `health.ts` | Status + SQL probe + migration ledger verification |
| `destroy.ts` | Verified deletion with orphan reporting |
| `provider.ts` | `ProvisioningProvider` assembly |
| `factory.ts` | Composition root — the only module that supplies defaults |

---

## 4. Invariants enforced

1. **Stateless provider.** No cached project status, no progress memoisation.
   All state lives in `provisioning_jobs` / `provisioning_steps`.
2. **Per-request credentials.** `SecretResolver` runs on every call, so
   multi-tenant credentials and rotation require no re-wiring. Tokens, database
   passwords and service role keys are never logged.
3. **No filesystem at runtime.** Migration and seed scripts arrive through
   injected sources.
4. **Abort awareness.** Every polling loop, SQL batch and HTTP request honours
   the injected `AbortSignal`; cancellation is a permanent error, not a retry.
5. **Typed errors only.** No raw HTTP error or JSON payload escapes the
   provider. 401/403 permanent; 408/429/5xx and network failures transient;
   `Retry-After` is captured and surfaced.
6. **Migration identity = version + checksum.** Same checksum → skip; same
   version with a different checksum → hard drift failure, never a silent
   re-apply.
7. **Verified destroy.** Deletion is re-read and confirmed; a surviving project
   is reported as an orphan.
8. **SQL executor boundary.** The executor runs statements only — no ordering,
   no checksums, no bookkeeping.

---

## 5. Capability flags (additive)

`ProviderCapabilities` gained three optional flags so existing providers stay
valid: `supportsRollback`, `supportsSqlExecution`, `supportsAdminCreation`. The
Supabase provider sets all three.

---

## 6. Verification

- 29 new deterministic tests (fake fetch, fake clock, fake SQL — no network,
  no timers).
- Full suite: **308 tests passing**, typecheck clean.
- Coverage includes: error classification, Retry-After capture, cancellation at
  each stage, project adoption, readiness polling and timeout, INIT_FAILED,
  checksum drift, seed idempotency, administrator adoption, health degradation
  and orphan reporting.
